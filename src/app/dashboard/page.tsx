"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { DashboardFeatured } from "@/components/dashboard-featured";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";

import { Zap } from "lucide-react";

export default function DashboardPage() {
  const { session } = useSession();
  if (!session?.profile) return;
  const { username } = session.profile;
  return (
    <main className="flex-1 p-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hey {username}! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {"What's your vibe today?"}
          </p>
        </div>
        <Button className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all">
          <Zap className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      <DashboardCards />
      <DashboardFeatured />
    </main>
  );
}
