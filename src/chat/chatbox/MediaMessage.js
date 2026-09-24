import { useState } from "react"; 
import Linkify from "linkify-react"; 
import MediaGrid from "./MediaGrid";

export default function MediaMessage({
  msg,
  setPreview,
  uiMode,
  toggleSelect,
  onLongPress,
}) {
  const [expandedMessages, setExpandedMessages] =
    useState({});
 
  const messageText =
    typeof msg?.message === "string" &&
    msg.message.trim() !== ""
      ? msg.message.trim()
      : typeof msg?.description === "string" &&
          msg.description.trim() !== ""
        ? msg.description.trim()
        : typeof msg?.content === "string"
          ? msg.content.trim()
          : "";

  const visibleLength =
    expandedMessages[msg?.id] || 700;

  const hasMoreText =
    messageText.length > visibleLength;

  const displayText = hasMoreText
    ? `${messageText.slice(0, visibleLength)}...`
    : messageText;

  const toggleExpanded = () => {
    setExpandedMessages((prev) => ({
      ...prev,
      [msg.id]:
        prev[msg.id] === 700
          ? messageText.length
          : 700,
    }));
  };

  if (
    !["image", "video"].includes(msg?.type)
  ) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Media + individual file descriptions */}
      <MediaGrid
        msg={msg}
        setPreview={setPreview}
        uiMode={uiMode}
        toggleSelect={toggleSelect}
        onLongPress={onLongPress}
      />

      {/* Overall message/caption */}
      {messageText !== "" && (
        <div
          className="
            mt-2
            text-sm
            leading-relaxed
            text-[var(--text-color)]
            break-words
            whitespace-pre-wrap
          "
        >
          <Linkify
            options={{
              target: "_blank",
              className:
                "text-blue-400 hover:underline",
            }}
          >
            {displayText}
          </Linkify>

          {messageText.length > 700 && (
            <button
              type="button"
              onClick={toggleExpanded}
              className="
                ml-1
                text-blue-400
                hover:underline
                font-medium
              "
            >
              {hasMoreText
                ? "See more"
                : "See less"}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 