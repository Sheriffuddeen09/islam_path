import { useEffect, useRef, useState } from "react";

export default function VoiceUI({ msg, isMine }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const audioSrc = msg.voice_url || msg.local || "";

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

  // 🔥 FORCE AUDIO RELOAD WHEN SRC CHANGES
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    audio.pause();
    audio.load(); // critical

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  // 🔥 PLAY / PAUSE
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

  // 🔥 TIME UPDATE
  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  // 🔥 METADATA FIXED
  const onLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
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

  const format = (t) => {
    if (!t || !isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`p-2 rounded-2xl max-w-xs text-black ${
        isMine ? "bg-green-200" : "bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">

        {/* Avatar */}
        {!playing && (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getColor(
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
          {playing ? "⏸" : "▶"}
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

      {/* TIME */}
      <div className="mt-1 text-[10px] text-center text-gray-600 font-bold">
        {format(currentTime)} / {format(duration)}
      </div>

      {/* AUDIO */}
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
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
    </div>
  );
}