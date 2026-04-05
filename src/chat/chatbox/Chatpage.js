import React, { useRef, useState, useMemo, useEffect } from "react";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";
import ActiveUsers from "./ActiveUsers";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import { initEcho } from "../../echo";


export default function ChatPage({chats, setChats, activeChat, setActiveChat}) {

  const { user: authUser } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatFilter, setChatFilter] = useState("all"); // all | unread
  const fetchedOnce = useRef(false);
  const [toast, setToast] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [disappearingOn, setDisappearingOn] = useState(false);
  const [isTyping, setIsTyping] = useState(false);



  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };


  useEffect(() => {
    api.get("/api/me")
      .finally(() => setLoadingUser(false));
  }, []);
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
  

  useEffect(() => {
  if (!authUser) return;
  const echo = initEcho();
  const channel = echo.private(`chat.${authUser.id}`);
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
    if (activeChat?.id === e.message.chat_id) {
      setMessages(prev => [...prev, e.message]);
      api.post(`/api/chats/${activeChat.id}/seen`).catch(() => {});
    }
  });
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

  const openChat = async (chat) => {
  if (chat.block_info?.blocked_me) {
    showToast("You have been blocked in this chat");
    return;
  }

  setActiveChat(chat);

  // 🔥 SAVE CHAT ID
  localStorage.setItem("lastChatId", chat.id);

  setLoadingMessages(true);

  setChats(prev =>
    prev.map(c =>
      c.id === chat.id ? { ...c, unread_count: 0 } : c
    )
  );

  try {
    const res = await api.get(`/api/chats/${chat.id}/messages`);
    setMessages(res.data || []);
    await api.post(`/api/chats/${chat.id}/seen`);
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingMessages(false);
  }
};


const restoredRef = useRef(false);

useEffect(() => {
  if (!chats.length || restoredRef.current) return;

  const lastChatId = localStorage.getItem("lastChatId");

  if (!lastChatId) return;

  const foundChat = chats.find(c => c.id === Number(lastChatId));

  if (foundChat) {
    restoredRef.current = true;
    openChat(foundChat);
  }
}, [chats]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );
  

  if (loadingUser)
    return (
     <UserSkeleton />
    );


  return (
    <div className="h-screen flex bg-white pt-20">

    {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}

      

      {/* LEFT */}
      <div className="w-80 border-r bg-white">
        <ChatList chats={chats}  openChat={openChat}
          loadingChats={loadingChats}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          unreadTotal={unreadTotal}
          activeChat ={activeChat}
          disappearingOn={disappearingOn}
          setDisappearingOn ={setDisappearingOn} />
      </div>

      {/* MIDDLE */}
      <div className="flex-1 flex flex-col">
        <MessageBox
        activeChat={activeChat}
        messages={messages}
        authUser={authUser}
        loadingMessages={loadingMessages}
        disappearingOn={disappearingOn}
        setDisappearingOn ={setDisappearingOn}
        setMessages={setMessages}
        isTyping={isTyping}
        setIsTyping={setIsTyping}
      />
   
      </div>

      {/* RIGHT */}
      <div className="w-80 border-l bg-white block">
        <ActiveUsers chats={chats} activeChat={activeChat} setActiveChat={setActiveChat} setChats={setChats}
        openChat={openChat} setDisappearingOn={setDisappearingOn} setMessages={setMessages}  />
      </div>

    </div>
  );
}