import MessageBubble from "./MessageBubble";
import { useTyping } from "./UseTyping";
import logo from "../layout/image/favicon.png";
import { useEffect, useRef, useState } from "react";
import api from "../Api/axios";

export default function ChatThread({ chatId, setReplyingTo, replyingTo, messages, loading, setMessages, setActiveChat, activeChat, setChats, chat }) {
  const typing = useTyping(chatId);
  const bottomRef = useRef(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);

function toggleSelect(msg) {
  setSelectedMessages(prev =>
    prev.includes(msg)
      ? prev.filter(m => m !== msg)
      : [...prev, msg]
  );
}

const [users, setUsers] = useState([]);

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  fetchUsers();
}, []);

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
        <div className="mb-10 text-center mx-auto bg-gray-700 text-white rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
        <img src={logo} alt="Logo" className="h-14 mb-4 opacity-80" />

        <h2 className="text-2xl font-semibold text-white mb-2">
          Welcome to Chat Box
        </h2>

        <p className="text-white max-w-md">
          Messages, and updates will appear here.
        </p>
        <div className="mt-6 mb-16 text-sm text-white">
          💬 Stay connected • 📚 Learn together • 🔔 Get instant updates
        </div>
      </div>
    );
  }

  /* ================= MESSAGES ================= */
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col sm:h-[340px] h-full gap-2 no-scrollbar">
      <div className="mb-10 text-center mx-auto bg-gray-700 text-white rounded-lg w-80 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} setMessages={setMessages} messages={messages} 
        activeChat={activeChat} setActiveChat={setActiveChat} setChats={setChats} chat={chat}
        selectedMessages={selectedMessages} setForwardModalOpen={setForwardModalOpen} forwardModalOpen={forwardModalOpen} // ✅ MUST PASS
        toggleSelect={toggleSelect} setSelectedMessages={setSelectedMessages} users={users} 
        setReplyingTo={setReplyingTo}  replyingTo={replyingTo}    // ✅ MUST PASS
        />
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