"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary_utils";
import { EventCreatePayload, eventCreateValidator } from "@/lib/models/Event";
import { createEvent } from "@/lib/store/event";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Globe,
  Info,
  Loader2,
  MapPin,
  Upload,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, loading } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EventCreatePayload>({
    title: "",
    description: "",
    coverImage: "",
    location_format: "in-person",
    location: "",
    date: new Date(),
    start_time: "",
    end_time: "",
    all_day: true,
    capacity: undefined,
    public: false,
    tags: [] as string[],
  });
  const [hasCapacity, setHasCapacity] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventCreatePayload, string>>
  >({});

  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session?.profile) {
    redirect("/");
  }

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

  const handleAddTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 5
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()],
      });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    let url: string | null = null;
    try {
      const { id: communityId } = await params;

      if (!communityId) throw new Error("Error parsing community id from url");

      if (selectedFile) {
        url = await uploadToCloudinary(selectedFile, "communities/events");
        formData.coverImage = url;
      }

      const result = eventCreateValidator.safeParse(formData);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([key, value]) => [
              key,
              value?.[0] || "",
            ])
          )
        );

        if (url) await deleteFromCloudinary(url, "communities/events");
        return;
      }

      const newCommunity = await createEvent(
        formData,
        session.profile.id,
        communityId
      );
      if (!newCommunity) throw Error("Error creating the event");

      router.push(`/dashboard/communities/${communityId}`);
    } catch (err) {
      console.error(err);
      if (url) await deleteFromCloudinary(url, "communities/events");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    return `${text.length}/${max}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create Event
                </h1>
                <p className="text-sm text-gray-500">
                  Create a new event for your community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Basic Information */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Basic Information
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Tell attendees what your event is about
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., AI Workshop: Getting Started with Neural Networks"
                  maxLength={100}
                  className={errors.title ? "border-red-500" : ""}
                />
                <div className="flex justify-between">
                  {errors.title ? (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Choose a clear and descriptive title
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {getCharacterCount(formData.title, 100)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your event, what attendees will learn or experience, and any prerequisites..."
                  rows={6}
                  maxLength={1000}
                  className={errors.description ? "border-red-500" : ""}
                />
                <div className="flex justify-between">
                  {errors.description ? (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      Provide details about your event
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {getCharacterCount(formData.description, 1000)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Event Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Add tags (e.g., workshop, networking, beginner-friendly)"
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    variant="outline"
                    disabled={formData.tags.length >= 5}
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gradient-to-r from-celestial-blue to-picton-blue text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Add up to 5 tags to help people find your event
                </p>
              </div>
            </div>
          </Card>

          {/* Location & Format */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Location & Format
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  How will attendees join your event?
                </p>
              </div>

              <RadioGroup
                value={formData.location_format}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    location_format: value as "in-person" | "online",
                  })
                }
              >
                <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-celestial-blue transition-colors cursor-pointer">
                  <RadioGroupItem value="in-person" id="in-person" />
                  <Label
                    htmlFor="in-person"
                    className="flex items-center gap-2 cursor-pointer flex-1 font-normal"
                  >
                    <MapPin className="w-5 h-5 text-celestial-blue" />
                    <div>
                      <div className="font-medium">In-Person Event</div>
                      <div className="text-sm text-gray-500">
                        Attendees will meet at a physical location
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-celestial-blue transition-colors cursor-pointer">
                  <RadioGroupItem value="online" id="online" />
                  <Label
                    htmlFor="online"
                    className="flex items-center gap-2 cursor-pointer flex-1 font-normal"
                  >
                    <Globe className="w-5 h-5 text-celestial-blue" />
                    <div>
                      <div className="font-medium">Online Event</div>
                      <div className="text-sm text-gray-500">
                        Attendees will join remotely via a link
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {formData.location_format === "in-person" && (
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Venue Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Innovation Hub, 123 Tech Street, San Francisco, CA"
                    className={errors.location ? "border-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Include full address or venue name and details
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Date & Time */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Date & Time</Label>
                <p className="text-sm text-gray-500 mt-1">
                  When will your event take place?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  Event Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !formData.date && "text-muted-foreground"
                      } ${errors.date ? "border-red-500" : ""}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        setFormData({ ...formData, date: date as Date })
                      }
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Switch
                  id="all-day"
                  checked={formData.all_day}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, all_day: checked })
                  }
                />
                <Label
                  htmlFor="all-day"
                  className="cursor-pointer flex items-center gap-2 font-normal"
                >
                  <Clock className="w-4 h-4 text-celestial-blue" />
                  <div>
                    <div className="font-medium">All-day event</div>
                    <div className="text-xs text-gray-600">
                      This event doesn&apos;t have a specific time
                    </div>
                  </div>
                </Label>
              </div>

              {!formData.all_day && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_time: e.target.value,
                        })
                      }
                      className={errors.start_time ? "border-red-500" : ""}
                    />
                    {errors.start_time && (
                      <p className="text-sm text-red-600">
                        {errors.start_time}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time (Optional)</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                    />
                    {errors.end_time && (
                      <p className="text-sm text-red-600 mt-2">
                        {errors.end_time}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Capacity & Access */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Capacity & Access
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Manage attendance and who can join
                </p>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                <Switch
                  id="has-capacity"
                  checked={hasCapacity}
                  onCheckedChange={(checked) => setHasCapacity(checked)}
                />
                <Label
                  htmlFor="has-capacity"
                  className="cursor-pointer flex items-center gap-2 font-normal"
                >
                  <Users className="w-4 h-4 text-celestial-blue" />
                  <div>
                    <div className="font-medium">Limit attendee capacity</div>
                    <div className="text-xs text-gray-600">
                      Set a maximum number of attendees
                    </div>
                  </div>
                </Label>
              </div>

              {hasCapacity && (
                <div className="space-y-2">
                  <Label htmlFor="capacity">Maximum Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 50"
                    className={errors.capacity ? "border-red-500" : ""}
                  />
                  {errors.capacity && (
                    <p className="text-sm text-red-600">{errors.capacity}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    How many people can attend this event?
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-4 border rounded-lg">
                  <Switch
                    id="open-to-public"
                    checked={formData.public}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, public: checked })
                    }
                  />
                  <Label
                    htmlFor="open-to-public"
                    className="cursor-pointer font-normal"
                  >
                    <div className="font-medium">Open to public</div>
                    <div className="text-xs text-gray-600">
                      Anyone can see and join this event, not just members
                    </div>
                  </Label>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Access Settings:</strong> If you don&apos;t make this
                  event public, only community members will be able to see and
                  join it.
                </div>
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
