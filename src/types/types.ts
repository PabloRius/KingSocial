import { DefaultSession } from "next-auth";

export type CustomUser = {
  username: string;
  sellerProfile: { rating: number };
} & DefaultSession["user"];

export type Product = {
  id: number;
  title: string;
  price: number;
  condition: Condition;
  location?: string;
  seller: Pick<CustomUser, "name" | "image" | "sellerProfile">;
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
