import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";
import ReactionPopup from "./ReactionPopup";
import MessageComponent from "./MessageComponent";
import { Check, CheckCheck } from "lucide-react";
import Linkify from "linkify-react";
import DocumentMessage from "./DocumentMessage";
import MediaMessage from "./MediaMessage";
import MediaPreview from "./MediaPreview";
import AudioPlayer from "./AudioUi";
import UserStatusDots from "../online/OnlineStatuesDots";

export default function MessageItem({
  msg, authUser,
  isMine,
  setMessages,
  chatId,
  activeChat, openChat, setChats,
  setToast, menuPosition, setMenuPosition, setSelectedMsg, uiState, setUiState,
  setActiveChat, activeMenuId, setActiveMenuId, showMore, setShowMore,
  chats, searchQuery, setSearchQuery, searchMode, setSearchMode, forwardMode, setReplyingTo, messages,
  selectedMessages, setForwardMode,setSelectedMessages, forwardMessage, setForwardMessage,
  showReactionPopup, setShowReactionPopup, messageRefs, unreadCount, bottomRef, setUnreadCount
}) {
  const [preview, setPreview] = useState({
    items: [],
    index: 0,
  });


  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
  if (selectedMessages.length === 0) {
    setSelectionMode(false);
  }
}, [selectedMessages]);
  
  const messageRef = useRef();
  const [hasMarkedRead, setHasMarkedRead] = useState(false);


  const [isLongPress, setIsLongPress] = useState(false);
  const pressTimer = useRef(null);

  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const dragX = useRef(0);


  const longPressTriggered = useRef(false);

  const applyElastic = (x) => {
    // resistance after 60px
    if (x <= 60) return x;

    return 60 + (x - 60) * 0.3; // dampen beyond threshold
  };
  
useEffect(() => {
  if (!messageRef.current) return;
  if (msg.sender_id === authUser.id) return;

  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting || hasMarkedRead) return;

      setHasMarkedRead(true);

      try {
        await api.post(`/api/messages/${msg.id}/read`);

        setMessages(prev =>
          prev.map(m =>
            m.id === msg.id ? { ...m, status: "read" } : m
          )
        );
      } catch (err) {
        console.error(err);
        setHasMarkedRead(false); // optional retry safety
      }
    },
    { threshold: 0.6 }
  );

  observer.observe(messageRef.current);

  return () => observer.disconnect();
}, [msg.id, msg.sender_id, authUser.id, hasMarkedRead]);
    
const toggleSelect = (message) => {
  setSelectedMessages(prev => {
    const exists = prev.includes(message.id);

    let updated;

    if (exists) {
      updated = prev.filter(id => id !== message.id);
    } else {
      updated = [...prev, message.id];
    }

    // sync single
    setSelectedMsg(updated.length ? message : null);

    return updated;
  });
};


useEffect(() => {
  if (selectedMessages.length === 0) {
    setSelectedMsg(null);
  }
}, [selectedMessages]);


  const handleSearch = (text) => {
    setSearchMode(true);
    setSearchQuery(text);
  };


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

 const react = async (messageId, emoji) => {
  if (typeof emoji !== "string") {
    console.error("❌ Emoji must be string:", emoji);
    return;
  }

  console.log("🔥 sending:", messageId, emoji);

  const { data } = await api.post("/api/messages/react", {
    message_id: messageId,
    emoji,
  });

  setMessages(prev =>
    prev.map(m => (m.id === data.id ? data : m))
  );

  setShowReactionPopup(null);
};


useEffect(() => {
  if (!showReactionPopup) return; // ✅ don't interfere when opening

  if (selectedMessages.length !== 1) {
    setShowReactionPopup(null);
  }
}, [selectedMessages]);

