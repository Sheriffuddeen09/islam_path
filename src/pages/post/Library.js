import {
  Trash2,
  Loader2,
  Download,
  Eye,
} from "lucide-react";

import ImageGridLibrary from "./ImageGridLibrary";
import ImageGridLibraryPreview from "./ImageGridLibraryPreview";
import DownloadImageFlex from "./DownloadImageFlex";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import toast from "react-hot-toast";

          
export default function Library({
  post,
  handleRemove,
  deleteLoading,
  downloading,
}) {
  const { user } = useAuth();

  const navigate = useNavigate();

  // =========================================================
  // GENERAL STATES
  // =========================================================

  const [showMore, setShowMore] = useState(false);

  const [showImagePicker, setShowImagePicker] =
    useState(false);

  const [showContentModal, setShowContentModal] =
    useState(false);

  const [selectedReel, setSelectedReel] =
    useState(null);

  const [progressMap, setProgressMap] =
    useState({});

  // =========================================================
  // VIDEO REFS
  // =========================================================

  const reelVideoRef = useRef(null);

  const reelContainerRef = useRef(null);

  const reelControlsTimerRef = useRef(null);

  // =========================================================
  // VIDEO STATES
  // =========================================================

  const [videoPlaying, setVideoPlaying] =
    useState(false);

  const [videoLoading, setVideoLoading] =
    useState(false);

  const [videoDuration, setVideoDuration] =
    useState(0);

  const [videoCurrentTime, setVideoCurrentTime] =
    useState(0);

  const [videoVolume, setVideoVolume] =
    useState(1);

  const [videoMuted, setVideoMuted] =
    useState(true);

  const [videoSpeed, setVideoSpeed] =
    useState(1);

  const [showVideoSpeed, setShowVideoSpeed] =
    useState(false);

  const [showVideoControls, setShowVideoControls] =
    useState(true);

  // =========================================================
  // POST DATA
  // =========================================================

  const text = post?.content || "";

  const media = post?.media?.[0];

  const hasImage = post?.media?.some(
    (item) => item.type === "image"
  );

  const hasVideo = post?.media?.some(
    (item) => item.type === "video"
  );

  const hasMedia = hasImage || hasVideo;

  const contentLimit = hasMedia ? 22 : 560;

  const shouldShowMore =
    text.length > contentLimit;

  const shortText = shouldShowMore
    ? text.substring(0, contentLimit) + "..."
    : text;

  // =========================================================
  // FORMAT VIDEO TIME
  // =========================================================

  const formatVideoTime = (value) => {
    const seconds = Number(value);

    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return "00:00";
    }

    const mins = Math.floor(
      seconds / 60
    );

    const secs = Math.floor(
      seconds % 60
    );

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // =========================================================
  // SHOW VIDEO CONTROLS
  // =========================================================

  const showControls = () => {
    setShowVideoControls(true);

    if (reelControlsTimerRef.current) {
      clearTimeout(
        reelControlsTimerRef.current
      );
    }

    if (
      videoPlaying &&
      !videoLoading
    ) {
      reelControlsTimerRef.current =
        setTimeout(() => {
          setShowVideoControls(false);
          setShowVideoSpeed(false);
        }, 2500);
    }
  };

  // =========================================================
  // CLEANUP CONTROL TIMER
  // =========================================================

  useEffect(() => {
    return () => {
      if (reelControlsTimerRef.current) {
        clearTimeout(
          reelControlsTimerRef.current
        );
      }
    };
  }, []);
 
  const closeContentModal = () => {
    if (reelControlsTimerRef.current) {
      clearTimeout(
        reelControlsTimerRef.current
      );
    }

    if (reelVideoRef.current) {
      try {
        reelVideoRef.current.pause();
      } catch {}
    }

    setVideoPlaying(false);
    setVideoLoading(false);

    setVideoCurrentTime(0);
    setVideoDuration(0);

    setVideoMuted(true);
    setVideoVolume(1);
    setVideoSpeed(1);

    setShowVideoControls(true);
    setShowVideoSpeed(false);

    setShowContentModal(false);
    setSelectedReel(null);
  };
 const handlePostClick = (e) => {
  if (e) {
    e.preventDefault();

    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest("input") ||
      e.target.closest("select") ||
      e.target.closest("textarea")
    ) {
      return;
    }
  }

  /*
   * REEL
   */
  if (post?.post_type === "reel") {
    const reelHasVideo = post?.media?.some(
      (item) => item.type === "video"
    );

    // Reel video → navigate
    if (reelHasVideo) {
      navigate(`/reel/video/${post.id}`);
      return;
    }

    // Reel image/text → open modal
    setSelectedReel(post);

    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);

    setVideoLoading(false);

    setVideoMuted(true);
    setVideoVolume(1);
    setVideoSpeed(1);

    setShowVideoControls(true);
    setShowVideoSpeed(false);

    setShowContentModal(true);

    return;
  }

  /*
   * NORMAL POST
   */
  if (post?.post_type === "post") {
    const postHasVideo = post?.media?.some(
      (item) => item.type === "video"
    );

    const postHasImage = post?.media?.some(
      (item) => item.type === "image"
    );

    if (postHasVideo) {
      navigate(`/post/video/${post.id}`);
      return;
    }

    if (postHasImage) {
      navigate(`/post/image/${post.id}`);
      return;
    }

    navigate(`/post/text/${post.id}`);
  }
}; 


