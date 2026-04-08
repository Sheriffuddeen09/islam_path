export default function ReactionPopup({ onReact, onClose }) {
  const emojis = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

  return (
    <div className="flex gap-2 bg-white shadow-lg px-3 py-1 rounded-full">
      {emojis.map(e => (
        <span
          key={e}
          className="cursor-pointer text-lg"
          onClick={() => {onReact(e); onClose()}}
        >
          {e}
        </span>
      ))}
    </div>
  );
}