import { useEffect, useState } from "react";
import api from "../Api/axios";
import ChatInput from "./ChatInput";
import { initEcho } from "../echo";
import ChatThread from "./ChatThread";
import { ReportModal } from "./ReportModal";

export default function ChatWindow({ messages, setMessages, chat, setChats, setActiveChat, showGuide, setShowGuide, startLive, setStartLive, activeChat, openReport, closeReport }) {
 
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // store message being replied to

  useEffect(() => {
  if (!chat) return;

  setLoadingMessages(true);

  // Fetch previous messages
  api
    .get(`/api/chats/${chat.id}/messages`)
    .then(res => {
      setMessages(res.data);
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      setLoadingMessages(false);
    });

  // Initialize Echo
  const echo = initEcho();
  const channel = echo.private(`chat.${chat.id}`);

  // Listen for new messages
  channel.listen(".new-message", (e) => {
    setMessages(prev => [...prev, e.message]);
  });

  // Cleanup
  return () => {
    echo.leave(`chat.${chat.id}`);
  };
}, [chat]);

  useEffect(() => {
  if (window.JitsiMeetExternalAPI) return;

  const script = document.createElement("script");
  script.src = "https://meet.jit.si/external_api.js";
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);


  useEffect(() => {
  if (!startLive || !chat) return;
  if (!window.JitsiMeetExternalAPI) return;

  const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
    roomName: `LiveClass-${chat.id}`,
    parentNode: document.getElementById("jitsi-container"),
    width: "100%",
    height: 400,
  });

  api.addEventListener("readyToClose", () => {
    setStartLive(false); // auto close when call ends
  });

  return () => api.dispose();
}, [startLive, chat]);

const handleSend = async (newMessage) => {
  setMessages((prev) => [...prev, newMessage]);
};


  return (
    <>

      {/* Jitsi */}
     {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ">
          <div className="bg-white max-w-md w-full rounded-xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-center">
              How to Use Live Video Class
            </h2>

            <ul className="space-y-3 text-gray-700 text-sm">
              <li>🎥 Allow camera and microphone access</li>
              <li>🔊 Use headphones for better sound</li>
              <li>📱 Works on mobile and desktop</li>
              <li>🧑‍🏫 Teacher starts, students can join</li>
              <li>❌ Close tab to leave the class</li>
            </ul>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 text-gray-600 hover:text-black"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowGuide(false);
                  setStartLive(true);
                }}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Live Class
              </button>
            </div>
          </div>
        </div>
      )}
      {startLive && (
  <div
    id="jitsi-container"
    className="w-full h-[400px] bg-black"
  />
)}

      {openReport && (
              <ReportModal
                  chat={chat}
                  onClose={closeReport}
              />
        )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-900 no-scrollbar">
          <ChatThread messages={messages} setReplyingTo={setReplyingTo} replyingTo={replyingTo} chat={chat} setChats={setChats} setActiveChat={setActiveChat} activeChat={activeChat} chatId={chat.id} loading={loadingMessages} setMessages={setMessages} />
      </div>

      
      {/* Input */}
      <ChatInput chatId={chat.id}  activeChat={activeChat} setActiveChat={setActiveChat} setChats={setChats} setReplyingTo={setReplyingTo} replyingTo={replyingTo} setMessages={setMessages} onSend={handleSend}
         />
    </>
  );
}
