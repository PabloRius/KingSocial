"use client";
import { useSession } from "@/context/session-context";
import { Bell, MessageSquare } from "lucide-react";
import { DropdownMenu } from "./dropdown-menu";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export const HeaderExpanded = () => {
  const { session } = useSession();
  if (!session?.profile) return;
  const { name, email, sellerProfile } = session.profile;
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer z-10 transition-all"
      >
        <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        <Badge className="absolute z-20 -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center bg-celestial-blue-500">
          3
        </Badge>
        <span className="sr-only">Notifications</span>
      </Button>
      {sellerProfile && (
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center bg-celestial-blue-500">
            5
          </Badge>
          <span className="sr-only">Messages</span>
        </Button>
      )}
      <div className="relative group">
        <DropdownMenu name={name || undefined} email={email || undefined} />
      </div>
    </div>
  );
};
