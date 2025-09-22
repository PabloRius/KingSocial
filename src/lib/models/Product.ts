import { Prisma } from "@prisma/client";

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
  status: true,
  views: true,
  createdAt: true,
  likes: true,
  soldAt: true,
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
