import { useState, useEffect } from "react";
import api from "../../Api/axios";
import MessageList from "./MessageList";
import CommunityMessageMenu from "./CommunityMessageMenu";
import toast from "react-hot-toast";
import MessageActionModal from "./MessageActionModal";
import { ForwardCommunityModal } from "./ForwardCommunityModal";

export default function MessagesArea({
  setActiveChat,
  messages,
  authUser,
  retryCommunityMessage,
  setReplyingTo,
  activeCommunity,
  setMessages, setMenuPosition, menuPosition,
  replyingToCommunity, textCommunity, setTextCommunity, setReplyingToCommunity, selectedMessage,
  setSelectedMessage, showMessageMenu, setShowMessageMenu, isMobile, setReactionMsg, reactionMsg,
  communityMessageAction, pendingMessages, isAdmin, setPendingMessages,
  setApprovalModal, approvalModal, messageRefs, chatLoading, chats, openChat, onCloseChannel
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
  const openForwardedChat = async (
  chatId,
  messageId
) => {
  onCloseChannel?.();

  const chat = chats.find(
    c => Number(c.id) === Number(chatId)
  );

  if (!chat) return;

  setActiveChat(chat);

  try {

    const res = await api.get(
      `/api/chats/${chatId}/messages`
    );

    const chatMessages =
      res.data.messages ||
      res.data.data ||
      res.data;

    setMessages(
      Array.isArray(chatMessages)
        ? chatMessages
        : []
    );

    setTimeout(() => {

      const el =
        document.getElementById(
          `msg-${messageId}`
        );

      if (!el) {
        console.log(
          "Message not found",
          messageId
        );
        return;
      }

      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      el.classList.add(
        "ring-2",
        "ring-green-500",
        "ring-offset-2"
      );

      setTimeout(() => {
        el.classList.remove(
          "ring-2",
          "ring-green-500",
          "ring-offset-2"
        );
      }, 3000);

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

      setMessages(prev =>
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

      setMessages(prev =>
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

      setMessages(prev =>
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

  setMessages(prev => [...prev, tempMessage]);

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

    setMessages(prev =>
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

    setMessages(prev =>
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
  setMessages(prev => [
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

    setMessages((prev) =>
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
    ? messages.filter(m =>
        m.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

// 👇 THIS is what you asked about
const listToRender =
  searchQuery.trim().length > 0 ? searchFilteredMessages : messages;


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

      

        {/* MESSAGE */}
        <MessageList
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
          setTextCommunity={setTextCommunity}
          pendingMessages={pendingMessages} setPendingMessages={setPendingMessages}
          messageRefs={messageRefs} setReplyingToCommunity={setReplyingToCommunity}
          selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage}
          showMessageMenu={showMessageMenu} setShowMessageMenu={setShowMessageMenu}
          setMenuPosition={setMenuPosition} menuPosition={menuPosition}
          setMessages={setMessages} communityMessageAction={communityMessageAction}
          showActionModal={showActionModal} setShowActionModal={setShowActionModal}
          actionType={actionType} setActionType={setActionType} forwardMessages={forwardMessages}
          actionMessage={actionMessage} setActionMessage={setActionMessage}
        />

      </div>
    );
  })}

    
    </div>

  <CommunityMessageMenu
      setMessages={setMessages}
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
        bottom-6
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