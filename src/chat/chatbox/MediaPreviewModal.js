import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Check, Send, Maximize, CheckCircle2 } from "lucide-react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function MediaPreviewModal({
  show,
  files,
  previewUrls,
  setCaption,
  onClose,
  onSend,

  crop,
  setCrop,
  cropAppliedMap,
  croppedImages,
  selected,
  setCropAppliedMap,
  setTrimMap,
  setDurationMap,
  trimMap,
  durationMap,
  dragType,
  setDragType,
  setTrimAppliedMap,
  trimAppliedMap,
  setCroppedImages,
  descriptions, setDescriptions,
  activeIndex, setActiveIndex
}) {
  const [showEmoji, setShowEmoji] = useState(false);

  // Crop mode for each image
  const [cropModeMap, setCropModeMap] = useState({});
 
  const videoRef = useRef(null);
  const trackRef = useRef(null);

  const activeFile = files?.[activeIndex];
 
  const activeDescription =
    descriptions?.[activeIndex] || "";

  const updateDescription = (value) => {
    if (value.length > 700) return;

    setDescriptions((prev) => ({
      ...prev,
      [activeIndex]: value,
    }));
  };
 
  const addEmoji = (emojiData) => {
    setCaption((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };
 
  const duration =
    durationMap?.[activeIndex] ?? 0;

  const currentTrim =
    trimMap?.[activeIndex] || {
      start: 0,
      end: duration,
    };

  // ============================================================
  // HANDLE TRIM DRAG 'setActiveIndex
  // ============================================================

  const handleDrag = (clientX, rect) => {
    if (!dragType || !duration) return;

    const percent = Math.min(
      Math.max(
        (clientX - rect.left) / rect.width,
        0
      ),
      1
    );

    const time = percent * duration;

    setTrimMap((prev) => {
      const current =
        prev?.[activeIndex] || {
          start: 0,
          end: duration,
        };

      let start = current.start;
      let end = current.end;

      if (dragType === "left") {
        start = Math.min(time, end - 0.5);
      }

      if (dragType === "right") {
        end = Math.max(time, start + 0.5);
      }

      if (dragType === "move") {
        const length = end - start;

        start = Math.max(
          0,
          time - length / 2
        );

        end = start + length;

        if (end > duration) {
          end = duration;
          start = Math.max(
            0,
            duration - length
          );
        }
      }

      if (videoRef.current) {
        videoRef.current.currentTime =
          start;
      }

      return {
        ...prev,
        [activeIndex]: {
          start,
          end,
        },
      };
    });
  };

  // ============================================================
  // TRIM EVENTS
  // ============================================================

  useEffect(() => {
    const move = (e) => {
      if (!dragType || !trackRef.current)
        return;

      const rect =
        trackRef.current.getBoundingClientRect();

      handleDrag(e.clientX, rect);
    };

    const touchMove = (e) => {
      if (!dragType || !trackRef.current)
        return;

      const rect =
        trackRef.current.getBoundingClientRect();

      handleDrag(
        e.touches[0].clientX,
        rect
      );
    };

    const stop = () => {
      setDragType(null);
    };

    window.addEventListener(
      "mousemove",
      move
    );

    window.addEventListener(
      "mouseup",
      stop
    );

    window.addEventListener(
      "touchmove",
      touchMove
    );

    window.addEventListener(
      "touchend",
      stop
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        move
      );

      window.removeEventListener(
        "mouseup",
        stop
      );

      window.removeEventListener(
        "touchmove",
        touchMove
      );

      window.removeEventListener(
        "touchend",
        stop
      );
    };
  }, [
    dragType,
    duration,
    activeIndex,
  ]);

  // ============================================================
  // VIDEO TRIM STATUS
  // ============================================================

  const isTrimmed =
    duration > 0 &&
    (currentTrim.start > 0 ||
      currentTrim.end < duration);

  // ============================================================
  // VIDEO TIME UPDATE
  // ============================================================

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (
      currentTrim.end > 0 &&
      video.currentTime >=
        currentTrim.end
    ) {
      video.currentTime =
        currentTrim.start;
    }

    if (
      video.currentTime <
      currentTrim.start
    ) {
      video.currentTime =
        currentTrim.start;
    }
  };

  // ============================================================
  // VIDEO PLAY
  // ============================================================

  const handlePlay = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    if (
      video.currentTime <
      currentTrim.start
    ) {
      video.currentTime =
        currentTrim.start;
    }

    video.play().catch(() => {});
  };

  // ============================================================
  // CROP
  // ============================================================

  const getCroppedImg = (
    image,
    cropData
  ) => {
    if (
      !cropData ||
      !cropData.width ||
      !cropData.height
    ) {
      return null;
    }

    const canvas =
      document.createElement("canvas");

    const scaleX =
      image.naturalWidth /
      image.width;

    const scaleY =
      image.naturalHeight /
      image.height;

    canvas.width =
      cropData.width;

    canvas.height =
      cropData.height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas context missing"
      );
    }

    ctx.drawImage(
      image,
      cropData.x * scaleX,
      cropData.y * scaleY,
      cropData.width * scaleX,
      cropData.height * scaleY,
      0,
      0,
      cropData.width,
      cropData.height
    );

    return new Promise(
      (resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.92
        );
      }
    );
  };

  // ============================================================
  // APPLY CROP
  // ============================================================

  const applyCrop = async () => {
    try {
      const activeCrop =
        crop?.[activeIndex];

      const imageElement =
        document.querySelector(
          "img[data-source-preview='true']"
        );

      if (!imageElement) {
        console.error(
          "Image not found"
        );
        return;
      }

      if (
        !activeCrop ||
        !activeCrop.width ||
        !activeCrop.height
      ) {
        console.error(
          "Select crop area first"
        );
        return;
      }

      const croppedBlob =
        await getCroppedImg(
          imageElement,
          activeCrop
        );

      if (!croppedBlob) return;

      const croppedFile =
        new File(
          [croppedBlob],
          `cropped-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

      setCroppedImages(
        (prev) => ({
          ...prev,
          [activeIndex]:
            croppedFile,
        })
      );

      setCropAppliedMap(
        (prev) => ({
          ...prev,
          [activeIndex]: true,
        })
      );
    } catch (error) {
      console.error(
        "Crop failed:",
        error
      );
    }
  };

  // ============================================================
  // GET IMAGE PREVIEW
  // ============================================================

  const getPreviewSrc = (index) => {
    const item =
      croppedImages?.[index];

    if (
      item instanceof File ||
      item instanceof Blob
    ) {
      return URL.createObjectURL(
        item
      );
    }

    return (
      previewUrls?.[index] || ""
    );
  };

  // ============================================================
  // APPLY TRIM
  // ============================================================

  const applyTrim = () => {
    setTrimAppliedMap(
      (prev) => ({
        ...prev,
        [activeIndex]: true,
      })
    );
  };

  // ============================================================
  // CHANGE ACTIVE MEDIA
  // ============================================================

  const handleActiveMediaChange = (
    index
  ) => {
    // Stop current video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    setActiveIndex(index);
    setShowEmoji(false);
  };

  // ============================================================
  // RESET INDEX WHEN FILES CHANGE
  // ============================================================

  useEffect(() => {
    if (files?.length > 0) {
      setActiveIndex(0);
    }
  }, [files]);

  // ============================================================
  // SEND
  // ============================================================

  const handleSend = () => {
    onSend({
      selectedFiles: files.filter(
        (_, i) => selected?.[i]
      ),

      cropData: croppedImages,

      trimData: trimMap,

      // IMPORTANT:
      // One description per media item.
      descriptions,
    });
  };

  // ============================================================
  // DON'T RENDER
  // ============================================================

  if (!show) return null;

  return (
    <>
      {/* ======================================================
          HIDE SCROLLBAR UNTIL MOUSE IS OVER MEDIA
      ======================================================= */}

      <style>
        {`
          .media-preview-scroll {
            scrollbar-width: none;
          }

          .media-preview-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
          }

          .media-preview-scroll:hover {
            scrollbar-width: thin;
            scrollbar-color:
              rgba(34,197,94,.75)
              transparent;
          }

          .media-preview-scroll:hover::-webkit-scrollbar {
            width: 6px;
          }

          .media-preview-scroll:hover::-webkit-scrollbar-track {
            background: transparent;
          }

          .media-preview-scroll:hover::-webkit-scrollbar-thumb {
            background: rgba(34,197,94,.75);
            border-radius: 999px;
          }

          .media-preview-scroll:hover::-webkit-scrollbar-thumb:hover {
            background: rgba(34,197,94,1);
          }
        `}
      </style>

      <div className="fixed inset-0 bg-black flex flex-col z-50">

        {/* ==================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            justify-between
            items-center
            py-2
            px-4
            text-white
            bg-black/90
            shrink-0
          "
        >

          <button
            type="button"
            className="
              bg-gray-900
              hover:bg-gray-800
              rounded-full
              p-2
              transition
            "
            onClick={onClose}
          >
            ✕
          </button>

          <div
            className="
              flex
              gap-4
              font-bold
              text-sm
            "
          >
            {activeFile?.type?.startsWith(
              "image/"
            ) && (
              <span>Crop</span>
            )}

            {activeFile?.type?.startsWith(
              "video/"
            ) && (
              <span>Trim</span>
            )}
          </div>

          <div className="text-xs text-white/50">
            {files?.length
              ? `${activeIndex + 1} / ${files.length}`
              : ""}
          </div>
        </div>

        {/* ==================================================
            MAIN AREA
        =================================================== */}

        <div
          className="
            flex-1
            flex
            justify-center
            overflow-hidden
            min-h-0
          "
        >

          {/* =================================================
              IMAGE
          ================================================= */}

          {activeFile?.type?.startsWith(
            "image/"
          ) && (

            <div
              className="
                media-preview-scroll
                relative
                w-full
                max-w-md
                h-[60vh]
                bg-black
                overflow-y-auto
                overflow-x-hidden
                rounded-xl
                my-auto
              "
            >

              {/* CROP BUTTON */}

              <div
                className="
                  sticky
                  top-0
                  z-20
                  flex
                  justify-center
                  py-3
                  bg-black/80
                  backdrop-blur
                "
              >

                {!cropModeMap?.[
                  activeIndex
                ] ? (

                  <button
                    type="button"
                    onClick={() => {
                      setCropModeMap(
                        (prev) => ({
                          ...prev,
                          [activeIndex]:
                            true,
                        })
                      );
                    }}
                    className="
                      flex
                      items-center
                      justify-center
                      w-11
                      h-11
                      rounded-xl
                      bg-green-600
                      hover:bg-green-700
                      text-white
                      shadow-lg
                    "
                    title="Crop image"
                  >
                    <Maximize
                      size={20}
                    />
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() => {
                      applyCrop();

                      setCropModeMap(
                        (prev) => ({
                          ...prev,
                          [activeIndex]:
                            false,
                        })
                      );
                    }}
                    className={`
                      flex
                      items-center
                      justify-center
                      w-11
                      h-11
                      rounded-xl
                      text-white
                      shadow-lg
                      ${
                        cropAppliedMap?.[
                          activeIndex
                        ]
                          ? "bg-green-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    `}
                    title="Apply crop"
                  >
                    {cropAppliedMap?.[
                      activeIndex
                    ] ? (
                      <CheckCircle2
                        size={20}
                      />
                    ) : (
                      <Check
                        size={20}
                      />
                    )}
                  </button>
                )}
              </div>

              {/* IMAGE */}

              <div
                className="
                  min-h-full
                  flex
                  items-center
                  justify-center
                  p-4
                "
              >

                {cropModeMap?.[
                  activeIndex
                ] ? (

                  <ReactCrop
                    crop={
                      crop?.[
                        activeIndex
                      ]
                    }
                    className="green-crop"
                    onChange={(c) => {
                      setCrop(
                        (prev) => ({
                          ...prev,
                          [activeIndex]:
                            c,
                        })
                      );
                    }}
                    onComplete={(
                      pixelCrop
                    ) => {
                      // Keep crop information
                      // if needed later
                    }}
                    aspect={undefined}
                  >

                    <img
                      src={getPreviewSrc(
                        activeIndex
                      )}
                      alt="Source preview"
                      data-source-preview="true"
                      className="
                        max-w-full
                        h-auto
                        object-contain
                        select-none
                      "
                      onLoad={() => {
                        setCrop(
                          (prev) => {
                            if (
                              prev?.[
                                activeIndex
                              ]
                            ) {
                              return prev;
                            }

                            return {
                              ...prev,
                              [activeIndex]:
                                {
                                  unit: "%",
                                  x: 10,
                                  y: 10,
                                  width: 80,
                                  height: 80,
                                },
                            };
                          }
                        );
                      }}
                    />

                  </ReactCrop>

                ) : (

                  <img
                    src={getPreviewSrc(
                      activeIndex
                    )}
                    alt="Preview"
                    className="
                      max-w-full
                      h-auto
                      object-contain
                      rounded-lg
                    "
                  />

                )}

              </div>

            </div>
          )}

          {/* =================================================
              VIDEO
          ================================================= */}

          {activeFile?.type?.startsWith(
            "video/"
          ) && (

            <div
              className="
                media-preview-scroll
                w-full
                max-w-2xl
                max-h-[70vh]
                flex
                flex-col
                items-center
                text-white
                overflow-y-auto
                overflow-x-hidden
                my-auto
                px-2
              "
            >

              {/* VIDEO */}

              <video
                ref={videoRef}
                src={
                  previewUrls?.[
                    activeIndex
                  ]
                }
                controls
                playsInline
                className="
                  max-h-[50vh]
                  max-w-full
                  rounded-xl
                  bg-black
                  object-contain
                "
                onTimeUpdate={
                  handleTimeUpdate
                }
                onPlay={handlePlay}
                onLoadedMetadata={(
                  e
                ) => {
                  const dur =
                    e.target
                      .duration;

                  setDurationMap(
                    (prev) => ({
                      ...prev,
                      [activeIndex]:
                        dur,
                    })
                  );

                  setTrimMap(
                    (prev) => {
                      if (
                        prev?.[
                          activeIndex
                        ]
                      ) {
                        return prev;
                      }

                      return {
                        ...prev,
                        [activeIndex]:
                          {
                            start: 0,
                            end: dur,
                          },
                      };
                    }
                  );
                }}
              />

              {/* TRIM */}

              <div
                className="
                  w-full
                  px-4
                  mt-4
                "
              >

                <div
                  ref={trackRef}
                  className="
                    relative
                    w-full
                    h-8
                    bg-gray-800
                    rounded-lg
                    overflow-hidden
                    touch-none
                  "
                >

                  {duration > 0 && (
                    <>
                      {/* Selected area */}

                      <div
                        className="
                          absolute
                          top-0
                          h-full
                          bg-green-500/40
                        "
                        style={{
                          left: `${
                            (currentTrim.start /
                              duration) *
                            100
                          }%`,
                          width: `${
                            ((currentTrim.end -
                              currentTrim.start) /
                              duration) *
                            100
                          }%`,
                        }}
                      />

                      {/* LEFT */}

                      <div
                        onMouseDown={() =>
                          setDragType(
                            "left"
                          )
                        }
                        onTouchStart={() =>
                          setDragType(
                            "left"
                          )
                        }
                        className="
                          absolute
                          top-0
                          w-3
                          h-full
                          bg-white
                          rounded
                          shadow
                          cursor-ew-resize
                          z-30
                        "
                        style={{
                          left: `${
                            (currentTrim.start /
                              duration) *
                            100
                          }%`,
                          transform:
                            "translateX(-50%)",
                        }}
                      />

                      {/* RIGHT */}

                      <div
                        onMouseDown={() =>
                          setDragType(
                            "right"
                          )
                        }
                        onTouchStart={() =>
                          setDragType(
                            "right"
                          )
                        }
                        className="
                          absolute
                          top-0
                          w-3
                          h-full
                          bg-white
                          rounded
                          shadow
                          cursor-ew-resize
                          z-30
                        "
                        style={{
                          left: `${
                            (currentTrim.end /
                              duration) *
                            100
                          }%`,
                          transform:
                            "translateX(-50%)",
                        }}
                      />

                      {/* MOVE */}

                      <div
                        onMouseDown={() =>
                          setDragType(
                            "move"
                          )
                        }
                        onTouchStart={() =>
                          setDragType(
                            "move"
                          )
                        }
                        className="
                          absolute
                          top-0
                          h-full
                          cursor-grab
                          z-20
                          touch-none
                        "
                        style={{
                          left: `${
                            (currentTrim.start /
                              duration) *
                            100
                          }%`,
                          width: `${
                            ((currentTrim.end -
                              currentTrim.start) /
                              duration) *
                            100
                          }%`,
                        }}
                      />
                    </>
                  )}

                </div>
              </div>

              {/* TIME */}

              <div
                className="
                  text-center
                  text-xs
                  text-white
                  mt-2
                "
              >
                {duration > 0
                  ? isTrimmed
                    ? `${currentTrim.start.toFixed(
                        1
                      )}s — ${currentTrim.end.toFixed(
                        1
                      )}s`
                    : "Full video"
                  : "Loading video..."}
              </div>

              {/* APPLY TRIM */}

              <button
                type="button"
                onClick={applyTrim}
                disabled={!duration}
                className={`
                  mt-3
                  px-4
                  py-2.5
                  rounded-xl
                  text-sm
                  text-white
                  transition
                  disabled:opacity-40

                  ${
                    trimAppliedMap?.[
                      activeIndex
                    ]
                      ? "bg-green-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >
                {trimAppliedMap?.[
                  activeIndex
                ]
                  ? "Applied ✓"
                  : "Apply Trim"}
              </button>

            </div>
          )}

        </div>
 
        <div
          className="
            px-4
            py-3
            bg-black/95
            border-t
            border-white/10
            shrink-0
          "
        >

          
        <div
          className="
            flex
            gap-2
            px-3
            py-2
            bg-black/95
            overflow-x-auto
            shrink-0
          "
        >

          {files.map(
            (file, i) => (
              <div
                key={i}
                onClick={() =>
                  handleActiveMediaChange(
                    i
                  )
                }
                className={`
                  w-16
                  h-16
                  min-w-16
                  relative
                  cursor-pointer
                  rounded-lg
                  overflow-hidden
                  border-2
                  transition-all
                  duration-200

                  ${
                    i === activeIndex
                      ? "border-green-500 scale-105"
                      : "border-gray-600"
                  }
                `}
              >

                {file.type.startsWith(
                  "image/"
                ) ? (

                  <img
                    src={
                      previewUrls?.[i]
                    }
                    alt=""
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                ) : (

                  <video
                    src={
                      previewUrls?.[i]
                    }
                    muted
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />

                )}

                {/* Selected */}

                {i ===
                  activeIndex && (
                  <Check
                    className="
                      absolute
                      top-1
                      right-1
                      w-4
                      h-4
                      p-0.5
                      bg-green-700
                      text-white
                      rounded-full
                    "
                  />
                )}

                {/* Has description */}

                {descriptions?.[
                  i
                ]?.trim() && (
                  <span
                    className="
                      absolute
                      bottom-1
                      left-1
                      w-2
                      h-2
                      rounded-full
                      bg-green-400
                      shadow
                    "
                  />
                )}

              </div>
            )
          )}

        </div>
 
          <div
            className="
              flex
              items-center
              justify-between
              mb-2
            "
          >

            <label
              htmlFor="media-description"
              className="
                text-xs
                font-semibold
                text-white
              "
            >
              {activeFile?.type?.startsWith(
                "video/"
              )
                ? "Video description"
                : "Image description"}
            </label>

            <span
              className={`
                text-[11px]
                ${
                  activeDescription.length >=
                  650
                    ? "text-red-400"
                    : "text-white/50"
                }
              `}
            >
              {activeDescription.length}/700
            </span>

          </div>
      <div className="flex items-center  gap-2 w-full shrink-0">
        {/* DESCRIPTION INPUT */}
        <div className="relative flex-1 w-full">
          <textarea
            id="media-description"
            value={activeDescription}
            onChange={(e) => updateDescription(e.target.value)}
            rows={2}
            placeholder={
              activeFile?.type?.startsWith("video/")
                ? "Add a description for this video..."
                : "Add a description for this image..."
            }
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-white/10
              bg-white/10
              px-3
              py-2.5
              pr-12
              text-sm
              text-[var(--text-color)]
              placeholder:text-white/40
              outline-none
              transition
              focus:border-green-500
              focus:ring-1
              focus:ring-green-500
            "
          />

          {/* EMOJI BUTTON */}
          <button
            type="button"
            onClick={() => setShowEmoji((p) => !p)}
            className="
              absolute
              right-2
              bottom-2
              flex
              items-center
              justify-center
              w-8
              h-8
              rounded-full
              text-[var(--text-color)]
              hover:bg-white/10
              transition
              z-10
            "
            title="Add emoji"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0
                  M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z
                  M9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75
                  9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0
                  c0 .414-.168.75-.375.75s-.375-.336-.375-.75
                  .168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
          </button>

          {/* EMOJI PICKER */}
          {showEmoji && (
            <div
              className="
                absolute
                bottom-full
                right-0
                mb-2
                z-[100]
              "
            >
              <EmojiPicker
                onEmojiClick={addEmoji}
              />
            </div>
          )}
        </div>

        {/* SEND BUTTON */}
        <button
          type="button"
          onClick={handleSend}
          className="
            flex
            items-center
            justify-center
            w-11
            h-11
            shrink-0
            rounded-full
            bg-green-600
            hover:bg-green-700
            text-white
            transition
            shadow-md
          "
          title="Send"
        >
          <Send size={19} />
        </button>
      </div>
      </div>


      </div>
    </>
  );
}