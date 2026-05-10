import  { useRef, useState, useMemo, useEffect } from "react";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import ChatComponent from "./ChatComponent";
import { initEcho } from "../../echo";

export default function ChatPage({
  chats,
  setChats,
  activeChat,
  setActiveChat
}) {
  const { user: authUser } = useAuth();



  const [chatFilter, setChatFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const chatId = activeChat?.id;
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [messagesMap, setMessagesMap] = useState({});

  const messages = Array.isArray(messagesMap[activeChat?.id])
    ? messagesMap[activeChat?.id]
    : [];


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

  if (activeChat?.id === chat.id) {
    return;
  }

  if (chat.block_info?.blocked_me) {
    showToast(
      "You have been blocked in this chat",
      "error"
    );
    return;
  }

  setActiveChat(chat);

  if (!isLargeScreen) {
    setShowList(false);
  }

  localStorage.setItem("lastChatId", chat.id);

  // ✅ reset unread in sidebar
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id
        ? { ...c, unread_count: 0 }
        : c
    )
  );

  const cached = messagesMap[chat.id];

  // ✅ SHOW CACHE INSTANTLY
  if (cached?.length > 0) {

    const sortedCached = [...cached]
      .sort((a, b) => a.id - b.id);

    setMessages(sortedCached);

    setLastReadMessageId(
      chat.last_read_message_id || null
    );

    setUnreadCount(
      chat.unread_count || 0
    );

    // ✅ SCROLL AFTER RENDER
    setTimeout(() => {

      // find first unread message
      const firstUnread = sortedCached.find(
        msg =>
          chat.last_read_message_id &&
          msg.id > chat.last_read_message_id
      );

      if (firstUnread) {

        // scroll to first unread
        messageRefs.current[firstUnread.id]
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

      } else {

        // no unread -> bottom
        messagesEndRef.current
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }

    }, 100);

  } else {

    setLoadingMessages(true);

    setMessages([]);
  }

  try {

    // ✅ FETCH LATEST
    const res = await api.get(
      `/api/chats/${chat.id}/messages`
    );

    const msgs = (
      res.data.messages || []
    ).sort((a, b) => a.id - b.id);

    setMessages(msgs);

    setMessagesMap(prev => ({
      ...prev,
      [chat.id]: msgs,
    }));

    setLastReadMessageId(
      res.data.last_read_message_id
    );

    setUnreadCount(
      res.data.unread_count || 0
    );

    // ✅ WAIT FOR DOM RENDER
    setTimeout(() => {

      const firstUnread = msgs.find(
        msg =>
          res.data.last_read_message_id &&
          msg.id > res.data.last_read_message_id
      );

      if (firstUnread) {

        // scroll to first unread
        messageRefs.current[firstUnread.id]
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

      } else {

        // no unread -> bottom
        messagesEndRef.current
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }

    }, 100);

  } catch (err) {

    console.error(err);

  } finally {

    setLoadingMessages(false);
  }

  // ✅ mark read silently
  api.post(`/api/chats/${chat.id}/read`)
    .catch(err => {
      console.error(
        "Failed to mark as read",
        err
      );
    });
};



useEffect(() => {
  if (!messages.length) return;

  // 🔥 CASE 1: There are unread messages
  if (unreadCount > 0 && lastReadMessageId) {
    const firstUnread = messages.find(
      (m) => m.id > lastReadMessageId
    );

    if (firstUnread) {
      const el = messageRefs.current[firstUnread.id];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }

  // 🔥 CASE 2: No unread → go to bottom
  const lastMsg = messages[messages.length - 1];
  const el = messageRefs.current[lastMsg.id];
  el?.scrollIntoView({ behavior: "smooth" });

}, [messages, unreadCount, lastReadMessageId]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  const setMessages = (chatId, updater) => {
  setMessagesMap(prev => {
    const current = prev[chatId] || [];

    const updated =
      typeof updater === "function"
        ? updater(current)
        : updater;

    return {
      ...prev,
      [chatId]: updated,
    };
  });
};


  if (loadingChats) return <UserSkeleton />;

  return (
    <ChatComponent
      messageRefs={messageRefs}
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
      bottomRef={messagesEndRef}
      setToast={setToast}
      openChat={openChat}
      messages={messages}
      setMessages={(updater) => setMessages(activeChat?.id, updater)}
      unreadCount={unreadCount} setUnreadCount={setUnreadCount}
      lastReadMessageId={lastReadMessageId}
      setLastReadMessageId={setLastReadMessageId}
    />
  );
}