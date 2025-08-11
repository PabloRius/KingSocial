"use server";

import { ProductPage } from "@/components/marketplace/product-page";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProductPage productId={id} />;
}
