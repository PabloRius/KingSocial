"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "@/context/session-context";
import { Chat } from "@/lib/models/Chat";
import { getChatsFromUserId, sendMessage } from "@/lib/store/chat";
import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MoreVertical,
  Search,
  Send,
  Smile,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function formatChatTimestamp(date: Date): string {
  const now = new Date();
  const d = new Date(date);

  // Midnight today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Midnight yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d >= today) {
    // Today -> show time
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (d >= yesterday) {
    // Yesterday
    return "yesterday";
  } else {
    // Older
    return d.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
}

export default function InboxPage() {
  const { session, loading } = useSession();
  const [selectedChat, setSelectedChat] = useState<string | null>("a");
  const [chats, setChats] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = useCallback(async () => {
    try {
      if (!session?.profile.id) return;
      const chats = await getChatsFromUserId(session?.profile.id);
      setChats(chats);
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);

  useEffect(() => {
    if (selectedChatData?.messages) {
      scrollToBottom();
    }
  }, [selectedChatData?.messages]);

  const filteredChats = chats.filter((chat) =>
    chat.participants.some(
      (p) =>
        p.user.id !== session?.profile.id &&
        p.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSendMessage = async () => {
    if (!session?.profile || !selectedChatData) return;
    if (message.trim()) {
      const newMessage = await sendMessage({
        content: message,
        senderId: session?.profile.id,
        chatId: selectedChatData?.id,
      });

      if (newMessage) {
        setMessage("");
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChatData.id
              ? { ...chat, messages: [...chat.messages, newMessage] }
              : chat
          )
        );
      } else {
        alert("Error sending the message, try again later");
      }
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex-1">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!session?.profile) {
    redirect("/");
  }

  return (
    <div className="flex bg-gradient-to-br from-blue-50 via-white to-purple-50 h-[calc(100vh-100px)] md:h-[calc(100vh-100px)] overflow-hidden">
      {/* Chat List Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed md:relative md:translate-x-0 z-40 w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out h-full flex flex-col`}
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  selectedChat === chat.id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar>
                    <AvatarImage
                      src={
                        // chat.avatar ||
                        chat.participants.find(
                          (p) => p.user.id !== session.profile.id
                        )?.user.image || "/placeholder.svg"
                      }
                      alt={
                        // chat.avatar
                        //   ? "Chat Avatar"
                        chat.participants
                          .filter((p) => p.user.id !== session.profile.id)
                          .map((p) => p.user.name)
                          .join(", ")
                      }
                    />
                  </Avatar>

                  {/* {chat.online && (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
  )} */}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.participants
                        .filter((p) => p.user.id !== session.profile.id)
                        .map((p) => p.user.name)
                        .join(", ")}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {chat.messages.at(-1)?.createdAt
                        ? formatChatTimestamp(
                            new Date(chat.messages.at(-1)!.createdAt)
                          )
                        : ""}
                    </span>
                  </div>
                  {chat.messages.length > 0 && (
                    <div className="flex items-left justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {(() => {
                          const lastMessage = chat.messages.at(-1);
                          if (!lastMessage) return "";

                          const senderId = lastMessage.senderId;
                          const senderName = chat.participants.find(
                            (p) => p.user.id === senderId
                          )?.user.name;
                          const isFromLoggedUser =
                            senderId === session.profile.id;

                          if (isFromLoggedUser) {
                            return `You: ${lastMessage.content}`;
                          }

                          if (chat.participants.length === 2) {
                            // One-to-one chat → just show content
                            return lastMessage.content;
                          }

                          // Group chat → show name: content
                          return `${senderName || "Unknown"}: ${
                            lastMessage.content
                          }`;
                        })()}
                      </p>

                      {/* {chat.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )} */}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Conversation Area */}
      <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-hidden">
        {selectedChat && selectedChatData ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={
                        // chat.avatar ||
                        selectedChatData.participants.find(
                          (p) => p.user.id !== session.profile.id
                        )?.user.image || "/placeholder.svg"
                      }
                      alt={
                        // chat.avatar
                        //   ? "Chat Avatar"
                        selectedChatData.participants
                          .filter((p) => p.user.id !== session.profile.id)
                          .map((p) => p.user.name)
                          .join(", ")
                      }
                    />
                  </Avatar>
                  {/* {selectedChatData?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )} */}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedChatData.participants
                      .filter((p) => p.user.id !== session.profile.id)
                      .map((p) => p.user.name)
                      .join(", ")}
                  </h2>
                  {/* <p className="text-xs text-gray-500">
                    {selectedChatData?.online ? "Active now" : "Offline"}
                  </p> */}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 overflow-hidden">
              <div className="space-y-4 py-4 max-w-3xl mx-auto">
                {selectedChatData.messages.map((msg, i) => {
                  const msgDate = new Date(msg.createdAt);

                  // Separator logic
                  const prevMsg = selectedChatData.messages[i - 1];
                  const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

                  const shouldShowDateSeparator =
                    !prevDate ||
                    msgDate.toDateString() !== prevDate.toDateString();

                  // Human-friendly label
                  let dateLabel;
                  if (isToday(msgDate)) {
                    dateLabel = "Today";
                  } else if (isYesterday(msgDate)) {
                    dateLabel = "Yesterday";
                  } else {
                    dateLabel = format(msgDate, "dd/MM/yyyy");
                  }

                  return (
                    <div key={msg.id}>
                      {/* Date separator */}
                      {shouldShowDateSeparator && (
                        <div className="flex justify-center my-4">
                          <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                            {dateLabel}
                          </span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`flex ${
                          msg.senderId === session.profile.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.senderId === session.profile.id
                              ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                              : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                          }`}
                        >
                          {/* Product Reference Card */}
                          {msg.productRef && (
                            <Link
                              href={`/dashboard/marketplace/${msg.productRef.id}`}
                              className="block mb-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                  <Image
                                    src={msg.productRef.photos[0]}
                                    alt={msg.productRef.name}
                                    width={64}
                                    height={64}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                      {msg.productRef.name}
                                    </h4>
                                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                                  </div>
                                  <p className="text-lg font-bold text-blue-600 mt-1">
                                    ${msg.productRef.price}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          )}

                          {/* Message Bubble */}
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderId === session.profile.id
                                ? "text-blue-100"
                                : "text-gray-500"
                            }`}
                          >
                            {format(msgDate, "HH:mm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    <Smile className="h-5 w-5 text-gray-600" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Messages
              </h2>
              <p className="text-gray-600 mb-6">
                Select a conversation from the list to start messaging
              </p>
              <Button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                View Conversations
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
