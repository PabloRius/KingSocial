import { Prisma } from "@prisma/client";
import { z } from "zod";
import { userSelect } from "./User";

export const communityMemberSelect =
  Prisma.validator<Prisma.CommunityMemberSelect>()({
    id: true,
    role: true,
    user: { select: userSelect },
    joinedAt: true,
    userId: true,
  });

export const communitySelect = Prisma.validator<Prisma.CommunitySelect>()({
  id: true,
  name: true,
  description: true,
  coverImage: true,
  members: { select: communityMemberSelect },
  createdAt: true,
});

export type Community = Prisma.CommunityGetPayload<{
  select: typeof communitySelect;
}>;

export type CommunityCreatePayload = {
  name: string;
  description: string;
  coverImage: string;
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
    .max(300, "Description must be less than 500 characters")
    .trim(),
  coverImage: z
    .string({ required_error: "Cover image is required" })
    .nonempty("Cover image is required"),
});
