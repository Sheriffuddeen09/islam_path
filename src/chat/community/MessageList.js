import Linkify from "linkify-react";
import CommunityReactionPopup from "./CommunityReactionPopUp";
import { useEffect, useState } from "react";
import CommunityRespondModal from "./CommunityRespondModal";
import ApprovalModal from "./ApprovalModal";
import api from "../../Api/axios";

export default function MessageList({msg, showForwardModal, forwardMsg, setReactionMsg, setShowForwardModal,
                                    reactionMsg, isMobile, isMine, authUser, retryCommunityMessage ,react,
                                    setReplyingTo, approveMessage, rejectMessage, handleForward, hoverMsgId, isAdmin,
                                    setHoverMsgId, sendTextCommunity, setTextCommunity, textCommunity, activeCommunity,
                                  pendingMessages, setPendingMessages, messageRefs}){

                                
                                      
  const [respondModal, setRespondModal] = useState(false);

  const [respondingMessage, setRespondingMessage] = useState("");
  const [ approvalModal, setApprovalModal ] = useState(false);


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
    "bg-yellow-500/20"
  );

  setTimeout(() => {
    el.classList.remove(
      "bg-yellow-500/20"
    );
  }, 2000);
};

  const isSystemResponse = msg.response_mode === true;
  const isReply = !!msg.replied_to;

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

     return (
        <div>
          <div
            key={msg.id}
            className={`
              max-w-md w-full mx-auto
              rounded-2xl
              py-3
              relative
              group
              transition-all
              cursor-pointer

              ${
                isMine
                  ? "ml-auto bg-[#202c33]"
                  : "bg-[#202c33]"
              }
            `}

            // ✅ DESKTOP / LARGE SCREEN HOVER
           onMouseEnter={() => {
            setHoverMsgId(msg.id);
            }}

            onMouseLeave={() => {
            setHoverMsgId(null);
            }}

            // ✅ MOBILE + IPAD LONG PRESS pointer-events
           onPointerDown={(e) => {
            if (!isMobile) return;

            e.currentTarget.pressTimer = setTimeout(() => {
                setReactionMsg(msg);
            }, 500);
            }}

            onPointerUp={(e) => {
            clearTimeout(e.currentTarget.pressTimer);
            }}

            onPointerCancel={(e) => {
            clearTimeout(e.currentTarget.pressTimer);
            }}
          >

            {/* SENDER */}
            <p className="
              text-[12px]
              px-4
              font-semibold
              text-white
              mb-1
            ">
             {msg.replied_to === null && (
              <span>
                {msg.sender?.first_name || msg.sender?.name}
                {" "}
                {msg.sender?.last_name || ""}
              </span>
            )}
            </p>

            {/* REPLY */}

                {isReply && msg.repliedMessage && (
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
                  p-2
                  mb-2
                  rounded-xl
                  cursor-pointer
                "
              >
                  <div className="text-[11px] text-green-400 font-semibold">
                    Reply to
                  </div>

                  <div className="text-xs opacity-80 truncate">
                    {msg.repliedMessage.message}
                  </div>
                </div>
              )}
             
            {/* MESSAGE */}
            <div className="
              break-words
              text-white
              text-sm
              px-4
              leading-relaxed
            ">

              <Linkify
                options={{
                  target: "_blank",
                  className:
                    "text-blue-400 underline",
                }}
              >

                {msg.message}

              </Linkify>

            </div>

            {/* IMAGE */}
            {msg.type === "image" &&
              msg.files?.length > 0 && (

              <img
                src={
                  msg.files[0].file_url
                }
                alt=""
                className="
                  rounded-xl
                  px-4
                  mt-2
                  max-h-[300px]
                  object-cover
                "
              />

            )}

            {/* VIDEO */}
            {msg.type === "video" &&
              msg.files?.length > 0 && (

              <video
                controls
                className="
                  rounded-xl
                  px-4
                  mt-2
                  max-h-[300px]
                "
              >

                <source
                  src={
                    msg.files[0].file_url
                  }
                />

              </video>

            )}

            {/* AUDIO */}
            {(msg.type === "audio" ||
              msg.type === "voice") &&
              msg.files?.length > 0 && (

              <audio
                controls
                className="
                  mt-2
                  px-4
                  w-full
                "
              >

                <source
                  src={
                    msg.files[0].file_url
                  }
                />

              </audio>

            )}

            {/* FOOTER Hover */}
            <div className="
              flex
              items-center
              justify-between
              px-4
              mt-3
            ">

              {/* REACTION POPUP */}
              {!isMobile && hoverMsgId === msg.id && (
                <div
                    className={`absolute -bottom-6 flex bg-[var(--bg-color)] text-[var(--text-color)] p-1 px-2 gap-2 
                        z-50 rounded-lg shadow-xl px-4 ${
                    isMine ? "right-0" : "left-0"
                    }`}
                >
                    
              {/* FORWARD */}
              <button
                onClick={() =>
                  handleForward(msg)
                }
                >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                </svg>
              </button>

              {/* Reaction */}
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
                </div>
              )}
              

              {/* TIME */}
              <div className="
                text-[10px]
                text-white
                items-center
                flex gap-1
                justify-end
      
                flex-1
              ">

     
              
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

              {/* SENDING */}
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

            {/* REACTION LIST */}
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

            {Boolean(Number(msg.response_mode))  && msg.replied_to === null && (
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
        ${isMine ? "right-0" : "left-0"}`}>
            <CommunityReactionPopup
            onReact={react}
            message={reactionMsg}
            isMine={reactionMsg.sender_id === authUser.id}
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

                console.log(
                  "Forward:",
                  forwardMsg
                );

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

      
    {isAdmin &&
 pendingMessages.length > 0 && (

  <div
    onClick={() =>
      setApprovalModal(true)
    }
    className="
      bg-[var(--bg-color)]
      text-[var(--text-color)]
      text-xs
      px-3
      py-1
      cursor-pointer
      font-semibold
      fixed
      top-16 w-full max-w-md  flex-1
      left-1/2
      -translate-x-1/2
      z-50
      shadow-md
      flex justify-between items-center
    "
  >
    <span>
    Pending Approval
    </span>

    <span>
    {pendingMessages.length}
    </span>
    
    </div>
  )}


    <ApprovalModal
      open={approvalModal}
      setOpen={setApprovalModal}
      messages={pendingMessages}
      setMessages={setPendingMessages}
      onApprove={approveMessage}
      onReject={rejectMessage}
    />

    </div>
     )
}

