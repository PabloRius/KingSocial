"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/context/session-context";
import { Event } from "@/lib/models/Event";
import { getEventById, messageAttendees } from "@/lib/store/event";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Crown,
  Edit,
  Globe,
  Loader2,
  MapPin,
  MessageSquare,
  MoreVertical,
  Share2,
  Shield,
  Trash2,
  Users,
  UserX,
} from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, loading } = useSession();
  const router = useRouter();
  const [event, setEvent] = useState<Event | undefined | null>(undefined);
  const [isAttending, setIsAttending] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToAll, setMessageToAll] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { id: eventId } = await params;
        const eventData = await getEventById(eventId);
        setEvent(eventData || null);
        if (session?.profile && eventData)
          setIsAttending(
            eventData?.participants.some(
              (part) => part.user.id === session?.profile.id
            )
          );
      } catch (err) {
        console.error(err);
        setEvent(null);
      }
    };
    initPage();
  }, [params, session?.profile]);

  if (loading || event === undefined) {
    return (
      <div className="flex flex-1 w-full h-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!session?.profile) {
    redirect("/");
  }
  if (!event) {
    return (
      <div className="flex flex-1 w-full h-full justify-center items-center">
        {"Event doesn't exist or has been removed"}
      </div>
    );
  }

  const isCommunityMember = session.profile.events_attendee.some(
    (attendee) => attendee.eventId === event.id
  );

  if (!event.public && !isCommunityMember) {
    const community = event.community;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="flex justify-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            This event is private
          </h2>
          <p className="text-gray-600">
            You must be a member of{" "}
            <span className="font-semibold text-celestial-blue">
              {community.name}
            </span>{" "}
            to view or join this event.
          </p>

          {/* Community Preview */}
          <div className="border rounded-xl overflow-hidden shadow bg-white">
            <div className="relative h-40 w-full">
              <Image
                src={community.coverImage || "/placeholder.png"}
                alt={community.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-lg">{community.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">
                {community.description}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() =>
                router.push(`/dashboard/communities/${community.id}`)
              }
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90 w-full sm:w-auto"
            >
              <Users className="w-4 h-4" />
              Visit Community
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center justify-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOrganizer = session.profile.id === event.creator?.user.id;
  const canManageEvent =
    isOrganizer ||
    event.participants.some(
      (part) =>
        part.user.id === session.profile.id &&
        (part.role === "admin" || part.role === "moderator")
    );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleRSVP = () => {
    setIsAttending(!isAttending);
  };

  const handleRemoveAttendee = (attendeeId: string) => {
    // In a real app, call API to remove attendee
    console.log("Removing attendee:", attendeeId);
  };

  const handleSendMessageToAll = async () => {
    if (!messageToAll.trim()) return;

    setSendingMessage(true);

    const res = await messageAttendees(
      messageToAll,
      event.id,
      session.profile.id
    );
    if (!res) {
      toast.error("Error sending the mass message");
      return;
    }
    setSendingMessage(false);
    setShowMessageModal(false);
  };

  const handleDeleteEvent = () => {
    // In a real app, call API to delete event
    console.log("Deleting event:", event.id);
    router.push(`/dashboard/communities`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/events/${event.id}`;
    navigator.clipboard.writeText(url);
    toast.info("Event URL copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Cover Image */}
      <div className="relative h-80 md:h-96 w-full">
        <Image
          src={event.coverImage || "/placeholder.svg"}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </Button>

          {canManageEvent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/events/${event.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAttendeesModal(true)}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Attendees
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowMessageModal(true)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message All Attendees
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Event Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge
                className={`${
                  event.location_format === "online"
                    ? "bg-green-500/90 text-white"
                    : "bg-blue-500/90 text-white"
                } backdrop-blur-sm border-0`}
              >
                {event.location_format === "online" ? (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 mr-1" />
                    In Person
                  </>
                )}
              </Badge>
              {event.public && (
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  Public Event
                </Badge>
              )}
              {event.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {event.title}
            </h1>
            <p className="text-white/90 text-sm md:text-base mb-4">
              Hosted by{" "}
              <span className="font-semibold cursor-pointer hover:underline">
                {event.community.name}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details Card */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About this event
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {event.description}
              </p>

              {event.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-celestial-blue border-celestial-blue"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Attendees Preview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Attendees ({event._count.participants})
                </h2>
                {canManageEvent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAttendeesModal(true)}
                  >
                    View All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.participants.slice(0, 6).map((attendee) => (
                  <div key={attendee.id} className="flex items-center gap-2">
                    <UserAvatar
                      avatarUrl={attendee.user.image || undefined}
                      name={attendee.user.name || undefined}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {attendee.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        @{attendee.user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {event._count.participants > 6 && (
                <p className="text-sm text-gray-600 mt-4">
                  and {event._count.participants - 6} more attendee
                  {event._count.participants - 6 !== 1 ? "s" : ""}
                </p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <Card className="p-6 sticky top-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-celestial-blue" />
                  <div>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-600">
                      {event.all_day
                        ? "All day"
                        : event.start_time &&
                          `${formatTime(event.start_time)}${
                            event.end_time &&
                            ` - ${formatTime(
                              event.end_time || event.start_time
                            )}`
                          }`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-2 text-gray-700">
                  {event.location_format === "online" ? (
                    <Globe className="w-5 h-5 text-celestial-blue flex-shrink-0 mt-0.5" />
                  ) : (
                    <MapPin className="w-5 h-5 text-celestial-blue flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {event.location_format === "online"
                        ? "Online Event"
                        : "Location"}
                    </p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>

                {event.capacity && (
                  <>
                    <Separator />

                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-celestial-blue" />
                      <div className="flex-1">
                        <p className="font-semibold">Capacity</p>
                        <p className="text-sm text-gray-600">
                          {event._count.participants} / {event.capacity}{" "}
                          attending
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-celestial-blue to-picton-blue h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (event._count.participants / event.capacity) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                )}

                <Separator />

                <Button
                  onClick={handleRSVP}
                  className={`w-full ${
                    isAttending
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                  }`}
                  disabled={
                    isAttending ||
                    !!(
                      event.capacity &&
                      event._count.participants >= event.capacity
                    )
                  }
                >
                  {isAttending ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {"You're attending"}
                    </>
                  ) : event.capacity &&
                    event._count.participants >= event.capacity ? (
                    "Event Full"
                  ) : (
                    "RSVP"
                  )}
                </Button>
              </div>
            </Card>

            {/* Community Info Card */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Hosted by
              </h3>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto hover:bg-gray-50"
                onClick={() =>
                  router.push(`/dashboard/communities/${event.community.id}`)
                }
              >
                <div className="flex items-center gap-3 w-full p-3 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-celestial-blue to-picton-blue rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {event.community.name[0]}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">
                      {event.community.name}
                    </p>
                    <p className="text-sm text-gray-500">View community</p>
                  </div>
                </div>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Manage Attendees Modal */}
      <Dialog open={showAttendeesModal} onOpenChange={setShowAttendeesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Attendees</DialogTitle>
            <DialogDescription>
              View and manage all attendees for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <div className="space-y-2">
                {event.participants.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatarUrl={attendee.user.image || undefined}
                        name={attendee.user.name || undefined}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {attendee.user.name}
                          </p>
                          {attendee.role !== "participant" &&
                            getRoleBadge(attendee.role)}
                        </div>
                        <p className="text-sm text-gray-500">
                          @{attendee.user.username}
                        </p>
                      </div>
                    </div>
                    {canManageEvent &&
                      attendee.user.id !== session.profile.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttendee(attendee.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message All Attendees Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message All Attendees</DialogTitle>
            <DialogDescription>
              Send a message to all confirmed attendees (
              {event._count.participants}{" "}
              {event._count.participants === 1 ? "person" : "people"})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    This message will include event details
                  </p>
                  <p className="text-xs text-blue-700">
                    Recipients will see the event information along with your
                    message in their inbox
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                value={messageToAll}
                onChange={(e) => setMessageToAll(e.target.value)}
                placeholder="Type your message to all attendees..."
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {messageToAll.length} / 500 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageModal(false);
                setMessageToAll("");
              }}
              disabled={sendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessageToAll}
              disabled={!messageToAll.trim() || sendingMessage}
              className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
            >
              {sendingMessage ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send to All
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Delete Event
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to delete <strong>{event.title}</strong>?
              This action cannot be undone.
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li>All attendee RSVPs will be cancelled</li>
                <li>Attendees will be notified about the cancellation</li>
                <li>Event details will be permanently removed</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
