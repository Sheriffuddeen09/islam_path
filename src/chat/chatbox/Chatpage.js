import React, { useRef, useState, useMemo, useEffect } from "react";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";
import ActiveUsers from "./ActiveUsers";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import useAutoScroll from "./useAutoScroll";
import ChatComponent from "./ChatComponent";

export default function ChatPage({
  chats,
  setChats,
  activeChat,
  setActiveChat
}) {
  const { user: authUser } = useAuth();

  const [messagesMap, setMessagesMap] = useState({});

  const [chatFilter, setChatFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const chatId = activeChat?.id;

  // ✅ derived messages
  const messages = messagesMap[activeChat?.id] || [];

  const { bottomRef, containerRef, handleScroll, newMessageCount } =
    useAutoScroll([messages, activeChat?.id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const [isLargeScreen, setIsLargeScreen] = useState(
    window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🚀 OPEN CHAT (NO SCROLL HERE ANYMORE)
  const openChat = async (chat) => {
    if (chat.block_info?.blocked_me) {
      showToast("You have been blocked in this chat", "error");
      return;
    }

    setActiveChat(chat);

    if (!isLargeScreen) setShowList(false);

    localStorage.setItem("lastChatId", chat.id);

    setChats(prev =>
      prev.map(c =>
        c.id === chat.id ? { ...c, unread_count: 0 } : c
      )
    );

    // ✅ CACHE HIT
    if (messagesMap[chat.id]) {
      return;
    }

    // ❌ FETCH MESSAGES
    try {
      setLoadingMessages(true);

      const res = await api.get(`/api/chats/${chat.id}/messages`);
      const msgs = res.data.messages || [];

      setMessagesMap(prev => ({
        ...prev,
        [chat.id]: msgs,
      }));
    } finally {
      setLoadingMessages(false);
    }
  };

  const restoredRef = useRef(false);

  useEffect(() => {
    if (!chats.length || restoredRef.current) return;
    if (!isLargeScreen) return;

    const lastChatId = localStorage.getItem("lastChatId");
    if (!lastChatId) return;

    const found = chats.find(c => c.id === Number(lastChatId));
    if (found) {
      restoredRef.current = true;
      openChat(found);
    }
  }, [chats]);

  // 🚀 FIXED AUTO SCROLL (THIS IS THE KEY FIX)
  useEffect(() => {
    if (!activeChat?.id) return;

    const msgs = messagesMap[activeChat.id];
    if (!msgs || msgs.length === 0) return;

    // wait for DOM paint
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
    });
  }, [activeChat?.id, messagesMap]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  if (loadingChats) return <UserSkeleton />;

  return (
    <ChatComponent
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      chats={chats}
      setChats={setChats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      setChatFilter={setChatFilter}
      chatFilter={chatFilter}
      loadingChat={loadingChats}
      loadingMessages={loadingMessages}
      unreadTotal={unreadTotal}
      authUser={authUser}
      isTyping={isTyping}
      setIsTyping={setIsTyping}
      chatId={chatId}
      setShowProfile={setShowProfile}
      showProfile={showProfile}
      setShowList={setShowList}
      showList={showList}
      bottomRef={bottomRef}
      handleScroll={handleScroll}
      newMessageCount={newMessageCount}
      containerRef={containerRef}
      setToast={setToast}
      openChat={openChat}
      messages={messages}
    />
  );
}