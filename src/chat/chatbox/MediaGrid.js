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
  const files = msg.files || [msg];
  const total = files.length;

  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const remaining = total - 3;

  /*
  |--------------------------------------------------------------------------
  | CHECK INDIVIDUAL DESCRIPTIONS
  |--------------------------------------------------------------------------
  */

  const filesWithDescriptions = files.filter(
    (file) =>
      typeof file?.description === "string" &&
      file.description.trim() !== ""
  );

  const hasMultipleDescriptions =
    filesWithDescriptions.length > 0;

  /*
  |--------------------------------------------------------------------------
  | URL
  |--------------------------------------------------------------------------
  */

  const getUrl = (f) => {
    if (f.file_url?.startsWith("blob:")) {
      return f.file_url;
    }

    if (f.file?.startsWith("blob:")) {
      return f.file;
    }

    if (f.file_url?.startsWith("http")) {
      return f.file_url;
    }

    if (f.file_url) {
      return `http://localhost:8000/storage/${f.file_url}`;
    }

    if (f.file) {
      return `http://localhost:8000/storage/${f.file}`;
    }

    return null;
  };
 

  const openPreview = (index) => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    const items = files.map((f) => {
      const url = getUrl(f);

      return {
        type: f.type || msg.type,
        url,
        description: f.description || "",
      };
    });

    setPreview({
      items,
      index,
    });
  };
 

  const handleTouchStart = (e) => {
    e.stopPropagation();

    longPressTriggered.current = false;

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

    clearTimeout(
      longPressTimer.current
    );
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();

    clearTimeout(
      longPressTimer.current
    );
  };
 

  const mediaProps = {
    msg,
    openPreview,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };

   

  if (hasMultipleDescriptions) {
    return (
      <div className="flex flex-col gap-3 my-2 w-full">
        {files.map((file, index) => {
          const description =
            typeof file?.description === "string"
              ? file.description.trim()
              : "";

          return (
            <div
              key={index}
              className="
                flex
                flex-col
                gap-1
                w-fit
                max-w-full
              "
            >
              {/* MEDIA */}
              <div
                className={`
                  rounded-xl
                  overflow-hidden
                  ${
                    uiMode === "full"
                      ? "w-64 h-44"
                      : "w-56 h-44 lg:w-56 lg:h-44 md:w-96 md:h-64"
                  }
                `}
              >
                <MediaItem
                  onLongPress={onLongPress}
                  msg={msg}
                  toggleSelect={toggleSelect}
                  file={file}
                  index={index}
                  {...mediaProps}
                />
              </div>

              {/* INDIVIDUAL DESCRIPTION */}
              {description !== "" && (
                <div
                  className={`
                    text-[13px]
                    lg:text-[13px]
                    md:text-[16px]
                    text-white
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
                        "text-blue-400 pointer-events-auto",
                    }}
                  >
                    {description}
                  </Linkify>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SINGLE FILE
  |--------------------------------------------------------------------------
  */

  if (total === 1) {
    return (
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
          file={files[0]}
          index={0}
          {...mediaProps}
        />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | TWO FILES - EXISTING GRID
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
            key={i}
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
  | THREE OR MORE FILES - EXISTING GRID
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
        {files.slice(1, 3).map(
          (file, i) => {
            const realIndex = i + 1;

            const isLast =
              realIndex === 2 &&
              total > 3;

            return (
              <div
                key={realIndex}
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
          }
        )}
      </div>
    </div>
  );
}