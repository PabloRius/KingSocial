"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/context/session-context";
import { deleteProfileById } from "@/lib/store/profile";
import {
  ArrowRight,
  Camera,
  DollarSign,
  Edit3,
  Eye,
  Heart,
  Loader2,
  MessageCircle,
  Package,
  Save,
  Star,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const currentUser = {
  isSellerActive: true,
  sellerPlan: "Pro",
  stats: {
    totalSales: 15,
    totalEarnings: 1240,
    rating: 4.7,
    reviewCount: 28,
    activeListings: 5,
  },
  communityStats: {
    posts: 42,
    followers: 156,
    following: 89,
    likes: 324,
    comments: 187,
    shares: 45,
  },
};

export default function ProfilePage() {
  const {
    loading,
    session,
    handlers: { logout },
  } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: session?.profile.name,
    username: session?.profile.username,
    biography: session?.profile.biography,
    instagram: session?.profile.instagram,
    linkedin: session?.profile.linkedin,
  });
  const [imagesData, setImagesData] = useState<{
    image: string | undefined;
    imageFile: File | null;
    coverImage: string | undefined;
    coverImageFile: File | null;
  }>({
    image: session?.profile.image || undefined,
    imageFile: null,
    coverImage: session?.profile.coverImage || undefined,
    coverImageFile: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: session.profile.name,
        username: session.profile.username,
        email: session.profile.email,
        biography: session.profile.biography,
        instagram: session.profile.instagram,
        linkedin: session.profile.linkedin,
        image: session.profile.image,
        coverImage: session.profile.coverImage,
      }));
      setImagesData({
        image: session.profile.image || undefined,
        imageFile: null,
        coverImage: session.profile.coverImage || undefined,
        coverImageFile: null,
      });
    }
  }, [loading, session]);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!session) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name || session.profile.name || "");
      data.append(
        "username",
        formData.username || session.profile.username || ""
      );
      data.append(
        "biography",
        formData.biography || session.profile.biography || ""
      );
      data.append(
        "instagram",
        formData.instagram || session.profile.instagram || ""
      );
      data.append(
        "linkedin",
        formData.linkedin || session.profile.linkedin || ""
      );
      data.append("image", imagesData.imageFile || "");
      data.append("coverImage", imagesData.coverImageFile || "");
      const res = await fetch("/api/profile", {
        method: "PUT",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: session?.profile.name,
      username: session.profile.username,
      biography: session.profile.biography,
      instagram: session?.profile.instagram,
      linkedin: session?.profile.linkedin,
    });
    setImagesData({
      image: session.profile.image || undefined,
      imageFile: null,
      coverImage: session.profile.coverImage || undefined,
      coverImageFile: null,
    });
    setIsEditing(false);
  };

  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "coverImage"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const imagePreview = URL.createObjectURL(file);
    if (type === "image") {
      setImagesData((prev) => ({
        ...prev,
        image: imagePreview,
        imageFile: file,
      }));
    } else if (type === "coverImage") {
      setImagesData((prev) => ({
        ...prev,
        coverImage: imagePreview,
        coverImageFile: file,
      }));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (
        !confirm(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      ) {
        return;
      }
      await deleteProfileById(session.profile.id);
      logout();
    } catch (error) {
      console.error("Error deleting account: ", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6">
      <main className="flex-1 mx-auto container py-6">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-celestial-blue-400 to-picton-blue-500 relative group">
            {imagesData.coverImage && (
              <Image
                src={imagesData.coverImage}
                alt="Cover"
                width={800}
                height={200}
                className="object-cover w-full h-full"
              />
            )}

            {isEditing && (
              <>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, "coverImage")}
                  aria-label="Upload cover image"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 transition-opacity"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change Cover
                </Button>
              </>
            )}
            <div className="absolute top-1/2 -translate-y-1/2 px-6">
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                <div className="relative group">
                  <UserAvatar
                    avatarUrl={session.profile.image || undefined}
                    name={session.profile.name || ""}
                    className="text-3xl h-32 w-32"
                  />
                  {isEditing && (
                    <>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, "image")}
                        aria-label="Upload avatar image"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">
                          {session.profile.name}
                        </h1>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        @{session.profile.username}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {currentUser.stats.rating}
                          </span>
                          <span>({currentUser.stats.reviewCount} reviews)</span>
                        </div>
                        <span>•</span>
                        <span>
                          Joined{" "}
                          {new Date(session.profile.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
            <Button variant="outline" asChild>
              <Link href={`/profile/${session.profile.username}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="seller">Seller Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your personal information and bio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username || ""}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={session.profile.email || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About & Social Links</CardTitle>
                  <CardDescription>
                    Tell others about yourself and connect your social accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.biography || ""}
                      onChange={(e) =>
                        handleInputChange("biography", e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1 min-h-[100px]"
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram || ""}
                      onChange={(e) =>
                        handleInputChange("instagram", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="@username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin || ""}
                      onChange={(e) =>
                        handleInputChange("linkedin", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
              {/* Seller Stats Summary */}
              {currentUser.isSellerActive && (
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-celestial-blue-50 to-picton-blue-50 dark:from-celestial-blue-900/10 dark:to-picton-blue-900/10"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Seller Dashboard
                          </CardTitle>
                          <CardDescription>
                            Your marketplace performance
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 text-white">
                        {currentUser.sellerPlan}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-celestial-blue-600">
                          {currentUser.stats.totalSales}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Items Sold
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-celestial-blue-600">
                          ${currentUser.stats.totalEarnings}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Earned
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">
                          {currentUser.stats.activeListings}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Active Listings
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-semibold">
                            {currentUser.stats.rating}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {currentUser.stats.reviewCount} Reviews
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
                    >
                      <Link href="/dashboard/marketplace/your-listings">
                        View Seller Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Community Stats Summary */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10"></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Community Hub</CardTitle>
                        <CardDescription>
                          Your social engagement
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>Active</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentUser.communityStats.posts}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Posts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentUser.communityStats.followers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Followers
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-sm font-semibold">
                          {currentUser.communityStats.likes}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Likes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        <span className="text-sm font-semibold">
                          {currentUser.communityStats.comments}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Comments
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">
                        {currentUser.communityStats.following}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Following
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Link href="/community">
                      View Community Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="seller" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seller Profile</CardTitle>
                  <CardDescription>
                    Manage your seller account and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-celestial-blue-50 to-picton-blue-50 dark:from-celestial-blue-900/20 dark:to-picton-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-semibold">
                        Current Plan: {currentUser.sellerPlan}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {currentUser.sellerPlan === "Pro"
                          ? "$9.99/month"
                          : "Free"}
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/seller-pricing">
                        {currentUser.sellerPlan === "Pro"
                          ? "Manage Plan"
                          : "Upgrade"}
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      asChild
                    >
                      <Link href="/sell">
                        <Package className="mr-2 h-4 w-4" />
                        Create New Listing
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Sales Analytics
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Customer Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Seller Preferences</CardTitle>
                  <CardDescription>
                    Configure how you want to handle sales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Preferred Meeting Locations</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        "Campus Center",
                        "Library",
                        "Student Union",
                        "Business School",
                      ].map((location) => (
                        <div
                          key={location}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={location}
                            className="rounded"
                            defaultChecked
                          />
                          <Label htmlFor={location} className="text-sm">
                            {location}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Auto-Response Message</Label>
                    <Textarea
                      className="mt-1"
                      placeholder="Hi! Thanks for your interest in my item. I'll get back to you soon!"
                      defaultValue="Hi! Thanks for your interest in my item. I'll get back to you soon!"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