const handleViewPost = (e) => {
  e?.preventDefault();
  e?.stopPropagation();

  /*
   * REEL
   */
  if (post?.post_type === "reel") {
    const reelHasVideo = post?.media?.some(
      (item) => item.type === "video"
    );

    // Reel video → navigate
    if (reelHasVideo) {
      navigate(`/reel/video/${post.id}`);
      return;
    }

    // Reel image/text → modal
    setSelectedReel(post);

    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);

    setVideoLoading(false);

    setVideoMuted(true);
    setVideoVolume(1);
    setVideoSpeed(1);

    setShowVideoControls(true);
    setShowVideoSpeed(false);

    setShowContentModal(true);

    return;
  }

  /*
   * NORMAL POST
   */
  if (post?.post_type === "post") {
    const postHasVideo = post?.media?.some(
      (item) => item.type === "video"
    );

    const postHasImage = post?.media?.some(
      (item) => item.type === "image"
    );

    if (postHasVideo) {
      navigate(`/post/video/${post.id}`);
      return;
    }

    if (postHasImage) {
      navigate(`/post/image/${post.id}`);
      return;
    }

    navigate(`/post/text/${post.id}`);
  }
};


const handleModalView = (e) => {
  e?.preventDefault();
  e?.stopPropagation();

  const selected = selectedReel;

  if (!selected) {
    return;
  }

  /*
   * REEL
   */
  if (selected.post_type === "reel") {
    const reelHasVideo = selected.media?.some(
      (item) => item.type === "video"
    );

    // Reel video → navigate to video page
    if (reelHasVideo) {
      closeContentModal();
      navigate(`/reel/video/${selected.id}`);
      return;
    }

    // Reel image/text → keep/open modal
    setSelectedReel(selected);
    setShowContentModal(true);

    return;
  }

  /*
   * NORMAL POST
   */
  closeContentModal();

  if (selected.post_type === "post") {
    const selectedHasVideo = selected.media?.some(
      (item) => item.type === "video"
    );

    const selectedHasImage = selected.media?.some(
      (item) => item.type === "image"
    );

    if (selectedHasVideo) {
      navigate(`/post/video/${selected.id}`);
      return;
    }

    if (selectedHasImage) {
      navigate(`/post/image/${selected.id}`);
      return;
    }

    navigate(`/post/text/${selected.id}`);
  }
};



  const handleCardDelete = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    await handleRemove(
      post.id
    );
  };
 
  const handleModalDelete = async (
    e
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    const postId =
      selectedReel?.id;

    if (!postId) {
      return;
    }
 
    closeContentModal();

    await handleRemove(
      postId
    );
  };
 
  const handleDownloadVideo = async (
    e,
    targetPost = post
  ) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (!targetPost?.id) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await fetch(
          `http://localhost:8000/api/download/video/${targetPost.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!res.ok) {
        throw new Error(
          "Download failed"
        );
      }

      const blob =
        await res.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "IPK video.mp4";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      toast.success(
        "Downloading video..."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to download video!"
      );
    }
  };

   
  const downloadSingleImage =
    async (img) => {
      try {
        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await api.get(
            `/api/download/image/${img.id}`,
            {
              responseType:
                "blob",

              headers: {
                Authorization: `Bearer ${token}`,
              },

              onDownloadProgress:
                (
                  progressEvent
                ) => {
                  if (
                    !progressEvent.total
                  ) {
                    return;
                  }

                  const percent =
                    Math.round(
                      (progressEvent.loaded *
                        100) /
                        progressEvent.total
                    );

                  setProgressMap(
                    (prev) => ({
                      ...prev,
                      [img.id]:
                        percent,
                    })
                  );
                },
            }
          );

        const blob =
          new Blob([
            res.data,
          ]);

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          img.path
            ?.split("/")
            .pop() ||
          "image.jpg";

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        setProgressMap(
          (prev) => ({
            ...prev,
            [img.id]: 100,
          })
        );

        toast.success(
          "Image downloaded"
        );
      } catch (error) {
        console.error(error);

        toast.error(
          "Failed to download image"
        );
      }
    };
 
  useEffect(() => {
    if (
      !showContentModal ||
      !selectedReel
    ) {
      return;
    }

    const hasSelectedVideo =
      selectedReel.media?.some(
        (item) =>
          item.type === "video"
      );

    if (!hasSelectedVideo) {
      setVideoLoading(false);
      return;
    }

    const video =
      reelVideoRef.current;

    if (!video) {
      return;
    }

    let cancelled = false;

    setVideoLoading(true);
    setVideoPlaying(false);
    setVideoCurrentTime(0);

    video.currentTime = 0;
 

    video.muted = true;

    video.volume =
      videoVolume;

    video.playbackRate =
      videoSpeed;

    const playVideo =
      async () => {
        try {
          
          video.muted = true;

          await video.play();

          if (!cancelled) {
            setVideoPlaying(true);
            setVideoLoading(false);
          }
        } catch (error) {
          console.log(
            "Autoplay prevented:",
            error
          );

          if (!cancelled) {
            setVideoPlaying(false);
            setVideoLoading(false);
          }
        }
      };
 

    const timer =
      setTimeout(() => {
        if (!cancelled) {
          playVideo();
        }
      }, 100);

    return () => {
      cancelled = true;

      clearTimeout(timer);

      try {
        video.pause();
      } catch {}
    };
  }, [
    showContentModal,
    selectedReel?.id,
  ]);
 
  useEffect(() => {
    if (!showContentModal) {
      return;
    }

    const handleKeyDown = (
      e
    ) => {
      if (
        e.key === "Escape"
      ) {
        closeContentModal();
        return;
      }

      if (
        e.key === " "
      ) {
        
        if (
          e.target.tagName ===
            "INPUT" ||
          e.target.tagName ===
            "TEXTAREA" ||
          e.target.tagName ===
            "SELECT"
        ) {
          return;
        }

        e.preventDefault();

        toggleVideoPlay();
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
    showContentModal,
    videoPlaying,
  ]);

  
  const handleVideoLoadedMetadata =
    (e) => {
      const video =
        e.currentTarget;

      if (
        Number.isFinite(
          video.duration
        )
      ) {
        setVideoDuration(
          video.duration
        );
      }

      setVideoCurrentTime(
        video.currentTime ||
          0
      );

      setVideoLoading(false);
    };

   
  const handleVideoCanPlay =
    (e) => {
      const video =
        e.currentTarget;

      if (
        Number.isFinite(
          video.duration
        )
      ) {
        setVideoDuration(
          video.duration
        );
      }

      setVideoLoading(false);
    };
 
  const handleVideoPlaying =
    () => {
      setVideoPlaying(true);
      setVideoLoading(false);

      showControls();
    };

   
  const handleVideoWaiting =
    () => {
      setVideoLoading(true);
    };
 
  const handleVideoPause =
    () => {
      setVideoPlaying(false);

      setShowVideoControls(
        true
      );

      if (
        reelControlsTimerRef.current
      ) {
        clearTimeout(
          reelControlsTimerRef.current
        );
      }
    };
 
  const handleVideoTimeUpdate =
    (e) => {
      const video =
        e.currentTarget;

      setVideoCurrentTime(
        video.currentTime ||
          0
      );

      if (
        Number.isFinite(
          video.duration
        )
      ) {
        setVideoDuration(
          video.duration
        );
      }
    };

  const handleVideoEnded =
    () => {
      setVideoPlaying(false);

      setShowVideoControls(
        true
      );

      setShowVideoSpeed(false);

      if (
        reelVideoRef.current
      ) {
        setVideoCurrentTime(
          reelVideoRef.current
            .duration || 0
        );
      }
    };
 
  const toggleVideoPlay =
    async (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const video =
        reelVideoRef.current;

      if (!video) {
        return;
      }

      try {
        if (
          video.paused ||
          video.ended
        ) {
          await video.play();
        } else {
          video.pause();
        }
      } catch (error) {
        console.error(error);
      }

      showControls();
    };
 
  const handleVideoClick =
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      toggleVideoPlay(e);
    };
 
  const toggleVideoMute =
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      const video =
        reelVideoRef.current;

      const nextMuted =
        !videoMuted;

      setVideoMuted(
        nextMuted
      );

      if (video) {
        video.muted =
          nextMuted;
      }

      showControls();
    };
 
  const handleVideoVolume =
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const value =
        Number(
          e.target.value
        );

      if (
        !Number.isFinite(value)
      ) {
        return;
      }

      setVideoVolume(value);

      if (
        reelVideoRef.current
      ) {
        reelVideoRef.current.volume =
          value;
      }

      if (value === 0) {
        setVideoMuted(true);

        if (
          reelVideoRef.current
        ) {
          reelVideoRef.current.muted =
            true;
        }
      } else {
        setVideoMuted(false);

        if (
          reelVideoRef.current
        ) {
          reelVideoRef.current.muted =
            false;
        }
      }

      showControls();
    };
 
  const handleVideoSeek =
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const value =
        Number(
          e.target.value
        );

      if (
        !Number.isFinite(value)
      ) {
        return;
      }

      setVideoCurrentTime(
        value
      );

      if (
        reelVideoRef.current
      ) {
        reelVideoRef.current.currentTime =
          value;
      }

      showControls();
    };
 
  const handleVideoSpeed =
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      const value =
        Number(
          e.target.value
        );

      if (
        !Number.isFinite(value)
      ) {
        return;
      }

      setVideoSpeed(value);

      if (
        reelVideoRef.current
      ) {
        reelVideoRef.current.playbackRate =
          value;
      }

      showControls();
    };
 
  const handleVideoFullscreen =
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const container =
        reelContainerRef.current;

      if (!container) {
        return;
      }

      try {
        if (
          document.fullscreenElement
        ) {
          await document.exitFullscreen();
        } else if (
          container.requestFullscreen
        ) {
          await container.requestFullscreen();
        }
      } catch (error) {
        console.error(error);
      }

      showControls();
    };
 
  const handleVideoMouseMove =
    () => {
      showControls();
    };

  
  const closeImagePicker =
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();

      setShowImagePicker(false);
    };
 
  return (
    <>
      
      <div
        onClick={
          handlePostClick
        }
        className="
          bg-[var(--bg-color)]
          text-[var(--text-color)]
          border
          border-blue-500
          relative
          h-64
          p-2
          cursor-pointer
        "
      >
        {/* =================================================
            USER HEADER
        ================================================== */}

        <div className="flex items-center gap-1">
          <Link
            to={`/profile/${post.user?.id}`}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <p
              className="
                font-bold
                text-white
                pb-1
                bg-black
                text-[40px]
                rounded-full
                w-12
                h-12
                text-center
                flex
                flex-col
                items-center
                justify-center
              "
            >
              {post.user
                ?.first_name?.[0]}
            </p>
          </Link>

          <div>
            <Link
              to={`/profile/${post.user?.id}`}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <p className="font-semibold">
                {post.user?.first_name}{" "}
                {post.user?.last_name}
              </p>
            </Link>

            <p className="text-xs">
              {new Date(
                post.created_at
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        {post.content && (
          <div
            className="
              px-3
              pb-2
              font-semibold
              break-words
              whitespace-normal
              text-[10px]
            "
          >
            <p className="px-2">
              {shouldShowMore
                ? shortText
                : text}

              {shouldShowMore && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    handlePostClick();
                  }}
                  className="
                    ml-1
                    text-blue-600
                    font-bold
                    hover:text-blue-800
                    hover:underline
                  "
                >
                  See more
                </button>
              )}
            </p>
          </div>
        )}

        {/* =================================================
            MEDIA
        ================================================== */}

        <div
          className="px-1"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* IMAGE */}

          {hasImage && (
            <ImageGridLibrary
              media={post.media.filter(
                (item) =>
                  item.type ===
                  "image"
              )}
              postId={post.id}
            />
          )}

          {/* VIDEO */}

          {media?.type ===
            "video" && (
            <video
              src={`http://localhost:8000/api/video/stream/${post.id}`}
              className="
                w-full
                h-40
                object-cover
              "
              controls
              muted
              autoPlay
              loop
              playsInline
              onClick={(e) => {
                /*
                 * The video itself should behave
                 * like the saved post and redirect.
                 *
                 * We intentionally do NOT stop
                 * propagation here.
                 */

                handlePostClick(
                  e
                );
              }}
            />
          )}
        </div>

        {/* =================================================
            CARD ACTIONS
        ================================================== */}

        <div
          className="
            absolute
            top-2
            right-2
            inline-flex
            items-center
            gap-2
          "
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {/* VIEW */}

          <button
            type="button"
            onClick={
              handleViewPost
            }
            className="
              text-black
              p-1
              text-center
              inline-flex
              items-center
              gap-1
              rounded-lg
              bg-gray-200
              text-xs
              hover:bg-gray-300
            "
            title="View"
          >
            <Eye size={15} />

            {post.views || 0}
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={
              handleCardDelete
            }
            className="
              rounded
              p-1
              hover:bg-gray-200
            "
            title="Remove"
            disabled={
              deleteLoading ===
              post.id
            }
          >
            {deleteLoading ===
            post.id ? (
              <Loader2
                className="
                  w-4
                  h-4
                  animate-spin
                  text-red-600
                "
              />
            ) : (
              <Trash2
                className="
                  w-4
                  h-4
                  text-red-600
                "
              />
            )}
          </button>

          {/* VIDEO DOWNLOAD */}

          {hasVideo && (
            <button
              type="button"
              onClick={(e) =>
                handleDownloadVideo(
                  e,
                  post
                )
              }
              className="
                p-1
                rounded
                hover:bg-gray-200
              "
              title="Download video"
            >
              {downloading ===
              post.id ? (
                <Loader2
                  className="
                    w-4
                    h-4
                    animate-spin
                    text-blue-600
                  "
                />
              ) : (
                <Download
                  className="
                    w-4
                    h-4
                    text-blue-600
                  "
                />
              )}
            </button>
          )}

          {/* IMAGE DOWNLOAD */}

          {hasImage && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setShowImagePicker(
                  true
                );
              }}
              className="
                flex
                items-center
                gap-2
                font-bold
                text-[15px]
                px-2
                py-2
                hover:text-gray-600
                text-gray-800
                hover:bg-gray-50
                rounded
              "
              title="Download image"
            >
              {downloading ===
              post.id ? (
                <Loader2
                  className="
                    w-4
                    h-4
                    animate-spin
                    text-blue-600
                  "
                />
              ) : (
                <Download
                  className="
                    w-4
                    h-4
                    text-blue-600
                  "
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          REEL MODAL
      ====================================================== */}

      {showContentModal &&
        selectedReel && (
          <div
            className="
              fixed
              inset-0
              bg-black/90
              z-[9999]
              flex
              items-center
              justify-center
              p-4
            "
            onClick={
              closeContentModal
            }
          >
            <div
              className="
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                rounded-2xl
                shadow-2xl
                w-full
                max-w-2xl
                max-h-[92vh]
                overflow-hidden
                flex
                flex-col
              "
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* =================================================
                  MODAL HEADER
              ================================================== */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-5
                  py-4
                  border-b
                  flex-shrink-0
                "
              >
                {/* USER */}

                <div className="flex items-center gap-3">
                  <Link
                    to={`/profile/${selectedReel.user?.id}`}
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <div
                      className="
                        w-10
                        h-10
                        rounded-full
                        bg-black
                        text-white
                        flex
                        items-center
                        justify-center
                        text-xl
                        font-bold
                      "
                    >
                      {
                        selectedReel
                          .user
                          ?.first_name?.[0]
                      }
                    </div>
                  </Link>

                  <div>
                    <p className="font-bold">
                      {
                        selectedReel
                          .user
                          ?.first_name
                      }{" "}
                      {
                        selectedReel
                          .user
                          ?.last_name
                      }
                    </p>

                    <p className="text-xs">
                      {new Date(
                        selectedReel.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    MODAL ACTIONS
                ================================================== */}

                <div className="flex items-center gap-2">
                  {/* VIEW */}

                  <button
                    type="button"
                    onClick={
                      handleModalView
                    }
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-gray-200
                      hover:bg-gray-300
                      text-gray-700
                      flex
                      items-center
                      justify-center
                    "
                    title="View"
                  >
                    <Eye size={17} />
                    {selectedReel.views || 0}
                  </button>

                  {/* VIDEO DOWNLOAD */}

                  {selectedReel.media?.some(
                    (item) =>
                      item.type ===
                      "video"
                  ) && (
                    <button
                      type="button"
                      onClick={(e) =>
                        handleDownloadVideo(
                          e,
                          selectedReel
                        )
                      }
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-gray-200
                        hover:bg-gray-300
                        text-blue-600
                        flex
                        items-center
                        justify-center
                      "
                      title="Download"
                    >
                      {downloading ===
                      selectedReel.id ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Download
                          size={17}
                        />
                      )}
                    </button>
                  )}

                  {/* IMAGE DOWNLOAD */}

                  {selectedReel.media?.some(
                    (item) =>
                      item.type ===
                      "image"
                  ) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        /*
                         * Reuse the existing
                         * image picker.
                         */

                        setShowImagePicker(
                          true
                        );
                      }}
                      className="
                        w-9
                        h-9
                        rounded-full
                        bg-gray-200
                        hover:bg-gray-300
                        text-blue-600
                        flex
                        items-center
                        justify-center
                      "
                      title="Download image"
                    >
                      <Download
                        size={17}
                      />
                    </button>
                  )}

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={
                      handleModalDelete
                    }
                    disabled={
                      deleteLoading ===
                      selectedReel.id
                    }
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-gray-200
                      hover:bg-gray-300
                      text-red-600
                      flex
                      items-center
                      justify-center
                    "
                    title="Delete"
                  >
                    {deleteLoading ===
                    selectedReel.id ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2
                        size={17}
                      />
                    )}
                  </button>

                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      closeContentModal();
                    }}
                    className="
                      w-9
                      h-9
                      rounded-full
                      bg-gray-200
                      hover:bg-gray-300
                      flex
                      items-center
                      justify-center
                      text-gray-700
                      text-lg
                    "
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* =================================================
                  MODAL CONTENT
              ================================================== */}

              <div
                className="
                  overflow-y-auto
                  scrollbar
                  scrollbar-thumb-gray-200
                  scrollbar-track-transparent
                  scrollbar-thin
                  p-5
                "
              >
                {/* FULL TEXT */}

                {selectedReel.content && (
                  <div
                    className="
                      mb-5
                      text-sm
                      leading-6
                      whitespace-pre-wrap
                      break-words
                    "
                  >
                    {
                      selectedReel.content
                    }
                  </div>
                )}

                {/* IMAGES */}

                {selectedReel.media?.some(
                  (item) =>
                    item.type ===
                    "image"
                ) && (
                  <div className="mb-5">
                    <ImageGridLibraryPreview
                      media={selectedReel.media.filter(
                        (item) =>
                          item.type ===
                          "image"
                      )}
                      postId={
                        selectedReel.id
                      }
                    />
                  </div>
                )}

                {/* =================================================
                    VIDEO
                ================================================== */}

                {selectedReel.media?.some(
                  (item) =>
                    item.type ===
                    "video"
                ) && (
                  <div
                    ref={
                      reelContainerRef
                    }
                    className="
                      relative
                      w-full
                      bg-black
                      rounded-xl
                      overflow-hidden
                      select-none
                    "
                    onMouseMove={
                      handleVideoMouseMove
                    }
                  >
                    {/* VIDEO */}

                    <video
                      ref={
                        reelVideoRef
                      }
                      src={`http://localhost:8000/api/video/stream/${selectedReel.id}`}
                      className="
                        w-full
                        max-h-[65vh]
                        object-contain
                        bg-black
                        cursor-pointer
                      "
                      playsInline
                      autoPlay
                      muted={
                        videoMuted
                      }
                      preload="auto"
                      onClick={
                        handleVideoClick
                      }
                      onLoadedMetadata={
                        handleVideoLoadedMetadata
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
                        handleVideoTimeUpdate
                      }
                      onEnded={
                        handleVideoEnded
                      }
                    />

                    {/* =================================================
                        LOADING
                    ================================================== */}

                    {videoLoading && (
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
                        <Loader2
                          className="
                            w-10
                            h-10
                            text-white
                            animate-spin
                          "
                        />
                      </div>
                    )}

                    {/* =================================================
                        VIDEO CONTROLS
                    ================================================== */}

                    <div
                      className={`
                        absolute
                        inset-0
                        pointer-events-none
                        transition-opacity
                        duration-200
                        ${
                          showVideoControls
                            ? "opacity-100"
                            : "opacity-0"
                        }
                      `}
                    >
                      {/* =================================================
                          TOP CONTROLS
                      ================================================== */}

                      <div
                        className="
                          absolute
                          top-0
                          left-0
                          right-0
                          p-3
                          flex
                          items-center
                          justify-between
                          bg-gradient-to-b
                          from-black/70
                          to-transparent
                          pointer-events-auto
                        "
                      >
                        {/* VOLUME */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            type="button"
                            onClick={
                              toggleVideoMute
                            }
                            className="
                              w-9
                              h-9
                              rounded-full
                              bg-black/50
                              text-white
                              flex
                              items-center
                              justify-center
                              hover:bg-black/70
                            "
                            title={
                              videoMuted
                                ? "Unmute"
                                : "Mute"
                            }
                          >
                            {videoMuted ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-5 h-5"
                              >
                                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                                <path d="m23 9-6 6" />
                                <path d="m17 9 6 6" />
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
                                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                              </svg>
                            )}
                          </button>

                          {/* VOLUME RANGE */}

                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={
                              videoMuted
                                ? 0
                                : videoVolume
                            }
                            onChange={
                              handleVideoVolume
                            }
                            className="
                              w-24
                              h-1
                              cursor-pointer
                              accent-white
                            "
                          />
                        </div>

                        {/* RIGHT */}

                        <div className="flex items-center gap-2">
                          {/* SPEED */}

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                setShowVideoSpeed(
                                  (prev) =>
                                    !prev
                                );

                                showControls();
                              }}
                              className="
                                h-9
                                px-3
                                rounded-full
                                bg-black/50
                                text-white
                                text-xs
                                font-semibold
                                hover:bg-black/70
                              "
                            >
                              {videoSpeed}x
                            </button>

                            {showVideoSpeed && (
                              <div
                                className="
                                  absolute
                                  right-0
                                  top-11
                                  bg-black/90
                                  rounded-lg
                                  p-3
                                  w-36
                                "
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >
                                <p className="text-white text-xs mb-2">
                                  Speed
                                </p>

                                <input
                                  type="range"
                                  min="0.25"
                                  max="2"
                                  step="0.25"
                                  value={
                                    videoSpeed
                                  }
                                  onChange={
                                    handleVideoSpeed
                                  }
                                  className="
                                    w-full
                                    h-1
                                    accent-white
                                  "
                                />

                                <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                                  <span>
                                    0.25x
                                  </span>

                                  <span>
                                    1x
                                  </span>

                                  <span>
                                    2x
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* FULLSCREEN */}

                          <button
                            type="button"
                            onClick={
                              handleVideoFullscreen
                            }
                            className="
                              w-9
                              h-9
                              rounded-full
                              bg-black/50
                              text-white
                              flex
                              items-center
                              justify-center
                              hover:bg-black/70
                            "
                            title="Fullscreen"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="w-5 h-5"
                            >
                              <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                              <path d="M16 21h3a2 2 0 0 1 2-2v-3" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* =================================================
                          CENTER PLAY / PAUSE
                      ================================================== */}

                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                          pointer-events-auto
                        "
                        onClick={
                          handleVideoClick
                        }
                      >
                        <button
                          type="button"
                          className="
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
                        >
                          {videoPlaying ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-8 h-8"
                            >
                              <rect
                                x="6"
                                y="4"
                                width="4"
                                height="16"
                                rx="1"
                              />

                              <rect
                                x="14"
                                y="4"
                                width="4"
                                height="16"
                                rx="1"
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
                      </div>

                      {/* =================================================
                          BOTTOM CONTROLS
                      ================================================== */}

                      <div
                        className="
                          absolute
                          bottom-0
                          left-0
                          right-0
                          p-3
                          bg-gradient-to-t
                          from-black/80
                          to-transparent
                          pointer-events-auto
                        "
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        {/* SEEK */}

                        <input
                          type="range"
                          min="0"
                          max={
                            videoDuration ||
                            0
                          }
                          step="0.01"
                          value={Math.min(
                            videoCurrentTime,
                            videoDuration ||
                              0
                          )}
                          onChange={
                            handleVideoSeek
                          }
                          className="
                            w-full
                            h-1
                            cursor-pointer
                            accent-white
                            block
                          "
                        />

                        {/* TIME */}

                        <div className="flex justify-between mt-2">
                          <span className="text-white text-xs">
                            {formatVideoTime(
                              videoCurrentTime
                            )}
                          </span>

                          <span className="text-white text-xs">
                            {formatVideoTime(
                              videoDuration
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================== */}

              <div
                className="
                  border-t
                  px-5
                  py-3
                  flex
                  justify-end
                  flex-shrink-0
                "
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    closeContentModal();
                  }}
                  className="
                    px-5
                    py-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    rounded-lg
                    font-semibold
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      {/* =====================================================
          IMAGE DOWNLOAD MODAL
      ====================================================== */}

      {showImagePicker && (
        <div
          className="
            fixed
            inset-0
            bg-black/70
            z-[10000]
            flex
            items-center
            justify-center
            p-4
          "
          onClick={
            closeImagePicker
          }
        >
          <div
            className="
              bg-white
              relative
              rounded-lg
              p-4
              w-80
              max-h-[80vh]
              overflow-y-auto
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closeImagePicker
              }
              className="
                absolute
                right-3
                top-4
                text-black
                rounded-full
                hover:text-gray-700
                hover:bg-gray-50
                bg-gray-100
                transition
                w-6
                h-6
                flex
                items-center
                justify-center
              "
            >
              ✕
            </button>

            <h2 className="font-bold mb-3 text-black">
              Select image to download
            </h2>

            {post.media?.some(
              (item) =>
                item.type ===
                "image"
            ) && (
              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-3
                  cursor-pointer
                  hover:bg-gray-100
                  p-2
                  rounded
                "
              >
                <DownloadImageFlex
                  downloadSingleImage={
                    downloadSingleImage
                  }
                  progressMap={
                    progressMap
                  }
                  media={post.media.filter(
                    (item) =>
                      item.type ===
                      "image"
                  )}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}