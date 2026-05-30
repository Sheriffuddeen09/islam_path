import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReadMoreCaption from "./ReadMoreCaption";
import ReactionMediaPopup from "./ReactionMediaPopup";

export default function MediaPreview({
  preview,
  setPreview,
  activeChat, 
  msg,
  react, setSelectedMessages, setUiState, isMine, setSelectedMsg
}) {

  const [showMenu, setShowMenu] = useState(false)
  const [showReactionPopupId, setShowReactionPopupId] = useState(null);
  const { items, index } = preview;

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isGroup = activeChat?.type === "group";

const displayName = isGroup
  ? activeChat?.group_name || activeChat?.name || "Unnamed Group"
  : `${activeChat?.other_user?.first_name || ""} ${activeChat?.other_user?.last_name || ""}`;

const avatarName = isGroup
  ? displayName
  : activeChat?.other_user?.first_name;

  const next = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index + 1) % p.items.length,
    }));
  };

  const prev = () => {
    setPreview((p) => ({
      ...p,
      index:
        (p.index - 1 + p.items.length) %
        p.items.length,
    }));
  };

  const current = items[index];

  // ESC CLOSE
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setPreview({
          items: [],
          index: 0,
        });
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, []);

  if (!preview.items.length) return null;

  // TOUCH START
  const handleTouchStart = (e) => {
    touchStartX.current =
      e.changedTouches[0].screenX;
  };

  // TOUCH END
  const handleTouchEnd = (e) => {
    touchEndX.current =
      e.changedTouches[0].screenX;

    const diff =
      touchStartX.current -
      touchEndX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next(); // slide left → next
      } else {
        prev(); // slide right → previous
      }
    }
  };


  const handleDownload  = async (type, message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/messages/download/${type}/${message.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const extMap = {
      video: "mp4",
      image: "jpg",
      audio: "mp3",
      document: "pdf",
    };

    link.download = `${message.id}.${extMap[type]}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success(`${type} downloading...`, "success");
  } catch (err) {
    console.error(err);
    toast.error(`Failed to download ${type}`, "error");
  }
};



  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }; 

  const onBack = () => setPreview(null)

  return (
  
  <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col">

  <div
    className="
      flex
      items-center
      justify-between
      px-4
      py-3
      border-b
      border-white/10
      sticky
      top-0
      text-white
      z-50
    "
  >
    {/* LEFT */}
    <div className="flex items-center gap-3 min-w-0">

      {/* BACK BUTTON */}
      <button
        onClick={onBack}
        className="
          shrink-0
          hover:opacity-70
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
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>

      {/* AVATAR */}
      <div
        className={`
          w-10
          h-10
          rounded-full
          overflow-hidden
          flex
          items-center
          justify-center
          font-bold
          text-[18px]
          text-white
          shrink-0
          ${getColor(avatarName)}
        `}
      >
        {isGroup && activeChat.image_url ? (
          <img
            src={activeChat.image_url}
            alt=""
            className="
              w-full
              h-full
              object-cover
            "
          />
        ) : (
          getInitial(avatarName)
        )}
      </div>

      {/* USER INFO */}
      <div className="flex flex-col min-w-0">

        <h3
          className="
            font-bold
            text-sm
            truncate
            text-white
          "
        >
          {displayName}
        </h3>
        
        {isGroup && (
          <p
            className="
              text-[11px]
              opacity-70
              truncate
            "
          >
            {activeChat.members_count ||
              activeChat.members?.length ||
              0}
            {" "}
            members
          </p>
        )}
      </div>

    </div>

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3 text-white">

      {/* DOWNLOAD */}
      <button
        onClick={() =>
          handleDownload(
            msg.type,
            msg
          )
        }
        className="
          text-white
          hover:opacity-70
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
            d="M12 16.5v-9m0 9-3-3m3 3 3-3M3.75 15v3A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18v-3"
          />
        </svg>
      </button>

      {/* MENU */}
      <button
        onClick={() =>
          setShowMenu(prev => !prev)
        }
        className="
          text-white
          hover:opacity-70
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
            d="M12 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          />
        </svg>
      </button>

    </div>
  </div>

   
    {/* PREVIOUS */}
    {items.length > 1 && (
      <button
        onClick={prev}
        className="
          hidden
          md:flex
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-white
          z-50
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    )}

    {/* MEDIA */}
    <div
      className="
        flex-1
        w-full
        flex
        items-center
        justify-center
        overflow-hidden
      "
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {current.type === "image" ? (
        <img
          src={current.url}
          alt=""
          className="
            w-full
            h-full
            object-contain
          "
        />
      ) : (
        <video
          src={current.url}
          controls
          autoPlay
          className="
            w-full
            h-full
            object-contain
          "
        />
      )}
    </div>

    {/* NEXT */}
    {items.length > 1 && (
      <button
        onClick={next}
        className="
          hidden
          md:flex
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-white
          z-50
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    )}

    {/* BOTTOM PANEL */}
    <div
      className="
        bg-[#0c0c0c]
        px-4
        pt-1
        pb-3
        border-t
        border-white/10
        mt-3
      "
    >

      {/* CAPTION */}
      {msg.message && (
        <div
          className="
            px-5
            py-4
            mx-auto mt-4
            text-white
            w-full max-w-md
          "
        >
          <ReadMoreCaption
            text={msg.message}
          />
        </div>
      )}

      {/* REACTION BAR */}
      <div
        className="
          flex
          items-center
          justify-center
          gap-3
        "
      >

        {/* REACTION SUMMARY */}
        <div
          className="
            bg-[#1d1d1d]
            rounded-full
            px-2
            py-2
            flex
            items-center
            gap-2
            text-white
            text-sm
          "
        >
          {msg.reactions?.length ? (
            <>
             {msg.reactions?.length > 0 && (
              <div>
                {Object.values(
                  msg.reactions.reduce((acc, r) => {
                    if (!acc[r.emoji]) {
                      acc[r.emoji] = { emoji: r.emoji, count: 0 };
                    }
                    acc[r.emoji].count++;
                    return acc;
                  }, {})
                ).map((r, i) => (
                  <span key={i}>
                    {r.emoji} {r.count > 1 && r.count}
                  </span>
                ))}
              </div>
            )}
            </>
          ) : (
            <span>
              No reaction
            </span>
          )}
        </div>

        {/* ADD REACTION */}
       <div className="relative inline-block">
  <button
  onClick={(e) => {
    e.stopPropagation();
    const nextState =
      showReactionPopupId === msg.id
        ? null
        : msg.id;
    setShowReactionPopupId(nextState);
  }}
  className="
    w-10
    h-10
    rounded-full
    bg-[#1d1d1d]
    flex
    items-center
    justify-center
    text-white
  "
>
  😊
</button>

  {showReactionPopupId === msg.id && (
    <div
      className="
        absolute
        bottom-14
        left-1/2
        -translate-x-1/2
        z-[99999]
      "
      onClick={(e) => e.stopPropagation()}
    >
      <ReactionMediaPopup
        onReact={react}
        setShowReactions={setShowReactionPopupId}
        message={msg}
        showReactions={showReactionPopupId}
        setSelectedMessages={setSelectedMessages}
        setSelectedMsg={setSelectedMsg}
        isMine={isMine}
        setUiState={setUiState}
      />
    </div>
  )}
</div>
</div>      
{/* REACTION PICKER */}
     
      {/* COUNTER */}
      {items.length > 1 && (
        <div
          className="
            text-center
            text-white/70
            text-xs
            mt-4
          "
        >
          {index + 1} /{" "}
          {items.length}
        </div>
      )}
    </div>

     
  </div>

  );
}