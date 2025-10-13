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
          create: [{ member: { connect: { id: member.id } }, role: "admin" }],
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
