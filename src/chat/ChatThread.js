import MessageBubble from "./MessageBubble";
import { useTyping } from "./UseTyping";
import logo from "../layout/image/favicon.png";
import { useEffect, useRef } from "react";

export default function ChatThread({ chatId, messages, loading, setMessages, setActiveChat, activeChat, setChats, chat }) {
  const typing = useTyping(chatId);
  const bottomRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    if (!loading && messages?.length) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [chatId, messages, loading]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 h-[360px]">
        <MessageSkeleton />
      </div>
    );
  }

  /* ================= EMPTY ================= */
  if (!Array.isArray(messages) || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <img src={logo} alt="Logo" className="h-14 mb-4 opacity-80" />

        <h2 className="text-2xl font-semibold text-white mb-2">
          Welcome to Chat Box
        </h2>

        <p className="text-white max-w-md">
          Messages, live class discussions, and updates will appear here.
        </p>
      </div>
    );
  }

  /* ================= MESSAGES ================= */
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col h-[460px] gap-2 no-scrollbar">

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} setMessages={setMessages} messages={messages} 
        activeChat={activeChat} setActiveChat={setActiveChat} setChats={setChats} chat={chat} />
      ))}

      {typing && (
        <div className="text-xs italic translate-y-8 text-white px-3">
          Typing...
        </div>
       )}

      {/* SCROLL TARGET */}
      <div ref={bottomRef} />

      <style>
{`
  .no-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }

  .no-scrollbar {
    -ms-overflow-style: none;  /* IE & Edge */
    scrollbar-width: none;     /* Firefox */
  }
`}
</style>

    </div>
  );
}
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`h-10 rounded-lg ${
            i % 2 === 0
              ? "bg-gray-300 w-2/3 self-start"
              : "bg-blue-200 w-1/2 self-end"
          }`}
        />
      ))}
    </div>
  );
}
