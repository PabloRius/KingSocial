"use server";

import { auth, signIn } from "@/auth";
import { User, userSelect, UserUpdatePayload } from "@/lib/models/User";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { deleteFromCloudinary, uploadToCloudinary } from "../cloudinary_utils";
import { removeListingById } from "./marketplace";

export const login = async () => {
  await signIn("google", { redirectTo: "/" });
};

export async function getProfileById(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
    return user;
  } catch (error) {
    console.error("Error fetching user for id: ", id, error);
    return null;
  }
}

export async function updateProfile(
  userId: string,
  newData: UserUpdatePayload,
  newImage?: File,
  newCoverImage?: File
): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true, coverImage: true },
  });

  if (!existingUser) {
    throw new Error("UserId doesn't exist");
  }

  let imageUrl: string | null = null;
  let coverImageUrl: string | null = null;

  if (newImage && newImage instanceof File) {
    if (existingUser?.image) {
      await deleteFromCloudinary(existingUser.image, "profiles/images");
    }
    imageUrl = await uploadToCloudinary(newImage, "profiles/images");
  }

  if (newCoverImage && newCoverImage instanceof File) {
    if (existingUser?.coverImage) {
      await deleteFromCloudinary(existingUser.coverImage, "profiles/covers");
    }
    coverImageUrl = await uploadToCloudinary(newCoverImage, "profiles/covers");
  }

  const updateData: Prisma.UserUpdateInput = {
    ...(newData.name && { name: newData.name }),
    ...(newData.biography && { biography: newData.biography }),
    ...(newData.instagram && { instagram: newData.instagram }),
    ...(newData.linkedin && { linkedin: newData.linkedin }),
    ...(imageUrl && { image: imageUrl }),
    ...(coverImageUrl && { coverImage: coverImageUrl }),
  };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: userSelect,
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

export async function deleteProfileById(id: string) {
  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });
    if (!userToDelete) {
      throw new Error("User not found");
    }
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: id },
    });
    const productsToDelete = await prisma.product.findMany({
      where: {
        sellerId: sellerProfile?.id,
        NOT: {
          status: "sold",
        },
      },
    });
    productsToDelete.forEach((product) => {
      removeListingById(product.id);
    });
    if (userToDelete.image)
      await deleteFromCloudinary(userToDelete.image, "profiles/images");
    if (userToDelete.coverImage)
      await deleteFromCloudinary(userToDelete.coverImage, "profiles/covers");
    await prisma.user.delete({ where: { id } });
  } catch (error) {
    console.error("Error deleting user for id: ", id, error);
    throw error;
  }
}

export async function getSession(): Promise<User | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const profile = await getProfileById(session.user.id);

    if (!profile) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error in /api/session:", error);
    return null;
  }
}
