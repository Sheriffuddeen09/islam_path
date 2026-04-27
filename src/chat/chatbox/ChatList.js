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

  // 🎨 COLORS
  
  // 🔥 FILTER (FIXED) 
  const filteredChats = useMemo(() => {
    if (chatFilter === "unread") {
      return chats.filter(c => (c.unread_count || 0) > 0);
    }
    return chats;
  }, [chatFilter, chats]);

  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col bg-white">

      {/* HEADER */}
      <div className="p-4 font-bold text-lg border-b inline-flex gap-3 items-center text-black">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
        stroke-width="1.5" stroke="currentColor" class="size-6" onClick={() =>navigate('/')}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
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

  {loadingChats && <ChatSkeleton type="list" />}

  {!loadingChats && filteredChats.length === 0 && (
    <div className="text-center mt-10 text-gray-400">
      No {chatFilter === "unread" ? "unread messages" : "chats"}
    </div>
  )}

  {!loadingChats && filteredChats.map(chat => (
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