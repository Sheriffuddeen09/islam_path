import {
  useEffect,
  useRef,
  useState
} from "react";

import api from "../../Api/axios";

import CommunityList from "./CommunityList";
import CommunityMessages from "./CommunityMessages";
import CommunitySettings from "./CommunitySettings";
import toast from "react-hot-toast";

export default function CommunityPage({
  onClose, messagesCacheRef,
  authUser, chats, loadingChats, setActiveChat, messagesEndRef, firstUnreadMessageId, authUserId,
  communities, setCommunities, activeCommunity, openCommunity, loadingMessages, openChat, onCloseChannel,
  communityMessages, setCommunityMessages, mobileView, setMobileView, setChats, setMessages, messageRefs,
  setLastReadMessageId, setActiveCommunity, activeChat
}) {

 

  const [loading, setLoading] =
  useState(true);


  const hasLoaded = useRef(false);
  const communitiesCache = useRef([]);

  const [exploreCommunities, setExploreCommunities] = useState([]);
  const [followLoading, setFollowLoading] =
  useState(null);

  

  useEffect(() => {

    fetchCommunities();
    fetchExploreCommunities();
  }, []);


  const fetchExploreCommunities = async () => {
    try {

      const res = await api.get(
        "/api/communities/explore"
      );

      setExploreCommunities(
        res.data.communities || []
      );

    } catch (err) {

      console.log(err);

    }
  };

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


const handleHide = async (
  communityId
) => {

  const loadingToast = toast.loading(
    "Hiding channel..."
  );

  try {

    await api.post(
      `/api/communities/${communityId}/hide`
    );

    setExploreCommunities(prev =>
      prev.filter(
        c => c.id !== communityId
      )
    );

    toast.dismiss(
      loadingToast
    );

    toast.success(
      "Channel hidden successfully."
    );

  } catch (err) {

    console.log(err);

    toast.dismiss(
      loadingToast
    );

    toast.error(
      err?.response?.data?.message ||
      "Failed to hide channel."
    );

  }

};

  const handleFollow = async (
  community
) => {

  try {

    setFollowLoading(
      community.id
    );

    await api.post(
      `/api/communities/${community.id}/follow`
    );

    setCommunities(prev => [

      {
        ...community,
        membership_status:
          "active",
      },

      ...prev,

    ]);

    setExploreCommunities(prev =>
      prev.filter(
        c => c.id !== community.id
      )
    );

    toast.success(
      `You are now following ${community.community_name}.`
    );

  } catch (err) {

    console.error(err);

    toast.error(
      "Failed to follow community.",
      "error"
    );

  } finally {

    setFollowLoading(
      null
    );

  }

};

  const openSettings = () => {
    setMobileView(
      "settingCommunitys"
    );
  };

  const goBack = () => {
    if (
      mobileView === "settingCommunitys"
    ) {
      setMobileView(
        "communityMessages"
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
          activeCommunity={activeCommunity}
          followLoading={followLoading}
          setActiveCommunity={openCommunity}
          loading={loading}
          onClose={onClose}
          exploreCommunities={exploreCommunities} handleFollow={handleFollow} handleHide={handleHide}
        />

      </div>

      <div className={`
        flex-1
        ${mobileView === "communityMessages"
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
          activeCommunity={activeCommunity}
          setActiveChat={setActiveChat}
          communityMessages={communityMessages}
          setCommunityMessages={setCommunityMessages}
          onOpenSettings={openSettings}
          onBack={goBack}
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

        ${mobileView === "settingCommunitys"
          ? "flex"
          : "hidden"}

        lg:flex
        flex-col

      `}>

        <CommunitySettings
          activeCommunity={activeCommunity}
          authUser={authUser}
          onBack={goBack}
          setActiveCommunity={setActiveCommunity}
          setCommunityMessages={setCommunityMessages}
          community={activeCommunity}
          setExploreCommunities={setExploreCommunities}
          setCommunities={setCommunities}
          communities={communities}
          chats={chats}
          activeChat={activeChat}
          setMessages={setCommunityMessages}
        />

      </div>

    </div>
  );
}