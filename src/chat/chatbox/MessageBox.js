import { useRef, useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import api from "../../Api/axios";
import { ChatSkeleton } from "./ChatSkeleton";
import { PinnedMessagesBar } from "./PinnedMessagesBar";
import { Loader2 } from "lucide-react";
import UserStatusDots from "../online/OnlineStatuesDots";
import CallModal from "./CallModal";
import MenuComponent from "./MenuComponent";
import logo from "../../layout/image/favicon.png";




export default function MessageBox({
  openChat,
  activeChat,
  messages,
  setMessages,
  authUser,
  loadingMessages,
  isTyping,
  setIsTyping,
  onBack,
  onHeaderClick,
  chatId,
  bottomRef,
  setToast,
  setActiveChat,
  chats,
  setReplyingTo, replyingTo, setChats,
  containerRef,
  handleScroll,
  paused, trimMap, trimAppliedMap,
  stopRecording, sendText, sendFile, zoomMap, setTrimAppliedMap, setTrimMap, recording, setDurationMap, setShowPreview,
  durationMap, setZoomMap, selected, cropAppliedMap, croppedAreaPixels, setCrop, crop, setCropAppliedMap,
  setCroppedImages, croppedImages, setCroppedAreaPixels, setCaption, caption, previewUrls, files, showPreview,
  text, setText, fileInputRef, toast, setPreviewUrls, setSelected, setFiles, timerRef, setRecording, audioChunksRef,
  mediaRecorderRef,setPaused, messageRefs,  unreadCount, setUnreadCount
}) {
  


  const [callMode, setCallMode] = useState(null); // "audio" | "video" messageRefs
  const [showNewBtn, setShowNewBtn] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [forwardMode, setForwardMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const [activeReplyId, setActiveReplyId] = useState(null);
  
  const [forwardMessage, setForwardMessage] = useState({
    open: false,
    messages: []
  });

  const [selectedMsg, setSelectedMsg] = useState(null);

    const [showReactionPopup, setShowReactionPopup] = useState(null);
  

  const lastMessageCount = useRef(0);
  const isUserNearBottom = useRef(true);

  const [uiState, setUiState] = useState({
    mode: null, // "reaction" | "menu"
    message: null,
    openMenu: false,
  });

  const [menuPosition, setMenuPosition] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  


  const hasSelection = selectedMessages.length > 0;

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
 

  const isTouchDevice =
  window.matchMedia("(pointer: coarse)").matches;

// SMART SCROLL
useEffect(() => {
  const currentCount = messages.length;
  const prevCount = lastMessageCount.current;

  if (currentCount > prevCount) {
    const newMessages = messages.slice(prevCount);

    const hasIncoming = newMessages.some(
      m => m.sender_id !== authUser.id
    );

    if (!isUserNearBottom.current && hasIncoming) {
      setShowNewBtn(true);
      setNewCount(prev => prev + newMessages.length);
    }
  }

  lastMessageCount.current = currentCount;
}, [messages]);

  
  // ================= LOAD OLDER MESSAGES Select a chat =================
  const loadOlderMessages = async () => {
    if (loadingMore || messages.length === 0) return;

    setLoadingMore(true);

    const el = containerRef.current;
    const prevHeight = el.scrollHeight;

    try {
      const res = api.get(`/api/messages?chat_id=${chatId}&before=${messages[0].id}`)

      const older = res.data.data;

      if (!older.length) {
        setHasMore(false);
        setLoadingMore(false);
        return;
      }

      setMessages(prev => [...older, ...prev]);

      // preserve scroll position (IMPORTANT)
      setTimeout(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - prevHeight;
      }, 50);

    } catch (err) {
     
    }

    setLoadingMore(false);
  };

  // ================= SCROLL TO MESSAGE =================
  const handleScrollToMessage = (msg) => {
    const el = messageRefs.current[msg.id];

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      el.classList.add("bg-yellow-200");
      setTimeout(() => el.classList.remove("bg-yellow-200"), 1500);
    }
  };

  // ================= DATE HEADER handleScrol =================
  const formatDateHeader = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

    if (!d) return "";
    
    return d.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      year: "numeric",
    });
  };


  const status = activeChat?.membership_status; // pending | approved | rejected | null
  const role = activeChat?.my_role; // admin | member

  const isAdmin = role === "admin";

  const canViewMessages = isAdmin || status === "approved";

  const isBlockedUser = !canViewMessages;

  const filteredMessages = messages;

  const searchFilteredMessages =
  searchQuery.trim().length > 0
    ? messages.filter(m =>
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

// 👇 THIS is what you asked about
const listToRender =
  searchQuery.trim().length > 0 ? searchFilteredMessages : messages;


  const toggleSelect = (message) => {
  setSelectedMessages(prev => {
    const exists = prev.some(m => m.id === message.id);

    if (exists) {
      return prev.filter(m => m.id !== message.id);
    }

    return [...prev, message];
  });
};

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

    // 🔥 update UI locally bg-gray
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

 const handleSearch = (text) => {
    setSearchMode(true);
    setSearchQuery(text);
  };

 

    {loadingMessages && <ChatSkeleton type="messages" />}

  if (!activeChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="mb-10 text-center mx-auto bg-gray-700 text-white rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
        <img src={logo} alt="Logo" className="h-14 mb-4 -mt-6 opacity-80" />

        <p className="text-black max-w-md">
          Messages, and updates will appear here.
        </p>
        <div className="mt-6 mb-6 text-sm text-black">
          💬 Stay connected • 📚 Learn together • 🔔 Get instant updates
        </div>
      </div>
    );
  }

