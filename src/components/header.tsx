"use client";
import { useSession } from "@/context/session-context";
import Link from "next/link";
import { HeaderExpanded } from "./header-expanded";

export const Header = () => {
  const { session, loading } = useSession();
  return (
    <header className="relative border-b flex flex-row justify-between items-center py-6">
      <div
        className={`relative ${
          !session?.profile ? "left-[50%] translate-x-[-50%]" : "left-6"
        } transition-all flex justify-center hover:scale-110`}
      >
        <Link href="/" className="flex justify-center">
          <div className="relative flex items-center">
            <span className="text-3xl py-2 font-bold bg-clip-text text-transparent bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 mr-2">
              King
            </span>
            <span className="text-3xl font-bold">Social</span>
            <div className="absolute -bottom-0 left-0 w-full h-3 bg-gradient-to-r from-celestial-blue-500 to-picton-blue-500 opacity-30 rounded-full blur-sm"></div>
          </div>
        </Link>
      </div>
      {session?.profile && (
        <div
          className={`relative ${
            !session?.profile ? "-right-[100%]" : "right-6"
          }`}
        >
          <HeaderExpanded />
        </div>
      )}
    </header>
  );
};
