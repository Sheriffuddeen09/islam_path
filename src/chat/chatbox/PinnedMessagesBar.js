export function PinnedMessagesBar({ messages, onSelect }) {
  const pinned = messages.filter(m => m.is_pinned);

  if (!pinned.length) return null;

  return (
    <div className="sticky top-0 z-20 bg-yellow-50 border-b p-2 flex gap-2 overflow-x-auto">
      {pinned.map(msg => (
        <div
          key={msg.id}
          onClick={() => onSelect?.(msg)}
          className="min-w-[160px] bg-white border rounded p-2 cursor-pointer shadow-sm"
        >
          <div className="text-xs text-yellow-600 font-semibold">📌 Pinned</div>
          <div className="text-xs truncate">
            {msg.type === "text" ? msg.message : `${msg.type} message`}
          </div>
        </div>
      ))}
    </div>
  );
}