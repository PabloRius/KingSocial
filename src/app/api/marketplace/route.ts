import { auth } from "@/auth";
import { GetProfile } from "@/lib/actions/profile";
import { productSelect } from "@/lib/models/Product";
import prisma from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();

    const user = session?.user?.id ? await GetProfile(session.user.id) : null;
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            },
            category && category !== "All Categories" ? { category } : {},
            condition && condition !== "Any" ? { condition } : {},
            { price: { gte: minPrice, lte: maxPrice } },
            { sellerId: { not: user?.sellerProfile?.id } },
            { status: { not: "sold" } },
          ],
        },
        select: productSelect,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
              ],
            },
            category && category !== "All Categories" ? { category } : {},
            condition && condition !== "Any" ? { condition } : {},
            { price: { gte: minPrice, lte: maxPrice } },
          ],
        },
      }),
    ]);

    return NextResponse.json({ products, totalCount, page, limit });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace items." },
      { status: 500 }
    );
  }
}
