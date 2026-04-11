import { useEffect, useRef, useState } from "react";

export default function VoiceUI({ msg, isMine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const seekRef = useRef(null);

  const seekToPosition = (clientX) => {
  const container = seekRef.current;
  const audio = audioRef.current;

  if (!container || !audio) return;
  if (!isFinite(audio.duration) || audio.duration <= 0) return;

  const rect = container.getBoundingClientRect();

  let percent = (clientX - rect.left) / rect.width;

  percent = Math.max(0, Math.min(1, percent));

  const newTime = percent * audio.duration;

  if (!isFinite(newTime)) return;

  audio.currentTime = newTime;
  setCurrentTime(newTime);
};

const seek = (clientX) => {
  const container = seekRef.current;
  const audio = audioRef.current;

  if (!container || !audio) return;
  if (!isFinite(duration) || duration <= 0) return;

  const rect = container.getBoundingClientRect();

  const percent = (clientX - rect.left) / rect.width;

  if (!isFinite(percent)) return;

  const clampedPercent = Math.max(0, Math.min(1, percent));

  const newTime = clampedPercent * duration;

  if (!isFinite(newTime)) return;

  audio.currentTime = newTime;
  setCurrentTime(newTime);

  if (audio.paused) {
    audio.play().catch(() => {});
  }
};

useEffect(() => {
  const move = (e) => {
    if (!isSeeking) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    seek(clientX);
  };

  const up = () => setIsSeeking(false);

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", up);
  window.addEventListener("touchmove", move);
  window.addEventListener("touchend", up);

  return () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
    window.removeEventListener("touchmove", move);
    window.removeEventListener("touchend", up);
  };
}, [isSeeking]); 


  const audioSrc = msg.voice_url
  ? msg.voice_url
  : msg.file
  ? `http://localhost:8000/storage/${msg.file}`
  : msg.local || null;

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
      if (audio.ended) {
        audio.currentTime = 0;
      }
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.log("Audio error:", err);
    }
  };
  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const onLoadedMetadata = () => {
  const audio = audioRef.current;
  if (!audio) return;

  const d = audio.duration;

  if (isFinite(d) && d > 0) {
    setDuration(d);
  } else {
    setDuration(0);
  }
};

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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const format = (t) => {
  if (!t || !isFinite(t) || t === Infinity || t <= 0) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
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

  const progress =
  isFinite(duration) && duration > 0
    ? (currentTime / duration) * 100
    : 0;
  return (
    <div
      className={`p-2 rounded-2xl w-56 text-black ${
        isMine ? "bg-green-200" : "bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">
        {!playing && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl text-white font-bold ${getColor(
              msg.sender?.first_name || "U"
            )}`}
          >
            {getInitial(msg.sender?.first_name || "U")}
          </div>
        )}
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
        <div
          className="flex-1 flex items-center"
         onClick={(e) => {
              e.stopPropagation(); // ✅ prevent parent click issues

              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              const newTime = percent * duration;
              const audio = audioRef.current;
              if (!audio) return;
              audio.currentTime = newTime;
              setCurrentTime(newTime);
              if (!audio.paused) {
                audio.play();
              }
            }}
        >
          <div
            ref={seekRef}
            className="relative w-full h-1 bg-gray-300 rounded-full cursor-pointer"

            // ✅ CLICK = jump + play
            onClick={(e) => {
            const rect = seekRef.current.getBoundingClientRect();
            const clientX = e.clientX;

            const percent = (clientX - rect.left) / rect.width;

            if (!isFinite(duration) || duration <= 0) return;

            const newTime = Math.max(0, Math.min(1, percent)) * duration;

            if (!isFinite(newTime)) return;

            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}

            // ✅ DRAG START
            onMouseDown={(e) => {
              setIsSeeking(true);
              seek(e.clientX);
            }}

            onTouchStart={(e) => {
              setIsSeeking(true);
              seek(e.touches[0].clientX);
            }}
          >
            
            {/* PROGRESS */}
            <div
              className="absolute top-0 left-0 h-1 bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />

            {/* DRAG HANDLE */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rounded-full cursor-pointer"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
        </div>
      </div>

      {/* TIME */}
      <div className="mt-1 text-[10px] text-center text-gray-600 font-bold">
        {format(currentTime)} / {format(duration)}
      </div>

      {/* AUDIO */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
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