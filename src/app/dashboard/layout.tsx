"use client";

import { useSession } from "@/context/session-context";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function Dashboardayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useSession();
  if (loading) {
    return <Loader2 className="flex-1 mx-auto animate-spin" />;
  }

  if (!session?.profile) {
    redirect("/");
  }

  return children;
}
