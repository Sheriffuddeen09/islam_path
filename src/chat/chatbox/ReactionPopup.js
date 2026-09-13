import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function ReactionPopup({
  onReact,
  setShowReactions,
  message,
  showReactions,
  setSelectedMessages,
  setSelectedMsg,
  isMine,
  setUiState,
}) {
  const emojis = [
    "❤️",
    "😂",
    "😮",
    "😢",
    "🙏",
    "👍",
  ];

  const [openPicker, setOpenPicker] =
    useState(false);

  const closeAll = () => {
    setSelectedMessages([]);
    setSelectedMsg(null);
    setShowReactions(null);
    setOpenPicker(false);

    setUiState((prev) => ({
      ...prev,
      openMenu: false,
    }));
  };

  if (showReactions !== message.id) {
    return null;
  }

  return (
    <div
      className={`
        absolute
        bottom-full
        mb-2
        z-[100]
        bg-black
        rounded-full
        flex
        items-center
        gap-1
        p-2
        shadow-2xl
        whitespace-nowrap

        ${
          isMine
            ? "right-0"
            : "left-0"
        }
      `}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();

            onReact(
              message.id,
              emoji
            );

            closeAll();
          }}
          className="
            text-lg
            p-1
            hover:scale-125
            transition-transform
          "
        >
          {emoji}
        </button>
      ))}

      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();

          setOpenPicker(
            (prev) => !prev
          );
        }}
        className="
          text-white
          text-lg
          px-2
          hover:scale-125
          transition
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="
            size-6
            text-white
            border-2
            rounded-full
            border-white
          "
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      {openPicker && (
        <div
          className={`
            absolute
            bottom-12
            z-[110]
            ${
              isMine
                ? "right-0"
                : "left-0"
            }
          `}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
        >
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onReact(
                message.id,
                emojiData.emoji
              );

              closeAll();
            }}
          />
        </div>
      )}
    </div>
  );
}