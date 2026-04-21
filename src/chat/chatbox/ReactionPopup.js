export default function ReactionPopup({
  onReact,
  setShowReactions,
  message,
  showReactions,
  setSelectedMessages,
  setSelectedMsg, isMine, setUiState
}) {
  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍"];


  const closeAll = () => {
      setShowReactions(null);
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

        </div>
      )}
    </>
  );
}