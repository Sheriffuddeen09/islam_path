import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function AudioBubble({toggleSelect,
  file,
  msg,
  isMine,
  index,
  uiMode,
}) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const draggingRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const longPressTimer = useRef(null);
const longPressTriggered = useRef(false);

const handleAudioPointerDown = (e) => {
  // Don't let the parent message receive this event
  e.stopPropagation();

  longPressTriggered.current = false;

  clearTimeout(longPressTimer.current);

  longPressTimer.current = setTimeout(() => {
    longPressTriggered.current = true;

    // SELECT THE MESSAGE
    if (toggleSelect && msg) {
      toggleSelect(msg);
    }
  }, 500);
};

const handleAudioPointerMove = (e) => {
  e.stopPropagation();

  clearTimeout(longPressTimer.current);
};

const handleAudioPointerUp = (e) => {
  e.stopPropagation();

  clearTimeout(longPressTimer.current);
};

const handleAudioPointerCancel = (e) => {
  e.stopPropagation();

  clearTimeout(longPressTimer.current);
};

  const GLOBAL_AUDIO_EVENT = "audio-play";

  const isAudio =
    file?.type === "audio" ||
    file?.type === "voice";

  const audioSrc =
    msg.local ||
    msg.voice_url ||
    (isAudio ? file?.file_url : null) ||
    null;

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const getColor = (name = "") =>
    colors[
      name.charCodeAt(0) % colors.length
    ] || "bg-gray-500";

  const getInitial = (name = "") =>
    name
      ? name.charAt(0).toUpperCase()
      : "?";

  const formatDuration = (seconds) => {
    const sec = Number(seconds);

    if (
      !Number.isFinite(sec) ||
      sec <= 0
    ) {
      return "0:00";
    }

    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audioSrc) {
      return;
    }

    audio.src = audioSrc;
    audio.pause();
    audio.load();

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      if (audio.paused) {
        window.dispatchEvent(
          new CustomEvent(
            GLOBAL_AUDIO_EVENT,
            {
              detail: {
                id:
                  msg.id +
                  "_" +
                  index,
              },
            }
          )
        );

        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.log(
        "Play interrupted safely:",
        err
      );
    }
  };

  useEffect(() => {
    const handleGlobalPlay = (e) => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (
        e.detail.id ===
        msg.id + "_" + index
      ) {
        return;
      }

      if (!audio.paused) {
        audio.pause();
      }
    };

    window.addEventListener(
      GLOBAL_AUDIO_EVENT,
      handleGlobalPlay
    );

    return () => {
      window.removeEventListener(
        GLOBAL_AUDIO_EVENT,
        handleGlobalPlay
      );
    };
  }, [msg.id, index]);
 

  const onTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio || draggingRef.current) {
      return;
    }

    setCurrentTime(
      audio.currentTime || 0
    );
  };

  
  const onLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (
      Number.isFinite(audio.duration) &&
      audio.duration > 0
    ) {
      setDuration(audio.duration);
      return;
    }
 
    try {
      audio.currentTime = 1e10;

      const handleDuration = () => {
        audio.removeEventListener(
          "timeupdate",
          handleDuration
        );

        const realDuration =
          audio.duration;

        if (
          Number.isFinite(realDuration) &&
          realDuration > 0
        ) {
          setDuration(realDuration);
        }

        audio.currentTime = 0;
        setCurrentTime(0);
      };

      audio.addEventListener(
        "timeupdate",
        handleDuration
      );
    } catch (error) {
      console.log(
        "Unable to determine audio duration:",
        error
      );
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const onPlay = () => {
      setPlaying(true);
    };

    const onPause = () => {
      setPlaying(false);
    };

    audio.addEventListener(
      "play",
      onPlay
    );

    audio.addEventListener(
      "pause",
      onPause
    );

    return () => {
      audio.removeEventListener(
        "play",
        onPlay
      );

      audio.removeEventListener(
        "pause",
        onPause
      );
    };
  }, []);


  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.playbackRate = speed;
    }
  }, [speed]);

  const progress =
    duration > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (currentTime / duration) *
              100
          )
        )
      : 0;

  const seekFromClientX = (clientX) => {
    const audio = audioRef.current;
    const progressBar =
      progressRef.current;

    if (
      !audio ||
      !progressBar ||
      !duration
    ) {
      return;
    }

    const rect =
      progressBar.getBoundingClientRect();

    let percentage =
      (clientX - rect.left) /
      rect.width;

    percentage = Math.min(
      1,
      Math.max(0, percentage)
    );

    const newTime =
      percentage * duration;

    audio.currentTime = newTime;

    setCurrentTime(newTime);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    draggingRef.current = true;

    e.currentTarget.setPointerCapture?.(
      e.pointerId
    );

    seekFromClientX(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    seekFromClientX(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!draggingRef.current) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    draggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture?.(
        e.pointerId
      );
    } catch {}

    seekFromClientX(e.clientX);
  };

  useEffect(() => {
    const handleWindowPointerUp = () => {
      draggingRef.current = false;
    };

    window.addEventListener(
      "pointerup",
      handleWindowPointerUp
    );

    return () => {
      window.removeEventListener(
        "pointerup",
        handleWindowPointerUp
      );
    };
  }, []);

