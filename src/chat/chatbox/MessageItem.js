import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";
import ReactionPopup from "./ReactionPopup";
import MessageComponent from "./MessageComponent";
import { useUserOnlineStatus } from "../online/UseUserOnlineStatus";
import { Check, CheckCheck } from "lucide-react";
import Linkify from "linkify-react";
import DocumentMessage from "./DocumentMessage";
import MediaMessage from "./MediaMessage";
import MediaPreview from "./MediaPreview";
import AudioPlayer from "./AudioUi";

export default function MessageItem({
  msg, authUser,
  isMine,
  setMessages,
  chatId,
  activeChat,
  setToast,
  setActiveChat, newMessageCount, bottomRef,
  chats, searchQuery, setSearchQuery, searchMode, setSearchMode, forwardMode, setReplyingTo,
  selectedMessages, setForwardMode,setSelectedMessages, forwardMessage, setForwardMessage
}) {
  const [showReactions, setShowReactions] = useState(null);
  const [preview, setPreview] = useState({
    items: [],
    index: 0,
  });
  const [showMore, setShowMore] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const threshold = 80; // swipe distance
  const startX = useRef(0);
  
  const messageRef = useRef();
  const [hasMarkedRead, setHasMarkedRead] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [menuPosition, setMenuPosition] = useState(null);


useEffect(() => {
  if (!messageRef.current) return;

  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (entry.isIntersecting && !hasMarkedRead && msg.sender_id !== authUser.id) {
        try {
          await api.post(`/api/messages/${msg.id}/read`);
          setHasMarkedRead(true);
        } catch (err) {
          console.error(err);
        }
      }
    },
    { threshold: 0.6 }
  );

  observer.observe(messageRef.current);

  return () => observer.disconnect();
}, [msg.id, hasMarkedRead]);

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

  const [isMobile, setIsMobile] = useState(false);

  const [showActions, setShowActions] = useState(false);

    useEffect(() => {
      const checkScreen = () => {
        setIsMobile(window.innerWidth < 1024); 
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


  const translateXRef = useRef(0);

  const isDragging = useRef(false);


  const handlePointerDown = (e) => {
  startX.current = e.clientX;
  isDragging.current = true;

  e.currentTarget.setPointerCapture(e.pointerId); // 🔥 CRITICAL FIX

  console.log("🟢 START", e.clientX);
};


const handlePointerMove = (e) => {
  if (!isDragging.current) return;

  const diff = e.clientX - startX.current;

  const limited = diff * 0.5;

  translateXRef.current = limited;
  setTranslateX(limited);

  console.log("🟡 MOVE", limited);
};


const handlePointerUp = (e) => {
  isDragging.current = false;

  e.currentTarget.releasePointerCapture(e.pointerId); // 🔥 IMPORTANT

  console.log("🔴 END", translateXRef.current);

  if (!isMine && translateXRef.current > threshold) {
    setReplyingTo(msg);
  }

  if (isMine && translateXRef.current < -threshold) {
    setReplyingTo(msg);
  }

  translateXRef.current = 0;
  setTranslateX(0);
};

  // ================= STATUS =================
  const updateStatus = (id, status) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const replaceMessage = (id, newMsg) => {
  setMessages(prev =>
    prev.map(m =>
      m.id === id
        ? {
            ...m,          // keep existing UI structure
            ...newMsg,     // override with server data
            status: "sent"
          }
        : m
    )
  );
};

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

    const resendVoice = async () => {
  console.log("Retrying voice:", msg);

  if (!msg.localBlob) {
    console.warn("❌ No local blob, cannot retry voice");
    return;
  }

  // 1. SET STATUS → sending
  setMessages((prev) =>
    prev.map((m) =>
      m.id === msg.id ? { ...m, status: "sending" } : m
    )
  );

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("voice", msg.localBlob, "voice.webm");

  if (msg.replied_to?.id) {
    form.append("replied_to", msg.replied_to.id);
  }

  try {
    const res = await api.post("/api/messages/voice", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 3. REPLACE MESSAGE (same pattern as stopRecording)
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? {
              ...m, // keep local preview
              ...res.data.message,
              sender: res.data.message.sender || authUser,
              status: "sent",
            }
          : m
      )
    );


    setReplyingTo(null);

  } catch (err) {
    console.log(err?.response?.data);

    // 5. FAIL STATE
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: "failed" } : m
      )
    );
  }
};

