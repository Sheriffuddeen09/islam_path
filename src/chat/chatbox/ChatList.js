import { useEffect, useMemo, useRef, useState } from "react";
import { ChatSkeleton } from "./ChatSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import { useNavigate } from "react-router-dom";
import ChatItem from "./ChatItem";
import CommunityButton from "../community/CommunityButton";
import CommunityPage from "../community/CommunityPage";
import CreateCommunityModal from "../community/CreateCommunityModal";
import api from "../../Api/axios";


export default function ChatList({
  chats = [],
  openChat,
  loadingChats,
  chatFilter,
  setChatFilter,
  activeChat, setActiveChat
}) {
  const { user: authUser } = useAuth();

  const chatListRef = useRef(null);

  const navigate = useNavigate();

  const [showChannel, setShowChannel] = useState(false);

  const [showCommunityModal,
  setShowCommunityModal] =
  useState(false);

  const [communities,
    setCommunities] =
    useState([]);
  const [activeCommunity,
    setActiveCommunity] =
    useState(null);
     const [
  loadingMessagesCommunity,
  setLoadingMessagesCommunity
  ] = useState(false);
  const [messages,
    setMessages] =
    useState([]);
  const [mobileView, setMobileView] = useState(window.innerWidth >= 768 ? "messages" : "sidebar");
  

  const messagesCache = useRef({});
  const lastOpenedCommunity = useRef(null);

  const [
  hasViewedUnread,
  setHasViewedUnread
] = useState(false);

  useEffect(() => {

  setHasViewedUnread(false);

  }, [activeChat?.id]);

  

  
 const safeUnreadTotal = useMemo(() => {
  return chats.filter(chat => {

    const isGroup =
      chat.type === "group";

    const status =
      chat.membership_status;

    const isAllowed =
      !isGroup ||
      (isGroup &&
        (status === "approved" ||
         chat.my_role === "admin"));

    return (
      isAllowed &&
      (chat.unread_count || 0) > 0
    );

  }).length;

}, [chats]);




  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const isGroup = chat.type === "group";

      const membershipStatus = chat.membership_status;

      // ❌ BLOCK pending/rejected/removed users from unread + display logic
      const isAllowedGroupUser =
        !isGroup ||
        (isGroup &&
          (membershipStatus === "approved" || chat.my_role === "admin"));

      if (chatFilter === "all") {
        return true;
      }

      if (chatFilter === "unread") {
        return (
          (chat.unread_count || 0) > 0 &&
          isAllowedGroupUser
        );
      }

      if (chatFilter === "group") {
        return isGroup;
      }

      return true;
    });
  }, [chatFilter, chats]);


  
  const openCommunity = async (
    community,
    skipMobile = false
  ) => {
  
    setActiveCommunity(
      community
    );
  
    localStorage.setItem(
      "last_opened_community",
      community.id
    );
  
    lastOpenedCommunity.current =
      community;
  
    // DESKTOP
    if (
      window.innerWidth >= 768
    ) {
  
      setMobileView(
        "messages"
      );
    }
  
    // MOBILE
    else if (!skipMobile) {
  
      setMobileView(
        "messages"
      );
    }
  
    // START LOADING
    setLoadingMessagesCommunity(true);
  
    // OPTIONAL:
    // clear old messages
    setMessages([]);
  
    // CACHE
    if (
      messagesCache.current[
        community.id
      ]
    ) {
  
      setMessages(
        messagesCache.current[
          community.id
        ]
      );
  
      setLoadingMessagesCommunity(
        false
      );
  
      return;
    }
  
    try {
  
      const res =
        await api.get(
          `/api/community/${community.id}/messages`
        );
  
      const msgs =
        res.data.messages || [];
  
      messagesCache.current[
        community.id
      ] = msgs;
  
      setMessages(msgs);
  
    } catch (err) {
  
      console.log(err);
  
    } finally {
  
      // STOP LOADING
      setLoadingMessagesCommunity(
        false
      );
    }
  };
  

  return (
    <div className="h-full flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">

      {/* HEADER */}
      <div className="p-3 font-bold text-2xl shadow-md inline-flex gap-3 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>

        Messages
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 p-3 flex-wrap">

        {/* ALL */}
        <button
          onClick={() => setChatFilter("all")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            chatFilter === "all"
              ? "bg-green-400 text-white"
              : "bg-[var(--bg-color)] text-[var(--text-color)] border-0.5 shadow-md "
          }`}
        >
          All
        </button>

        {/* UNREAD */}
        <button
          onClick={() => setChatFilter("unread")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            chatFilter === "unread"
              ? "bg-green-400 text-white"
              : "bg-[var(--bg-color)] text-[var(--text-color)] border-0.5 shadow-md "
          }`}
        >
          Unread
          {safeUnreadTotal > 0 && (
            <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full">
              {safeUnreadTotal}
            </span>
          )}
        </button>

        {/* GROUP 🔥 NEW */}
        <button
          onClick={() => setChatFilter("group")}
          className={`px-4 py-1 rounded-full text-sm font-medium transition ${
            chatFilter === "group"
              ? "bg-green-400 text-white"
              : "bg-[var(--bg-color)] text-[var(--text-color)] border-0.5 shadow-md"
          }`}
        >
          Groups
        </button>
      </div>

      {/* CHAT LIST shadow */}
      <div className="flex-1 overflow-y-auto">

        {loadingChats && <ChatSkeleton type="list" />}

        {!loadingChats && filteredChats.length === 0 && (

        <div className="flex flex-col items-center justify-center h-full text-center px-6">

          {/* ICON */}
          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">

            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">

              {chatFilter === "unread" ? (

                // CHECK ICON
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>

              ) : (

                // GROUP ICON
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="w-10 h-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.742-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.75m12 0a5.971 5.971 0 0 0-.94-3.197M6 18.75a5.971 5.971 0 0 1 .94-3.197m0 0A5.995 5.995 0 0 1 12 13.5a5.995 5.995 0 0 1 5.06 2.053M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* TITLE */}
          <h2 className="text-xl font-semibold mb-3">

            {chatFilter === "unread"
              ? "No unread chats"
              : chatFilter === "group"
              ? "No groups"
              : "No chats"}

          </h2>

          {/* SUBTEXT */}
          <p className=" text-sm mb-10">

            {chatFilter === "unread"
              ? "You're all caught up."
              : chatFilter === "group"
              ? "You have not joined any groups yet."
              : "Start chatting with your friends."}

          </p>

          {/* BUTTON */}
          <button
            onClick={() => setChatFilter("all")}
            className="text-green-500 font-semibold text-sm hover:underline"
          >
            View all chats
          </button>
        </div>
      )}

        {!loadingChats &&
        <div ref={chatListRef}>
          {
          filteredChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              authUser={authUser}
              activeChat={activeChat}
              openChat={openChat}
            />
          ))}
      </div>
          
          }
      </div>

      <CommunityButton
        chatListRef={chatListRef}
        onOpenChannel={() => setShowChannel(true)}
        setShowCommunityModal={setShowCommunityModal}
      />

      <div className={` fixed inset-0 z-50 ${showChannel ? "block" : "hidden"}`}>
        <CommunityPage
          onClose={() => setShowChannel(false)}
          onCloseChannel={() => setShowChannel(false)}
          authUser={authUser}
          chats={chats}
          loadingChats={loadingChats}
          setActiveChat={setActiveChat}
          communities={communities}
          setCommunities={setCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          openCommunity={openCommunity}
          loadingMessages={loadingMessagesCommunity}
          lastOpenedCommunity ={lastOpenedCommunity} messagesCache ={messagesCache}
          openChat={openChat} messages={messages} setMessages={setMessages}
          mobileView={mobileView} setMobileView={setMobileView}
        />
      </div>

      {showCommunityModal && (
      <CreateCommunityModal
        chats={chats}
        onClose={() =>
          setShowCommunityModal(false)
        }
      />
    )}

    </div>
  );
}