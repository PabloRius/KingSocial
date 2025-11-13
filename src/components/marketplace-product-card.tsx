import { Product } from "@/lib/models/Product";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { UserAvatar } from "./user-avatar";

export const MarketPlaceProductCard = ({
  item,
  isBookmarked,
  toggleProductBookmark,
}: {
  item: Product;
  isBookmarked?: boolean;
  toggleProductBookmark?: (itemId: string) => void;
}) => {
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  useEffect(() => {
    setLocalIsBookmarked(isBookmarked);
  }, [isBookmarked]);
  const localHandleBookmark = () => {
    if (!toggleProductBookmark) return;
    setLocalIsBookmarked(!localIsBookmarked);
    toggleProductBookmark(item.id);
  };
  return (
    <Card
      key={item.id}
      className="overflow-hidden py-0 gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative">
        {/* Bookmark overlay button */}
        {!!toggleProductBookmark && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
              onClick={localHandleBookmark}
              aria-label={
                localIsBookmarked ? "Remove bookmark" : "Add bookmark"
              }
            >
              <Bookmark
                className={`h-5 w-5 transition-colors ${
                  localIsBookmarked
                    ? "text-celestial-blue-600 fill-celestial-blue-600"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              />
            </Button>
          </div>
        )}

        {/* Product image */}
        <div className="aspect-square overflow-hidden">
          <motion.div layoutId={`product-image-${item.id}`}>
            <Image
              src={item.photos[0] || "/Placeholder-product.jpg"}
              alt={item.name}
              width={300}
              height={300}
              className="object-scale-down w-full h-full"
            />
          </motion.div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
          <p className="font-bold text-lg">£{item.price}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Badge variant="outline" className="rounded-full font-normal text-xs">
            {item.condition}
          </Badge>
          {item.pickupLocation && (
            <>
              <span className="mx-1">•</span>
              <span>{item.pickupLocation}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          {item.seller ? (
            <>
              <UserAvatar
                name={item.seller.user.name || undefined}
                avatarUrl={item.seller.user.image || undefined}
              />
              <span className="text-sm">{item.seller.user.name}</span>
            </>
          ) : (
            "Account Deleted"
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0">
        <Link
          href={`/dashboard/marketplace/${item.id}`}
          className="w-full p-2 text-center rounded-none bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
        >
          View Item
        </Link>
      </CardFooter>
    </Card>
  );
};