const resendFile = async () => {
  if (!msg.originalFiles) {
    console.warn("❌ No original files to retry");
    return;
  }

  updateStatus(msg.id, "sending");

  const form = new FormData();
  form.append("chat_id", chatId);

  const getType = (file) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "file";
  };

  // ✅ GENERATE GROUP ID AGAIN
  const isMediaGroup =
    msg.originalFiles.length > 1 &&
    msg.originalFiles.every(f =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );

  const groupId = isMediaGroup ? `grp_${Date.now()}` : null;

  msg.originalFiles.forEach(file => {
    form.append("files[]", file);
    form.append("types[]", getType(file));
    form.append("trim_start[]", 0);
    form.append("trim_end[]", 0);
  });

  if (msg.message) {
    form.append("message", msg.message);
  }

  if (groupId) {
    form.append("group_id", groupId);
  }

  try {
    const res = await api.post("/api/messages", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const serverMessages = res.data.messages;

    let grouped;

    // ✅ CASE 1: backend already grouped
    if (serverMessages[0]?.files) {
      grouped = {
        ...serverMessages[0],
        status: "sent",
      };
    }

    // ✅ CASE 2: backend returns separate
    else {
      grouped = {
        ...serverMessages[0],
        group_id: serverMessages[0].group_id,
        files: serverMessages.map((m) => ({
          file: m.file_url,
          file_url: m.file_url,
          file_name: m.file_name,
          type: m.type,
          duration: m.duration,
        })),
        status: "sent",
      };
    }

    replaceMessage(msg.id, grouped);

  } catch (err) {
    updateStatus(msg.id, "failed");
  }
};


