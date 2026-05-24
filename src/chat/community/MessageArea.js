import Linkify from "linkify-react";
import { useState } from "react";

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

}) {

  const [forwardMsg, setForwardMsg] =
    useState(null);

  const [showForwardModal,
    setShowForwardModal] =
    useState(false);

  const handleForward = (msg) => {

    setForwardMsg(msg);

    setShowForwardModal(true);
  };

  const addReaction = (
    messageId,
    emoji
  ) => {

    console.log(
      "React:",
      messageId,
      emoji
    );

    // API HERE
  };

  return (

    <>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg) => (

          <div
            key={msg.id}
            className={`

              max-w-[75%]
              rounded-2xl
              px-4
              py-3
              relative

              ${
                msg.sender_id === authUser.id
                  ? "ml-auto bg-[#005c4b]"
                  : "bg-[#202c33]"
              }

            `}
          >

            {/* SENDER */}
            <p className="text-sm font-semibold text-green-400 mb-1">

              {msg.sender?.first_name ||
                msg.sender?.name}

            </p>

            {/* REPLY */}
            {msg.replied_to && (

              <div className="bg-black/30 rounded-lg p-2 mb-2 border-l-4 border-blue-500">

                <p className="text-xs text-blue-400 font-semibold">

                  {msg.replied_to.sender?.first_name ||
                    "User"}

                </p>

                <p className="text-xs text-gray-300 truncate">

                  {msg.replied_to.message ||
                    msg.replied_to.type}

                </p>

              </div>
            )}

            {/* MESSAGE */}
            <div className="break-words text-sm leading-relaxed">

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
                className="rounded-xl mt-2 max-h-[300px] object-cover"
              />

            )}

            {/* VIDEO */}
            {msg.type === "video" &&
              msg.files?.length > 0 && (

              <video
                controls
                className="rounded-xl mt-2 max-h-[300px]"
              >
                <source
                  src={
                    msg.files[0]
                      .file_url
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
                className="mt-2 w-full"
              >
                <source
                  src={
                    msg.files[0]
                      .file_url
                  }
                />
              </audio>

            )}

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-3">

              {/* REACTIONS */}
              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    addReaction(
                      msg.id,
                      "❤️"
                    )
                  }
                  className="text-sm hover:scale-110 transition"
                >
                  ❤️
                </button>

                <button
                  onClick={() =>
                    addReaction(
                      msg.id,
                      "👍"
                    )
                  }
                  className="text-sm hover:scale-110 transition"
                >
                  👍
                </button>

                <button
                  onClick={() =>
                    addReaction(
                      msg.id,
                      "😂"
                    )
                  }
                  className="text-sm hover:scale-110 transition"
                >
                  😂
                </button>

              </div>

              {/* TIME */}
              <div className="text-[11px] text-gray-400">

                {formatMessageTime(
                  msg.created_at
                )}

              </div>

            </div>

            {/* REACTION LIST */}
            {msg.reactions?.length >
              0 && (

              <div className="flex flex-wrap gap-2 mt-2">

                {msg.reactions.map(
                  (
                    reaction,
                    index
                  ) => (

                    <div
                      key={index}
                      className="bg-black/40 rounded-full px-2 py-1 text-xs"
                    >

                      {
                        reaction.emoji
                      }{" "}

                      {
                        reaction.count
                      }

                    </div>
                  )
                )}

              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">

              {/* RESPOND */}
              {activeCommunity?.response_mode &&
                msg.sender_id !==
                  authUser.id && (

                <button
                  onClick={() =>
                    setReplyingTo(
                      msg
                    )
                  }
                  className="hover:text-white"
                >
                  Respond
                </button>
              )}

              {/* FORWARD */}
              <button
                onClick={() =>
                  handleForward(
                    msg
                  )
                }
                className="hover:text-white"
              >
                Forward
              </button>

              {/* RETRY */}
              {msg.status ===
                "failed" && (

                <button
                  onClick={() =>
                    retryCommunityMessage(
                      msg
                    )
                  }
                  className="text-red-500"
                >
                  Retry
                </button>
              )}

              {/* SENDING */}
              {msg.status ===
                "sending" && (

                <span className="text-gray-500">

                  Sending...

                </span>
              )}

            </div>

          </div>
        ))}

      </div>

      {/* FORWARD MODAL */}
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

    </>
  );
}