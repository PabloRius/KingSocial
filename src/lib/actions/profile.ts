"use server";

import { auth } from "@/auth";
import prisma from "@/prisma";
import { userSelect } from "@/types/types";

export const getProfileImage = async () => {
  const session = await auth();
  return session?.user?.image || undefined;
};

export const GetProfile = async (id: string) => {
  const profile = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
  return profile;
};
