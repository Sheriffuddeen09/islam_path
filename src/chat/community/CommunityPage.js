import {
  useEffect,
  useRef,
  useState
} from "react";

import api from "../../Api/axios";

import CommunityList from "./CommunityList";
import CommunityMessages from "./CommunityMessages";
import CommunitySettings from "./CommunitySettings";

export default function CommunityPage({
  onClose, messagesCacheRef,
  authUser, chats, loadingChats, setActiveChat, messagesEndRef, firstUnreadMessageId, authUserId,
  communities, setCommunities, activeCommunity, openCommunity, loadingMessages, openChat, onCloseChannel,
  communityMessages, setCommunityMessages, mobileView, setMobileView, setChats, setMessages, messageRefs,
  setLastReadMessageId
}) {

 

  const [loading, setLoading] =
  useState(true);


   const hasLoaded = useRef(false);
  const communitiesCache = useRef([]);
  

  useEffect(() => {

    fetchCommunities();

  }, []);

  const fetchCommunities = async () => {

  if (
    hasLoaded.current &&
    communitiesCache.current.length
  ) {

    setCommunities(
      communitiesCache.current
    );

    setLoading(false);

    // ✅ AUTO OPEN LAST CHAT
    const lastId =
      localStorage.getItem(
        "last_opened_community"
      );

    if (lastId) {

      const found =
        communitiesCache.current.find(
          (c) =>
            Number(c.id) ===
            Number(lastId)
        );

      // ✅ ONLY LARGE SCREEN
      if (
        found &&
        window.innerWidth >= 768
      ) {

        openCommunity(
          found,
          true
        );
      }
    }

    return;
  }

  try {

    setLoading(true);

    const res =
      await api.get(
        "/api/communities"
      );

    const data =
      res.data.communities || [];

    communitiesCache.current =
      data;

    hasLoaded.current = true;

    setCommunities(data);

    // ✅ AUTO OPEN LAST COMMUNITY
    const lastId =
      localStorage.getItem(
        "last_opened_community"
      );
       

    if (lastId) {

      const found = data.find(
        (c) =>
          Number(c.id) ===
          Number(lastId)
      );

      if (
        found &&
        window.innerWidth >= 768
      ) {

        openCommunity(
          found,
          true
        );
      }
      
     
    }

  } catch (err) {

    console.log(err);

  } finally {

    setLoading(false);
  }
};

  const openSettings = () => {
    setMobileView(
      "settings"
    );
  };

  const goBack = () => {
    if (
      mobileView === "settings"
    ) {
      setMobileView(
        "messages"
      );
    } else {
      setMobileView(
        "sidebar"
      );
    }
  };

  return (

    <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)] flex overflow-hidden">

      <div className={`
        w-full
        lg:w-[370px]
        ${mobileView === "sidebar"
          ? "flex"
          : "hidden"}
        lg:flex
        flex-col
      `}>

        <CommunityList
          communities={communities}
          activeCommunity={
            activeCommunity
          }
          setActiveCommunity={
            openCommunity
          }
          loading={loading}
          onClose={onClose}
        />

      </div>

      <div className={`
        flex-1
        ${mobileView === "messages"
          ? "flex"
          : "hidden"}
        
        shadow-md
        lg:flex
        flex-col

      `}>

        <CommunityMessages
          setChats={setChats} messagesCacheRef={messagesCacheRef}
          chatLoading={loadingChats} messagesEndRef={messagesEndRef}
          authUser={authUser} firstUnreadMessageId={firstUnreadMessageId}
          setMessages={setMessages}
          chats={chats} authUserId={authUserId}
          activeCommunity={
            activeCommunity
          }
          setActiveChat={setActiveChat}
          communityMessages={communityMessages}

          setCommunityMessages={
            setCommunityMessages
          }
          onOpenSettings={
            openSettings
          }
          onBack={
            goBack
          }

          loadingMessages={loadingMessages}
          openChat={openChat}
          onCloseChannel={onCloseChannel}
          messageRefs = {messageRefs}
          setLastReadMessageId={setLastReadMessageId} setCommunities={setCommunities}
          
        />

      </div>
      <div className={`

        w-full
        lg:w-[370px]
        shadow-md

        ${mobileView === "settings"
          ? "flex"
          : "hidden"}

        lg:flex
        flex-col

      `}>

        <CommunitySettings

          activeCommunity={
            activeCommunity
          }

          // ✅ BACK
          onBack={
            goBack
          }

        />

      </div>

    </div>
  );
}