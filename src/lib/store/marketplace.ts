"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "../cloudinary";
import { Product, productSelect, UpdateProduct } from "../models/Product";

export async function getListingById(id: string): Promise<Product | null> {
  try {
    const listing = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });
    return listing;
  } catch (error) {
    console.error("Error fetching listing for id: ", id, error);
    return null;
  }
}

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
  const listingOwnerId = listing?.seller?.userId;
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

export async function modifyListing(
  id: string,
  listing: UpdateProduct,
  newPhotos: File[] | null = null
): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new Error("Unauthorized");
  }

  const storedListing = await prisma.product.findUnique({
    where: { id: id },
    select: { seller: { select: { userId: true } }, photos: true },
  });
  const listingOwnerId = storedListing?.seller?.userId;
  if (listingOwnerId !== sessionUserId) {
    throw new Error("Unauthorized");
  }

  try {
    const removedPhotos =
      storedListing?.photos?.filter(
        (photo) => !listing.photos?.includes(photo)
      ) || [];
    for (const photoUrl of removedPhotos) {
      deleteFromCloudinary(photoUrl, "marketplace");
    }
    const updatedPhotos = listing.photos?.filter(
      (photo) => !photo.startsWith("blob:")
    );
    if (newPhotos && newPhotos.length > 0) {
      for (const photo of newPhotos) {
        const uploadedUrl = await uploadToCloudinary(photo, "marketplace");
        updatedPhotos?.push(uploadedUrl);
      }
    }
    await prisma.product.update({
      data: {
        name: listing.name,
        category: listing.category,
        condition: listing.condition,
        description: listing.description,
        pickupLocation: listing.pickupLocation,
        price: listing.price,
        tags: listing.tags,
        photos: updatedPhotos,
      },
      where: { id: id },
    });
  } catch (error) {
    console.error("Error deleting listing: ", id, error);
  }
}

export async function sellListing(id: string): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new Error("Unauthorized");
  }

  const storedListing = await prisma.product.findUnique({
    where: { id: id },
    select: { seller: { select: { userId: true } }, photos: true },
  });
  const listingOwnerId = storedListing?.seller?.userId;
  if (listingOwnerId !== sessionUserId) {
    throw new Error("Unauthorized");
  }
  try {
    await prisma.product.update({
      where: { id: id },
      data: { status: "sold", soldAt: new Date() },
    });
  } catch (error) {
    console.error("Error marking listing as sold: ", id, error);
  }
}

export async function toggleBookmarkListing(id: string): Promise<void> {
  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { bookmarkedProducts: true },
    });

    if (!user) throw new Error("User not found");

    const isBookmarked = user.bookmarkedProducts.includes(id);

    if (isBookmarked) {
      // Remove bookmark
      await prisma.user.update({
        where: { id: sessionUserId },
        data: {
          bookmarkedProducts: {
            set: user.bookmarkedProducts.filter((prodId) => prodId !== id),
          },
        },
      });
      await prisma.product.update({
        where: { id },
        data: { bookmarks: { decrement: 1 } },
      });
    } else {
      // Add bookmark
      await prisma.user.update({
        where: { id: sessionUserId },
        data: {
          bookmarkedProducts: { push: id },
        },
      });
      await prisma.product.update({
        where: { id },
        data: { bookmarks: { increment: 1 } },
      });
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
  }
}