useEffect(() => {
  if (!showReactionPopup) return; // ✅ important

  if (!selectedMessages.includes(showReactionPopup)) {
    setShowReactionPopup(null);
  }
}, [selectedMessages, showReactionPopup]);


  const otherUser = activeChat?.users?.find(
      (u) => u.id !== authUser.id
    );

    const  isUserOnline  = (
    <UserStatusDots user={activeChat.other_user} />
  )

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
  if (isUserOnline) {
    return <CheckCheck className="text-gray-400 w-5" />;
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

const scrollToMessage = (messageId) => {
  const el = messageRefs.current[messageId];
  if (!el) return;

  // 🔥 find REAL scrollable parent
  let parent = el.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);

    if (
      style.overflowY === "auto" ||
      style.overflowY === "scroll"
    ) {
      break;
    }

    parent = parent.parentElement;
  }

  if (!parent) return;

  // 🔥 scroll INSIDE correct container
  parent.scrollTop =
    el.offsetTop - parent.clientHeight / 2;

  // highlight
  el.classList.add("bg-green-100");
  setTimeout(() => {
    el.classList.remove("bg-green-100");
  }, 1000);
};



  useEffect(() => {
  if (selectedMessages.length === 0 && forwardMode) {
    setForwardMode(false);
  }
}, [selectedMessages]);

  


  const isSelected = selectedMessages.some(m => m.id === msg.id);


  const getPreviewText = (msg) => {
  if (!msg) return "";

  if (msg.type === "text") return msg.message;

  // ✅ HANDLE SINGLE FILE (reply case)
  if (msg.file_name) {
    return `📎 ${msg.file_name}`;
  }

  // ✅ HANDLE TYPES
  if (msg.type === "voice") return "🎤 Voice message";
  if (msg.type === "audio") return "🎵 Audio";
  if (msg.type === "image") return "🖼️ Photo";
  if (msg.type === "video") return "🎬 Video";
  if (msg.type === "file") return "📎 Document";

  return msg.type;
};


