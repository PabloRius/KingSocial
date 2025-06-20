import { auth } from "@/auth";
import { GetProfile } from "@/lib/actions/profile";
import prisma from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const profile = await GetProfile(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    const { id } = profile;

    const { plan } = await req.json();

    await prisma.sellerProfile.create({
      data: {
        user: { connect: { id } },
        plan: plan || "basic",
      },
    });
    return NextResponse.json({ status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An error occurred while creating seller profile." },
      { status: 500 }
    );
  }
}
