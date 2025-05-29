import { auth } from "@/auth";
import { GetProfile } from "@/lib/actions/profile";
import { cloudinary } from "@/lib/cloudinary";
import prisma from "@/prisma";
import { categories, conditions } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  category: z.enum(categories),
  condition: z.enum(conditions),
  location: z.string(),
  tags: z.array(z.string()).optional(),
});

type ProductFormFields = {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  condition?: string;
  location?: string;
  tags?: string[];
};

async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const fields: ProductFormFields = {};
  const files: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      if (key === "tags") {
        fields[key] = fields[key] || [];
        fields[key].push(value);
      } else if (
        key === "title" ||
        key === "description" ||
        key === "price" ||
        key === "category" ||
        key === "condition" ||
        key === "location"
      ) {
        fields[key] = value;
      }
    } else if (value instanceof File) {
      files.push(value);
    }
  }

  return { fields, files };
}

async function uploadToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "marketplace",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          }
        }
      )
      .end(buffer);
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseFormData(req);

    if (!fields.price)
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const validation = productSchema.safeParse({
      ...fields,
      price: parseFloat(fields.price),
      tags: fields.tags || [],
    });

    if (!validation.success) {
      console.error("Invalid data", validation.error.format());
      return NextResponse.json(
        { error: "Invalid data", issues: validation.error.format() },
        { status: 400 }
      );
    }

    const { title, description, price, category, condition, location, tags } =
      validation.data;

    const imageUrls = await Promise.all(
      files.map((file) => uploadToCloudinary(file))
    );

    if (imageUrls.length === 0) {
      console.error("At least one image is required");
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    const { id } = session.user;

    const profile = await GetProfile(id);

    if (!profile) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { sellerProfile } = profile;

    if (!sellerProfile) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id: sellerId } = sellerProfile;

    const newProduct = await prisma.product.create({
      data: {
        name: title,
        description,
        price,
        category,
        condition,
        pickupLocation: location,
        tags,
        photos: imageUrls,
        seller: { connect: { id: sellerId } },
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
