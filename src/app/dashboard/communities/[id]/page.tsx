"use client";

import { JoinRequest } from "@/components/join-request";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/context/session-context";
import { Community, CommunityMessage } from "@/lib/models/Community";
import { EventParticipant } from "@/lib/models/Event";
import {
  approveJoinRequest,
  deleteCommunityById,
  getCommunityById,
  hasRequested,
  joinCommunity,
  sendJoinRequest,
  sendMessage,
} from "@/lib/store/community";
import { joinEvent } from "@/lib/store/event";
import { getColorFromId } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Crown,
  ImageIcon,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  MoreVertical,
  Send,
  Settings,
  Shield,
  Trash2,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const {
    session,
    loading,
    handlers: { reload },
  } = useSession();
  const [community, setCommunity] = useState<Community | undefined | null>(
    undefined
  );
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState({
    chat: true,
    news: true,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Settings state
  const [communitySettings, setCommunitySettings] = useState({
    name: community?.name || "" || "",
    description: community?.description || "",
    coverImage: community?.coverImage || "",
    mode: community?.mode || "",
    whoCanCreateEvents: "admins-only" as
      | "admins-only"
      | "moderators-and-admins"
      | "all-members",
    requireApproval: false,
    allowInvites: true,
    showMemberList: true,
  });

  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  const [joinedEventsMock, setJoinedEventsMock] = useState<
    Array<EventParticipant>
  >(session?.profile.events_attendee || []);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { id } = await params;
        if (!id) return;
        const fetchedCommunity = await getCommunityById(id);
        setCommunity(fetchedCommunity || null);
        if (fetchedCommunity)
          setCommunitySettings((prev) => ({
            ...prev,
            name: fetchedCommunity.name,
            description: fetchedCommunity.description,
            coverImage: fetchedCommunity.coverImage,
            mode: fetchedCommunity.mode,
          }));
      } catch (error) {
        console.error(error);
        setCommunity(null);
      }
    };
    initPage();
  }, [params]);

  useEffect(() => {
    if (session?.profile.events_attendee)
      setJoinedEventsMock(session.profile.events_attendee);
  }, [session?.profile.events_attendee]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center w-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session?.profile) {
    redirect("/");
  }

  if (community === undefined) {
    return (
      <div className="flex flex-1 h-full w-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (community === null) {
    return redirect("/dashboard/communities");
  }

  const handleJoinEvent = async (eventId: string) => {
    try {
      const res = await joinEvent(eventId, session.profile.id);
      if (res) {
        setJoinedEventsMock((prev) => [
          ...prev,
          {
            eventId: eventId,
            id: crypto.randomUUID(),
            role: "attendee",
            userId: session.profile.id,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveJoinRequest = async (requestId: string) => {
    try {
      const approvedRequest = community.joinRequests.find(
        (r) => r.id === requestId
      );
      if (!approvedRequest) return;

      const res = await approveJoinRequest(requestId);

      if (!res) {
        setCommunity((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            joinRequests: [...prev.joinRequests, approvedRequest],
            members: prev.members.filter(
              (m) => m.user.id !== approvedRequest.user.id
            ),
          };
        });
        alert("Failed to approve join request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Member
          </Badge>
        );
    }
  };

  const memberData = session.profile.communities.find(
    ({ community: commData }) => commData.id === community.id
  );

  const memberRole = memberData?.role;
  const memberId = memberData?.id;

  const isPrivate = community.mode === "private";

  const canManageCommunity =
    memberRole === "admin" || memberRole === "moderator";

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending || !memberId) return;

    try {
      setIsSending(true);

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        content: trimmed,
        senderId: memberId,
        createdAt: new Date(),
        sender: {
          role: memberRole || "member",
          user: {
            username: session?.profile?.username || "You",
            name: session?.profile?.name || "",
            image: session?.profile?.image || "",
          },
        },
      };

      setCommunity((prev) =>
        prev ? { ...prev, chat: [...prev.chat, optimisticMessage] } : prev
      );

      setMessage("");

      const newMessage = await sendMessage(trimmed, community.id, memberId);

      setCommunity((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          chat: prev.chat.map((m) =>
            m.id === tempId ? newMessage : m
          ) as CommunityMessage[],
        };
      });

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendJoinRequest = async () => {
    try {
      const hasRequestedRes = await hasRequested(
        session.profile.id,
        community.id
      );
      if (hasRequestedRes) {
        return alert("You have already requested to join this community.");
      }
      setSending(true);
      const res = await sendJoinRequest(community.id, joinRequestMessage);

      if (!res) throw new Error("Failed to send join request");

      setShowDialog(false);
      setMessage("");
      alert("Join request sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while sending your join request.");
    } finally {
      setSending(false);
    }
  };

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = () => {
    console.log("Saving settings:", communitySettings);
    setSettingsOpen(false);
  };

  const handleDeleteCommunity = async () => {
    const result = await deleteCommunityById(community.id);
    if (result) {
      setDeleteConfirmOpen(false);
      reload();
      router.push("/dashboard/communities");
    } else {
      toast.error("Error deleting the community");
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleJoinClick = async () => {
    try {
      const res = await joinCommunity(community.id);
      if (!res)
        return toast.error("Error joining the community, try again later");
      await reload();
      return toast.success("Successfully joined the community");
    } catch (err) {
      console.error(err);
      return toast.error("Error joining the community, try again later");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with Cover Image */}
      <div className="relative h-64 md:h-80 w-full">
        <Image
          src={community.coverImage || "/placeholder.svg"}
          alt={community.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <Button
          onClick={() => router.push("/dashboard/communities")}
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Settings Button (Admin/Moderator only) */}
        {canManageCommunity && (
          <Button
            onClick={() => setSettingsOpen(true)}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}

        {!memberId && !isPrivate && (
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleJoinClick();
            }}
            size="sm"
            className="absolute top-4 right-4 bg-gradient-to-r from-celestial-blue to-picton-blue text-white hover:opacity-90 rounded-full"
          >
            Join
          </Button>
        )}

        {/* Community Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            {/* <Badge className="mb-2 bg-white/20 backdrop-blur-sm text-white border-white/30">
              {community.category}
            </Badge> */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {community.name}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-2xl">
              {community.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{community.members.length.toLocaleString()} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(community.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!memberId && isPrivate ? (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <Lock className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            This community is private
          </h2>
          <p className="text-gray-600 max-w-md mb-6">
            You must send a join request to access{" "}
            <span className="font-semibold">{community.name}</span>’s chat and
            members.
          </p>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Send Join Request
          </Button>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Join Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Label htmlFor="message">Optional message</Label>
                <Textarea
                  id="message"
                  value={joinRequestMessage}
                  onChange={(e) => setJoinRequestMessage(e.target.value)}
                  placeholder="Tell the admins why you'd like to join..."
                  rows={4}
                  className="resize-none"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendJoinRequest}
                  disabled={sending}
                  className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                >
                  {sending ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-start bg-transparent border-0 h-auto p-0">
                  <TabsTrigger
                    value="chat"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-celestial-blue rounded-none bg-transparent px-6 py-4"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="events"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-celestial-blue rounded-none bg-transparent px-6 py-4"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Events
                  </TabsTrigger>
                  <TabsTrigger
                    value="members"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-celestial-blue rounded-none bg-transparent px-6 py-4"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} className="w-full">
              {/* Chat Tab */}
              <TabsContent value="chat" className="mt-0">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Community Chat
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setNotificationsEnabled((prev) => ({
                          ...prev,
                          chat: !prev.chat,
                        }))
                      }
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {notificationsEnabled.chat ? (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications On
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 mr-2" />
                          Notifications Off
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Messages */}
                  {community.chat && community.chat.length > 0 ? (
                    <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto p-2">
                      {community.chat.map((msg) => {
                        const {
                          content,
                          createdAt,
                          id: msgId,
                          senderId,
                          sender,
                        } = msg;
                        const { role, user } = sender || {};
                        const { image, name, username } = user || {};

                        const isOwnMessage = senderId === memberId;
                        const messageColor = senderId
                          ? getColorFromId(senderId)
                          : "hsl(79 4.8% 60%)";

                        return (
                          <div
                            key={msgId}
                            className={`flex items-start gap-3 ${
                              isOwnMessage ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* Avatar (hide for your own messages) */}
                            {!isOwnMessage && (
                              <UserAvatar
                                avatarUrl={image || undefined}
                                name={name || username}
                                className="flex-shrink-0"
                              />
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`flex flex-col max-w-[70%] ${
                                isOwnMessage
                                  ? "items-end text-right"
                                  : "items-start text-left"
                              }`}
                            >
                              {!isOwnMessage && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className="font-semibold text-sm"
                                    style={{ color: messageColor }}
                                  >
                                    {username}
                                  </span>
                                  {role !== "member" && getRoleBadge(role)}
                                  <span className="text-xs text-gray-400">
                                    {formatTime(createdAt)}
                                  </span>
                                </div>
                              )}

                              <div
                                className={`px-4 py-2 rounded-2xl shadow-sm ${
                                  isOwnMessage
                                    ? "bg-gradient-to-r from-celestial-blue to-picton-blue text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                <p className="break-words">{content}</p>
                              </div>

                              {/* Time below your own messages */}
                              {isOwnMessage && (
                                <span className="text-xs text-gray-400 mt-1">
                                  {formatTime(createdAt)}
                                </span>
                              )}
                            </div>

                            {/* Spacer to align layout */}
                            {isOwnMessage && (
                              <UserAvatar
                                avatarUrl={image || undefined}
                                name={name || username}
                                className="flex-shrink-0"
                              />
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex-1 text-center text-gray-500">
                      No messages yet, be the first one to interact with the
                      community!
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Community Events
                    </h2>
                    {canManageCommunity && (
                      <Link href={`${community.id}/events/create`}>
                        <Button className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                          <Calendar className="w-4 h-4 mr-2" />
                          Create Event
                        </Button>
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {community.events.map((event) => {
                      const isAttending = joinedEventsMock.some(
                        (ev) => ev.eventId === event.id
                      );

                      return (
                        <Card
                          key={event.id}
                          className="overflow-hidden group hover:shadow-lg transition-all"
                        >
                          {/* --- Event Cover --- */}
                          <div className="relative h-48 w-full">
                            <Image
                              src={event.coverImage || "/placeholder.png"}
                              alt={event.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <Badge
                              className={`absolute top-3 right-3 ${
                                event.location_format === "online"
                                  ? "bg-green-500 text-white"
                                  : "bg-blue-500 text-white"
                              }`}
                            >
                              {event.location_format === "online"
                                ? "🌐 Online"
                                : "📍 In Person"}
                            </Badge>
                          </div>

                          {/* --- Card Body --- */}
                          <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {event.description}
                            </p>

                            {/* --- Date & Location --- */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDate(new Date(event.date))}
                                  {event.start_time
                                    ? ` at ${event.start_time}`
                                    : " all day"}
                                </span>
                              </div>
                              {event.location_format === "in-person" && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>

                            {/* --- Capacity Bar --- */}
                            {event.capacity && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                  <span>
                                    {event._count.participants} attending
                                  </span>
                                  <span>
                                    {event.capacity - event._count.participants}{" "}
                                    spots left
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-celestial-blue to-picton-blue h-2 rounded-full transition-all"
                                    style={{
                                      width: `${
                                        (event._count.participants /
                                          event.capacity) *
                                        100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* --- Buttons --- */}
                            <div className="flex gap-2">
                              <Link href={`/dashboard/events/${event.id}`}>
                                <Button className="flex-1 bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                                  View Details
                                </Button>
                              </Link>

                              <Button
                                variant={isAttending ? "outline" : "default"}
                                disabled={isAttending}
                                onClick={() => handleJoinEvent(event.id)}
                                className={`flex-1 ${
                                  isAttending
                                    ? "border-green-500 text-green-600 hover:bg-green-50"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }`}
                              >
                                {isAttending ? "Joined" : "Join Event"}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Members ({community.members.length})
                    </h2>
                    {canManageCommunity && (
                      <Button className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Members
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Other Members */}
                    {community.members.map(({ user, role, joinedAt }) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              avatarUrl={user.image || undefined}
                              name={user.name || user.username}
                            />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                @{user.username}
                              </p>
                            </div>
                          </div>
                          {canManageCommunity && role === "member" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          {getRoleBadge(role)}
                          <span className="text-xs text-gray-500">
                            Joined {formatDate(joinedAt)}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* ✅ Join Requests Section */}
                  {canManageCommunity && community.joinRequests.length > 0 && (
                    <div className="pt-10 border-t">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Pending Join Requests ({community.joinRequests.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {community.joinRequests.map(
                          ({ id, user, message, createdAt }) => (
                            <JoinRequest
                              key={id}
                              id={id}
                              user={user}
                              message={message || undefined}
                              createdAt={createdAt}
                              handleApproveJoinRequest={
                                handleApproveJoinRequest
                              }
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Community Settings</DialogTitle>
            <DialogDescription>
              Manage your community settings and preferences
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={settingsTab}
            onValueChange={setSettingsTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="community-name">Community Name</Label>
                  <Input
                    id="community-name"
                    value={communitySettings.name}
                    onChange={(e) =>
                      setCommunitySettings({
                        ...communitySettings,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter community name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community-description">Description</Label>
                  <Textarea
                    id="community-description"
                    value={communitySettings.description}
                    onChange={(e) =>
                      setCommunitySettings({
                        ...communitySettings,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your community"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-celestial-blue transition-colors">
                      {coverImagePreview || communitySettings.coverImage ? (
                        <Image
                          src={
                            coverImagePreview ||
                            communitySettings.coverImage ||
                            "/placeholder.svg"
                          }
                          alt="Cover preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-sm">Upload cover image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended size: 1200x400px (max 5MB)
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Permissions Settings */}
            <TabsContent value="permissions" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Content Creation</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Who can create events?</Label>
                        <p className="text-sm text-gray-500">
                          Control who can organize community events
                        </p>
                      </div>
                      <select
                        value={communitySettings.whoCanCreateEvents}
                        onChange={(e) =>
                          setCommunitySettings({
                            ...communitySettings,
                            whoCanCreateEvents: e.target
                              .value as typeof communitySettings.whoCanCreateEvents,
                          })
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-celestial-blue"
                      >
                        <option value="admins-only">Admins Only</option>
                        <option value="moderators-and-admins">
                          Moderators & Admins
                        </option>
                        <option value="all-members">All Members</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Privacy & Access</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="require-approval">
                        Require approval to join
                      </Label>
                      <p className="text-sm text-gray-500">
                        New members must be approved by admins
                      </p>
                    </div>
                    <Switch
                      id="require-approval"
                      checked={communitySettings.requireApproval}
                      onCheckedChange={(checked) =>
                        setCommunitySettings({
                          ...communitySettings,
                          requireApproval: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="allow-invites">
                        Allow members to invite others
                      </Label>
                      <p className="text-sm text-gray-500">
                        Members can send invite links
                      </p>
                    </div>
                    <Switch
                      id="allow-invites"
                      checked={communitySettings.allowInvites}
                      onCheckedChange={(checked) =>
                        setCommunitySettings({
                          ...communitySettings,
                          allowInvites: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="show-member-list">
                        Show member list to everyone
                      </Label>
                      <p className="text-sm text-gray-500">
                        All members can see the full member list
                      </p>
                    </div>
                    <Switch
                      id="show-member-list"
                      checked={communitySettings.showMemberList}
                      onCheckedChange={(checked) =>
                        setCommunitySettings({
                          ...communitySettings,
                          showMemberList: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Danger Zone */}
            <TabsContent value="danger" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">
                          Delete Community
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          Once you delete this community, there is no going
                          back. This action will permanently delete all
                          community data, including messages, events, and member
                          information.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSettingsOpen(false);
                          setDeleteConfirmOpen(true);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Community
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {settingsTab !== "danger" && (
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
              >
                Save Changes
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Delete Community
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you absolutely sure you want to delete{" "}
              <strong>{community.name}</strong>? This action cannot be undone
              and will permanently delete all the community data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCommunity}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
