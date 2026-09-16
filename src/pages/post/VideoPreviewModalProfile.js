import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../../Api/axios";

import {
  MessageCircle,
  Trash2,
  Share2,
} from "lucide-react";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";

import ProfileVideoModalCommentReactionShare from "./previewimagevideo/ProfileVideoModalCommentReactionShare";

export default function VideoPreviewModalProfile({
  open,
  setOpen,
  media = [],
  index = 0,
  setIndex,
  commentsByPost,
  setCommentsByPost,
  setPosts,
  chats,
  post,
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
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // VIDEO PREVIEW REFS
  // =====================================================

  const previewVideoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // =====================================================
  // VIDEO STATE
  // =====================================================

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

  // =====================================================
  // CURRENT MEDIA
  // =====================================================

  const current = media?.[index];

  // =====================================================
  // FORMAT TIME
  // =====================================================

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

  // =====================================================
  // SHOW / HIDE CONTROLS
  // =====================================================

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

  // =====================================================
  // OPEN / CHANGE VIDEO
  // =====================================================

  useEffect(() => {
    if (!open || !current?.id) {
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
        } catch (error) {
          console.log("Autoplay blocked:", error);
        }
      });
    }

    return () => {
      try {
        video.pause();
      } catch {}
    };
  }, [open, current?.id]);

  // =====================================================
  // VOLUME SYNC
  // =====================================================

  useEffect(() => {
    const video = previewVideoRef.current;

    if (!video) {
      return;
    }

    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // =====================================================
  // PLAYBACK SPEED SYNC
  // =====================================================

  useEffect(() => {
    const video = previewVideoRef.current;

    if (!video) {
      return;
    }

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // =====================================================
  // VIDEO EVENTS
  // =====================================================

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

  const handleVideoWaiting = () => {
    setVideoLoading(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

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

  // =====================================================
  // PLAY / PAUSE
  // =====================================================

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
    } catch (error) {
      console.error("Video play error:", error);
    }

    showVideoControls();
  };

  // =====================================================
  // MUTE
  // =====================================================

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

  // =====================================================
  // VOLUME
  // =====================================================

  const handleVolumeChange = (e) => {
    e.stopPropagation();

    const value = Number(e.target.value);

    if (!Number.isFinite(value)) {
      return;
    }

    setVolume(value);

    if (previewVideoRef.current) {
      previewVideoRef.current.volume = value;
    }

    if (value > 0) {
      setIsMuted(false);

      if (previewVideoRef.current) {
        previewVideoRef.current.muted = false;
      }
    } else {
      setIsMuted(true);

      if (previewVideoRef.current) {
        previewVideoRef.current.muted = true;
      }
    }

    showVideoControls();
  };

  // =====================================================
  // SEEK
  // =====================================================

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
      previewVideoRef.current.currentTime = value;
    }

    showVideoControls();
  };

  const handleSeekEnd = (e) => {
    e.stopPropagation();

    setIsSeeking(false);
    showVideoControls();
  };

  // =====================================================
  // FULLSCREEN
  // =====================================================

  const handleFullscreen = async (e) => {
    e.stopPropagation();

    const container = videoContainerRef.current;

    if (!container) {
      return;
    }

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

  // =====================================================
  // CLOSE
  // =====================================================

  const closePreview = () => {
    const video = previewVideoRef.current;

    if (video) {
      try {
        video.pause();
      } catch {}
    }

    setOpen(false);
    setShowOptions(false);
    setShowSpeed(false);
    setShowOverlay(true);
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const goPrevious = () => {
    setIndex((prev) => Math.max(prev - 1, 0));

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setShowOverlay(true);
    setShowSpeed(false);
  };

  // =====================================================
  // NEXT
  // =====================================================

  const goNext = () => {
    setIndex((prev) =>
      Math.min(prev + 1, media.length - 1)
    );

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setShowOverlay(true);
    setShowSpeed(false);
  };

  // =====================================================
  // KEYBOARD
  // =====================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePreview();
      }

      if (e.key === "ArrowLeft") {
        goPrevious();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }

      if (e.key === " ") {
        e.preventDefault();
        togglePlay(e);
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
  }, [open, index, media.length, isPlaying]);

  // =====================================================
  // MOBILE TOUCH START
  // =====================================================

  const handleTouchStart = (e) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;

    showVideoControls();
  };

  // =====================================================
  // MOBILE TOUCH END
  // =====================================================

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) {
      return;
    }

    const touch = e.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    if (Math.abs(deltaX) < 50) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!current?.id || !post?.id) {
      return;
    }

    try {
      setDeleting(true);

      const res = await api.delete(
        `/api/video/media/${current.id}`
      );

      if (res.data?.post_deleted) {
        setPosts((prev) =>
          prev.filter((p) => p.id !== post.id)
        );

        setShowDeleteModal(false);
        setOpen(false);

        return;
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== post.id) {
            return p;
          }

          return {
            ...p,
            media: p.media.filter(
              (m) => m.id !== current.id
            ),
          };
        })
      );

      setShowDeleteModal(false);

      if (media.length <= 1) {
        setOpen(false);
      } else {
        if (index >= media.length - 1) {
          setIndex(Math.max(index - 1, 0));
        }
      }
    } catch (error) {
      console.error(
        "Video delete error:",
        error
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // SHARE
  // =====================================================

  const shareUrl =
    `${window.location.origin}/post/${post?.id}/share`;

  const shareLinks = {
    facebook:
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,

    whatsapp:
      `https://wa.me/?text=${encodeURIComponent(
        shareUrl
      )}`,

    twitter:
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}`,

    telegram:
      `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}`,
  };

  // =====================================================
  // RENDER GUARD
  // =====================================================

  if (!open || !current) {
    return null;
  }

  return (
    <>
      <div
        className="
          fixed
          inset-0
          z-[9999]
          bg-black/90
          flex
          items-center
          justify-center
          touch-none
        "
        onMouseMove={showVideoControls}
        onTouchStart={showVideoControls}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closePreview();
          }
        }}
      >

        {/* =================================================
            TOP RIGHT ACTIONS
        ================================================= */}

        <div
          className="
            absolute
            top-4
            right-4
            z-[10010]
            flex
            items-center
            gap-1 sm:gap-3 
          "
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          {/* CLOSE */}

          <button
            type="button"
            onClick={closePreview}
            className="
             sm:w-10 w-8 sm:h-10 h-8
              rounded-full
              bg-white
              text-black
              flex
              items-center
              justify-center
              shadow-lg
              hover:bg-gray-200
              transition
              cursor-pointer
            "
            aria-label="Close video preview"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* OPTIONS */}

          <div className="relative">

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setShowOptions(
                  (prev) => !prev
                );

                showVideoControls();
              }}
              className="
                sm:w-10 w-8 sm:h-10 h-8
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                shadow-lg
                hover:bg-gray-200
                transition
                cursor-pointer
              "
              aria-label="Video options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="
                  w-7
                  h-7
                  rotate-90
                "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="
                    M12 6.75a.75.75 0 1 1
                    0-1.5.75.75 0 0 1
                    0 1.5ZM12 12.75a.75.75 0 1 1
                    0-1.5.75.75 0 1 1
                    0 1.5ZM12 18.75a.75.75 0 1 1
                    0-1.5.75.75 0 1 1
                    0 1.5Z
                  "
                />
              </svg>
            </button>

            {/* OPTIONS POPUP */}

            {showOptions && (
              <div
                className="
                  absolute
                  top-12
                  right-0
                  w-40
                  bg-white
                  rounded-lg
                  shadow-xl
                  border
                  p-2
                  z-[10020]
                "
                onClick={(e) =>
                  e.stopPropagation()
                }
              >

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(false);
                    setShowDeleteModal(true);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-red-600
                    hover:bg-red-50
                    rounded
                  "
                >
                  <Trash2 size={17} />
                  Delete
                </button>

                {/* SHARE */}

                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(false);
                    setShowShareModal(true);
                  }}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-gray-800
                    hover:bg-gray-100
                    rounded
                  "
                >
                  <Share2 size={17} />
                  Share
                </button>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            VIDEO / SWIPE AREA
        ================================================= */}

        <div
          ref={videoContainerRef}
          className="
            relative
            w-full
            h-full
            flex
            items-center
            justify-center
            px-3
            md:px-16
            overflow-hidden
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={showVideoControls}
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          {/* =================================================
              VIDEO
          ================================================= */}

          <video
            key={current.id}
            ref={previewVideoRef}
            src={current.url}
            className="
              max-h-[85vh]
              max-w-[95vw]
              md:max-w-[85vw]
              w-auto
              h-auto
              object-contain
              rounded-lg
            "
            muted={isMuted}
            playsInline
            preload="metadata"
            onLoadedMetadata={
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
            onClick={(e) => {
              e.stopPropagation();
              togglePlay(e);
            }}
          />

          {/* =================================================
              LOADING
          ================================================= */}

          {videoLoading && (
            <div
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                z-[120]
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
              PREVIOUS
          ================================================= */}

          {index > 0 && (
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
                left-5
                top-1/2
                -translate-y-1/2
                z-[130]
                w-11
                h-11
                rounded-full
                border
                border-white/70
                bg-black/50
                text-white
                items-center
                justify-center
                hover:bg-black/80
                transition
              "
              aria-label="Previous video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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
          ================================================= */}

          {index < media.length - 1 && (
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
                right-5
                top-1/2
                -translate-y-1/2
                z-[130]
                w-11
                h-11
                rounded-full
                border
                border-white/70
                bg-black/50
                text-white
                items-center
                justify-center
                hover:bg-black/80
                transition
              "
              aria-label="Next video"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
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

          {/* =================================================
              CENTER PLAY / PAUSE
          ================================================= */}

          {showOverlay && !videoLoading && (
            <button
              type="button"
              onClick={togglePlay}
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                z-[125]
                w-16
                h-16
                rounded-full
                bg-black/50
                text-white
                flex
                items-center
                justify-center
                hover:bg-black/70
                transition
              "
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
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-8 h-8"
                >
                  <path
                    d="M7 5h4v14H7zm6 0h4v14h-4z"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}

          {/* =================================================
              TOP VIDEO CONTROLS
          ================================================= */}

          {showOverlay && (
            <div
              className="
                absolute
                top-4
                left-4
                z-[140]
                flex
                items-center
                gap-2
              "
              onClick={(e) =>
                e.stopPropagation()
              }
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
                aria-label={
                  isMuted
                    ? "Unmute"
                    : "Mute"
                }
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

              {/* VOLUME */}

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="
                  w-20
                  h-[3px]
                  accent-white
                  cursor-pointer
                "
                aria-label="Volume"
              />

              {/* SPEED */}

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
                aria-label="Playback speed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="w-5 h-5"
                >
                  <path d="M12 8v4l3 2" />
                  <path d="M12 3a9 9 0 1 1-8.49 6" />
                  <path d="M3 4v5h5" />
                </svg>
              </button>

              {/* SPEED VALUE */}

              <span className="
                text-white
                text-xs
                font-semibold
                bg-black/60
                px-2
                py-1
                rounded
              ">
                {playbackRate}x
              </span>

              {/* FULLSCREEN */}

              <button
                type="button"
                onClick={handleFullscreen}
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
                aria-label="Fullscreen"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-5 h-5"
                >
                  <path d="M8 3H3v5" />
                  <path d="M16 3h5v5" />
                  <path d="M21 16v5h-5" />
                  <path d="M3 16v5h5" />
                </svg>
              </button>

              {/* SPEED SLIDER */}

              {showSpeed && (
                <div
                  className="
                    absolute
                    top-11
                    left-0
                    w-40
                    bg-black/80
                    rounded-lg
                    p-3
                    shadow-xl
                  "
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <div className="
                    flex
                    justify-between
                    text-white
                    text-xs
                    mb-2
                  ">
                    <span>Speed</span>
                    <span>
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
                      setPlaybackRate(
                        Number(e.target.value)
                      );

                      showVideoControls();
                    }}
                    className="
                      w-full
                      h-[3px]
                      accent-white
                      cursor-pointer
                    "
                    aria-label="Playback speed"
                  />

                  <div className="
                    flex
                    justify-between
                    text-white/60
                    text-[10px]
                    mt-1
                  ">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>1.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =================================================
              BOTTOM VIDEO CONTROLS
          ================================================= */}

          {showOverlay && (
            <div
              className="
                absolute
                bottom-4
                left-4
                right-4
                z-[140]
                px-2
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="
                flex
                items-center
                gap-2
              ">

                <span className="
                  text-white
                  text-[11px]
                  min-w-[38px]
                  text-right
                ">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={
                    Math.min(
                      currentTime,
                      duration || 0
                    )
                  }
                  onMouseDown={handleSeekStart}
                  onTouchStart={handleSeekStart}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekEnd}
                  onTouchEnd={handleSeekEnd}
                  className="
                    flex-1
                    h-[3px]
                    accent-white
                    cursor-pointer
                  "
                  aria-label="Video progress"
                />

                <span className="
                  text-white
                  text-[11px]
                  min-w-[38px]
                ">
                  {formatTime(duration)}
                </span>

              </div>

            </div>
          )}
 
          <div
            className="
              absolute
              right-0
              top-1/2
              -translate-y-1/2
              flex
              flex-col
              items-center
              gap-2
              z-[150]
            "
          >
            <ProfileVideoModalCommentReactionShare
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

              currentUser={currentUser}
              getColor={getColor}

              postComments={postComments}
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
              setNewComment={setNewComment}

              loading={loading}
              setLoading={setLoading}

              showEmoji={showEmoji}
              setShowEmoji={setShowEmoji}

              emojiList={emojiList}
              setEmojiList={setEmojiList}

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

              postIdModal={postIdModal}

              setOpen={setOpen}
            />
          </div>
          {/* =================================================
              COUNTER
          ================================================= */}

          {media.length > 1 && (
            <div
              className="
                absolute
                bottom-14
                left-1/2
                -translate-x-1/2
                bg-black/60
                text-white
                text-xs
                px-3
                py-1.5
                rounded-full
                z-[145]
              "
            >
              {index + 1} / {media.length}
            </div>
          )}

          {/* =================================================
              MOBILE SWIPE HINT
          ================================================= */}

          {media.length > 1 && (
            <div
              className="
                md:hidden
                absolute
                bottom-20
                left-1/2
                -translate-x-1/2
                text-white/60
                text-[10px]
                z-[145]
                pointer-events-none
              "
            >
              Swipe left or right
            </div>
          )}

        </div>

        {/* =================================================
            DELETE MODAL
        ================================================= */}

        {showDeleteModal && (
          <div
            className="
              fixed
              inset-0
              z-[10030]
              bg-black/70
              flex
              items-center
              justify-center
              p-4
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                text-center
                shadow-2xl
              "
            >

              <h3 className="
                text-lg
                font-bold
                text-black
              ">
                Delete Video
              </h3>

              <p className="
                text-gray-600
                text-sm
                mt-2
              ">
                Are you sure you want to delete this video?
              </p>

              <div className="
                flex
                justify-end
                gap-2
                mt-5
              ">

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="
                    px-4
                    py-2
                    rounded
                    bg-gray-800
                    text-white
                    text-sm
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="
                    px-4
                    py-2
                    rounded
                    bg-red-600
                    text-white
                    text-sm
                    min-w-[80px]
                    flex
                    items-center
                    justify-center
                  "
                >
                  {deleting ? (
                    <span
                      className="
                        inline-block
                        w-5
                        h-5
                        border-2
                        border-white
                        border-t-transparent
                        rounded-full
                        animate-spin
                      "
                    />
                  ) : (
                    "Delete"
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =================================================
            SHARE MODAL
        ================================================= */}

        {showShareModal && (
          <div
            className="
              fixed
              inset-0
              z-[10030]
              bg-black/70
              flex
              items-center
              justify-center
              p-4
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                relative
                shadow-2xl
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowShareModal(false)
                }
                className="
                  absolute
                  top-3
                  right-3
                  w-7
                  h-7
                  bg-gray-100
                  rounded-full
                  text-black
                  flex
                  items-center
                  justify-center
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-4 h-4"
                >
                  <path
                    d="M6 18 18 6M6 6l12 12"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <h2 className="
                text-lg
                font-bold
                text-black
                text-center
                mb-5
              ">
                Share Video
              </h2>

              <div className="
                flex
                flex-col
                items-center
                gap-5
              ">

                {/* CHAT */}

                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShowChatModal(true);
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1
                    text-black
                    hover:text-blue-600
                  "
                >
                  <MessageCircle
                    size={38}
                    className="
                      border-2
                      border-black
                      rounded-full
                      p-1
                    "
                  />

                  <span className="
                    text-sm
                    font-bold
                  ">
                    Chat List
                  </span>
                </button>

                {/* SOCIAL */}

                <div className="
                  grid
                  grid-cols-4
                  gap-4
                  border-t
                  pt-4
                  w-full
                ">

                  <button
                    type="button"
                    onClick={() =>
                      handleShare(
                        "facebook"
                      )
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      gap-1
                      text-black
                    "
                  >
                    <FaFacebook size={25} />

                    <span className="text-xs">
                      Facebook
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleShare(
                        "whatsapp"
                      )
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      gap-1
                      text-black
                    "
                  >
                    <FaWhatsapp size={25} />

                    <span className="text-xs">
                      WhatsApp
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleShare(
                        "twitter"
                      )
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      gap-1
                      text-black
                    "
                  >
                    <FaTwitter size={25} />

                    <span className="text-xs">
                      Twitter
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleShare(
                        "telegram"
                      )
                    }
                    className="
                      flex
                      flex-col
                      items-center
                      gap-1
                      text-black
                    "
                  >
                    <FaTelegram size={25} />

                    <span className="text-xs">
                      Telegram
                    </span>
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CHAT SHARE MODAL
        ================================================= */}

        {showChatModal && (
          <div
            className="
              fixed
              inset-0
              z-[10040]
              bg-black/60
              flex
              items-center
              justify-center
              p-4
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                max-h-[80vh]
                overflow-y-auto
              "
            >

              <div className="
                flex
                items-center
                justify-between
                mb-4
              ">

                <h2 className="
                  font-bold
                  text-lg
                  text-black
                ">
                  Share to chat
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowChatModal(false)
                  }
                  className="
                    w-7
                    h-7
                    bg-gray-100
                    rounded-full
                    text-black
                    flex
                    items-center
                    justify-center
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path
                      d="M6 18 18 6M6 6l12 12"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

              </div>

              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    flex
                    items-center
                    gap-2
                    p-2
                    rounded
                    cursor-pointer
                    my-1
                    ${
                      selectedChats.includes(
                        chat.id
                      )
                        ? "bg-blue-200"
                        : "hover:bg-gray-100"
                    }
                  `}
                  onClick={() => {
                    setSelectedChats(
                      (prev) =>
                        prev.includes(chat.id)
                          ? prev.filter(
                              (id) =>
                                id !==
                                chat.id
                            )
                          : [
                              ...prev,
                              chat.id,
                            ]
                    );
                  }}
                >

                  <input
                    type="checkbox"
                    checked={selectedChats.includes(
                      chat.id
                    )}
                    readOnly
                  />

                  <span className="
                    text-sm
                    text-black
                  ">
                    {chat.other_user
                      ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                      : chat.teacher
                      ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                      : chat.student
                      ? `${chat.student.first_name} ${chat.student.last_name}`
                      : "Unknown User"}
                  </span>

                </div>
              ))}

              <button
                type="button"
                disabled={
                  sending ||
                  selectedChats.length === 0
                }
                onClick={shareToChat}
                className={`
                  mt-4
                  w-full
                  py-2
                  rounded
                  text-white
                  ${
                    sending ||
                    selectedChats.length === 0
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {sending ? (
                  <span
                    className="
                      inline-block
                      w-5
                      h-5
                      border-2
                      border-white
                      border-t-transparent
                      rounded-full
                      animate-spin
                    "
                  />
                ) : (
                  `Send (${selectedChats.length})`
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowChatModal(false)
                }
                className="
                  mt-2
                  w-full
                  py-2
                  rounded
                  bg-gray-200
                  text-black
                "
              >
                Cancel
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}