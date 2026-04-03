import { useEffect, useState } from "react";

export default function MessageItem({ msg, authUser, disappearingOn, setMessages }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!disappearingOn) return;

    const timer = setTimeout(() => {
      setVisible(false); // 🔥 hide message after 1 min
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [disappearingOn]);

  useEffect(() => {
  if (!disappearingOn) return;

  const interval = setInterval(() => {
    setMessages(prev =>
      prev.filter(msg => {
        const created = new Date(msg.created_at).getTime();
        return Date.now() - created < 60000;
      })
    );
  }, 5000);

  return () => clearInterval(interval);
}, [disappearingOn]);

  if (!visible) return null;

  return (
    <div
    key={msg.id}
    className={`max-w-xs p-2 rounded-lg ${
    msg.sender_id === authUser.id
        ? "bg-blue-500 text-white ml-auto"
        : "bg-white"
    }`}
>
    {msg.message}
            

      {/* ⏳ Indicator */}
      {disappearingOn && (
        <span className="block text-[10px] opacity-70 mt-1">
          ⏳ disappears in 1 min
        </span>
      )}
    </div>
  );
}