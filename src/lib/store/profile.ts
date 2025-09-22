"use server";

import { User, userSelect } from "@/lib/models/User";
import prisma from "@/prisma";

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

export async function getProfileByUsername(
  username: string
): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: userSelect,
    });
    return user;
  } catch (error) {
    console.error("Error fetching user for username: ", username, error);
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
  } catch (error) {
    console.error("Error deleting user for id: ", id, error);
    throw error;
  }
}
