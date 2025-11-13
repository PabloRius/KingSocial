"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { deleteFromCloudinary } from "../cloudinary_utils";
import {
  Community,
  CommunityCreatePayload,
  CommunityMessage,
  communityMessageSelect,
  communitySelect,
} from "../models/Community";
import { addEmbeddingToUser, generateCommunityEmbedding } from "../openai";

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

export async function joinCommunity(communityId: string): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized");

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        mode: true,
        members: { select: { userId: true } },
        embedding: true,
      },
    });

    if (!community) throw new Error("Community not found");

    const isMember = community.members.some((m) => m.userId === sessionUserId);
    if (isMember) return true;

    if (community.mode !== "public") {
      throw new Error("Cannot directly join a private community");
    }

    await prisma.communityMember.create({
      data: {
        user: { connect: { id: sessionUserId } },
        community: { connect: { id: communityId } },
        role: "member",
      },
    });

    let communityEmbedding = community.embedding;
    if (!communityEmbedding || !Array.isArray(communityEmbedding)) {
      communityEmbedding = await generateCommunityEmbedding(communityId);
    }

    if (communityEmbedding && Array.isArray(communityEmbedding)) {
      await addEmbeddingToUser(sessionUserId, communityEmbedding as number[]);
    }

    return true;
  } catch (error) {
    console.error("Error joining community:", error);
    return false;
  }
}

export async function hasRequested(
  userId: string,
  communityId: string
): Promise<boolean> {
  const request = await prisma.communityJoinRequest.findFirst({
    where: { userId, communityId },
  });
  if (request) return true;
  return false;
}

export async function sendJoinRequest(
  communityId: string,
  message?: string
): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized");

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true, mode: true, embedding: true },
    });

    if (!community) throw new Error("Community not found");
    if (community.mode !== "private") {
      throw new Error("Join requests only apply to private communities");
    }

    const existingMember = await prisma.communityMember.findFirst({
      where: { userId: sessionUserId, communityId },
    });
    if (existingMember) throw new Error("Already a member");

    const existingRequest = await prisma.communityJoinRequest.findFirst({
      where: { userId: sessionUserId, communityId },
    });
    if (existingRequest) throw new Error("Join request already sent");

    await prisma.communityJoinRequest.create({
      data: {
        message: message || "",
        user: { connect: { id: sessionUserId } },
        community: { connect: { id: communityId } },
      },
    });

    let communityEmbedding = community.embedding;
    if (!communityEmbedding || !Array.isArray(communityEmbedding)) {
      communityEmbedding = await generateCommunityEmbedding(community.id);
    }

    if (communityEmbedding && Array.isArray(communityEmbedding)) {
      await addEmbeddingToUser(sessionUserId, communityEmbedding as number[]);
    }

    return true;
  } catch (error) {
    console.error("Error sending join request:", error);
    return false;
  }
}

export async function approveJoinRequest(id: string): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized");
    const request = await prisma.communityJoinRequest.findUnique({
      where: { id },
      select: {
        community: { select: { id: true, members: true } },
        userId: true,
      },
    });
    if (!request) throw new Error("Invalid request");
    const { community } = request;
    const { members } = community;
    const canManageCommunity = members.some(
      (mem) =>
        mem.userId === sessionUserId &&
        (mem.role === "admin" || mem.role === "moderator")
    );
    if (!canManageCommunity) throw new Error("Unauthorized");
    await prisma.communityMember.create({
      data: {
        user: { connect: { id: request.userId } },
        community: { connect: { id: community.id } },
      },
    });
    await prisma.communityJoinRequest.delete({ where: { id } });
    return true;
  } catch (err) {
    console.error(err);
    return false;
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

export async function getCommunitiesCount(): Promise<number | null> {
  try {
    const count = await prisma.product.count();
    return count;
  } catch (error) {
    console.error(error);
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

export async function deleteCommunityById(id: string): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized");

    const community = await prisma.community.findUnique({
      where: { id },
      select: {
        id: true,
        coverImage: true,
        members: {
          select: { role: true, userId: true },
        },
      },
    });

    if (!community) throw new Error("Invalid community ID");

    const loggedMember = community.members.find(
      (m) => m.userId === sessionUserId
    );

    if (!loggedMember || loggedMember.role !== "admin") {
      throw new Error("You must be an admin to delete this community");
    }

    if (community.coverImage) {
      try {
        await deleteFromCloudinary(community.coverImage, "communities");
      } catch (err) {
        console.warn("Failed to delete image from Cloudinary:", err);
      }
    }

    await prisma.community.delete({
      where: { id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting community:", error);
    return false;
  }
}

export async function getUserCommunities(
  userId: string
): Promise<Array<Community> | null> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized");

    const communities = await prisma.community.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      select: communitySelect,
    });

    return communities;
  } catch (error) {
    console.error(error);
    return null;
  }
}
