import { useDebounce } from "@/hooks/useDebounce";
import { Category, Condition, Product } from "@/types/types";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MarketPlaceProductCard } from "./marketplace-product-card";

interface MarketPlaceItemsProps {
  searchQuery: string;
  selectedCategory: Category;
  priceRange: [number, number];
  condition: Condition;
  emptyQuery: () => void;
}

export const MarketPlaceItems = ({
  searchQuery,
  selectedCategory,
  priceRange,
  condition,
  emptyQuery,
}: MarketPlaceItemsProps) => {
  const [items, setItems] = useState<Product[]>([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

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

  return (
    <div className="mb-10">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{"All Items"}</h2>
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

        {loading ? (
          <div className="flex flex-1 justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
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
      {items.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              &lt;
            </Button>

            {[...Array(Math.ceil(totalCount / limit)).keys()].map((_, i) => {
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
            })}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-8 h-8"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / limit)}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
