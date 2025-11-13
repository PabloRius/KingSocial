"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/context/session-context";
import { useDebounce } from "@/hooks/useDebounce";
import { categories, Category } from "@/lib/models/Category";
import { Condition } from "@/lib/models/Condition";
import { Product } from "@/lib/models/Product";
import { getMarketplace, toggleBookmarkListing } from "@/lib/store/marketplace";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Bookmark,
  Loader2,
  MapPin,
  Package,
  Plus,
  PoundSterling,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function MarketplacePage() {
  const { session } = useSession();
  const { profile } = session!;
  const { sellerProfile } = profile;
  const [activeTab, setActiveTab] = useState<string>("featured");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All Categories");
  const [priceRange, setPriceRange] = useState<number[]>([0, 3000]);
  const [condition, setCondition] = useState<Condition>("Any");
  const [items, setItems] = useState<Product[] | undefined | null>(undefined);
  const [bookmarkedIds, setBookmarkedIds] = useState(
    session?.profile.bookmarkedProducts || []
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  const emptyQuery = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setCondition("Any");
    setPriceRange([0, 3000]);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMarketplace(
        page,
        limit,
        debouncedSearchQuery,
        selectedCategory,
        condition,
        priceRange[0],
        priceRange[1]
      );
      if (!res) {
        setItems(null);
        throw new Error("Failed to fetch products");
      }

      setItems(res.products);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error("Error fetching items", err);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearchQuery,
    selectedCategory,
    condition,
    priceRange,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBookmarkProduct = async (itemId: string) => {
    setBookmarkedIds((prev) => {
      let newArray = [];
      if (prev.includes(itemId)) {
        newArray = prev.filter((id) => id !== itemId);
      } else {
        newArray = [...prev, itemId];
      }
      return newArray;
    });

    await toggleBookmarkListing(itemId);
  };

  if (items === undefined) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (items === null) {
    return <div>Error</div>;
  }

  const filteredProducts = items.filter((item) => item.status !== "sold");
  const bookmarkedProducts = filteredProducts.filter((item) =>
    bookmarkedIds.includes(item.id)
  );
  if (bookmarkedProducts.length <= 0 && activeTab === "bookmarks")
    setActiveTab("featured");

  const itemRelations: Record<string, Product[]> = {
    featured: filteredProducts,
    all: filteredProducts,
    bookmarks: bookmarkedProducts,
  };

  return (
    <main className="flex-1 p-6">
      {/* Hero Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Discover Amazing Items</h2>
            <p className="text-blue-100">
              Buy and sell with confidence in our trusted marketplace
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={
                sellerProfile ? "marketplace/sell" : "marketplace/select-plan"
              }
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Sell Something
              </Button>
            </Link>
            {sellerProfile && (
              <Link href="/dashboard/marketplace/your-listings">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-semibold bg-transparent"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Your Listings
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-14 text-lg bg-white border-blue-200 focus:border-blue-400 shadow-sm rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <span className="sr-only">Clear search</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-1 flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex-1 sm:w-auto"
        >
          <div className="flex flex-1 flex-row justify-between">
            <TabsList
              className={`bg-white border border-blue-200 grid ${
                bookmarkedProducts.length > 0 ? "grid-cols-3" : "grid-cols-2"
              } sm:inline-flex`}
            >
              <TabsTrigger
                value="featured"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
              >
                Featured
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
              >
                All
              </TabsTrigger>
              {bookmarkedProducts.length > 0 && (
                <TabsTrigger
                  value="bookmarks"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-800 data-[state=active]:text-white"
                >
                  Bookmarks
                </TabsTrigger>
              )}
            </TabsList>

            {/* Filter Drawer */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-300 hover:bg-blue-50 w-full sm:w-auto bg-transparent"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filter Products</DrawerTitle>
                  <DrawerDescription>
                    Adjust filters to find exactly what you&quot;re looking for
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Category
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={
                            selectedCategory === category
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSelectedCategory(category)}
                          className={
                            selectedCategory === category
                              ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                              : "border-blue-200 hover:bg-blue-50"
                          }
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">
                      Price Range
                    </h3>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                      Apply Filters
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          {Object.keys(itemRelations).map((tab) => (
            <TabsContent value={tab} key={tab}>
              {/* Search Results Info */}
              {searchQuery && (
                <div className="mb-4 text-sm text-gray-600">
                  Found{" "}
                  <span className="font-semibold text-blue-600">
                    {itemRelations[tab].length}
                  </span>{" "}
                  results for &quot;
                  <span className="font-semibold">{searchQuery}</span>&quot;
                </div>
              )}

              {/* Products Grid */}
              {!loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {itemRelations[tab].map((product) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/marketplace/${product.id}`}
                    >
                      <Card className="group overflow-hidden border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 pb-0">
                        <CardContent className="p-0">
                          {/* Product Image */}
                          <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-blue-50 to-blue-100">
                            <Image
                              src={
                                product.photos[0] || "/Placeholder-product.jpg"
                              }
                              alt={product.name}
                              width={300}
                              height={300}
                              className="object-scale-down w-full h-full"
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBookmarkProduct(product.id);
                              }}
                            >
                              {bookmarkedIds.includes(product.id) ? (
                                <Bookmark className="h-4 w-4 text-blue-600 fill-blue-600" />
                              ) : (
                                <Bookmark className="h-4 w-4 text-blue-600" />
                              )}
                            </Button>
                          </div>

                          {/* Product Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {product.name}
                              </h3>
                              {/* <div className="flex items-center gap-1 text-gray-500">
                              <Bookmark className="h-4 w-4" />
                              <span className="text-sm">
                                {product.bookmarks}
                              </span>
                            </div> */}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1 text-blue-600 font-bold text-xl">
                                <PoundSterling className="h-5 w-5" />
                                <span>{product.price}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{product.pickupLocation}</span>
                            </div>

                            {/* Seller Info */}
                            <div className="flex items-center gap-2 pt-3 border-t border-blue-100">
                              {product.seller ? (
                                <>
                                  <UserAvatar
                                    name={product.seller.user.name || undefined}
                                    avatarUrl={
                                      product.seller.user.image || undefined
                                    }
                                  />
                                  <span className="text-sm">
                                    {product.seller.user.name}
                                  </span>
                                </>
                              ) : (
                                "Account Deleted"
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 w-full h-100 items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              )}

              {/* No Results */}
              {itemRelations[tab].length === 0 && (
                <div className="flex-1  items-center text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <Search className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button variant="outline" onClick={emptyQuery}>
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {itemRelations[tab].length > 0 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      &lt;
                    </Button>

                    {[...Array(Math.ceil(totalCount / limit)).keys()].map(
                      (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <Button
                            key={pageNumber}
                            variant="outline"
                            size="sm"
                            className={`rounded-full w-8 h-8 ${
                              page === pageNumber
                                ? "bg-celestial-blue-500 text-white border-celestial-blue-500"
                                : ""
                            }`}
                            onClick={() => setPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full w-8 h-8"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(totalCount / limit)}
                    >
                      &gt;
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
