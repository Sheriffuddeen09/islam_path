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
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      
        setLoading(true);

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


  // Parse notification data safely
  const parseData = (notification) => {
    try {
      return JSON.parse(notification.data || "{}");
    } catch {
      return {};
    }
  };

  // Get message text for notification
  const renderMessage = (n) => {
  const names = Array.isArray(n.names) ? n.names : [n.names];
  const action = n.action;

  if (!names || names.length === 0) {
    return <span>{action}</span>;
  }

  if (names.length === 1) {
    return (
      <>
        <span className="font-semibold text-blue-600">
          {names[0]}
        </span>{" "}
        {action}
      </>
    );
  }

  if (names.length === 2) {
    return (
      <>
        <span className="font-semibold text-blue-600">
          {names[0]}
        </span>{" "}
        and{" "}
        <span className="font-semibold text-blue-600">
          {names[1]}
        </span>{" "}
        {action}
      </>
    );
  }

  return (
    <>
      <span className="font-semibold text-blue-600">
        {names[0]}
      </span>{" "}
      and {names.length - 1} others {action}
    </>
  );
};
  // Get avatar or first letter fallback
  const getAvatarOrInitial = (notification) => {
    const data = parseData(notification);
    let name = "";

    if (notification.type === "post_reaction" || notification.type === "post_comment") {
      const users = data.reactors || data.commenters || [];
      const firstUser = users[0];
      if (!firstUser) return "U";
      if (typeof firstUser === "object") {
        if (firstUser.avatar) return firstUser.avatar;
        name = firstUser.name || firstUser.first_name || "";
      } else {
        name = firstUser;
      }
    } else if (["mention", "teacher_suggestion"].includes(notification.type)) {
      if (data.avatar) return data.avatar;
      name = data.mentioned_by || data.teacher_name || "";
    } else if (["friend_suggestion", "chat_reported", "post_reported", "comment_reported"].includes(notification.type)) {
      name = data.name || data.reporter_name || "";
    }

    return name.charAt(0).toUpperCase() || "U";
  };

  if (loading) return <div className="p-6 text-center text-gray-700">Loading notifications...</div>;
  if (!notifications.length) return <div className="p-6 text-center text-gray-400 text-xl">No Notifications</div>;

  return (
    <div className="container mx-auto lg:max-w-xl w-full flex-1 mt-6 px-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h2>
      <ul className="space-y-3">
  {notifications.slice(0, visibleCount).map((n) => {
    const avatar = getAvatarOrInitial(n);
    const isImage = avatar && avatar.includes("http");

    let redirectUrl = "/";
    try {
      redirectUrl = n.redirect_url ? n.redirect_url.replace(/^\\/, "") : "/";
    } catch {}

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
            <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-xl">
              {Array.isArray(n?.names)
                ? n.names[0]?.charAt(0)
                : n?.names?.charAt(0) || "U"}
            </div>
          )}
        </div>

        {/* Notification content */}
        <div className="flex-1">
          <p className="text-gray-800 text-sm">{renderMessage(n)}</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {n.created_at}
          </span>
        </div>

        {!n.read && (
          <span className="ml-3 w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
        )}
        </li>
      );
    })}
  </ul>
  {visibleCount < notifications.length && (
  <div className="text-center mt-6">
    <button
      onClick={() => setVisibleCount((prev) => prev + 10)}
      className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-200"
    >
      Read More Notifications
    </button>
  </div>
)}
    </div>
  );
};

export default NotificationPage;