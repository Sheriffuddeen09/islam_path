import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";
import InputComponent from "./InputComponent";
import MessagesArea from "./MessageArea";
import { ChatSkeleton } from "../chatbox/ChatSkeleton";
import { PinnedCommunityBar } from "./PinnedCommunityBar";

export default function CommunityMessages({
  activeCommunity,
  communityMessages,
  setCommunityMessages,
  goBackChannel,
  authUser,
  loadingMessages, messagesCacheRef, messagesCommunityEndRef, firstUnreadMessageId, authUserId,
  chatLoading, chats, openChat, onCloseChannel, setActiveChat, setChats, setMessages, messageCommunityRefs, 
  setLastReadMessageId, setCommunities, onOpenSettings, uiMode, communityContainerRef,
  communityMessagesCache

}) {

    const [replyingToCommunity, setReplyingToCommunity] = useState(null);
    const [textCommunity, setTextCommunity] = useState("");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageMenu, setShowMessageMenu] = useState(false);
    const [reactionMsg, setReactionMsg] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0,});

    const [ approvalModal, setApprovalModal ] = useState(false);
    
    const [ pendingMessages, setPendingMessages ] = useState([]);
    const [showScrollButton, setShowScrollButton] = useState(false);


    const [isMobiled, setIsMobiled] = useState(
      window.innerWidth < 1024
    );

    useEffect(() => {
      const handleResize = () => {
        setIsMobiled(window.innerWidth < 1024);
      };

      window.addEventListener("resize", handleResize);

      return () =>
        window.removeEventListener(
          "resize",
          handleResize
        );
    }, []);



    useEffect(() => {

    const container =
      communityContainerRef.current;

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
    communityMessages,
  ]);

    const unreadCount =
  communityMessages.filter(msg =>
    msg.id >= firstUnreadMessageId &&
    msg.sender_id !== authUserId
  ).length;


    const role = activeCommunity?.my_role;

    const myId = authUser.id;
    
    const latestMessage = communityMessages?.length
    ? communityMessages[communityMessages.length - 1]
    : null;


    const isAdmin =
      role === "admin" ||
      role === "owner";
  
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

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

    
const communityMessageAction = async ({
  action = "send",
  message_id = null,
  message = "",
  file = null,
  type = "text",
  replied_to = null,
  response_mode = false,
  tempMessage = null,
}) => {
  try {
    if (tempMessage) {
      setCommunityMessages(prev => [
        ...prev,
        tempMessage,
      ]);
      requestAnimationFrame(() => {
        messagesCommunityEndRef.current?.scrollIntoView({
          behavior: "auto",
          block: "end",
        });

      });
    }
    const form = new FormData();
    form.append(
      "action",
      action
    );
    form.append(
      "community_id",
      activeCommunity.id
    );
    if (message_id) {
      form.append(
        "message_id",
        message_id
      );
    }
    if (message) {
      form.append(
        "message",
        message
      );
    }
    if (type) {
      form.append(
        "type",
        type
      );
    }
    if (replied_to) {
      form.append(
        "replied_to",
        replied_to
      );
    }
    form.append(
      "response_mode",
      response_mode ? 1 : 0
    );
    if (file) {
      form.append(
        "file",
        file
      );
    }
    const res = await api.post(
      "/api/community/messages/send",
      form,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.log(
      "❌ ACTION ERROR:",
      err.response?.data || err
    );
    throw err;
  }
};


   const updateCommunityMessages = (callback) => {

    setCommunityMessages(prev => {

        const updated =
            typeof callback === "function"
                ? callback(prev)
                : callback;

        // ✅ Update the cache
        communityMessagesCache.current[activeCommunity.id] =
            updated;

        return updated;

    });

};

const updateStatus = (id, status) => {

    updateCommunityMessages(prev =>
        prev.map(m =>
            m.id === id
                ? {
                      ...m,
                      status,
                  }
                : m
        )
    );

};

const replaceMessage = (id, newMsg) => {

    updateCommunityMessages(prev =>
        prev.map(m =>
            m.id === id
                ? {
                      ...m,
                      ...newMsg,
                      status: "sent",
                  }
                : m
        )
    );

};


    const resendCommunityText = async (
  msg
) => {

  updateStatus(
    msg.id,
    "sending"
  );

  try {

    const { data } =
      await api.post(

      "/api/community/messages/send",

      {

        action: "send",

        community_id:
          activeCommunity.id,

        message:
          msg.message,

        type: "text",

        replied_to:
          msg.replied_to?.id ||
          null,
      }
    );

    const message =
      data.message;

    replaceMessage(
      msg.id,
      {

        ...message,

        sender:
          message.sender ||
          authUser,
      }
    );

  } catch (err) {

    console.log(err);

    updateStatus(
      msg.id,
      "failed"
    );
  }
};

const resendCommunityFile =
  async (msg) => {

  if (!msg.originalFiles) {

    console.warn(
      "❌ No original files"
    );

    return;
  }

  updateStatus(
    msg.id,
    "sending"
  );

  const form =
    new FormData();

  form.append(
    "action",
    "send"
  );

  form.append(
    "community_id",
    activeCommunity.id
  );

  const getType = (file) => {

    if (
      file.type.startsWith(
        "image/"
      )
    ) {
      return "image";
    }

    if (
      file.type.startsWith(
        "video/"
      )
    ) {
      return "video";
    }

    if (
      file.type.startsWith(
        "audio/"
      )
    ) {
      return "audio";
    }

    return "file";
  };

  msg.originalFiles.forEach(
    (file) => {

      form.append(
        "file",
        file
      );

      form.append(
        "type",
        getType(file)
      );
    }
  );

  if (msg.message) {

    form.append(
      "message",
      msg.message
    );
  }

  if (
    msg.replied_to?.id
  ) {

    form.append(
      "replied_to",
      msg.replied_to.id
    );
  }

  try {

    const res =
      await api.post(

      "/api/community/messages/send",

      form,

      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    const serverMessage =
      res.data.message;

    replaceMessage(
      msg.id,
      {

        ...serverMessage,

        status: "sent",
      }
    );

  } catch (err) {

    console.log(err);

    updateStatus(
      msg.id,
      "failed"
    );
  }
};  
  const resendCommunityVoice = async (msg) => {

  if (!msg.localBlob) {

    console.warn(
      "❌ No local blob"
    );

    return;
  }

  updateStatus(msg.id, "sending");

  const form = new FormData();

  form.append(
    "community_id",
    activeCommunity.id
  );

  form.append(
    "voice",
    msg.localBlob,
    "voice.webm"
  );

  if (msg.replied_to?.id) {

    form.append(
      "replied_to",
      msg.replied_to.id
    );
  }

  try {

    const res = await api.post(
      "/api/community/messages/voice",
      form,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    replaceMessage(msg.id, {
      ...res.data.message,
      sender:
        res.data.message.sender ||
        authUser,
    });

  } catch (err) {

    console.log(err);

    updateStatus(msg.id, "failed");
  }
};

    const retryCommunityMessage =
    async (msg) => {

    console.log(
      "Retrying:",
      msg
    );

    if (msg.type === "text") {

      return resendCommunityText(
        msg
      );
    }

    if (msg.type === "voice") {

      return resendCommunityVoice(
        msg
      );
    }

    if (
      [
        "image",
        "video",
        "audio",
        "file",
        "document",
      ].includes(msg.type)
    ) {

      return resendCommunityFile(
        msg
      );
    }
  };

  
   const handleScrollToMessage = (msg) => {
    const el = messageCommunityRefs.current[msg.id];

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      el.classList.add("bg-yellow-200");
      setTimeout(() => el.classList.remove("bg-yellow-200"), 1500);
    }
  };

   const getImage = (image) => {

    if (!image) return null;

    if (
      image.startsWith("http")
    ) {
      return image;
    }

    // ✅ storage image
    return `http://localhost:8000/storage/${image}`;
  };


  const getFollowerLabel = (count) => {
  return count === 1 ? "Follower" : "Followers";
};
  const formatCount = (num) => {
  if (!num) return "0";

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(".0", "") + "M";
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "k";
  }

  return num;
};

  if (!activeCommunity) {

    return (

      <div className="flex-1 flex items-center justify-center bg-[#0b141a] text-gray-500 text-xl">

        Select Community

      </div>
    );
  }

  return (

    <div className={`flex flex-col h-full bg-[var(--bg-color)] text-[var(--text-color)] relative
      ${uiMode !== 'full' ? 'border lg:rounded-xl' : ''}`}>

      {/* HEADER */}
     
          <div className="
          h-16
          shadow-md
          flex
          items-center
          justify-between
          py-2
          px-4
        ">

          {/* LEFT SIDE */}
          <div className="inline-flex items-center gap-3"> 
          <button
            className={`z-50 ${uiMode !== "full" ? "block" : "hidden"}`}
            onClick={goBackChannel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>         <div
        onClick={() => {
          if (uiMode !== "full") {
            onOpenSettings?.();
          }
        }}
        className="flex items-center gap-3 cursor-pointer"
      >

           
            {activeCommunity.community_image ? (
            <img
              src={getImage(
                activeCommunity.community_image
              )}
              alt={
                activeCommunity.community_name
              }
              className="
                w-12
                h-12
                rounded-full
                object-cover
              "
            />
          ) : (
            <div
              className={`
                w-12
                h-12
                rounded-full
                flex
                items-center
                justify-center
                font-bold
                text-lg
                sm:text-2xl
                text-white
                shrink-0
                ${getColor(
                  activeCommunity.community_name
                )}
              `}
            >
              {getInitial(
                activeCommunity.community_name
              )}
            </div>
          )}
            <div className="flex flex-col gap-1">
             <h3 className="font-bold block sm:hidden text-lg text-[var(--text-color)]">
                {activeCommunity.community_name?.length > 9
                  ? `${activeCommunity.community_name.slice(0, 9)}...`
                  : activeCommunity.community_name}
              </h3>

              <h3 className="font-bold sm:block hidden text-lg text-[var(--text-color)]">
                {activeCommunity.community_name}
              </h3>

              <p className="text-xs text-[var(--text-color)]">
                {activeCommunity.members_count === 0 ? "No followers" :
                `${formatCount(activeCommunity.members_count)}${" "} ${getFollowerLabel(activeCommunity.members_count)}`
                }
              </p>
              
            </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          {isMobile && selectedMessage && (
            <button
              onClick={(e) => {

                const rect =
                  e.currentTarget.getBoundingClientRect();

                setMenuPosition({
                  x: rect.left - 180,
                  y: rect.bottom + 10,
                });

                setShowMessageMenu(true);

                setReactionMsg(null);

              }}
              className="
                p-2
                rounded-full
                hover:bg-white/10
                transition
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                />
              </svg>
            </button>
          )}

        </div>

            <div
           ref={communityContainerRef}
            className="
            flex-1
            min-h-0
            overflow-y-auto
            overflow-hidden
            scrollbar-thin
            scrollbar-thumb-green-500
            scrollbar-track-transparent
            bg-[var(--primary-color)]
            relative
            px-1
          "
          >
          {loadingMessages ? (

            <ChatSkeleton
              type="messages"
            />

          ) : (
          <div >
          <PinnedCommunityBar 
          communityMessages={communityMessages} onSelect={handleScrollToMessage} 
          setMessages={setCommunityMessages}
          isAdmin={isAdmin}
          />

        <div className={`mb-4 text-center mt-4 mx-auto bg-gray-300 text-green-700 font-semibold 
        rounded-lg    text-[10px] p-3 ${uiMode !== 'full' ? "text-[10px] md:text-[14px] lg:text-[10px] w-72 lg:w-72 md:w-[500px]" 
        : 'sm:text-[12px] sm:w-[500px]'}`}>
          Messages in this channel are end-to-end encrypted. Only members of this channel can view or interact with posts.
          Admins can share updates and content. Calls and video calls are not available in channels.
        </div>
            
    {isAdmin &&
      pendingMessages.length > 0 && (
      <div
        onClick={() =>
          setApprovalModal(true)
        }
        className="sticky top-0 z-20 text-xs font-semibold flex justify-between border-b-2 border-blue-800 py-2 cursor-pointer">
        <span>
          Pending Approval Message
        </span>
        <span>
        {pendingMessages.length}
        </span>
        </div>
    )}
            {activeCommunity?.is_deleted ? (

            <div
              className="
                flex
                items-center
                justify-center
                h-[400px]
                text-gray-500
                text-sm
                text-center
              "
            >
              This channel has been deleted by the administrator.
            </div>

          ) : (
          <MessagesArea 
          
          setChats={setChats} setMessages={setMessages}
          communityMessages={communityMessages}
          authUser={authUser} messagesCacheRef={messagesCacheRef}
          retryCommunityMessage={retryCommunityMessage}
          setReplyingToCommunity={setReplyingToCommunity}
          activeCommunity={activeCommunity} firstUnreadMessageId={firstUnreadMessageId}
          setCommunityMessages={setCommunityMessages} setActiveChat={setActiveChat}
          replyingToCommunity={replyingToCommunity}
          textCommunity={textCommunity} setTextCommunity={setTextCommunity}
          selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage}
          showMessageMenu={showMessageMenu} setShowMessageMenu={setShowMessageMenu}
          isMobile={isMobile} reactionMsg={reactionMsg} setReactionMsg={setReactionMsg}
          setMenuPosition={setMenuPosition} menuPosition={menuPosition}
          communityMessageAction={communityMessageAction} messageCommunityRefs={messageCommunityRefs}
          pendingMessages={pendingMessages} setPendingMessages={setPendingMessages}
          isAdmin={isAdmin} setApprovalModal={setApprovalModal} approvalModal={approvalModal}
          chatLoading={chatLoading} chats={chats} openChat={openChat} onCloseChannel={onCloseChannel}
          authUserId={authUserId} setLastReadMessageId={setLastReadMessageId} setCommunities={setCommunities}
          goBackChannel={goBackChannel}
          />  
        )}           
       </div>
          )}

          <div ref={messagesCommunityEndRef} />
          </div>


        <InputComponent
          communityMessagesCache={communityMessagesCache}
          activeCommunity={
            activeCommunity
          }
          setMessages={setCommunityMessages}
          loadingMessages={loadingMessages}
          authUser={authUser}
          setReplyingToCommunity={setReplyingToCommunity}
          replyingToCommunity={replyingToCommunity}
          textCommunity={textCommunity} setTextCommunity={setTextCommunity}
          communityMessageAction={communityMessageAction}
          bottomRef={messagesCommunityEndRef}
          unreadCount={unreadCount} showScrollButton={showScrollButton} setShowScrollButton={setShowScrollButton}
          communityMessages={communityMessages} setLastReadMessageId={setLastReadMessageId} myId={myId} 
          setCommunities={setCommunities} latestMessage={latestMessage} messagesCommunityEndRef={messagesCommunityEndRef}
       />

      </div>
  );
}
