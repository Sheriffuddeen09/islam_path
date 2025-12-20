import { useState, useEffect, useRef, useMemo } from "react";
import api from "../Api/axios";
import { initEcho } from "../echo";
import { Check, CheckCheck } from "lucide-react";

// ================= SKELETON =================
function ChatSkeleton({ title }) {
  return (
    <div className="px-4">
      {title && (
        <div className="h-6 w-48 bg-gray-200 mt-24 rounded mx-auto mb-6 animate-pulse" />
      )}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-3 p-4 border-b animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mt-4" />
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ================= CHATLIST =================
export default function ChatList({ setActiveChat, activeChat, chats, setChats }) {
  const [authUser, setAuthUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState({}); // { userId: true/false }

  const fetchedOnce = useRef(false);

  // ================ FETCH AUTH USER ================


  useEffect(() => {
    api.get("/api/me")
      .then(res => setAuthUser(res.data))
      .catch(() => setAuthUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  // ================ FETCH CHATS ================
  const fetchChats = async () => {
    if (!authUser) return;
    try {
      setLoadingChats(true);
      const res = await api.get("/api/chats");
      setChats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (!authUser || fetchedOnce.current) return;
    fetchedOnce.current = true;

    fetchChats();
    const interval = setInterval(fetchChats, 10000); // optional 10s polling
    return () => clearInterval(interval);
  }, [authUser]);

  // ================ ONLINE STATUS ================
 const chatUserIds = useMemo(() => {
  if (!authUser || chats.length === 0) return [];
  const ids = chats
    .map(chat => (authUser.role === "teacher" ? chat.student?.id : chat.teacher?.id))
    .filter(Boolean);
  return Array.from(new Set(ids));
}, [authUser, chats]);

useEffect(() => {
  if (!authUser || chatUserIds.length === 0) return;

  let cancelled = false;

  const fetchStatus = async () => {
    try {
      const res = await api.post("/api/users/online-status-bulk", {
        user_ids: chatUserIds,
      });
      if (!cancelled) setOnlineStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchStatus();
  const interval = setInterval(fetchStatus, 15000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [authUser, chatUserIds]);

  // ================ REAL-TIME UPDATES ================
  useEffect(() => {
    if (!authUser) return;

    const echo = initEcho();
    const channel = echo.private(`chat.${authUser.id}`);

    channel.listen("NewMessage", (e) => {
      setChats(prev =>
        prev.map(chat =>
          chat.id === e.message.chat_id
            ? {
                ...chat,
                latest_message: e.message,
                unread_count:
                  e.message.sender_id !== authUser.id
                    ? chat.unread_count + 1
                    : chat.unread_count,
              }
            : chat
        )
      );
    });

    channel.listen("MessageSeen", (e) => {
      setChats(prev =>
        prev.map(chat =>
          chat.id === e.message.chat_id
            ? { ...chat, latest_message: { ...chat.latest_message, seen_at: e.message.seen_at } }
            : chat
        )
      );
    });

    return () => {
      echo.leave(`chat.${authUser.id}`);
    };
  }, [authUser]);

  // ================ MARK SEEN No message yet ================
  useEffect(() => {
    if (!activeChat) return;
    api.post(`/api/chats/${activeChat.id}/seen`).catch(() => {});
  }, [activeChat]);

  // ================ STATES & RENDER ================
  if (loadingUser) return <ChatSkeleton title />;

  if (!authUser) return <div className="p-4 text-red-500">Not authenticated</div>;

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getMessagePreview = (msg) => {
    if (!msg) return "Start a Conservation";
    if (msg.type === "text") return msg.message;
    if (msg.type === "image") return "📷 Image uploaded";
    if (msg.type === "video") return "🎬 Video uploaded";
    if (msg.type === "voice") return "🎵 Voice note Uploaded";
    return "📄 Document uploaded";
  };

  return (
    <div className="h-full overflow-y-auto ">
      {loadingChats && <ChatSkeleton />}

      {!loadingChats && chats.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          start conversation
        </div>
      )}

      {!loadingChats && chats.map(chat => {
        const isTeacher = ["teacher", "admin"].includes(authUser.role);
        const other = isTeacher ? chat.student : chat.teacher;

        if (!other) return null;

        const lastMessage = chat.latest_message || null;

        const isOnline = onlineStatus[other.id] || false;
        const isActive = activeChat?.id === chat.id;
        const isMine = lastMessage?.sender_id === authUser.id;

        return (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className={`flex gap-3 p-5 items-center  border-b border-t border-gray-100 cursor-pointer ${
              isActive ? "bg-blue-100 hover:bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-700 text-white text-2xl flex items-center justify-center font-bold">
              {other.first_name[0]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="flex justify-between items-center gap-3">
                  <div className="font-semibold text-black truncate">
                    {other.first_name} {other.last_name}
                  </div>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                </div>
                {lastMessage && (
                  <div className="text-xs text-gray-600">
                    {formatTime(lastMessage.created_at)}
                  </div>
                )}
              </div>

              <div className="flex items-center text-xs justify-between mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                  {isMine && lastMessage && (
                    lastMessage.seen_at
                      ? <CheckCheck className="w-4 h-4 text-blue-500" />
                      : <Check className="w-4 h-4 text-gray-400" />
                  )}
                  <p className="text-xs">{getMessagePreview(lastMessage)}</p>
                </div>

                {chat.unread_count > 0 && (
                  <span className="bg-blue-800 text-xs text-white px-2 py-0.5 rounded-full">
                    {chat.unread_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
