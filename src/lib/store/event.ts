"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { Event, EventCreatePayload, eventSelect } from "../models/Event";
import {
  addEmbeddingToUser,
  cosineSimilarity,
  generateEventEmbedding,
  removeEmbeddingFromUser,
} from "../openai";
import { sendMessageWithFallback } from "./chat";
import { getUserCommunities } from "./community";

export async function createEvent(
  event: EventCreatePayload,
  creatorId: string,
  communityId: string
): Promise<Event | null> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId || sessionUserId != creatorId) {
      throw new Error("Unauthorized");
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    });
    if (!community) throw new Error("Community not found");

    const member = await prisma.communityMember.findFirst({
      where: { userId: creatorId, communityId },
      select: { id: true, role: true },
    });

    if (!member || !["admin", "moderator"].includes(member.role)) {
      throw new Error("Insufficient permissions to create an event");
    }

    // Create the event without embedding first
    const newEvent = await prisma.event.create({
      data: {
        ...event,
        community: { connect: { id: communityId } },
        creator: { connect: { id: member.id } },
        participants: {
          create: [{ user: { connect: { id: creatorId } }, role: "admin" }],
        },
      },
      select: eventSelect,
    });

    if (!newEvent) return null;

    // Generate embedding for the new event
    const embedding = await generateEventEmbedding(newEvent.id);

    // Update the event with the embedding
    await prisma.event.update({
      where: { id: newEvent.id },
      data: { embedding },
    });

    // Optionally, add the embedding to the creator's user embedding
    if (embedding) {
      await addEmbeddingToUser(creatorId, embedding);
    }

    return { ...newEvent, embedding };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getEvents(
  onlyPublic: boolean = true
): Promise<Event[] | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const userCommunities = await getUserCommunities(userId);
    const communityIds = (userCommunities || []).map((c) => c.id);

    const joinedEvents = await prisma.eventParticipant.findMany({
      where: { userId },
      select: { eventId: true },
    });
    const joinedEventIds = joinedEvents.map((e) => e.eventId);

    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        id: { notIn: joinedEventIds },
        OR: [
          ...(onlyPublic ? [{ public: true }] : []),
          { communityId: { in: communityIds } },
        ],
      },
      select: eventSelect,
      orderBy: { date: "asc" },
    });

    return events;
  } catch (err) {
    console.error("Error fetching events:", err);
    return null;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const event = prisma.event.findUnique({
      where: { id },
      select: eventSelect,
    });
    return event || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function joinEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId || sessionUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const eventData = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        public: true,
        embedding: true, // include the embedding
        communityId: true,
        participants: { select: { userId: true } },
      },
    });

    if (!eventData) throw new Error("Event not found");

    const alreadyParticipant = eventData.participants.some(
      (p) => p.userId === sessionUserId
    );
    if (alreadyParticipant) return true;

    if (!eventData.public) {
      const communityMember = await prisma.communityMember.findFirst({
        where: {
          userId: sessionUserId,
          communityId: eventData.communityId,
        },
        select: { id: true },
      });
      if (!communityMember) {
        throw new Error(
          "You must be a member of the community to join this event"
        );
      }
    }

    await prisma.eventParticipant.create({
      data: {
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
      },
    });

    // Update user embedding
    if (eventData.embedding) {
      await addEmbeddingToUser(userId, eventData.embedding as number[]);
    }

    return true;
  } catch (err) {
    console.error("❌ Error joining event:", err);
    return false;
  }
}

export async function leaveEvent(
  eventId: string,
  userId: string
): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId || sessionUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const participant = await prisma.eventParticipant.findFirst({
      where: { eventId, userId },
      select: { id: true, event: { select: { embedding: true } } },
    });

    if (!participant) {
      console.warn("User is not part of this event");
      return true; // nothing to do
    }

    await prisma.eventParticipant.delete({ where: { id: participant.id } });

    // Remove event embedding from user
    if (participant.event.embedding) {
      await removeEmbeddingFromUser(
        userId,
        participant.event.embedding as number[]
      );
    }

    return true;
  } catch (err) {
    console.error("❌ Error leaving event:", err);
    return false;
  }
}

export async function messageAttendees(
  content: string,
  eventId: string,
  senderId: string
): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId || sessionUserId !== senderId) {
      throw new Error("Unauthorized");
    }

    const event = await getEventById(eventId);
    if (!event) throw new Error("Error finding event");
    const { participants } = event;
    if (!participants?.length) throw new Error("No participants found");

    const senderParticipant = participants.find((p) => p.user.id === senderId);

    if (!senderParticipant) {
      throw new Error("Sender is not a participant of this event");
    }

    if (!["admin", "moderator"].includes(senderParticipant.role)) {
      throw new Error("Only admins or moderators can send mass messages");
    }

    const recipients = participants.filter(
      (p) => p.user.id !== senderId && p.allowsMassMessages
    );
    if (!recipients.length) {
      console.warn("No recipients allow mass messages.");
      return true;
    }

    await Promise.all(
      recipients.map(async (participant) => {
        try {
          await sendMessageWithFallback({
            content,
            senderId,
            receiverId: participant.user.id,
            eventRefId: eventId,
          });
        } catch (err) {
          console.error(
            `❌ Error sending message to ${participant.user.id}:`,
            err
          );
        }
      })
    );
    return true;
  } catch (err) {
    console.error("❌ Error sending mass message:", err);
    return false;
  }
}

export async function getRecommendedEvents(
  userId: string,
  limit = 5
): Promise<Array<Event>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { embedding: true },
  });
  if (!user?.embedding) return [];
  console.log("AAAAAAAAAAAAA");

  const events = await getEvents();

  if (!events) return [];

  const scored = events
    .filter((e) => e.embedding)
    .map((e) => ({
      ...e,
      score: cosineSimilarity(
        user.embedding as number[],
        e.embedding as number[]
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .slice(0, limit);

  return scored;
}

export async function getUserEvents(
  userId: string
): Promise<Array<Event> | null> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;

    if (!sessionUserId || sessionUserId !== userId) {
      throw new Error("Unauthorized");
    }

    const events = prisma.event.findMany({
      where: { participants: { some: { userId } }, date: { gte: new Date() } },
      select: eventSelect,
    });

    return events || null;
  } catch (err) {
    console.error("❌ Error retrieving user events:", err);
    return null;
  }
}
