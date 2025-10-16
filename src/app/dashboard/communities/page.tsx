"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import { Community } from "@/lib/models/Community";
import { Event } from "@/lib/models/Event";
import {
  getCommunities,
  joinCommunity,
  sendJoinRequest,
} from "@/lib/store/community";
import { getEvents } from "@/lib/store/event";
import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// Mock data for discover communities
const discoverCommunities = [
  {
    id: 4,
    name: "Book Lovers Unite",
    description: "Discuss your favorite books and discover new ones",
    members: 2156,
    image: "/books-reading.jpg",
    category: "Literature",
    isPrivate: false,
    trending: true,
  },
  {
    id: 5,
    name: "Startup Founders",
    description: "Network with fellow entrepreneurs",
    members: 1834,
    image: "/startup-business.png",
    category: "Business",
    isPrivate: false,
    trending: true,
  },
  {
    id: 6,
    name: "Yoga & Mindfulness",
    description: "Practice yoga and meditation together",
    members: 978,
    image: "/yoga-meditation.png",
    category: "Health & Wellness",
    isPrivate: false,
    trending: false,
  },
  {
    id: 7,
    name: "Gaming Guild",
    description: "Connect with gamers worldwide",
    members: 3421,
    image: "/gaming-setup.png",
    category: "Gaming",
    isPrivate: false,
    trending: true,
  },
  {
    id: 8,
    name: "Urban Gardeners",
    description: "Growing green spaces in the city",
    members: 645,
    image: "/urban-garden.png",
    category: "Lifestyle",
    isPrivate: false,
    trending: false,
  },
  {
    id: 9,
    name: "Music Producers",
    description: "Create, share, and collaborate on music",
    members: 1523,
    image: "/music-production-setup.png",
    category: "Music",
    isPrivate: true,
    trending: false,
  },
];

