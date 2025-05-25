"use server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export async function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return children;
}
