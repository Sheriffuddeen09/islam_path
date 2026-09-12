import { useRef } from "react";

export default function MediaItem({
  file,
  index,
  openPreview,
  msg,
  toggleSelect,
}) {
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const getUrl = (f) => {
    if (f.file_url?.startsWith("blob:")) return f.file_url;
    if (f.file?.startsWith("blob:")) return f.file;
    if (f.file_url?.startsWith("http")) return f.file_url;
    if (f.file_url) return `http://localhost:8000/storage/${f.file_url}`;
    if (f.file) return `http://localhost:8000/storage/${f.file}`;

    return null;
  };

  const url = getUrl(file);

  const isVideo = file.type === "video";

  const handlePointerDown = (e) => {
    e.stopPropagation();

    longPressTriggered.current = false;

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      if (toggleSelect && msg) {
        toggleSelect(msg);
      }
    }, 500);
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();

    // Moving means the user is probably scrolling/swiping,
    // so cancel the long press.
    clearTimeout(longPressTimer.current);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
  };

  const handleClick = (e) => {
    e.stopPropagation();

    // A click can be generated after a long press.
    // Don't open the preview in that case.
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    console.log("OPEN PREVIEW", index);

    openPreview(index);
  };

  return (
    <div
      className="relative cursor-pointer w-full h-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
    >
      {isVideo ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          preload="auto"
          muted
          loop
          playsInline
          onLoadedData={(e) => {
            e.currentTarget.currentTime = 0.1;
          }}
        />
      ) : (
        <img
          src={url}
          className="w-full h-full object-cover"
          alt=""
        />
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}