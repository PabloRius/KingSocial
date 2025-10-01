"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import {
  Chat,
  chatSelect,
  Message,
  MessageCreatePayload,
  PartialMessageCreatePayload,
} from "../models/Chat";

export async function createChat(participants: string[]): Promise<Chat | null> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || !participants.includes(sessionUserId)) {
    throw new Error("Unauthorized");
  }

  try {
    const newChat = await prisma.chat.create({ data: {} });
    if (!newChat) {
      throw new Error("Error creating the chat");
    }
    participants.forEach(async (participant) => {
      // Check the other user's config for being added to new groups
      await prisma.chatParticipant.create({
        data: {
          chat: { connect: { id: newChat.id } },
          user: { connect: { id: participant } },
        },
      });
    });
    const updatedNewChat = await prisma.chat.findUnique({
      where: { id: newChat.id },
      select: chatSelect,
    });
    return updatedNewChat;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getChatsFromUserId(id: string): Promise<Array<Chat>> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || sessionUserId !== id) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { chats: { select: { chat: { select: chatSelect } } } },
    });
    if (!user) throw new Error("Unauthorized");
    const { chats } = user;
    const flattenedChats = chats.map((chat) => chat.chat);
    return flattenedChats;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function sendMessage(
  message: MessageCreatePayload
): Promise<Message | null> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || sessionUserId !== message.senderId) {
    throw new Error("Unauthorized");
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        content: message.content,
        sender: { connect: { id: message.senderId } },
        chat: { connect: { id: message.chatId } },
      },
    });
    return newMessage;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function sendMessageWithFallback(
  message: PartialMessageCreatePayload
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || sessionUserId !== message.senderId) {
    throw new Error("Unauthorized");
  }

  try {
    let chatId = message.chatId;

    if (!chatId && message.receiverId) {
      // Look for an existing 1-to-1 chat
      const existingChat = await prisma.chat.findFirst({
        where: {
          participants: {
            every: {
              OR: [{ userId: sessionUserId }, { userId: message.receiverId }],
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingChat && existingChat.participants.length === 2) {
        chatId = existingChat.id;
      } else {
        const newChat = await prisma.chat.create({
          data: {
            participants: {
              create: [
                { userId: sessionUserId },
                { userId: message.receiverId },
              ],
            },
          },
        });
        chatId = newChat.id;
      }
    }
    await prisma.message.create({
      data: {
        content: message.content,
        sender: { connect: { id: message.senderId } },
        chat: { connect: { id: chatId } },
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
