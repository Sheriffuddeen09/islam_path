import React, { useEffect, useRef, useState } from "react";
import Linkify from "linkify-react";


export default function PreviewMessageText({ msg }) {
  const [expandedMessages, setExpandedMessages] = useState({});
  const [isTextScrolling, setIsTextScrolling] = useState(false);

  const textScrollTimer = useRef(null);

  const messageText = msg?.message || "";

  const visibleLength =
    expandedMessages[msg?.id] || 700;

  const hasMoreText =
    messageText.length > visibleLength;

  const displayText = hasMoreText
    ? `${messageText.slice(0, visibleLength)}...`
    : messageText;

  const handleTextScroll = () => {
    setIsTextScrolling(true);

    clearTimeout(textScrollTimer.current);

    textScrollTimer.current = setTimeout(() => {
      setIsTextScrolling(false);
    }, 700);
  };

  useEffect(() => {
    return () => {
      clearTimeout(textScrollTimer.current);
    };
  }, []);

  if (!messageText.trim()) {
    return null;
  }

  return (
    <div
      className="
        absolute
        bottom-0
        left-0
        right-0
        z-30
        px-3
        pb-3
        pt-8
        pointer-events-none
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-2xl
          rounded-xl
          bg-black/40
          backdrop-blur-md
          border
          border-white/10
          px-3
          py-2.5
          pointer-events-auto
        "
      >
        <div
          onScroll={handleTextScroll}
          className={`
            max-h-[180px]
            overflow-y-auto
            pr-2
            text-sm
            leading-6
            text-white

            scrollbar-thin
            scrollbar-track-transparent

            ${
              isTextScrolling
                ? "scrollbar-thumb-white/40"
                : "scrollbar-thumb-transparent"
            }
          `}
        >
          <Linkify
            options={{
              target: "_blank",
              rel: "noopener noreferrer",
              className:
                "text-blue-300 hover:underline break-words",
            }}
          >
            {displayText}
          </Linkify>

          {hasMoreText && (
            <button
              type="button"
              onClick={() =>
                setExpandedMessages((prev) => ({
                  ...prev,
                  [msg.id]:
                    (prev[msg.id] || 700) + 700,
                }))
              }
              className="
                ml-2
                text-green-400
                text-xs
                font-semibold
                hover:underline
                whitespace-nowrap
              "
            >
              See more
            </button>
          )}

          {!hasMoreText &&
            visibleLength > 700 &&
            messageText.length > 700 && (
              <button
                type="button"
                onClick={() =>
                  setExpandedMessages((prev) => ({
                    ...prev,
                    [msg.id]: 700,
                  }))
                }
                className="
                  ml-2
                  text-green-400
                  text-xs
                  font-semibold
                  hover:underline
                  whitespace-nowrap
                "
              >
                See less
              </button>
            )}
        </div>
      </div>
    </div>
  );
}