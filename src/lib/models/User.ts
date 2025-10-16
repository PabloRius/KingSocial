import { Prisma } from "@prisma/client";
import { eventParticipantSelect } from "./Event";
import { productSelect } from "./Product";

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  username: true,
  biography: true,
  instagram: true,
  linkedin: true,
  image: true,
  coverImage: true,
  sellerProfile: { include: { products: { select: productSelect } } },
  createdAt: true,
  bookmarkedProducts: true,
  communities: {
    select: {
      community: {
        select: {
          id: true,
          name: true,
          description: true,
          coverImage: true,
          _count: { select: { members: true } },
        },
      },
      role: true,
      joinedAt: true,
      id: true,
    },
  },
  events_attendee: { select: eventParticipantSelect },
});

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;
