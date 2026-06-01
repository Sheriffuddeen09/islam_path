import { useEffect, useState } from "react";

export default function CommunityRespondModal({
  open,
  setOpen,
  message,
  onSend, text, setText
}) {


 const [notify, setNotify] = useState({
    show: false,
    type: "sending", // sending | success | failed
    text: "",
  });



  const files =
    message?.files || [];

  const media =
    files?.[0] || null;

  const mediaUrl =
    media?.file_url ||
    media?.file ||
    "";

  const isImage =
    message?.type === "image";

  const isVideo =
    message?.type === "video";

 

    useEffect(() => {
    if (!notify.show) return;

    if (notify.type === "sending") return;

    const timer = setTimeout(() => {
      setNotify((prev) => ({
        ...prev,
        show: false,
      }));
    }, 2500);

    return () => clearTimeout(timer);
  }, [notify]);


  
  const handleSend = async () => {
    if (!text.trim()) return;

    // close modal first
    setOpen(false);

    // show sending notification
    setNotify({
      show: true,
      type: "sending",
      text: "Sending response",
    });

    try {
      await onSend({
        message_id: message.id,
        message: text,
        response_mode: true,
      });

      setNotify({
        show: true,
        type: "success",
        text: "Response sent",
      });

      setText("");
    } catch (error) {
      // failed
      setNotify({
        show: true,
        type: "failed",
        text: "Failed to send response",
      });
    }
  };

  if (!mediaUrl) {
    return null;
  }

  const content = (

    <div
      className={`
        relative
        overflow-hidden
        px-3
        rounded-lg
        w-full
      `}
    >

      {/* TOP ACTIONS */}
      {/* IMAGE */}

      {isImage && (

        <img
          src={mediaUrl}
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

      {/* VIDEO */}

      {isVideo && (

        <div
          className="
            relative
            w-full
            rounded-xl
          "
        >

          <video
            controls
            poster={media?.thumbnail}
            className="
             w-[150px]
            mt-2
            max-h-[150px]
            object-cover
            rounded-xl
            cursor-pointer

            "
          >
            <source
              src={mediaUrl}
            />
          </video>
        </div>

      )}

      
    </div>
  );
  
  const truncateWords = (text, limit = 25) => {
  if (!text) return "";

  const words = text.split(" ");

  return words.length > limit
    ? words.slice(0, limit).join(" ") + "..."
    : text;
};

  // auto hide
  
  if (!open && !notify.show) return null;

  return (
    <>
      {/* MODAL */}
      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-md
            z-[9999]
            flex
            items-end
            justify-center
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-[#111b21]
              rounded-t-[30px]
              p-4
              animate-slideUp
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >
              <button
                onClick={() => {
                  setOpen(false);
                  setText("");
                }}
                className="
                  text-white
                  text-2xl
                "
              >
                ✕
              </button>

              <h2
                className="
                  text-white
                  text-xl
                  font-semibold
                "
              >
                Respond
              </h2>

              <div className="w-6" />
            </div>

            <div className="overflow-y-auto scrollbar-thin">

            {content}
            <div
              className="
                bg-[#202c33]
                rounded-xl
                px-4
                py-3
                text-white
                text-sm
                mb-4
                mt-1 
                break-words
              "
            >
               {truncateWords(message?.message, 25)}
            </div>

          </div>
            {/* INPUT */}
            <div
              className="
                flex
                items-end
                gap-3
              "
            >
              <div
                className="
                  flex-1
                  bg-[#202c33]
                  rounded-3xl
                  px-4
                  py-3
                "
              >
                <textarea
                  rows={2}
                  value={text}
                  maxLength={200}
                  onChange={(e) =>
                    setText(e.target.value)
                  }
                  placeholder="Type response..."
                  className="
                    w-full
                    bg-transparent
                    outline-none
                    resize-none
                    text-white
                    placeholder-gray-400
                  "
                />
               
              </div>

              {/* SEND */}
              <button
                disabled={!text.trim()}
                onClick={handleSend}
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#25D366]
                  flex
                  items-center
                  justify-center
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  shrink-0
                "
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
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NOTIFICATION */}
      {notify.show && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            -translate-x-1/2
            z-[10000]
            px-5
            py-3
            rounded-2xl
            text-sm
            text-white
            shadow-xl
            animate-fadeIn
            backdrop-blur-md
            flex
            items-center
            gap-2
            min-w-[220px]
            justify-center
            bg-[#202c33]
          "
        >
          {/* STATUS DOT */}
          <div
            className={`
              w-2.5
              h-2.5
              rounded-full
              ${
                notify.type === "sending"
                  ? "bg-yellow-400 animate-pulse"
                  : notify.type === "success"
                  ? "bg-green-400"
                  : "bg-red-400"
              }
            `}
          />

          <span>{notify.text}</span>
        </div>
      )}
    </>
  );
}