const isGroup = activeChat?.type === "group";

const displayName = isGroup
  ? activeChat?.group_name || activeChat?.name || "Unnamed Group"
  : `${activeChat?.other_user?.first_name || ""} ${activeChat?.other_user?.last_name || ""}`;

const avatarName = isGroup
  ? displayName
  : activeChat?.other_user?.first_name;


  return (
    <div className="flex flex-col h-full bg-black text-black relative">

      {/* HEADER yet */}
      
      <div className="hidden sm:block">
     <div className="p-4 border-b flex justify-between items-center bg-white">
        <div className="inline-flex gap-6 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
          stroke="currentColor" class="size-6 cursor-pointer lg:hidden" onClick={onBack}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
          <div onClick={onHeaderClick} className="flex items-center gap-4">
             <div
                className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-[18px] text-white ${getColor(
                  avatarName
                )}`}
              >
                {isGroup && activeChat.image_url ? (
                  <img
                    src={activeChat.image_url}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitial(avatarName)
                )}

              </div>
            <h3 className="font-bold text-lg truncate">
                {displayName}
            </h3>

            {!isGroup && <UserStatusDots user={activeChat.other_user} />}
          </div>
        </div>
       <div className="flex gap-3 text-xl">

        {/* Forward */}
          {selectedMessages.length > 1 && (
          <button
            onClick={() => {
              const messagesToForward = messages.filter(msg =>
                selectedMessages.includes(msg.id)
              );

              console.log("OPENING FORWARD:", messagesToForward);

              setForwardMessage({
                open: true,
                messages: messagesToForward
              });
            }}
            className="hover:bg-gray-200 hover:text-white p-2 rounded-full"
          >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-6 text-black"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
      />
    </svg>
  </button>
)}
          {/* VIDEO */}
          <button
              onClick={() => setCallMode("video")}
            className="hover:bg-gray-200 hover:text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="size-6 text-black">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>


          </button>

          {/* AUDIO */}
          <button onClick={() => setCallMode("audio")} className="hover:bg-gray-200 hover:text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            stroke-width="1.5" stroke="currentColor" class="size-5 text-black ">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>

          </button>

        </div>
      </div>
      </div>

      {/* Mobile Header */}
   <div className="sm:hidden block ">
  <div className="px-4 py-2 border-b flex justify-between items-center bg-white overflow-hidden">

    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex justify-between items-center flex-1 min-w-0">

        {/* LEFT */}
        <div className="inline-flex gap-3 items-center flex-1 min-w-0">
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 cursor-pointer flex-shrink-0"
            onClick={onBack}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>

          <div
            onClick={onHeaderClick}
            className="flex items-center gap-2 min-w-0"
          >
              <div
              className={`w-10 h-10 py-3 rounded-full bg-gray-300 shadow-md hover:scale-105 
                  transition rounded-full text-white flex items-center justify-center
                   font-bold text-[16px] shadow-sm  ${getColor(
                avatarName
              )}`}
            >
              {isGroup && activeChat.image_url ? (
                <img
                  src={activeChat.image_url}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitial(avatarName)
              )}
          </div>
            <h3 className="font-bold text-lg truncate">
              {displayName}
            </h3>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-1 text-xl flex-shrink-0">
         {hasSelection && selectedMessages.length === 1 && (
          <button
          className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();

              if (!selectedMsg) return;

              if (isTouchDevice) {
                setUiState({
                  mode: "menu",
                  message: selectedMsg,
                  openMenu: true,
                });
                return;
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10 text-black rotate-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375"
              />
            </svg>
          </button>
        )}

        {selectedMessages.length > 1 && (
        <button
           onClick={() => {
            const messagesToForward = messages.filter(msg =>
              selectedMessages.includes(msg.id)
            );

            console.log("🟡 Selected IDs:", selectedMessages);
            console.log("🟢 Matched Messages:", messagesToForward);

            // 🔥 DEBUG GROUP CONTENT
            messagesToForward.forEach(msg => {
              if (msg.type === "group") {
                console.log("📦 GROUP MESSAGE:", msg.id);
                console.log("➡️ Files inside group:", msg.files);
                console.log("➡️ File IDs:", msg.files?.map(f => f.id));
              }
            });

            setForwardMessage({
              open: true,
              messages: messagesToForward
            });
          }}
          className="hover:bg-gray-200 p-2 rounded-full cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 text-black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
            />
          </svg>
        </button>
      )}

          <button
              onClick={() => setCallMode("video")}
            className="hover:bg-gray-200 hover:text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="size-6 text-black">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>

          </button>

          <button
            onClick={() => setCallMode("audio")}
            className="hover:bg-gray-200 p-2 rounded-full cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5 text-black"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
          </button>

        </div>
      </div>

      {!isGroup && <UserStatusDots user={activeChat.other_user} />}
    </div>

  </div>
</div>
 

      {/* CHAT BODY */}
      <div
  ref={containerRef}
  onScroll={(e) => {
    handleScroll(e);

    if (e.target.scrollTop < 50 && canViewMessages) {
      loadOlderMessages(); // 🚫 prevent loading if blocked
    }
  }}
  className="flex-1 px-1 min-h-0 overflow-y-auto scrollbar-thin overflow-hidden
  scrollbar-thumb-gray-400 space-y-3 bg-white relative"
>

  {isBlockedUser ? (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">

      <div className="bg-gray-800 text-white text-xs p-3 rounded-lg mb-6">
        Messages are protected. You cannot access this chat.
      </div>

      {status === "pending" && (
        <>
          <p className="text-green-800 font-semibold inline-flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="size-5 text-green-800">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg> Waiting for admin approval
          </p>
          <p className="text-gray-500 text-sm mt-2">
            You will be able to see messages after approval.
          </p>
        </>
      )}

      {status === "rejected" && (
        <>
          <p className="text-red-600 font-semibold inline-flex gap-1 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            stroke-width="1.5" stroke="currentColor" class="size-6 text-red-800">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
 Your request was rejected
          </p>
          <p className="text-gray-500 text-sm mt-2">
            You cannot access this group anymore.
          </p>
        </>
      )}

      {!status && (
        <>
          <p className="text-red-600 font-semibold">
            🚫 You are no longer a member
          </p>
          <p className="text-gray-500 text-sm mt-2">
            You have been removed from this group.
          </p>
        </>
      )}

    </div>
  ) : (
    <>  
        {/* LOADING OLDER */}
        {loadingMore && (
          <div className="text-center mx-auto flex justify-center text-center text-xs text-gray-800">
            <Loader2 />
          </div>
        )}

        {loadingMessages ? (
    <ChatSkeleton type="messages" />
  ) : messages.length === 0 ? (
     <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="mb-10 text-center mx-auto bg-gray-700 text-white rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
        <img src={logo} alt="Logo" className="h-14 mb-4 -mt-6 opacity-80" />

        <p className="text-black max-w-md">
          Messages, and updates will appear here.
        </p>
        <div className="mt-6 mb-6 text-sm text-black">
          💬 Stay connected • 📚 Learn together • 🔔 Get instant updates
        </div>
      </div>
  ) : (
    <>
      <div className="mb-10 text-center mt-4 mx-auto bg-gray-700 text-white rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
      {/* PINNED */}
      <PinnedMessagesBar
        messages={messages}
        onSelect={handleScrollToMessage}
        setMessages={setMessages}
      />
    {searchQuery && searchFilteredMessages.length === 0 ? (
  <div className="text-center text-gray-400 mt-10 space-y-3">
    
    <p>No messages found</p>

    <button
      onClick={() => {
        setSearchQuery("");
        setSearchMode(false);
      }}
      className="text-blue-500 text-sm"
    >
      Cancel Search
    </button>

  </div>
) : (
  listToRender.map((msg, index) => {

    const isMatch =
  searchQuery &&
  msg.message?.toLowerCase().includes(searchQuery.toLowerCase());

    const prevMsg = filteredMessages[index - 1];

    const safeDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return isNaN(d.getTime()) ? null : d;
    };

    const currentDate = safeDate(msg.created_at);
    const prevDate = safeDate(prevMsg?.created_at);

    const showDate =
      index === 0 ||
      (currentDate &&
        prevDate &&
        currentDate.toDateString() !== prevDate.toDateString());

    return (
      <div
          key={msg.id}
          id={`msg-${msg.id}`}
          className={`px-3 rounded py-2 transition message-bubble  ${
            searchQuery && !isMatch ? "opacity-20" : "opacity-100" 
          }
          `}
          ref={(el) => {
        if (el) {
          messageRefs.current[msg.id] = el;
        }
      }}
        >
        {showDate && (
          <div className="text-center text-xs text-gray-900 my-2">
            {formatDateHeader(msg.created_at)}
          </div>
        )}
        <MessageItem
          setChats={setChats}
          key={msg.id}
          openChat={openChat}      
          messages={messages}
          activeChat={activeChat}
          msg={msg}
          authUser={authUser}
          isMine={msg.sender_id === authUser.id}
          setActiveReplyId={setActiveReplyId}
          messageRefs={messageRefs}
          containerRef={containerRef}
          setMessages={setMessages}
          chatId={chatId}
          isTyping={isTyping}
          setToast={setToast}
          setActiveChat={setActiveChat}
          chats={chats}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchMode={setSearchMode}
          searchMode={searchMode}
          forwardMode={forwardMode}
          setForwardMode={setForwardMode}
          selectedMessages={selectedMessages}
          setSelectedMessages={setSelectedMessages}
          forwardMessage={forwardMessage}
          setForwardMessage={setForwardMessage} bottomRef={bottomRef} showMore={showMore} setShowMore={setShowMore}
          setReplyingTo={setReplyingTo} replyingTo={replyingTo}
          sendFile={sendFile} sendText={sendText} stopRecording={stopRecording} setUiState={setUiState}
          isTouchDevice={isTouchDevice} menuPosition={menuPosition} setMenuPosition={setMenuPosition}
          setSelectedMsg={setSelectedMsg} uiState={uiState} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}
          setShowReactionPopup={setShowReactionPopup} showReactionPopup={showReactionPopup}
          unreadCount={unreadCount} setUnreadCount={setUnreadCount}
        />
      </div>
              );
            })
          )}
        </>
      )}
    </>
  )}

  <div ref={bottomRef} />
</div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white">
        <ChatInput
          authUser={authUser}
          setIsTyping={setIsTyping}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          activeChat={activeChat} 
          paused={paused} trimMap={trimMap} trimAppliedMap={trimAppliedMap} stopRecording={stopRecording} 
          sendText={sendText} sendFile={sendFile} zoomMap={zoomMap} setTrimAppliedMap={setTrimAppliedMap} 
          setTrimMap={setTrimMap} recording={recording} setDurationMap={setDurationMap} setShowPreview={setShowPreview}
          durationMap={durationMap} setZoomMap={setZoomMap} selected={selected} cropAppliedMap={cropAppliedMap} 
          croppedAreaPixels={croppedAreaPixels} setCrop={setCrop} crop={crop} setCropAppliedMap={setCropAppliedMap}
          setCroppedImages={setCroppedImages} croppedImages={croppedImages} setCroppedAreaPixels={setCroppedAreaPixels}
          setCaption={setCaption} caption={caption} previewUrls={previewUrls} files={files} showPreview={showPreview}
          text={text} setText={setText} fileInputRef={fileInputRef} toast={toast} setPreviewUrls={setPreviewUrls} 
          setSelected={setSelected} setFiles={setFiles} timerRef={timerRef} setRecording={setRecording} 
          audioChunksRef={audioChunksRef} mediaRecorderRef={mediaRecorderRef} setPaused={setPaused} 
          
        />
      </div>

     {callMode && (
        <CallModal
          activeChat={activeChat}
          callMode={callMode}
          setCallMode={setCallMode}
        />
      )}


      {messages.map((msg) => (
      <MenuComponent 
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
      setForwardMode={setForwardMode}
      forwardMode={forwardMode}
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
      setForwardMessage={setForwardMessage}
      forwardMessage={forwardMessage}
      messagesEndRef={bottomRef}
      setShowReactions={setShowReactionPopup}

      />
      ))}

       
    </div>
  );
}