"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MoreVertical, Search, Send, Smile } from "lucide-react";
import { useState } from "react";

const mockChats = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Hey! Are you still selling that vintage camera?",
    timestamp: "2m ago",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thanks for the quick response!",
    timestamp: "1h ago",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Is the laptop still available?",
    timestamp: "3h ago",
    unread: 1,
    online: false,
  },
  {
    id: 4,
    name: "James Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Perfect! I'll take it.",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Can you send more photos?",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
  },
  {
    id: 6,
    name: "David Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "What's your best price?",
    timestamp: "2 days ago",
    unread: 0,
    online: false,
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "them",
    text: "Hi! I'm interested in the vintage camera you're selling.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "me",
    text: "Hello! Yes, it's still available. What would you like to know about it?",
    timestamp: "10:32 AM",
  },
  {
    id: 3,
    sender: "them",
    text: "Does it come with the original lens? And what's the condition?",
    timestamp: "10:33 AM",
  },
  {
    id: 4,
    sender: "me",
    text: "Yes, it includes the original 50mm lens. The camera is in excellent condition with minimal wear. I've taken great care of it.",
    timestamp: "10:35 AM",
  },
  {
    id: 5,
    sender: "them",
    text: "That sounds great! Can you send more photos of the camera body?",
    timestamp: "10:36 AM",
  },
  {
    id: 6,
    sender: "me",
    text: "I'll send them in just a moment.",
    timestamp: "10:37 AM",
  },
  {
    id: 7,
    sender: "them",
    text: "Hey! Are you still selling that vintage camera?",
    timestamp: "Just now",
  },
];

export default function InboxPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const selectedChatData = mockChats.find((chat) => chat.id === selectedChat);

  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId);
    // Close sidebar on mobile when chat is selected
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

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
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                  selectedChat === chat.id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar>
                    <AvatarImage
                      src={chat.avatar || "/placeholder.svg"}
                      alt={chat.name}
                    />
                    <AvatarFallback>
                      {chat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {chat.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
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
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {selectedChat ? (
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
                      src={selectedChatData?.avatar || "/placeholder.svg"}
                      alt={selectedChatData?.name}
                    />
                    <AvatarFallback>
                      {selectedChatData?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChatData?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedChatData?.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedChatData?.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="px-4 overflow-hidden">
              <div className="space-y-4 py-4 max-w-3xl mx-auto">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                          : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "me"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
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
                    onKeyPress={(e) => {
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
