"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/context/session-context";
import { Product } from "@/lib/models/Product";
import {
  getListingsByUserId,
  removeListingById,
  sellListing,
} from "@/lib/store/marketplace";
import {
  Bookmark,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  MessageCircle,
  MoreVertical,
  Package,
  Plus,
  PoundSterling,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function YourListingsPage() {
  const { session, loading } = useSession();

  const [listings, setListings] = useState<Product[] | undefined>(undefined);

  const [deletingListing, setDeletingListing] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    if (!session || !session?.profile) redirect("/dashboard/marketplace");
    try {
      const listings = await getListingsByUserId(session?.profile.id);
      setListings(listings);
    } catch (error) {
      console.error("Error fetching user listings: ", error);
      setListings([]);
    }
  }, [session]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Sort listings
  //   const sortListings = (listingsToSort: Product[]) => {
  //     return [...listingsToSort].sort((a, b) => {
  //       switch (sortBy) {
  //         case "newest":
  //           return (
  //             new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
  //           );
  //         case "oldest":
  //           return (
  //             new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime()
  //           );
  //         case "price-high":
  //           return b.price - a.price;
  //         case "price-low":
  //           return a.price - b.price;
  //         case "views":
  //           return b.views - a.views;
  //         case "likes":
  //           return b.likes - a.likes;
  //         default:
  //           return 0;
  //       }
  //     });
  //   };

  // Separate and filter listings
  //   const activeListings = sortListings(
  //     filterListings(listings.filter((l) => l.status === "active"))
  //   );
  //   const soldListings = sortListings(
  //     filterListings(listings.filter((l) => l.status === "sold"))
  //   );

  if (loading || listings === undefined) {
    return (
      <div className="flex-1 flex w-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const activeListings = listings.filter((l) => l.status === "active");
  const soldListings = listings.filter((l) => l.status === "sold");
  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    await removeListingById(deletingListing.id);

    fetchListings();

    setIsDeleteDialogOpen(false);
    setDeletingListing(null);
  };

  const handleDelete = (listing: Product) => {
    setDeletingListing(listing);
    setIsDeleteDialogOpen(true);
  };

  const handleMarkAsSold = async (listingId: string) => {
    sellListing(listingId);
    fetchListings();
  };

  const totalStats = {
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalLikes: listings.reduce((sum, l) => sum + l.bookmarks, 0),
    totalEarnings: listings
      .filter((l) => l.status === "sold")
      .reduce((sum, l) => sum + l.price, 0),
    totalMessages: listings.reduce((sum, l) => sum + l.references.length, 0),
  };

  const ListingCard = ({ listing }: { listing: Product }) => (
    <Link href={`/dashboard/marketplace/${listing.id}`}>
      <Card className="group hover:shadow-xl p-0 gap-0 transition-all duration-300 overflow-hidden border-blue-200 pb-0 h-full">
        <div className="relative flex flex-col h-full">
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
            <Image
              src={listing.photos[0] || "/placeholder.png"}
              alt={listing.name}
              width={300}
              height={300}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 bg-white/90 backdrop-blur-sm shadow-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {listing.status === "active" && (
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => redirect(`edit-listing/${listing.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Listing
                    </Button>
                  </DropdownMenuItem>
                )}

                {listing.status === "active" && (
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleMarkAsSold(listing.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Sold
                    </Button>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      redirect(`sell?resellId=${listing.id}`);
                    }}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Re-Sell
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(listing)}
                    className="w-full justify-start text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-lg p-2.5 shadow-lg w-min">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-gray-700">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{listing.views}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Bookmark className="h-4 w-4 text-red-500" />
                  <span className="font-semibold">{listing.bookmarks}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">
                    {listing.references.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col justify-between flex-grow">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors leading-tight min-h-[1.75rem]">
                {listing.name}
              </h3>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${listing.price}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
              {listing.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Posted {formatDate(listing.createdAt)}</span>
              </div>
              {listing.status === "sold" && listing.soldAt && (
                <Badge variant="secondary" className="text-xs">
                  Sold {formatDate(listing.soldAt)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  if (!session) {
    redirect("/");
  }

  return (
    <main className="flex-1 py-6 px-4 sm:px-6">
      {/* Stats Overview */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Your Listings</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{totalStats.active}</div>
                <div className="text-sm text-white/90">
                  Active Listing{totalStats.active > 1 && "s"}
                </div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">{totalStats.sold}</div>
                <div className="text-sm text-white/90">
                  Sold Listing{totalStats.active > 1 && "s"}
                </div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  ${totalStats.totalEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-white/90">Total Earned</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl font-semibold"
              >
                <Link href="sell">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Listing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Active ({activeListings.length})
          </TabsTrigger>
          <TabsTrigger
            value="sold"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <PoundSterling className="h-4 w-4 mr-2" />
            Sold ({soldListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeListings.length > 0 ? (
            <div
              className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
            >
              {activeListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-gray-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Active Listings</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {
                  "You don't have any active listings yet. Create your first listing to start selling!"
                }
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Link href="sell">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Your First Listing
                </Link>
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-6">
          {soldListings.length > 0 ? (
            <div
              className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
            >
              {soldListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-gray-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 mb-4">
                <PoundSterling className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Sold Items Yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {
                  "You haven't sold any items yet. Keep promoting your active listings!"
                }
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingListing?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
