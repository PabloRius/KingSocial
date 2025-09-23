import { CollapsibleSection } from "@/components/collapsible-section";
import { MarketPlaceProductCard } from "@/components/marketplace-product-card";
import { Product } from "@/lib/models/Product";

export function FeaturedSection({
  items,
  onBookmark,
  bookmarkedIds,
}: {
  items: Product[];
  onBookmark: (id: string) => void;
  bookmarkedIds: string[];
}) {
  return (
    <CollapsibleSection title="✨ Featured for You" defaultOpen={true}>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <MarketPlaceProductCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.includes(item.id)}
              toggleProductBookmark={onBookmark}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No featured items yet
        </p>
      )}
    </CollapsibleSection>
  );
}
