import { Check, CheckCheck } from "lucide-react";
import { useUserOnlineStatus } from "../online/UseUserOnlineStatus";

export default function ChatItem({
  chat,
  authUser,
  activeChat,
  openChat,
}) {
  const other = chat.other_user || {};
  const lastMessage = chat.latest_message;

  const blockedByMe = chat.block_info?.blocked_by_me;
  const blockedMe = chat.block_info?.blocked_me;
  const isMine = lastMessage?.sender_id === authUser?.id;

  const { online: isOnline } = useUserOnlineStatus(other?.id || null);
  
  const colors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500"
    ];
  
    const getColor = (name = "") => {
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };
  
    const getInitial = (name) => {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
    };
  
    // 🕒 FORMAT TIME
    const formatTime = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
  
    // 💬 MESSAGE PREVIEW
    function getMessagePreview(message) {
      if (!message) return "Start chatting";
  
      if (message.type === "link") return message.message;
      if (message.type === "text") return message.message;
      if (message.type === "voice") return "🎤 Voice Message";
      if (message.type === "audio") return "🎧 Audio";
      if (message.type === "video") return "🎥 Video";
      if (message.type === "image") return "🖼 Image";
      if (message.type === "file") return "📎 Document";
  
      return "Start chatting";
    }
  

    const isRead = chat.latest_message_status === "read";

    const membershipStatus = chat.membership_status;
    const isGroup = chat.type === "group";

      const displayName = isGroup
        ? chat.name || "Unnamed Group"
        : `${other?.first_name} ${other?.last_name}`;

      const avatarName = isGroup
        ? displayName
        : other?.first_name;

      const senderName = isGroup
        ? lastMessage?.sender?.first_name
        : null;

  return (
    <div
      onClick={() => {
        if (blockedMe) return;
        openChat(chat);
      }}
      className={`flex gap-3 p-4 border-b transition relative
        ${blockedMe ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"}
        ${activeChat?.id === chat.id ? "bg-gray-100" : ""}
      `}
    >
      {/* AVATAR */}
      <div className={`relative w-12 h-12 rounded-full overflow-hidden flex items-center 
      justify-center font-bold text-xl text-white ${getColor(
            avatarName
          )}`}>
          {isGroup && chat.image_url ? (
            <img
              src={chat.image_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitial(avatarName)
          )}


        {/* ONLINE */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}

        {/* BLOCK OVERLAY */}
        {blockedMe && (
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>

        </div>
      )}
      </div>

      {/* RIGHT */}
      <div className="flex-1">

        {/* TOP */}
        <div className="flex justify-between items-center">
          <h4 className="font-semibold text-gray-900">
            {displayName}
          </h4>

          <span className="text-xs text-gray-500">
            {formatTime(lastMessage?.created_at)}
          </span>
        </div>

        {/* MESSAGE */}
        <div className="flex items-center justify-between mt-2">

          <span className="truncate max-w-[200px] text-sm">
            {blockedMe
              ? <p className="text-red-900">You cannot reply to this conversation</p>
              : <p className="text-gray-900 flex gap-1">
                    {isGroup && senderName && (
                      <span className="text-gray-800 capitalize text-xs">
                        {senderName}:
                      </span>
                    )}
                    {getMessagePreview(lastMessage)}
                  </p>
            }
          </span>

          {/* STATUS */}
          <div className="inline-flex items-center gap-2">
         {!blockedMe && isMine && (
          isRead ? (
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${getColor(
                chat.latest_message_read_by_name || isGroup ? senderName : other?.first_name
              )}`}
            >
              {getInitial(chat.latest_message_read_by_name || isGroup ? senderName : other?.first_name)}
            </span>
          ) : isOnline ? (
            <CheckCheck size={16} className="text-gray-400" />
          ) : (
            <Check size={16} className="text-gray-400" />
          )
        )}

        {!blockedMe && chat.unread_count > 0 && activeChat?.id !== chat.id && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mt-1 inline-block">
            {chat.unread_count}
          </span>
        )}
        
        </div>
        
        </div>

        {/* UNREAD */}
        
         {isGroup && membershipStatus === "pending" && (
            <p className="text-xs text-green-800 mt-2 inline-flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                stroke-width="1.5" stroke="currentColor" class="size-5 text-green-800">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg> Waiting for admin approval
            </p>
          )}

          {isGroup && membershipStatus === "rejected" && (
            <p className="text-xs text-red-600 mt-2">
              ❌ Request rejected
            </p>
          )}

        {/* BLOCK LABELS */}
        {blockedByMe && (
          <span className="mt-2 inline-block text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded">
            You blocked this user
          </span>
        )}

        {blockedMe && (
          <span className="mt-2 inline-block text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
            {other?.first_name} blocked you
          </span>
        )}
      </div>
    </div>
  );
}