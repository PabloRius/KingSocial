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
