import { Prisma } from "@prisma/client";
import { Category } from "./Category";
import { Condition } from "./Condition";

export const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  seller: { select: { user: true } },
  category: true,
  condition: true,
  description: true,
  photos: true,
  price: true,
  tags: true,
  pickupLocation: true,
  status: true,
  views: true,
  createdAt: true,
  bookmarks: true,
  soldAt: true,
  references: true,
});

export type Product = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export interface UpdateProduct {
  name?: string;
  description?: string;
  price?: number;
  pickupLocation?: string;
  condition?: string;
  category?: string;
  tags?: string[];
  photos?: string[];
}

export type ProductCreatePayload = {
  name: string;
  category: Category;
  condition: Condition;
  description: string;
  price: number;
  tags: Array<string>;
  pickupLocation: string;
  photos: File[];
};
