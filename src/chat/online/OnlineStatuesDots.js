import { useUserOnlineStatus } from "./UseUserOnlineStatus";

export default function UserStatusDots({ user }) {

  const userId = user?.id;

  const { online, lastSeen } = useUserOnlineStatus(userId);

  // ✅ THEN guard render
  if (!userId) return null;

  const formatLastSeen = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay === 1) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center relative lg:left-8 left-10 lg:mt-2 gap-1 pb-2">
      <span
        className={`w-2 h-2 rounded-full ${
          online ? "bg-green-500" : "bg-gray-400"
        }`}
      />

      <span className="text-xs text-gray-500">
        {online
          ? "Online"
          : lastSeen
          ? `Last seen ${formatLastSeen(lastSeen)}`
          : "Offline"}
      </span>
    </div>
  );
}