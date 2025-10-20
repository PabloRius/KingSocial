import { Prisma } from "@prisma/client";
import { eventSelect } from "./Event";
import { productSelect } from "./Product";

export const messageSelect = Prisma.validator<Prisma.MessageSelect>()({
  id: true,
  chatId: true,
  content: true,
  senderId: true,
  createdAt: true,
  productRef: { select: productSelect },
  eventRef: { select: eventSelect },
});

export type Message = Prisma.MessageGetPayload<{
  select: typeof messageSelect;
}>;

export type MessageCreatePayload = {
  content: string;
  senderId: string;
  chatId: string;
};

export type PartialMessageCreatePayload = {
  content: string;
  senderId: string;
  chatId?: string;
  receiverId?: string;
  productRefId?: string;
  eventRefId?: string;
};

export const chatSelect = Prisma.validator<Prisma.ChatSelect>()({
  id: true,
  messages: { select: messageSelect },
  participants: {
    select: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  },
});

export type Chat = Prisma.ChatGetPayload<{ select: typeof chatSelect }>;
