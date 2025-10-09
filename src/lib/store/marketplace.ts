"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { deleteFromCloudinary, uploadToCloudinary } from "../cloudinary_utils";
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
    // Fetch product's bookmark count and seller's userId
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        bookmarks: true,
        seller: { select: { userId: true } },
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const ownerId = product.seller?.userId;
    if (ownerId === sessionUserId) {
      // <-- requirement: throw if the user is the owner
      throw new Error("You cannot bookmark your own listing");
    }

    // Fetch user's bookmarkedProducts (default to [] if null)
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { bookmarkedProducts: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const bookmarkedProducts = user.bookmarkedProducts ?? [];
    const isBookmarked = bookmarkedProducts.includes(id);

    if (isBookmarked) {
      // Remove bookmark (filter array) and decrement product bookmarks (but never below 0)
      const newUserBookmarks = bookmarkedProducts.filter((pid) => pid !== id);
      const newCount = Math.max(0, (product.bookmarks ?? 0) - 1);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: sessionUserId },
          data: {
            // replace the array with the new filtered array
            bookmarkedProducts: { set: newUserBookmarks },
          },
        }),
        prisma.product.update({
          where: { id },
          data: { bookmarks: { set: newCount } },
        }),
      ]);
    } else {
      // Add bookmark and increment product bookmarks
      await prisma.$transaction([
        prisma.user.update({
          where: { id: sessionUserId },
          data: {
            bookmarkedProducts: { push: id },
          },
        }),
        prisma.product.update({
          where: { id },
          data: { bookmarks: { increment: 1 } },
        }),
      ]);
    }
  } catch (err) {
    console.error("Error toggling bookmark:", err);
    throw err;
  }
}

export async function increaseViews(id: string): Promise<boolean> {
  try {
    const session = await auth();
    const sessionUserId = session?.user?.id;
    if (!sessionUserId) {
      throw new Error("Unauthorized");
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: sessionUserId },
    });

    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.sellerId === sellerProfile?.id) {
      return false;
    }

    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
