import MediaItem from "./MediaItem";
import { useRef } from "react";
import Linkify from "linkify-react";

export default function MediaGrid({
  msg,
  setPreview,
  uiMode,
  toggleSelect,
  onLongPress,
}) {
  const files = Array.isArray(msg?.files)
    ? msg.files
    : [msg];

  const total = files.length;

  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const remaining = total - 3;

  /*
  |--------------------------------------------------------------------------
  | GET MEDIA URL
  |--------------------------------------------------------------------------
  */

  const getUrl = (f) => {
    if (!f) return null;

    // Blob URL
    if (
      typeof f.file_url === "string" &&
      f.file_url.startsWith("blob:")
    ) {
      return f.file_url;
    }

    if (
      typeof f.file === "string" &&
      f.file.startsWith("blob:")
    ) {
      return f.file;
    }

    // Full HTTP URL
    if (
      typeof f.file_url === "string" &&
      f.file_url.startsWith("http")
    ) {
      return f.file_url;
    }

    if (
      typeof f.file === "string" &&
      f.file.startsWith("http")
    ) {
      return f.file;
    }

    // Storage path
    if (f.file_url) {
      return `http://localhost:8000/storage/${f.file_url}`;
    }

    if (f.file) {
      return `http://localhost:8000/storage/${f.file}`;
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN PREVIEW
  |--------------------------------------------------------------------------
  */

  const openPreview = (index) => {
    // Prevent click after long press
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    const items = files
      .map((f) => {
        const url = getUrl(f);

        if (!url) return null;

        return {
          id: f.id,
          type: f.type || msg.type,
          url,
          file_name: f.file_name || "",
          description:
            typeof f.description === "string"
              ? f.description
              : "",
        };
      })
      .filter(Boolean);

    if (!items.length) return;

    setPreview({
      items,
      index,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | LONG PRESS
  |--------------------------------------------------------------------------
  */

  const handleTouchStart = (e) => {
    e.stopPropagation();

    longPressTriggered.current = false;

    clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      if (onLongPress) {
        onLongPress(msg);
      } else if (toggleSelect) {
        toggleSelect(msg);
      }
    }, 500);
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
  };

  /*
  |--------------------------------------------------------------------------
  | MEDIA PROPS
  |--------------------------------------------------------------------------
  */

  const mediaProps = {
    msg,
    openPreview,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };

  /*
  |--------------------------------------------------------------------------
  | SINGLE MESSAGE / SINGLE MEDIA
  |--------------------------------------------------------------------------
  |
  | This is now also where a media description is displayed.
  |
  | Because the backend separates described media into individual
  | messages, there should normally only be one file here.
  |
  */

  if (total === 1) {
    const file = files[0];

    const description =
      typeof file?.description === "string"
        ? file.description.trim()
        : "";

    return (
      <div className="flex flex-col gap-1 my-2 w-fit max-w-full">
        {/* MEDIA */}
        <div
          className={`
            rounded-xl
            overflow-hidden
            ${
              uiMode === "full"
                ? "w-64 h-44"
                : "w-56 h-44 lg:h-44 lg:w-56 md:w-96 md:h-64"
            }
          `}
        >
          <MediaItem
            onLongPress={onLongPress}
            msg={msg}
            toggleSelect={toggleSelect}
            file={file}
            index={0}
            {...mediaProps}
          />
        </div>

        {/* MEDIA DESCRIPTION */}
        {description !== "" && (
          <div
            className={`
              text-[13px]
              lg:text-[13px]
              md:text-[16px]
              text-[var(--text-color)]
              break-words
              whitespace-pre-wrap
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
                  "text-blue-400 pointer-events-auto hover:underline",
              }}
            >
              {description}
            </Linkify>
          </div>
        )}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TWO FILES - GROUPED MESSAGE
  |--------------------------------------------------------------------------
  */

  if (total === 2) {
    return (
      <div
        className={`
          grid
          grid-cols-2
          gap-1
          rounded-xl
          overflow-hidden
          ${
            uiMode === "full"
              ? "w-64 h-44"
              : "w-56 h-44 lg:h-44 lg:w-56 md:w-96 md:h-64"
          }
        `}
      >
        {files.map((file, i) => (
          <MediaItem
            onLongPress={onLongPress}
            msg={msg}
            toggleSelect={toggleSelect}
            key={file?.id ?? i}
            file={file}
            index={i}
            {...mediaProps}
          />
        ))}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | THREE OR MORE FILES - GROUPED MESSAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="rounded-xl overflow-hidden flex flex-col gap-1">
      {/* FIRST MEDIA */}
      <div
        className={`
          ${
            uiMode === "full"
              ? "w-64 h-32"
              : "w-56 h-44 lg:h-24 lg:w-56 md:w-96 md:h-32"
          }
        `}
      >
        <MediaItem
          onLongPress={onLongPress}
          msg={msg}
          toggleSelect={toggleSelect}
          file={files[0]}
          index={0}
          {...mediaProps}
          big
        />
      </div>

      {/* SECOND + THIRD */}
      <div
        className={`
          grid
          grid-cols-2
          gap-2
          ${
            uiMode === "full"
              ? "w-64 h-24"
              : "w-56 h-24 lg:h-24 lg:w-56 md:w-96 md:h-36"
          }
        `}
      >
        {files.slice(1, 3).map((file, i) => {
          const realIndex = i + 1;

          const isLast =
            realIndex === 2 &&
            total > 3;

          return (
            <div
              key={file?.id ?? realIndex}
              className="relative"
            >
              <MediaItem
                onLongPress={onLongPress}
                msg={msg}
                toggleSelect={toggleSelect}
                file={file}
                index={realIndex}
                {...mediaProps}
              />

              {isLast && (
                <div
                  className="
                    absolute
                    inset-0
                    pointer-events-none
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    text-white
                    font-bold
                    text-lg
                  "
                >
                  +{remaining}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}