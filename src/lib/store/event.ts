"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { Event, EventCreatePayload, eventSelect } from "../models/Event";

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
    return newEvent || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getEvents(): Promise<Event[] | null> {
  try {
    const events = prisma.event.findMany({
      where: { public: true },
      select: eventSelect,
    });
    return events || null;
  } catch (err) {
    console.error(err);
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
        communityId: true,
        participants: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!eventData) throw new Error("Event not found");

    const alreadyParticipant = eventData.participants.some(
      (p) => p.userId === sessionUserId
    );
    if (alreadyParticipant) {
      console.warn("User already joined this event");
      return true;
    }

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

    return true;
  } catch (err) {
    console.error("❌ Error joining event:", err);
    return false;
  }
}
