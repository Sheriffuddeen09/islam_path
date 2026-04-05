import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";
import ReactionPopup from "./ReactionPopup";
import VoiceUI from "./VoiceUi";

export default function MessageItem({
  msg,
  isMine,
  setMessages,
  chatId,
  activeChat
}) {
  const [showReaction, setShowReaction] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isPinned, setIsPinned] = useState(!!msg.is_pinned);
  const [preview, setPreview] = useState(null); // {type, url}


  const pressTimer = useRef(null);
  const audioRef = useRef(null);

  // ================= SWIPE TO REPLY =================
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    handlePressStart();
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    handlePressEnd();

    const diff = touchEndX.current - touchStartX.current;

    // swipe right = reply trigger
    if (!isMine && diff > 60) {
      console.log("Reply triggered", msg);
      // TODO: connect to parent reply handler
    }
  };

  // ================= STATUS =================
  const updateStatus = (id, status) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const replaceMessage = (id, newMsg) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...newMsg, status: "sent" } : m));
  };

  // ================= RETRY =================
  const resendText = async () => {
    updateStatus(msg.id, "sending");

    try {
      const { data } = await api.post("/api/messages", {
        chat_id: chatId,
        message: msg.message,
        type: "text",
      });

      replaceMessage(msg.id, data);
    } catch {
      updateStatus(msg.id, "failed");
    }
  };

  const retryMessage = () => {
    resendText();
  };

  // ================= PIN MESSAGE =================
  const togglePin = async () => {
    const { data } = await api.post("/api/messages/pin", {
      message_id: msg.id
    });

    setIsPinned(data.is_pinned);
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_pinned: data.is_pinned } : m));
  };

  // ================= LONG PRESS REACTION =================
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowReaction(true), 500);
  };

  const handlePressEnd = () => clearTimeout(pressTimer.current);

  const react = async (emoji) => {
    const { data } = await api.post("/api/messages/react", {
      message_id: msg.id,
      emoji,
    });

    setMessages(prev => prev.map(m => m.id === data.id ? data : m));
    setShowReaction(false);
  };

  // ================= VOICE SPEED =================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const toggleSpeed = () => {
    setShowSpeed(!showSpeed);
  };

  const changeSpeed = (val) => {
    setSpeed(val);
    setShowSpeed(false);

    if (audioRef.current) {
      audioRef.current.playbackRate = val;
    }
  };

  // ================= STATUS =================
  const renderStatus = () => {
    if (!isMine) return null;

    if (msg.status === "sending") return "⏳";
    if (msg.status === "sent") return "✔✔";
    if (msg.status === "seen") return <span className="text-blue-500">✔✔</span>;

    if (msg.status === "failed") {
      return (
        <button onClick={retryMessage} className="text-red-500">
          Retry
        </button>
      );
    }
  };

  

  return (
      <>
  
        {/* ================= MEDIA PREVIEW MODAL ================= */}
        {preview && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <button
              onClick={() => setPreview(null)}
              className="absolute top-5 right-5 text-white text-2xl"
            >
              ✖
            </button>
  
            {preview.type === "image" && (
              <img src={preview.url} className="max-h-[90%] max-w-[90%] rounded" />
            )}
  
            {preview.type === "video" && (
              <video
                src={preview.url}
                controls
                autoPlay
                className="max-h-[90%] max-w-[90%] rounded"
              />
            )}
          </div>
        )}
  
        {/* ================= MESSAGE ================= */}
        <div
          className={`flex ${isMine ? "justify-end" : "justify-start"} relative`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={`relative p-2 rounded-lg max-w-xs ${isMine ? "bg-green-200" : "bg-gray-200"}`}>
  
            {/* PIN ICON */}
            {isPinned && <div className="text-xs text-yellow-600">📌 Pinned</div>}
  
            {/* TEXT */}
            {msg.type === "text" && <p className="text-sm">{msg.message}</p>}
  
            {/* IMAGE */}
            {msg.type === "image" && (
              <img
                src={msg.local || msg.file_url}
                className="w-40 rounded cursor-pointer"
                onClick={() => setPreview({ type: "image", url: msg.local || msg.file_url })}
              />
            )}
  
            {/* VIDEO */}
            {msg.type === "video" && (
              <video
                src={msg.local || msg.file_url}
                className="w-40 rounded cursor-pointer"
                onClick={() => setPreview({ type: "video", url: msg.local || msg.file_url })}
              />
            )}
  
            {/* VOICE */}
            {msg.type === "voice" && <VoiceUI msg={msg} isMine={isMine} />}
  
            {/* ACTIONS */}
            <div className="flex justify-between text-xs mt-1">
              <button onClick={togglePin}>📌</button>
              {renderStatus()}
            </div>
  
            {/* REACTIONS */}
            {showReaction && (
              <div className="absolute -top-10 left-0">
                <ReactionPopup onReact={react} />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  