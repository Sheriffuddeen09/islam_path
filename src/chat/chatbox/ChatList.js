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

        <div className="flex flex-col items-center justify-center h-full text-center px-6">

          {/* ICON */}
          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">

            <div className="w-20 h-20 rounded-full border-2 border-gray-800 flex items-center justify-center">

              {chatFilter === "unread" ? (

                // CHECK ICON
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-10 h-10 text-gray-800"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>

              ) : (

                // GROUP ICON
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="w-10 h-10 text-gray-800"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.742-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.75m12 0a5.971 5.971 0 0 0-.94-3.197M6 18.75a5.971 5.971 0 0 1 .94-3.197m0 0A5.995 5.995 0 0 1 12 13.5a5.995 5.995 0 0 1 5.06 2.053M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-3xl font-semibold text-gray-800 mb-3">

            {chatFilter === "unread"
              ? "No unread chats"
              : chatFilter === "group"
              ? "No groups"
              : "No chats"}

          </h2>

          {/* SUBTEXT */}
          <p className="text-gray-500 text-lg mb-10">

            {chatFilter === "unread"
              ? "You're all caught up."
              : chatFilter === "group"
              ? "You have not joined any groups yet."
              : "Start chatting with your friends."}

          </p>

          {/* BUTTON */}
          <button
            onClick={() => setChatFilter("all")}
            className="text-green-500 font-semibold text-lg hover:underline"
          >
            View all chats
          </button>
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