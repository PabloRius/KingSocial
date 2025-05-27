import { Product } from "@/types/types";
import { ArrowRight, ChevronDown, Search, Zap } from "lucide-react";
import { MarketPlaceProductCard } from "./marketplace-product-card";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const featuredItems: Product[] = [
  {
    id: 1,
    title: "MacBook Pro 2021",
    price: 1200,
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Jamie",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.8 },
    },
    location: "Campus Center",
    featured: true,
    saved: false,
    category: "Electronics",
    tags: ["laptop", "apple", "student discount"],
  },
  {
    id: 2,
    title: "Physics Textbook Bundle",
    price: 85,
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Taylor",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.6 },
    },
    location: "Science Building",
    featured: true,
    saved: true,
    category: "Books",
    tags: ["textbooks", "science", "bundle deal"],
  },
  {
    id: 3,
    title: "Dorm Room Essentials Kit",
    price: 120,
    condition: "New",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Morgan",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.9 },
    },
    location: "North Dorms",
    featured: true,
    saved: false,
    category: "Home",
    tags: ["dorm", "essentials", "bundle"],
  },
  {
    id: 4,
    title: "Concert Tickets - The Weeknd",
    price: 150,
    condition: "New",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Alex",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.7 },
    },
    location: "Student Union",
    featured: true,
    saved: false,
    category: "Tickets",
    tags: ["concert", "music", "weekend"],
  },
];

const marketplaceItems: Product[] = [
  ...featuredItems,
  {
    id: 5,
    title: "Graphic Calculator TI-84",
    price: 60,
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Jordan",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.5 },
    },
    location: "Math Building",
    featured: false,
    saved: false,
    category: "Electronics",
    tags: ["calculator", "math", "essential"],
  },
  {
    id: 6,
    title: "Desk Lamp with USB Ports",
    price: 35,
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Casey",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.3 },
    },
    location: "East Dorms",
    featured: false,
    saved: true,
    category: "Home",
    tags: ["lamp", "desk", "usb"],
  },
  {
    id: 7,
    title: "Wireless Noise Cancelling Headphones",
    price: 120,
    condition: "Like New",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Riley",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.9 },
    },
    location: "Library",
    featured: false,
    saved: false,
    category: "Electronics",
    tags: ["headphones", "study", "music"],
  },
  {
    id: 8,
    title: "Vintage College Hoodie",
    price: 45,
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Quinn",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.7 },
    },
    location: "Student Center",
    featured: false,
    saved: false,
    category: "Clothing",
    tags: ["hoodie", "vintage", "college"],
  },
  {
    id: 9,
    title: "Mountain Bike - Perfect for Campus",
    price: 210,
    condition: "Good",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Avery",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.6 },
    },
    location: "Bike Racks",
    featured: false,
    saved: false,
    category: "Sports",
    tags: ["bike", "transportation", "outdoor"],
  },
  {
    id: 10,
    title: "Psychology 101 Notes Bundle",
    price: 25,
    condition: "N/A",
    image: "/placeholder.svg?height=300&width=300",
    seller: {
      name: "Sam",
      image: "/placeholder.svg?height=40&width=40",
      sellerProfile: { rating: 4.8 },
    },
    featured: false,
    saved: false,
    category: "Books",
    tags: ["notes", "psychology", "study"],
  },
];

export const MarketPlaceItems = ({
  emptyQuery,
}: {
  emptyQuery: () => void;
}) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Zap className="mr-2 h-5 w-5 text-yellow-500" />
          Featured Items
        </h2>
        <Button
          variant="link"
          className="text-celestial-blue-500 flex items-center gap-1"
        >
          See All <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredItems.map((item) => (
          <MarketPlaceProductCard key={item.id} item={item} />
        ))}
      </div>

      {/* Search Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {/* {searchQuery ||
              selectedCategory !== "All Categories" ||
              condition !== "Any" ||
              priceRange[0] > 0 ||
              priceRange[1] < 1500
                ? `Search Results (${filteredItems.length})`
                : "All Items"} */}{" "}
            {"All Items"}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl">
                Sort By: Newest
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem>Most Popular</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {marketplaceItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {marketplaceItems.map((item) => (
              <MarketPlaceProductCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-celestial-blue-100 dark:bg-celestial-blue-900/30 flex items-center justify-center">
              <Search className="h-8 w-8 text-celestial-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {
                "We couldn't find any items matching your search. Try adjusting your filters or search for something else."
              }
            </p>
            <Button variant="outline" className="mt-4" onClick={emptyQuery}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {marketplaceItems.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-8 h-8 bg-celestial-blue-500 text-white border-celestial-blue-500"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-8 h-8"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-8 h-8"
            >
              3
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
