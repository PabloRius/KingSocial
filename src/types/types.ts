import { Prisma } from "@prisma/client";

export const userSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  username: true,
});

export type User = Prisma.UserGetPayload<{ select: typeof userSelect }>;

export type Product = {
  id: number;
  title: string;
  price: number;
  condition: Condition;
  location?: string;
  seller: User;
  saved: boolean;
  featured: boolean;
  image?: string;
  category: Category;
  tags: Array<string>;
};

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

export const conditions = ["Any", "New", "Like New", "Good", "Fair", "Poor"];
export type Condition = (typeof conditions)[number];
