import { useState, useEffect } from "react";
import api from "../../Api/axios";
import MessageList from "./MessageList";
import CommunityMessageMenu from "./CommunityMessageMenu";
import toast from "react-hot-toast";
import MessageActionModal from "./MessageActionModal";
import { ForwardCommunityModal } from "./ForwardCommunityModal";

export default function MessagesArea({
  setActiveChat,
  communityMessages,
  authUser,
  retryCommunityMessage,
  setReplyingTo,
  activeCommunity,
  setCommunityMessages, setMenuPosition, menuPosition,
  replyingToCommunity, textCommunity, setTextCommunity, setReplyingToCommunity, selectedMessage,
  setSelectedMessage, showMessageMenu, setShowMessageMenu, isMobile, setReactionMsg, reactionMsg,
  communityMessageAction, pendingMessages, isAdmin, setPendingMessages, messagesCacheRef,
  setApprovalModal, approvalModal, messageRefs, chatLoading, chats, openChat, onCloseChannel, setChats,
  firstUnreadMessageId, authUserId, setLastReadMessageId, setCommunities
}) {

  const [forwardMsg, setForwardMsg] =
    useState(null);
  const [forwardSuccess, setForwardSuccess] =
  useState(null);

  const [showForwardModal,
    setShowForwardModal] =
    useState(false);

  const [forwardMessages, setForwardMessages] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const [actionMessage, setActionMessage] = useState(null);

  const [hoverMsgId, setHoverMsgId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  //

  const systemMessages = communityMessages.filter(
  (msg) => msg.is_system
  );

  const normalMessages = communityMessages.filter(
    (msg) => !msg.is_system
  );

  const scrollToForwardedMessage = (
  messageId
) => {

  let attempts = 0;

  const interval = setInterval(() => {

    const el = document.getElementById(
      `msg-${messageId}`
    );

    if (el) {

      clearInterval(interval);

      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      el.classList.add(
        "bg-yellow-200"
      );

      setTimeout(() => {
        el.classList.remove(
          "bg-yellow-200"
        );
      }, 3000);

      return;
    }

    attempts++;

    if (attempts > 20) {
      clearInterval(interval);
    }

  }, 300);
};

  const openForwardedChat = async (
  chatId,
  messageId
) => {

  try {

    onCloseChannel?.();

    const chatsRes =
      await api.get("/api/chats");

    const allChats =
      chatsRes.data.chats ||
      chatsRes.data;

    setChats(allChats);

    const chat = allChats.find(
      c => Number(c.id) === Number(chatId)
    );

    if (!chat) return;

    // 🔥 FORCE REFRESH
    delete messagesCacheRef.current[
      chat.id
    ];

    setActiveChat(chat);

    await openChat(chat);

    setTimeout(() => {

      scrollToForwardedMessage(
        messageId
      );

    }, 800);

    setForwardSuccess(null);

  } catch (err) {

    console.error(err);

  }
};

  useEffect(() => {
  if (!forwardSuccess) return;

  const timer = setTimeout(() => {
    setForwardSuccess(null);
  }, 5000);

  return () => clearTimeout(timer);
}, [forwardSuccess]);

  const closeForward = () => {
    setShowForwardModal(false);
    setSelectedMessage([]);
  };
  
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
  
        const res = await api.get("/api/groups");
  
        setGroups(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingGroups(false);
      }
    };
  
    fetchGroups();
  }, []);

    const openForward = (msg) => {
  
    console.log("FORWARDING:", msg);
    setForwardMessages([msg]);
    setShowForwardModal(true);

  };
    
   const getMessageText = (msg) => {
  // approval message exists
  if (
    msg?.approvals?.length > 0 &&
    msg.approvals[0]?.admin_response
  ) {
    return msg.approvals[0].admin_response;
  }

  // normal message
  return msg?.message || "";
};

   const copyMessageText = async (msg) => {
  try {
    const textToCopy = getMessageText(msg);

    await navigator.clipboard.writeText(
      textToCopy
    );

    toast.success(
      "Message copied",
      "success"
    );

  } catch (err) {
    toast.error(
      "Failed to copy",
      "error"
    );
  }
};
 

