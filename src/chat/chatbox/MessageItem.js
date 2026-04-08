import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";
import ReactionPopup from "./ReactionPopup";
import VoiceUI from "./VoiceUi";
import MessageComponent from "./MessageComponent";
import { useUserOnlineStatus } from "../online/UseUserOnlineStatus";
import { Check, CheckCheck, CheckCheckIcon } from "lucide-react";

export default function MessageItem({
  msg, authUser,
  isMine,
  setMessages,
  chatId,
  activeChat,
  setToast,
  setActiveChat,
  chats, searchQuery, setSearchQuery, searchMode, setSearchMode, forwardMode, setReplyingTo,
  selectedMessages, setForwardMode,setSelectedMessages, forwardMessage, setForwardMessage
}) {
  const [showReaction, setShowReaction] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isPinned, setIsPinned] = useState(!!msg.is_pinned);
  const [preview, setPreview] = useState(null); // {type, url}
  const [showMenuId, setShowMenuId] = useState(null);
  const [showMore, setShowMore] = useState(false);

  

    const toggleSelect = (message) => {
  setSelectedMessages(prev => {
    const exists = prev.some(m => m.id === message.id);

    if (exists) {
      return prev.filter(m => m.id !== message.id);
    }

    return [...prev, message];
  });
};

  const handleSearch = (text) => {
    setSearchMode(true);
    setSearchQuery(text);
  };

  const pressTimer = useRef(null);
  const audioRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);

  const [showActions, setShowActions] = useState(false);

    useEffect(() => {
      const checkScreen = () => {
        setIsMobile(window.innerWidth < 1024); // tablet & mobile
      };

      checkScreen();
      window.addEventListener("resize", checkScreen);

      return () => window.removeEventListener("resize", checkScreen);
    }, []);

    useEffect(() => {
      if (!isMobile) return;

      const handleClick = () => setShowActions(false);

      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }, [isMobile]);

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
  const handlePin = async () => {
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

  const otherUser = activeChat?.users?.find(
      (u) => u.id !== authUser.id
    );

    const { online: isUserOnline } = useUserOnlineStatus(
      otherUser?.id || null
    );
  
    console.log('User Online', isUserOnline)

 const renderStatus = () => {
  if (!isMine) return null;

  if (msg.status === "sending") return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
  stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-400">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
;

  if (msg.status === "failed") {
    return (
      <button onClick={retryMessage} className="text-red-500">
        Retry
      </button>
    );
  }

  if (msg.is_read) {
    const firstLetter =
      activeChat?.first_name?.charAt(0)?.toUpperCase() || "?";

    return (
      <span className="bg-blue-500 text-white text-[10px] px-1 rounded-full">
        {firstLetter}
      </span>
    );
  }

  // ✔✔ Delivered (user online or delivered_at exists)
  if (msg.delivered_at || isUserOnline) {
     return <CheckCheck className="text-gray-400 w-5" />
  }

  if (msg.status === "sent") {
   
    return <Check className="text-gray-400 w-5" />
;
  }

};



  const formatTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const isSelected = selectedMessages.some(m => m.id === msg.id);


console.log("forwardMode:", forwardMode);
console.log("selectedMessages:", selectedMessages);

  return (
  <>
    {/* ================= PREVIEW ================= */}

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

    {/* ================= MESSAGE Chat Header ================= */}
    <div
      className={`flex cursor-pointer ${isMine ? "justify-end" : "justify-start"}
      ${isSelected
            ? " bg-green-200 p-2"   // ✅ highlight
            : ""
          }
      `}>
      {/* MESSAGE BUBBLE */}
      <div
      onClick={(e) => {
          e.stopPropagation();

          if (!forwardMode) {
            if (isMobile) setShowActions(prev => !prev);
            return;
          }

          toggleSelect(msg);
        }}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}

        className={`relative group p-2 my-2 rounded-lg max-w-xs text-sm transition
          ${isMine 
            ? "ml-auto bg-green-800 text-white" 
            : "mr-auto bg-gray-900 text-white"
          }

          
        `}
      >

        {/* ================= ACTIONS 
         
        ================= */}
      {selectedMessages.length <= 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute -bottom-9 right-0 flex gap-0 px-2 py-1 rounded-full text-xs
            transition-all duration-200

            ${
              isMobile
                ? (showActions || (selectedMessages.length === 1 && isSelected))
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
                : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
            }
          `}
        >

            {/* reaction button */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReaction(!showReaction);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>

          </button>

            {/* menu button */}
            
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenuId(msg.id)
              setShowMore(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth={1.5}
              stroke="currentColor" className="size-10 text-black">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375" />
            </svg>
          </button>

        </div>
        )}

        {msg.replied_to && (
            <div className="bg-black/30 p-2 rounded mb-2 border-l-4 border-blue-400">
              <p className="text-xs text-blue-300 font-semibold">
                {msg.replied_to.sender?.first_name || "User"}
              </p>

              <p className="text-xs opacity-80 truncate">
                {msg.replied_to.type === "text"
                  ? msg.replied_to.message
                  : msg.replied_to.type === "image"
                  ? "🖼 Photo"
                  : msg.replied_to.type === "voice"
                  ? "🎤 Voice message"
                  : msg.replied_to.type}
              </p>
            </div>
          )}
        {/* PIN LABEL */}
        {isPinned && (
          <div className="text-xs text-yellow-600 mb-1">📌 Pinned</div>
        )}

        {/* TEXT */}
        {msg.type === "text" && (
          <p className="text-sm">{msg.message}</p>
        )}

        {/* IMAGE /storage/${msg.file} */}
        {msg.type === "image" && (
        <img src={`/storage/${msg.file_url || msg.local}`} 

            className="w-40 rounded cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setPreview({
                type: "image",
                url: msg.local || msg.file_url,
              });
            }}
          />
        )}

        {/* VIDEO */}
        {msg.type === "video" && (
          <video
            src={`/storage/${msg.file_url || msg.local}`}
            className="w-40 rounded cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setPreview({
                type: "video",
                url: msg.local || msg.file_url,
              });
            }}
          />
        )}

        {msg.type === "file" && (
          <a href={`/storage/${msg.file_url || msg.local}`} target="_blank" className="text-blue-500 underline">
            📄 {msg.file_name || "Download file"}
          </a>
        )}
        {/* VOICE */}
        {msg.type === "voice" && (
          <VoiceUI msg={msg} isMine={isMine} />
        )}

        {/* ================= TIME + STATUS svg ================= */}
        <div className="flex justify-end items-center gap-2 mt-1">
          <span className="text-[10px]">
            {formatTime(msg.created_at)}
          </span>

          {renderStatus && renderStatus()}
        </div>

        {/* ================= REACTIONS ================= */}
        {showReaction && (
          <div
            className="absolute -top-0 left-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ReactionPopup onReact={react} onClose={() => setShowReaction(false)} />
          </div>
        )}
      </div>
    </div>
    
     <MessageComponent
      msg={msg}
      showMenu={showMenuId === msg.id}
      setShowMenu={(val) => setShowMenuId(val ? msg.id : null)}
      showMore={showMore}
      setShowMore={setShowMore}
      togglePin={() => handlePin(msg)}
      setMessages={setMessages}
      activeChat={activeChat?.id}
      onSearch={(text) => handleSearch(text)} // ✅ FIX
      selectedMessages={selectedMessages}
      setToast={setToast}
      setActiveChat={setActiveChat}
      setSelectedMessages={setSelectedMessages}
      chats={chats}
      toggleSelect={toggleSelect}
      searchMode={searchMode}
      searchQuery={searchQuery}
      setSearchMode={setSearchMode}
      setSearchQuery={setSearchQuery}
      setForwardMessage= {setForwardMessage}
      forwardMessage={forwardMessage}
      setForwardMode={setForwardMode}
      setShowMenuId={setShowMenuId}
      setReplyingTo={setReplyingTo}

    />
  </>
);
  }
  