"use client";

import { DashboardCards } from "@/components/dashboard-cards";
import { useSession } from "@/context/session-context";

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
      </div>

      <DashboardCards />
    </main>
  );
}
