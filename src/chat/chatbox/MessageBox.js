import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChatSkeleton } from "./ChatSkeleton";
import MessageItem from "./MessageItem";

export default function MessageBox({
  activeChat,
  messages,
  authUser,
  sendMessage,
  loadingMessages, disappearingOn, setMessages
}) {
  const bottomRef = useRef();
  const navigate = useNavigate()


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
          <h3 className="font-bold text-lg">
          {activeChat.other_user?.first_name} {activeChat.other_user?.last_name}
        </h3>
        </div>
        

        <div className="flex gap-3">
          📹 📞
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">

        {/* 🔥 LOADING SKELETON */}
        {loadingMessages ? (
          <ChatSkeleton type="messages" />
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            No messages yet
          </div>
        ) : (
          messages.map(msg => {
          const isMine = msg.sender_id === authUser.id;

          return (
            <MessageItem
              key={msg.id}
              msg={msg}
              isMine={isMine}
              disappearingOn={disappearingOn}
              authUser={authUser}
              setMessages={setMessages}
              
            />
          );
        })
        )}

        <div ref={bottomRef} />
      </div>
      {/* INPUT */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full"
        >
          Send
        </button>
      </div>

    </div>
  );
}