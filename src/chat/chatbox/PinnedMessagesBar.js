import { useState } from "react";
import api from "../../Api/axios";

export function PinnedMessagesBar({
  messages,
  onSelect,
  setMessages,
  authUser,
}) {
  const pinned = messages.filter((m) => m.is_pinned);

  c         onst lastPinned = pinned[pinned.length - 1];

  const [showModal, setShowModal] = useState(false);
  const [showPinDuration, setShowPinDuration] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loadingPin, setLoadingPin] = useState(false);

  const canUnpinLastPinned =
    Number(lastPinned?.sender_id) === Number(authUser?.id);

  // --------------------------------------------------
  // TRUNCATE TEXT
  // --------------------------------------------------

  const truncateText = (text, max = 20) => {
    if (!text) return "";

    return text.length > max
      ? text.slice(0, max) + "..."
      : text;
  };

  // --------------------------------------------------
  // FORMAT DURATION
  // --------------------------------------------------

  const formatDuration = (seconds) => {
    if (
      seconds === null ||
      seconds === undefined ||
      seconds === ""
    ) {
      return "";
    }

    const totalSeconds = Math.floor(Number(seconds));

    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return "";
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // --------------------------------------------------
  // GET MESSAGE MEDIA
  // --------------------------------------------------

  const getMedia = (msg) => {
    if (!msg) return [];

    if (Array.isArray(msg.files)) {
      return msg.files;
    }

    if (Array.isArray(msg.media)) {
      return msg.media;
    }

    if (Array.isArray(msg.attachments)) {
      return msg.attachments;
    }

    return [];
  };

  // --------------------------------------------------
  // GET MEDIA TYPE
  // --------------------------------------------------

  const getMediaType = (media) => {
    if (!media) return "";

    const type =
      media.type ||
      media.mime_type ||
      media.file_type ||
      "";

    if (type.includes("image")) {
      return "image";
    }

    if (type.includes("video")) {
      return "video";
    }

    if (type.includes("audio")) {
      return "audio";
    }

    return type.toLowerCase();
  };

  // --------------------------------------------------
  // GET DURATION FROM MEDIA
  // --------------------------------------------------

  const getDuration = (media) => {
    if (!media) return "";

    return (
      media.duration ??
      media.duration_seconds ??
      media.length ??
      media.media_duration ??
      ""
    );
  };

  // --------------------------------------------------
  // PINNED MESSAGE DISPLAY
  // --------------------------------------------------

  const getPinnedPreview = (msg) => {
    if (!msg) return "";

    const media = getMedia(msg);

    // ----------------------------------------------
    // GROUPED MEDIA
    // ----------------------------------------------

    if (media.length > 0) {
      const imageCount = media.filter(
        (item) => getMediaType(item) === "image"
      ).length;

      const videoCount = media.filter(
        (item) => getMediaType(item) === "video"
      ).length;

      const audioCount = media.filter(
        (item) => getMediaType(item) === "audio"
      ).length;

      const parts = [];

      if (imageCount > 0) {
        parts.push(
          `📷 ${imageCount} ${
            imageCount === 1 ? "image" : "images"
          }`
        );
      }

      if (videoCount > 0) {
        parts.push(
          `🎥 ${videoCount} ${
            videoCount === 1 ? "video" : "videos"
          }`
        );
      }

      if (audioCount > 0) {
        parts.push(
          `🎵 ${audioCount} ${
            audioCount === 1 ? "audio" : "audio files"
          }`
        );
      }

      return parts.join(" • ");
    }

    // ----------------------------------------------
    // SINGLE VIDEO
    // ----------------------------------------------

    if (msg.type === "video") {
      const duration = formatDuration(
        msg.duration ??
          msg.duration_seconds ??
          msg.media_duration
      );

      return duration
        ? `🎥 Video • ${duration}`
        : "🎥 Video";
    }

    // ----------------------------------------------
    // AUDIO
    // ----------------------------------------------

    if (
      msg.type === "audio" ||
      msg.type === "voice" ||
      msg.type === "voice_note"
    ) {
      const duration = formatDuration(
        msg.duration ??
          msg.duration_seconds ??
          msg.media_duration
      );

      const label =
        msg.type === "voice" ||
        msg.type === "voice_note"
          ? "🎙 Voice note"
          : "🎵 Audio";

      return duration
        ? `${label} • ${duration}`
        : label;
    }

    // ----------------------------------------------
    // SINGLE IMAGE
    // ----------------------------------------------

    if (msg.type === "image") {
      return "📷 Image";
    }

    // ----------------------------------------------
    // FILE
    // ----------------------------------------------

    if (msg.type === "file") {
      return `📎 ${truncateText(
        msg.file_name || "File"
      )}`;
    }

    // ----------------------------------------------
    // TEXT
    // ----------------------------------------------

    if (msg.type === "text") {
      return truncateText(msg.message);
    }

    // ----------------------------------------------
    // FALLBACK
    // ----------------------------------------------

    return truncateText(
      msg.file_name || `${msg.type || "Message"} message`
    );
  };

  // --------------------------------------------------
  // PIN REQUEST
  // --------------------------------------------------

  const requestPin = (msg) => {
    setSelectedMessage(msg);
    setShowPinDuration(true);
  };

  // --------------------------------------------------
  // PIN / UNPIN
  // --------------------------------------------------

  const handlePin = async (msg, days = 7) => {
    if (!msg) return;

    setLoadingPin(true);

    try {
      if (msg.is_pinned) {
        await api.delete("/api/messages/pin", {
          data: {
            message_id: msg.id,
          },
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? {
                  ...m,
                  is_pinned: false,
                  pin_expires_at: null,
                }
              : m
          )
        );
      } else {
        const res = await api.put("/api/messages/pin", {
          message_id: msg.id,
          days,
        });

        const updatedMessage = res.data.data;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id
              ? {
                  ...m,
                  ...updatedMessage,
                  is_pinned: true,
                  pin_expires_at:
                    updatedMessage.pin_expires_at,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Pin error:", err);
    } finally {
      setLoadingPin(false);
    }
  };

  // --------------------------------------------------
  // PIN EXPIRY
  // --------------------------------------------------

  const getPinExpiryText = (expiresAt) => {
    if (!expiresAt) return "";

    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - Date.now();

    if (diff <= 0) return "Expired";

    const hours = Math.ceil(
      diff / (1000 * 60 * 60)
    );

    if (hours < 24) {
      return `${hours}h left`;
    }

    const days = Math.ceil(hours / 24);

    return `${days}d left`;
  };

  // --------------------------------------------------
  // CONFIRM PIN
  // --------------------------------------------------

  const confirmPin = async (days) => {
    if (!selectedMessage) return;

    await handlePin(selectedMessage, days);

    setShowPinDuration(false);
    setSelectedMessage(null);
  };

  if (!pinned.length) return null;

  return (
    <>
      {/* ============================================
          LAST PINNED MESSAGE
      ============================================ */}

      <div
        onClick={() => setShowModal(true)}
        className="
          sticky
          top-0
          z-20
          bg-yellow-50
          border-b-2
          border-blue-800
          px-3
          py-2
          cursor-pointer
        "
      >
        <div className="flex justify-between items-center text-black text-xs font-semibold">
          <div className="truncate flex gap-2 items-center min-w-0">
            <span className="shrink-0">📌</span>

            <div className="text-[12px] text-black shrink-0">
              {getPinExpiryText(
                lastPinned.pin_expires_at
              )}
            </div>

            <div className="text-[12px] text-black truncate">
              {getPinnedPreview(lastPinned)}
            </div>

            {pinned.length > 1 && (
              <span className="text-blue-600 shrink-0">
                +{pinned.length - 1}
              </span>
            )}
          </div>

          {canUnpinLastPinned && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePin(lastPinned);
              }}
              className="
                text-white
                text-xs
                bg-gray-900
                px-2
                py-1
                rounded
                hover:bg-gray-800
                shrink-0
              "
            >
              {loadingPin ? (
                <span
                  className="
                    animate-spin
                    h-4
                    w-4
                    border-2
                    border-white
                    border-t-transparent
                    rounded-full
                    inline-flex
                  "
                />
              ) : (
                "Unpin"
              )}
            </button>
          )}
        </div>
      </div>

      {/* ============================================
          ALL PINNED MESSAGES MODAL
      ============================================ */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div
            className="
              bg-white
              w-[90%]
              max-w-lg
              max-h-[70vh]
              overflow-y-auto
              rounded-lg
              p-4
            "
          >
            <div className="flex justify-between mb-3">
              <h2 className="font-bold">
                Pinned Messages
              </h2>

              <button
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>
            </div>

            {pinned.map((msg) => (
              <div
                key={msg.id}
                className="
                  flex
                  justify-between
                  items-center
                  bg-gray-100
                  p-2
                  mb-2
                  rounded
                  cursor-pointer
                  gap-3
                "
                onClick={() => {
                  onSelect?.(msg);
                  setShowModal(false);
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">
                    {getPinnedPreview(msg)}
                  </div>

                  {msg.pin_expires_at && (
                    <div className="text-[10px] text-gray-500 mt-1">
                      {getPinExpiryText(
                        msg.pin_expires_at
                      )}
                    </div>
                  )}
                </div>

                {Number(msg.sender_id) ===
                  Number(authUser?.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin(msg);
                    }}
                    className="
                      text-red-500
                      text-xs
                      shrink-0
                    "
                  >
                    {loadingPin ? (
                      <span
                        className="
                          animate-spin
                          h-4
                          w-4
                          border-2
                          border-gray-500
                          border-t-transparent
                          rounded-full
                          inline-flex
                        "
                      />
                    ) : (
                      "Unpin"
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          PIN DURATION MODAL
      ============================================ */}

      {showPinDuration && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-xl p-5"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            <h3 className="font-bold text-lg mb-4">
              Pin message for
            </h3>

            <div className="space-y-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => confirmPin(days)}
                  disabled={loadingPin}
                  className="
                    w-full
                    p-3
                    rounded-lg
                    border
                    text-left
                    hover:bg-black/5
                    dark:hover:bg-white/5
                    disabled:opacity-50
                  "
                >
                  {days} days
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPinDuration(false);
                setSelectedMessage(null);
              }}
              className="w-full mt-3 py-2 text-sm opacity-70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}