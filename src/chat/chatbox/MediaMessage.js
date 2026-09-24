import Linkify from "linkify-react";
import MediaGrid from "./MediaGrid";
import { useState } from "react";

export default function MediaMessage({
  msg,
  setPreview,
  uiMode,
  toggleSelect,
  onLongPress,
}) {
  const [expandedMessages, setExpandedMessages] =
    useState({});

  /*
  |--------------------------------------------------------------------------
  | OVERALL CAPTION
  |--------------------------------------------------------------------------
  */

  const messageText =
    typeof msg.message === "string"
      ? msg.message.trim()
      : "";

  const visibleLength =
    expandedMessages[msg.id] || 700;

  const hasMoreText =
    messageText.length > visibleLength;

  const displayText = hasMoreText
    ? `${messageText.slice(
        0,
        visibleLength
      )}...`
    : messageText;

  /*
  |--------------------------------------------------------------------------
  | ONLY HANDLE IMAGE / VIDEO MESSAGES
  |--------------------------------------------------------------------------
  */

  if (
    !["image", "video"].includes(
      msg.type
    )
  ) {
    return null;
  }

  return (
    <div className="w-full">
      <MediaGrid
        msg={msg}
        setPreview={setPreview}
        uiMode={uiMode}
        toggleSelect={toggleSelect}
        onLongPress={onLongPress}
      />
 

      {messageText !== "" && (
        <div
          className={`
            text-[13px]
            lg:text-[13px]
            md:text-[16px]
            mt-1
            text-white
            w-fit
            break-words
            ${
              uiMode === "full"
                ? "max-w-64"
                : "max-w-56 lg:max-w-56 md:max-w-96"
            }
          `}
        >
          <Linkify
            options={{
              target: "_blank",
              className:
                "text-blue-400 pointer-events-auto",
            }}
          >
            {displayText}
          </Linkify>

          {/* SEE MORE */}
          {hasMoreText && (
            <button
              type="button"
              onClick={() =>
                setExpandedMessages(
                  (prev) => ({
                    ...prev,
                    [msg.id]:
                      (prev[msg.id] || 700) +
                      700,
                  })
                )
              }
              className="
                ml-2
                text-green-400
                text-xs
                font-semibold
                hover:underline
              "
            >
              See more
            </button>
          )}

          {/* SEE LESS */}
          {!hasMoreText &&
            visibleLength > 700 &&
            messageText.length > 700 && (
              <button
                type="button"
                onClick={() =>
                  setExpandedMessages(
                    (prev) => ({
                      ...prev,
                      [msg.id]: 700,
                    })
                  )
                }
                className="
                  ml-2
                  text-green-400
                  text-xs
                  font-semibold
                  hover:underline
                "
              >
                See less
              </button>
            )}
        </div>
      )}
    </div>
  );
}