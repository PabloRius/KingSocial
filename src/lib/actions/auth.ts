"use server";

import { signIn } from "@/auth";

export const login = async () => {
  await signIn("google", { redirectTo: "/" });
};
