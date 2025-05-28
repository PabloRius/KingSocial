"use client";

import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";
import { useState } from "react";
import { GoogleAvatar } from "./google-avatar";

export const DropdownMenu = ({
  name,
  email,
}: {
  name: string | undefined;
  email: string | undefined;
}) => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setDropdown((prev) => !prev);
        }}
        className="cursor-pointer flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1 transition-all"
      >
        <GoogleAvatar name={name} />
      </button>
      <div
        className={`absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10 transform origin-top-right transition-all ${
          !dropdown && "hidden"
        }`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
        </div>
        <div className="py-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-4 h-4 text-pink-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            Profile Settings
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-4 h-4 text-pink-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            Account
          </Link>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <SignOutButton />
        </div>
      </div>
    </>
  );
};
