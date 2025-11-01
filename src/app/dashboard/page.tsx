"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/context/session-context";
import { getCommunitiesCount } from "@/lib/store/community";
import { getMarketplaceCount } from "@/lib/store/marketplace";
import {
  ArrowRight,
  Calendar,
  Globe,
  Loader2,
  MapPin,
  ShoppingBag,
  Star,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

function formatCount(count: number | null, tag: string, tagPlural?: string) {
  if (count === null) return null;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k+ items`;
  return `${count} ${count !== 1 ? tagPlural || tag + "s" : tag}`;
}

export default function DashboardPage() {
  const { session } = useSession();
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);
  const [communitiesCount, setCommunitiesCount] = useState<number | null>(null);

  if (!session?.profile) redirect("/");

  useEffect(() => {
    const fetchMarketplaceCount = async () => {
      try {
        const res = await getMarketplaceCount();
        setMarketplaceCount(res);
      } catch (error) {
        console.error(error);
        setMarketplaceCount(null);
      }
    };
    const fetchCommunitiesCount = async () => {
      try {
        const res = await getCommunitiesCount();
        setCommunitiesCount(res);
      } catch (error) {
        console.error(error);
        setCommunitiesCount(null);
      }
    };
    fetchMarketplaceCount();
    fetchCommunitiesCount();
  }, []);

  const featuredModules = [
    {
      id: "marketplace",
      title: "Marketplace",
      description:
        "Buy and sell items with fellow students. Discover great deals on electronics, textbooks, and more.",
      icon: ShoppingBag,
      gradient: "from-blue-500 to-cyan-500",
      href: "/dashboard/marketplace",
      stats: formatCount(marketplaceCount, "item"),
    },
    {
      id: "communities",
      title: "Communities",
      description:
        "Join communities, attend events, and connect with people who share your interests.",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      href: "/dashboard/communities",
      stats: formatCount(communitiesCount, "community", "communities"),
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
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Center Content - Now takes more space */}
          <div className="lg:col-span-8">
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
                      <Card className="group hover:shadow-xl gap-2 py-0 flex-1 h-full transition-all duration-300 cursor-pointer border-gray-200 overflow-hidden">
                        <div
                          className={`h-2 bg-gradient-to-r ${module.gradient}`}
                        />
                        <CardContent className="flex flex-1 flex-col p-6">
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
                          <p className="text-gray-600 text-sm mb-4 flex-1 w-full">
                            {module.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {module.stats || (
                                <Loader2 className="animate-spin" />
                              )}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  Active Communities
                </h3>
                <Link href="/community">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* {activeCommunities.map((community) => (
                  <Link key={community.id} href={`/community/${community.id}`}>
                    <Card className="group hover:shadow-lg transition-all cursor-pointer border-gray-200 overflow-hidden">
                      <div className="h-32 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                        <img
                          src={community.image || "/placeholder.svg"}
                          alt={community.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate flex-1">{community.name}</h4>
                          {community.isNew && (
                            <Badge variant="secondary" className="bg-purple-50 text-purple-600 text-xs ml-2">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {community.members.toLocaleString()} members
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {community.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))} */}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Upcoming Events */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Tech Meetup
                        </h4>
                        <p className="text-sm text-gray-500">Mar 15</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Virtual
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Art Exhibition
                        </h4>
                        <p className="text-sm text-gray-500">Mar 20</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Downtown Gallery
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/community">
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                    >
                      View All Events
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Suggested Communities */}
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    Suggested Communities
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Tech Innovators
                          </p>
                          <p className="text-xs text-gray-500">1.2k members</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Join
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Book Club
                          </p>
                          <p className="text-xs text-gray-500">623 members</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Join
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            Fitness Group
                          </p>
                          <p className="text-xs text-gray-500">892 members</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Join
                      </Button>
                    </div>
                  </div>
                  <Link href="/community">
                    <Button
                      variant="outline"
                      className="w-full mt-4 border-purple-200 text-purple-600 hover:bg-purple-50 bg-transparent"
                    >
                      Explore More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
