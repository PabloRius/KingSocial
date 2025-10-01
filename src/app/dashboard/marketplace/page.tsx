"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/context/session-context";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/lib/models/Product";
import { toggleBookmarkListing } from "@/lib/store/marketplace";
import { categories, Category, Condition, conditions } from "@/types/types";
import {
  Check,
  ChevronDown,
  Filter,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookmarkedSection } from "./bookmarked-section";
import { FeaturedSection } from "./featured-section";
import { ItemsSection } from "./items-section";

export default function MarketplacePage() {
  const { session } = useSession();
  const { profile } = session!;
  const { sellerProfile } = profile;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All Categories");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [condition, setCondition] = useState<Condition>("Any");
  const [items, setItems] = useState<Product[]>([]);
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
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (condition) params.append("condition", condition);
      if (priceRange[0] !== undefined)
        params.append("minPrice", priceRange[0].toString());
      if (priceRange[1] !== undefined)
        params.append("maxPrice", priceRange[1].toString());
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setItems(data.products);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Error fetching items", err);
    } finally {
      setLoading(false);
    }
  }, [condition, priceRange, debouncedSearchQuery, selectedCategory, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleBookmarkProduct = async (itemId: string) => {
    setBookmarkedIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    await toggleBookmarkListing(itemId);
  };

  const filteredItems = items.filter((item) => item.status !== "sold");
  const bookmarkedItems = filteredItems.filter((item) =>
    bookmarkedIds.includes(item.id)
  );

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
              <Link href="/marketplace/your-listings">
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

      <div className="flex flex-col gap-6 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search for textbooks, electronics, dorm stuff..."
              className="pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:border-celestial-blue-500 focus:ring-celestial-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  {selectedCategory}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? "bg-celestial-blue-50 dark:bg-gray-700 font-medium"
                        : ""
                    }
                  >
                    {category}
                    {selectedCategory === category && (
                      <Check className="ml-auto h-4 w-4 text-celestial-blue-500" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                  <DrawerHeader>
                    <DrawerTitle>Filter Items</DrawerTitle>
                    <DrawerDescription>
                      Narrow down your search with these filters
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    <Tabs defaultValue="price" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="price">Price</TabsTrigger>
                        <TabsTrigger value="condition">Condition</TabsTrigger>
                        <TabsTrigger value="location">Location</TabsTrigger>
                      </TabsList>
                      <TabsContent value="price" className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-medium">Price Range</h4>
                          <div className="px-2">
                            <Slider
                              defaultValue={[0, 3000]}
                              max={3000}
                              step={10}
                              value={priceRange}
                              onValueChange={(event) => {
                                setPriceRange([event[0], event[1]]);
                              }}
                              className="py-4"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              ${priceRange[0]}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${priceRange[1]}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="condition" className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-medium">Item Condition</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {conditions.map((cond) => (
                              <Button
                                key={cond}
                                variant={
                                  condition === cond ? "default" : "outline"
                                }
                                className={
                                  condition === cond
                                    ? "bg-celestial-blue-500 hover:bg-celestial-blue-600"
                                    : ""
                                }
                                onClick={() => setCondition(cond)}
                              >
                                {cond}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="location" className="p-4">
                        <div className="space-y-4">
                          <h4 className="font-medium">Campus Location</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              "All Locations",
                              "Dorms",
                              "Library",
                              "Student Center",
                              "Campus Center",
                              "Off Campus",
                            ].map((loc) => (
                              <Button key={loc} variant="outline">
                                {loc}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  <DrawerFooter>
                    <Button className="bg-gradient-to-r from-celestial-blue-500 to-violet-500 hover:from-celestial-blue-600 hover:to-violet-600">
                      Apply Filters
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Active filters */}
        {(searchQuery ||
          selectedCategory !== "All Categories" ||
          condition !== "Any" ||
          priceRange[0] > 0 ||
          priceRange[1] < 1500) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchQuery && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
              >
                Search: {searchQuery}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSearchQuery("")}
                />
              </Badge>
            )}
            {selectedCategory !== "All Categories" && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
              >
                Category: {selectedCategory}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setSelectedCategory("All Categories")}
                />
              </Badge>
            )}
            {condition !== "Any" && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
              >
                Condition: {condition}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setCondition("Any")}
                />
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1500) && (
              <Badge
                variant="outline"
                className="rounded-full px-3 py-1 flex items-center gap-1 bg-gray-50 dark:bg-gray-800"
              >
                Price: ${priceRange[0]} - ${priceRange[1]}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setPriceRange([0, 1500])}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
                setCondition("Any");
                setPriceRange([0, 1500]);
              }}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {bookmarkedItems.length > 0 && (
        <BookmarkedSection
          items={bookmarkedItems}
          onBookmark={handleBookmarkProduct}
        />
      )}

      <FeaturedSection
        items={[]}
        onBookmark={handleBookmarkProduct}
        bookmarkedIds={bookmarkedIds}
      />

      <ItemsSection
        loading={loading}
        emptyQuery={emptyQuery}
        items={filteredItems}
        onBookmark={handleBookmarkProduct}
        bookmarkedIds={bookmarkedIds}
        page={page}
        limit={limit}
        totalCount={totalCount}
        setPage={setPage}
      />
    </main>
  );
}
