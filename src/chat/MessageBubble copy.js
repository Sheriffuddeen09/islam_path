import { useState } from "react";
import { useAuth } from "../layout/AuthProvider";
import MessageBubblePop from "./MessageModal";
import { ForwardModal } from "./ForwardMessage";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function MessageBubble({
  message,
  setMessages,
  messages,
  setChats,
  setActiveChat,
  activeChat,
  chat,
  selectedMessages,
  toggleSelect,
  setForwardModalOpen,
  forwardModalOpen,
  setSelectedMessages,
  users,
}) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth();
  const isMe = message.sender_id === user.id;
  const [preview, setPreview] = useState({ open: false, type: "", src: "" });

  const openPreview = (type, src) => setPreview({ open: true, type, src });
  const closePreview = () => setPreview({ open: false, type: "", src: "" });

  const forwardMessages = async (messageIds, receiverIds) => {
  try {
    const res = await api.post("/api/messages/forward-multiple", {
      message_ids: messageIds,      // array of message IDs
      receiver_ids: receiverIds,    // array of user IDs
    });

    toast.success("Messages forwarded!");

    // Auto-open first chat
    const firstChatId = res.data.chat_ids[0];
    setActiveChat(firstChatId);

    // Highlight forwarded messages
    setMessages((prev) =>
      prev.map((m) =>
        messageIds.includes(m.id) ? { ...m, forwarded: true } : m
      )
    );

    setSelectedMessages([]);
    setForwardModalOpen(false);
  } catch (err) {
    console.error(err.response?.data || err);
    toast.error("Failed to forward messages");
  }
};


  const sender = message.sender || { first_name: "Unknown", last_name: "", role: "unknown" };
  const firstLetter = sender.first_name ? sender.first_name[0].toUpperCase() : "?";
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const bubbleColor = isMe ? "bg-gray-600 text-white" : "bg-blue-800 text-white";
  const baseUrl = "http://localhost:8000";
  const fileUrl = message.file
    ? message.file.startsWith("http")
      ? message.file
      : `${baseUrl}/storage/${message.file}`
    : null;

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return <img src={fileUrl} className="w-32 h-auto rounded cursor-pointer" onClick={() => openPreview("image", fileUrl)} />;
      case "video":
        return <video src={fileUrl} className="w-32 h-auto rounded cursor-pointer" onClick={() => openPreview("video", fileUrl)} />;
      case "audio":
      case "voice":
        return <audio src={fileUrl} controls className="w-52" />;
      case "file":
        return <a href={fileUrl} target="_blank" className="underline text-blue-700">Download file</a>;
      default:
        return <span className="whitespace-pre-wrap w-full break-words">{message.message}</span>;
    }
  };

  return (
    <div className={`flex flex-col mb-3 ${isMe ? "items-end" : "items-start"} relative`}>
      <div className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <div className="w-10 h-10 rounded-full bg-blue-900 flex text-2xl items-center justify-center text-white font-semibold mr-2">
            {firstLetter}
          </div>
        )}

        <div className={`p-3 rounded-lg flex flex-col max-w-xs gap-1 relative ${bubbleColor}`}>
          {message.forwarded_from && <span className="text-xs text-gray-400 mb-1">Forwarded</span>}
          {renderContent()}

          {message.reactions?.length > 0 && (
            <div className="flex gap-1 mt-1">
              {message.reactions.map(r => (
                <span key={r.id} className="text-sm">{r.reaction}</span>
              ))}
            </div>
          )}

          <div className="flex justify-end items-center whitespace-nowrap gap-1 mt-1 text-[8px] float-right">
            <span>{time}</span>
          </div>
        </div>

        {isMe && (
          <div className="w-10 h-10 rounded-full bg-black flex text-2xl items-center justify-center text-white font-semibold ml-2">
            {firstLetter}
          </div>
        )}

        {/* Forward Icon & Button */}
        <div className="absolute bottom-4 right-20 gap-3 inline-flex items-center">
          {selectedMessages.includes(message) && selectedMessages.length > 0 && (
            <button
              className="text-blue-200 underline"
              onClick={() => setForwardModalOpen(true)}
            >
              Forward ({selectedMessages.length})
            </button>
          )}
          <button
            onClick={() => toggleSelect(message)}
            className="bg-gray-800 p-1 rounded-full hover:bg-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {preview.open && (
        <div
          onClick={closePreview}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-pointer"
        >
          {preview.type === "image" ? (
            <img src={preview.src} className="max-h-[90vh] max-w-[90vw]" />
          ) : (
            <video src={preview.src} controls autoPlay className="max-h-[90vh] max-w-[90vw]" />
          )}
        </div>
      )}

      {/* Forward Modal */}
      {forwardModalOpen && (
        <ForwardModal
          messages={selectedMessages}
          users={users}
          onSend={(recipient) => forwardMessages(selectedMessages.map(m => m.id), recipient.id)}
          onClose={() => setForwardModalOpen(false)}
        />
      )}

      {/* Message action menu */}
      <MessageBubblePop
        user={user}
        users={users}
        chat={chat}
        currentUserId={user.id}
        authUser={user}
        isMe={isMe}
        message={message}
        setMessages={setMessages}
        messages={messages}
        setChats={setChats}
        setActiveChat={setActiveChat}
        selectedMessages={selectedMessages}
        setForwardModalOpen={setForwardModalOpen}
        activeChat={activeChat}
        open={open}
        setOpen={setOpen}
      />

      <Toaster position="top-right" />
    </div>
  );
}
