import { useEffect, useRef, useState } from "react";

export default function VoiceUI({ msg, isMine }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const colors = ["bg-orange-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500"];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) audioRef.current.pause();
    else audioRef.current.play();

    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoaded = () => {
    setDuration(audioRef.current.duration);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const format = (t) => {
    if (!t) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`p-2 rounded-2xl max-w-xs ${isMine ? "bg-green-200" : "bg-gray-100"}`}>

      {/* TOP ROW */}
      <div className="flex items-center gap-2">

        {/* AVATAR (ONLY WHEN NOT PLAYING) */}
        {!playing && (
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getColor(
            isMine ? isMine.first_name : msg.sender?.first_name || "U"
            )}`}
        >
            {getInitial(
            isMine
                ? isMine.first_name
                : msg.sender?.first_name || "U"
            )}
        </div>
        )}

        {/* SPEED (ONLY WHEN PLAYING) */}
        {playing && (
          <div className="relative">
            <button
              onClick={() => setShowSpeed(!showSpeed)}
              className="w-10 h-10 rounded-full bg-white text-xs font-bold flex items-center justify-center"
            >
              {speed}x
            </button>

            {showSpeed && (
              <div className="absolute bottom-10 left-0 bg-white shadow rounded text-xs">
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

        {/* PLAY BUTTON */}
        <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center">
          {playing ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          )}
        </button>

        {/* WAVE */}
        <div className="flex-1 relative h-6 flex items-center gap-[2px]">
          {[...Array(35)].map((_, i) => {
            const active = (i / 35) * 100 < progress;

            return (
              <div
                key={i}
                className={`w-[2px] rounded-sm ${active ? "bg-green-600" : "bg-gray-400"}`}
                style={{ height: `${10 + Math.sin(i) * 10 + 10}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* TIME UNDER WAVE */}
      <div className="mt-1 text-[10px] text-center text-gray-600 font-bold">
        {playing ? format(currentTime) : format(duration)}
      </div>

      {/* AUDIO */}
      <audio
        ref={audioRef}
        src={msg.local || msg.voice_url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}