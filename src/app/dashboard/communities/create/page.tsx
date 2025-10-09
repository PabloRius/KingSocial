"use client";

import type React from "react";

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
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary_utils";
import {
  CommunityCreatePayload,
  communityCreateValidator,
} from "@/lib/models/Community";
import { createCommunity } from "@/lib/store/community";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCommunityPage() {
  const { session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CommunityCreatePayload>({
    name: "",
    description: "",
    coverImage: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CommunityCreatePayload, string>>
  >({});

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, coverImage: "Image must be less than 5MB" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, coverImage: "File must be an image" });
      return;
    }

    setSelectedFile(file);

    const imagePreview = URL.createObjectURL(file);
    setPreview(imagePreview);

    setErrors({ ...errors, coverImage: undefined });
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setFormData({ ...formData, coverImage: "" });
  };

  const handleInputChange = (
    field: keyof CommunityCreatePayload,
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.profile) return;

    setIsSubmitting(true);
    let url: string | null = null;

    try {
      if (selectedFile) {
        url = await uploadToCloudinary(selectedFile, "communities");
        formData.coverImage = url;
      }

      const result = communityCreateValidator.safeParse(formData);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({
          name: fieldErrors.name?.[0],
          description: fieldErrors.description?.[0],
          coverImage: fieldErrors.coverImage?.[0],
        });

        if (url) await deleteFromCloudinary(url, "communities");
        return;
      }

      const newCommunity = await createCommunity(formData, session.profile.id);
      if (!newCommunity) throw Error("Error creating the community");

      router.push(newCommunity.id);
    } catch (err) {
      console.error(err);
      if (url) await deleteFromCloudinary(url, "communities");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/community">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-celestial-blue to-picton-blue bg-clip-text text-transparent">
              Create Community
            </h1>
            <p className="text-sm text-muted-foreground">
              Build a space for people with shared interests
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <Card className="border-celestial-blue/20 overflow-hidden">
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>
                Choose an image that represents your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!preview ? (
                <label
                  htmlFor="cover-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gradient-to-br from-celestial-blue/5 to-purple-50 hover:from-celestial-blue/10 hover:to-purple-100 border-celestial-blue/30 hover:border-celestial-blue/50 transition"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className="w-8 h-8 mb-2 text-celestial-blue" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    id="cover-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative group">
                  <Image
                    width={800}
                    height={400}
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              )}
              {errors.coverImage && (
                <p className="text-sm text-destructive mt-2">
                  {errors.coverImage}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-celestial-blue/20">
            <CardHeader>
              <CardTitle>Community Details</CardTitle>
              <CardDescription>
                Give your community a name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Tech Innovators"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe your community..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Link href="/community">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-celestial-blue to-picton-blue"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Create Community"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
