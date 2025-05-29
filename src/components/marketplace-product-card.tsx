import { Product } from "@/types/types";
// import { Heart } from "lucide-react";
// import { Heart, Star } from "lucide-react";
import Image from "next/image";
// import { GoogleAvatar } from "./google-avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

export const MarketPlaceProductCard = ({ item }: { item: Product }) => {
  return (
    <Card
      key={item.id}
      className="group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative">
        {/* <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${
              item.saved ? "text-pink-500" : "text-gray-600"
            }`}
            // onClick={() => toggleSave(item.id)}
          >
            <Heart className={`h-5 w-5 ${item.saved ? "fill-pink-500" : ""}`} />
          </Button>
        </div> */}
        {/* {item.featured && (
          <Badge className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none">
            Featured
          </Badge>
        )} */}
        <div className="aspect-square overflow-hidden">
          <Image
            src={item.photos[0] || "/Placeholder-product.jpg"}
            alt={item.name}
            width={300}
            height={300}
            className="object-scale-down w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
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
        {/* <div className="flex items-center gap-2 mt-3">
          <GoogleAvatar src="Place" name={item.seller.name || undefined} />
          <span className="text-sm">{item.seller.name}</span>
          <div className="flex items-center ml-auto">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs ml-1">
              {item.seller.sellerProfile.rating}
            </span>
          </div>
        </div> */}
      </CardContent>
      <CardFooter className="p-0">
        <Button className="w-full rounded-none bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white">
          View Item
        </Button>
      </CardFooter>
    </Card>
  );
};
