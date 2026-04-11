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

  const log = (...args) => {
    console.log("🎧 VOICE DEBUG:", ...args);
  };

  const seek = (clientX) => {
    log("SEEK MOVE TRIGGERED", { clientX });

    const container = seekRef.current;
    const audio = audioRef.current;

    if (!container || !audio) {
      log("❌ seek aborted: missing refs");
      return;
    }

    if (!isFinite(duration) || duration <= 0) {
      log("❌ seek aborted: invalid duration", duration);
      return;
    }

    const rect = container.getBoundingClientRect();

    const percent = (clientX - rect.left) / rect.width;
    log("percent raw", percent);

    if (!isFinite(percent)) {
      log("❌ invalid percent");
      return;
    }

    const clampedPercent = Math.max(0, Math.min(1, percent));
    const newTime = clampedPercent * duration;

    log("seek computed", {
      clampedPercent,
      newTime,
      currentTime: audio.currentTime,
      duration,
    });

    if (!isFinite(newTime)) {
      log("❌ invalid newTime");
      return;
    }

    audio.currentTime = newTime;
    setCurrentTime(newTime);

    log("✅ audio.currentTime SET", audio.currentTime);

    if (audio.paused) {
      audio.play().catch((err) => {
        log("❌ play failed", err);
      });
    }
  };

  useEffect(() => {
    const move = (e) => {
      if (!isSeeking) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;

      log("DRAG MOVE", { clientX, isSeeking });

      seek(clientX);
    };

    const up = () => {
      log("🟢 SEEK END");
      setIsSeeking(false);
    };

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    log("🔄 AUDIO SOURCE CHANGE", audioSrc);

    audio.src = audioSrc;
    audio.pause();
    audio.load();

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [audioSrc]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    log("▶ PLAY TOGGLE CLICKED");

    try {
      if (audio.ended) audio.currentTime = 0;

      if (audio.paused) {
        await audio.play();
        log("▶ PLAYING");
      } else {
        audio.pause();
        log("⏸ PAUSED");
      }
    } catch (err) {
      log("❌ PLAY ERROR", err);
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) return;

    log("⏱ TIME UPDATE", {
      currentTime: audio.currentTime,
      isSeeking,
    });

    setCurrentTime(audio.currentTime);
  };

  const onLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) return;

    log("📦 METADATA LOADED", audio.duration);

    const d = audio.duration;

    if (isFinite(d) && d > 0) {
      setDuration(d);
    } else {
      log("❌ INVALID DURATION", d);
      setDuration(0);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => log("🟢 AUDIO PLAY EVENT");
    const onPause = () => log("🔴 AUDIO PAUSE EVENT");

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      log("⚙ SPEED CHANGE", speed);
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const format = (t) => {
    if (!t || !isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress =
    isFinite(duration) && duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return (
    <div className={`p-2 rounded-2xl w-56 ${isMine ? "bg-green-200" : "bg-gray-100"}`}>
      <div className="flex items-center gap-2">

        <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center">
          {playing ? "⏸" : ""}
        </button>

        <div className="flex-1">
          <div
            ref={seekRef}
            className="relative w-full h-1 bg-gray-300 rounded-full cursor-pointer"
            onMouseDown={(e) => {
              log("🟡 SEEK START");
              setIsSeeking(true);
              seek(e.clientX);
            }}
            onTouchStart={(e) => {
              log("🟡 TOUCH SEEK START");
              setIsSeeking(true);
              seek(e.touches[0].clientX);
            }}
            onClick={(e) => {
              log("🟣 SEEK CLICK");
              seek(e.clientX);
            }}
          >
            <div
              className="absolute top-0 left-0 h-1 bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="text-[10px] text-center mt-1">
        {format(currentTime)} / {format(duration)}
      </div>

      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={() => {
            log("🏁 AUDIO ENDED");

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