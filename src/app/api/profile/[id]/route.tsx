import { auth } from "@/auth";
import { getProfileById } from "@/lib/store/profile";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  const { id } = await params;

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!id) {
    return new NextResponse("User ID is required.", { status: 400 });
  }

  try {
    const profile = await getProfileById(id);

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Failed to fetch profile, check server logs", {
      status: 500,
    });
  }
}