export default function CommunityPage() {
  const {
    session,
    loading,
    handlers: { reload },
  } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-communities");

  const [communities, setCommunities] = useState<
    Community[] | undefined | null
  >(undefined);

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const [events, setEvents] = useState<Event[] | undefined | null>(undefined);

  const handleJoinClick = (community: Community) => {
    setSelectedCommunity(community);
    setShowJoinModal(true);
  };

  const handleJoinConfirm = async () => {
    if (!selectedCommunity) return;

    try {
      if (selectedCommunity.mode === "public") {
        await joinCommunity(selectedCommunity.id);
        toast.success(`You’ve joined ${selectedCommunity.name}!`);
      } else {
        await sendJoinRequest(selectedCommunity.id, joinMessage);
        toast.info(`Request sent to ${selectedCommunity.name} moderators.`);
      }

      setShowJoinModal(false);
      setJoinMessage("");
      if (selectedCommunity.mode === "public") reload();
      router.push(`communities/${selectedCommunity.id}`);
    } catch (err) {
      toast.error("Something went wrong while joining the community.");
      console.error(err);
    }
  };

  const fetchCommunities = useCallback(async () => {
    try {
      const fetchedCommunities = await getCommunities();
      setCommunities(fetchedCommunities);
    } catch (error) {
      console.error(error);
      setCommunities(null);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents || null);
    } catch (err) {
      console.error(err);
      setEvents(null);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="flex flex-1 w-full h-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session?.profile) {
    redirect("/");
  }

  const userCommunities = session.profile.communities;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      {" "}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger
                value="my-communities"
                className="text-xs sm:text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">My Communities</span>
                <span className="sm:hidden">My</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="text-xs sm:text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Upcoming Events</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="text-xs sm:text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Discover</span>
                <span className="sm:hidden">Discover</span>
              </TabsTrigger>
            </TabsList>

            {/* My Communities Tab */}
            <TabsContent value="my-communities" className="space-y-6">
              {/* Create Community Button */}
              <Link href="communities/create">
                <Button className="bg-picton-blue-500 hover:opacity-90 hover:bg-celestial-blue-400 w-full sm:w-auto mb-6">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Community
                </Button>
              </Link>

              {/* Communities Grid */}
              {userCommunities ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {userCommunities.map(({ community, role }) => (
                      <Link
                        key={community.id}
                        href={`communities/${community.id}`}
                      >
                        <Card className="group gap-2 pb-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-celestial-blue-50 overflow-hidden h-full">
                          <div className="relative h-40 sm:h-48 overflow-hidden">
                            <Image
                              width={600}
                              height={400}
                              src={community.coverImage || "/placeholder.png"}
                              alt={community.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-3 right-3 flex gap-2">
                              {/* {community.unreadPosts > 0 && (
                          <Badge className="bg-celestial-blue text-white animate-pulse">
                            {community.unreadPosts} new
                          </Badge>
                        )} */}
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="text-white font-bold text-lg sm:text-xl mb-1 line-clamp-1">
                                {community.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm capitalize"
                              >
                                {role}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {community.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>
                                  {community._count.members.toLocaleString()}{" "}
                                  member{community._count.members > 1 && "s"}
                                </span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-celestial-blue group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {userCommunities.length === 0 && (
                    <Card className="border-dashed border-2 border-celestial-blue-50">
                      <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-celestial-blue-50 flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-celestial-blue" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">
                          No Communities Yet
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
                          Join or create a community to connect with people who
                          share your interests
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Link href="/community/create">
                            <Button className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Community
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="border-celestial-blue text-celestial-blue hover:bg-celestial-blue-50 bg-transparent"
                            onClick={() => setActiveTab("discover")}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Browse Communities
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : communities === undefined ? (
                <></>
              ) : (
                <></>
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              {/* Events List */}
              <div className="flex flex-col gap-4">
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                      <Card className="group gap-2 pb-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] border-celestial-blue-50 overflow-hidden">
                        <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
                          {/* Event Image */}
                          <div className="relative w-full sm:w-48 h-32 sm:h-auto rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              width={600}
                              height={400}
                              src={event.coverImage || "/placeholder.png"}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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

                          {/* Event Details */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-lg sm:text-xl font-bold group-hover:text-celestial-blue transition-colors line-clamp-1">
                                  {event.title}
                                </h3>
                                <ChevronRight className="w-5 h-5 text-celestial-blue group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                              </div>
                              <p className="text-sm text-celestial-blue hover:underline inline-block">
                                {event.community.name}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-celestial-blue" />
                                <span>
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                              {event.start_time && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-celestial-blue" />
                                  <span>{formatTime(event.start_time)}</span>
                                </div>
                              )}
                              {event.location_format === "in-person" && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-celestial-blue" />
                                  <span className="line-clamp-1">
                                    {event.location}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              {event.capacity && (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {event._count.participants}/
                                      {event.capacity}
                                    </span>
                                  </div>
                                  <div className="h-2 w-24 sm:w-32 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-celestial-blue to-picton-blue rounded-full transition-all duration-300"
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
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Heart className="w-4 h-4 mr-1" />
                                Interested
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : events === undefined ? (
                  <div className="flex flex-1 w-full h-full items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <></>
                )}
              </div>

              {!events ||
                (events.length === 0 && (
                  <Card className="border-dashed border-2 border-celestial-blue-50">
                    <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                        <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        No Upcoming Events
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
                        Join communities to see their upcoming events or create
                        your own
                      </p>
                      <Button
                        variant="outline"
                        className="border-celestial-blue text-celestial-blue hover:bg-celestial-blue-50 bg-transparent"
                        onClick={() => setActiveTab("my-communities")}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        View My Communities
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-6">
              {/* Trending Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-celestial-blue" />
                  <h2 className="text-xl font-bold">Trending Communities</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {discoverCommunities
                    .filter((c) => c.trending)
                    .map((community) => (
                      <Link
                        key={community.id}
                        href={`/community/${community.id}`}
                      >
                        <Card className="group gap-2 pb-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-celestial-blue-50 overflow-hidden h-full">
                          <div className="relative h-40 sm:h-48 overflow-hidden">
                            <Image
                              width={600}
                              height={400}
                              src={community.image || "/placeholder.png"}
                              alt={community.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute top-3 right-3 flex gap-2">
                              {community.isPrivate && (
                                <Badge
                                  variant="secondary"
                                  className="bg-black/50 text-white border-0"
                                >
                                  <Lock className="w-3 h-3 mr-1" />
                                  Private
                                </Badge>
                              )}
                              <Badge className="bg-orange-500 text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3">
                              <h3 className="text-white font-bold text-lg sm:text-xl mb-1 line-clamp-1">
                                {community.name}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm"
                              >
                                {community.category}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {community.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>
                                  {community.members.toLocaleString()} members
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-celestial-blue to-picton-blue hover:opacity-90"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                Join
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              </div>

              {/* All Communities */}
              <div>
                <h2 className="text-xl font-bold mb-4">All Communities</h2>
                {communities && communities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {communities.map((community) => {
                      const isMember = community.members.some(
                        (mem) => mem.user.id === session.profile.id
                      );

                      return (
                        <Link
                          key={community.id}
                          href={`communities/${community.id}`}
                        >
                          <Card className="group gap-2 pb-2  relative overflow-hidden border-celestial-blue/20 hover:border-celestial-blue/50 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl bg-white/70 backdrop-blur-sm">
                            {/* Cover */}
                            <div className="relative h-44 sm:h-52 overflow-hidden">
                              <Image
                                width={600}
                                height={800}
                                src={community.coverImage || "/placeholder.png"}
                                alt={community.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                              {/* Top badges */}
                              <div className="absolute top-3 right-3 flex gap-2">
                                <Badge
                                  variant="secondary"
                                  className="bg-black/50 text-white border-0 backdrop-blur-sm"
                                >
                                  {community.mode === "private" ? (
                                    <>
                                      <Lock className="w-3 h-3 mr-1" />
                                      Private
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="w-3 h-3 mr-1" />
                                      Public
                                    </>
                                  )}
                                </Badge>
                              </div>

                              {/* Community name */}
                              <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white font-semibold text-lg sm:text-xl drop-shadow-md line-clamp-1">
                                  {community.name}
                                </h3>
                              </div>
                            </div>

                            {/* Details */}
                            <CardContent className="p-4">
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                {community.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {community.members.length.toLocaleString()}{" "}
                                    member
                                    {community.members.length !== 1 && "s"}
                                  </span>
                                </div>

                                {/* Membership status */}
                                {isMember ? (
                                  <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-4 h-4" />
                                    Member
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-celestial-blue to-picton-blue text-white hover:opacity-90 rounded-full"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleJoinClick(community);
                                    }}
                                  >
                                    Join
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                ) : communities === undefined ? (
                  <div className="flex flex-1 w-full h-full items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          {selectedCommunity && selectedCommunity.mode === "public" ? (
            <>
              <DialogHeader>
                <DialogTitle>Join {selectedCommunity.name}?</DialogTitle>
                <DialogDescription>
                  This is a public community. You can join immediately or visit
                  its page first.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`communities/${selectedCommunity.id}`)
                  }
                >
                  View Community
                </Button>
                <Button
                  className="bg-gradient-to-r from-celestial-blue to-picton-blue"
                  onClick={handleJoinConfirm}
                >
                  Join Now
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  Request to Join {selectedCommunity?.name}
                </DialogTitle>
                <DialogDescription>
                  This community is private. Send a request with a short message
                  to the moderators.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Write a short message..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-celestial-blue to-picton-blue"
                    onClick={handleJoinConfirm}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
