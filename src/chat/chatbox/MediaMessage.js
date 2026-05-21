import Linkify from "linkify-react";
import MediaGrid from "./MediaGrid";

export default function MediaMessage({
  msg,
  setPreview,
}) {

  if (
    !["image", "video"].includes(
      msg.type
    )
  )
    return null;

  const hasLink =
    /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi.test(
      msg.message || ""
    );

    const cleanMessage =
  typeof msg.message === "string"
    ? msg.message.trim()
    : "";

  return (
    <div className="max-w-xs">

      <MediaGrid
        msg={msg}
        setPreview={setPreview}
      />

      {/* caption */}
       {cleanMessage !== "" && (
        <div
          className={`mt-1 ${
            hasLink ? "w-56" : "w-auto"
          }`}
        >
          <Linkify
            options={{
              target: "_blank",
              className:
                "text-blue-400 underline break-all pointer-events-auto",
            }}
          >
            <p className="text-sm break-words whitespace-pre-wrap">
              {msg.message}
            </p>
          </Linkify>
        </div>
      )}
    </div>
  );
}