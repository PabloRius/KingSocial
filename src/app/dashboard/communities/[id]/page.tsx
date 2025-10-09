"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { useSession } from "@/context/session-context";
import { Community, CommunityMessage } from "@/lib/models/Community";
import { getCommunityById, sendMessage } from "@/lib/store/community";
import { getColorFromId } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Clock,
  Crown,
  ImageIcon,
  Loader2,
  MapPin,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Send,
  Settings,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// const newsAnnouncements = [
//   {
//     id: "1",
//     authorId: "1",
//     title: "New Workshop Series Announcement",
//     content:
//       "We are excited to announce a new workshop series on AI and Machine Learning starting next month. Stay tuned for registration details!",
//     timestamp: "2024-03-10T14:00:00",
//     pinned: true,
//   },
//   {
//     id: "2",
//     authorId: "3",
//     title: "Community Guidelines Update",
//     content:
//       "We have updated our community guidelines to ensure a respectful and inclusive environment for all members. Please review them in the settings.",
//     timestamp: "2024-03-05T09:00:00",
//     pinned: false,
//   },
//   {
//     id: "3",
//     authorId: "1",
//     title: "March Meetup Recap",
//     content:
//       "Thank you to everyone who attended our March meetup! We had over 50 participants and great discussions. Check out the photos in the events section.",
//     timestamp: "2024-03-01T16:00:00",
//     pinned: false,
//   },
// ];

const events = [
  {
    id: "1",
    title: "AI Workshop: Getting Started with Neural Networks",
    description:
      "Learn the basics of neural networks and build your first model.",
    coverImage: "/tech-meetup.png",
    date: "2024-04-15",
    time: "18:00",
    location: "Virtual Event",
    attendees: 45,
    capacity: 100,
    type: "online" as const,
  },
  {
    id: "2",
    title: "Tech Innovators Monthly Meetup",
    description:
      "Monthly networking event for tech professionals and enthusiasts.",
    coverImage: "/virtual-workshop.png",
    date: "2024-04-20",
    time: "19:00",
    location: "Innovation Hub, Downtown",
    attendees: 78,
    capacity: 150,
    type: "offline" as const,
  },
  {
    id: "3",
    title: "Hackathon 2024: Build the Future",
    description:
      "48-hour hackathon focused on solving real-world problems with technology.",
    coverImage: "/tech-innovation-abstract.png",
    date: "2024-05-10",
    time: "09:00",
    location: "Tech Campus",
    attendees: 120,
    capacity: 200,
    type: "offline" as const,
  },
];

export default function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { session, loading } = useSession();
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
  //   const [selectedMember, setSelectedMember] = useState<
  //     (typeof members)[0] | null
  //   >(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const { id } = await params;
        const fetchedCommunity = await getCommunityById(id);
        setCommunity(fetchedCommunity || null);
      } catch (error) {
        console.error(error);
        setCommunity(null);
      }
    };
    initPage();
  }, [params]);

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

  if (community === null) {
    redirect("/dashboard/communities");
  }

  if (community === undefined) {
    return (
      <div className="flex flex-1 h-full w-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
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

  const { role: memberRole, id: memberId } = session.profile.communities[
    session.profile.communities.findIndex(
      ({ community: commData }) => commData.id === community.id
    )
  ] || { role: null, id: null };

  if (!memberRole || !memberId) redirect("dashboard/communities");

  const canManageCommunity =
    memberRole === "admin" || memberRole === "moderator";

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

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
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm"
          >
            <Settings className="w-5 h-5" />
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
                value="news"
                className="data-[state=active]:border-b-2 data-[state=active]:border-celestial-blue rounded-none bg-transparent px-6 py-4"
              >
                <Megaphone className="w-4 h-4 mr-2" />
                News
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
                    const { role, user } = sender;
                    const { image, name, username } = user;

                    const isOwnMessage = senderId === memberId; // <-- check if current user is sender
                    const messageColor = getColorFromId(senderId);

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
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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

          {/* News Tab */}
          <TabsContent value="news" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  News & Announcements
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setNotificationsEnabled((prev) => ({
                        ...prev,
                        news: !prev.news,
                      }))
                    }
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {notificationsEnabled.news ? (
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
                  {canManageCommunity && (
                    <Button className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                      <Megaphone className="w-4 h-4 mr-2" />
                      Post Announcement
                    </Button>
                  )}
                </div>
              </div>

              {/* {newsAnnouncements.map((announcement) => {
                const author = getMemberById(announcement.authorId);
                if (!author) return null;

                return (
                  <Card key={announcement.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={author.avatar || "/placeholder.svg"}
                            alt={author.name}
                          />
                          <AvatarFallback>{author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {author.name}
                            </span>
                            {author.role !== "member" &&
                              getRoleBadge(author.role)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(announcement.timestamp))}
                          </span>
                        </div>
                      </div>
                      {announcement.pinned && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-gray-700">{announcement.content}</p>
                  </Card>
                );
              })} */}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Community Events
                </h2>
                {canManageCommunity && (
                  <Button className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden group hover:shadow-lg transition-all"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={event.coverImage || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge
                        className={`absolute top-3 right-3 ${
                          event.type === "online"
                            ? "bg-green-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {event.type === "online" ? "🌐 Online" : "📍 In Person"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(new Date(event.date))} at {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {event.type === "online" ? (
                            <>
                              <Clock className="w-4 h-4" />
                              <span>{event.location}</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>{event.attendees} attending</span>
                          <span>
                            {event.capacity - event.attendees} spots left
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-celestial-blue to-picton-blue h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (event.attendees / event.capacity) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
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
                {community.members.map(({ user, role }) => (
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
                        Joined {formatDate(new Date(user.createdAt))}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
