import { useEffect, useRef, useState } from "react";

export default function AudioPlayer({ msg, isMine }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const GLOBAL_AUDIO_EVENT = "audio-play";



  const file = msg.files?.[0];

    const isAudio =
      file?.type === "audio" || file?.type === "voice";

    const audioSrc =
      msg.voice_url ||
      (isAudio ? file.file_url : null) ||
      msg.local ||
      null;

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const getColor = (name = "") =>
    colors[name.charCodeAt(0) % colors.length] || "bg-gray-500";

  const getInitial = (name = "") =>
    name ? name.charAt(0).toUpperCase() : "?";

  const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    audio.src = audioSrc;
    audio.pause();
    audio.load(); // critical

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  const togglePlay = async () => {
  const audio = audioRef.current;
  if (!audio) return;

  try {
    if (audio.paused) {
      window.dispatchEvent(
        new CustomEvent(GLOBAL_AUDIO_EVENT, {
          detail: { id: msg.id },
        })
      );

      await audio.play();
    } else {
      audio.pause();
    }
  } catch (err) {
    console.log("Play interrupted safely:", err);
  }
};

useEffect(() => {
  const handleGlobalPlay = (e) => {
    const audio = audioRef.current;

    if (!audio) return;

    // ❌ ignore same audio
    if (e.detail.id === msg.id) return;

    // 🔥 IMPORTANT: delay pause to avoid play interruption crash
    setTimeout(() => {
      if (!audio.paused) {
        audio.pause();
      }
    }, 50);
  };

  window.addEventListener(GLOBAL_AUDIO_EVENT, handleGlobalPlay);

  return () => {
    window.removeEventListener(GLOBAL_AUDIO_EVENT, handleGlobalPlay);
  };
}, [msg.id]);

  // 🔥 TIME UPDATE
  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  // 🔥 METADATA FIXED
  const onLoadedMetadata = () => {
  const audio = audioRef.current;
  if (!audio) return;

  const tryGetDuration = () => {
    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration);
    } else {
      setTimeout(tryGetDuration, 200);
    }
  };

  tryGetDuration();
};

  // 🔥 PLAY STATE SYNC
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);


  // 🔥 SPEED CONTROL
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const format = (seconds) => {
  const sec = Number(seconds); // 🔥 FORCE NUMBER

  if (!sec || isNaN(sec)) return "0:00";

  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const fixDuration = () => {
    const d = audio.duration;

    if (isFinite(d) && d > 0) {
      setDuration(d);
    } else if (d === Infinity) {
      console.warn("Invalid audio format detected");
      setDuration(0);
    } else {
      setTimeout(fixDuration, 200);
    }
  };

  fixDuration();
}, [audioSrc]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`p-2 rounded-2xl w-56 text-black ${
        isMine ? "bg-green-200" : "bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-1">

        {/* Avatar */}
        {!playing && (
          <div
            className={`w-12 pb-1 px-2 rounded-full flex items-center justify-center text-3xl text-white font-bold ${getColor(
              msg.sender?.first_name || "U"
            )}`}
          >
            {getInitial(msg.sender?.first_name || "U")}
          </div>
        )}

        {/* Speed */}
        {playing && (
          <div className="relative">
            <button
              onClick={() => setShowSpeed(!showSpeed)}
              className="w-10 h-10 rounded-full bg-white text-xs font-bold"
            >
              {speed}x
            </button>

            {showSpeed && (
              <div className="absolute bottom-10 left-0 bg-white shadow rounded text-xs z-10">
                {[1, 1.5, 2].map((v) => (
                  <div
                    key={v}
                    onClick={() => {
                      setSpeed(v);
                      setShowSpeed(false);
                    }}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  >
                    {v}x
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Play button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center"
        >
          {playing ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
              </svg> :  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>}
        </button>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-[2px] h-6">
          {[...Array(35)].map((_, i) => {
            const active = (i / 35) * 100 < progress;

            return (
              <div
                key={i}
                className={`w-[2px] rounded-sm ${
                  active ? "bg-green-600" : "bg-gray-400"
                }`}
                style={{
                  height: `${10 + Math.sin(i) * 10 + 10}px`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* TIME {format(duration)}*/}
      <div className="mt-1 text-[10px] text-center text-gray-600 font-bold">
        {format(currentTime)} / {msg.files?.[0]?.duration
      ? `${formatDuration(msg.files?.[0]?.duration)}`
      : `${format(duration)}`}
      </div>

      {/* AUDIO */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          className="pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={() => {
            const audio = audioRef.current;
            if (!audio) return;

            audio.currentTime = 0;
            setPlaying(false);
            setCurrentTime(0);
          }}
        />
      )}
    </div>
  );
}