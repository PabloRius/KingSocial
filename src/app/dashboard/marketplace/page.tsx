"use server";

import { MarketplaceClient } from "@/components/marketplace-client";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default async function MarketplacePage() {
  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace 🛍️</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find, buy, sell, and trade with other students
          </p>
        </div>
        <Button className="cursor-pointer bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-xl shadow-md hover:shadow-xl transition-all">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Sell Something
        </Button>
      </div>

      <MarketplaceClient />
    </main>
  );
}
