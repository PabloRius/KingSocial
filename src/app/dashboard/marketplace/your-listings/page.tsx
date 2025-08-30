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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/context/session-context";
import {
  getListingsByUserId,
  removeListingById,
} from "@/lib/store/marketplace";
import { categories, Product } from "@/types/types";
import {
  CheckCircle,
  DollarSign,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function YourListingsPage() {
  const { session } = useSession();

  const [listings, setListings] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState("newest");
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
    setListings(
      listings.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: "sold",
              soldDate: new Date().toISOString().split("T")[0],
            }
          : listing
      )
    );
  };

  const totalStats = {
    active: listings.filter((l) => l.status === "active").length,
    sold: listings.filter((l) => l.status === "sold").length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalLikes: listings.reduce((sum, l) => sum + l.likes, 0),
    totalEarnings: listings
      .filter((l) => l.status === "sold")
      .reduce((sum, l) => sum + l.price, 0),
  };

  const ListingCard = ({ listing }: { listing: Product }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={listing.photos[0] || "/placeholder.png"}
            alt={listing.name}
            width={300}
            height={300}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => redirect(`edit-listing/${listing.id}`)}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Listing
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${listing.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Public
                </Link>
              </DropdownMenuItem>
              {listing.status === "active" && (
                <DropdownMenuItem onClick={() => handleMarkAsSold(listing.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Sold
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(listing)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{listing.name}</h3>
          <span className="font-bold text-lg text-celestial-blue-500">
            ${listing.price}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {listing.condition}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {listing.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{listing.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {/* <span>{listing.likes}</span> */}
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {/* <span>{listing.messages}</span> */}
              <span>0</span>
            </div>
          </div>
          {listing.status === "active" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <DollarSign className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Posted: {new Date(listing.postedDate).toLocaleDateString()}</div>
          {listing.status === "sold" && listing.soldDate && (
            <div>Sold: {new Date(listing.soldDate).toLocaleDateString()}</div>
          )}
        </div> */}
      </CardContent>
    </Card>
  );

  return (
    <main className="flex-1 py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Your Listings 📦</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track all your marketplace items
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {totalStats.active}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {totalStats.sold}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-celestial-blue-500">
              ${totalStats.totalEarnings}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Earned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search all your listings..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="likes">Most Likes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Active Listings Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Active Listings ({activeListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No Active Listings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchQuery || categoryFilter !== "All Categories"
                    ? "No active listings match your search criteria."
                    : "You don't have any active listings right now."}
                </p>
                {!searchQuery && categoryFilter === "All Categories" && (
                  <Button asChild>
                    <Link href="sell">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Listing
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sold Listings Section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Sold Listings ({soldListings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {soldListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {soldListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Sold Listings</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery || categoryFilter !== "All Categories"
                    ? "No sold listings match your search criteria."
                    : "You haven't sold any items yet. Keep promoting your active listings!"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
