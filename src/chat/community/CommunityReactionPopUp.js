// CommunityReactionPopup.jsx

import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

export default function CommunityReactionPopup({
  onReact,
  setShowReactions,
  message,
  isMine,
}) {

 

  const emojis = ["❤️","😂","😮","😢","🙏","👍"];
  const [openPicker, setOpenPicker] = useState(false);

  const closeAll = () => {
    setShowReactions(null);
    setOpenPicker(false);
  };

   if (!message) {
      return null;
    }

  return (
    <div
      className={`absolute bottom-8 z-50 ${
        isMine ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >

      <div className="
        bg-[#111b21]
        shadow-lg
        rounded-full
        px-2
        py-2
        flex
        items-center
        gap-2
      ">

        {emojis.map((emoji) => (

          <button
            key={emoji}
            onClick={() => {
              if (!message) return;
              if (!message?.id) return;
              onReact(message.id, emoji);
              onclose()
            }}
            className="
              text-lg
              hover:scale-125
              transition
            "
          >
            {emoji}
          </button>

        ))}

        {/* ADD MORE */}
        <button
          onClick={() =>
            setOpenPicker(
              (prev) => !prev
            )
          }
          className="
            text-white
            hover:scale-110
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
              border
              border-white
              rounded-full
              p-1
            "
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

        </button>

      </div>

      {/* EMOJI PICKER */}
      {openPicker && (

        <div
          className={`
            absolute
            bottom-14
            z-[999]
            ${
              isMine
                ? "right-0"
                : "left-0"
            }
          `}
        >

          <EmojiPicker
            onEmojiClick={(
              emojiData
            ) => {

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