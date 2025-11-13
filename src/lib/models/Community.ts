import { Prisma } from "@prisma/client";
import { z } from "zod";
import { eventSelect } from "./Event";

export const communityMessageSelect =
  Prisma.validator<Prisma.CommunityMessageSelect>()({
    id: true,
    content: true,
    createdAt: true,
    sender: {
      select: {
        role: true,
        user: { select: { username: true, name: true, image: true } },
      },
    },
    senderId: true,
  });
export type CommunityMessage = Prisma.CommunityMessageGetPayload<{
  select: typeof communityMessageSelect;
}>;

export const communityMemberSelect =
  Prisma.validator<Prisma.CommunityMemberSelect>()({
    id: true,
    role: true,
    user: { select: { id: true, image: true, name: true, username: true } },
    community: { select: { id: true } },
    joinedAt: true,
    userId: true,
  });

export const communitySelect = Prisma.validator<Prisma.CommunitySelect>()({
  id: true,
  name: true,
  description: true,
  coverImage: true,
  mode: true,
  members: { select: communityMemberSelect },
  _count: { select: { members: true } },
  chat: {
    select: communityMessageSelect,
  },
  events: { select: eventSelect },
  createdAt: true,
  joinRequests: {
    select: {
      id: true,
      message: true,
      createdAt: true,
      user: { select: { id: true, image: true, name: true, username: true } },
    },
  },
});

export type Community = Prisma.CommunityGetPayload<{
  select: typeof communitySelect;
}>;

export type CommunityCreatePayload = {
  name: string;
  description: string;
  coverImage: string;
  mode: string;
};

export const communityCreateValidator = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  coverImage: z
    .string({ required_error: "Cover image is required" })
    .nonempty("Cover image is required"),
  mode: z.enum(["public", "private"], {
    required_error: "You must select a visibility mode",
    invalid_type_error: "Invalid mode, must be public or private",
  }),
});
