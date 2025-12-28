import { useUserOnlineStatus } from "./UseUserOnlineStatus";

export default function UserStatus({user}) {
  const { online, lastSeen } = useUserOnlineStatus(user.id);


  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          online ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>

      <p className="text-xs text-gray-500">
        {online ? "" : lastSeen ? `Last seen ${lastSeen}` : ""}
      </p>

    </div>
  );
}
