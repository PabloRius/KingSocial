"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const GoogleAvatar = ({ name }: { name: string | undefined }) => {
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
    <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 group-hover:border-celestial-blue-200 dark:group-hover:border-celestial-blue-900 transition-all">
      <AvatarImage src={undefined} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-celestial-blue-400 to-picton-blue-500 text-white">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
