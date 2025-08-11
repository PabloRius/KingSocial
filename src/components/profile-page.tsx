"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/types";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GoogleAvatar } from "./google-avatar";
import { MarketPlaceProductCard } from "./marketplace/marketplace-product-card";

export default function ProfilePage({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("listings");
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile/" + id);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Loader2 className="flex-1 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The user profile you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Button asChild>
              <Link href="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6">
      <main className="flex-1 container mx-auto py-6">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-celestial-blue-400 to-picton-blue-500 relative group">
            {profile.coverImage && (
              <Image
                src={profile.coverImage}
                alt="Cover"
                width={800}
                height={200}
                className="object-cover w-full h-full"
              />
            )}
            <div className="absolute top-1/2 -translate-y-1/2 px-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={profile.image || undefined}
                      alt={profile.name || ""}
                      className="border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                    <AvatarFallback>
                      <GoogleAvatar
                        name={profile.name || ""}
                        className="text-3xl w-full h-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">{profile.name}</h1>
                        {/* {profile.verified && (
                          <Shield
                            className="h-6 w-6 text-celestial-blue-500"
                            fill="currentColor"
                          />
                        )} */}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        @{profile.username}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.biography}
                </p>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Social Links</h4>
                  <div className="space-y-2">
                    {profile.instagram && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                        <Link
                          rel="noopener noreferrer"
                          target="_blank"
                          href={`https://www.instagram.com/${profile.instagram}`}
                        >
                          {profile.instagram}
                        </Link>
                      </div>
                    )}
                    {profile.linkedin && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 bg-blue-600 rounded"></div>
                        <span>{profile.linkedin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {profile.sellerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-celestial-blue-500">
                        {profile.sellerProfile.totalSales}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Items Sold
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Listings and Reviews */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="listings">
                  {/* Active Listings ({user.activeListings.length}) */}
                  Active Listings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.sellerProfile?.products.map((item) => (
                    <MarketPlaceProductCard key={item.id} item={item} />
                  ))}
                </div>
                {/* {user.activeListings.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Listings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user.name} doesn&apos;t have any items for sale right
                      now.
                    </p>
                  </div>
                )} */}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
