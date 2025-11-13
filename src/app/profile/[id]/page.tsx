"use client";

import { MarketPlaceProductCard } from "@/components/marketplace-product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { User } from "@/lib/models/User";
import { toggleBookmarkListing } from "@/lib/store/marketplace";
import { getProfileById } from "@/lib/store/profile";
import { Loader2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const initPage = async () => {
      const { id } = await params;
      setUserId(id);
    };
    initPage();
  }, [params]);
  const [activeTab, setActiveTab] = useState("listings");
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const fetchedProfile = await getProfileById(userId);
      setProfile(fetchedProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleBookmarkProduct = async (itemId: string) => {
    try {
      await toggleBookmarkListing(itemId);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      fetchProfile();
    }
  };

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

  const activeListings =
    profile.sellerProfile?.products.filter(
      (product) => product.status !== "sold"
    ) || [];

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

            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-start text-center px-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <UserAvatar
                    avatarUrl={profile.image || undefined}
                    name={profile.name || ""}
                    className="text-3xl h-32 w-32 ring-4 ring-white dark:ring-gray-800"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0 text-white drop-shadow-lg text-left">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <p className="text-gray-200 mb-2">@{profile.name}</p>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-200">
                    <span>
                      Joined{" "}
                      {new Date(profile.createdAt).toLocaleString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
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
                  Active Listings ({activeListings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeListings.map((item) => {
                    const isOwner = profile.id === item.seller?.user.id;
                    const productProps = {
                      item,
                      ...(!isOwner && {
                        isBookmarked: profile.bookmarkedProducts.includes(
                          item.id
                        ),
                        toggleProductBookmark: handleBookmarkProduct,
                      }),
                    };

                    return (
                      <MarketPlaceProductCard key={item.id} {...productProps} />
                    );
                  })}
                </div>
                {activeListings.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Listings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.name} doesn&apos;t have any items for sale right
                      now.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
