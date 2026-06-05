import { useRef, useState } from "react";
import api from "../../Api/axios";
import InputComponent from "./InputComponent";
import MessagesArea from "./MessageArea";
import { ChatSkeleton } from "../chatbox/ChatSkeleton";
import { PinnedCommunityBar } from "./PinnedCommunityBar";

export default function CommunityMessages({
  activeCommunity,
  messages,
  setMessages,
  onBack,
  authUser,
  loadingMessages,
  chatLoading, chats, openChat, onCloseChannel, setActiveChat

}) {

    const [replyingToCommunity, setReplyingToCommunity] = useState(null);
    const [textCommunity, setTextCommunity] = useState("");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageMenu, setShowMessageMenu] = useState(false);
    const [reactionMsg, setReactionMsg] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0,});

    const [ approvalModal, setApprovalModal ] = useState(false);
    
    const [ pendingMessages, setPendingMessages ] = useState([]);
    const messageRefs = useRef({});

    
     const bottomRef = useRef(null);

    const role = activeCommunity?.my_role;


    const isAdmin =
      role === "admin" ||
      role === "owner";
  
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    
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
      setMessages(prev => [
        ...prev,
        tempMessage,
      ]);
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
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


    const updateStatus = (id, status) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, status }
          : m
      )
    );
  };

  //No

  const replaceMessage = (id, newMsg) => {

    setMessages(prev =>
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
    const el = messageRefs.current[msg.id];

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


  if (!activeCommunity) {

    return (

      <div className="flex-1 flex items-center justify-center bg-[#0b141a] text-gray-500 text-xl">

        Select Community

      </div>
    );
  }

  return (

    <div className="h-full flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">

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
          <div className="flex items-center gap-3">

            <button
              className="lg:hidden"
              onClick={onBack}
            >
              <button className="lg:hidden"
                onClick={onBack}
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
              </button>
            </button>
            {activeCommunity.community_image && (
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
            )}

            <div>
             <h3 className="font-bold block sm:hidden text-lg text-[var(--text-color)]">
                {activeCommunity.community_name?.length > 9
                  ? `${activeCommunity.community_name.slice(0, 9)}...`
                  : activeCommunity.community_name}
              </h3>

              <h3 className="font-bold sm:block hidden text-lg text-[var(--text-color)]">
                {activeCommunity.community_name}
              </h3>
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
          <div>
          <PinnedCommunityBar 
          messages={messages} onSelect={handleScrollToMessage} setMessages={setMessages}
          />
            
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
          
          <MessagesArea 
          messages={messages}
          authUser={authUser}
          retryCommunityMessage={retryCommunityMessage}
          setReplyingToCommunity={setReplyingToCommunity}
          activeCommunity={activeCommunity}
          setMessages={setMessages} setActiveChat={setActiveChat}
          replyingToCommunity={replyingToCommunity}
          textCommunity={textCommunity} setTextCommunity={setTextCommunity}
          selectedMessage={selectedMessage} setSelectedMessage={setSelectedMessage}
          showMessageMenu={showMessageMenu} setShowMessageMenu={setShowMessageMenu}
          isMobile={isMobile} reactionMsg={reactionMsg} setReactionMsg={setReactionMsg}
          setMenuPosition={setMenuPosition} menuPosition={menuPosition}
          communityMessageAction={communityMessageAction} messageRefs={messageRefs}
          pendingMessages={pendingMessages} setPendingMessages={setPendingMessages}
          isAdmin={isAdmin} setApprovalModal={setApprovalModal} approvalModal={approvalModal}
          chatLoading={chatLoading} chats={chats} openChat={openChat} onCloseChannel={onCloseChannel}
          />            
       </div>
          )}
          </div>
        <InputComponent
          activeCommunity={
            activeCommunity
          }
          setMessages={setMessages}
          authUser={authUser}
          setReplyingToCommunity={setReplyingToCommunity}
          replyingToCommunity={replyingToCommunity}
          textCommunity={textCommunity} setTextCommunity={setTextCommunity}
          communityMessageAction={communityMessageAction}
          bottomRef={bottomRef}
       />

      </div>
  );
}