import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaThumbsUp, FaComment } from "react-icons/fa";
import api from "../../Api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const NotificationPage = () => {
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
      await api.post(`/api/notifications/read/${notification.id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
      if (notification.redirect_url) navigate(notification.redirect_url);
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
      return "?";
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-700">Loading notifications...</div>;

  if (!notifications.length)
    return (
      <div className="p-6 text-center text-gray-400 text-xl">No Notifications</div>
    );

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Notifications
      </h2>
      <ul className="space-y-3">
        {notifications.map((n) => {
          const avatar = getAvatarOrInitial(n);
          const isImage = avatar && avatar.includes("http"); // crude check for URL
          return (
            <li
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex items-start p-4 rounded-lg shadow-sm cursor-pointer border transition-all duration-200 ${
                n.read
                  ? "bg-white border-gray-200 hover:shadow-md"
                  : "bg-blue-50 border-blue-200 hover:shadow-md"
              }`}
            >
              <div className="relative flex-shrink-0 mr-3">
                {isImage ? (
                  <img
                    src={avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-lg">
                    {avatar}
                  </div>
                )}

                {(n.type === "post_reaction" || n.type === "post_comment") && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px]">
                    {n.type === "post_reaction" ? <FaThumbsUp /> : <FaComment />}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="text-gray-800 font-medium">{getMessage(n)}</p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {dayjs(n.created_at).fromNow()}
                </span>
              </div>

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