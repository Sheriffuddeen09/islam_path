import { useUserOnlineStatus } from "./UseUserOnlineStatus";

export default function UserStatus({user}) {
   const userId = user?.id;
  
    const { online, lastSeen } = useUserOnlineStatus(userId);
  
    // ✅ THEN guard render
    if (!userId) return null;


  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          online ? "bg-green-500" : "bg-gray-400"
        }`}
      ></span>

    </div>
  );
}
