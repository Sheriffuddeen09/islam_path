import { useState, useEffect } from "react";
import api from "../Api/axios";

export default function ChatBadge() {
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread messages on component mount
  useEffect(() => {
    api.get("/api/notifications/messages")
      .then(res => setUnreadMessages(res.data.unread_messages))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="relative">
      <button className="p-2 rounded-full bg-gray-100">
        💬
      </button>

      {unreadMessages > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {unreadMessages}
        </span>
      )}
    </div>
  );
}
