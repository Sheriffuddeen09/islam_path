import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const NotificationPage = ({ handleMessageOpen }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const navigate = useNavigate();

     
    const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-indigo-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-emerald-400",
        "bg-lime-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-fuchsia-400",
        "bg-violet-400",
        "bg-sky-400",
        "bg-slate-400",
        "bg-gray-400",
        "bg-zinc-400",
        "bg-stone-400",
        "bg-neutral-400",
        "bg-red-500",
        "bg-blue-500",
    ];

  const getColor = (value) => {
    if (!value) return "bg-gray-400";

    const str = String(value);

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const getInitial = (name) => {
    if (!name) return "?";

    return String(name)
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // ---------------------------------------
  // Fetch notifications
  // ---------------------------------------
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/api/page-notifications");

        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ---------------------------------------
  // Parse notification data
  // ---------------------------------------
  const parseData = (notification) => {
    if (!notification?.data) {
      return {};
    }

    // Laravel now returns decoded data as an object
    if (typeof notification.data === "object") {
      return notification.data;
    }

    // Fallback if data is still returned as JSON string
    try {
      return JSON.parse(notification.data || "{}");
    } catch {
      return {};
    }
  };

  // ---------------------------------------
  // Get a useful name for the avatar
  // ---------------------------------------
  const getNotificationName = (notification) => {
    const data = parseData(notification);

    // Post reaction / comment
    if (
      notification.type === "post_reaction" ||
      notification.type === "post_comment"
    ) {
      const users = data.reactors || data.commenters || [];
      const firstUser = users?.[0];

      if (!firstUser) {
        return notification.names?.[0] || "User";
      }

      if (typeof firstUser === "object") {
        return (
          firstUser.name ||
          firstUser.full_name ||
          `${firstUser.first_name || ""} ${firstUser.last_name || ""}`.trim() ||
          "User"
        );
      }

      return firstUser;
    }

    // Mention / teacher suggestion
    if (
      notification.type === "mention" ||
      notification.type === "teacher_suggestion"
    ) {
      return (
        data.mentioned_by ||
        data.teacher_name ||
        notification.names?.[0] ||
        "User"
      );
    }

    // Friend suggestion
    if (notification.type === "friend_suggestion") {
      return data.name || notification.names?.[0] || "User";
    }

    // New job
    if (notification.type === "new_job") {
      return data.title || notification.names?.[0] || "Job";
    }

    // Advertisement expiration
    if (notification.type === "advertisement_visibility_expired") {
      return data.title || notification.names?.[0] || "Advertisement";
    }

    // Product expiration
    if (notification.type === "product_visibility_expired") {
      return data.name || notification.names?.[0] || "Product";
    }

    // Reports
    if (
      notification.type === "chat_reported" ||
      notification.type === "post_reported" ||
      notification.type === "comment_reported"
    ) {
      return (
        data.name ||
        data.reporter_name ||
        notification.names?.[0] ||
        "User"
      );
    }

    // Block / unblock
    if (
      notification.type === "chat_blocked" ||
      notification.type === "chat_unblocked"
    ) {
      return (
        data.full_name ||
        `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
        notification.names?.[0] ||
        "User"
      );
    }

    return notification.names?.[0] || "User";
  };

  // ---------------------------------------
  // Get avatar image or initial
  // ---------------------------------------
  const getAvatar = (notification) => {
    const data = parseData(notification);

    // Possible avatar locations
    if (data.avatar) {
      return data.avatar;
    }

    if (data.image) {
      return data.image;
    }

    if (data.profile_image) {
      return data.profile_image;
    }

    // Reaction/comment users
    if (
      notification.type === "post_reaction" ||
      notification.type === "post_comment"
    ) {
      const users = data.reactors || data.commenters || [];
      const firstUser = users?.[0];

      if (typeof firstUser === "object") {
        return (
          firstUser.avatar ||
          firstUser.image ||
          firstUser.profile_image ||
          null
        );
      }
    }

    return null;
  };

  // ---------------------------------------
  // Render notification message
  // ---------------------------------------
  const renderMessage = (n) => {
    const names = Array.isArray(n.names)
      ? n.names.filter(Boolean)
      : n.names
      ? [n.names]
      : [];

    const action = n.action || "";

    // New job
    if (n.type === "new_job") {
      const title =
        n.data?.title ||
        names[0] ||
        "A new job";

      return (
        <>
          <span className="font-semibold text-blue-600">
            {title}
          </span>{" "}
          is now available
        </>
      );
    }

    // Advertisement expired
    if (n.type === "advertisement_visibility_expired") {
      const title =
        n.data?.title ||
        names[0] ||
        "Your advertisement";

      return (
        <>
          <span className="font-semibold text-blue-600">
            {title}
          </span>{" "}
          advertisement visibility has expired
        </>
      );
    }

    // Product expired
    if (n.type === "product_visibility_expired") {
      const name =
        n.data?.name ||
        names[0] ||
        "Your product";

      return (
        <>
          <span className="font-semibold text-blue-600">
            {name}
          </span>{" "}
          product visibility has expired
        </>
      );
    }

    if (names.length === 0) {
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

  // ---------------------------------------
  // Handle notification click
  // ---------------------------------------
  const handleClick = async (notification) => {
    // -----------------------------------
    // 1. Mark notification as read
    // -----------------------------------
    try {
      await api.post(`/api/notifications/read/${notification.id}`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read: true }
            : n
        )
      );
    } catch (error) {
      // Don't stop navigation if marking as read fails
      console.error(
        "Could not mark notification as read:",
        error
      );
    }

    // -----------------------------------
    // 2. Chat block / unblock
    // -----------------------------------
    if (
      notification.type === "chat_blocked" ||
      notification.type === "chat_unblocked"
    ) {
      const data = parseData(notification);

      const otherUserId = data.other_user_id;

      if (otherUserId && handleMessageOpen) {
        handleMessageOpen(otherUserId);
      }

      return;
    }

    // -----------------------------------
    // 3. Navigate
    // -----------------------------------
    if (notification.redirect_url) {
      let cleanUrl = String(notification.redirect_url).trim();

      try {
        // If Laravel returns a full URL:
        if (cleanUrl.startsWith(window.location.origin)) {
          cleanUrl = cleanUrl.replace(
            window.location.origin,
            ""
          );
        }

        // Remove accidental leading backslashes
        cleanUrl = cleanUrl.replace(/^\\+/, "");

        // Make sure React Router gets a /
        if (!cleanUrl.startsWith("/")) {
          cleanUrl = `/${cleanUrl}`;
        }

        // Remove accidental duplicate //
        cleanUrl = cleanUrl.replace(/^\/+/, "/");

        console.log(
          "Notification navigating to:",
          cleanUrl
        );

        navigate(cleanUrl);
      } catch (error) {
        console.error(
          "Notification navigation failed:",
          error
        );
      }
    }
  };

 
if (loading) {
  return (
    <div className="container mx-auto lg:max-w-xl w-full flex-1 mt-6 px-4">
      {/* Heading skeleton */}
      <div className="h-8 w-48 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-start p-4 rounded-lg border shadow-sm
            bg-[var(--bg-color)] border-gray-200
            dark:border-gray-700"
          >
            {/* Avatar skeleton */}
            <div
              className="w-12 h-12 rounded-full bg-gray-200
              dark:bg-gray-700 animate-pulse flex-shrink-0 mr-3"
            />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2 pt-1">
              {/* Notification text */}
              <div className="h-3.5 w-4/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />

              {/* Second line */}
              <div className="h-3.5 w-3/5 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />

              {/* Time */}
              <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mt-2" />
            </div>

            {/* Unread dot skeleton */}
            <div
              className="ml-3 w-3 h-3 rounded-full
              bg-gray-200 dark:bg-gray-700 animate-pulse
              mt-2 flex-shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}


  // ---------------------------------------
  // Empty
  // ---------------------------------------
  if (!notifications.length) {
    return (
      <div
        className="p-6 text-center bg-[var(--bg-color)] 
        text-[var(--text-color)] text-xl"
      >
        No Notifications
      </div>
    );
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------
  return (
    <div
      className="container mx-auto lg:max-w-xl w-full 
      flex-1 mt-6 px-4"
    >
      <h2
        className="text-2xl font-bold mb-4 
        bg-[var(--bg-color)] text-[var(--text-color)]"
      >
        Notifications
      </h2>

      <ul className="space-y-3">
        {notifications
          .slice(0, visibleCount)
          .map((n) => {
            const avatar = getAvatar(n);
            const notificationName =
              getNotificationName(n);

            const isImage =
              typeof avatar === "string" &&
              avatar.length > 0 &&
              (
                avatar.startsWith("http://") ||
                avatar.startsWith("https://") ||
                avatar.startsWith("/")
              );

            const avatarColor =
              getColor(notificationName);

            return (
              <li
                key={n.id}
                onClick={() => handleClick(n)}
                className={`flex items-start p-4 rounded-lg 
                shadow-sm cursor-pointer border 
                transition-all duration-200 ${
                  n.read
                    ? "bg-[var(--bg-color)] text-[var(--text-color)] border-green-200 hover:shadow-md"
                    : "border-blue-800 border-2 hover:shadow-md"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  {isImage ? (
                    <img
                      src={avatar}
                      alt={notificationName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full 
                      ${avatarColor} flex items-center 
                      justify-center text-white 
                      font-semibold text-xl`}
                    >
                      {getInitial(notificationName)}
                    </div>
                  )}
                </div>

                {/* Notification content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {renderMessage(n)}
                  </p>

                  <span className="text-xs mt-1 block">
                    {n.created_at}
                  </span>
                </div>

                {/* Unread indicator */}
                {!n.read && (
                  <span
                    className="ml-3 w-3 h-3 bg-blue-500 
                    rounded-full mt-2 flex-shrink-0"
                  />
                )}
              </li>
            );
          })}
      </ul>

      {/* Read more */}
      {visibleCount < notifications.length && (
        <div className="text-center mt-6">
          <button
            onClick={() =>
              setVisibleCount((prev) => prev + 10)
            }
            className="px-6 py-2 bg-blue-600 text-white 
            rounded-full hover:bg-blue-700 transition duration-200"
          >
            Read More Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;