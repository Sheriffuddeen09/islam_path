import { useState } from "react";
import { useAuth } from "../layout/AuthProvider";
import MessageBubblePop from "./MessageModal";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isMe = message.sender_id === user.id;

  const sender = message.sender || { first_name: "Unknown", last_name: "", role: "unknown" };
  const firstLetter = sender.first_name ? sender.first_name[0].toUpperCase() : "?";

  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const bubbleColor = isMe ? "bg-gray-600 text-white" : "bg-blue-100 text-gray-900";

  const baseUrl = "http://localhost:8000";
  const fileUrl = message.file
    ? message.file.startsWith("http")
      ? message.file
      : `${baseUrl}/storage/${message.file}`
    : null;

  // Modal state
  const [preview, setPreview] = useState({ open: false, type: "", src: "" });

  const openPreview = (type, src) => setPreview({ open: true, type, src });
  const closePreview = () => setPreview({ open: false, type: "", src: "" });

  const renderContent = () => {
    switch (message.type) {
      case "image":
        return (
          <img
            src={fileUrl}
            className="w-32 h-auto rounded cursor-pointer"
            onClick={() => openPreview("image", fileUrl)}
          />
        );

      case "video":
        return (
          <video
            src={fileUrl}
            className="w-32 h-auto rounded cursor-pointer"
            onClick={() => openPreview("video", fileUrl)}
          />
        );

      case "audio":
      case "voice": // add this line
        return <audio src={fileUrl} controls className="w-52" />;


      case "file":
        return (
          <a href={fileUrl} target="_blank" className="underline text-blue-700">
            Download file
          </a>
        );

      default:
        return <span className="whitespace-pre-wrap w-full break-words">{message.message}</span>;
    }
  };

  const handleAction = (type, payload) => {
  
};


  return (
    <div className={`flex flex-col mb-3 ${isMe ? "items-end" : "items-start"}`}>
      <div className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <div className="w-10 h-10 rounded-full bg-blue-900 flex text-2xl items-center justify-center text-white font-semibold mr-2">
            {firstLetter}
          </div>
        )}
        <div className={`p-3 rounded-lg flex flex-col max-w-xs gap- relative ${bubbleColor}`}>
          {renderContent()}

          {/* reactions */}
          {message.reactions?.length > 0 && (
            <div className="flex gap-1 mt-1">
              {message.reactions.map((r) => (
                <span key={r.id} className="text-sm">
                  {r.reaction}
                </span>
              ))}
            </div>
          )}

          {/* time */}
          <div className="flex justify-end items-center whitespace-nowrap gap-1 mt-1 text-[8px] float-right">
            <span>{time}</span>
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

      <MessageBubblePop isMe={isMe} message={message} onAction={handleAction} />

      {/* <div className="relative group inline-block">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 bg-gray-100 text-black rounded-full -translate-x-12 -translate-y-2 ">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg> */}

    {/* <div className="absolute -top-14 w-full right-40 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-white shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
    </div>
    </div> */}
    </div>
  );
}
