"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const GoogleAvatar = ({
  src,
  name,
}: {
  src: string | undefined;
  name: string | undefined;
}) => {
  const getInitials = () => {
    if (!name) return "NA";

    const parts = name
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);

    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };
  return (
    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 group-hover:border-pink-200 dark:group-hover:border-pink-900 transition-all">
      <AvatarImage src={src} alt="User" />
      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-violet-500 text-white">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
