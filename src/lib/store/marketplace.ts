"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { Product, productSelect } from "@/types/types";

export async function getListingsByUserId(userId: string): Promise<Product[]> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId || sessionUserId !== userId) {
    throw new Error("Unauthorized");
  }
  try {
    const listings = await prisma.product.findMany({
      where: { seller: { userId } },
      select: productSelect,
    });

    return listings;
  } catch (error) {
    console.error("Error fetching listings for id: ", userId, error);
    return [];
  }
}
