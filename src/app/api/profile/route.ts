import { auth } from "@/auth";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary_utils";
import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type ProfileFormFields = {
  name?: string;
  username?: string;
  biography?: string;
  instagram?: string;
  linkedin?: string;
  image?: File | null;
  coverImage?: File | null;
};

async function parseFormData(req: NextRequest) {
  const formData = await req.formData();
  const data: ProfileFormFields = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      if (
        key === "name" ||
        key === "username" ||
        key === "biography" ||
        key === "instagram" ||
        key === "linkedin"
      ) {
        data[key] = value;
      }
    } else if (value instanceof File) {
      if (key === "image" || key === "coverImage") {
        data[key] = value;
      }
    }
  }

  return data;
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data: ProfileFormFields = await parseFormData(req);

  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { image: true, coverImage: true },
  });

  let imageUrl: string | null = null;
  let coverImageUrl: string | null = null;

  if (data.image) {
    if (existingUser?.image) {
      await deleteFromCloudinary(existingUser.image, "profiles/images");
    }
    imageUrl = await uploadToCloudinary(data.image, "profiles/images");
  }

  if (data.coverImage) {
    if (existingUser?.coverImage) {
      await deleteFromCloudinary(existingUser.coverImage, "profiles/covers");
    }
    coverImageUrl = await uploadToCloudinary(
      data.coverImage,
      "profiles/covers"
    );
  }

  const updateData: Prisma.UserUpdateInput = {
    ...(data.name && { name: data.name }),
    ...(data.username && { username: data.username }),
    ...(data.biography && { biography: data.biography }),
    ...(data.instagram && { instagram: data.instagram }),
    ...(data.linkedin && { linkedin: data.linkedin }),
    ...(imageUrl && { image: imageUrl }),
    ...(coverImageUrl && { coverImage: coverImageUrl }),
  };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Failed to update profile, check server logs", {
      status: 500,
    });
  }
}
