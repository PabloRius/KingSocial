import { CollapsibleSection } from "@/components/collapsible-section";
import { MarketPlaceProductCard } from "@/components/marketplace-product-card";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/models/Product";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Loader2, Search } from "lucide-react";

export function ItemsSection({
  loading,
  emptyQuery,
  items,
  onBookmark,
  bookmarkedIds,
  page,
  limit,
  totalCount,
  setPage,
}: {
  loading: boolean;
  emptyQuery: () => void;
  items: Product[];
  onBookmark: (id: string) => void;
  bookmarkedIds: string[];
  page: number;
  limit: number;
  totalCount: number;
  setPage: (page: number) => void;
}) {
  return (
    <CollapsibleSection title="🛒 All Listings" defaultOpen={false}>
      <div>
        <div className="flex items-center justify-between mb-4">
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
              <MarketPlaceProductCard
                key={item.id}
                item={item}
                isBookmarked={bookmarkedIds.includes(item.id) || false}
                toggleProductBookmark={onBookmark}
              />
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
              onClick={() => setPage(Math.max(1, page - 1))}
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
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(totalCount / limit)}
            >
              &gt;
            </Button>
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}
