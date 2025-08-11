"use server";

import ProfilePage from "@/components/profile-page";

export default async function ProfileServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfilePage id={id} />;
}
