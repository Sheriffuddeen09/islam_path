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
  setUiState
}) {
  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

  const [openPicker, setOpenPicker] = useState(false);

  const closeAll = () => {
    setSelectedMessages([])
    setSelectedMsg(null)
    setShowReactions(null);
    setOpenPicker(false);
    setUiState(prev => ({ ...prev, openMenu: false }));
  };

  return (
    <>
      {showReactions === message.id && (
        <div
          className={`absolute bottom-6 bg-black rounded-full flex items-center gap-2 p-2 z-50
            ${isMine ? "right-0" : "left-0"}
          `}
        >
          {/* NORMAL EMOJIS */}
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                onReact(message.id, emoji);
                closeAll();
              }}
              className="text-lg hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}

          {/* ➕ ADD BUTTON */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setOpenPicker((prev) => !prev)}
            className="text-white text-lg px-2 hover:scale-125 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="size-6 text-white border-2 rounded-full border-white">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>

          </button>

          {/* EMOJI PICKER */}
          {openPicker && (
            <div
              className={`absolute bottom-12 z-50 ${
                isMine ? "right-0" : "left-0"
              }`}
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  onReact(message.id, emojiData.emoji);
                  closeAll();
                }}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}