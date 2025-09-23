import { CollapsibleSection } from "@/components/collapsible-section";
import { MarketPlaceProductCard } from "@/components/marketplace-product-card";
import { Product } from "@/lib/models/Product";
import { useEffect, useState } from "react";

export function BookmarkedSection({
  items,
  onBookmark,
}: {
  items: Product[];
  onBookmark: (id: string) => void;
}) {
  const [bookmarked, setBookmarked] = useState<Product[]>(items);

  useEffect(() => {
    setBookmarked(items);
  }, [items]);

  async function handleToggle(id: string) {
    // Optimistically remove from UI
    setBookmarked((prev) => prev.filter((item) => item.id !== id));

    onBookmark(id);
  }

  return (
    <CollapsibleSection title="🔖 Your Bookmarked Items">
      {bookmarked.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookmarked.map((item) => (
            <MarketPlaceProductCard
              key={item.id}
              item={item}
              isBookmarked={true}
              toggleProductBookmark={handleToggle}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          You haven’t bookmarked anything yet.
        </p>
      )}
    </CollapsibleSection>
  );
}
