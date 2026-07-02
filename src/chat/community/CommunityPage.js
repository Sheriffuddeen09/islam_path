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
import { MessageCircleCodeIcon, Settings } from "lucide-react";

export default function CommunityPage({
  onClose, messagesCacheRef,
  authUser, chats, loadingChats, setActiveChat, messagesCommunityEndRef, firstUnreadMessageId, authUserId,
  communities, setCommunities, activeCommunity, openCommunity, loadingMessages, openChat, onCloseChannel,
  communityMessages, setCommunityMessages, mobileViewCommunity, setMobileViewCommunity, setChats, setMessages, messageCommunityRefs,
  setLastReadMessageId, setActiveCommunity, activeChat, uiMode, loading, loadingExploring, exploreCommunities,
  setExploreCommunities, communityContainerRef, communityMessagesCache
}) {

 
 const [followLoading, setFollowLoading] = useState(null);


  

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
    ${isPopup ? "fixed inset-0 z-50 lg:rounded-xl rounded-0 rounded-none" : "flex"}

    ${isPopup ? "right-0 lg:right-10 lg:top-16 lg:rounded-xl rounded-0 rounded-none" : ""}

    ${isPopup
      ? "w-full h-96 lg:w-[340px] lg:h-[410px] lg:rounded-xl rounded-0 rounded-none"
      : "flex-1 lg:h-screen w-full"
    }

    flex flex-col overflow-hidden shadow-md border 
  `}>
  {uiMode !== "full" &&
      <div
         className={` ${isPopup ? "fixed" : "flex-1"}
                      w-full
                      lg:w-[370px]
                      z-50 border border-gray-300
                      flex flex-col lg:rounded-xl rounded-0 rounded-none
                      ${isPopup ? "inset-0 lg:inset-auto lg:right-10 lg:top-16" : ""}
                      ${isPopup ? "h-full lg:h-[420px]" : "min-h-0"} `}>

        <CommunityList uiMode={uiMode}
          communities={communities}
          activeCommunity={activeCommunity}
          followLoading={followLoading}
          openCommunity={openCommunity}
          setActiveCommunity={setActiveCommunity}
          loading={loading}
          onClose={onClose}
          exploreCommunities={exploreCommunities} handleFollow={handleFollow} handleHide={handleHide}
          loadingExploring={loadingExploring}
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
    lg:rounded-xl rounded-0 rounded-none shadow-sm border border-gray-300

    ${isPopup ? "inset-0 lg:inset-auto lg:right-10 lg:top-16" : ""}

    ${isPopup ? "h-full lg:h-[420px]" : "min-h-0"}
  `}
>

        <CommunityMessages
          communityMessagesCache={communityMessagesCache}
          communityContainerRef={communityContainerRef}
          setChats={setChats} messagesCacheRef={messagesCacheRef}
          chatLoading={loadingChats} messagesCommunityEndRef={messagesCommunityEndRef}
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
          messageCommunityRefs = {messageCommunityRefs}
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
        lg:rounded-xl rounded-0 rounded-none
        ${uiMode === "popup"
          ? "flex"
          : mobileViewCommunity === "settingCommunitys" ? "flex" : "hidden"} lg:flex flex-col`}>

        <CommunitySettings 
          communityMessagesCache={communityMessagesCache} 
          uiMode={uiMode}
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
          openCommunity={openCommunity}
          setActiveCommunity={setActiveCommunity}
          loading={loading}
          onClose={onClose}
          exploreCommunities={exploreCommunities} handleFollow={handleFollow} handleHide={handleHide}
          loadingExploring={loadingExploring}
        />
    </div>

    <div className="flex-1 flex flex-col min-w-0">

      {activeCommunity ? (
    <CommunityMessages
        communityMessagesCache={communityMessagesCache}
        communityContainerRef={communityContainerRef}
      setChats={setChats}
      messagesCacheRef={messagesCacheRef}
      chatLoading={loadingChats}
      messagesCommunityEndRef={messagesCommunityEndRef}
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
      messageCommunityRefs={messageCommunityRefs}
      setLastReadMessageId={setLastReadMessageId}
      setCommunities={setCommunities}
      uiMode={uiMode}
      
    />
  ) : (
       <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex items-center justify-center flex-col">

          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <MessageCircleCodeIcon size={38} />
          </div>
          </div>

          <h2 className="text-lg font-semibold text-green-500 ">
            No Channel Selected
          </h2>

          <p  className="text-lg font-semibold mb-3">
            Select a Channel from the Left to View Message.
          </p>
        </div>
      </div>
    )}

    </div>
    <div className="w-[350px] border-l hidden lg:flex flex-col">
    {activeCommunity ? (
        <CommunitySettings 
          communityMessagesCache={communityMessagesCache} uiMode={uiMode}
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
         <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm flex items-center justify-center flex-col">

          <div className="w-28 h-28 rounded-full border-4 border-green-200 flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-gray-400 flex items-center justify-center">
            <Settings size={38} />
          </div>
          </div>

          <h2 className="text-lg font-semibold text-green-500 ">
            No Channel Selected
          </h2>

          <p  className="text-lg font-semibold mb-3">
            Select Channel to View Settings
          </p>
        </div>
      </div>
      )}
      </div>
      </div>
  )}
    </>
  );
}