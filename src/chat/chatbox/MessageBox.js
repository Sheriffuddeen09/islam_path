import { useRef, useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import api from "../../Api/axios";
import { ChatSkeleton } from "./ChatSkeleton";
import { PinnedMessagesBar } from "./PinnedMessagesBar";
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
  chats, setCommunityMessages,
  setReplyingTo, replyingTo, setChats,
  paused, trimMap, trimAppliedMap, unreadDividerRef, 
  stopRecording, sendText, sendFile, zoomMap, setTrimAppliedMap, setTrimMap, recording, setDurationMap, setShowPreview,
  durationMap, setZoomMap, selected, cropAppliedMap, croppedAreaPixels, setCrop, crop, setCropAppliedMap,
  setCroppedImages, croppedImages, setCroppedAreaPixels, setCaption, caption, previewUrls, files, showPreview,
  text, setText, fileInputRef, toast, setPreviewUrls, setSelected, setFiles, timerRef, setRecording, audioChunksRef,
  mediaRecorderRef,setPaused, messageRefs,  unreadCount, setUnreadCount, loadingChats, lastReadMessageId,
  setLastReadMessageId, communities, setActiveCommunity, openCommunity, setShowChannel, 
  setMobileView, mobileView
}) {
  


  const [callMode, setCallMode] = useState(null); 
  const [showNewBtn, setShowNewBtn] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [forwardMode, setForwardMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [forwardMessage, setForwardMessage] = useState({
    open: false,
    messages: []
  });

  const [showScrollButton, setShowScrollButton] =
  useState(false);

  const messagesContainerRef = useRef(null);

  useEffect(() => {

  const container =
    messagesContainerRef.current;

  if (!container) return;

  const handleScroll = () => {

    const threshold = 100;

    const isAtBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight <
      threshold;

    setShowScrollButton(
      !isAtBottom
    );
  };

  container.addEventListener(
    "scroll",
    handleScroll
  );

  handleScroll();

  return () => {

    container.removeEventListener(
      "scroll",
      handleScroll
    );
  };

}, [
  messages,
]);
  
  
  const openChannel = async (community) => {
    await openCommunity(community);
    setShowChannel(true);
  };
  

  const openCommunityMessage = async (communityId, messageId) => {
    try {
      const community = communities.find(
        (c) => Number(c.id) === Number(communityId)
      );
  
      if (!community) return;
  
      setShowChannel(true)
  
      await openChannel(community); // ✅ SECOND
  
      // scroll
      let attempts = 0;
  
      const interval = setInterval(() => {
        const el =
          messageRefs.current?.[messageId] ||
          document.getElementById(`msg-${messageId}`);
  
        if (el) {
          clearInterval(interval);
  
          el.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
  
          el.classList.add("bg-yellow-200");
  
          setTimeout(() => {
            el.classList.remove("bg-yellow-200");
          }, 3000);
  
        }
  
        if (++attempts > 40) {
          clearInterval(interval);
        }
      }, 150);
  
    } catch (err) {
      console.error(err);
    }
  };
  

  useEffect(() => {

  if (
    !activeChat?.id ||
    !messages?.length ||
    !unreadDividerRef.current
  ) return;

  const observer =
    new IntersectionObserver(
      async ([entry]) => {
        if (
          entry.isIntersecting
        ) {

          const lastMessage =
            messages[
              messages.length - 1
            ];

          if (
            !lastMessage
          ) return;

          // ignore own messages
          if (
            lastMessage.sender_id ===
            authUser.id
          ) {
            return;
          }

          try {

            await api.post(
              `/api/chats/${activeChat.id}/read`,
              {
                last_read_message_id:
                  lastMessage.id,
              }
            );

            // clear UI
            setUnreadCount(0);

            setLastReadMessageId(
              lastMessage.id
            );

            setChats(prev =>
              prev.map(chat =>
                chat.id ===
                activeChat.id
                  ? {
                      ...chat,
                      unread_count: 0,
                      last_read_message_id:
                        lastMessage.id,
                    }
                  : chat
              )
            );

          } catch (err) {

            console.log(err);
          }

          observer.disconnect();
        }
      },
      {
        threshold: 0.7,
      }
    );

  observer.observe(
    unreadDividerRef.current
  );

  return () =>
    observer.disconnect();

}, [
  activeChat?.id,
  messages,
]);


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

  const myId = authUser.id;
  const latestMessage = messages?.length
  ? messages[messages.length - 1]
  : null;

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

  const isRestrictedGroupUser =
  activeChat?.type === "group" &&
  ["pending", "rejected", "removed", "left"].includes(status);

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
        <div className="mb-10 text-center mx-auto rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
        <img src={logo} alt="Logo" className="h-14 mb-4 -mt-6 opacity-80" />

        <p className="text-[var(--text-color)] max-w-md">
          Messages, and updates will appear here.
        </p>
        <div className="mt-6 mb-6 text-sm text-[var(--text-color)]">
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

  
  const firstUnreadMessage = messages.find(
  (m) =>
    Number(lastReadMessageId || 0) > 0 &&
    m.id > Number(lastReadMessageId)
);

const firstUnreadMessageId =
  firstUnreadMessage?.id ?? null;


  return (
    <div className="flex flex-col h-full bg-[var(--primary-color)] text-[var(--text-color)] relative">

      {/* HEADER yet */}
      
      <div className="hidden lg:block">
     <div className="px-3 border-b-2 shadow py-1 border-white flex justify-between items-center bg-[var(--bg-color)] text-[var(--text-color)]">
         
          <div className="inline-flex gap-4 items-center">
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
            
              <div className="flex flex-col lg:mt-2">
                  <h3 className="font-bold text-lg truncate text-[var(--text-color)]">
                    {displayName}
                  </h3>
                {!isGroup && <UserStatusDots user={activeChat.other_user} />}

                {isGroup && (
                  <p className="text-[9px] pt-0.5 pb-2">
                    {activeChat.members_count || activeChat.members?.length || 0} members
                  </p>
                )}
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
            className="hover:bg-gray-200 hover:text-white text-[var(--text-color)] p-2 rounded-full"
          >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="size-6 text-[var(--text-color)]"
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
             stroke-width="1.5" stroke="currentColor" class="size-6 text-[var(--text-color)]">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>


          </button>

          {/* AUDIO */}
          <button onClick={() => setCallMode("audio")} className="hover:bg-gray-200 hover:text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
            stroke-width="1.5" stroke="currentColor" class="size-5 text-[var(--text-color)] ">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>

          </button>

        </div>
      </div>
      </div>

      {/* Mobile Header */}
   <div className="lg:hidden block ">
  <div className="px-4 py-2 border-b flex justify-between items-center bg-[var(--bg-color)] overflow-hidden">

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
            className="size-6 cursor-pointer flex-shrink-0 text-[var(--text-color)]"
            onClick={onBack}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>

          <div
            onClick={onHeaderClick}
            className="flex items-center gap-2 min-w-0"
          >
              <div
                className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-[18px] text-white ${getColor(
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
            <h3 className="font-bold text-lg sm:block hidden truncate text-[var(--text-color)]">
              {displayName}
            </h3>

            <h3 className="font-bold block sm:hidden text-lg text-[var(--text-color)]">
            {displayName?.length > 9
              ? `${displayName.slice(0, 9)}...`
              : displayName}
          </h3>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex text-xl flex-shrink-0">
        
          <button
              onClick={() => setCallMode("video")}
            className="hover:bg-gray-200 hover:text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="size-6 text-[var(--text-color)]">
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
              className="size-5 text-[var(--text-color)]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
          </button>

          {selectedMessages.length > 1 && (
        <button
           onClick={() => {
            const messagesToForward = messages.filter(msg =>
              selectedMessages.includes(msg.id)
            );
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
            className="size-6 text-[var(--text-color)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
            />
          </svg>
        </button>
      )}

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
              className="size-10 text-[var(--text-color)] rotate-90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375"
              />
            </svg>
          </button>
        )}

        </div>
      </div>

      {!isGroup && <UserStatusDots user={activeChat.other_user} />}
      {isGroup && (
                  <p className="text-[9px] pt-0.5 pb-2 relative left-20">
                    {activeChat.members_count || activeChat.members?.length || 0} members
                  </p>
                )}
    </div>

  </div>
</div>
 

      {/* CHAT BODY */}
      <div
        ref={messagesContainerRef}
        className="flex-1 px-1 min-h-0 overflow-y-auto scrollbar-thin overflow-hidden
        scrollbar-thumb-green-500 scrollbar-track-transparent space-y-3 bg-[var(--primary-color)] relative">

  {isRestrictedGroupUser ? (
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
          <p className="text-[var(--text-color)] text-sm mt-2">
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
          <p className="text-[var(--text-color)] text-sm mt-2">
            You cannot access this group anymore.
          </p>
        </>
      )}

      {status === "removed" && (
        <>
          <p className="text-red-600 font-semibold">
            🚫 You are no longer a member
          </p>
          <p className="text-[var(--text-color)] text-sm mt-2">
            You have been removed from this group.
          </p>
        </>
      )}

      {status === "left" && (
        <>
          <p className="text-red-600 font-semibold">
            🚪 You are no longer a member
          </p>
          <p className="text-[var(--text-color)] text-sm mt-2">
            You have Exit from this group.
          </p>
        </>
      )}

    </div>
  ) : (
    <>  
        
        {loadingMessages ? (
    <ChatSkeleton type="messages" />
  ) : messages.length === 0 ? (
    // comment 1
     <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="mb-10 text-center mx-auto bg-gray-800 text-white rounded-lg sm:w-80 w-72 text-xs p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
        <img src={logo} alt="Logo" className="h-14 mb-4 -mt-6 opacity-80" />

        <p className="text-[var(--text-color)] max-w-md">
          Messages, and updates will appear here.
        </p>
        <div className="mt-6 mb-6 text-sm text-[var(--text-color)]">
          💬 Stay connected • 📚 Learn together • 🔔 Get instant updates
        </div>
      </div>
  ) : (
    <>
      <div className="mb-4 text-center mt-4 mx-auto bg-gray-300 text-green-700 font-semibold rounded-lg sm:w-80 w-72 text-[10px] p-3">
        Messages and calls are end-to-end encrypted Only people in this chat can read. listen to or share them 
        Learn More.
      </div>
      {/* PINNED Unread */}
      <PinnedMessagesBar
        messages={messages}
        onSelect={handleScrollToMessage}
        setMessages={setMessages}
        authUser={authUser}
        
      />
    {searchQuery && searchFilteredMessages.length === 0 ? (
  <div className="text-center text-[var(--text-color)] mt-10 space-y-3">
    
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

  const isSystem = msg.type === "system";

  const formatSystemMessage = (msg) => {
  if (!msg.message) return "";

  let text = msg.message;

  const currentUserName =
    `${authUser?.first_name}`.trim();

  if (currentUserName) {

    const regex = new RegExp(currentUserName, "gi");

    text = text.replace(regex, "You");
  }

  text = text.replace(/You has/i, "You have");

  return text;
};

  

  
const isFirstUnread =
    msg.id === firstUnreadMessageId;


  return (
    <div
      key={msg.id}
      id={`msg-${msg.id}`}
      data-forwarded={
          msg.is_forwarded
            ? "true"
            : "false"
        }
      className={`px-3 rounded py-2 transition ${
        searchQuery && !isMatch ? "opacity-20" : "opacity-100"
      }`}
      ref={(el) => {
        if (el) {
          messageRefs.current[msg.id] = el;
        }
      }}
    >
      {/* 📅 DATE */}
      {showDate && (
        <div className="text-center text-xs text-[var(--text-color)] my-2">
          {formatDateHeader(msg.created_at)}
        </div>
      )}

      {isFirstUnread &&
        unreadCount > 0 && 
        msg.sender_id !== myId && (
        <div className="flex items-center gap-3 my-4 px-2">

          <div className="text-[var(--text-color)] text-xs px-3 py-1 text-center mx-auto rounded-full font-medium whitespace-nowrap">
            {unreadCount} Unread Message{unreadCount > 1 ? "s" : ""}
          </div>

        </div>
      )}

      {isSystem ? (
        <div className="flex justify-center">
          <div className="bg-[var(--bg-color)] shadow-md text-[var(--text-color)] px-1 py-1 text-[9px] rounded-full">
            {formatSystemMessage(msg)}
          </div>
        </div>
      ) : (
         <MessageItem
          showScrollButton={showScrollButton}
          communities={communities} setActiveCommunity={setActiveCommunity}
          openCommunity={openCommunity} onBack={onBack} openCommunityMessage={openCommunityMessage}
          setLastReadMessageId={setLastReadMessageId}
          setChats={setChats}
          key={msg.id} setShowChannel={setShowChannel}
          openChat={openChat}      
          messages={messages}
          activeChat={activeChat}
          msg={msg}
          authUser={authUser}
          isMine={msg.sender_id === authUser.id}
          messageRefs={messageRefs}
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
          loadingChats={loadingChats} setCommunityMessages={setCommunityMessages}
          setMobileView={setMobileView} mobileView={mobileView}
        />
        )}
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
      <div className="px-3 border-t bg-[var(--bg-color)]">
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
      loadingChats={loadingChats}
      />
      ))}

       
    </div>
  );
}