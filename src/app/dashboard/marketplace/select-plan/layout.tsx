"use client";

import { useSession } from "@/context/session-context";
import { redirect } from "next/navigation";
import React from "react";

export default function SelectPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();

  const {
    profile: { sellerProfile },
  } = session!;
  if (sellerProfile) {
    redirect("/dashboard/marketplace");
  } else {
    return children;
  }
}
