"use client";

import { MarketplaceClient } from "@/components/marketplace-client";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const { session } = useSession();
  const { profile } = session!;
  const { sellerProfile } = profile;
  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace 🛍️</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find, buy, sell, and trade with other students
          </p>
        </div>
        <Button className="cursor-pointer bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all">
          <ShoppingBag className="mr-2 h-4 w-4" />
          {sellerProfile ? (
            "Sell Something"
          ) : (
            <Link href="select-plan">Start Selling</Link>
          )}
        </Button>
      </div>

      <MarketplaceClient />
    </main>
  );
}
