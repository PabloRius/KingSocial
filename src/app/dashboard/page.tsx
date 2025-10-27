"use client";

import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/context/session-context";
import { ArrowRight, ShoppingBag, Users, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { session } = useSession();

  if (!session?.profile) redirect("/");

  const featuredModules = [
    {
      id: "marketplace",
      title: "Marketplace",
      description:
        "Buy and sell items with fellow students. Discover great deals on electronics, textbooks, and more.",
      icon: ShoppingBag,
      gradient: "from-blue-500 to-cyan-500",
      href: "/dashboard/marketplace",
      stats: "2.3k+ items",
    },
    {
      id: "communities",
      title: "Communities",
      description:
        "Join communities, attend events, and connect with people who share your interests.",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      href: "/dashboard/communities",
      stats: "156 communities",
    },
  ];

  const quickActions = [
    {
      id: "sell",
      title: "Sell Something",
      description: "List an item on marketplace",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/dashboard/marketplace/sell",
    },
    {
      id: "create-community",
      title: "Create Community",
      description: "Start your own community",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/dashboard/communities/create",
    },
  ];

  return (
    <>
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-6">
          {/* Featured Modules */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Explore Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.id} href={module.href}>
                    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 overflow-hidden p-0">
                      <div
                        className={`h-2 bg-gradient-to-r ${module.gradient}`}
                      />
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${module.gradient} text-white group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {module.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {module.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {module.stats}
                          </span>
                          <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.id} href={action.href}>
                    <Card className="group hover:shadow-lg transition-all cursor-pointer border-gray-200">
                      <CardContent className="p-4">
                        <div
                          className={`${action.bg} ${action.color} p-3 rounded-lg mb-3 inline-block`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {action.title}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
