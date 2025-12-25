import { useRef, useState } from "react";
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
  setReplyingTo
}) {

  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const [open, setOpen] = useState(false)
  const [showReactions, setShowReactions] = useState(null)
  const { user } = useAuth();
  const isMe = message.sender_id === user.id;
  const [preview, setPreview] = useState({ open: false, type: "", src: "" });

  const openPreview = (type, src) => setPreview({ open: true, type, src });
  const closePreview = () => setPreview({ open: false, type: "", src: "" });

   const handleOpen = () =>{
    setOpen(!open)
  }

  const react = async (messageId, emoji) => {
  const { data } = await api.post("/api/messages/react", {
    message_id: messageId,
    emoji,
  });

  setMessages(prev =>
    prev.map(m => (m.id === data.id ? data : m))
  );

  setShowReactions(null);
};


  const forwardMessages = async (messageIds, receiverIds) => {
  try {
    const res = await api.post("/api/messages/forward-multiple", {
      message_ids: messageIds,
      receiver_ids: receiverIds,
    });

    toast.success("Messages forwarded");

    const chats = res.data.chats; // full chat objects

    // Open the first forwarded chat
    if (chats.length > 0) {
      setActiveChat(chats[0]);       // sets chat header correctly
      setMessages(chats[0].messages); // show latest messages including forwarded
    }

    setSelectedMessages([]);
    setForwardModalOpen(false);
  } catch (err) {
    console.error(err.response?.data || err);
    toast.error("Failed to forward messages");
  }
};


const scrollToMessage = (id) => {
  const el = document.getElementById(`message-${id}`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  el.classList.add("reply-highlight");
  setTimeout(() => {
    el.classList.remove("reply-highlight");
  }, 1200);
};


const renderReply = (
  <div>
      {message.replied_message && (
  <div
    className="mb-2 p-2 rounded bg-black/30 border-l-4 border-blue-400 text-xs cursor-pointer hover:bg-black/40 transition"
    onClick={() => scrollToMessage(message.replied_message.id)}
  >
    <p className="font-semibold text-blue-300">
      {message.replied_message.sender.first_name}
    </p>

    {/* TEXT */}
    {message.replied_message.type === "text" && (
      <p className="truncate opacity-80">
        {message.replied_message.message}
      </p>
    )}

    {/* IMAGE */}
    {message.replied_message.type === "image" && (
      <div className="flex items-center gap-2 opacity-80">
        <span>🖼</span>
        <span>Photo</span>
      </div>
    )}

    {/* VOICE / AUDIO */}
    {(message.replied_message.type === "voice" ||
      message.replied_message.type === "audio") && (
      <div className="flex items-center gap-2 opacity-80">
        <span>🎤</span>
        <span>Voice message</span>
      </div>
    )}

    {/* VIDEO */}
    {message.replied_message.type === "video" && (
      <div className="flex items-center gap-2 opacity-80">
        <span>🎥</span>
        <span>Video</span>
      </div>
    )}

    {/* FILE */}
    {message.replied_message.type === "file" && (
      <div className="flex items-center gap-2 opacity-80">
        <span>📎</span>
        <span>File</span>
      </div>
    )}
  </div>
)}
</div>
    );

    const emojiarray = (
      <div className="bg-white">
      {message.reactions?.length > 0 && (
  <div className="flex gap-1 mt-1 bg-black/30 rounded-full px-2 py-0.5 text-xs relative">
    {Object.entries(
      message.reactions.reduce((acc, r) => {
        acc[r.emoji] = (acc[r.emoji] || 0) + 1;
        return acc;
      }, {})
    ).map(([emoji, count]) => (
      <span key={emoji}>
        {emoji} {count}
      </span>
    ))}
    
  </div>
)}

</div>
    )

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

  const content = (
    <div className={`flex flex-col mb-3 ${isMe ? "items-end" : "items-start"} relative`}>
      <div className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <div className="w-10 h-10 rounded-full bg-blue-900 flex text-2xl items-center justify-center text-white font-semibold mr-2">
            {firstLetter}
          </div>
        )}
      <div>
        <div className={`p-3 rounded-lg flex flex-col max-w-xs gap-1 relative ${bubbleColor}`}>
          {message.forwarded_from && <span className="text-xs text-gray-400 mb-1">Forwarded</span>}
          {/* Reply to */}
           {renderReply}
          
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
          <div className={`flex  flex-col mb-3 ${isMe ? "items-end" : "items-start"} group relative inline-block" `}>
      {emojiarray}
      <button className="bg-gray-800 w-8 mt-2 p-1 rounded-full hover:bg-gray-900">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
        <path fill-rule="evenodd" d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clip-rule="evenodd" />
      </svg>
      </button>
      

        {/* Forward Icon & Button */}
        <div className={`flex flex-row mb-3 ${isMe ? "items-end right-0" : "items-start left-0"} absolute -bottom-12 w bg-white bg-opacity-30 opacity-0 group-hover:opacity-100 group-hover:translate-y-2 transform transition-all duration-500 invisible group-hover:visible p-2 rounded-lg shadow-md gap-3 inline-flex items-center`}>
          {selectedMessages.includes(message) && selectedMessages.length > 0 && (
            <button
              className="text-white text-sm underline whitespace-nowrap"
              onClick={() => setForwardModalOpen(true)}
            >
              Forward ({selectedMessages.length})
            </button>
          )}
          <button
            onClick={() => toggleSelect(message)}
            className="bg-gray-800 p-1 rounded-full hover:bg-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
          <button onClick={() => setShowReactions(message.id)} className="bg-gray-800 p-0.5 rounded-full hover:bg-gray-900">
            😮
          </button>
           <button onClick={() => {setReplyingTo(message); setOpen(false)}}  className="bg-gray-800 p-1 rounded-full hover:bg-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7.49 12 3.74 8.248m0 0 3.75-3.75m-3.75 3.75h16.5V19.5" />
        </svg>

      </button>

      {/* Message action menu */}

      <button
        onClick={handleOpen}
        className="bg-gray-800 p-1 rounded-full hover:bg-gray-900"
      >
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
  <path fill-rule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clip-rule="evenodd" />
</svg>

      </button>
     
        </div>
      </div>
        </div>

        {isMe && (
          <div className="w-10 h-10 rounded-full bg-black flex text-2xl items-center justify-center text-white font-semibold ml-2">
            {firstLetter}
          </div>
        )}
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
     

     {/* Emoji Pop up */}

     {showReactions === message.id && (
  <div className="absolute bottom-6 right-0 bg-black rounded-full flex gap-2 p-2 z-50">
    {EMOJIS.map(emoji => (
      <button
        key={emoji}
        onClick={() => react(message.id, emoji)}
        className="text-lg hover:scale-125 transition"
      >
        {emoji}
      </button>
    ))}
    <button className="absolute -bottom-6 rounded-full right-0 bg-gray-800 text-white" onClick={() => setShowReactions(null)}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
</svg>
</button>
  </div>
)}



      {/* message modal */}
     {open && (
  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
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
      setReplyingTo={setReplyingTo}
    />
  </div>
)}

      {/* Forward Modal */}
      { forwardModalOpen &&(
      <ForwardModal
          messages={selectedMessages}
          users={users}
          onSend={(selectedUserIds) => {
            forwardMessages(selectedMessages.map(m => m.id), selectedUserIds);
          }}
          onClose={() => setForwardModalOpen(false)}
        />)
}

      
      <Toaster position="top-right" />
    </div>
  );

  return(
    <div>
      <div className="mb-10 text-center mx-auto bg-gray-700 text-white rounded-lg w-80 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
      {content}
    </div>
  )
}
