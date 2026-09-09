






import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import logo from '../../layout/image/favicon.png'
import PostOptions from "./PostOption";
import { useAuth } from "../../layout/AuthProvider";
import { PostCommentInput } from "./PostCommentInput";
import { useSwipeable } from "react-swipeable";
import PostOptionsId from "./PostOptionId";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";



export default function PostVideoPageId({
  image,
  postComments,
  setPostComments,
  showUsersPopup,
  setShowUsersPopup,
  loadingComment,
  showEmoji,
  setShowEmoji,
  emojiList,
  newComment,
  setNewComment,
  setImage,
  chats,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isSeeking, setIsSeeking] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  const [showOverlay, setShowOverlay] = useState(true);

  const timeoutRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [hasNextVideo, setHasNextVideo] = useState(true);
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resettingVideos, setResettingVideos] = useState(false);

  const [notifyNext, setNotifyNext] = useState(false);
  const [cancelTimer, setCancelTimer] = useState(null);
  const [nextCountdown, setNextCountdown] = useState(5);

  const navigationLockRef = useRef(false);
  const initialVideoIdRef = useRef(Number(id));
  const autoNextCancelledRef = useRef(false);
  const autoNextUsedRef = useRef(false);

  const [counts, setCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [usersPreview, setUsersPreview] = useState([]);

  const [loading, setLoading] = useState(false);

  const { user: currentUser } = useAuth();

  const [showMore, setShowMore] = useState(false);

  const [showReactions, setShowReactions] = useState(false);
  const [showCommentPop, setShowCommentPop] = useState(false);

  const [notify, setNotify] = useState({
    message: "",
    type: "",
  });

  const [reactionLoading, setReactionLoading] = useState(false);

  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);



  const [messageOpenShare, setMessageOpenShare] = useState(false);
  const [shares, setShares] = useState(false);

  const viewedRef = useRef(null);
  const viewPromiseRef = useRef(null);

  const currentPost = videos[currentIndex];

  const currentMedia = currentPost?.media?.find(
    (m) => m.type === "video"
  );

  const overlayTimerRef = useRef(null);

    const showVideoControls = () => {
      setShowOverlay(true);

      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
      }

      if (!isPlaying || videoLoading) {
        return;
      }

      overlayTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 1500);
    };

    const hideVideoControls = () => {
      if (overlayTimerRef.current) {
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = null;
      }

      setShowOverlay(false);
    };

    useEffect(() => {
      return () => {
        if (overlayTimerRef.current) {
          clearTimeout(overlayTimerRef.current);
        }
      };
    }, []);

    useEffect(() => {
        if (videoLoading) {
          hideVideoControls();
          return;
        }

        if (!isPlaying) {
          showVideoControls();
          return;
      }

  showVideoControls();
}, [isPlaying, videoLoading]);


  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const totalSeconds = Math.floor(seconds);

    const minutes = Math.floor(totalSeconds / 60);

    const secs = totalSeconds % 60;

    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (cancelTimer) {
        clearTimeout(cancelTimer);
      }
    };
  }, [cancelTimer]);

  
  
  useEffect(() => {
  let mounted = true;

  autoNextUsedRef.current = false;
  autoNextCancelledRef.current = false;
  initialVideoIdRef.current = Number(id);

  const fetchVideos = async () => {
    setLoadingVideos(true);

    try {
      const res = await api.get("/api/posts-get-video");

      const data = Array.isArray(res.data?.posts)
        ? res.data.posts
        : [];

      const allVideoPosts = data.filter(
        (post) =>
          Array.isArray(post?.media) &&
          post.media.some(
            (media) =>
              media?.type === "video" &&
              media?.url
          )
      );

      const requestedId = Number(id);

      const requestedVideo = allVideoPosts.find(
        (post) => Number(post.id) === requestedId
      );

      const unviewedVideos = allVideoPosts.filter(
        (post) => post?.viewed === false
      );

      const videoPosts = requestedVideo
        ? [
            requestedVideo,
            ...unviewedVideos.filter(
              (post) =>
                Number(post.id) !== requestedId
            ),
          ]
        : unviewedVideos;

      if (!mounted) return;

      setVideos(videoPosts);

      const foundIndex = videoPosts.findIndex(
        (post) =>
          Number(post.id) === requestedId
      );

      setCurrentIndex(
        foundIndex >= 0 ? foundIndex : 0
      );

      if (unviewedVideos.length === 0) {
        setHasNextVideo(false);
        setShowResetPopup(true);
      } else {
        setHasNextVideo(true);
        setShowResetPopup(false);
      }

    } catch (error) {
      console.error(
        "FETCH VIDEO ERROR:",
        error.response?.data || error
      );

      if (mounted) {
        setNotify({
          message:
            error.response?.data?.message ||
            "Unable to load videos.",
          type: "error",
        });

        setVideos([]);
      }
    } finally {
      if (mounted) {
        setLoadingVideos(false);
      }
    }
  };

  fetchVideos();

  return () => {
    mounted = false;
  };
}, [id]);



  useEffect(() => {
    const next = videos[currentIndex + 1];

    const nextVideo = next?.media?.find(
      (m) => m.type === "video"
    );

    if (!nextVideo?.url) return;

    const preload = document.createElement("video");

    preload.src = nextVideo.url;
    preload.preload = "auto";

    preload.load();

    return () => {
      preload.src = "";
    };
  }, [currentIndex, videos]);

  // --------------------------------------------------
  // RESET VIDEO STATE WHEN VIDEO CHANGES
  // --------------------------------------------------

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setVideoLoading(true);
    setIsPlaying(false);
    setShowMore(false);
    setShowOverlay(true);
    setShowSpeed(false);

    viewedRef.current = null;
    viewPromiseRef.current = null;

    const video = videoRef.current;

    if (!video) return;

    video.pause();
    video.currentTime = 0;

    if (currentMedia?.url) {
      video.load();
    }
  }, [currentPost?.id, currentMedia?.url]);

  // --------------------------------------------------
  // VIDEO EVENTS
  // --------------------------------------------------

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setVideoLoading(false);
    };

    const onPause = () => {
      setIsPlaying(false);
      setShowOverlay(true);
    };

    const onWaiting = () => {
      setVideoLoading(true);
    };

    const onLoadStart = () => {
      setVideoLoading(true);
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);

      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackRate;
    };

    const onLoadedData = () => {
      setVideoLoading(false);
      setDuration(video.duration || 0);

      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackRate;

      /*
       * Do NOT automatically play here.
       *
       * The normal browser autoplay behavior is preserved.
       */
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setVideoLoading(false);
        })
        .catch((error) => {
          console.log("AUTOPLAY BLOCKED:", error);

          /*
           * Browser may block autoplay with sound.
           * Fall back to muted.
           */
          video.muted = true;

          setIsMuted(true);

          video
            .play()
            .then(() => {
              setIsPlaying(true);
              setVideoLoading(false);
            })
            .catch(() => {
              setIsPlaying(false);
              setVideoLoading(false);
            });
        });
    };

    const onCanPlay = () => {
      setVideoLoading(false);

      setDuration(video.duration || 0);
    };

    const onPlaying = () => {
      setVideoLoading(false);
      setIsPlaying(true);
    };

    const onTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(video.currentTime);
      }
    };

    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };

    const onRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    const onEnded = () => {
      handleVideoEnd();
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    video.addEventListener("waiting", onWaiting);
    video.addEventListener("loadstart", onLoadStart);

    video.addEventListener(
      "loadedmetadata",
      onLoadedMetadata
    );

    video.addEventListener(
      "loadeddata",
      onLoadedData
    );

    video.addEventListener(
      "canplay",
      onCanPlay
    );

    video.addEventListener(
      "playing",
      onPlaying
    );

    video.addEventListener(
      "timeupdate",
      onTimeUpdate
    );

    video.addEventListener(
      "volumechange",
      onVolumeChange
    );

    video.addEventListener(
      "ratechange",
      onRateChange
    );

    video.addEventListener(
      "ended",
      onEnded
    );

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);

      video.removeEventListener(
        "waiting",
        onWaiting
      );

      video.removeEventListener(
        "loadstart",
        onLoadStart
      );

      video.removeEventListener(
        "loadedmetadata",
        onLoadedMetadata
      );

      video.removeEventListener(
        "loadeddata",
        onLoadedData
      );

      video.removeEventListener(
        "canplay",
        onCanPlay
      );

      video.removeEventListener(
        "playing",
        onPlaying
      );

      video.removeEventListener(
        "timeupdate",
        onTimeUpdate
      );

      video.removeEventListener(
        "volumechange",
        onVolumeChange
      );

      video.removeEventListener(
        "ratechange",
        onRateChange
      );

      video.removeEventListener(
        "ended",
        onEnded
      );
    };
  }, [
    currentIndex,
    currentMedia?.url,
    isSeeking,
    volume,
    isMuted,
    playbackRate,
  ]);

  const markVideoViewed = async () => {
    const currentId = currentPost?.id;

    if (!currentId) return;

    if (viewedRef.current === currentId) {
      return (
        viewPromiseRef.current ||
        Promise.resolve()
      );
    }

    viewedRef.current = currentId;

    viewPromiseRef.current = api
      .post(`/api/post/${currentId}/view`)
      .catch((error) => {
        console.error(
          "VIDEO VIEW ERROR:",
          error.response?.data || error
        );

        if (
          viewedRef.current === currentId
        ) {
          viewedRef.current = null;
        }
      })
      .finally(() => {
        viewPromiseRef.current = null;
      });

    return viewPromiseRef.current;
  };

  // --------------------------------------------------
  // PLAY
  // --------------------------------------------------

  const togglePlay = async (e) => {
    e?.stopPropagation();

    const video = videoRef.current;

    if (!video) return;

    showVideoControls();

    try {
      if (video.paused) {
        setVideoLoading(true);

        await video.play();

        setIsPlaying(true);
      } else {
        video.pause();

        setIsPlaying(false);
      }
    } catch (error) {
      console.error(
        "PLAY ERROR:",
        error
      );
    }
  };

  // --------------------------------------------------
  // MUTE
  // --------------------------------------------------

  const toggleMute = (e) => {
    e?.stopPropagation();

    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setIsMuted(video.muted);

    showVideoControls();
  };

  // --------------------------------------------------
  // VOLUME
  // --------------------------------------------------

  const handleVolumeChange = (e) => {
    e?.stopPropagation();

    const value = Number(
      e.target.value
    );

    const video = videoRef.current;

    if (!video) return;

    video.volume = value;

    if (
      value > 0 &&
      video.muted
    ) {
      video.muted = false;
      setIsMuted(false);
    }

    if (value === 0) {
      video.muted = true;
      setIsMuted(true);
    }

    setVolume(value);

    showVideoControls();
  };

  // --------------------------------------------------
  // SPEED
  // --------------------------------------------------

  const handleSpeedChange = (e) => {
    e?.stopPropagation();

    const value = Number(
      e.target.value
    );

    const video = videoRef.current;

    if (!video) return;

    video.playbackRate = value;

    setPlaybackRate(value);

    showVideoControls();
  };

  // --------------------------------------------------
  // FULLSCREEN
  // --------------------------------------------------

  const goFullScreen = async (e) => {
    e?.stopPropagation();

    const video = videoRef.current;

    if (!video) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (
        video.requestFullscreen
      ) {
        await video.requestFullscreen();
      }
    } catch (error) {
      console.error(
        "FULLSCREEN ERROR:",
        error
      );
    }

    showVideoControls();
  };

  // --------------------------------------------------
  // SEEK
  // --------------------------------------------------

  const handleSeekStart = () => {
    setIsSeeking(true);
    showVideoControls();
  };

  const handleSeekChange = (e) => {
    const value = Number(
      e.target.value
    );

    setCurrentTime(value);

    showVideoControls();
  };

  const handleSeekEnd = (e) => {
    const value = Number(
      e.target.value
    );

    if (videoRef.current) {
      videoRef.current.currentTime =
        value;
    }

    setCurrentTime(value);

    setIsSeeking(false);

    showVideoControls();
  };

    
    const fetchNextVideo = async () => {
      if (!currentPost?.id) {
        return false;
      }

      try {
        const res = await api.get(
          `/api/post/${currentPost.id}/next-video`
        );

        console.log(
          "NEXT VIDEO:",
          res.data
        );

        const nextVideo =
          res.data?.video;

       
        if (!nextVideo) {
          setHasNextVideo(false);
          setShowResetPopup(true);

          return false;
        }

        setHasNextVideo(true);
        setShowResetPopup(false);

        setVideos((prev) => {
          const existingIndex =
            prev.findIndex(
              (item) =>
                Number(item.id) ===
                Number(nextVideo.id)
            );

          if (existingIndex >= 0) {
            setCurrentIndex(
              existingIndex
            );

            return prev;
          }

          const updated = [
            ...prev,
            nextVideo,
          ];

          setCurrentIndex(
            updated.length - 1
          );

          return updated;
        });

        return true;
      } catch (error) {
        console.error(
          "NEXT VIDEO ERROR:",
          error.response?.data ||
            error
        );

        if (
          error.response?.status ===
            404 ||
          error.response?.data
            ?.all_viewed === true
        ) {
          setHasNextVideo(false);
          setShowResetPopup(true);

          return false;
        }

        return false;
      }
    };
  
    const handleNext = async () => {
  if (
    navigationLockRef.current ||
    !currentPost?.id
  ) {
    return;
  }

  navigationLockRef.current = true;

  try {
    
    if (cancelTimer) {
      clearTimeout(cancelTimer);
      setCancelTimer(null);
    }

    setNotifyNext(false);
    setNextCountdown(5);

    
    await markVideoViewed();

    const found = await fetchNextVideo();

    if (!found) {
      setHasNextVideo(false);
      setShowResetPopup(true);
    }

  } finally {
    navigationLockRef.current = false;
  }
};
    

    const handlePrev = () => {
      if (
        navigationLockRef.current
      ) {
        return;
      }

      if (currentIndex > 0) {
        setCurrentIndex(
          (index) => index - 1
        );

        setHasNextVideo(true);

        setShowResetPopup(false);
      }
    };

    const handleVideoEnd = async () => {
        if (!currentPost?.id) {
          return;
        }

        await markVideoViewed();

        setIsPlaying(false);

        const isInitialVideo =
          Number(currentPost.id) ===
          Number(initialVideoIdRef.current);

       
        if (
          isInitialVideo &&
          !autoNextUsedRef.current &&
          !autoNextCancelledRef.current
        ) {
          autoNextUsedRef.current = true;

          setNextCountdown(5);
          setNotifyNext(true);

          return;
        }

        setNotifyNext(false);
      };

    
      
      useEffect(() => {
          if (!notifyNext) {
            return;
          }

          if (nextCountdown <= 0) {
            setNotifyNext(false);

            if (
              !autoNextCancelledRef.current &&
              !navigationLockRef.current
            ) {
              handleNext();
            }

            return;
          }

          const timer = setTimeout(() => {
            setNextCountdown(
              (prev) => prev - 1
            );
          }, 1000);

          return () => {
            clearTimeout(timer);
          };
        }, [notifyNext, nextCountdown]);




    const cancelAutoNext = () => {
        if (cancelTimer) {
          clearTimeout(cancelTimer);
        }

        setCancelTimer(null);

        autoNextCancelledRef.current = true;

        setNotifyNext(false);
        setNextCountdown(5);
      };

    

    const resetViewedVideos =
      async () => {
        if (resettingVideos) {
          return;
        }

        setResettingVideos(true);
        setShowResetPopup(false);

        try {
          await api.post(
            "/api/videos/reset-views"
          );

          const res =
            await api.get(
              "/api/posts-get-video"
            );

          const data =
            Array.isArray(
              res.data?.posts
            )
              ? res.data.posts
              : [];

          const videoPosts =
            data.filter(
              (post) =>
                Array.isArray(
                  post?.media
                ) &&
                post.media.some(
                  (media) =>
                    media?.type ===
                      "video" &&
                    media?.url
                )
            );

        setVideos(videoPosts);

        const requestedId =
          Number(id);

        const foundIndex =
          videoPosts.findIndex(
            (post) =>
              Number(post.id) ===
              requestedId
          );

        setCurrentIndex(
          foundIndex >= 0
            ? foundIndex
            : 0
        );

        setHasNextVideo(
          videoPosts.length > 1
        );

        /*
         * Reset automatic-next state.
         *
         * The video that was originally
         * opened can automatically move once
         * again after reset.
         */
        autoNextUsedRef.current =
          false;

        viewedRef.current = null;
        viewPromiseRef.current =
          null;

        setCurrentTime(0);
        setDuration(0);
        setVideoLoading(true);

        setTimeout(() => {
          const video =
            videoRef.current;

          if (!video) return;

          video.currentTime = 0;

          video.load();

          video.play().catch(
            () => {}
          );
        }, 100);
      } catch (error) {
        console.error(
          "RESET VIDEO ERROR:",
          error.response?.data ||
            error
        );

        setNotify({
          message:
            error.response?.data
              ?.message ||
            "Unable to reset viewed videos.",
          type: "error",
        });
      } finally {
        setResettingVideos(
          false
        );
      }
    };

  // --------------------------------------------------
  // SWIPE
  // --------------------------------------------------

  const handlers =
    useSwipeable({
      onSwipedUp: (
        eventData
      ) => {
        if (
          Math.abs(
            eventData.deltaY
          ) < 50
        ) {
          return;
        }

        handleNext();
      },

      onSwipedDown: (
        eventData
      ) => {
        if (
          Math.abs(
            eventData.deltaY
          ) < 50
        ) {
          return;
        }

        handlePrev();
      },

      preventScrollOnSwipe:
        true,

      trackTouch: true,

      trackMouse: false,

      delta: 50,
    });

  // --------------------------------------------------
  // MOUSE / TOUCH CONTROLS
  // --------------------------------------------------

  const handleMouseMove = () => {
    showVideoControls();
  };

  const handleVideoTouch = () => {
    /*
     * Mobile:
     * touching the video shows controls
     * and starts the hide timer again.
     */
    showVideoControls();
  };

  // --------------------------------------------------
  // REACTIONS
  // --------------------------------------------------

  const reactionList = [
    "❤️",
    "👍",
    "😂",
    "😮",
    "😢",
    "🔥",
  ];

  const toggleReaction =
    async (emoji) => {
      if (!currentPost?.id)
        return;

      if (!currentUser) {
        toast.error(
          "Please log in to react.",
          "error"
        );

        return;
      }

      if (reactionLoading)
        return;

      setReactionLoading(true);

      try {
        if (
          myReaction === emoji
        ) {
          setMyReaction(null);

          setCounts((prev) => {
            const copy = {
              ...prev,
            };

            copy[emoji] =
              Number(
                copy[emoji] || 0
              ) - 1;

            if (
              copy[emoji] <= 0
            ) {
              delete copy[
                emoji
              ];
            }

            return copy;
          });

          setUsersPreview(
            (prev) =>
              prev.filter(
                (u) =>
                  u.id !==
                  currentUser.id
              )
          );

          await api.delete(
            `/api/post/${currentPost.id}/reaction`
          );

          return;
        }

        setCounts((prev) => {
          const copy = {
            ...prev,
          };

          if (myReaction) {
            copy[myReaction] =
              Number(
                copy[
                  myReaction
                ] || 1
              ) - 1;

            if (
              copy[myReaction] <=
              0
            ) {
              delete copy[
                myReaction
              ];
            }
          }

          copy[emoji] =
            Number(
              copy[emoji] || 0
            ) + 1;

          return copy;
        });

        setMyReaction(emoji);

        const res =
          await api.post(
            `/api/post/${currentPost.id}/reaction`,
            {
              emoji,
            }
          );

        if (
          res?.data?.counts
        ) {
          setCounts(
            res.data.counts
          );
        }

        if (
          res?.data?.users
        ) {
          setUsersPreview(
            res.data.users.slice(
              0,
              6
            )
          );
        }

        if (
          res?.data?.my_reaction
        ) {
          setMyReaction(
            res.data.my_reaction
          );
        }
      } catch (err) {
        console.error(
          "REACTION ERROR:",
          err.response?.data ||
            err
        );

        toast.error(
          "Reaction error",
          "error"
        );
      } finally {
        setReactionLoading(
          false
        );

        setShowReactions(
          false
        );
      }
    };

  const onLikeClick = () => {
    const emoji =
      myReaction || "👍";

    toggleReaction(emoji);
  };

  useEffect(() => {
    if (!currentPost) return;

    setCounts(
      currentPost.reaction_counts ||
        {}
    );

    setMyReaction(
      currentPost.my_reaction ||
        null
    );

    setUsersPreview(
      currentPost.reacted_users?.slice(
        0,
        6
      ) || []
    );
  }, [currentPost]);

  useEffect(() => {
    if (!currentPost?.id)
      return;

    api
      .get(
        `/api/post/${currentPost.id}/reactions`
      )
      .then((res) => {
        setCounts(
          res.data.counts || {}
        );

        setUsersPreview(
          res.data.users?.slice(
            0,
            6
          ) || []
        );

        setMyReaction(
          res.data.my_reaction ||
            null
        );
      })
      .catch((error) => {
        console.error(
          "REACTIONS ERROR:",
          error.response?.data ||
            error
        );
      });
  }, [currentPost?.id]);

  const commentInputRef =
    useRef(null);

  const focusCommentInput = () => {
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  const addReplyToComment = (
    comments,
    parentId,
    reply
  ) => {
    return comments.map(
      (comment) => {
        if (
          comment.id ===
          parentId
        ) {
          return {
            ...comment,
            replies: [
              ...(comment.replies ||
                []),
              reply,
            ],
          };
        }

        if (
          comment.replies?.length
        ) {
          return {
            ...comment,
            replies:
              addReplyToComment(
                comment.replies,
                parentId,
                reply
              ),
          };
        }

        return comment;
      }
    );
  };

  const postComment = async (
    emoji = null,
    imageFile = null,
    parentId = null
  ) => {
    if (!currentPost?.id)
      return;

    if (
      !newComment.trim() &&
      !emoji &&
      !imageFile
    ) {
      return;
    }

    setLoading(true);

    const formData =
      new FormData();

    if (emoji) {
      formData.append(
        "body",
        emoji
      );
    } else if (
      newComment.trim()
    ) {
      formData.append(
        "body",
        newComment.trim()
      );
    }

    if (
      imageFile instanceof File
    ) {
      formData.append(
        "image",
        imageFile
      );
    }

    try {
      const res =
        await api.post(
          `/api/posts/${currentPost.id}/comments`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      setPostComments(
        (prev) =>
          parentId
            ? addReplyToComment(
                prev,
                parentId,
                res.data.comment
              )
            : [
                res.data.comment,
                ...prev,
              ]
      );

      setNewComment("");
      setImage(null);
      setShowEmoji(false);
    } catch (err) {
      console.error(
        "COMMENT ERROR:",
        err.response?.data ||
          err
      );
    } finally {
      setLoading(false);
    }
  };

  const total = Object.values(
    counts || {}
  ).reduce(
    (a, b) =>
      a + Number(b || 0),
    0
  );

  const othersCount =
    usersPreview.filter(
      (u) =>
        u.id !==
        currentUser?.id
    ).length;

  const me =
    usersPreview.find(
      (u) =>
        u.id ===
        currentUser?.id
    );

  const text =
    currentPost?.content || "";

  const hasLongText =
    text.length > 200;

  const shortText =
    hasLongText
      ? `${text.substring(
          0,
          200
        )}...`
      : text;

  const handleCommentPop =
    () => {
      setShowCommentPop(
        (prev) => !prev
      );

      focusCommentInput();
    };

  const shareUrl =
    `${window.location.origin}/post/${currentPost?.id}`;

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

  const handleShare =
    async (platform) => {
      const url =
        shareLinks[platform];

      if (url) {
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        await navigator.clipboard.writeText(
          shareUrl
        );

        alert(
          "Link copied! Paste it in the app to share."
        );
      }

      if (currentPost?.id) {
        await api.post(
          `/api/post/${currentPost.id}/share`
        );
      }
    };

  // --------------------------------------------------
  // SHARE TO CHAT
  // --------------------------------------------------

  const shareToChat = async (
    chatId
  ) => {
    await api.post(
      `/api/chats/${chatId}/messages`,
      {
        type: "link",
        body: shareUrl,
      }
    );

    await api.post(
      `/api/post/${currentPost.id}/share`
    );
  };

  // --------------------------------------------------
  // LOADING SCREEN
  // --------------------------------------------------

  if (loadingVideos) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />

          <p className="text-white/70 text-sm">
            Loading video
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // NO VIDEO
  // --------------------------------------------------

  if (!currentMedia) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]">
        <div className="text-center text-white px-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-2.36a.75.75 0 0 1 1.08.67v6.38a.75.75 0 0 1-1.08.67l-4.72-2.36M4.5 18.75h7.5a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 12 5.25H4.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>

          <p className="text-lg font-semibold">
            No video available
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // COMMENT SCREEN
  // --------------------------------------------------
const commentScreen = (
  <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]">

    {/* HEADER */}
    <div className="shrink-0">
      <div className="flex p-4 items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${currentPost?.user?.id}`}
          >
            <p className="font-bold text-white bg-black text-[30px] rounded-full w-12 h-12 text-center flex items-center justify-center">
              {currentPost?.user?.name?.[0] || "?"}
            </p>
          </Link>

          <div>
            <Link
              to={`/profile/${currentPost?.user?.id}`}
            >
              <p className="font-semibold">
                {currentPost?.user?.name || "Unknown"}
              </p>
            </Link>

            <p className="text-xs">
              {currentPost?.created_at}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-3">
          <PostOptionsId
            post={currentPost}
            chats={chats}
          />

          <button
            type="button"
            onClick={handleCommentPop}
            className="w-10 h-10 rounded-full text-black bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* TEXT */}
      {currentPost?.content && (
        <div className="px-5 pb-4">
          <div className="max-h-28 overflow-y-auto no-scrollbar">
            <p className="text-xs leading-6 break-words [overflow-wrap:anywhere]">
              {showMore ? text : shortText}

              {hasLongText && (
                <button
                  type="button"
                  onClick={() => setShowMore((prev) => !prev)}
                  className="ml-1 text-blue-600 font-semibold hover:underline"
                >
                  {showMore ? " See less" : " See more"}
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* COUNTS */}
      <div className="flex justify-between border-t py-3 mx-4 items-center bg-[var(--bg-color)] text-[var(--text-color)]">
        <div className="flex gap-1 items-center">
          <div className="text-xs inline-flex items-center gap-2 bg-[var(--bg-color)] text-[var(--text-color)]">
            {Object.keys(counts).map((emoji) => (
              <span
                key={emoji}
                className="text-xs"
              >
                {emoji}
              </span>
            ))}

            {total > 0 && (
              <div className="text-xs flex items-center gap-1 cursor-pointer">
                {me && (
                  <span
                    className="font-semibold hover:underline"
                    onClick={() =>
                      setShowUsersPopup(true)
                    }
                  >
                    You
                  </span>
                )}

                {me && othersCount > 0 && (
                  <span>
                    and
                  </span>
                )}

                {othersCount > 0 && (
                  <span
                    className="hover:underline"
                    onClick={() =>
                      setShowUsersPopup(true)
                    }
                  >
                    {othersCount} other
                    {othersCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-3">
          {/* COMMENTS COUNT */}
          <p className="inline-flex bg-[var(--bg-color)] text-[var(--text-color)] gap-1 items-center">
            {currentPost?.comments_count}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>
          </p>

          {/* SHARES COUNT */}
          <p className="inline-flex bg-[var(--bg-color)] text-[var(--text-color)] gap-1 items-center">
            {currentPost?.shares_count}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
            </svg>
          </p>
        </div>
      </div>

      {/* REACTION BUTTONS */}
      <div className="flex items-center justify-around px-3 py-2 text-sm bg-[var(--bg-color)] text-[var(--text-color)] border-t">
        <div
          className="relative group"
          onMouseEnter={() =>
            setShowReactions(true)
          }
          onMouseLeave={() =>
            setShowReactions(false)
          }
        >
          {showReactions && (
            <div className="absolute bottom-10 left-0 bg-white shadow-xl rounded-full px-3 py-2 flex flex-row items-center gap-2 z-20">
              {reactionList.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() =>
                    !reactionLoading &&
                    toggleReaction(emoji)
                  }
                  className="text-2xl cursor-pointer hover:scale-125 transition shrink-0"
                >
                  {emoji}
                </button>
              ))}

              {/* MORE EMOJIS */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  setShowReactions(false);
                  setShowEmoji(true);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold shrink-0"
                title="More emojis"
              >
                +
              </button>
            </div>
          )}

          {/* LIKE */}
          <button
            type="button"
            onClick={onLikeClick}
            className={`flex items-center gap-1 font-semibold ${
              myReaction
                ? "text-blue-800"
                : ""
            }`}
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
                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
              />
            </svg>

            Like
          </button>
        </div>

        {/* COMMENT */}
        <button
          type="button"
          className="flex items-center gap-1 font-semibold"
          onClick={handleCommentPop}
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
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>

          Comment
        </button>

        {/* SHARE */}
        <button
          type="button"
          onClick={() =>
            setShares(!shares)
          }
          className="flex items-center gap-1 font-semibold"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
          </svg>

          Share
        </button>
      </div>
    </div>

    <div className="shrink-0 overflow-hidden">
      {currentPost && (
        <PostComment
          postId={currentPost.id}
          image={image}
          post={currentPost}
          postComments={postComments}
          setPostComments={setPostComments}
        />
      )}
    </div>
    
    <div
      className="shrink-0 p-2 border-t"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <PostCommentInput
        newComment={newComment}
        loading={loadingComment}
        setNewComment={setNewComment}
        setImage={setImage}
        image={image}
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        emojiList={emojiList}
        postComment={postComment}
        commentInputRef={commentInputRef}
      />
    </div>

  </div>
);


  return (
    <div className="flex h-screen w-full bg-neutral-950 overflow-hidden">
      {/* VIDEO AREA */}

      <div className="flex-1 bg-black/50 flex items-center justify-center relative">
        {/* DESKTOP PREVIOUS */}

        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            disabled={
              navigationLockRef.current
            }
            className="bg-black/60 border border-white text-white p-2 rounded-full absolute left-4 top-1/2 -translate-y-16 hidden sm:flex items-center justify-center disabled:opacity-40 
            disabled:cursor-not-allowed hover:bg-black/80 transition"
            title="Previous video"
          >
            {/* UP */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 14 6-6 6 6"
              />
            </svg>
          </button>
        )}

        {/* DESKTOP NEXT */}

        {hasNextVideo && (
          <button
            onClick={handleNext}
            disabled={
              navigationLockRef.current
            }
            className="bg-black/60 border border-white text-white p-2 rounded-full absolute left-4 top-1/2 translate-y-4 hidden 
            sm:flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/80 transition"
            title="Next video"
          >
            {/* DOWN */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6 10 6 6 6-6"
              />
            </svg>
          </button>
        )}

        {/* TOP */}

        <div className="absolute top-4 left-4 right-4 z-[120] flex items-center justify-between pointer-events-none">
          <button
            onClick={() =>
              navigate("/")
            }
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.7"
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

          <img
            onClick={() =>
              navigate("/")
            }
            src={logo}
            alt="IPK"
            className="pointer-events-auto w-10 h-10 rounded-full bg-white p-1 cursor-pointer"
          />
        </div>

        {/* VIDEO CARD */}

       <div
        {...handlers}
        onMouseMove={(e) => {
          handleMouseMove(e);
          showVideoControls();
        }}
        onTouchStart={handleVideoTouch}
        onClick={showVideoControls}
        onMouseEnter={showVideoControls}
        onMouseLeave={() => {
          if (isPlaying && !videoLoading) {
            hideVideoControls();
          }
        }}
        className="relative h-full w-full sm:w-auto sm:max-w-[min(720px,90vw)] flex items-center justify-center overflow-hidden bg-neutral-900 sm:rounded-2xl shadow-2xl select-none"
      >
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="h-full w-full sm:w-auto sm:max-w-full object-contain bg-neutral-900"
            preload="auto"
            playsInline
            muted={isMuted}
            volume={volume}
            playbackRate={playbackRate}
          />

          {/* SUBTLE GRADIENT */}

          <div
            className={`absolute inset-0 z-[80] flex items-center justify-center transition-opacity duration-300 ${
              videoLoading
                ? "opacity-0 pointer-events-none"
                : !isPlaying
                  ? "opacity-100"
                  : showOverlay
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
            }`}
          />

          {/* LOADING */}

          {videoLoading && (
            <div className="absolute inset-0 z-[90] flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
            </div>
          )}

          {/* CENTER PLAY */}

          <button
            onClick={togglePlay}
            className={`absolute inset-0 z-[80] flex items-center justify-center transition-opacity duration-300 ${
              showOverlay
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <span className="w-16 h-16 sm:w-14 sm:h-14 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-7 h-7 ml-1"
                >
                  <path d="M8 5.5v13l10-6.5L8 5.5Z" />
                </svg>
              )}
            </span>
          </button>

          {/* TOP VIDEO CONTROLS */}

          <div
            className={`absolute top-4 right-3 z-[110] flex items-center gap-2 transition-all duration-300 ${
              showOverlay
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
          >
            {/* FULLSCREEN */}

            <button
              onClick={goFullScreen}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.6"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m-4.5 0L15 9m5.25 16.5h-4.5m4.5 0v-4.5m4.5 0L15 15"
                />
              </svg>
            </button>

            {/* SPEED */}

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();

                  setShowSpeed(
                    (prev) => !prev
                  );

                  showVideoControls();
                }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.6"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>

              {showSpeed && (
                <div
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="absolute top-12 right-0 w-48 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 p-3 shadow-2xl"
                >
                  <div className="flex justify-between text-white text-xs mb-2">
                    <span>
                      Speed
                    </span>

                    <span className="font-semibold">
                      {playbackRate}x
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.25"
                    value={
                      playbackRate
                    }
                    onChange={
                      handleSpeedChange
                    }
                    className="w-full h-[3px] appearance-none accent-white cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-white/50 mt-2">
                    <span>
                      0.5x
                    </span>

                    <span>
                      1x
                    </span>

                    <span>
                      1.5x
                    </span>

                    <span>
                      2x
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* MUTE */}

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/50 transition"
            >
              {isMuted ||
              volume === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                >
                  <path
                    d="M11 5 6 9H3v6h3l5 4V5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="m17 9 4 4m0-4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                >
                  <path
                    d="M11 5 6 9H3v6h3l5 4V5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            {/* VOLUME RANGE */}

            <div className="hidden sm:flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-3 h-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-white"
              >
                <path
                  d="M11 5 6 9H3v6h3l5 4V5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  isMuted
                    ? 0
                    : volume
                }
                onChange={
                  handleVolumeChange
                }
                className="w-20 h-[3px] appearance-none accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          {currentPost?.content && (
            <div
              className={`absolute bottom-16 left-3 right-3 sm:left-5 sm:right-5 z-[70] transition-all duration-300 ${
                showOverlay
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3 pointer-events-none"
              }`}
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-start gap-3">
                  <Link
                    to={`/profile/${currentPost?.user?.id}`}
                    className="shrink-0"
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white text-lg font-bold border border-white/20 shadow-lg">
                      {currentPost?.user?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "A"}
                    </span>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="text-white font-bold text-xs">
                      {currentPost
                        ?.user?.name ||
                        "Unknown User"}
                    </div>

                    <div
                      className={`rounded-xl bg-black/25 backdrop-blur-sm px-3 py-2 ${
                        showMore
                          ? "max-h-[55vh] overflow-y-auto"
                          : ""
                      }`}
                    >
                      <p className="text-white text-xs leading-5 break-words [overflow-wrap:anywhere]">
                        {showMore
                          ? text
                          : shortText}

                        {hasLongText && (
                          <button
                            type="button"
                            onClick={(
                              e
                            ) => {
                              e.stopPropagation();

                              setShowMore(
                                (
                                  prev
                                ) =>
                                  !prev
                              );

                              showVideoControls();
                            }}
                            className="ml-1 text-white underline font-semibold"
                          >
                            {showMore
                              ? "See less"
                              : "See more"}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM CONTROLS */}

          <div
            className={`absolute bottom-2 left-3 right-3 sm:left-5 sm:right-5 z-[100] transition-all duration-300 ${
              showOverlay
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-2 text-white text-[11px] mb-1">
              <span className="min-w-[34px]">
                {formatTime(
                  currentTime
                )}
              </span>

              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={Math.min(
                  currentTime,
                  duration || 0
                )}
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
                className="flex-1 h-[3px] appearance-none accent-white cursor-pointer"
              />

              <span className="min-w-[34px] text-right">
                {formatTime(
                  duration
                )}
              </span>
            </div>

            {/* VOLUME ON MOBILE */}

            <div className="sm:hidden flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white"
              >
                {isMuted ||
                volume === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5"
                  >
                    <path
                      d="M11 5 6 9H3v6h3l5 4V5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="m17 9 4 4m0-4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5"
                  >
                    <path
                      d="M11 5 6 9H3v6h3l5 4V5Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={
                  isMuted
                    ? 0
                    : volume
                }
                onChange={
                  handleVolumeChange
                }
                className="w-24 h-[3px] appearance-none accent-white"
              />

              <span className="text-white/70 text-[10px]">
                {Math.round(
                  (isMuted
                    ? 0
                    : volume) *
                    100
                )}
                %
              </span>
            </div>
          </div>

          {/* AUTO NEXT */}

          {notifyNext && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[200] bg-black/75 backdrop-blur-xl border border-white/10 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm whitespace-nowrap">
                <span>
                    Next video in {nextCountdown}s
                </span>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        cancelAutoNext();
                    }}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                    Cancel
                </button>
            </div>
        )}
          {/* RIGHT ACTIONS */}

          <div className="absolute right-2 sm:right-4 bottom-24 z-[100] flex flex-col items-center gap-3">
            {/* REACTION */}

            <div
              className="relative"
              onMouseEnter={() =>
                setShowReactions(
                  true
                )
              }
              onMouseLeave={() =>
                setShowReactions(
                  false
                )
              }
            >
              {showReactions && (
                <div
                  className="absolute right-12 top-0 bg-white rounded-full shadow-xl px-3 py-2 flex flex-row items-center gap-1 z-20 whitespace-nowrap"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  {reactionList.map(
                    (emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (
                            !reactionLoading
                          ) {
                            toggleReaction(
                              emoji
                            );
                          }
                        }}
                        className="text-xl hover:scale-125 transition"
                      >
                        {emoji}
                      </button>
                    )
                  )}

                  {/* PLUS BUTTON */}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowReactions(
                        false
                      );

                      /*
                       * Opens your existing
                       * emoji picker.
                       */
                      setShowEmoji(true);
                    }}
                    className="ml-1 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold"
                    title="More emojis"
                  >
                    +
                  </button>
                </div>
              )}

              <div className="text-white text-[10px] text-center mb-1">
                {total > 0 &&
                  total}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();

                  setShowReactions(
                    (prev) =>
                      !prev
                  );

                  showVideoControls();
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border transition ${
                  myReaction
                    ? "bg-blue-600 border-blue-400"
                    : "bg-black/40 text-white border-white/10"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                  />
                </svg>
              </button>
            </div>

            {/* COMMENT */}

            <button
              onClick={(e) => {
                e.stopPropagation();

                handleCommentPop();
              }}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                />
              </svg>
            </button>

            {/* SHARE */}

            <button
              onClick={(e) => {
                e.stopPropagation();

                setShares(
                  (prev) => !prev
                );
              }}
              className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
              </svg>
            </button>

            <div className="bg-black/40 rounded-full">
              <PostOptionsId
                post={currentPost}
              />
            </div>
          </div>
        </div>
      </div>

      {/* RESET POPUP */}

      {showResetPopup && (
        <div className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-center justify-center px-5">
          <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-7 h-7 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M5.982 4.356a8.25 8.25 0 0 1 13.803 3.7l.217.647"
                />
              </svg>
            </div>

            <h2 className="text-white text-lg font-bold">
              No more videos
            </h2>

            <p className="text-white/60 text-sm mt-2">
              You have viewed all
              available videos.
              Reset your viewed
              videos to watch them
              again.
            </p>

            <button
              onClick={
                resetViewedVideos
              }
              disabled={
                resettingVideos
              }
              className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-200 transition disabled:opacity-50"
            >
              {resettingVideos
                ? "Reloading"
                : "Reset & Watch Again"}
            </button>

            <button
              onClick={() =>
                setShowResetPopup(
                  false
                )
              }
              className="mt-3 w-full py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* COMMENT POPUP */}

     {showCommentPop && (
      <div className="fixed inset-0 px-2 bg-black/70 flex items-center justify-center z-[999]">
        <div
          className="
            rounded-xl
            w-full
            lg:w-[400px]
            max-w-xl
            max-h-[90vh]
            flex
            flex-col
            shadow-lg
            overflow-hidden
            bg-[var(--bg-color)]
          "
        >
          {commentScreen}
        </div>
      </div>
    )}

      {/* SHARE POPUP */}

      {shares && (
        <div className="fixed inset-0 bg-black/70 z-[500] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm relative shadow-2xl">
            <button
              onClick={() =>
                setShares(false)
              }
              className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-black mb-5">
              Share video
            </h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setMessageOpenShare(
                    true
                  );
                  setShares(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 text-black"
              >
                <MessageCircle
                  className="border-2 border-black rounded-full p-1"
                  size={38}
                />

                <span className="font-semibold">
                  Chat List
                </span>
              </button>

              <div className="grid grid-cols-4 border-t pt-4 gap-3">
                <button
                  onClick={() =>
                    handleShare(
                      "facebook"
                    )
                  }
                  className="text-black flex flex-col items-center gap-2"
                >
                  <FaFacebook
                    size={26}
                  />

                  <span className="text-xs">
                    Facebook
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleShare(
                      "whatsapp"
                    )
                  }
                  className="text-black flex flex-col items-center gap-2"
                >
                  <FaWhatsapp
                    size={26}
                  />

                  <span className="text-xs">
                    WhatsApp
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleShare(
                      "twitter"
                    )
                  }
                  className="text-black flex flex-col items-center gap-2"
                >
                  <FaTwitter
                    size={26}
                  />

                  <span className="text-xs">
                    Twitter
                  </span>
                </button>

                <button
                  onClick={() =>
                    handleShare(
                      "telegram"
                    )
                  }
                  className="text-black flex flex-col items-center gap-2"
                >
                  <FaTelegram
                    size={26}
                  />

                  <span className="text-xs">
                    Telegram
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHAT SHARE */}

      {messageOpenShare && (
        <div className="fixed inset-0 bg-black/60 z-[600] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">
              Share to chat
            </h2>

            {chats.map(
              (chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl mb-1 ${
                    selectedChats.includes(
                      chat.id
                    )
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSelectedChats(
                      (prev) =>
                        prev.includes(
                          chat.id
                        )
                          ? prev.filter(
                              (
                                id
                              ) =>
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

                  <span className="text-sm">
                    {chat.other_user
                      ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                      : chat.teacher
                      ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                      : chat.student
                      ? `${chat.student.first_name} ${chat.student.last_name}`
                      : "Unknown User"}
                  </span>
                </div>
              )
            )}

            <button
              disabled={
                sending ||
                selectedChats.length ===
                  0
              }
              onClick={async () => {
                try {
                  setSending(true);

                  for (const chatId of selectedChats) {
                    await shareToChat(
                      chatId
                    );
                  }

                  setSelectedChats(
                    []
                  );

                  setMessageOpenShare(
                    false
                  );
                } finally {
                  setSending(false);
                }
              }}
              className={`mt-4 w-full rounded-xl py-3 text-white font-semibold ${
                sending ||
                selectedChats.length ===
                  0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sending
                ? "Sending"
                : `Send (${selectedChats.length})`}
            </button>

            <button
              onClick={() =>
                setMessageOpenShare(
                  false
                )
              }
              className="mt-3 w-full bg-gray-100 rounded-xl py-3 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* USERS POPUP */}

      {showUsersPopup && (
        <div className="fixed inset-0 bg-black/60 z-[700] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              Likes
            </h3>

            {usersPreview.map(
              (u) => (
                <div
                  key={u.id}
                  className="py-2"
                >
                  <Link
                    to={`/profile/${u.id}`}
                    className="text-sm hover:text-blue-600"
                  >
                    {u.id ===
                    currentUser?.id
                      ? "You"
                      : u.name}
                  </Link>
                </div>
              )
            )}

            <button
              className="mt-4 w-full bg-gray-100 rounded-xl py-3 text-sm font-semibold"
              onClick={() =>
                setShowUsersPopup(
                  false
                )
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}