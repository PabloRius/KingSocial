"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { Product, productSelect } from "@/types/types";
import { deleteFromCloudinary } from "../cloudinary";

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

export async function removeListingById(listingId: string): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new Error("Unauthorized");
  }

  const listing = await prisma.product.findUnique({
    where: { id: listingId },
    select: { seller: { select: { userId: true } }, photos: true },
  });
  const listingOwnerId = listing?.seller.userId;
  if (listingOwnerId !== sessionUserId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.product.delete({ where: { id: listingId } });
    for (const photoUrl of listing?.photos || []) {
      deleteFromCloudinary(photoUrl, "marketplace");
    }
  } catch (error) {
    console.error("Error deleting listing: ", listingId, error);
  }
}
