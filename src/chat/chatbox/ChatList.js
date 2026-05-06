import { useMemo } from "react";
import { ChatSkeleton } from "./ChatSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";

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
  const navigate = useNavigate();

 const safeUnreadTotal = useMemo(() => {
  return chats.reduce((total, chat) => {
    const isGroup = chat.type === "group";
    const status = chat.membership_status;

    const isAllowed =
      !isGroup ||
      (isGroup &&
        (status === "approved" || chat.my_role === "admin"));

    if (!isAllowed) return total;

    return total + (chat.unread_count || 0);
  }, 0);
}, [chats]);


  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const isGroup = chat.type === "group";

      const membershipStatus = chat.membership_status;

      // ❌ BLOCK pending/rejected/removed users from unread + display logic
      const isAllowedGroupUser =
        !isGroup ||
        (isGroup &&
          (membershipStatus === "approved" || chat.my_role === "admin"));

      if (chatFilter === "all") {
        return true;
      }

      if (chatFilter === "unread") {
        return (
          (chat.unread_count || 0) > 0 &&
          isAllowedGroupUser
        );
      }

      if (chatFilter === "group") {
        return isGroup;
      }

      return true;
    });
  }, [chatFilter, chats]);

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 font-bold text-lg border-b inline-flex gap-3 items-center text-black">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>

        Messages
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 p-3 border-b flex-wrap">

        {/* ALL */}
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

        {/* UNREAD */}
        <button
          onClick={() => setChatFilter("unread")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition flex items-center gap-1 ${
            chatFilter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 shadow border"
          }`}
        >
          Unread
          {safeUnreadTotal > 0 && (
            <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
              {safeUnreadTotal}
            </span>
          )}
        </button>

        {/* GROUP 🔥 NEW */}
        <button
          onClick={() => setChatFilter("group")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            chatFilter === "group"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-800 shadow border"
          }`}
        >
          Groups
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto">

        {loadingChats && <ChatSkeleton type="list" />}

        {!loadingChats && filteredChats.length === 0 && (
          <div className="text-center mt-10 text-gray-400">
            No {chatFilter === "unread"
              ? "unread messages"
              : chatFilter === "group"
              ? "groups"
              : "chats"}
          </div>
        )}

        {!loadingChats &&
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              authUser={authUser}
              activeChat={activeChat}
              openChat={openChat}
            />
          ))}
      </div>
    </div>
  );
}