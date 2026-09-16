import { useEffect, useRef, useState, useCallback } from "react";
import PostOptionsId from "./PostOptionId";
import VideoCommentReactionShare from "./previewimagevideo/VideoCommentReactionShare";

export default function PostVideoPreview({
  post,
  chats,
  currentUser,
  total_reaction,
  me,
  commentsByPost,
  setCommentsByPost,
  reactionList,
  reactionLoading,
  myReaction,
  toggleReaction,
  onLikeClick,

  setEmojiList,
  focusCommentInput,

  emojiList,

  showEmoji,
  setShowEmoji,
  loading,
  newComment,
  setNewComment,
  commentInputRef,
  postComments,
  setPostComments,
  getColor,
  setShowReactions,
  showReactions,
  showUsersPopup,
  setShowUsersPopup,
  showEmojiPicker,
  setShowEmojiPicker,
  allUsers,
  firstUser,
  counts,
  others,
  setLoading,
  setPostIdModal,
  setShares,
  shares,
  setMessageOpenShare,
  handleShare,
  sending,
  messageOpenShare,
  selectedChats,
  setSelectedChats,
  setSending,
  shareToChat,
  postIdModal,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const touchStartX = useRef(null);

  // =========================================================
  // CUSTOM VIDEO PREVIEW
  // =========================================================

  const previewVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const [showOverlay, setShowOverlay] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);

  // =========================================================
  // VIDEO LIST !videos
  // =========================================================

  const videos = Array.isArray(post?.media)
    ? post.media.filter((m) => m.type === "video")
    : [];


  const currentVideo = videos[previewIndex];

  const showVideoControls = useCallback(() => {
    setShowOverlay(true);

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (isPlaying && !videoLoading) {
      controlsTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
        setShowSpeed(false);
      }, 2500);
    }
  }, [isPlaying, videoLoading]);


  
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

 
  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePreview();
      }

      if (
        e.key === "ArrowLeft" &&
        previewIndex > 0
      ) {
        goPrevious();
      }

      if (
        e.key === "ArrowRight" &&
        previewIndex < videos.length - 1
      ) {
        goNext();
      }

      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    previewOpen,
    previewIndex,
    videos.length,
  ]);

  // =========================================================
  // AUTOPLAY CURRENT VIDEO
  // =========================================================

  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const video = previewVideoRef.current;

    if (!video) {
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setVideoLoading(true);
    setShowOverlay(true);
    setShowSpeed(false);
    setIsSeeking(false);

    video.currentTime = 0;
    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const attemptPlay = video.play();

    if (attemptPlay?.catch) {
      attemptPlay.catch(async () => {
        try {
          video.muted = true;

          setIsMuted(true);

          await video.play();
        } catch {
          // Browser prevented autoplay.
        }
      });
    }

    return () => {
      try {
        video.pause();
      } catch {}
    };
  }, [
    previewOpen,
    currentVideo?.id,
  ]);

  // =========================================================
  // KEEP VOLUME IN SYNC
  // =========================================================

  useEffect(() => {
    if (!previewVideoRef.current) {
      return;
    }

    previewVideoRef.current.volume = volume;
    previewVideoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  // =========================================================
  // KEEP SPEED IN SYNC
  // =========================================================

  useEffect(() => {
    if (!previewVideoRef.current) {
      return;
    }

    previewVideoRef.current.playbackRate =
      playbackRate;
  }, [playbackRate]);



  const formatTime = (value) => {
    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };
  // =========================================================
  // OPEN PREVIEW
  // =========================================================

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewOpen(true);

    setShowOverlay(true);
    setShowSpeed(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setVideoLoading(true);
  };
 
  const closePreview = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (previewVideoRef.current) {
      try {
        previewVideoRef.current.pause();
      } catch {}
    }

    setPreviewOpen(false);
    setShowSpeed(false);
    setShowOverlay(true);
    setIsPlaying(false);
    setVideoLoading(false);
    setIsSeeking(false);
  };

  // =========================================================
  // PREVIOUS
  // =========================================================

  const goPrevious = () => {
    setPreviewIndex((prev) =>
      Math.max(prev - 1, 0)
    );

    setShowOverlay(true);
    setShowSpeed(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setVideoLoading(true);
  };

  // =========================================================
  // NEXT
  // =========================================================

  const goNext = () => {
    setPreviewIndex((prev) =>
      Math.min(prev + 1, videos.length - 1)
    );

    setShowOverlay(true);
    setShowSpeed(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setVideoLoading(true);
  };

  // =========================================================
  // KEYBOARD NAVIGATION
  // =========================================================

  // =========================================================
  // VIDEO METADATA
  // =========================================================

  const handleLoadedMetadata = (e) => {
    const video = e.currentTarget;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }

    setCurrentTime(video.currentTime || 0);
    setVideoLoading(false);
  };

  // =========================================================
  // CAN PLAY
  // =========================================================

  const handleVideoCanPlay = (e) => {
    const video = e.currentTarget;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }

    setVideoLoading(false);
  };

  // =========================================================
  // PLAYING
  // =========================================================

  const handleVideoPlaying = (e) => {
    const video = e.currentTarget;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }

    setIsPlaying(true);
    setVideoLoading(false);

    showVideoControls();
  };

  // =========================================================
  // WAITING
  // =========================================================

  const handleVideoWaiting = () => {
    setVideoLoading(true);
  };

  // =========================================================
  // PAUSE
  // =========================================================

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  // =========================================================
  // TIME UPDATE
  // =========================================================

  const handleTimeUpdate = (e) => {
    const video = e.currentTarget;

    if (!isSeeking) {
      setCurrentTime(
        video.currentTime || 0
      );
    }

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  // =========================================================
  // VIDEO ENDED
  // =========================================================

  const handleVideoEnded = (e) => {
    const video = e.currentTarget;

    setCurrentTime(video.duration || 0);
    setIsPlaying(false);
    setShowOverlay(true);
    setShowSpeed(false);

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  // =========================================================
  // PLAY / PAUSE
  // =========================================================

  const togglePlay = async (e) => {
    e?.stopPropagation();

    const video = previewVideoRef.current;

    if (!video) {
      return;
    }

    try {
      if (video.paused || video.ended) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {}

    showVideoControls();
  };

  // =========================================================
  // MUTE
  // =========================================================

  const toggleMute = (e) => {
    e.stopPropagation();

    const video = previewVideoRef.current;

    const nextMuted = !isMuted;

    setIsMuted(nextMuted);

    if (video) {
      video.muted = nextMuted;
    }

    showVideoControls();
  };

  // =========================================================
  // VOLUME
  // =========================================================

  const handleVolumeChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setVolume(value);

    if (previewVideoRef.current) {
      previewVideoRef.current.volume =
        value;
    }

    if (value > 0) {
      setIsMuted(false);

      if (previewVideoRef.current) {
        previewVideoRef.current.muted =
          false;
      }
    } else {
      setIsMuted(true);

      if (previewVideoRef.current) {
        previewVideoRef.current.muted =
          true;
      }
    }

    showVideoControls();
  };
 
  const handleSeekStart = (e) => {
    e.stopPropagation();

    setIsSeeking(true);
    showVideoControls();
  };
 
  const handleSeekChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setCurrentTime(value);

    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime =
        value;
    }

    showVideoControls();
  };
 
  const handleSeekEnd = (e) => {
    e.stopPropagation();

    setIsSeeking(false);
    showVideoControls();
  };
 
  const handleFullscreen = async (e) => {
    e.stopPropagation();

    const container =
      videoContainerRef.current;

    if (!container) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (
        container.requestFullscreen
      ) {
        await container.requestFullscreen();
      }
    } catch {}

    showVideoControls();
  };
 
  const handleTouchStart = (e) => {
    if (!e.touches?.length) {
      return;
    }

    touchStartX.current =
      e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (
      touchStartX.current === null ||
      !e.changedTouches?.length
    ) {
      return;
    }

    const touchEndX =
      e.changedTouches[0].clientX;

    const deltaX =
      touchEndX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(deltaX) < 50) {
      return;
    }

    if (deltaX < 0) {
      if (
        previewIndex <
        videos.length - 1
      ) {
        goNext();
      }
    } else {
      if (previewIndex > 0) {
        goPrevious();
      }
    }
  };
 

  const handlePreviewBackgroundClick = (
    e
  ) => {
    if (e.target === e.currentTarget) {
      closePreview();
    }
  };

  
  if (!videos.length) {
    return null;
  }

  return (
    <>
      {/* =====================================================
          VIDEO LIST
      ====================================================== */}

      {videos.map((video, index) => (
        <div
          key={video.id}
          className="px-4 cursor-pointer"
          onClick={() =>
            openPreview(index)
          }
        >
          <video
            src={video.url}
            className="
              w-full
              h-64
              object-cover
              rounded-lg
            "
            muted
            playsInline
          />
        </div>
      ))}

      {/* =====================================================
          FULL SCREEN PREVIEW
      ====================================================== */}

      {previewOpen && currentVideo && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/90
            flex
            items-center
            justify-center
          "
          onClick={
            handlePreviewBackgroundClick
          }
        >
          {/* =================================================
              TOP RIGHT
          ================================================== */}

          <div
            className={`
              absolute
              top-4
              right-4
              z-[300]
              flex
              items-center
              gap-3
              transition-all
              duration-200
              ${
                showOverlay
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }
            `}
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closePreview();
              }}
              className="
                w-10
                h-10
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                shadow-lg
                hover:bg-gray-200
              "
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path
                  d="M6 6l12 12M18 6 6 18"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* POST OPTIONS */}

            <div
              className="
                rounded-full
                shadow-lg
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <PostOptionsId
                post={post}
                chats={chats}
              />
            </div>
          </div>

          {/* =================================================
              VIDEO CONTAINER
          ================================================== */}

          <div
            ref={videoContainerRef}
            className="
                    relative
                    h-full
                    w-full
                    max-w-xl
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    bg-neutral-900
                    sm:rounded-2xl
                    shadow-2xl
                    select-none
                    touch-none
                "
            onTouchStart={
              handleTouchStart
            }
            onTouchEnd={handleTouchEnd}
            onMouseMove={
              showVideoControls
            }
            onMouseEnter={
              showVideoControls
            }
            onMouseLeave={() => {
              if (
                isPlaying &&
                !videoLoading
              ) {
                if (
                  controlsTimerRef.current
                ) {
                  clearTimeout(
                    controlsTimerRef.current
                  );
                }

                controlsTimerRef.current =
                  setTimeout(() => {
                    setShowOverlay(false);
                    setShowSpeed(false);
                  }, 1200);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              showVideoControls();
            }}
          >
            {/* =================================================
                VIDEO
            ================================================== */}

            <video
              key={currentVideo.id}
              ref={previewVideoRef}
              src={currentVideo.url}
              className="
                w-full
                max-h-[90vh] 
                object-contain
                rounded-lg
              "
              playsInline
              preload="metadata"
              onLoadedMetadata={
                handleLoadedMetadata
              }
              onDurationChange={
                handleLoadedMetadata
              }
              onCanPlay={
                handleVideoCanPlay
              }
              onPlaying={
                handleVideoPlaying
              }
              onWaiting={
                handleVideoWaiting
              }
              onPause={
                handleVideoPause
              }
              onTimeUpdate={
                handleTimeUpdate
              }
              onEnded={
                handleVideoEnded
              }
            />

            {/* =================================================
                LOADING
            ================================================== */}

            {videoLoading && (
              <div className="
                absolute
                inset-0
                z-[120]
                flex
                items-center
                justify-center
                pointer-events-none
              ">
                <span className="
                  w-10
                  h-10
                  border-4
                  border-white/30
                  border-t-white
                  rounded-full
                  animate-spin
                " />
              </div>
            )}

            {/* =================================================
                TOP VIDEO CONTROLS
            ================================================== */}

            <div
              className={`
                absolute
                top-3
                left-3
                right-3
                z-[140]
                flex
                items-start
                justify-between
                transition-all
                duration-200
                ${
                  showOverlay
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }
              `}
            >
              {/* AUDIO */}

              <div className="flex items-center sm:gap-2 gap-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-black/60
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-black/80
                    transition
                  "
                  title={
                    isMuted
                      ? "Unmute"
                      : "Mute"
                  }
                >
                  {isMuted ||
                  volume === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />

                      <path
                        d="m17 9-5 6m0-6 5 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />

                      <path
                        d="M14.5 8.5a5 5 0 0 1 0 7"
                        strokeLinecap="round"
                      />

                      <path
                        d="M17 6.5a8 8 0 0 1 0 11"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>

                {/* THIN VOLUME RANGE */}

                <div
                  className="w-24 sm:w-28"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={
                      isMuted ? 0 : volume
                    }
                    onChange={
                      handleVolumeChange
                    }
                    className="
                      w-full
                      h-[3px]
                      accent-white
                      cursor-pointer
                    "
                  />
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div className="flex items-center gap-2 mr-24 sm:mr-24">
                {/* SPEED */}

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowSpeed(
                        (prev) => !prev
                      );

                      showVideoControls();
                    }}
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-black/60
                      text-white
                      flex
                      items-center
                      justify-center
                      hover:bg-black/80
                      transition
                    "
                    title="Playback speed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path
                        d="M12 8v4l3 2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M12 3a9 9 0 1 1-8.49 6"
                        strokeLinecap="round"
                      />

                      <path
                        d="M3 4v5h5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* SPEED RANGE */}

                  {showSpeed && (
                    <div
                      className="
                        absolute
                        top-12
                        right-0
                        w-44
                        rounded-lg
                        bg-black/85
                        px-3
                        py-2
                        text-white
                        shadow-xl
                      "
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      <div className="
                        flex
                        items-center
                        justify-between
                        text-[11px]
                        mb-1
                      ">
                        <span>0.5x</span>

                        <span className="font-semibold">
                          {playbackRate}x
                        </span>

                        <span>2x</span>
                      </div>

                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.25"
                        value={playbackRate}
                        onChange={(e) => {
                          setPlaybackRate(
                            Number(
                              e.target.value
                            )
                          );

                          showVideoControls();
                        }}
                        className="
                          w-full
                          h-[3px]
                          accent-white
                          cursor-pointer
                        "
                      />
                    </div>
                  )}
                </div>

                {/* FULLSCREEN */}

                <button
                  type="button"
                  onClick={
                    handleFullscreen
                  }
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-black/60
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-black/80
                    transition
                  "
                  title="Fullscreen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-5 h-5"
                  >
                    <path
                      d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* =================================================
                CENTER PLAY / PAUSE
            ================================================== */}

            <button
              type="button"
              onClick={togglePlay}
              className={`
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                z-[125]
                w-14
                h-14
                rounded-full
                bg-black/60
                text-white
                flex
                items-center
                justify-center
                hover:bg-black/75
                transition-all
                ${
                  showOverlay
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }
              `}
              title={
                isPlaying
                  ? "Pause"
                  : "Play"
              }
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7"
                >
                  <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* =================================================
                BOTTOM PROGRESS
            ================================================== */}

            <div
              className={`
                absolute
                bottom-3
                left-3
                right-3
                sm:left-5
                sm:right-5
                z-[140]
                transition-all
                duration-200
                ${
                  showOverlay
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }
              `}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="
                flex
                items-center
                gap-2
                text-white
                text-[11px]
              ">
                <span className="w-10 shrink-0">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={
                    duration > 0
                      ? duration
                      : 1
                  }
                  step="0.01"
                  value={
                    duration > 0
                      ? Math.min(
                          currentTime,
                          duration
                        )
                      : 0
                  }
                  onMouseDown={
                    handleSeekStart
                  }
                  onTouchStart={
                    handleSeekStart
                  }
                  onChange={
                    handleSeekChange
                  }
                  onMouseUp={
                    handleSeekEnd
                  }
                  onTouchEnd={
                    handleSeekEnd
                  }
                  disabled={!duration}
                  className="
                    flex-1
                    h-[3px]
                    accent-white
                    cursor-pointer
                  "
                />

                <span className="
                  w-10
                  shrink-0
                  text-right
                ">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* =================================================
                REACTION / COMMENT / SHARE
            ================================================== */}

            <div className="
              absolute
              right-0
              top-1/2
              -translate-y-1/2
              flex
              flex-col
              items-center
              gap-2
              z-[250]
            ">
              <VideoCommentReactionShare
                post={post}
                counts={counts}
                total={total_reaction}
                me={me}
                firstUser={firstUser}
                others={others}
                allUsers={allUsers}
                myReaction={myReaction}
                reactionList={reactionList}
                reactionLoading={
                  reactionLoading
                }
                toggleReaction={
                  toggleReaction
                }
                onLikeClick={
                  onLikeClick
                }
                showReactions={
                  showReactions
                }
                setShowReactions={
                  setShowReactions
                }
                showEmojiPicker={
                  showEmojiPicker
                }
                setShowEmojiPicker={
                  setShowEmojiPicker
                }
                showUsersPopup={
                  showUsersPopup
                }
                setShowUsersPopup={
                  setShowUsersPopup
                }
                currentUser={
                  currentUser
                }
                getColor={getColor}
                postComments={
                  postComments
                }
                setPostComments={
                  setPostComments
                }
                commentsByPost={
                  commentsByPost
                }
                setCommentsByPost={
                  setCommentsByPost
                }
                commentInputRef={
                  commentInputRef
                }
                focusCommentInput={
                  focusCommentInput
                }
                newComment={newComment}
                setNewComment={
                  setNewComment
                }
                loading={loading}
                setLoading={setLoading}
                showEmoji={showEmoji}
                setShowEmoji={
                  setShowEmoji
                }
                emojiList={emojiList}
                setEmojiList={
                  setEmojiList
                }
                chats={chats}
                setPostIdModal={
                  setPostIdModal
                }
                shares={shares}
                setShares={setShares}
                setMessageOpenShare={
                  setMessageOpenShare
                }
                handleShare={handleShare}
                sending={sending}
                messageOpenShare={
                  messageOpenShare
                }
                selectedChats={
                  selectedChats
                }
                setSelectedChats={
                  setSelectedChats
                }
                setSending={setSending}
                shareToChat={shareToChat}
                postIdModal={
                  postIdModal
                }
                setOpen={
                  setPreviewOpen
                }
              />
            </div>

            {/* =================================================
                PREVIOUS
            ================================================== */}

            {previewIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevious();
                }}
                className="
                  hidden
                  md:flex
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  z-[280]
                  w-11
                  h-11
                  rounded-full
                  border-2
                  border-white
                  bg-black/50
                  text-white
                  items-center
                  justify-center
                  hover:bg-black/80
                  transition
                "
                title="Previous video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <path
                    d="m15 18-6-6 6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* =================================================
                NEXT
            ================================================== */}

            {previewIndex <
              videos.length - 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="
                  hidden
                  md:flex
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  z-[280]
                  w-11
                  h-11
                  rounded-full
                  border-2
                  border-white
                  bg-black/50
                  text-white
                  items-center
                  justify-center
                  hover:bg-black/80
                  transition
                "
                title="Next video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <path
                    d="m9 18 6-6-6-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* =================================================
              COUNTER
          ================================================== */}

          {videos.length > 1 && (
            <div className="
              absolute
              bottom-6
              left-1/2
              -translate-x-1/2
              bg-black/60
              text-white
              text-xs
              px-3
              py-1
              rounded-full
              z-[290]
            ">
              {previewIndex + 1} /{" "}
              {videos.length}
            </div>
          )}

          {/* =================================================
              MOBILE SWIPE HINT
          ================================================== */}

          {videos.length > 1 && (
            <div className="
              md:hidden
              absolute
              bottom-14
              left-1/2
              -translate-x-1/2
              text-white/70
              text-xs
              z-[290]
              pointer-events-none
            ">
              Swipe left or right
            </div>
          )}
        </div>
      )}
    </>
  );
}