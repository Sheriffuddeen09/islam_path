import { useRef, useState, useEffect, useCallback } from "react";
import api from "../../Api/axios";
import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import ProfileVideoCommentReactionShare from "../../pages/post/previewimagevideo/ProfileVideoCommentReactionShare";

export default function PostVideoCardProfile({
  v,
  post,
  setEditContent,
  setSelectedPost,
  setShowEditModal,
  setShowDeleteModal,
  chats,
  selectedPost,
  loadingProfile,
  showDeleteModal,
  handleDelete,
  setPosts,
  fetchProfile,
  commentsByPost,
  setCommentsByPost,
  currentUser,
  total_reaction,
  me,
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
  handleShare,
  sending,
  messageOpenShare,
  selectedChats,
  setSelectedChats,
  shareToChat,
  postIdModal,
  setSending,
  setMessageOpenShare,
}) {
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [openOption, setOpenOption] = useState(false);

  const viewedRef = useRef(false);

  /* -------------------------------------------------
     PREVIEW VIDEO STATES
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     FORMAT TIME
  ------------------------------------------------- */

  const formatTime = (value) => {
    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  /* -------------------------------------------------
     OPTIONS
  ------------------------------------------------- */

  const handleOption = () => {
    setOpenOption((prev) => !prev);
  };

  /* -------------------------------------------------
     CARD VIDEO OBSERVER
  ------------------------------------------------- */

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          videoRef.current.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      {
        threshold: 0.6,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  /* -------------------------------------------------
     MARK POST VIDEO AS VIEWED
  ------------------------------------------------- */

  const onPlay = async () => {
    if (viewedRef.current) return;

    viewedRef.current = true;

    try {
      await api.post(`/api/post/${post.id}/view`);
    } catch (error) {
      console.error("Failed to mark video as viewed:", error);
    }
  };

  /* -------------------------------------------------
     SHOW CONTROLS
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     CLEAN CONTROL TIMER
  ------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  /* -------------------------------------------------
     VIDEO CONTROL VISIBILITY
  ------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

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
  }, [open, isPlaying, videoLoading]);

  /* -------------------------------------------------
     AUTO PLAY PREVIEW
  ------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const video = previewVideoRef.current;

    if (!video) return;

    setDuration(0);
    setCurrentTime(0);
    setVideoLoading(true);
    setIsPlaying(false);
    setShowOverlay(true);
    setShowSpeed(false);

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        /*
         Browser may block autoplay when audio is enabled.
         Retry muted.
        */
        try {
          video.muted = true;
          setIsMuted(true);

          await video.play();
        } catch (error2) {
          console.error("Preview autoplay failed:", error2);
        }
      }
    };

    playVideo();

    return () => {
      try {
        video.pause();
      } catch (error) {}
    };
  }, [open, v.url]);

  /* -------------------------------------------------
     VOLUME
  ------------------------------------------------- */

  useEffect(() => {
    if (!previewVideoRef.current) return;

    previewVideoRef.current.volume = volume;
    previewVideoRef.current.muted = isMuted;
  }, [volume, isMuted]);

  /* -------------------------------------------------
     PLAYBACK SPEED
  ------------------------------------------------- */

  useEffect(() => {
    if (!previewVideoRef.current) return;

    previewVideoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  /* -------------------------------------------------
     PLAY / PAUSE
  ------------------------------------------------- */

  const togglePlay = async (e) => {
    e?.stopPropagation();

    const video = previewVideoRef.current;

    if (!video) return;

    try {
      if (video.paused || video.ended) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Video play/pause error:", error);
    }

    showVideoControls();
  };

  /* -------------------------------------------------
     MUTE
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     VOLUME RANGE
  ------------------------------------------------- */

  const handleVolumeChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) return;

    setVolume(value);

    const video = previewVideoRef.current;

    if (video) {
      video.volume = value;
    }

    if (value > 0) {
      setIsMuted(false);

      if (video) {
        video.muted = false;
      }
    } else {
      setIsMuted(true);

      if (video) {
        video.muted = true;
      }
    }

    showVideoControls();
  };

  /* -------------------------------------------------
     SEEK START
  ------------------------------------------------- */

  const handleSeekStart = (e) => {
    e.stopPropagation();

    setIsSeeking(true);

    showVideoControls();
  };

  /* -------------------------------------------------
     SEEK CHANGE
  ------------------------------------------------- */

  const handleSeekChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) return;

    setCurrentTime(value);

    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = value;
    }

    showVideoControls();
  };

  /* -------------------------------------------------
     SEEK END
  ------------------------------------------------- */

  const handleSeekEnd = (e) => {
    e.stopPropagation();

    setIsSeeking(false);

    showVideoControls();
  };

  /* -------------------------------------------------
     VIDEO METADATA
  ------------------------------------------------- */

  const handleLoadedMetadata = (e) => {
    const video = e.currentTarget;

    const videoDuration = video.duration;

    if (
      Number.isFinite(videoDuration) &&
      videoDuration > 0
    ) {
      setDuration(videoDuration);
    }

    setCurrentTime(video.currentTime || 0);
    setVideoLoading(false);
  };

  /* -------------------------------------------------
     CAN PLAY
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     PLAYING
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     WAITING / BUFFERING
  ------------------------------------------------- */

  const handleVideoWaiting = () => {
    setVideoLoading(true);
  };

  /* -------------------------------------------------
     PAUSE
  ------------------------------------------------- */

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  /* -------------------------------------------------
     TIME UPDATE
  ------------------------------------------------- */

  const handleTimeUpdate = (e) => {
    const video = e.currentTarget;

    if (!isSeeking) {
      setCurrentTime(video.currentTime || 0);
    }

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /* -------------------------------------------------
     DURATION CHANGE
  ------------------------------------------------- */

  const handleDurationChange = (e) => {
    const video = e.currentTarget;

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /* -------------------------------------------------
     VIDEO END
  ------------------------------------------------- */

  const handleVideoEnded = (e) => {
    const video = e.currentTarget;

    setCurrentTime(video.duration || 0);
    setIsPlaying(false);
    setShowOverlay(true);

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /* -------------------------------------------------
     FULLSCREEN
  ------------------------------------------------- */

  const handleFullscreen = async (e) => {
    e.stopPropagation();

    const container = videoContainerRef.current;

    if (!container) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }

    showVideoControls();
  };

  /* -------------------------------------------------
     CLOSE PREVIEW
  ------------------------------------------------- */

  const closePreview = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }

    setIsPlaying(false);
    setShowOverlay(true);
    setShowSpeed(false);
    setOpen(false);
    setOpenOption(false);
  };

  return (
    <>
      {/* =====================================================
          PROFILE VIDEO CARD
      ===================================================== */}

      <div
        className="relative aspect-video bg-black cursor-pointer rounded overflow-hidden"
        onClick={() => setOpen(true)}
      >
        <video
          ref={videoRef}
          src={v.url}
          className="w-full h-72 object-cover"
          muted
          playsInline
          preload="metadata"
          onPlay={onPlay}
        />

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 p-2 rounded-full text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          PREVIEW MODAL
      ===================================================== */}

      {open && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* =================================================
                TOP RIGHT BUTTONS
            ================================================= */}

            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[200] flex items-center gap-3">
              {/* CLOSE */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closePreview();
                }}
                className="text-black bg-white text-xl p-1 sm:w-10 w-8 sm:h-10 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* OPTIONS */}
              <button
                type="button"
                onClick={handleOption}
                className="sm:w-10 w-8 sm:h-10 h-8 flex items-center justify-center text-black bg-white rounded-full hover:bg-gray-100 transition shadow-lg"
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
                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                  />
                </svg>
              </button>

              {/* OPTIONS MENU */}
              {openOption && (
                <div className="absolute top-12 left-0 w-40 bg-white border rounded-lg shadow-xl overflow-hidden z-[250]">
                  {post.content &&
                    post.content.trim() !== "" && (
                      <button
                        type="button"
                        className="flex items-center gap-2 font-bold text-[15px] w-full px-3 py-2.5 hover:text-gray-600 text-gray-800 hover:bg-gray-50"
                        onClick={() => {
                          setSelectedPost(post);
                          setEditContent(post.content);
                          setShowEditModal(true);
                          handleOption();
                        }}
                      >
                        Edit
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowDeleteModal(true);
                      handleOption();
                    }}
                    className="flex items-center gap-2 font-bold text-[15px] w-full px-3 py-2.5 hover:text-gray-600 text-gray-800 hover:bg-gray-50"
                  >
                    Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOption();
                      setShares(!shares);
                    }}
                    className="flex items-center gap-2 font-bold text-[15px] w-full px-3 py-2.5 hover:text-gray-600 text-gray-800 hover:bg-gray-50"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>

            {/* =================================================
                VIDEO CONTAINER
            ================================================= */}

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
              onMouseMove={showVideoControls}
              onMouseEnter={showVideoControls}
              onClick={showVideoControls}
            >
              {/* =================================================
                  VIDEO
              ================================================= */}

              <video
                ref={previewVideoRef}
                src={v.url}
                className="w-full h-full object-contain"
                playsInline
                preload="metadata"
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleVideoCanPlay}
                onDurationChange={handleDurationChange}
                onPlaying={handleVideoPlaying}
                onWaiting={handleVideoWaiting}
                onPause={handleVideoPause}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
              />

              {/* =================================================
                  LOADING
              ================================================= */}

              {videoLoading && (
                <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
                  <span className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* =================================================
                  TOP VIDEO CONTROLS
              ================================================= */}

              <div
                className={`
                  absolute
                  top-3
                  right-3
                  z-[140]
                  flex
                  items-center
                  justify-end
                  gap-1 sm:gap-2
                  transition-all
                  duration-300
                  ${
                    showOverlay
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2 pointer-events-none"
                  }
                `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* MUTE */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m3 3 18 18M10.5 6.5 8 9H5v6h3l4 4v-5.5M16 9.5a4 4 0 0 1 0 5"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 9v6h4l5 4V5l-5 4H5Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 8.5a6 6 0 0 1 0 7"
                      />
                    </svg>
                  )}
                </button>

                {/* VOLUME RANGE */}
                <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 h-10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 9v6h4l5 4V5l-5 4H5Z"
                    />
                  </svg>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-[3px] accent-white cursor-pointer"
                  />
                </div>

                {/* SPEED */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeed((prev) => !prev);
                    showVideoControls();
                  }}
                  className="h-10 px-3 rounded-full bg-black/60 text-white text-xs font-semibold hover:bg-black/80 transition"
                >
                  {playbackRate}x
                </button>

                {/* FULLSCREEN */}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
                    />
                  </svg>
                </button>

                {/* SPEED RANGE */}
                {showSpeed && (
                  <div
                    className="absolute top-12 right-10 w-48 bg-black/90 rounded-lg px-3 py-3 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between text-white text-xs mb-2">
                      <span>Speed</span>
                      <span className="font-bold">
                        {playbackRate}x
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={playbackRate}
                      onChange={(e) => {
                        setPlaybackRate(Number(e.target.value));
                        showVideoControls();
                      }}
                      className="w-full h-[3px] accent-white cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] text-white/70 mt-1">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>1.5x</span>
                      <span>2x</span>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  CENTER PLAY / PAUSE
              ================================================= */}

              <button
                type="button"
                onClick={togglePlay}
                className={`
                  absolute
                  left-1/2
                  top-1/2
                  -translate-x-1/2
                  -translate-y-1/2
                  z-[130]
                  w-16
                  h-16
                  rounded-full
                  bg-black/60
                  text-white
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  hover:bg-black/80
                  ${
                    showOverlay
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90 pointer-events-none"
                  }
                `}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8"
                  >
                    <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 ml-1"
                  >
                    <path d="M8 5v14l11-7-11-7Z" />
                  </svg>
                )}
              </button>

              {/* =================================================
                  BOTTOM PROGRESS
              ================================================= */}

              <div
                className={`
                  absolute
                  left-3
                  right-3
                  bottom-3
                  sm:left-5
                  sm:right-5
                  z-[140]
                  transition-all
                  duration-300
                  ${
                    showOverlay
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 text-white text-[11px]">
                  <span className="w-10 shrink-0">
                    {formatTime(currentTime)}
                  </span>

                  <input
                    type="range"
                    min="0"
                    max={duration > 0 ? duration : 1}
                    step="0.01"
                    value={
                      duration > 0
                        ? Math.min(currentTime, duration)
                        : 0
                    }
                    onMouseDown={handleSeekStart}
                    onTouchStart={handleSeekStart}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                    disabled={!duration}
                    className="flex-1 h-[3px] accent-white cursor-pointer"
                  />

                  <span className="w-10 text-right shrink-0">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                REACTION / COMMENT / SHARE
            ================================================= */}

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-[160]">
              <ProfileVideoCommentReactionShare
                post={post}
                counts={counts}
                total={total_reaction}
                me={me}
                firstUser={firstUser}
                others={others}
                allUsers={allUsers}
                myReaction={myReaction}
                reactionList={reactionList}
                reactionLoading={reactionLoading}
                toggleReaction={toggleReaction}
                onLikeClick={onLikeClick}
                showReactions={showReactions}
                setShowReactions={setShowReactions}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                showUsersPopup={showUsersPopup}
                setShowUsersPopup={setShowUsersPopup}
                currentUser={currentUser}
                getColor={getColor}
                postComments={postComments}
                setPostComments={setPostComments}
                commentsByPost={commentsByPost}
                setCommentsByPost={setCommentsByPost}
                commentInputRef={commentInputRef}
                focusCommentInput={focusCommentInput}
                newComment={newComment}
                setNewComment={setNewComment}
                loading={loading}
                setLoading={setLoading}
                showEmoji={showEmoji}
                setShowEmoji={setShowEmoji}
                emojiList={emojiList}
                setEmojiList={setEmojiList}
                chats={chats}
                setPostIdModal={setPostIdModal}
                shares={shares}
                setShares={setShares}
                setMessageOpenShare={setMessageOpenShare}
                handleShare={handleShare}
                sending={sending}
                messageOpenShare={messageOpenShare}
                selectedChats={selectedChats}
                setSelectedChats={setSelectedChats}
                setSending={setSending}
                shareToChat={shareToChat}
                postIdModal={postIdModal}
                setOpen={setOpen}
              />
            </div>
          </div>
        </div>
      )}
{shares && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-sm
        relative
        shadow-2xl
        border
        border-gray-200/20
      "
    >

      {/* ========================================================= */}
      {/* CLOSE                                                     */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => setShares(false)}
        className="
          absolute
          right-3
          top-3
          w-8
          h-8
          rounded-full
          bg-gray-800
          text-white
          flex
          items-center
          justify-center
          hover:bg-red-500
          transition
        "
      >
        <X size={17} />
      </button>

      {/* ========================================================= */}
      {/* TITLE                                                     */}
      {/* ========================================================= */}

      <div className="text-center mb-5">
        <h2 className="text-lg font-bold">
          Share
        </h2>

        <p className="text-xs opacity-60 mt-1">
          Choose how you want to share this
        </p>
      </div>

      {/* ========================================================= */}
      {/* CHAT LIST                                                  */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(true);
          setShares(false);
        }}
        className="
          w-full
          flex
          items-center
          gap-3
          p-3
          rounded-xl
          border
          border-gray-200/20
          hover:bg-blue-50
          hover:text-blue-600
          transition
          mb-4
        "
      >
        <div
          className="
            w-11
            h-11
            rounded-full
            bg-blue-100
            text-blue-600
            flex
            items-center
            justify-center
          "
        >
          <MessageCircle size={23} />
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-sm">
            Chat List
          </div>

          <div className="text-xs opacity-60">
            Share with your chats
          </div>
        </div>
      </button>

      {/* ========================================================= */}
      {/* SOCIAL SHARE                                               */}
      {/* ========================================================= */}

      <div className="border-t border-gray-200/20 pt-4">

        <div className="
          grid
          grid-cols-4
          gap-2
          text-center
        ">

          <button
            type="button"
            onClick={() =>
              handleShare("facebook")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-600
              transition
            "
          >
            <FaFacebook size={25} />

            <span className="text-[11px]">
              Facebook
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("whatsapp")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-green-50
              hover:text-green-500
              transition
            "
          >
            <FaWhatsapp size={25} />

            <span className="text-[11px]">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("twitter")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-sky-50
              hover:text-sky-500
              transition
            "
          >
            <FaTwitter size={25} />

            <span className="text-[11px]">
              Twitter
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("telegram")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-400
              transition
            "
          >
            <FaTelegram size={25} />

            <span className="text-[11px]">
              Telegram
            </span>
          </button>

        </div>
      </div>
    </div>
  </div>
)}


{/* ============================================================= */}
{/* SHARE TO CHAT MODAL                                           */}
{/* ============================================================= */}

{messageOpenShare && (
  <div className="
    fixed
    inset-0
    bg-black/70
    z-[60]
    flex
    items-center
    justify-center
    p-4
  ">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-md
        max-h-[85vh]
        overflow-hidden
        shadow-2xl
        border
        border-gray-200/20
        flex
        flex-col
      "
    >

      {/* ======================================================= */}
      {/* HEADER                                                   */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-4
      ">
        <div>
          <h2 className="font-bold text-lg">
            Share to chat
          </h2>

          <p className="text-xs opacity-60 mt-1">
            Select one or more chats
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessageOpenShare(false);
            setSelectedChats([]);
          }}
          className="
            w-8
            h-8
            rounded-full
            bg-gray-800
            text-white
            flex
            items-center
            justify-center
            hover:bg-red-500
            transition
          "
        >
          <X size={17} />
        </button>
      </div>

      {/* ======================================================= */}
      {/* SELECTED COUNT                                          */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-3
      ">
        <span className="text-xs opacity-60">
          {selectedChats.length === 0
            ? "No chat selected"
            : `${selectedChats.length} chat${
                selectedChats.length > 1
                  ? "s"
                  : ""
              } selected`}
        </span>

        {selectedChats.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setSelectedChats([])
            }
            className="
              text-xs
              text-red-500
              hover:text-red-600
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* ======================================================= */}
      {/* CHAT LIST                                               */}
      {/* ======================================================= */}

      <div className="
        flex-1
        overflow-y-auto
        space-y-2
        pr-1
        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
      ">
        {chats.map((chat) => {

          const isSelected =
            selectedChats.includes(
              chat.id
            );

          const chatUser =
            chat.other_user ||
            chat.other ||
            chat.teacher ||
            chat.student;

          const firstName =
            chatUser?.first_name || "";

          const lastName =
            chatUser?.last_name || "";

          const fullName =
            `${firstName} ${lastName}`
              .trim() ||
            chatUser?.name ||
            chat.name ||
            "Unknown User";

          const avatar =
            chatUser?.profile_image ||
            chatUser?.profile_picture ||
            chatUser?.avatar ||
            chat.image ||
            null;

          return (
            <button
              type="button"
              key={chat.id}
              onClick={() => {
                setSelectedChats((prev) =>
                  prev.includes(chat.id)
                    ? prev.filter(
                        (id) =>
                          id !== chat.id
                      )
                    : [
                        ...prev,
                        chat.id,
                      ]
                );
              }}
              className={`
                w-full
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                border
                text-left
                transition-all
                duration-200
                ${
                  isSelected
                    ? `
                      bg-blue-50
                      dark:bg-blue-900/20
                      border-blue-500
                      shadow-sm
                    `
                    : `
                      border-gray-200/20
                      hover:bg-gray-100/10
                      hover:border-gray-300
                    `
                }
              `}
            >

              {/* ================================================= */}
              {/* AVATAR                                             */}
              {/* ================================================= */}

              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="
                    w-11
                    h-11
                    rounded-full
                    object-cover
                    flex-shrink-0
                  "
                />
              ) : (
                <div className="
                  w-11
                  h-11
                  rounded-full
                  bg-blue-500
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  flex-shrink-0
                ">
                  {fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* ================================================= */}
              {/* NAME                                               */}
              {/* ================================================= */}

              <div className="flex-1 min-w-0">

                <div
                  className={`
                    font-medium
                    text-sm
                    truncate
                    ${
                      isSelected
                        ? "text-blue-600"
                        : ""
                    }
                  `}
                >
                  {fullName}
                </div>

                <div className="text-[11px] opacity-50 mt-0.5">
                  {chat.type === "group"
                    ? "Group"
                    : "Chat"}
                </div>

              </div>

              {/* ================================================= */}
              {/* SELECT ICON                                       */}
              {/* ================================================= */}

              <div
                className={`
                  w-7
                  h-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                  transition-all
                  ${
                    isSelected
                      ? `
                        bg-blue-600
                        text-white
                      `
                      : `
                        border-2
                        border-gray-300
                        text-transparent
                      `
                  }
                `}
              >
                <Check
                  size={16}
                  strokeWidth={3}
                />
              </div>

            </button>
          );
        })}

        {/* ===================================================== */}
        {/* EMPTY CHAT LIST                                       */}
        {/* ===================================================== */}

        {chats.length === 0 && (
          <div className="
            py-10
            text-center
            opacity-50
          ">
            <MessageCircle
              size={35}
              className="mx-auto mb-2"
            />

            <p className="text-sm">
              No chats available
            </p>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* SEND                                                     */}
      {/* ======================================================= */}

      <button
        type="button"
        disabled={
          sending ||
          selectedChats.length === 0
        }
        onClick={async () => {
          try {
            setSending(true);

            for (
              const chatId of selectedChats
            ) {
              await shareToChat(chatId);
            }

            setSelectedChats([]);
            setMessageOpenShare(false);

          } finally {
            setSending(false);
          }
        }}
        className={`
          mt-4
          w-full
          rounded-xl
          py-3
          flex
          items-center
          justify-center
          gap-2
          font-medium
          transition
          ${
            sending ||
            selectedChats.length === 0
              ? `
                bg-gray-400
                cursor-not-allowed
                text-white
              `
              : `
                bg-blue-600
                hover:bg-blue-700
                text-white
              `
          }
        `}
      >
        {sending ? (
          <>
            <svg
              className="
                animate-spin
                h-5
                w-5
              "
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            Sending...
          </>
        ) : (
          <>
            <Send size={18} />

            Send
            {selectedChats.length > 0 &&
              ` (${selectedChats.length})`}
          </>
        )}
      </button>

      {/* ======================================================= */}
      {/* CANCEL                                                   */}
      {/* ======================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(false);
          setSelectedChats([]);
        }}
        disabled={sending}
        className="
          mt-2
          w-full
          rounded-xl
          py-2.5
          bg-gray-200
          text-gray-700
          hover:bg-gray-300
          transition
        "
      >
        Cancel
      </button>

    </div>
  </div>
)}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex z-[10002] items-center justify-center">
          <div className="bg-white p-4 rounded w-72 text-center">
            <p>
              Are you sure you want to delete this post?
            </p>

            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                className="text-white bg-gray-800 p-2 rounded text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedPost.id)}
                disabled={loadingProfile}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {loadingProfile ? (
                  <p className="flex items-center gap-2">
                    <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full" />
                  </p>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}