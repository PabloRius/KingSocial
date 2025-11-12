"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Community } from "@/lib/models/Community";
import { CheckCircle, ChevronRight, Globe, Lock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CommunityCardProps {
  community: Community;
  variant: "my" | "discover";
  onJoinClick?: (community: Community) => void;
  role?: string;
  isMember?: boolean;
  isCreator?: boolean;
}

export default function CommunityCard({
  community,
  variant,
  onJoinClick,
  role,
  isMember,
}: CommunityCardProps) {
  return (
    <Link href={`/dashboard/communities/${community.id}`}>
      <Card className="group h-full p-0 gap-0 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-celestial-blue/20 overflow-hidden rounded-xl">
        {/* Cover Image */}
        <div className="relative h-44 sm:h-52 overflow-hidden">
          <Image
            src={community.coverImage || "/placeholder.png"}
            alt={community.name}
            width={600}
            height={400}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top Badges */}
          {variant === "discover" && (
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge
                variant="secondary"
                className="bg-black/50 text-white border-0 backdrop-blur-sm"
              >
                {community.mode === "private" ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" /> Private
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" /> Public
                  </>
                )}
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 line-clamp-1">
              {community.name}
            </h3>

            {/* Role / Creator Badge (my-communities only) */}
            {variant === "my" && (
              <Badge
                variant="secondary"
                className={`bg-white/20 text-white border-0 text-xs backdrop-blur-sm capitalize`}
              >
                {role || "Member"}
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-col p-4 flex-1">
          <p className="flex-1 text-sm text-muted-foreground line-clamp-2 mb-3">
            {community.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {community._count?.members ?? community.members.length} member
                {(community._count?.members ?? community.members.length) !==
                  1 && "s"}
              </span>
            </div>

            {/* Conditional Right-side element */}
            {variant === "discover" ? (
              isMember ? (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4" /> Member
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-celestial-blue to-picton-blue text-white hover:opacity-90 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onJoinClick?.(community);
                  }}
                >
                  Join
                </Button>
              )
            ) : (
              <ChevronRight className="w-5 h-5 text-celestial-blue group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
