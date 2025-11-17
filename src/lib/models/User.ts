import { Prisma } from "@prisma/client";
import { communityMemberSelect } from "./Community";
import { eventParticipantSelect } from "./Event";
import { productSelect } from "./Product";

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  biography: true,
  instagram: true,
  linkedin: true,
  image: true,
  coverImage: true,
  sellerProfile: { include: { products: { select: productSelect } } },
  createdAt: true,
  bookmarkedProducts: true,
  communities: { select: communityMemberSelect },
  events_attendee: { select: eventParticipantSelect },
});

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export type UserUpdatePayload = {
  name?: string;
  biography?: string;
  instagram?: string;
  linkedin?: string;
};