return (
  <div
    className={`
      p-1
      rounded-2xl
      my-1 md:my-2
      text-black
      shadow-sm
      border
      transition-all
      duration-200
      overflow-hidden
      ${
        isMine
          ? "bg-green-200 border-green-300"
          : "bg-gray-100 border-gray-200"
      }
      ${
        uiMode === "full"
          ? "w-64"
          : "w-56 lg:w-56 md:w-96"
      }
    `}
    onPointerDown={handleAudioPointerDown}
    onPointerMove={handleAudioPointerMove}
    onPointerUp={handleAudioPointerUp}
    onPointerCancel={handleAudioPointerCancel}
    onClick={(e) => {
      e.stopPropagation();

      // If this click came from a long press,
      // do nothing.
      if (longPressTriggered.current) {
        longPressTriggered.current = false;
        return;
      }
    }}
  >
    {/* AUDIO ROW */}
    <div className="flex items-center gap-1 min-w-0">

      {/* AVATAR / SPEED */}
      {!playing ? (
        <div
          className={`
            w-8
            h-8
            shrink-0
            rounded-full
            flex
            items-center
            justify-center
            text-xl
            text-white
            font-bold
            ml-2 mt-2
            shadow-sm
            ${getColor(
              msg.sender?.first_name || "U"
            )}
          `}
        >
          {getInitial(
            msg.sender?.first_name || "U"
          )}
        </div>
      ) : (
        <div className="relative p-2 shrink-0">

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();

              setShowSpeed(
                (prev) => !prev
              );
            }}
            className="
              shadow-sm
              text-[11px]
              font-bold
              text-gray-700
              active:scale-95
              transition
            "
          >
            {speed}x
          </button>

          {showSpeed && (
            <div
              className="
                absolute
                bottom-12
                left-0
                bg-white
                border
                border-gray-200
                shadow-xl
                rounded-xl
                overflow-hidden
                text-xs
                z-[100]
                min-w-[60px]
              "
            >
              {[1, 1.5, 2].map(
                (value) => (
                  <button
                    type="button"
                    key={value}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();

                      setSpeed(value);
                      setShowSpeed(false);
                    }}
                    className={`
                      block
                      w-full
                      px-3
                      py-2
                      text-left
                      hover:bg-gray-100
                      ${
                        speed === value
                          ? "font-bold text-green-600"
                          : "text-gray-700"
                      }
                    `}
                  >
                    {value}x
                  </button>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* PLAY BUTTON */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();

          togglePlay();
        }}
        className="
          shrink-0 
          flex
          items-center
          justify-center
          shadow-sm
          hover:scale-105
          active:scale-95
          transition-all
          p-1
        "
      >
        {playing ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25v13.5m-7.5-13.5v13.5"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-5 h-5 text-green-600 ml-0.5"
          >
            <path d="M8 5.14v13.72c0 .78.86 1.26 1.53.85l10.85-6.86a1 1 0 0 0 0-1.7L9.53 4.29C8.86 3.88 8 4.36 8 5.14Z" />
          </svg>
        )}
      </button>

      {/* WAVEFORM */}
      {/* AUDIO PROGRESS LINE */}
<div
  ref={progressRef}
  className={`
    relative
    flex-1
    min-w-0
    h-6
    flex
    items-center
    cursor-pointer
    touch-none
    select-none
  `}
  onPointerDown={(e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);

    handlePointerDown(e);
  }}
  onPointerMove={(e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);

    handlePointerMove(e);
  }}
  onPointerUp={(e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);

    handlePointerUp(e);
  }}
  onPointerCancel={(e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);

    draggingRef.current = false;
  }}
  onClick={(e) => {
    e.stopPropagation();
  }}
>
  {/* FULL TRACK */}
  <div
    className={`
      absolute
      left-0
      right-0
      top-1/2
      -translate-y-1/2
      h-[2px]
      rounded-full
      bg-gray-300
    `}
  />

  {/* PLAYED PROGRESS */}
  <div
    className="
      absolute
      left-0
      top-1/2
      -translate-y-1/2
      h-[2px]
      rounded-full
      bg-green-600
      pointer-events-none
    "
    style={{
      width: `${Math.min(100, Math.max(0, progress))}%`,
    }}
  />

  {/* DRAG HANDLE */}
  {duration > 0 && (
    <div
      className="
        absolute
        top-1/2
        -translate-y-1/2
        w-3
        h-3
        rounded-full
        bg-green-600
        shadow-sm
        pointer-events-none
      "
      style={{
        left: `${Math.min(100, Math.max(0, progress))}%`,
        transform: "translate(-50%, -50%)",
      }}
    />
  )}
</div>
</div>
    {/* TIME */}
    <div
      className="
        flex
        justify-between
        items-center
        px-8
        text-[10px]
        font-semibold
        text-gray-500
      "
    >
      <span>
        {formatDuration(currentTime)}
      </span>

      <span>
        {formatDuration(
          duration ||
            msg.files?.[0]?.duration ||
            msg.duration
        )}
      </span>
    </div>

    {/* HIDDEN AUDIO ELEMENT */}
    {audioSrc && (
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onPointerDown={(e) => {
          e.stopPropagation();
          clearTimeout(longPressTimer.current);
        }}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onCanPlayThrough={onLoadedMetadata}
        onEnded={() => {
          const audio = audioRef.current;

          if (!audio) {
            return;
          }

          audio.currentTime = 0;

          setPlaying(false);
          setCurrentTime(0);
        }}
      />
    )}
  </div>
);

}