const isInteractive = (target) => {
  return target.closest("img, video, audio, button, a");
};


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
        } ${selectedMessages.includes(msg.id) ? "bg-green-200 p-2" : ""}`}
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
  touchAction: "none",
}}

onPointerDown={(e) => {
  if (isInteractive(e.target)) return;

  longPressTriggered.current = false;
  isDragging.current = true;

  startX.current = e.clientX;
  dragX.current = 0;

  pressTimer.current = setTimeout(() => {
    longPressTriggered.current = true;
    setIsLongPress(true);
    toggleSelect(msg);
    setShowReactionPopup(msg.id);
  }, 500);
}}

onPointerMove={(e) => {
  if (isInteractive(e.target)) return;
  if (!isDragging.current) return;

  const diff = e.clientX - startX.current;

  // ❌ cancel long press if movement starts
  if (Math.abs(diff) > 10) {
    clearTimeout(pressTimer.current);
  }

  // 👉 ONLY RIGHT SWIPE
  if (diff > 0) {
    const MAX = 80;

    const x = Math.min(diff, MAX);

    dragX.current = diff;
    setTranslateX(x);
  }
}}

onPointerUp={(e) => {
  isDragging.current = false;
  clearTimeout(pressTimer.current);

  const diff = dragX.current;

  setTranslateX(0);
  dragX.current = 0;

  // 🔥 SWIPE THRESHOLD
  if (diff > 60) {
    setReplyingTo(msg);
  }

  // ❗ DO NOT block click
}}


onPointerCancel={() => {
  clearTimeout(pressTimer.current);
  isDragging.current = false;
  setTranslateX(0);
  dragX.current = 0;
}}

  // ================= CLICK =================
  onClick={(e) => {
  e.stopPropagation();

  if (isInteractive(e.target)) return;

  // ❌ prevent double toggle after long press
  if (longPressTriggered.current) return;

  // ✅ selection mode
  if (selectionMode || selectedMessages.length > 0) {
    toggleSelect(msg);
    return;
  }

  // normal behavior
  if (!forwardMode) {
    if (isMobile) setShowActions(prev => !prev);
    return;
  }

  toggleSelect(msg);
}}
>

    {translateX > 20 && (
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          opacity: Math.min(translateX / 50, 1),
          transform: `translateY(-50%) scale(${Math.min(translateX / 50, 1)})`,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
          />
        </svg>
      </div>
    )}
        {msg.reactions?.length > 0 && (
        <div className="absolute -bottom-3 left-2 flex gap-1 bg-white px-2 py-0.5 rounded-full shadow text-xs">
          {Object.values(
            msg.reactions.reduce((acc, r) => {
              if (!acc[r.emoji]) {
                acc[r.emoji] = { emoji: r.emoji, count: 0 };
              }
              acc[r.emoji].count++;
              return acc;
            }, {})
          ).map((r, i) => (
            <span key={i}>
              {r.emoji} {r.count > 1 && r.count}
            </span>
          ))}
        </div>
      )}


      {selectedMessages.length <= 1 && (
  <div className="lg:block hidden">
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={`
        absolute -bottom-8 right-0 translate-y-0.5 flex items-center bg-gray-100 shadow-md gap-0.5 px-1 py-1 rounded-lg text-xs z-50
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
      {/* ✅ CHECKBOX (NEW) */}
      {!isMobile && (
  <div
    onClick={(e) => {
      e.stopPropagation();
      setSelectionMode(true);
      toggleSelect(msg);
    }}
    className={`w-4 h-4 flex items-center justify-center rounded-full border-2 cursor-pointer transition
      ${
        selectedMessages.includes(msg.id)
          ? "bg-blue-500 border-blue-500"
          : "border-gray-400"
      }
    `}
  >
    {selectedMessages.includes(msg.id) && (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3 text-white"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.071 7.071a1 1 0 01-1.414 0L3.293 9.85a1 1 0 011.414-1.414l3.515 3.515 6.364-6.364a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )}
  </div>
)}

      {/* 😀 REACTION */}
     <button
  onPointerDown={(e) => e.stopPropagation()} // ✅ keep this
  onClick={(e) => {
    e.stopPropagation();

    // ✅ ensure this message is selected first
    if (!selectedMessages.includes(msg.id)) {
      setSelectedMessages([msg.id]);
    }

    // ✅ then open popup (toggle)
    setShowReactionPopup(prev =>
      prev === msg.id ? null : msg.id
    );
  }}
>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24" strokeWidth="1.5"
          stroke="currentColor" className="size-5 text-black">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
        </svg>
      </button>

      {/* ⋮ MENU */}
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
        stroke="currentColor" class="size-6 rotate-90 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
</svg>

      </button>
    </div>
  </div>
)}

    {msg.is_forwarded && (
      
      <div className="flex items-center italic gap-1 text-xs text-gray-300 mb-1 opacity-80">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
          />
        </svg>

        <span>Forwarded</span>
      </div>
    )}
         {/* 0  */}
        {msg.replied_to && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            scrollToMessage(msg.replied_to.id);
          }}
          className={`bg-black/30 p-2 rounded mb-2 ${
            msg.replied_to?.sender?.id === authUser.id
              ? "border-l-4 border-green-400"
              : "border-l-4 border-blue-400"
          }`}
        >
          <p className="text-xs text-blue-300 font-semibold">
            {msg.replied_to?.sender
              ? `${msg.replied_to.sender.first_name} ${msg.replied_to.sender.last_name}`
              : "User"}
          </p>

          <p className="text-xs opacity-80 truncate">
            {getPreviewText(msg.replied_to)}
          </p>
        </div>
      )}

        {unreadCount > 0 && (
          <div
            onClick={() => {
              bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              setUnreadCount(0);
            }}
            className="fixed bottom-20 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded-full cursor-pointer shadow-lg"
          >
            {unreadCount} new messages
          </div>
        )}

        {/* TEXT */}
          {msg.message && msg.type === "text" && (
            <Linkify
              options={{
                target: "_blank",
                className: "text-blue-400 underline pointer-events-auto",
              }}
            >
              <p className="text-sm break-words">
                {msg.message}
              </p>
            </Linkify>
          )}

       {/* ================= FILES (ALWAYS FIRST) ================= */}
          {msg.files?.length > 0 && (
            <MediaMessage
              msg={msg}
              setPreview={setPreview}
              preview={preview}
            />
          )}

        {msg.files?.some(f =>
            f.type === "audio" || f.type === "voice"
          ) && (
            <AudioPlayer msg={msg} isMine={isMine} />
          )}

        {msg.files?.some(f => f.type === "file") && (
            <DocumentMessage msg={msg} />
          )}

        {/* =================  TIME + STATUS svg ================= */}
        <div className="flex justify-end items-center z-50 gap-2 mt-1">
          <span className="text-[10px]">
            {formatTime(msg.created_at)}
          </span>

          {renderStatus && renderStatus()}
        </div>

        {/* ================= REACTIONS ================= */}
        {showReactionPopup && (
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <ReactionPopup onReact={react} setShowReactions={setShowReactionPopup}
            message={msg} showReactions={showReactionPopup} setSelectedMessages={setSelectedMessages}  
            setSelectedMsg={setSelectedMsg} isMine={isMine} setUiState={setUiState} />
          </div>
        )}
      </div>
    </div>
    
     <MessageComponent
     setChats={setChats}
      openChat={openChat}
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
      setUiState={setUiState}
      uiState={uiState}
      setSelectedMsg={setSelectedMsg}
      messages={messages}
      authUser={authUser}
      forwardMode={forwardMode}
      setShowReactions={setShowReactionPopup}
    />

  </>
);
  }
  