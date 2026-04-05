import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatSkeleton } from "./ChatSkeleton";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import api from "../../Api/axios";
import { PinnedMessagesBar } from "./PinnedMessagesBar";

export default function MessageBox({
  activeChat,
  messages,
  authUser,
  setMessages,
  loadingMessages,
  isTyping,
  setIsTyping
}) {
  const bottomRef = useRef();
  const navigate = useNavigate()

  const chatId = activeChat?.id;

const seenRef = useRef(new Set());
const messageRefs = useRef({});

const handleScrollToMessage = (msg) => {
  const el = messageRefs.current[msg.id];

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    // optional highlight effect
    el.classList.add("bg-yellow-200");

    setTimeout(() => {
      el.classList.remove("bg-yellow-200");
    }, 1500);
  }
};

useEffect(() => {
  if (!activeChat || !messages.length) return;

  const unseenMessages = messages.filter(
    m =>
      m.sender_id !== authUser.id &&
      m.status !== "seen" &&
      !seenRef.current.has(m.id)
  );

  unseenMessages.forEach((msg) => {
    seenRef.current.add(msg.id);

    api.post(`/api/messages/${msg.id}/seen`);
  });

  setMessages(prev =>
    prev.map(m =>
      unseenMessages.find(x => x.id === m.id)
        ? { ...m, status: "seen" }
        : m
    )
  );

}, [messages, activeChat]);

useEffect(() => {
  if (!chatId) return;

  const channel = window.Echo.private(`chat.${chatId}`)
    .listen("MessageSeen", (e) => {
      setMessages(prev =>
        prev.map(m =>
          m.id === e.message_id
            ? { ...m, status: "seen" }
            : m
        )
      );
    });

  return () => {
    window.Echo.leave(`chat.${chatId}`);
  };
}, [chatId]);

 

  const messageContainerRef = useRef();

  const isUserAtBottom = () => {
  const el = messageContainerRef.current;
  if (!el) return true;

  return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
};

useEffect(() => {
  const el = messageContainerRef.current;
  if (!el) return;

  const shouldScroll = isUserAtBottom();

  if (shouldScroll) {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  }
}, [messages]);

useEffect(() => {
  const el = messageContainerRef.current;
  if (!el) return;

  const isAtBottom =
    el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

  if (isAtBottom) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

}, [messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }

  
  return (
    <div className="flex flex-col h-full text-black">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <div className="inline-flex gap-6 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
          stroke="currentColor" class="size-6 cursor-pointer" onClick={() =>navigate('/')}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
          <div className="flex items-center gap-2">
            <h3>{activeChat.other_user?.first_name}</h3>

            {activeChat.other_user?.is_online ? (
              <span className="text-green-500 text-sm">● Online</span>
            ) : (
              <span className="text-gray-400 text-sm">Last seen recently</span>
            )}
          </div>
        </div>
        

        <div className="flex gap-3">
          📹 📞
        </div>
      </div>

      {/* MESSAGES */}
      <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar"
        >
        <PinnedMessagesBar messages={messages} onSelect={handleScrollToMessage} />

        {/* 🔥 LOADING SKELETON */}
        {loadingMessages ? (
          <ChatSkeleton type="messages" />
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            No messages yet
          </div>
        ) : (
          messages.map(msg => {
          return (
             <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
            >
            <MessageItem
              key={msg.id}
              msg={msg}
              authUser={authUser}
              isMine={msg.sender_id === authUser.id}
              setMessages={setMessages}
              chatId={activeChat.id}
              isTyping={isTyping}
              
            />
            </div>
          );
        })
        )}

        <div ref={bottomRef} />
      </div>
      {/* INPUT */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <ChatInput
        chatId={activeChat.id}
        authUser={authUser}
        setMessages={setMessages}
        setIsTyping={setIsTyping}
        bottomRef={bottomRef}
      />
      </div>

    </div>
  );
}