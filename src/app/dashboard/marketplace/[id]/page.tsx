"use client";

import { useEffect, useState } from "react";

import { GoogleAvatar } from "@/components/google-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/context/session-context";
import { getListingById } from "@/lib/store/marketplace";
import { Product } from "@/types/types";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  MessageCircle,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [productId, setProductId] = useState<string | null>(null);
  const { session } = useSession();
  useEffect(() => {
    const initPage = async () => {
      const { id } = await params;
      setProductId(id);
    };

    initPage();
  }, [params]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const product = await getListingById(productId);

        if (!product) {
          setProduct(null);
          console.error(`Failed to fetch product: ${productId}`);
        }

        setProduct(product);
      } catch {
        console.error("Error loading the product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {
                "The product you're looking for doesn't exist or has been removed."
              }
            </p>
            <Button asChild>
              <Link href="/dashboard/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.photos.length) % product.photos.length
    );
  };

  const handleMessageSeller = () => {
    // In a real app, this would open a messaging interface
    alert(`Opening message thread with ${product.seller.user.name}...`);
  };

  const isOwner = session?.profile?.id === product.seller.user.id;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <main className="flex-1 container py-6 px-2 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4 relative">
            <div className="relative flex items-center aspect-square overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Image
                src={product.photos[currentImageIndex] || "/placeholder.png"}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain w-full h-full"
              />
              {product.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {product.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.photos.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-celestial-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                {/* <Badge
                  variant={product.availability === "Available" ? "default" : "secondary"}
                  className={
                    product.availability === "Available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : ""
                  }
                >
                  {product.availability}
                </Badge> */}
              </div>

              {/* <div className="flex items-center gap-4 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-celestial-blue-500">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
                {product.originalPrice && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Save ${product.originalPrice - product.price}
                  </Badge>
                )}
              </div> */}

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="rounded-full">
                    {product.condition}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{product.pickupLocation}</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{product.views} views</span>
                </div> */}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm text-celestial-blue-600 dark:text-celestial-blue-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={
                  isOwner
                    ? () => {
                        redirect(`edit-listing/${productId}`);
                      }
                    : handleMessageSeller
                }
                className="w-full h-12 bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white rounded-xl font-medium"
              >
                {isOwner ? (
                  <Box className="mr-2 h-5 w-5" />
                ) : (
                  <MessageCircle className="mr-2 h-5 w-5" />
                )}
                {isOwner ? "Edit Listing" : "Message Seller"}
              </Button>
            </div>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <GoogleAvatar name={product.seller.user.name || undefined} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {product.seller.user.name}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {product.seller.rating && (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">
                            {product.seller.rating}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {/* <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{product.seller.responseTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{product.seller.totalSales} items sold</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {product.seller.joinDate}</span>
                      </div> */}
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/profile/${product.seller.user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    View Seller Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description & Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="pickup" className="mt-4">
                <div className="space-y-4">
                  {/* <div>
                    <h4 className="font-semibold mb-2">Pickup Options</h4>
                    <div className="space-y-2">
                      {product.shipping.locations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-celestial-blue-500" />
                          <span>{location}</span>
                        </div>
                      ))}
                    </div>
                  </div> */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Note:</strong> This seller prefers campus meetups
                      for safety and convenience. Shipping is not available for
                      this item.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Items */}
        {/* <Card>
          <CardHeader>
            <CardTitle>You Might Also Like</CardTitle>
            <CardDescription>Similar items from other sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedItems.map((item) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-celestial-blue-500">${item.price}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.condition}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">by {item.seller}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </main>
    </div>
  );
}