const handleConfirmAction = async (
  msg,
  editedText
) => {

  try {

    if (actionType === "delete") {

      await communityMessageAction({
        action: "delete",
        message_id: msg.id,
      });

      setCommunityMessages(prev =>
        prev.map(m =>
          m.id === msg.id
            ? {
                ...m,
                deleted_at:
                  new Date().toISOString(),
              }
            : m
        )
      );
    }

    if (actionType === "clear") {

      await communityMessageAction({
        action: "clear",
        message_id: msg.id,
      });

      setCommunityMessages(prev =>
        prev.map(m =>
          m.id === msg.id
            ? {
                ...m,
                message: "",
                file: null,
              }
            : m
        )
      );
    }

    if (actionType === "edit") {

      await communityMessageAction({
        action: "edit",
        message_id: msg.id,
        message: editedText,
      });

      setCommunityMessages(prev =>
        prev.map(m =>
          m.id === msg.id
            ? {
                ...m,
                message: editedText,
                edited: true,
              }
            : m
        )
      );
    }

  } catch (err) {

    console.log(err);

  }

  setShowActionModal(false);
};

      
const sendTextCommunity = async ({
  response_mode = false,
  message = null,
  message_id = null,
} = {}) => {

  const finalMessage = message || textCommunity;

  if (!finalMessage?.trim()) return;

  const reply = message_id
    ? { id: message_id }
    : replyingToCommunity;

  const tempId = Date.now();

  const tempMessage = {
    id: tempId,
    message: finalMessage,
    type: "text",
    sender_id: authUser.id,
    sender: authUser,

    approval_status: response_mode ? "pending" : "approved",
    status: "sending",
    created_at: new Date().toISOString(),

    // 🔥 IMPORTANT: keep full object for UI
    replied_to: reply || null,

    response_mode,
  };

  setCommunityMessages(prev => [...prev, tempMessage]);

  setTextCommunity("");
  setReplyingToCommunity(null);

  try {

    const { data } = await api.post(
      "/api/community/pending/send",
      {
        community_id: activeCommunity.id,

        // 🔥 FIX: use correct message
        message: finalMessage,

        reply_to: reply?.id || null,
      }
    );

    const realMessage = data.message || data.messages?.[0];

    setCommunityMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? {
              ...realMessage,
              status: "sent",
            }
          : m
      )
    );

  } catch (err) {

    setCommunityMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? { ...m, status: "failed" }
          : m
      )
    );

    throw err;
  }
};


  const approveMessage =
  async ({
    messageId,
    text,
  }) => {

  const { data } =
    await api.post(
      `/api/community/messages/${messageId}/approve`,
      {
        text,
      }
    );

  // REMOVE PENDING
  setPendingMessages(prev =>
    prev.filter(
      m => m.id !== messageId
    )
  );

  // ADD TO CHAT
  setCommunityMessages(prev => [
    ...prev,
    data.message
  ]);

  // UPDATE CACHE
  messageRefs.current[
    activeCommunity.id
  ] = [
    ...(
      messageRefs.current[
        activeCommunity.id
      ] || []
    ),

    data.message
  ];

  return data;
};
      
  const rejectMessage =
    async ({
      messageId,
      text,
    }) => {

    await api.post(
      `/api/community/messages/${messageId}/reject`,
      {
        text,
      }
    );

    // REMOVE IMMEDIATELY
    setPendingMessages(prev =>
      prev.filter(
        m => m.id !== messageId
      )
    );
  };


  const handleSearch = (text) => {
      // setSearchMode(true);
      setSearchQuery(text);
    };

