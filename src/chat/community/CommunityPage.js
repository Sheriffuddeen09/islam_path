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
  communityMessages, setCommunityMessages, mobileViewCommunity, setMobileViewCommunity, setChats, setMessages, messageRefs,
  setLastReadMessageId, setActiveCommunity, activeChat, uiMode
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
    setMobileViewCommunity(
      "settingCommunitys"
    );
  };

  const goBack = () => {
      setMobileViewCommunity(
        "communityMessages"
      );
  };

  const goBackChannel = () => {
  setMobileViewCommunity("sidebarCommunitys");
};



  const isPopup = uiMode !== "full";


  return (
    <>
    <div
  className={`
    ${isPopup ? "fixed inset-0 z-50" : "flex"}

    ${isPopup ? "right-0 lg:right-10 lg:top-16" : ""}

    ${isPopup
      ? "w-full h-96 lg:w-[340px] lg:h-[410px] lg:rounded-xl"
      : "flex-1 lg:h-screen w-full"
    }

    flex flex-col overflow-hidden shadow-md border 
  `}>
  {uiMode !== "full" &&
      <div
         className={` ${isPopup ? "fixed" : "flex-1"}
                      w-full
                      lg:w-[370px]
                      z-50
                      flex flex-col
                      ${isPopup ? "inset-0 sm:inset-auto sm:right-10 sm:top-16" : ""}
                      ${isPopup ? "h-full sm:h-[420px]" : "min-h-0"} `}>

        <CommunityList uiMode={uiMode}
          communities={communities}
          activeCommunity={activeCommunity}
          followLoading={followLoading}
          setActiveCommunity={openCommunity}
          loading={loading}
          onClose={onClose}
          exploreCommunities={exploreCommunities} handleFollow={handleFollow} handleHide={handleHide}
        />

      </div>
    }
{uiMode !== "full" &&
 activeCommunity &&
 mobileViewCommunity === "communityMessages" && (
      <div
  className={`
    ${isPopup ? "fixed" : "flex-1"}

    w-full
    lg:w-[370px]

    z-50
    flex flex-col

    ${isPopup ? "inset-0 sm:inset-auto sm:right-10 sm:top-16" : ""}

    ${isPopup ? "h-full sm:h-[420px]" : "min-h-0"}
  `}
>

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
          goBackChannel={goBackChannel}
          loadingMessages={loadingMessages}
          openChat={openChat}
          onCloseChannel={onCloseChannel}
          messageRefs = {messageRefs}
          setLastReadMessageId={setLastReadMessageId} setCommunities={setCommunities}
          uiMode={uiMode}
          
        />

      </div>
)}
{activeCommunity && mobileViewCommunity === 'settingCommunitys' && (
      <div
      className={`
        w-full
        lg:w-[370px]
        z-50 fixed lg:right-10 h-full
        lg:h-[420px]

        ${uiMode === "popup"
          ? "flex"
          : mobileViewCommunity === "settingCommunitys" ? "flex" : "hidden"}

        lg:flex flex-col
      `}
    >

        <CommunitySettings uiMode={uiMode}
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
    )}

    </div>

{uiMode === "full" && (
  <div className="flex h-screen w-full overflow-hidden z-50 fixed inset-0 flex flex-row bg-[var(--bg-color)]
  text-[var(--text-color)]">

    <div className="w-[320px] border-r hidden sm:flex flex-col h-full">
      <CommunityList uiMode={uiMode}
          communities={communities}
          activeCommunity={activeCommunity}
          followLoading={followLoading}
          setActiveCommunity={openCommunity}
          loading={loading}
          onClose={onClose}
          exploreCommunities={exploreCommunities} handleFollow={handleFollow} handleHide={handleHide}
        />
    </div>

    <div className="flex-1 flex flex-col min-w-0">

      {activeCommunity ? (
    <CommunityMessages
      setChats={setChats}
      messagesCacheRef={messagesCacheRef}
      chatLoading={loadingChats}
      messagesEndRef={messagesEndRef}
      authUser={authUser}
      firstUnreadMessageId={firstUnreadMessageId}
      setMessages={setMessages}
      chats={chats}
      authUserId={authUserId}
      activeCommunity={activeCommunity}
      setActiveChat={setActiveChat}
      communityMessages={communityMessages}
      setCommunityMessages={setCommunityMessages}
      onOpenSettings={openSettings}
      goBackChannel={goBackChannel}
      loadingMessages={loadingMessages}
      openChat={openChat}
      onCloseChannel={onCloseChannel}
      messageRefs={messageRefs}
      setLastReadMessageId={setLastReadMessageId}
      setCommunities={setCommunities}
      uiMode={uiMode}
    />
  ) : (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
        <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-4">
          💬
        </div>
        <p className="font-medium">No channel selected</p>
        <p className="text-sm mt-1">
          Select a channel to view messages
        </p>
      </div>
    )}

    </div>
    <div className="w-[350px] border-l hidden lg:flex flex-col">
    {activeCommunity ? (
        <CommunitySettings uiMode={uiMode}
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
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
          <div className="w-16 h-16 rounded-full border flex items-center justify-center mb-4">
            ⚙️
          </div>
          <p className="font-medium">No channel selected</p>
          <p className="text-sm mt-1">
            Select a channel to view settings
          </p>
        </div>
      )}
      </div>
      </div>
  )}
    </>
  );
}