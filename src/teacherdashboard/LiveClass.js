import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../layout/AuthProvider";
import api from "../Api/axios";
import { initEcho } from "../echo";
import { Check, CheckCheck } from "lucide-react";
import ChatWindow from "../chat/ChatWindow";
import { Link } from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import BlockButton from "../chat/Block";
import UserStatus from "../chat/online/OnlineStatuesDot";



// ================= SKELETON =================
function ChatSkeleton({ title }) {
  return (
    <div className="px-4">
      {title && (
        <div className="h-6 bg-gray-200rounded mx-auto mb-6 animate-pulse" />
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



  
export default function LiveClass({fetchUnreadCount}) {
  const { user: authUser } = useAuth();

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const [messages, setMessages] = useState([]);

  const [chatFilter, setChatFilter] = useState("all"); // all | unread


  const [showGuide, setShowGuide] = useState(false);
  const [startLive, setStartLive] = useState(false);
  const fetchedOnce = useRef(false);

  const [openReport, setOpenReport] = useState(false);

 const handleReportPop = () => {
  setOpenReport(true);  // 👈 open report modal 
};

const closeReport = () => {
  setOpenReport(false);
};


  const chatPartner =
  activeChat && authUser
    ? activeChat.user_one_id === authUser.id
      ? activeChat.other_user
      : activeChat.user_two_id === authUser.id
      ? activeChat.other_user
      : null
    : null;



  // ================= FETCH USER =================
  useEffect(() => {
    api.get("/api/me")
      .finally(() => setLoadingUser(false));
  }, []);

  // ================= FETCH CHATS =================
  const fetchChats = async () => {
  if (!authUser) return;

  try {
    setLoadingChats(true);

    const res = await api.get("/api/chats");

    const normalized = res.data.map(chat => ({
      ...chat,
      unread_count: Number(chat.unread_count || 0),
      latest_message: chat.latest_message || null,

      // ✅ normalize block info
      block_info: chat.block_info
        ? {
            ...chat.block_info,
            blocked_by_me: chat.block_info.blocker_id === authUser.id,
            blocked_me: chat.block_info.blocked_id === authUser.id,
          }
        : null,
    }));

    setChats(normalized);
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
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, [authUser]);

  // ================= ONLINE STATUS =================
  const chatUserIds = useMemo(() => {
    if (!authUser) return [];
    return Array.from(
      new Set(
        chats
          .map(c =>
            authUser.role === "teacher"
              ? c.student?.id
              : c.teacher?.id
          )
          .filter(Boolean)
      )
    );
  }, [authUser, chats]);


   
  // ================= REAL TIME ================= unread_count
  useEffect(() => {
  if (!authUser) return;

  const echo = initEcho();
  const channel = echo.private(`chat.${authUser.id}`);

  // New incoming message
  channel.listen("NewMessage", (e) => {
    setChats(prev =>
      prev.map(c => {
        if (c.id !== e.message.chat_id) return c;

        const isActive = activeChat?.id === c.id;
        return {
          ...c,
          latest_message: e.message,
          unread_count: !isActive && e.message.sender_id !== authUser.id
            ? (c.unread_count || 0) + 1
            : c.unread_count
        };
      })
    );

    // Append message if chat is open
    if (activeChat?.id === e.message.chat_id) {
      setMessages(prev => [...prev, e.message]);
      api.post(`/api/chats/${activeChat.id}/seen`).catch(() => {});
    }
  });

  // Message seen event
  channel.listen("MessageSeen", (e) => {
    setChats(prev =>
      prev.map(c =>
        c.id === e.message.chat_id
          ? {
              ...c,
              latest_message: {
                ...c.latest_message,
                seen_at: e.message.seen_at
              }
            }
          : c
      )
    );
  });

  return () => echo.leave(`chat.${authUser.id}`);
}, [authUser, activeChat]);




  // ================= OPEN CHAT =================
  const openChat = async (chat) => {
  // 🚫 blocked check
  if (chat.block_info?.blocked_me) {
    toast.error("You have been blocked in this chat");
    return;
  }

  setActiveChat(chat);

  fetchUnreadCount()
  // ✅ clear unread locally
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id ? { ...c, unread_count: 0 } : c
    )
  );

  try {
    const res = await api.get(`/api/chats/${chat.id}/messages`);
    setMessages(res.data || []);

    // ✅ mark seen in backend
    await api.post(`/api/chats/${chat.id}/seen`);
  } catch (e) {
    console.error(e);
  }
};


  // ================= Unblock =================
const handleUnblock = async () => { 
  try {
    await api.post(`/api/chats/${activeChat.id}/unblock`);

    // Update UI
    setChats(prev =>
      prev.map(c =>
        c.id === activeChat.id ? { ...c, block_info: null } : c
      )
    );

    setActiveChat(prev => ({ ...prev, block_info: null }));

    toast.success("User unblocked");
  } catch (err) {
    toast.error("Failed to unblock user");
    console.error(err);
  }
};



  // ================= HELPERS =================
  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  const filteredChats = useMemo(() => {
    if (chatFilter === "unread") {
      return chats.filter(c => (c.unread_count || 0) > 0);
    }
    return chats;
  }, [chatFilter, chats]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function getMessagePreview(message) {
  if (!message) return "";

  if (message.type === "text") return message.message;
  if (message.type === "voice") return "🎤 Voice message";
  if (message.type === "image") return "🖼 Image";
  if (message.type === "file") return "📎 Document";

  return "New message";
}


  if (loadingUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  if (!authUser) return <div className="p-4 text-red-500">Not authenticated</div>;

  return (
    <div className="h-full flex">
      {/* CHAT LIST */}
      <div className="w-full lg:ml-64 mt-5 border-r bg-gray-900">

        {/* TOP FILTER */}
        <div className="flex gap-2 p-3 border-b sticky top-0 bg-gray-900 z-10">
          <button
            onClick={() => setChatFilter("all")}
            className={`px-4 py-2 rounded-full text-sm ${
              chatFilter === "all"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-200 font-semibold"
            }`}
          >
            All messages
          </button>

          <button
            onClick={() => setChatFilter("unread")}
            className={`px-4 py-1 rounded-full text-sm flex gap-1 items-center ${
              chatFilter === "unread" ? "bg-blue-600 text-white font-semibold" : "bg-gray-200 text-black font-semibold"
            }`}
          >
            Unread
            {unreadTotal > 0 && (
              <span className="bg-white text-blue-600 text-xs py-1 px-2 rounded-full">
                {unreadTotal}
              </span>
            )}
          </button>
        </div>

        {loadingChats && <ChatSkeleton />}

        {!loadingChats && filteredChats.length === 0 && (
          <div className="p-6 text-center text-white">
            No chats here
          </div>
        )}


        {filteredChats.map(chat => {
          const other = chat.other_user;
        if (!other) return null;


          const lastMessage = chat.latest_message;
          const isMine = lastMessage?.sender_id === authUser.id;


          return (
            <div
              key={chat.id}
               onClick={() => {
                  openChat(chat);
                  setIsMinimized(false);
                }}

              className="flex gap-3 p-4 border-b hover:bg-gray-800 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center font-bold">
                {other.first_name[0]}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <div className="flex items-center gap-3">
                    {other.first_name} {other.last_name}
                   <UserStatus user={authUser} />
                    </div>

                    {/* ✅ Blocked badge inside user box */}
                  </div>
                  {lastMessage && (
                    <span className="text-xs text-white">
                      {formatTime(lastMessage.created_at)}
                    </span>
                  )}

                  
                </div>
                  {
                    !lastMessage && (
                      <p className="whitespace-nowrap text-white text-xs mt-1">Start a conversation </p>
                    )
                  }
                <div className="flex justify-between items-center mt-1 text-sm text-white">
                  
                  <div className="flex items-center gap-1 truncate">
                    {isMine && lastMessage && (
                      lastMessage.seen_at
                        ? <CheckCheck size={16} className="blue-200" />
                        : <Check size={16} />
                    )}
                    <span className="w-52 sm:w-full">
                      {getMessagePreview(lastMessage)}
                    </span>
                    {chat.block_info?.blocked_by_me && (
                    <span className="ml-2 text-xs bg-red-200 text-red-800 font-semibold px-2 py-0.5 rounded">
                      You blocked
                    </span>
                  )}
                  {chat.block_info?.blocked_me && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Blocked
                    </span>
                  )}
                  </div>

                  {chat.unread_count > 0 && activeChat?.id !== chat.id && (
                    <span className="bg-green-700 text-white text-xs py-1 px-2 rounded-full">
                      {chat.unread_count}
                    </span>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Chat Messages */}
      {activeChat && 
          <div
            className={`
              fixed z-50 bg-transparent
              transition-all duration-300 ease-in-out
              overflow-hidden

              ${isMinimized
                ? "bottom-0 right-0 h-16 w-full sm:w-[420px] rounded-t-lg"
                : "top-0 right-0 md:top-10 md:right-10 h-full w-full sm:h-[700px] sm:w-[420px] sm:rounded-lg"
              }
            `}
          >



                    <div className=" px-2 py-2 border-b bg-white rounded-tr-lg rounded-tl-lg rounded-bl-0 rounded-br-0 flex justify-between items-center bg-transparent gap-2 no-scrollbar">
                      <div className="inline-flex  items-center gap-2 py-1 sm:mx-4 mx-2 no-scrollbar">
                      <button
                        className="text-blue-600 font-semibold sm:hidden"
                        onClick={() => setActiveChat(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
      
                      </button>
                      {authUser && chatPartner &&  (
                      <Link to={`/profile/${chatPartner.id}`} className="inline-flex items-center gap-2">
                        <div className="sm:w-12 w-10 sm:h-12 h-10 rounded-full bg-blue-900 text-white text-xl flex items-center justify-center font-bold">
                          {chatPartner?.first_name?.[0] || "?"}
                        </div>
      
                        <span className="font-semibold truncate text-black">
                          {chatPartner?.first_name} {chatPartner?.last_name?.[0]}
                        </span>
                      </Link>
                    )}
      
                      </div>

                      <div className="inline-flex items-center sm:gap-3 gap-2 sm:mx-4 mx-2 ">
                                              <div className="flex items-center gap-1">
                  {/* Minimize */}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="px-1 hover:bg-gray-200 rounded"
                  >
                    —
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => {
                      setActiveChat(null);
                      setIsMinimized(false);
                    }}
                    className="px-1 hover:bg-gray-200 rounded"
                  >
                    ✕
                  </button>
                </div>

                        <button className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 text-black"  onClick={() => setShowGuide(true)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                       
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                      </svg>
                      </button>
                    <button title="Report" className="text-black p-1 bg-gray-300 rounded-full hover:bg-gray-400 " onClick={handleReportPop}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
      
                    </button>

                   <BlockButton activeChat={activeChat} authUser={authUser} chatPartner={chatPartner} setActiveChat={setActiveChat} setChats={setChats} />

                    </div>
                    </div>
      
                    <ChatWindow messages={messages} setMessages={setMessages} activeChat={activeChat} setActiveChat={setActiveChat} setChats chat={activeChat} openReport={openReport} closeReport={closeReport} handleReportPop={handleReportPop} setShowGuide={setShowGuide} setStartLive={setStartLive} startLive={startLive} showGuide={showGuide} />
                  </div>
                }
          <Toaster position="top-10" className="flex justify-center items-center mx-auto" />
    </div>
  );
}

         