const react = async (messageId, emoji) => {

  try {

    const { data } = await api.post(
      "/api/community/messages/react",
      {
        message_id: messageId,
        emoji,
      }
    );

    setCommunityMessages((prev) =>
      prev.map((m) =>
        m.id === data.id
          ? data
          : m
      )
    );

    setReactionMsg(null);

  } catch (err) {

    console.log(err);

  }
};

  const handleForward = (msg) => {

    setForwardMsg(msg);

    setShowForwardModal(true);
  };


  const searchFilteredMessages =
  searchQuery.trim().length > 0
    ? communityMessages.filter(m =>
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : communityMessages;

// 👇 THIS is what you asked about
const listToRender =
  searchQuery.trim().length > 0 ? searchFilteredMessages : communityMessages;

  const unreadCount =
  communityMessages.filter(msg =>
    msg.id >= firstUnreadMessageId &&
    msg.sender_id !== authUserId
  ).length;

return (

  <>

    <div
  
>
{listToRender
  .filter((msg) => {

    // admin / owner sees everything
    if (isAdmin) {
      return true;
    }

    // sender sees own pending
    if (
      msg.sender_id === authUser.id
    ) {
      return true;
    }

    // everyone else sees approved only
    return (
      msg.approval_status ===
      "approved"
    );
  })
  .map((msg, index) => {

    const isMatch =
      searchQuery &&
      msg.message
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        );

    return (
      <div
        key={msg.id}
        id={`msg-${msg.id}`}
        data-forwarded={
          msg.is_forwarded
            ? "true"
            : "false"
        }
        className={`
          px-3
          rounded
          transition
          py-0.5 lg:py-4
          ${
            searchQuery &&
            !isMatch
              ? "opacity-20"
              : "opacity-100"
          }
        `}
        ref={(el) => {

          if (el) {

            messageRefs.current[
              msg.id
            ] = el;
          }
        }}
      >

        {
  firstUnreadMessageId &&
  communityMessages.length > 0 &&
  msg.id === firstUnreadMessageId &&
  msg.sender_id !== authUserId && (

    <div className="
      flex
      justify-center
      my-4
    ">

      <span className="
        px-3
        py-1
        rounded-full
        bg-blue-600
        text-white
        text-xs
      ">
        {unreadCount} Unread Update

      </span>

    </div>
  )
}
  
        {/* MESSAGE */}
        <MessageList
          setLastReadMessageId={setLastReadMessageId} setCommunities={setCommunities}
          chatLoading={chatLoading}
          chats={chats}
          msg={msg} activeCommunity={activeCommunity}
          setApprovalModal={setApprovalModal} approvalModal={approvalModal}
          authUser={authUser}
          showForwardModal={showForwardModal}
          forwardMsg={forwardMsg}
          setReactionMsg={setReactionMsg}
          reactionMsg={reactionMsg}
          hoverMsgId={hoverMsgId}
          isMobile={isMobile}
          retryCommunityMessage={retryCommunityMessage}
          react={react}
          setReplyingTo={setReplyingTo}
          handleForward={handleForward}
          setHoverMsgId={setHoverMsgId}
          setShowForwardModal={setShowForwardModal}
          sendTextCommunity={sendTextCommunity}
          isAdmin={isAdmin}
          approveMessage={approveMessage}
          rejectMessage={rejectMessage}
          textCommunity={textCommunity}
          setTextCommunity={setTextCommunity} openForward={openForward}
          pendingMessages={pendingMessages} setPendingMessages={setPendingMessages}
          messageRefs={messageRefs} setReplyingToCommunity={setReplyingToCommunity}
          selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage}
          showMessageMenu={showMessageMenu} setShowMessageMenu={setShowMessageMenu}
          setMenuPosition={setMenuPosition} menuPosition={menuPosition}
          setMessages={setCommunityMessages} communityMessageAction={communityMessageAction}
          showActionModal={showActionModal} setShowActionModal={setShowActionModal}
          actionType={actionType} setActionType={setActionType} forwardMessages={forwardMessages}
          actionMessage={actionMessage} setActionMessage={setActionMessage}
        />

      </div>
    );
  })}

    
    </div>

  <CommunityMessageMenu
      setMessages={setCommunityMessages}
      isAdmin={isAdmin}
      open={showMessageMenu}
      isMobile={isMobile}
      selectedMessage={selectedMessage}
      authUser={authUser}
      anchorPosition={menuPosition}
      setSelectedMessage={setSelectedMessage}
      onClose={() => setShowMessageMenu(false) }
      onCopy={() => { 
        copyMessageText(selectedMessage);
        setShowMessageMenu(false);
      }}
      onReply={() => { 
        setReplyingToCommunity(selectedMessage);
        setShowMessageMenu(false);
      }}
      onShare={() => {
        handleForward(selectedMessage);
        setShowMessageMenu(false);}}
      setShowMessageMenu={setShowMessageMenu}
      communityMessageAction={communityMessageAction}
      setActionType={setActionType}
      setActionMessage={setActionMessage}
      setShowActionModal={setShowActionModal}
      openForward={openForward}
    />

    
        <MessageActionModal
        open={showActionModal}
        type={actionType}
        message={actionMessage}
        onClose={() =>
          setShowActionModal(false)
        }
        onConfirm={handleConfirmAction}
      />

      <div>
          {showForwardModal && (
            <ForwardCommunityModal
              users={chats}
              groups={groups}
              loadingChats={chatLoading}
              loadingGroups={loadingGroups}
              activeCommunity={activeCommunity}
              messages={forwardMessages}
              onClose={closeForward}   
              setSelectedMessage={setSelectedMessage}
              setShowForwardModal={setShowForwardModal}
              forwardMessages={forwardMessages}
              setForwardSuccess={setForwardSuccess}
            />
          )}
          </div>

         {forwardSuccess && (
    <div
      className="
        fixed
        bottom-10
        right-6
        bg-[#1f1f1f]
        text-white
        px-4
        py-3
        rounded-xl
        shadow-lg
        z-[9999]
      "
    >
    <div>
      Message forwarded
    </div>

    {forwardSuccess.targetCount === 1 && (
      <button
        onClick={() =>
          openForwardedChat(
            forwardSuccess.chatId,
            forwardSuccess.messageId
          )
        }
        className="
          text-blue-400
          text-sm
          font-bold
          mt-2
          hover:underline
        "
      >
        View Chat
      </button>
    )}
  
    </div>
  )
}



    </>
  );
}