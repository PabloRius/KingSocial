import { Prisma } from "@prisma/client";

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  username: true,
  sellerProfile: true,
});

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export const sellerProfileSelect =
  Prisma.validator<Prisma.SellerProfileSelect>()({
    id: true,
    products: true,
    rating: true,
    user: true,
  });

export type SellerProfile = Prisma.SellerProfileGetPayload<{
  select: typeof sellerProfileSelect;
}>;

export const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  seller: { select: { user: true, rating: true } },
  category: true,
  condition: true,
  description: true,
  photos: true,
  price: true,
  tags: true,
  pickupLocation: true,
});

export type Product = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export const categories = [
  "All Categories",
  "Electronics",
  "Books",
  "Clothing",
  "Home",
  "Sports",
  "Tickets",
  "Other",
] as const;
export type Category = (typeof categories)[number];

export const conditions = [
  "Any",
  "New",
  "Like New",
  "Good",
  "Fair",
  "Poor",
] as const;
export type Condition = (typeof conditions)[number];
export const labelledConditions = [
  { label: "New", description: "Brand new, never used" },
  {
    label: "Like New",
    description: "Barely used, excellent condition",
  },
  { label: "Good", description: "Used but well maintained" },
  {
    label: "Fair",
    description: "Shows wear but fully functional",
  },
  { label: "Poor", description: "Heavy wear, may need repairs" },
];
