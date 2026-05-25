import Linkify from "linkify-react";
import { useState, useRef } from "react";
import api from "../../Api/axios";
import CommunityReactionPopup from "./CommunityReactionPopUp";
import MessageList from "./MessageList";

const formatMessageTime = (date) => {

  if (!date) return "";

  const now = new Date();
  const msgDate = new Date(date);

  const isToday =
    now.toDateString() ===
    msgDate.toDateString();

  const yesterday = new Date();
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const isYesterday =
    yesterday.toDateString() ===
    msgDate.toDateString();

  if (isToday) {

    return msgDate.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return msgDate.toLocaleDateString();
};

export default function MessagesArea({

  messages,
  authUser,
  retryCommunityMessage,
  setReplyingTo,
  activeCommunity,
  setMessages

}) {

  const [forwardMsg, setForwardMsg] =
    useState(null);

  const [showForwardModal,
    setShowForwardModal] =
    useState(false);

    const [hoverMsgId, setHoverMsgId] = useState(null);
    const [reactionMsg, setReactionMsg] = useState(null);

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

return (

  <>

    <div className="flex-1 overflow-y-auto p-4 space-y-4 ">

      {messages.map((msg) => {

        const isMine =
          msg.sender_id === authUser.id;

          return(
            <MessageList msg={msg} showForwardModal={showForwardModal} forwardMsg={forwardMsg}
            setReactionMsg={setReactionMsg} reactionMsg={reactionMsg} hoverMsgId={hoverMsgId}
            isMobile={isMobile} isMine={isMine} authUser={authUser} retryCommunityMessage={retryCommunityMessage}
            react={react} setReplyingTo={setReplyingTo} activeCommunity={activeCommunity} 
            formatMessageTime={formatMessageTime} handleForward={handleForward} setHoverMsgId={setHoverMsgId}
            setShowForwardModal={setShowForwardModal}
            />
          )

      })
    }
    </div>


    </>
  );
}