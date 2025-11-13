"use server";

import { signIn } from "@/auth";
import { User, userSelect } from "@/lib/models/User";
import prisma from "@/prisma";
import { deleteFromCloudinary } from "../cloudinary_utils";
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
