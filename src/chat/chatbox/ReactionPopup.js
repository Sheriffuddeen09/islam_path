export default function ReactionPopup({
  onReact,
  setShowReactions,
  message,
  showReactions,
  setSelectedMessages,
  setSelectedMsg, isMine
}) {
  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

  const clearSelection = () => {
    setSelectedMessages([]);
    setSelectedMsg(null);
  };

  const closeAll = () => {
    setShowReactions(null);
    clearSelection(); // ✅ single source of truth
  };

  return (
    <>
      {showReactions === message.id && (
        <div
          className={`absolute bottom-6 bg-black rounded-full flex items-center gap-2 p-2 z-50
            ${isMine ? "right-0" : "left-0"}
          `}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                onReact(message.id, emoji);
                closeAll(); // ✅ clean reset
              }}
              className="text-lg hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}

          {/* Close */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={closeAll} // ✅ unified
            className="ml-2 text-white hover:scale-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

        </div>
      )}
    </>
  );
}