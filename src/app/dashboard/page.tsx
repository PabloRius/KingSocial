"use server";

import { auth } from "@/auth";
import { DashboardCards } from "@/components/dashboard-cards";
import { DashboardFeatured } from "@/components/dashboard-featured";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";

import { Zap } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return;
  const { username } = session.user;
  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}
