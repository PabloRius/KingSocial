import { Prisma } from "@prisma/client";
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
});

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;
