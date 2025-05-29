"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const routeMap: Record<string, { label: string; href: string }> = {
  "/dashboard/marketplace": { label: "Dashboard", href: "/dashboard" },
  "/dashboard/marketplace/sell": {
    label: "Marketplace",
    href: "/dashboard/marketplace",
  },
  "/dashboard/marketplace/select-plan": {
    label: "Marketplace",
    href: "/dashboard/marketplace",
  },
};

export function FloatingBackButton() {
  const pathname = usePathname();
  const router = useRouter();

  const currentRoute = routeMap[pathname];
  if (!currentRoute) return null;

  const handleBack = () => {
    router.push(currentRoute.href);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        onClick={handleBack}
        className="h-12 px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 rounded-full group"
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-medium">Back to {currentRoute.label}</span>
      </Button>
    </div>
  );
}
