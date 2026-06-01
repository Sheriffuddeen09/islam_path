import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function ApprovalModal({
  open,
  setOpen,
  messages = [],
  setMessages,
  onApprove,
  onReject,
  message
}) {

  // loading per messages/send
  const [
    loadingAction,
    setLoadingAction
  ] = useState(null);

  // text per message
  const [
    approveTexts,
    setApproveTexts
  ] = useState({});


   useEffect(() => {
    if (messages.length === 0) {
      setOpen(false);
    }
  }, [messages]);



  // UPDATE TEXT
  const handleTextChange = (
    id,
    value
  ) => {

    setApproveTexts(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  // APPROVE
  const handleApprove = async (msg) => {

  const text = approveTexts[msg.id] || "";
  if (!text.trim()) return;

  try {
    setLoadingAction(`approve-${msg.id}`);

    const { data } = await onApprove({
      messageId: msg.id,
      text,
    });

    const newMessages = [];

    if (data?.message) {
      newMessages.push(data.message);
    }

    if (data?.admin_message) {
      newMessages.push(data.admin_message);
    }

    setMessages(prev => [
      ...prev.filter(m => m.id !== msg.id),
      ...newMessages
    ]);

    setApproveTexts(prev => {
      const copy = { ...prev };
      delete copy[msg.id];
      return copy;
    });

  } catch (err) {
    console.log(err);
  } finally {
    setLoadingAction(null);
  }
};



  // REJECT
  const handleReject = async (msg) => {

  const text = approveTexts[msg.id] || "";

  try {
    setLoadingAction(`reject-${msg.id}`);

    await onReject({
      messageId: msg.id,
      text,
    });

    // ✅ REMOVE IMMEDIATELY FROM UI
    setMessages(prev =>
      prev.filter(
        m => m.id !== msg.id
      )
    );

    setApproveTexts(prev => {
      const copy = { ...prev };
      delete copy[msg.id];
      return copy;
    });

  } catch (err) {
    console.log(err);
  } finally {
    setLoadingAction(null);
  }
};

const truncateWords = (text, limit = 20) => {
  if (!text) return "";

  const words = text.split(" ");

  return words.length > limit
    ? words.slice(0, limit).join(" ") + "..."
    : text;
};

  if (!open) return null;


  return (

    <div className="
      fixed
      inset-0
      bg-black/60
      backdrop-blur-md
      z-[99999]
      flex
      items-center
      justify-center
      p-4
    ">

      <div className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        w-full
        max-w-xl
        rounded-3xl
        p-5
        relative
        max-h-[90vh]
        overflow-y-auto
        scrollbar-thumb-gray-500 scrollbar-track-transparent scrollbar-thin
      ">

        {/* CLOSE */}
        <button
          onClick={() => {
            setOpen(false);
          }}
          className="
            absolute
            right-4
            top-4
          "
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>

        </button>

        {/* TITLE */}
        <h2 className="
          text-xl
          font-semibold
          mb-5
        ">
          Pending Messages
        </h2>

        {/* EMPTY */}
        {!messages.length && (

          <div className="
            text-center
            text-sm
            py-10
          ">
            No pending messages
          </div>
        )}

        {/* LIST */}
        {messages.map((msg) => {

          const approveLoading =
            loadingAction ===
            `approve-${msg.id}`;

          const rejectLoading =
            loadingAction ===
            `reject-${msg.id}`;

          const text =
            approveTexts[msg.id] || "";

        const originalFiles =
        msg?.original_message?.files || [];

      const originalMedia =
        originalFiles[0];

      const originalMediaUrl =
        originalMedia?.file_url ||
        originalMedia?.file;

      const isOriginalImage =
        msg?.original_message?.type === "image";

      const isOriginalVideo =
        msg?.original_message?.type === "video";

          return (

            <div
              key={msg.id}
              className="
                bg-[#111b21]
                rounded-3xl
                p-4
                mb-5
                border
                border-white/5
              "
            >
              <div className="
                text-xs
                text-white
                mb-2
              ">
                Pending User Message
              </div>

               <div className="overflow-y-auto scrollbar-thin">

               {msg?.original_message && (
                <div className="
                  bg-[#1a2a33]
                  border-l-4
                  border-blue-500
                  rounded-xl
                  px-3
                  py-2
                  text-white
                  text-sm
                  mb-3
                ">

                  <div className="text-blue-400 text-xs mb-2">
                    Original Message
                  </div>

                  {msg.original_message.message && (
                    <div className="mb-2 break-words">
                      {truncateWords(msg.original_message.message, 20)}
                    </div>
                  )}

                  {originalMediaUrl && isOriginalImage && (
                    <img
                      src={originalMediaUrl}
                      alt=""
                      className="
                        w-[150px]
                        mt-2
                        max-h-[150px]
                        object-cover
                        rounded-xl
                        cursor-pointer
                      "
                    />
                  )}

                  {originalMediaUrl && isOriginalVideo && (
                    <video
                      controls
                      className="
                        w-[150px]
                        mt-2
                        max-h-[150px]
                        object-cover
                        rounded-xl
                        cursor-pointer
                      "
                    >
                      <source src={originalMediaUrl} />
                    </video>
                  )}

                </div>
              )}
            </div>

              <div className="
                bg-[#202c33]
                rounded-2xl
                p-4
                text-white
                text-sm
                break-words
                mb-4
              ">
                {msg?.message}
              </div>

              {/* ADMIN INPUT */}
              <div className="
                bg-[#202c33]
                rounded-2xl
                p-3
                mb-4
              ">

                <textarea
                  rows={3}
                  value={text}
                  maxLength={200}
                  onChange={(e) =>
                    handleTextChange(
                      msg.id,
                      e.target.value
                    )
                  }
                  placeholder="
                    Type approval/rejection message...
                  "
                  className="
                    w-full
                    bg-transparent
                    text-white
                    outline-none
                    resize-none
                    placeholder-gray-400
                    text-xs
                  "
                />
              </div>

              {/* BUTTONS */}
              <div className="
                flex
                gap-3
              ">

                {/* APPROVE */}
                <button
                  disabled={
                    loadingAction !== null ||
                    !text.trim()
                  }
                  onClick={() =>
                    handleApprove(msg)
                  }
                  className="
                    flex-1
                    py-3
                    rounded-2xl
                    bg-green-500
                    text-white
                    font-medium
                    disabled:opacity-50
                    flex
                    items-center
                    justify-center
                  "
                >

                  {approveLoading ? (

                    <Loader2
                      className="
                        animate-spin
                      "
                    />

                  ) : (

                    "Approve"

                  )}

                </button>

                {/* REJECT */}
                <button
                  disabled={
                    loadingAction !== null
                  }
                  onClick={() =>
                    handleReject(msg)
                  }
                  className="
                    flex-1
                    py-3
                    rounded-2xl
                    bg-red-500
                    text-white
                    font-medium
                    disabled:opacity-50
                    flex
                    items-center
                    justify-center
                  "
                >

                  {rejectLoading ? (

                    <Loader2
                      className="
                        animate-spin
                      "
                    />

                  ) : (

                    "Reject"

                  )}

                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}