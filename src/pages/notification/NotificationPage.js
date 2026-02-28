import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import api from "../../Api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const NotificationPage = ({handleMessageOpen}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/api/page-notifications");
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  

  const handleClick = async (notification) => {
  try {
    // ✅ Mark as read
    await api.post(`/api/notifications/read/${notification.id}`);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    // ✅ CASE 1: Block / Unblock (uses toggle)
    if (
      notification.type === "chat_blocked" ||
      notification.type === "chat_unblocked"
    ) {
      const otherUserId = notification.data?.other_user_id;

      if (otherUserId) {
        handleMessageOpen(otherUserId); // 🔥 YOUR CHAT TOGGLE
      }

      return; // stop here
    }

    // ✅ CASE 2: Other notifications using URL
    if (notification.redirect_url) {
      const cleanUrl = notification.redirect_url.replace(
        window.location.origin,
        ""
      );

      navigate(cleanUrl);
    }

  } catch (error) {
    console.error(error);
  }
};


const getMessage = (notification) => {
    let data;
    try {
      data = JSON.parse(notification.data);
    } catch {
      data = {};
    }

    switch (notification.type) {
      case "post_reaction": {
        const reactors = Array.isArray(data.reactors) ? data.reactors : [];
        if (reactors.length === 0) return "Someone reacted to your post";
        if (reactors.length === 1) return `${reactors[0]} reacted to your post`;
        if (reactors.length === 2)
          return `${reactors[0]} and ${reactors[1]} reacted to your post`;
        return `${reactors[0]} and ${reactors.length - 1} others reacted to your post`;
      }
      case "post_comment": {
        const commenters = Array.isArray(data.commenters) ? data.commenters : [];
        if (commenters.length === 0) return "Someone commented on your post";
        if (commenters.length === 1) return `${commenters[0]} commented on your post`;
        if (commenters.length === 2)
          return `${commenters[0]} and ${commenters[1]} commented on your post`;
        return `${commenters[0]} and ${commenters.length - 1} others commented on your post`;
      }

      case "chat_blocked":
        return `${data.blocked_by} blocked you`;

      case "chat_unblocked":
        return `${data.unblocked_by} unblocked you`;

      case "mention":
        return `You were mentioned by ${data.mentioned_by || ""}`;
      case "teacher_suggestion":
        return `New teacher available: ${data.teacher_name || ""}`;
      case "friend_suggestion":
        return `New friend suggestion: ${data.name || ""}`;
      default:
        return "New notification";
    }
  };

  // Get the avatar or first letter fallback
  const getAvatarOrInitial = (notification) => {
    try {
      const data = JSON.parse(notification.data);
      let name = "";

      if (notification.type === "post_reaction" || notification.type === "post_comment") {
        const firstUser = Array.isArray(data.reactors || data.commenters)
          ? (data.reactors || data.commenters)[0]
          : null;
        if (firstUser?.avatar) return firstUser.avatar; // use avatar if exists
        name = firstUser || "";
      } else if (notification.type === "mention" || notification.type === "teacher_suggestion") {
        if (data?.avatar) return data.avatar;
        name = data?.mentioned_by || data?.teacher_name || "";
      } else if (notification.type === "friend_suggestion") {
        name = data?.name || "";
      }

      // fallback to first letter
      return name.charAt(0).toUpperCase() || "U";
    } catch {
      return "U";
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-700">Loading notifications...</div>;

  if (!notifications.length)
    return (
      <div className="p-6 text-center text-gray-400 text-xl">No Notifications</div>
    );

  return (
    <div className="container mx-auto lg:max-w-xl w-full flex-1 mt-6 px-4">
  <h2 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h2>
  <ul className="space-y-3">
    {notifications.map((n) => {
      const avatar = getAvatarOrInitial(n);
      const isImage = avatar && avatar.includes("http");
      
      // Fix redirect URL
      let redirectUrl = "";
      try {
        const data = JSON.parse(n.data);
        redirectUrl = n.redirect_url
          ? n.redirect_url.replace(/^\\/, "") // remove escaped backslash
          : "/";
      } catch {
        redirectUrl = "/";
      }

      return (
        <li
          key={n.id}
          onClick={() => handleClick({ ...n, redirect_url: redirectUrl })}
          className={`flex items-start p-4 rounded-lg shadow-sm cursor-pointer border transition-all duration-200 ${
            n.read
              ? "bg-white border-gray-200 hover:shadow-md"
              : "bg-blue-50 border-blue-200 hover:shadow-md"
          }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0 mr-3">
            {isImage ? (
              <img
                src={avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-lg">
                {avatar}
              </div>
            )}

            {/* Notification icon overlay */}
            {(n.type === "post_reaction" || n.type === "post_comment") && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-blue-500 border border-gray-200">
                {n.type === "post_reaction" ? (
                  <FaThumbsUp className="w-3 h-3" />
                ) : (
                  <FaComment className="w-3 h-3" />
                )}
              </div>
            )}
          </div>

          {/* Notification content */}
          <div className="flex-1">
            <p className="text-gray-800 font-medium">{getMessage(n)}</p>
            <span className="text-xs text-gray-500 mt-1 block">
              {dayjs.utc(n.created_at).local().fromNow()}
            </span>
          </div>

          {/* Unread badge */}
          {!n.read && (
            <span className="ml-3 w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
          )}
        </li>
      );
    })}
  </ul>
</div>
  );
};

export default NotificationPage;