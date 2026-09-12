import { useRef } from "react";

export default function CommunityMediaMessage({
  msg,
  onPreview,
  setSelectedMessage,
  setReactionMsg,
}) {
  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const files = msg?.files || [];
  const media = files?.[0] || null;

  const mediaUrl =
    media?.file_url ||
    media?.file ||
    "";

  const isImage = msg?.type === "image";
  const isVideo = msg?.type === "video";

  if (!mediaUrl) {
    return null;
  }

  const handlePointerDown = (e) => {
    e.stopPropagation();

    longPressTriggered.current = false;

    pressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      // SELECT MESSAGE
      setSelectedMessage?.(msg);

      // Show reaction/action state
      setReactionMsg?.(msg);
    }, 500);
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();

    // Moving cancels long press
    clearTimeout(pressTimer.current);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();

    clearTimeout(pressTimer.current);
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // A click can fire after a long press.
    // Don't open the preview in that case.
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    // NORMAL TAP
    onPreview?.(msg);
  };

  return (
    <div
      className="
        relative
        overflow-hidden
        px-3
        rounded-lg
        w-full
      "
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >

      {/* IMAGE */}
      {isImage && (
        <img
          src={mediaUrl}
          alt=""
          onClick={handleClick}
          className="
            w-full
            mt-2
            max-h-[250px]
            object-cover
            rounded-xl
            cursor-pointer
            select-none
          "
          draggable={false}
        />
      )}

      {/* VIDEO */}
      {isVideo && (
        <div
          className="
            relative
            w-full
            rounded-xl
          "
        >
          <video
            controls
            poster={media?.thumbnail}
            className="
              w-full
              mt-2
              max-h-[250px]
              object-cover
              rounded-lg
            "
            onClick={(e) => {
              // Don't let the video controls interfere
              // with the long-press logic.
              if (longPressTriggered.current) {
                e.stopPropagation();
              }
            }}
          >
            <source src={mediaUrl} />
          </video>

          {/* PREVIEW BUTTON */}
          <button
            type="button"
            onClick={handleClick}
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-black/50
                backdrop-blur-md
                flex
                items-center
                justify-center
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="size-8 text-white ml-1"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.574 0 3.286L7.28 20.99c-1.25.687-2.779-.216-2.779-1.643V5.653Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}