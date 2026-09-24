import { useRef, useState, useEffect, useCallback } from "react";
import api from "../../Api/axios";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";

import { MessageCircle, X, Check, Send } from "lucide-react";

import ProfileVideoCommentReactionShare
  from "../../pages/post/previewimagevideo/ProfileVideoCommentReactionShare";

export default function PostVideoCardProfileId({
  v,
  post,

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

  chats,
}) {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const viewedRef = useRef(false);

  const controlsTimerRef = useRef(null);

  /*
   * ==========================================
   * CARD VIDEO
   * ==========================================
   */
  const [playing, setPlaying] = useState(false);

  /*
   * ==========================================
   * PREVIEW
   * ==========================================
   */
  const [open, setOpen] = useState(false);
  const [openOption, setOpenOption] = useState(false);

  /*
   * ==========================================
   * VIDEO CONTROLS
   * ==========================================
   */
  const [isPlaying, setIsPlaying] = useState(false);

  const [videoLoading, setVideoLoading] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const [playbackRate, setPlaybackRate] = useState(1);

  const [showSpeed, setShowSpeed] = useState(false);

  const [showOverlay, setShowOverlay] = useState(true);

  const [isSeeking, setIsSeeking] = useState(false);

  /*
   * ==========================================
   * FORMAT TIME
   * ==========================================
   */
  const formatTime = (value) => {
    const seconds = Number(value);

    if (!Number.isFinite(seconds) || seconds < 0) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /*
   * ==========================================
   * SHOW CONTROLS
   *
   * Controls remain visible while paused.
   * When playing, they disappear after 2.5s.
   * ==========================================
   */
  const showVideoControls = useCallback(() => {
    setShowOverlay(true);

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }

    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
        setShowSpeed(false);
      }, 2500);
    }
  }, [isPlaying]);

  /*
   * ==========================================
   * CONTROL TIMER CLEANUP
   * ==========================================
   */
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);

  /*
   * ==========================================
   * RESET CONTROLS WHEN MODAL OPENS
   * ==========================================
   */
  useEffect(() => {
    if (!open) {
      setShowOverlay(true);
      setShowSpeed(false);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setVideoLoading(false);
      return;
    }

    setShowOverlay(true);
    setShowSpeed(false);
    setCurrentTime(0);
    setDuration(0);
    setVideoLoading(true);

    /*
     * Wait for the modal video element to exist.
     */
    const timer = setTimeout(() => {
      const video = videoRef.current;

      if (!video) {
        return;
      }

      video.currentTime = 0;
      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackRate;

      const playPromise = video.play();

      if (playPromise?.catch) {
        playPromise.catch(async () => {
          /*
           * Browser autoplay fallback.
           */
          try {
            video.muted = true;
            setIsMuted(true);

            await video.play();
          } catch (error) {
            console.log("Autoplay blocked:", error);
            setIsPlaying(false);
          }
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  /*
   * ==========================================
   * AUTOPLAY / VIDEO SETTINGS
   * ==========================================
   */
  useEffect(() => {
    if (!open || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    video.volume = volume;
    video.muted = isMuted;
    video.playbackRate = playbackRate;
  }, [open, volume, isMuted, playbackRate]);

  /*
   * ==========================================
   * VIDEO METADATA
   * ==========================================
   */
  const handleLoadedMetadata = (e) => {
    const video = e.currentTarget;

    const videoDuration = Number(video.duration);

    if (
      Number.isFinite(videoDuration) &&
      videoDuration > 0
    ) {
      setDuration(videoDuration);
    }

    setCurrentTime(video.currentTime || 0);
    setVideoLoading(false);
  };

  /*
   * ==========================================
   * DURATION CHANGE
   * ==========================================
   */
  const handleDurationChange = (e) => {
    const video = e.currentTarget;

    const videoDuration = Number(video.duration);

    if (
      Number.isFinite(videoDuration) &&
      videoDuration > 0
    ) {
      setDuration(videoDuration);
    }
  };

  /*
   * ==========================================
   * CAN PLAY
   * ==========================================
   */
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

  /*
   * ==========================================
   * PLAYING
   * ==========================================
   */
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

  /*
   * ==========================================
   * WAITING / BUFFERING
   * ==========================================
   */
  const handleVideoWaiting = () => {
    setVideoLoading(true);
    setShowOverlay(true);
  };

  /*
   * ==========================================
   * PAUSE
   * ==========================================
   */
  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowOverlay(true);

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
  };

  /*
   * ==========================================
   * TIME UPDATE
   * ==========================================
   */
  const handleTimeUpdate = (e) => {
    const video = e.currentTarget;

    /*
     * Keep current time synchronized even while
     * the user is not dragging.
     */
    if (!isSeeking) {
      setCurrentTime(video.currentTime || 0);
    }

    /*
     * Keep duration synchronized with actual video.
     */
    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDuration(video.duration);
    }
  };

  /*
   * ==========================================
   * VIDEO ENDED
   * ==========================================
   */
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

    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
  };

  /*
   * ==========================================
   * PLAY / PAUSE
   * ==========================================
   */
  const togglePlayPause = async (e) => {
    e.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    showVideoControls();

    try {
      if (video.paused || video.ended) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Play/pause error:", error);
    }
  };

  /*
   * ==========================================
   * SEEK START
   * ==========================================
   */
  const handleSeekStart = (e) => {
    e.stopPropagation();

    setIsSeeking(true);
    showVideoControls();
  };

  /*
   * ==========================================
   * SEEK CHANGE
   * ==========================================
   */
  const handleSeekChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setCurrentTime(value);

    if (videoRef.current) {
      videoRef.current.currentTime = value;
    }

    showVideoControls();
  };

  /*
   * ==========================================
   * SEEK END
   * ==========================================
   */
  const handleSeekEnd = (e) => {
    e.stopPropagation();

    setIsSeeking(false);
    showVideoControls();
  };

  /*
   * ==========================================
   * VOLUME
   * ==========================================
   */
  const handleVolumeChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setVolume(value);

    if (videoRef.current) {
      videoRef.current.volume = value;

      if (value === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }

    showVideoControls();
  };

  /*
   * ==========================================
   * MUTE
   * ==========================================
   */
  const toggleMute = (e) => {
    e.stopPropagation();

    if (!videoRef.current) {
      return;
    }

    const nextMuted = !isMuted;

    videoRef.current.muted = nextMuted;

    setIsMuted(nextMuted);

    showVideoControls();
  };

  /*
   * ==========================================
   * PLAYBACK SPEED
   * ==========================================
   */
  const handleSpeedChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setPlaybackRate(value);

    if (videoRef.current) {
      videoRef.current.playbackRate = value;
    }

    showVideoControls();
  };

  /*
   * ==========================================
   * FULLSCREEN
   * ==========================================
   */
  const handleFullscreen = async (e) => {
    e.stopPropagation();

    const container = videoContainerRef.current;
    const video = videoRef.current;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      if (container?.requestFullscreen) {
        await container.requestFullscreen();
        return;
      }

      if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }

    showVideoControls();
  };

  /*
   * ==========================================
   * MOUSE MOVEMENT
   * ==========================================
   */
  const handleVideoMouseMove = () => {
    showVideoControls();
  };

  const handleVideoMouseEnter = () => {
    showVideoControls();
  };

  const handleVideoClick = (e) => {
    /*
     * Clicking the actual video toggles play/pause.
     * Clicking controls has stopPropagation.
     */
    if (
      e.target.closest("button") ||
      e.target.closest("input")
    ) {
      return;
    }

    togglePlayPause(e);
  };

  /*
   * ==========================================
   * TOUCH
   * ==========================================
   */
  const handleVideoTouchStart = () => {
    showVideoControls();
  };

  /*
   * ==========================================
   * CARD VIDEO OBSERVER
   * ==========================================
   */
  useEffect(() => {
    const video = videoRef.current;

    /*
     * Do not use the modal video here.
     * This observer is only for the background card.
     */
    if (!video || open) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) {
          return;
        }

        if (entry.isIntersecting) {
          videoRef.current
            .play()
            .catch(() => {});

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

    observer.observe(video);

    return () => observer.disconnect();
  }, [open]);

  /*
   * ==========================================
   * MARK VIEWED
   * ==========================================
   */
  const onPlay = async () => {
    if (viewedRef.current) {
      return;
    }

    viewedRef.current = true;

    try {
      await api.post(`/api/post/${post.id}/view`);
    } catch (error) {
      console.error("Failed to mark video viewed:", error);
    }
  };

  /*
   * ==========================================
   * CLOSE PREVIEW
   * ==========================================
   */
  const closePreview = (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (videoRef.current) {
      videoRef.current.pause();
    }

    setOpen(false);
    setOpenOption(false);
    setShowSpeed(false);
    setShowOverlay(true);
    setIsPlaying(false);
  };
 
  const handleOption = (e) => {
    if (e) {
      e.stopPropagation();
    }

    setOpenOption((prev) => !prev);
    showVideoControls();
  };


  return (
    <>
      {/* =====================================================
          VIDEO CARD
      ===================================================== */}
      <div
        className="
          relative
          aspect-video
          bg-black
          cursor-pointer
          rounded
          overflow-hidden
        "
        onClick={() => setOpen(true)}
      >
        <video
          src={v?.url}
          className="w-full h-72 object-cover"
          muted
          playsInline
          preload="metadata"
          onPlay={onPlay}
        />

        {!playing && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              pointer-events-none
            "
          >
            <div
              className="
                bg-black/60
                p-2
                rounded-full
                text-white
              "
            >
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
        <div
          className="
            fixed
            inset-0
            bg-black/90
            z-[99999]
            flex
            items-center
            justify-center
            overflow-hidden
          "
          onClick={(e) => {
            /*
             * Clicking only the background closes.
             */
            if (e.target === e.currentTarget) {
              closePreview(e);
            }
          }}
        >
            <div className="relative w-full h-[90vh] flex items-center justify-center"> 
           <div
              className="
                absolute
                top-4
                sm:left-4 left-0
                z-[160] inline-flex sm:gap-2  gap-1 items-center
              "
              onClick={(e) => e.stopPropagation()}
            >


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


              <button
                type="button"
                onClick={handleOption}
                className="
                  sm:w-10 w-8 sm:h-10 h-8
                  rounded-full
                  bg-white
                  text-black
                  flex
                  items-center
                  justify-center
                  hover:bg-gray-200
                  shadow
                "
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
                    d="
                      M12 6.75a.75.75 0 1 1 0-1.5
                      .75.75 0 0 1 0 1.5ZM12 12.75a.75.75
                      0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12
                      18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z
                    "
                  />
                </svg>
              </button>

              {openOption && (
                <div
                  className="
                    absolute
                    top-12
                    left-0
                    w-40
                    bg-white
                    border
                    rounded-lg
                    shadow-xl
                    p-2
                  "
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleOption();
                      setShares(!shares);
                    }}
                    className="
                      flex
                      items-center
                      gap-2
                      font-bold
                      text-[15px]
                      w-full
                      px-2
                      py-2
                      text-gray-800
                      hover:bg-gray-50
                      rounded
                    "
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
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
            onMouseMove={handleVideoMouseMove}
            onMouseEnter={handleVideoMouseEnter}
            onTouchStart={handleVideoTouchStart}
            onClick={(e) => e.stopPropagation()}
          >
            {/* =================================================
                VIDEO
            ================================================= */}
            <video
              ref={videoRef}
              src={v?.url}
              className="
                w-full
                h-full
                object-contain
                bg-black
                select-none
              "
              playsInline
              preload="metadata" 
              onLoadedMetadata={handleLoadedMetadata}
              onDurationChange={handleDurationChange}
              onCanPlay={handleVideoCanPlay}
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
              <div
                className="
                  absolute
                  inset-0
                  z-[120]
                  flex
                  items-center
                  justify-center
                  pointer-events-none
                "
              >
                <div
                  className="
                    w-10
                    h-10
                    border-4
                    border-white/30
                    border-t-white
                    rounded-full
                    animate-spin
                  "
                />
              </div>
            )}

            {/* =================================================
                TOP CONTROLS
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
              {/* LEFT SIDE */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                  bg-black/45
                  backdrop-blur-sm
                  rounded-full
                  px-3
                  py-2
                "
              >
                {/* MUTE */}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    hover:bg-white/20
                  "
                  aria-label={
                    isMuted
                      ? "Unmute video"
                      : "Mute video"
                  }
                >
                  {isMuted || volume === 0 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5 6 9H3v6h3l5 4V5Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19 9-6 6m0-6 6 6"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5 6 9H3v6h3l5 4V5Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.5 8.5a5 5 0 0 1 0 7"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 6a9 9 0 0 1 0 12"
                      />
                    </svg>
                  )}
                </button>

                {/* VOLUME RANGE */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    showVideoControls();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    showVideoControls();
                  }}
                  className="
                    w-20
                    sm:w-28
                    h-[3px]
                    appearance-none
                    accent-white
                    cursor-pointer
                  "
                  aria-label="Volume"
                />
              </div>

              {/* RIGHT SIDE */}
              <div
                className="
                  flex
                  items-center
                  gap-2
                  bg-black/45
                  backdrop-blur-sm
                  rounded-full
                  px-2
                  py-2
                "
              >
                {/* SPEED */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeed((prev) => !prev);
                    showVideoControls();
                  }}
                  className="
                    text-white
                    text-xs
                    font-semibold
                    px-2
                    py-1
                    rounded-full
                    hover:bg-white/20
                    whitespace-nowrap
                  "
                >
                  {playbackRate}x
                </button>

                {/* SPEED RANGE */}
                {showSpeed && (
                  <div
                    className="
                      absolute
                      right-12
                      top-12
                      bg-black/90
                      backdrop-blur-md
                      rounded-xl
                      px-3
                      py-3
                      w-36
                      shadow-xl
                    "
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="
                        text-white
                        text-[11px]
                        mb-2
                        text-center
                      "
                    >
                      Speed: {playbackRate}x
                    </div>

                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={playbackRate}
                      onChange={handleSpeedChange}
                      className="
                        w-full
                        h-[3px]
                        appearance-none
                        accent-white
                        cursor-pointer
                      "
                    />

                    <div
                      className="
                        flex
                        justify-between
                        text-[9px]
                        text-gray-300
                        mt-1
                      "
                    >
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>
                )}

                {/* FULLSCREEN */}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    hover:bg-white/20
                  "
                  aria-label="Fullscreen"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"
                    />
                  </svg>
                </button>

                {/* CLOSE */}
                <button
                  type="button"
                  onClick={closePreview}
                  className="
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-white
                    hover:bg-white/20
                  "
                  aria-label="Close"
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l12 12M18 6 6 18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* =================================================
                MIDDLE PLAY / PAUSE
            ================================================= */}
            <button
              type="button"
              onClick={togglePlayPause}
              className={`
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                z-[135]
                w-14
                h-14
                sm:w-16
                sm:h-16
                rounded-full
                bg-black/55
                backdrop-blur-sm
                text-white
                flex
                items-center
                justify-center
                transition-all
                duration-300
                hover:bg-black/75
                ${
                  showOverlay
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }
              `}
              aria-label={
                isPlaying
                  ? "Pause video"
                  : "Play video"
              }
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7"
                >
                  <path d="M7 5a2 2 0 0 1 2 2v10a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Zm10 0a2 2 0 0 1 2 2v10a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-7 h-7 ml-1"
                >
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              )}
            </button>

            {/* =================================================
                BOTTOM VIDEO CONTROLS
            ================================================= */}
            <div
              className={`
                absolute
                bottom-2
                left-3
                right-3
                sm:left-5
                sm:right-5
                z-[130]
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
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-white
                  text-[11px]
                  w-full
                  bg-black/45
                  backdrop-blur-sm
                  rounded-full
                  px-3
                  py-2
                "
              >
                {/* CURRENT TIME */}
                <span className="w-[38px] shrink-0">
                  {formatTime(currentTime)}
                </span>

                {/* PROGRESS */}
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
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  disabled={!duration}
                  className="
                    flex-1
                    min-w-0
                    h-[3px]
                    appearance-none
                    accent-white
                    cursor-pointer
                    disabled:opacity-50
                  "
                  aria-label="Video progress"
                />

                {/* TOTAL DURATION */}
                <span className="w-[38px] shrink-0 text-right">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* =================================================
                REACTIONS / COMMENTS / SHARE
            ================================================= */}
            <div
              className="
                absolute
                right-2
                sm:right-4
                top-1/2
                -translate-y-1/2
                flex
                flex-col
                items-center
                gap-2
                z-[150]
              "
              onClick={(e) => e.stopPropagation()}
            >
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

            {/* =================================================
                OPTIONS
            ================================================= */}
           
          </div>
        </div>
          </div>

      )}

      {/* =====================================================
          SHARE MODAL
      ===================================================== */}
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
        scrollbar-thin
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


    </>
  );
}