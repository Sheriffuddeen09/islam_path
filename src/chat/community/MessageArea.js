import { useState, useRef } from "react";
import api from "../../Api/axios";
import MessageList from "./MessageList";

export default function MessagesArea({

  messages,
  authUser,
  retryCommunityMessage,
  setReplyingTo,
  activeCommunity,
  setMessages,
   replyingToCommunity, textCommunity, setTextCommunity, setReplyingToCommunity
}) {

  const [forwardMsg, setForwardMsg] =
    useState(null);

  const [showForwardModal,
    setShowForwardModal] =
    useState(false);

  const [
  pendingMessages,
  setPendingMessages
  ] = useState([]);

    const [hoverMsgId, setHoverMsgId] = useState(null);
    const [reactionMsg, setReactionMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const messageRefs = useRef({});

    const role = activeCommunity?.my_role;

    const isAdmin =
      role === "admin" ||
      role === "owner";
      
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

  const isMobile = window.matchMedia("(pointer: coarse)").matches;

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

    const prevMsg =
      listToRender[index - 1];


    const isMine =
      msg.sender_id === authUser.id;

    return (
      <div
        key={msg.id}
        id={`msg-${msg.id}`}
        className={`
          px-3
          rounded
          py-2
          transition
          
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
          msg={msg} activeCommunity={activeCommunity}
          isMine={isMine}
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
          messageRefs={messageRefs}
        />

      </div>
    );
  })}

    
    </div>


    </>
  );
}