const retryMessage = async () => {
  console.log("Retrying message:", msg);

  if (msg.type === "text") {
    return resendText();
  }

  if (msg.type === "voice") {
    return resendVoice();
  }

  if (["image", "video", "file", "audio", "document"].includes(msg.type)) {
    return resendFile();
  }
};


  // ================= PIN MESSAGE =================
  const handlePin = async (msg) => {
  try {
    if (msg.is_pinned) {
      await api.delete("/api/messages/pin", {
        data: { message_id: msg.id },
      });

      console.log("❌ Unpinned");
    } else {
      await api.put("/api/messages/pin", {
        message_id: msg.id,
      });

      console.log("📌 Pinned");
    }

    // 🔥 update UI locally
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, is_pinned: !m.is_pinned }
          : m
      )
    );

  } catch (err) {
    console.error("Pin error:", err);
  }
};

  // ================= LONG PRESS REACTION =================
  const handlePressStart = () => {
    pressTimer.current = setTimeout(() => setShowReactions(true), 500);
  };

  const handlePressEnd = () => clearTimeout(pressTimer.current);

  const react = async (emoji) => {
    const { data } = await api.post("/api/messages/react", {
      message_id: msg.id,
      emoji,
    });

    setMessages(prev => prev.map(m => m.id === data.id ? data : m));
    setShowReactions(null);
  };

  const otherUser = activeChat?.users?.find(
      (u) => u.id !== authUser.id
    );

    const { online: isUserOnline } = useUserOnlineStatus(
      otherUser?.id || null
    );
  
    console.log('User Online', isUserOnline)

    const colors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500"
    ];
  
    const getColor = (name = "") => {
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };
  
    const getInitial = (name) => {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
    };

 const renderStatus = () => {
  if (!isMine) return null;

  if (msg.status === "sending") return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
  stroke-width="1.5" stroke="currentColor" class="size-5 text-gray-400">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
;

  if (msg.status === "failed") {
    return (
      <button onClick={retryMessage} className="text-red-500 z-50">
        Retry
      </button>
    );
  }

  if (msg.status === "read") {
  const name = msg.read_by_name || "User";

  return (
    <span
      className={`flex items-center justify-center text-white text-[7px] w-3 h-3 rounded-full ${getColor(name)}`}
    >
      {getInitial(name)}
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

console.log("User Read Message", msg.is_read);

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

  useEffect(() => {
  if (selectedMessages.length === 0 && forwardMode) {
    setForwardMode(false);
  }
}, [selectedMessages]);

  const audioSrc =
  msg.voice_url ||
  (msg.files?.[0]?.file
    ? `http://localhost:8000/storage/${msg.files[0].file}`
    : msg.file
    ? `http://localhost:8000/storage/${msg.file}`
    : msg.local || null);


console.log("forwardMode:", forwardMode);
console.log("selectedMessages:", selectedMessages);



  return (
  <>
    
    {preview && preview.items && preview.items.length > 0 && (
  <MediaPreview preview={preview} setPreview={setPreview} />
)}
    <div
        key={`${msg.id}-${selectedMessages.length}`}
        ref={messageRef}
        className={`flex cursor-pointer ${
          isMine ? "justify-end" : "justify-start"
        } ${isSelected ? "bg-green-200 p-2" : ""}`}
      >
     <div
      className={`relative group p-2 my-2 rounded-lg max-w-xs text-sm transition
        ${isMine 
          ? "ml-auto bg-green-800 text-white" 
          : "mr-auto bg-gray-900 text-white"
        }
      `}
      style={{
        
        transform: `translateX(${translateX}px)`,
        transition: translateX === 0 ? "transform 0.2s ease" : "none",
        
      }}
    

      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => handlePointerUp(e)}
      onPointerCancel={(e) => handlePointerUp(e)}
     onClick={(e) => {
        e.stopPropagation();

        // 🔥 HARD GUARD (this is what you're missing)
        if (forwardMode && selectedMessages.length === 0) {
          setForwardMode(false);
          return;
        }

        if (!forwardMode) {
          if (isMobile) setShowActions(prev => !prev);
          return;
        }

        toggleSelect(msg);
      }}
      >
      {selectedMessages.length <= 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className={`
            absolute -bottom-9 right-0 flex gap-0 px-2 py-1 rounded-full text-xs z-50
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(msg.id);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>

          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();

              const rect = e.currentTarget.getBoundingClientRect();

              setMenuPosition({
                x: rect.x,
                y: rect.y,
                isMine,
                id: msg.id,
              });

              setActiveMenuId(msg.id);
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
          {newMessageCount > 0 && (
                <div
                  onClick={() => {
                    bottomRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "end",
                    });
                  }}
                  className="fixed bottom-24 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs cursor-pointer shadow"
                >
                  {newMessageCount} new message{newMessageCount > 1 ? "s" : ""}
                </div>
              )}
        {msg.replied_to && (
            <div className="bg-black/30 p-2 rounded mb-2 border-4 border-blue-400">
              <p className="text-xs text-blue-300 font-semibold">
                {msg.replied_to.sender?.first_name || "User"}
              </p>
              <p className="text-xs opacity-80 truncate">
                {msg.replied_to.type === "text"
                  ? msg.replied_to.message
                  : msg.replied_to.type === "image"
                  ? msg.replied_to.file_name
                  : msg.replied_to.type === "video"
                  ? msg.replied_to.file_name
                  : msg.replied_to.type === "audio"
                  ? msg.replied_to.file_name
                  : msg.type === "file"
                  ? msg.replied_to.file_name
                  : msg.replied_to.type === "voice"
                  ? msg.replied_to.file_name
                  : msg.replied_to.type}

              </p>
            </div>
          )}
        {/* PIN LABEL */}

        {Math.abs(translateX) > 20 && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 text-lg transition
            ${isMine ? "right-full mr-2" : "left-full ml-2"}
          `}
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      </svg>

        </div>
      )}

        {/* TEXT */}
        {msg.type === "text" && (
          <Linkify
            options={{
              target: "_blank",
              className: "text-blue-400 underline",
            }}
          >
            <p className="text-sm break-words ">{msg.message}</p>
          </Linkify>
        )}

       <MediaMessage msg={msg} setPreview={setPreview} preview={preview} />

        {(msg.type === "audio" || msg.type === "voice") && audioSrc && (
          <AudioPlayer msg={msg} isMine={isMine} />
        )}

        {msg.type === "file" && (
          <DocumentMessage msg={msg} />
        )}

        {/* ================= TIME + STATUS svg ================= */}
        <div className="flex justify-end items-center z-50 gap-2 mt-1">
          <span className="text-[10px]">
            {formatTime(msg.created_at)}
          </span>

          {renderStatus && renderStatus()}
        </div>

        {/* ================= REACTIONS ================= */}
        {showReactions && (
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <ReactionPopup onReact={react} setShowReactions={setShowReactions}
            message={msg} showReactions={showReactions} />
          </div>
        )}
      </div>
    </div>
    
     <MessageComponent
      msg={msg}
      togglePin={handlePin}
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
      setReplyingTo={setReplyingTo}
      showMenu={activeMenuId === msg.id}
      setActiveMenuId={setActiveMenuId}
      setMenuPosition={setMenuPosition}
      menuPosition={menuPosition}
      activeMenuId={activeMenuId}
      showMore={showMore}
      setShowMore={setShowMore}
    />

  </>
);
  }
  