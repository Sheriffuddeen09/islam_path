import { useState, useRef, useEffect } from "react";
import api from "../Api/axios";
import VoiceNote from "./VoiceNote";

export default function ChatInput({ setReplyingTo, replyingTo, chatId, onSend, setMessages }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sending, setSending] = useState(false);

  const typingTimeout = useRef(null);

  const handleTyping = () => {
    api.post("/api/messages/typing", { chat_id: chatId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 1500);
  };

  const sendMessage = async () => {
  if (!text.trim() && !file) return;

  const form = new FormData();
  form.append("chat_id", chatId);
  if (file) form.append("type", file.type.split("/")[0]);
  else form.append("type", "text");
  if (text) form.append("message", text);
  if (file) form.append("file", file);
  if (replyingTo) form.append("replied_to", replyingTo.id);

  try {
    setSending(true);
    const { data } = await api.post("/api/messages", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (file) setUploadProgress(Math.round((e.loaded * 100) / e.total));
      },
    });

    // Update parent messages
    if (onSend) onSend(data);

    setText("");
    setFile(null);
    setUploadProgress(0);
    setReplyingTo(null);

  } catch (err) {
    console.error(err);
  } finally {
    setSending(false);
  }
};

const textareaRef = useRef(null);

useEffect(() => {
  if (replyingTo && textareaRef.current) {
    textareaRef.current.focus();
  }
}, [replyingTo]);


  return (
    <div className="p-3 mb-4 -translate-y-16 bg-gray-900">
      
      {/* Reply preview */}
      {replyingTo && (
  <div className="bg-black/30 p-2 rounded mb-2 flex justify-between items-center">
    <div className="text-xs">
      <p className="text-blue-400 font-semibold">
        Replying to {replyingTo.sender.first_name}
      </p>
      <p className="truncate opacity-80">
        {replyingTo.type === "text"
          ? replyingTo.message
          : replyingTo.type === "image"
          ? "🖼 Photo"
          : replyingTo.type === "voice"
          ? "🎤 Voice message"
          : replyingTo.type}
      </p>
    </div>

    <button
      onClick={() => setReplyingTo(null)}
      className="text-red-400 text-sm"
    >
      ✕
    </button>
  </div>
)}

      {file && <span className="text-sm text-gray-700 pb-2">{file.name}</span>}
      {uploadProgress > 0 && (
        <div className="h-1 bg-gray-200 rounded mb-4">
          <div
            className="h-1 bg-green-500 rounded transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}


      <div className="pt-2  mb-2 flex relative gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
           className={`flex-1 border rounded-lg px-3 py-5 -mb-4 text-sm text-black resize-none transition-all duration-200
                    ${text.split(/\s+/).length > 70 ? "h-40" : "h-16"}  ${sending ? "bg-gray-100 cursor-not-allowed" : ""}
                  `}
          placeholder="Type a message…"
        />

        <div className="inline-flex items-center absolute top-2 right-4 gap">
          {/* File input */}
          <label className="cursor-pointer px-3 py-2 rounded">
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])} // just select file, don't send yet
              accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="sm:w-4 sm:h-4 w-4 h-4 text-black hover:text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75 7.409 10.591a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </label>

          {/* Record Vioce note mb */}

          <VoiceNote chatId={chatId} onNewMessage={(message) => setMessages(prev => [...prev, message])} />

          {/* Send button */}
          <button
            onClick={sendMessage}
            className="px-4 py-2 rounded flex items-center justify-center"
            disabled={sending || (!text.trim() && !file)}
          >
            {sending ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-900 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="text-blue-800"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="sm:w-4 sm:h-4 w-4 h-4 text-blue-700 hover:text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
