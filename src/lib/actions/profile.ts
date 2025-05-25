"use server";

import { auth } from "@/auth";

export const getProfileImage = async () => {
  const session = await auth();
  return session?.user?.image || undefined;
};
