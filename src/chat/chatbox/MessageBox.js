import { useRef, useEffect, useState } from "react";
import MessageItem from "./MessageItem";
import ChatInput from "./ChatInput";
import api from "../../Api/axios";
import { ChatSkeleton } from "./ChatSkeleton";
import { PinnedMessagesBar } from "./PinnedMessagesBar";
import { Loader2 } from "lucide-react";
import UserStatusDots from "../online/OnlineStatuesDots";
import CallModal from "./CallModal";
import { useUserOnlineStatus } from "../online/UseUserOnlineStatus";



export default function MessageBox({
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
  setReplyingTo, replyingTo
}) {
  


  const messageRefs = useRef({});
  const [callMode, setCallMode] = useState(null); // "audio" | "video"
  const [showNewBtn, setShowNewBtn] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);

  const [forwardMode, setForwardMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const [forwardMessage, setForwardMessage] = useState(false);
  
  const containerRef = useRef(null);
  const lastMessageCount = useRef(0);
  const isUserNearBottom = useRef(true);

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

  // ================= SCROLL TRACK =================
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      const isBottom = distanceFromBottom < 80;

     if (isBottom) {
        setShowNewBtn(false);
        setNewCount(0); // ✅ ADD THIS
      }

      // INFINITE SCROLL (TOP)
      if (el.scrollTop < 80 && !loadingMore && hasMore) {
        loadOlderMessages();
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadingMore, hasMore]);

    useEffect(() => {
    if (!loadingMessages && messages.length) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView();
      }, 100);
    }
  }, [chatId]);

  // ================= LOAD OLDER MESSAGES =================
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
      console.log(err);
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


   const isUserOnline = useUserOnlineStatus(authUser.id);

  console.log('User Online', isUserOnline)

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

    {loadingMessages && <ChatSkeleton type="messages" />}

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full bg-black text-black relative">

      {/* HEADER */}
      
      <div className="hidden sm:block">
     <div className="p-4 border-b flex justify-between items-center bg-white">
        <div className="inline-flex gap-6 items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
          stroke="currentColor" class="size-6 cursor-pointer lg:hidden" onClick={onBack}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
          <div onClick={onHeaderClick} className="flex items-center gap-2">
            <h3 className="font-bold ">{activeChat.other_user?.first_name} {activeChat.other_user?.last_name}</h3>

            <UserStatusDots user={activeChat.other_user} />
          </div>
        </div>
       <div className="flex gap-3 text-xl">

        {/* Forward */}
          {selectedMessages.length > 1 && (
            <button
              onClick={() => setForwardMessage(true)}
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
            stroke-width="1.5" stroke="currentColor" class="size-6 text-black ">
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
            <h3 className="font-bold truncate max-w-[140px]">
              {activeChat.other_user?.first_name}{" "}
              {activeChat.other_user?.last_name}
            </h3>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-3 text-xl flex-shrink-0">

          {selectedMessages.length > 1 && (
            <button
              onClick={() => setForwardMessage(true)}
              className="hover:bg-gray-200 p-2 rounded-full"
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
            className="hover:bg-gray-200 p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 text-black"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </button>

          <button
            onClick={() => setCallMode("audio")}
            className="hover:bg-gray-200 p-2 rounded-full"
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

      <UserStatusDots user={activeChat.other_user} />
    </div>

  </div>
</div>
 

      {/* CHAT BODY */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400  p-4 space-y-3 bg-white relative"
      >

        {/* NEW MESSAGE BUTTON */}
        {showNewBtn && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewBtn(false);
            setNewCount(0);
          }}
          className="fixed bottom-24 right-4 md:right-8 lg:right-96 bg-green-500 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center"
        >
          {/* ICON ONLY */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5"
              />
            </svg>

            {/* COUNT BADGE */}
            {newCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {newCount}
              </span>
            )}
          </div>
        </button>
      )}

        {/* LOADING OLDER */}
        {loadingMore && (
          <div className="text-center mx-auto flex justify-center text-center text-xs text-gray-800">
            <Loader2 />
          </div>
        )}

        {loadingMessages ? (
    <ChatSkeleton type="messages" />
  ) : messages.length === 0 ? (
    <div className="text-center text-gray-400 mt-10">
      No messages yet
    </div>
  ) : (
    <>
      {/* PINNED */}
      <PinnedMessagesBar
        messages={messages}
        onSelect={handleScrollToMessage}
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
          className={`px-1 rounded py-2 transition ${
            searchQuery && !isMatch ? "opacity-20" : "opacity-100"
          }`}
          ref={(el) => (messageRefs.current[msg.id] = el)}
        >
        {showDate && (
          <div className="text-center text-xs text-gray-900 my-2">
            {formatDateHeader(msg.created_at)}
          </div>
        )}

        <MessageItem
          msg={msg}
          authUser={authUser}
          isMine={msg.sender_id === authUser.id}
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
          key={msg.id}
           forwardMode={forwardMode}
          setForwardMode={setForwardMode}
          selectedMessages={selectedMessages}
          setSelectedMessages={setSelectedMessages}
          forwardMessage={forwardMessage}
          setForwardMessage={setForwardMessage}
          setReplyingTo={setReplyingTo} replyingTo={replyingTo}
        />
      </div>
    );
  })
)}
    </>
  )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t bg-white">
        <ChatInput
          chatId={chatId}
          authUser={authUser}
          setMessages={setMessages}
          setIsTyping={setIsTyping}
          bottomRef={bottomRef}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          activeChat={activeChat}
        />
      </div>

     {callMode && (
        <CallModal
          activeChat={activeChat}
          callMode={callMode}
          setCallMode={setCallMode}
        />
      )}
    </div>
  );
}