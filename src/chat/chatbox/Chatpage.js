import React, { useRef, useState, useMemo, useEffect } from "react";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";
import ActiveUsers from "./ActiveUsers";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import { initEcho } from "../../echo";

export default function ChatPage({
  chats,
  setChats,
  activeChat,
  setActiveChat
}) {
  const { user: authUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chatFilter, setChatFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);


  // ================= RESPONSIVE STATE =================
  const [showList, setShowList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const chatId = activeChat?.id;
  const bottomRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
        block_info: chat.block_info
          ? {
              ...chat.block_info,
              blocked_by_me: chat.block_info.blocker_id === authUser.id,
              blocked_me: chat.block_info.blocked_id === authUser.id
            }
          : null
      }));

      setChats(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (!authUser) return;
    fetchChats();
  }, [authUser]);

  // ================= OPEN CHAT =================

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

useEffect(() => {
  const handleResize = () => {
    setIsLargeScreen(window.innerWidth >= 1024);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

 const openChat = async (chat) => {
  if (chat.block_info?.blocked_me) {
    showToast("You have been blocked in this chat", "error");
    return;
  }

  setActiveChat(chat);

  // 📱 ONLY MOBILE/IPAD hides list
  if (!isLargeScreen) {
    setShowList(false);
  }

  localStorage.setItem("lastChatId", chat.id);

  setChats(prev =>
    prev.map(c =>
      c.id === chat.id ? { ...c, unread_count: 0 } : c
    )
  );

  try {
    setLoadingMessages(true);
    const res = await api.get(`/api/chats/${chat.id}/messages`);
    setMessages(res.data || []);
  } finally {
    setLoadingMessages(false);
  }
};

useEffect(() => {
    if (!loadingMessages && messages.length) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView();
      }, 100);
    }
  }, [chatId]);

  // ================= RESTORE LAST CHAT =================
  const restoredRef = useRef(false);

  useEffect(() => {
  if (!chats.length || restoredRef.current) return;

  // ❌ BLOCK AUTO-RESTORE ON MOBILE / IPAD
  if (!isLargeScreen) return;

  const lastChatId = localStorage.getItem("lastChatId");
  if (!lastChatId) return;

  const found = chats.find(c => c.id === Number(lastChatId));

  if (found) {
    restoredRef.current = true;
    openChat(found);
  }
}, [chats]);

  // ================= UNREAD TOTAL =================
  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  // ================= LOADING =================
  if (loadingChats) return <UserSkeleton />;

  // ================= UI =================
  return (
    <div className="h-screen flex bg-gray-900 ">

      {/* ================= TOAST pt-20================= */}
      {/* {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )} */}

      {/* ================= CHAT LIST ================= */}
      <div className={`
        border-r bg-white pt-3
        w-full lg:w-80
        ${showList ? "block" : "hidden lg:block"}
      `}>
        <ChatList
          chats={chats}
          openChat={openChat}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          unreadTotal={unreadTotal}
          activeChat={activeChat}
          setChats={setChats}
          loadingChats={loadingChats}
        />
      </div>

      {/* ================= MESSAGE BOX ================= */}
      <div className={`
        flex-1 flex flex-col
        ${showList ? "hidden lg:flex" : "flex"}
      `}>
        <MessageBox
          activeChat={activeChat}
          messages={messages}
          setMessages={setMessages}
          authUser={authUser}
          loadingMessages={loadingMessages}
          isTyping={isTyping}
          setIsTyping={setIsTyping}
          onHeaderClick={() => setShowProfile(true)}
          onBack={() => setShowList(true)}
          chatId={chatId}
          bottomRef={bottomRef}
          setToast={setToast}
          setActiveChat={setActiveChat}
          chats={chats}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
        />
      </div>

      {/* ================= ACTIVE USERS (DESKTOP ONLY) ================= */}
      <div className="hidden lg:block lg:w-80 border-l bg-white">
        <ActiveUsers
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          setChats={setChats}
          openChat={openChat}
          loadingChats={loadingChats}
          setMessages={setMessages}
          onBack={() => setShowProfile(false)}
        />
      </div>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && activeChat && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <ActiveUsers
          chats={chats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          setChats={setChats}
          openChat={openChat}
          loadingChats={loadingChats}
          setMessages={setMessages}
          onBack={() => setShowProfile(false)}
        />
        </div>
      )}

    </div>
  );
}