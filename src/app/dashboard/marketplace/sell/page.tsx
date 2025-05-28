"use client";

import type React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Eye, Plus, PoundSterling, Tag, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Home & Dorm",
  "Sports & Recreation",
  "Tickets & Events",
  "Art & Crafts",
  "Other",
];

const conditions = [
  { value: "new", label: "New", description: "Brand new, never used" },
  {
    value: "like-new",
    label: "Like New",
    description: "Barely used, excellent condition",
  },
  { value: "good", label: "Good", description: "Used but well maintained" },
  {
    value: "fair",
    label: "Fair",
    description: "Shows wear but fully functional",
  },
  { value: "poor", label: "Poor", description: "Heavy wear, may need repairs" },
];

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    tags: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      // For demo purposes, we'll use placeholder URLs
      const newImages = Array.from(files).map(
        (_, index) =>
          `/placeholder.svg?height=300&width=300&text=Image${
            images.length + index + 1
          }`
      );
      setImages((prev) => [...prev, ...newImages].slice(0, 10)); // Max 10 images
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 5
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to marketplace with success message
    window.location.href = "/marketplace?listed=success";
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.price &&
      formData.category &&
      formData.condition &&
      formData.location &&
      images.length > 0
    );
  };

  if (showPreview) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <main className="flex-1 container py-8 px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Preview Your Listing</h1>

            <Card className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Images */}
                <div>
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <Image
                      src={images[0] || "/placeholder.svg"}
                      alt={formData.title}
                      width={400}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1, 5).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square overflow-hidden rounded"
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${formData.title} ${index + 2}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{formData.title}</h2>
                    <p className="text-3xl font-bold text-celestial-blue-500 mt-2">
                      ${formData.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full">
                      {
                        conditions.find((c) => c.value === formData.condition)
                          ?.label
                      }
                    </Badge>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.location}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Category</h3>
                    <Badge variant="secondary">{formData.category}</Badge>
                  </div>

                  {formData.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-celestial-blue-600 dark:text-celestial-blue-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="You"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-celestial-blue-400 to-picton-blue-500 text-white">
                        YU
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">You</p>
                      <p className="text-xs text-gray-500">New Seller</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1"
              >
                Edit Listing
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                {isSubmitting ? "Publishing..." : "Publish Listing"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <main className="flex-1 container py-8 px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fill out the details below to list your item on the marketplace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos
                </CardTitle>
                <CardDescription>
                  Add up to 10 photos of your item. The first photo will be the
                  main image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}

                  {images.length < 10 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-celestial-blue-500 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., MacBook Pro 2021, Physics Textbook, Desk Lamp..."
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item's condition, features, and any other relevant details..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative mt-1">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            handleInputChange("price", "");
                            return;
                          }

                          const parsed = parseFloat(value);
                          if (isNaN(parsed) || parsed < 0) return;

                          handleInputChange("price", value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (
                            value === "" ||
                            isNaN(Number(value)) ||
                            Number(value) < 0
                          ) {
                            handleInputChange("price", "0");
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Pickup Location *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., City Hall, Penrhyn Road Campus, Central London, etc"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem
                            key={condition.value}
                            value={condition.value}
                          >
                            <div>
                              <div className="font-medium">
                                {condition.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {condition.description}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Add up to 5 tags to help buyers find your item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        #{tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(true)}
                disabled={!isFormValid()}
                className="flex-1"
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                {isSubmitting ? "Publishing..." : "Publish Listing"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
