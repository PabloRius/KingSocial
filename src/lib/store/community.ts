"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import {
  Community,
  CommunityCreatePayload,
  CommunityMessage,
  communityMessageSelect,
  communitySelect,
} from "../models/Community";

export async function createCommunity(
  newCommunityData: CommunityCreatePayload,
  creatorId: string
): Promise<Community | null> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId || sessionUserId != creatorId) {
      throw new Error("Unauthorized");
    }
    const newCommunity = await prisma.community.create({
      data: {
        ...newCommunityData,
        members: {
          create: [{ user: { connect: { id: creatorId } }, role: "admin" }],
        },
      },
      select: communitySelect,
    });
    return newCommunity || null;
  } catch (error) {
    console.error("Error creating community:", error);
    return null;
  }
}

export async function getCommunities(
  query?: string
): Promise<Community[] | null> {
  try {
    const communities = await prisma.community.findMany({
      where: query
        ? {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      orderBy: {
        name: "asc",
      },
      select: communitySelect,
    });
    return communities || null;
  } catch (error) {
    console.error("Error fetching communities:", error);
    return null;
  }
}

export async function getCommunityById(id: string): Promise<Community | null> {
  try {
    const community = await prisma.community.findUnique({
      where: { id },
      select: communitySelect,
    });
    return community;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function sendMessage(
  content: string,
  communityId: string,
  senderId: string
): Promise<CommunityMessage | null> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) {
      throw new Error("Unauthorized");
    }
    const userData = await prisma.communityMember.findUnique({
      where: { id: senderId },
      select: { user: { select: { id: true } } },
    });
    if (sessionUserId !== userData?.user.id) {
      throw new Error("Unauthorized");
    }
    const newMessage = await prisma.communityMessage.create({
      data: {
        content: content,
        community: { connect: { id: communityId } },
        sender: { connect: { id: senderId } },
      },
      select: communityMessageSelect,
    });
    return newMessage || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
