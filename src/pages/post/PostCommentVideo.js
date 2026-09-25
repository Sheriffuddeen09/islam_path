import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Maximize,
  Play,
  Pause,
  Loader2,
} from "lucide-react";

export default function PostCommentVideo({ video }) {
  const [open, setOpen] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const [volume, setVolume] = useState(1);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [speed, setSpeed] = useState(1);

  const [loading, setLoading] = useState(false);


  const src = `http://localhost:8000/storage/${video}`;

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "00:00";
    }

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  const showVideoControls = () => {
  setShowControls(true);

  if (controlsTimerRef.current) {
    clearTimeout(controlsTimerRef.current);
  }

  controlsTimerRef.current = setTimeout(() => {
    setShowControls(false);
  }, 2500);
};



  const togglePlay = async (e) => {
    e?.stopPropagation();

    const videoElement = videoRef.current;

    if (!videoElement) return;

    try {
      if (videoElement.paused) {
        setLoading(true);
        await videoElement.play();
      } else {
        videoElement.pause();
      }
    } catch (error) {
      console.error("Video play error:", error);
      setLoading(false);
    }
  };

  const toggleMute = (e) => {
    e?.stopPropagation();

    const videoElement = videoRef.current;

    if (!videoElement) return;

    const nextMuted = !videoElement.muted;

    videoElement.muted = nextMuted;

    setMuted(nextMuted);
  };

  const handleVolume = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.volume = value;

    if (value === 0) {
      videoElement.muted = true;
      setMuted(true);
    } else {
      videoElement.muted = false;
      setMuted(false);
    }

    setVolume(value);
  };

  const handleSeek = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.currentTime = value;

    setCurrentTime(value);
  };

  const handleSpeed = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    const videoElement = videoRef.current;

    if (!videoElement) return;

    videoElement.playbackRate = value;

    setSpeed(value);
  };

  const toggleFullscreen = async (e) => {
    e.stopPropagation();

    const container = containerRef.current;

    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const closeVideo = (e) => {
    e?.stopPropagation();

    const videoElement = videoRef.current;

    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }

    setPlaying(false);
    setCurrentTime(0);
    setOpen(false);
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadedMetadata = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    setDuration(videoElement.duration || 0);

    videoElement.volume = volume;
    videoElement.muted = muted;
    videoElement.playbackRate = speed;
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  const handleWaiting = () => {
    setLoading(true);
  };

  const handlePlaying = () => {
    setLoading(false);
    setPlaying(true);
  };

  const handleTimeUpdate = () => {
    const videoElement = videoRef.current;

    if (!videoElement) return;

    setCurrentTime(videoElement.currentTime);
  };

  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  const handleEnded = () => {
    setPlaying(false);
    setLoading(false);
    setCurrentTime(duration);
  };

  useEffect(() => {
    if (!open) return;

    const videoElement = videoRef.current;

    if (!videoElement) return;

    setLoading(true);

    videoElement.volume = volume;
    videoElement.muted = muted;
    videoElement.playbackRate = speed;

    const playVideo = async () => {
      try {
        await videoElement.play();
      } catch (error) {
        console.error("Autoplay error:", error);
        setLoading(false);
      }
    };

    playVideo();

    return () => {
      videoElement.pause();
    };
  }, [open]);


  if (!video) return null;



  return (
    <>
      {/* VIDEO THUMBNAIL */}
      <div
        className="
          relative
          w-40
          h-32
          mx-auto
          mt-2
          rounded-lg
          overflow-hidden
          cursor-pointer
          bg-black
        "
        onClick={() => setOpen(true)}
      >
        <video
          src={src}
          className="w-full h-full object-cover"
          muted
          playsInline
          preload="metadata"
        />

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/10
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-black/60
              flex
              items-center
              justify-center
              text-white
            "
          >
            <Play size={18} fill="white" />
          </div>
        </div>
      </div>

      {/* FULL VIDEO MODAL */}
      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/95
            flex
            items-center
            justify-center
            z-[100]
            p-4
          "
          onClick={closeVideo}
        >
          <div
            ref={containerRef}
            className="
              relative
              w-full
              max-w-5xl
              h-full
              max-h-[92vh]
              flex
              items-center
              justify-center
              bg-black
              rounded-xl
              overflow-hidden
              cursor-default
            "
            onClick={(e) => {
              e.stopPropagation();
              showVideoControls();
            }}
            onMouseMove={showVideoControls}
            onMouseEnter={showVideoControls}
            onTouchStart={showVideoControls}
          >
            {/* VIDEO */}
            <video
              ref={videoRef}
              src={src}
              className="
                max-h-full
                max-w-full
                w-full
                h-full
                object-contain
              "
              playsInline
              preload="metadata"
              onLoadStart={handleLoadStart}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleCanPlay}
              onWaiting={handleWaiting}
              onPlaying={handlePlaying}
              onTimeUpdate={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              onClick={togglePlay}
            />

            {/* LOADING */}
            {loading && (
              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  pointer-events-none
                  z-30
                "
              >
                <Loader2
                  size={42}
                  className="
                    animate-spin
                    text-white
                  "
                />
              </div>
            )}

            {/* TOP CONTROLS */}
            {showControls && (
            <div
              className="
                absolute
                top-0
                left-0
                right-0
                flex
                items-center
                justify-between
                px-4
                py-4
                bg-gradient-to-b
                from-black/80
                to-transparent
                z-20
              "
            >
              {/* LEFT */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                {/* MUTE */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-black/60
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-black/80
                  "
                >
                  {muted || volume === 0 ? (
                    <VolumeX size={19} />
                  ) : (
                    <Volume2 size={19} />
                  )}
                </button>

                {/* THIN SPEAKER RANGE */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    w-20
                    h-1
                    accent-white
                    cursor-pointer
                  "
                  aria-label="Volume"
                />

                {/* SPEED SELECT */}
                <select
                  value={speed}
                  onChange={handleSpeed}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    h-9
                    rounded-lg
                    bg-black/70
                    text-white
                    text-xs
                    px-2
                    border
                    border-white/20
                    outline-none
                    cursor-pointer
                  "
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                {/* FULLSCREEN */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-black/60
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-black/80
                  "
                >
                  <Maximize size={19} />
                </button>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closeVideo}
                  className="
                    w-9
                    h-9
                    rounded-full
                    bg-black/60
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-red-600
                  "
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            )}

            {/* CENTER PLAY */}
           {showControls && !playing && !loading && (
              <button
                type="button"
                onClick={togglePlay}
                className="
                  absolute
                  left-1/2
                  top-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  w-16
                  h-16
                  rounded-full
                  bg-black/60
                  text-white
                  flex
                  items-center
                  justify-center
                  z-20
                  hover:bg-black/80
                "
              >
                <Play
                  size={30}
                  fill="white"
                  className="ml-1"
                />
              </button>
            )} 

            {/* BOTTOM CONTROLS */}
            {showControls && (
            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                px-4
                pb-4
                pt-12
                bg-gradient-to-t
                from-black/90
                to-transparent
                z-20
              "
            >
              {/* PLAY + TIME */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  text-white
                  text-xs
                  mb-2
                "
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  className="
                    w-8
                    h-8
                    flex
                    items-center
                    justify-center
                  "
                >
                  {playing ? (
                    <Pause size={18} />
                  ) : (
                    <Play
                      size={18}
                      fill="white"
                    />
                  )}
                </button>

                <span>
                  {formatTime(currentTime)}
                </span>

                <span className="text-white/50">
                  /
                </span>

                <span>
                  {formatTime(duration)}
                </span>
              </div>

              {/* THIN DRAG / PROGRESS RANGE */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                className="
                  w-full
                  h-1
                  accent-white
                  cursor-pointer
                "
                aria-label="Video progress"
              />
            </div>
            )}
          </div>
          
        </div>
        
      )}
    </>
  );
}