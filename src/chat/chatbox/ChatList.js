import React, { useMemo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { ChatSkeleton } from "./ChatSkeleton";
import UserStatus from "../online/OnlineStatuesDot";
import { useAuth } from "../../layout/AuthProvider";

export default function ChatList({
  chats = [],
  openChat,
  loadingChats,
  chatFilter,
  setChatFilter,
  unreadTotal,
  activeChat
}) {
  const { user: authUser } = useAuth();

  // 🎨 COLORS
  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  // 🕒 FORMAT TIME
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 💬 MESSAGE PREVIEW
  function getMessagePreview(message) {
    if (!message) return "Start chatting";

    if (message.type === "link") return message.message;
    if (message.type === "text") return message.message;
    if (message.type === "voice") return "🎤 Voice message";
    if (message.type === "image") return "🖼 Image";
    if (message.type === "file") return "📎 Document";

    return "Start chatting";
  }

  // 🔥 FILTER (FIXED)
  const filteredChats = useMemo(() => {
    if (chatFilter === "unread") {
      return chats.filter(c => (c.unread_count || 0) > 0);
    }
    return chats;
  }, [chatFilter, chats]);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 font-bold text-lg border-b flex justify-between items-center text-black">
        Messages
        {unreadTotal > 0 && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadTotal}
          </span>
        )}
      </div>

      {/* FILTER */}
      <div className="flex gap-2 p-3 border-b">
        <button
          onClick={() => setChatFilter("all")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            chatFilter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 shadow border"
          }`}
        >
          All
        </button>

        <button
          onClick={() => setChatFilter("unread")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition flex items-center gap-1 ${
            chatFilter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 shadow border "
          }`}
        >
          Unread
          {unreadTotal > 0 && (
            <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
              {unreadTotal}
            </span>
          )}
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto">

        {/* LOADING */}
        {loadingChats && <ChatSkeleton type="list" />}

        {/* EMPTY */}
        {!loadingChats && filteredChats.length === 0 && (
          <div className="text-center mt-10 text-gray-400">
            No {chatFilter === "unread" ? "unread messages" : "chats"}
          </div>
        )}

        {/* LIST */}
        {!loadingChats && filteredChats.map(chat => {
          const other = chat.other_user || {};
          const lastMessage = chat.latest_message;

          const blockedByMe = chat.block_info?.blocked_by_me;
          const blockedMe = chat.block_info?.blocked_me;
          const isMine = lastMessage?.sender_id === authUser?.id;

          return (
  <div
    key={chat.id}
    onClick={() => {
      if (blockedMe) return; // ❌ disable click if they blocked you
      openChat(chat);
    }}
    className={`flex gap-3 p-4 border-b transition relative
      ${blockedMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"}
      ${activeChat?.id === chat.id ? "bg-gray-100" : ""}
    `}
  >

    {/* 🔥 AVATAR */}
    <div
      className={`relative w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-xl shadow-sm ${getColor(
        other?.first_name
      )}`}
    >
      {getInitial(other?.first_name)}

      {/* 🚫 BLOCK OVERLAY (if user blocked you) */}
      {blockedMe && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>

        </div>
      )}
    </div>

    {/* RIGHT SIDE */}
    <div className="flex-1">

      {/* TOP ROW */}
      <div className="flex justify-between items-center">

        <div className="inline-flex gap-2 items-center">
          <h4 className="font-semibold text-gray-900 leading-none">
            {other?.first_name} {other?.last_name}
          </h4>

          {/* ONLINE STATUS */}
          <UserStatus user={other} />
        </div>

        <span className="text-xs text-gray-500">
          {formatTime(lastMessage?.created_at)}
        </span>
      </div>

      {/* MESSAGE + STATUS */}
      <div className="flex items-center justify-between mt-2">

        <div className="flex items-center gap-1 text-sm text-gray-600 truncate">

          {/* MESSAGE TEXT */}
          <span
            className={`truncate max-w-[200px] text-sm ${
              blockedMe ? "text-gray-400 italic" : "text-gray-800"
            }`}
          >
            {blockedMe
              ? "You cannot reply to this conversation"
              : getMessagePreview(lastMessage)}
          </span>

          {/* ✔✔ STATUS ICON */}
          {!blockedMe && isMine && (
            lastMessage?.seen_at ? (
              <CheckCheck size={16} className="text-blue-500" />
            ) : other?.is_online ? (
              <CheckCheck size={16} className="text-gray-400" />
            ) : (
              <Check size={16} className="text-gray-400" />
            )
          )}
        </div>

        {/* UNREAD BADGE */}
        {!blockedMe &&
          chat.unread_count > 0 &&
          activeChat?.id !== chat.id && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {chat.unread_count}
            </span>
          )}
      </div>

      {/* 🔴 YOU BLOCKED USER */}
      {blockedByMe && (
        <span className="mt-2 inline-block text-xs bg-red-200 text-red-800 font-semibold px-2 py-0.5 rounded">
          You blocked this user
        </span>
      )}

      {/* 🚫 USER BLOCKED YOU */}
      {blockedMe && (
        <span className="mt-2 inline-block text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
          {other?.first_name} blocked you
        </span>
      )}

    </div>
  </div>
);
        })}

      </div>
    </div>
  );
}