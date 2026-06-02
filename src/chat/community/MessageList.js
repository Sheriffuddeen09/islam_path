import Linkify from "linkify-react";
import CommunityReactionPopup from "./CommunityReactionPopUp";
import { useEffect, useRef, useState } from "react";
import CommunityRespondModal from "./CommunityRespondModal";
import ApprovalModal from "./ApprovalModal";
import api from "../../Api/axios";
import CommunityMessageMenu from "./CommunityMessageMenu";
import MessageActionModal from "./MessageActionModal";
import CommunityMediaMessage from "./CommunityMediaMessage";
import MediaPreview from "./MediaPreview";

export default function MessageList({msg, showForwardModal, forwardMsg, setReactionMsg, setShowForwardModal,
                                    reactionMsg, isMobile, authUser, retryCommunityMessage ,react,
                                    approveMessage, rejectMessage, handleForward, hoverMsgId, isAdmin,
                                    setHoverMsgId, sendTextCommunity, setTextCommunity, textCommunity, activeCommunity,
                                    pendingMessages, setPendingMessages, messageRefs, selectedMessage,
                                    setSelectedMessage, showMessageMenu, setShowMessageMenu, setReplyingToCommunity,
                                    setMenuPosition, menuPosition, communityMessageAction, setMessages,
                                    approvalModal, setApprovalModal}){

                                
                                      
  const [respondModal, setRespondModal] = useState(false);

  //setApprovalModal

  const [respondingMessage, setRespondingMessage] = useState("");
  const [toast, setToast] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [expandedMessages, setExpandedMessages] = useState({});

  const [previewMessage, setPreviewMessage] =
  useState(null);

  const [showPreview, setShowPreview] =
  useState(false);

  
  const startX = useRef(0);
  const dragX = useRef(0);
  const isDragging = useRef(false);
  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const [translateX, setTranslateX] = useState(0);

  const hasLink =
  /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi.test(
    msg.message || ""
  );



  const isExpanded =
  expandedMessages[msg.id];

const messageText =
  msg.message || "";

const shouldTrim =
  messageText.length > 250;

const displayText =
  shouldTrim && !isExpanded
    ? messageText.slice(0, 250) + " "
    : messageText;

  const isInteractive = (target) => {
  return !!target.closest(
    `button,
      a,
      input,
      textarea,
      video,
      audio,
      svg
      `)};

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const copyMessageText = async (
  mgs
) => {

  try {

    await navigator.clipboard.writeText(
      mgs || ""
    );

    showToast(
      "Message copied",
      "success"
    );

  } catch (err) {

    showToast(
      "Failed to copy",
      "error"
    );

  }
};

  const scrollToMessage =
  (id) => {

  const el =
    messageRefs.current[id];

  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  // highlight effect
  el.classList.add(
    "bg-green-200/20"
  );

  setTimeout(() => {
    el.classList.remove(
      "bg-green-200/20"
    );
  }, 2000);
};


  useEffect(() => {

  if (!isAdmin)
    return;

   
    const fetchPending =
      async () => {

      try {

        const { data } =
          await api.get(
            `/api/community/${activeCommunity.id}/pending`
          );

        setPendingMessages(
          data.pending || []
        );

      } catch (err) {

        console.log(err);
      }
    };

    fetchPending();

  }, [
    activeCommunity?.id,
    isAdmin,
  ]);


  // FRONTEND DOWNLOAD

const handleDownloadMessage =
  async (message) => {

    try {

      const token = localStorage.getItem("token");

      const response =
        await fetch(
          `http://localhost:8000/api/community/messages/download/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Download failed"
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        message.type === "video"
          ? "video.mp4"
          : "image.jpg";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(
        url
      );

    } catch (err) {

      console.log(err);

    }
};



     return (
        <div>
          <div
            key={msg.id}
            className={`
              max-w-md w-full mx-auto
              rounded-2xl
              relative
              group
              transition-all
              cursor-pointer
              bg-[#202c33]
            `}

           style={{
    transform: `translateX(${translateX}px)`,

    transition:
      translateX === 0
        ? "transform 0.2s ease"
        : "none",

    touchAction: "none",
  }}

  onPointerDown={(e) => {

    if (isInteractive(e.target))
      return;

    longPressTriggered.current =
      false;

    isDragging.current = true;

    startX.current = e.clientX;

    dragX.current = 0;

    pressTimer.current =
      setTimeout(() => {

        longPressTriggered.current =
          true;

        setReactionMsg(msg);
        setSelectedMessage(msg);
        setShowMessageMenu(false);

      }, 500);
  }}

  onPointerMove={(e) => {

    if (isInteractive(e.target))
      return;

    if (!isDragging.current)
      return;

    const diff =
      e.clientX - startX.current;

    // cancel long press if dragging
    if (Math.abs(diff) > 10) {

      clearTimeout(
        pressTimer.current
      );
    }

    // RIGHT SWIPE ONLY
    if (diff > 0) {

      const MAX = 80;

      const x = Math.min(
        diff,
        MAX
      );

      dragX.current = diff;

      setTranslateX(x);
          }
        }}

        onPointerUp={(e) => {

          isDragging.current = false;

          clearTimeout(
            pressTimer.current
          );

          const diff = dragX.current;

          setTranslateX(0);

          dragX.current = 0;

          // SWIPE TO REPLY
          if (diff > 60) {

            setReplyingToCommunity(
              msg
            );
          }
        }}

        onPointerCancel={() => {

          clearTimeout(
            pressTimer.current
          );

          isDragging.current = false;

          setTranslateX(0);

          dragX.current = 0;
        }}

        onClick={(e) => {

          e.stopPropagation();

          if (isInteractive(e.target))
            return;

          // prevent click after long press
          if (
            longPressTriggered.current
          ) {
            return;
          }

          // normal click logic here
        }}
           onMouseEnter={() => {
            setHoverMsgId(msg.id);
            }}
            onMouseLeave={() => {
            setHoverMsgId(null);
            }}
          >
            
            {msg.deleted_at ? (

              <div className="flex items-center py-2 px-4 gap-2 italic text-white text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                <span>This message was deleted</span>
              </div>

            ) : (

              <>
              
                

                {/* REPLY MESSAGE */}
                {msg.replied_to && msg.replied_message && (
                  <div
                    onClick={() =>
                      scrollToMessage(
                        msg.replied_message.id
                      )
                    }
                    className="
                      bg-black/20
                      border-l-4
                      border-green-500
                      p-4
                      rounded-xl
                      cursor-pointer
                      text-white
                      -translate-y-
                      -mb-4
                    "
                  >
                    <div
                      className="
                        text-xs
                        opacity-80
                        truncate
                        inline-flex
                        gap-2
                        items-center
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                    <span className="sm:hidden block">
                     {
                        msg.replied_message?.message?.length > 40
                          ? msg.replied_message.message.slice(0, 40) + "..."
                          : msg.replied_message?.message
                      }
                      </span>

                      <span className="sm:block hidden">
                     {
                        msg.replied_message?.message?.length > 75
                          ? msg.replied_message.message.slice(0, 75) + "..."
                          : msg.replied_message?.message
                      }
                      </span>
                    </div>
                    <br />
                    <span className="text-[13px]">
                    {
                      msg.message
                    }
                    </span>
                  </div>
                )}

                {/* MESSAGE PREVIEW */}
                <CommunityMediaMessage  
                  isMobile={isMobile}
                  onPreview={(message) => {
                  setPreviewMessage(message);
                    setShowPreview(true);
                  }}
                  onDownload={(message) => {
                    handleDownloadMessage(message);
                  }}
                  msg={msg} 
                
                 />
                <div
                        className={`text-[13px] pt-3 mt-1 px-4 text-white ${
                          hasLink ? "w-56" : "w-auto"
                        }`}
                      >
                        <Linkify
                          options={{
                            target: "_blank",
                            className:
                              "text-blue-400 pointer-events-auto",
                          }}
                        >

                    {msg?.approvals?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.approvals.map(approval => (
                        <div
                          key={approval.id}
                        >
                            {approval.admin_response}
                        </div>
                      ))}
                    </div>
                  )}

                        </Linkify>
                  </div>
                  
                 {!msg.replied_to && !msg.replied_message && (
                 <div
                        className={`text-[13px] pt-3 mt-1 px-4 text-white ${
                          hasLink ? "w-56" : "w-auto"
                        }`}
                      >
                        <Linkify
                          options={{
                            target: "_blank",
                            className:
                              "text-blue-400 pointer-events-auto",
                          }}
                        >
                    {displayText}
                
                  </Linkify>

                  {shouldTrim && (
                    <button
                      onClick={() =>
                        setExpandedMessages((prev) => ({
                          ...prev,
                          [msg.id]:
                            !prev[msg.id],
                        }))
                      }
                      className="
                        text-green-400
                        text-xs
                        font-semibold
                        hover:underline
                      "
                    >
                      {isExpanded
                        ? ""
                        : "See more"}
                    </button>
                  )}
                </div>
                 )}
              </>
            )}
            <div className="
              flex
              items-center
              justify-between
              px-4
              mt-3
            ">
              {!isMobile && hoverMsgId === msg.id && (
                <div
                    className={`absolute -bottom-7 flex bg-gray-50 shadow-md text-black p-1 px-1 gap-1 
                        z-50 rounded-lg shadow-xl px-2 right-0 `}
                >
              {Boolean(Number(msg.response_mode))  && msg.replied_to === null && isAdmin && (
              <button
                onClick={() =>
                  setReplyingToCommunity(true)
                }
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>

              </button>
                  )}

             
                    <button
                  onClick={(e) => {
                        e.stopPropagation();
                        setReactionMsg(msg); // OPEN POPUP
                    }}
                    className=""
                    >
                <svg 
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                </svg>
                </button>

                <button
                  onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMessage(msg);
                  const rect =
                    e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    x: rect.left,
                    y: rect.bottom + 10,
                  });
                  setShowMessageMenu(true);
                }}>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                    />
                  </svg>

                </button>

                 <button
                onClick={() =>
                  handleForward(msg)
                }
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                </svg>
              </button>
                </div>
              )}
              <div className="
                text-[10px]
                text-white
                items-center
                flex gap-1
                justify-end
                flex-1
              ">
                 {Boolean(Number(msg.edited)) && (
                    <span className="text-[12px] text-white italic">
                      edited
                    </span>
                  )}
                <div className="text-center text-[9px] text-white my-2">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
                 {msg.status ===
                "failed" && (
                <button
                  onClick={() =>
                    retryCommunityMessage(
                      msg
                    )
                  }
                  className="
                    text-red-500
                  "
                >
                  Retry
                </button>
              )}
              {msg.status ===
                "sending" && (
                <span >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                </span>
               )} 
              </div>
            </div>
            {msg.reactions?.length > 0 && (
              <div className="
                absolute
                -bottom-3
                left-2
                flex
                gap-1
                bg-white
                px-2
                py-0.5
                rounded-full
                shadow
                text-xs
              ">
                {Object.values(
                  msg.reactions.reduce(
                    (acc, r) => {
                      if (
                        !acc[r.emoji]
                      ) {
                        acc[r.emoji] = {
                          emoji: r.emoji,
                          count: 0,
                        };
                      }
                      acc[r.emoji]
                        .count++;
                      return acc;
                    },
                    {}
                  )
                ).map((r, i) => (
                  <span key={i}>
                    {r.emoji}
                    {r.count > 1 &&
                      ` ${r.count}`}
                  </span>
                ))}
              </div>
            )}
            {Boolean(Number(msg.response_mode))  && msg.replied_to === null && !isAdmin && (
            <div className="
              mx-auto
              text-center
              mt-3
              text-sm
              text-green-800 font-bold 
              border-t py-2
            ">
                <button
                  onClick={() => {
                    setRespondingMessage(msg);
                    setRespondModal(true);
                  }}
                >
                  Respond
                </button>
            </div>
            )}
           {reactionMsg?.id === msg.id && (
        <div className={`absolute  bottom-0 z-[9999] 
        `}>
            <CommunityReactionPopup
            onReact={react}
            message={reactionMsg}
            setShowReactions={() => setReactionMsg(null)}
            />
        </div>
        )}
          </div>
         {showForwardModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#202c33] rounded-2xl w-[90%] max-w-md p-4">
            <h2 className="text-white text-lg font-bold mb-4">
              Forward Message
            </h2>
            <div className="bg-black/30 rounded-xl p-3 text-white text-sm mb-4">
              {forwardMsg?.message}
            </div>
            <button
              className="w-full bg-green-600 py-3 rounded-xl text-white font-semibold"
              onClick={() => {
                setShowForwardModal(
                  false
                );
              }}
            >
              Forward
            </button>
            <button
              className="w-full mt-3 py-3 rounded-xl bg-gray-700 text-white"
              onClick={() =>
                setShowForwardModal(
                  false
                )
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <CommunityRespondModal
      open={respondModal}
      setOpen={setRespondModal}
      message={respondingMessage}
      onSend={sendTextCommunity}
       text={textCommunity}
        setText={setTextCommunity}
      
    />

      

    <MediaPreview 
    showPreview={showPreview}
    setShowPreview={setShowPreview}
    previewMessage={previewMessage}
    authUser={authUser}
    isAdmin={isAdmin}
    handleDownloadMessage={handleDownloadMessage}
    setActionType={setActionType}
    showToast={showToast}
    setMessages={setMessages}
    communityMessageAction={communityMessageAction}
    react={react}
    setActionMessage={setActionMessage}
    actionMessage={actionMessage}
    msg={msg}
    activeCommunity={activeCommunity}
    reactionMsg={reactionMsg} setReactionMsg={setReactionMsg} 
    actionType={actionType} setSelectedMessage={setSelectedMessage}
    setShowActionModal={setShowActionModal} showActionModal={showActionModal}
     />


    <ApprovalModal
      open={approvalModal}
      setOpen={setApprovalModal}
      messages={pendingMessages}
      setMessages={setPendingMessages}
      onApprove={approveMessage}
      onReject={rejectMessage}
      msg={msg}
    />
    <CommunityMessageMenu
    isAdmin={isAdmin}
    open={showMessageMenu}
    isMobile={isMobile}
    selectedMessage={selectedMessage}
    authUser={authUser}
    anchorPosition={menuPosition}

    onClose={() =>
      setShowMessageMenu(false)
    }

    onCopy={() => {

    copyMessageText(
      selectedMessage?.msg
    );

    setShowMessageMenu(false);
  }}
   

    onReply={() => {
      setReplyingToCommunity(
        selectedMessage
      );
      setShowMessageMenu(false);
    }}

    onShare={() => {
      handleForward(selectedMessage);
      setShowMessageMenu(false);}}
    setShowMessageMenu={setShowMessageMenu}
    showToast={showToast}
    setMessages={setMessages}
    communityMessageAction={communityMessageAction}
    message={msg}
    setActionType={setActionType}
    setActionMessage={setActionMessage}
    setShowActionModal={setShowActionModal}

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

    {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}




    </div>
     )
}

