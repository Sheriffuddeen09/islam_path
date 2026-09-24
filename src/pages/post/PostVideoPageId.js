import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import logo from '../../layout/image/favicon.png'
import { useAuth } from "../../layout/AuthProvider";
import { PostCommentInput } from "./PostCommentInput";
import { useSwipeable } from "react-swipeable";
import PostOptionsId from "./PostOptionId";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import toast from "react-hot-toast";



export default function PostVideoPageId({
  image, commentsByPost, setCommentsByPost,
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
  const advertisementShownRef = useRef(false);
  const normalVideosCountRef = useRef(0);
  const lastNormalVideoIdRef = useRef(Number(id));
  const forwardHistoryRef = useRef([]);

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


    const isAdvertisement =
      currentPost?.is_advertisement === true;

  const currentImage = currentPost?.media?.find(
      (m) => m.type === "image"
  );

  const currentVideo = currentPost?.media?.find(
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


const formatPostTime = (date) => {
  if (!date) return "";

  const created = new Date(date);
  const now = new Date();

  const diffMs = now - created;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds === 1 ? "" : "s"}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
};


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
                post?.post_type === "post" &&
                post?.is_advertisement !== true &&
                Array.isArray(post?.media) &&
                post.media.some(
                    (media) =>
                        media?.type === "video" &&
                        media?.url
                )
        );

        const requestedId = Number(id);
 
        const requestedVideo = allVideoPosts.find(
            (post) =>
                Number(post.id) === requestedId
        );
        const unviewedVideos = allVideoPosts.filter(
            (post) =>
                post?.viewed === false &&
                Number(post.id) !== requestedId
        );
 
        const videoPosts = requestedVideo
            ? [
                requestedVideo,
                ...unviewedVideos,
            ]
            : unviewedVideos;

        if (!mounted) {
            return;
        }
 
        setVideos(videoPosts);
 
        setCurrentIndex(0);

        lastNormalVideoIdRef.current =
          requestedVideo?.id ??
          videoPosts.find(
              (post) => post?.is_advertisement !== true
          )?.id ??
          Number(id);
 
        advertisementShownRef.current = false;
        normalVideosCountRef.current = videoPosts.length > 0 ? 1 : 0;

 
 
        setHasNextVideo(
            videoPosts.length > 0
        );
 
        setShowResetPopup(false);

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
            setCurrentIndex(0);

            setHasNextVideo(false);
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
  
}, []);


  useEffect(() => {
    const next =
        videos[currentIndex + 1];
 
    if (next?.is_advertisement) {
        return;
    }

    const nextVideo =
        next?.media?.find(
            (m) => m.type === "video"
        );

    if (!nextVideo?.url) {
        return;
    }

    const preload =
        document.createElement("video");

    preload.src = nextVideo.url;
    preload.preload = "auto";

    preload.load();

    return () => {
        preload.src = "";
    };
}, [currentIndex, videos]);



  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setVideoLoading(false);
    setIsPlaying(false);
    setShowMore(false);
    setShowOverlay(true);
    setShowSpeed(false);

    viewedRef.current = null;
    viewPromiseRef.current = null;
 

    if (
        currentPost?.is_advertisement &&
        currentImage?.url
    ) {
        return;
    }

    const video = videoRef.current;

    if (!video) {
        return;
    }

    video.pause();
    video.currentTime = 0;

    if (currentMedia?.url) {
        video.load();
    }
}, [
    currentPost?.id,
    currentMedia?.url,
    currentImage?.url,
]);


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


      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setVideoLoading(false);
        })
        .catch((error) => {
          console.log("AUTOPLAY BLOCKED:", error);

         
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

    if (currentPost?.is_advertisement === true) {
        return;
    }

    if (viewedRef.current === currentId) {
        return (
            viewPromiseRef.current ||
            Promise.resolve()
        );
    }

    viewedRef.current = currentId;

    viewPromiseRef.current = api
        .post(`/api/post/${currentId}/view`)
        .then(() => {
            // VERY IMPORTANT:
            // Keep React state synchronized with Laravel.
            setVideos((prev) =>
                prev.map((post) =>
                    Number(post.id) === Number(currentId)
                        ? {
                              ...post,
                              viewed: true,
                          }
                        : post
                )
            );
        })
        .catch((error) => {
            console.error(
                "VIDEO VIEW ERROR:",
                error.response?.data || error
            );

            if (viewedRef.current === currentId) {
                viewedRef.current = null;
            }
        })
        .finally(() => {
            viewPromiseRef.current = null;
        });

    return viewPromiseRef.current;
};


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

  const toggleMute = (e) => {
    e?.stopPropagation();

    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;

    setIsMuted(video.muted);

    showVideoControls();
  };

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
 
    if (forwardHistoryRef.current.length > 0) {

        const previousForward =
            forwardHistoryRef.current[
                forwardHistoryRef.current.length - 1
            ];

        const historyIndex =
            videos.findIndex(
                post =>
                    Number(post.id) ===
                    Number(previousForward.id)
            );

        if (historyIndex !== -1) {

            console.log(
                "RETURNING TO PREVIOUSLY VIEWED VIDEO:",
                previousForward.id
            );

            forwardHistoryRef.current.pop();

            const nextPost = videos[historyIndex];

            if (
                nextPost.is_advertisement !== true
            ) {
                lastNormalVideoIdRef.current =
                    nextPost.id;
            }

            setNotifyNext(false);
            setShowResetPopup(false);
            setHasNextVideo(true);

            setCurrentIndex(historyIndex);

            return;
        }
 
        forwardHistoryRef.current.pop();
    }
 
    if (currentPost?.is_advertisement === true) {

        console.log(
            "CURRENT ITEM IS ADVERTISEMENT"
        );

        const nextNormalIndex = videos.findIndex(
            (post, index) =>
                index > currentIndex &&
                post?.is_advertisement !== true &&
                post?.post_type === "post" &&
                post?.viewed === false &&
                Array.isArray(post?.media) &&
                post.media.some(
                    (media) =>
                        media?.type === "video" &&
                        media?.url
                )
        );

        if (nextNormalIndex !== -1) {

            const nextPost =
                videos[nextNormalIndex];

            lastNormalVideoIdRef.current =
                nextPost.id;

            setHasNextVideo(true);
            setShowResetPopup(false);

            setCurrentIndex(
                nextNormalIndex
            );

            return;
        }
 
        try {

            const response =
                await api.get(
                    `/api/post/${lastNormalVideoIdRef.current}/next-video`,
                    {
                        params: {
                            show_advertisement: false,
                        },
                    }
                );

            const nextVideo =
                response.data?.video ??
                response.data?.post;

            if (
                nextVideo &&
                nextVideo.is_advertisement !== true &&
                nextVideo.post_type === "post"
            ) {

                const newIndex =
                    videos.length;

                setVideos((prev) => [
                    ...prev,
                    {
                        ...nextVideo,
                        viewed: false,
                    },
                ]);

                lastNormalVideoIdRef.current =
                    nextVideo.id;

                normalVideosCountRef.current += 1;

                setHasNextVideo(true);
                setShowResetPopup(false);

                setCurrentIndex(newIndex);

                return;
            }

            setHasNextVideo(false);
            setNotifyNext(false);
            setShowResetPopup(true);

            return;

        } catch (error) {

            console.error(
                "NEXT AFTER AD ERROR:",
                error.response?.data || error
            );

            return;
        }
    }
 
    console.log(
        "CURRENT ITEM IS NORMAL VIDEO"
    );

    const nextNormalIndex =
        videos.findIndex(
            (post, index) =>
                index > currentIndex &&
                post?.is_advertisement !== true &&
                post?.post_type === "post" &&
                post?.viewed === false &&
                Array.isArray(post?.media) &&
                post.media.some(
                    (media) =>
                        media?.type === "video" &&
                        media?.url
                )
        );
 
    if (nextNormalIndex !== -1) {

        const nextPost =
            videos[nextNormalIndex];

        console.log(
            "MOVING TO LOCAL VIDEO:",
            nextPost.id
        );

        lastNormalVideoIdRef.current =
            nextPost.id;

        normalVideosCountRef.current += 1;

        setHasNextVideo(true);
        setShowResetPopup(false);

        setCurrentIndex(
            nextNormalIndex
        );

        return;
    }
 
    try {
 
        const shouldShowAdvertisement =
            normalVideosCountRef.current >= 5 &&
            advertisementShownRef.current === false;

        console.log(
            "NORMAL VIDEOS COUNT:",
            normalVideosCountRef.current
        );

        console.log(
            "ADVERTISEMENT ALREADY SHOWN:",
            advertisementShownRef.current
        );

        console.log(
            "SHOULD SHOW ADVERTISEMENT:",
            shouldShowAdvertisement
        );


        const response =
            await api.get(
                `/api/post/${lastNormalVideoIdRef.current}/next-video`,
                {
                    params: {
                        show_advertisement:
                            shouldShowAdvertisement,
                    },
                }
            );


        console.log(
            "NEXT VIDEO RESPONSE:",
            response.data
        );


        const nextVideo =
            response.data?.video ??
            response.data?.post;
 
        if (
            nextVideo?.is_advertisement === true
        ) {

            console.log(
                "ADVERTISEMENT RECEIVED - ONE TIME ONLY"
            );
 

            advertisementShownRef.current = true;

            setVideos((prev) => [
                ...prev,
                nextVideo,
            ]);

            setHasNextVideo(true);
            setShowResetPopup(false);

            setCurrentIndex(
                videos.length
            );

            return;
        }
 
        if (
            nextVideo &&
            nextVideo.is_advertisement !== true &&
            nextVideo.post_type === "post"
        ) {

            console.log(
                "NEW NORMAL VIDEO:",
                nextVideo.id
            );

            const newIndex =
                videos.length;

            setVideos((prev) => [
                ...prev,
                {
                    ...nextVideo,
                    viewed: false,
                },
            ]);

            lastNormalVideoIdRef.current =
                nextVideo.id;

            normalVideosCountRef.current += 1;

            setHasNextVideo(true);
            setShowResetPopup(false);

            setCurrentIndex(
                newIndex
            );

            return;
        }
 
        console.log(
            "ALL VIDEOS VIEWED - SHOW RESET"
        );

        setHasNextVideo(false);
        setNotifyNext(false);
        setShowResetPopup(true);

    } catch (error) {

        console.error(
            "NEXT VIDEO ERROR:",
            error.response?.data || error
        );
    }
};


const handleNext = async () => {
    console.log("NEXT CLICKED");

    if (navigationLockRef.current) {
        console.log("NEXT BLOCKED: navigation locked");
        return;
    }

    if (!currentPost?.id) {
        console.log("NEXT BLOCKED: no current post");
        return;
    }

    navigationLockRef.current = true;

    try {
        setNotifyNext(false);

        if (cancelTimer) {
            clearTimeout(cancelTimer);
            setCancelTimer(null);
        }

        console.log("CURRENT POST:", currentPost);
        console.log("CURRENT INDEX:", currentIndex);

        await fetchNextVideo();

    } catch (error) {
        console.error("HANDLE NEXT ERROR:", error);
    } finally {
        navigationLockRef.current = false;
    }
};

const handlePrev = () => {
    if (navigationLockRef.current) {
        return;
    }

    if (currentIndex <= 0) {
        return;
    }

    navigationLockRef.current = true;

    try {
        setNotifyNext(false);
        setShowResetPopup(false);
        setHasNextVideo(true);

        const previousIndex = currentIndex - 1;

        const previousPost = videos[previousIndex];

        // Save the video we are moving away from.
        if (
            currentPost &&
            currentPost.is_advertisement !== true
        ) {
            forwardHistoryRef.current.push({
                index: currentIndex,
                id: currentPost.id,
            });
        }

        if (
            previousPost &&
            previousPost.is_advertisement !== true
        ) {
            lastNormalVideoIdRef.current =
                previousPost.id;
        }

        setCurrentIndex(previousIndex);

    } finally {
        navigationLockRef.current = false;
    }
};

useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setVideoLoading(false);
    setIsPlaying(false);
    setShowMore(false);
    setShowOverlay(true);
    setShowSpeed(false);

    viewedRef.current = null;
    viewPromiseRef.current = null;
 
    if (currentPost?.is_advertisement) {
        return;
    }

    const video = videoRef.current;

    if (!video) {
        return;
    }

    video.pause();

    try {
        video.currentTime = 0;
    } catch (e) {}

    if (currentMedia?.url) {
        video.load();
    }

}, [
    currentPost?.id,
    currentPost?.is_advertisement,
    currentMedia?.url,
    currentImage?.url,
]);

    const handleVideoEnd = async () => {
    if (!currentPost?.id) {
        return;
    }
 

    if (
        currentPost?.is_advertisement === true
    ) {
        setIsPlaying(false);

        return;
    }

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



    const handleVideoPlay = async () => {

        if (!currentPost?.id) {
            return;
        }

        if (currentPost?.is_advertisement === true) {
            return;
        }

        // Mark immediately when video starts playing
        await markVideoViewed();

        setIsPlaying(true);
    };


    const cancelAutoNext = () => {
        if (cancelTimer) {
          clearTimeout(cancelTimer);
        }

        setCancelTimer(null);

        autoNextCancelledRef.current = true;

        setNotifyNext(false);
        setNextCountdown(5);
      };

    
const resetViewedVideos = async () => {

    if (resettingVideos) {
        return;
    }

    navigationLockRef.current = true;

    setResettingVideos(true);
    setNotifyNext(false);

    try {

        const video = videoRef.current;

        if (video) {
            video.pause();

            try {
                video.currentTime = 0;
            } catch (e) {
                console.log(
                    "VIDEO RESET POSITION ERROR:",
                    e
                );
            }
        }

        viewedRef.current = null;
        viewPromiseRef.current = null;

        await api.post(
            "/api/reset-video-views"
        );

        const res = await api.get(
            "/api/posts-get-video"
        );

        const data =
            Array.isArray(res.data?.posts)
                ? res.data.posts
                : [];

        const allVideoPosts =
            data.filter(
                (post) =>
                    post?.post_type === "post" &&
                    post?.is_advertisement !== true &&
                    Array.isArray(post?.media) &&
                    post.media.some(
                        (media) =>
                            media?.type === "video" &&
                            media?.url
                    )
            );

        const requestedId =
            Number(id);

        const requestedVideo =
            allVideoPosts.find(
                (post) =>
                    Number(post.id) ===
                    requestedId
            );

        const videoPosts =
            requestedVideo
                ? [
                    requestedVideo,
                    ...allVideoPosts.filter(
                        (post) =>
                            Number(post.id) !==
                            requestedId
                    ),
                ]
                : allVideoPosts;

        setVideos(videoPosts);

        setCurrentIndex(0);

        lastNormalVideoIdRef.current =
            videoPosts[0]?.id ?? null;

        advertisementShownRef.current = false;

        normalVideosCountRef.current =
            videoPosts.length > 0
                ? 1
                : 0;

        setHasNextVideo(
            videoPosts.length > 0
        );

        autoNextUsedRef.current = false;
        autoNextCancelledRef.current = false;

        viewedRef.current = null;
        viewPromiseRef.current = null;

        setNotifyNext(false);
        setNextCountdown(5);

        setCurrentTime(0);
        setDuration(0);
        setVideoLoading(true);
        setIsPlaying(false);
        setShowMore(false);
        setShowOverlay(true);
        setShowSpeed(false);

        setTimeout(() => {

            const newVideo =
                videoRef.current;

            if (!newVideo) {
                return;
            }

            newVideo.pause();

            try {
                newVideo.currentTime = 0;
            } catch (e) {}

            newVideo.load();

        }, 100);

        

        setShowResetPopup(false);

    } catch (error) {

        console.error(
            "RESET VIDEOS ERROR:",
            error.response?.data ||
                error
        );
 

        setShowResetPopup(true);

        setNotify({
            message:
                error.response?.data?.message ||
                "Unable to reset videos.",
            type: "error",
        });

    } finally {

        setResettingVideos(false);

        setTimeout(() => {
            navigationLockRef.current = false;
        }, 150);
    }
};

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

    
            
    const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-indigo-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-emerald-400",
        "bg-lime-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-fuchsia-400",
        "bg-violet-400",
        "bg-sky-400",
        "bg-slate-400",
        "bg-gray-400",
        "bg-zinc-400",
        "bg-stone-400",
        "bg-neutral-400",
        "bg-red-500",
        "bg-blue-500",
    ];

const getColor = (value) => {
    if (!value) return "bg-gray-400";

    const str = String(value);

    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

const getInitial = (name) => {
    if (!name) return "?";

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
};

 const shareUrl = currentPost?.is_advertisement
    ? `${window.location.origin}/advertisement/${currentPost.advertisement_id}`
    : `${window.location.origin}/post/${currentPost?.id}`;

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

  const hasCurrentMedia =
    currentPost?.media?.some(
        (media) => media?.url
    );

// video
  if (!hasCurrentMedia) {
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

const commentScreen = (
  <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]">

    {/* HEADER */}
    <div className="shrink-0">
      <div className="flex p-4 items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${currentPost?.user?.id}`}
          >
            <p className={`font-bold text-[30px] rounded-full w-12 h-12 text-center flex items-center justify-center
                  ${getColor(currentPost.user?.name)}`}>
                  {getInitial(currentPost?.user?.name)}
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

      {/* TEXT post */}
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
<div className="flex-1 min-h-0 overflow-y-auto">
  {currentPost && (
    <PostComment
      postId={currentPost.id}
      image={image}
      post={currentPost}
      postComments={postComments}
      setPostComments={setPostComments}
      commentsByPost={commentsByPost}
      setCommentsByPost={setCommentsByPost}
    />
  )}
</div>
{/* absolute right-0 */}
    
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
    <div className="relative flex h-screen w-full overflow-hidden bg-neutral-950">
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
            className="bg-black/60 border border-white text-white p-2 rounded-full absolute left-4 top-1/2 translate-y-4
            flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/80 transition"
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

        <div className="absolute top-4 left-4 z-[120] inline-flex items-center gap-4 pointer-events-none">
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
        className="relative h-full w-full sm:w-auto sm:max-w-2xl flex items-center justify-center overflow-hidden bg-neutral-900 sm:rounded-2xl shadow-2xl select-none"
      >
         {currentVideo?.url ? (
            <video
                ref={videoRef}
                onPlay={handleVideoPlay}
                src={currentVideo.url}
                className="h-full w-full object-contain bg-black"
                playsInline
                preload="auto"
            />
        ) : currentImage?.url ? (
            <img
                src={currentImage.url}
                alt={
                    currentPost?.title ||
                    currentPost?.advertisement_type ||
                    "Advertisement"
                }
                className="h-full w-full object-contain bg-black"
            />
        ) : (
            <div className="flex items-center justify-center h-full text-white">
                No media available
            </div>
        )}
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

          {!isAdvertisement && (
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
          )}
          {/* TOP VIDEO CONTROLS */}
          {!isAdvertisement && (
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
              className="flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-full px-3 h-10">
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
          </button>
            </div>
          )}

    {isAdvertisement && (
        <div className="absolute top-4 left-4 z-[130]">
            <span className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold tracking-wide">
                {currentPost?.advertisement_type === "sponsorship"
                    ? "SPONSORSHIP"
                    : "ADVERTISEMENT"}
            </span>
        </div>
    )}
          {/* DESCRIPTION */}
          

               {isAdvertisement && (
    <div
        className={`absolute bottom-16 left-3 right-3 sm:left-5 sm:right-5 z-[80] transition-all duration-300 ${
            showOverlay
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 pointer-events-none"
        }`}
    >
        <div className="max-w-2xl mx-auto">
            <div
                className="
                    bg-black/45
                    backdrop-blur-md
                    rounded-2xl
                    border border-white/10
                    p-4
                    text-white
                    max-h-[55vh]
                    overflow-y-auto
                    overscroll-contain
                    scrollbar-thin
                    scrollbar-thumb-white/30
                    scrollbar-track-transparent
                "
            >

                {/* TYPE */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-md bg-white text-black text-[9px] font-bold">
                        {currentPost?.advertisement_type === "sponsorship"
                            ? "SPONSOR"
                            : "AD"}
                    </span>

                    <span className="text-white/60 text-[10px]">
                        {currentPost?.advertisement_type === "sponsorship"
                            ? "Sponsored"
                            : "Advertisement"}
                    </span>
                </div>
              
                {/* TITLE */}
                {currentPost?.title && (
                    <h2 className="text-base text-sm font-bold break-words [overflow-wrap:anywhere]">
                        {currentPost.title}
                    </h2>
                )}

                {/* DESCRIPTION */}
                {currentPost?.description && (
                    <p className="text-xs sm:text-sm text-white/85 mt-1 leading-5 break-words [overflow-wrap:anywhere]">
                        {currentPost.description}
                    </p>
                )}

                {/* LINK */}
                {currentPost?.link && (
                    <a
                        href={currentPost.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            mt-3
                            px-4
                            py-2
                            rounded-lg
                            bg-white
                            text-black
                            text-xs
                            font-bold
                            hover:bg-gray-200
                            transition
                        "
                    >
                        Visit Link

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.8"
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5H19.5V10.5M19.5 4.5 12 12M19.5 13.5v4.5a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4.5 18V6a1.5 1.5 0 0 1 1.5-1.5h4.5"
                            />
                        </svg>
                    </a>
                )}

            </div>
        </div>
    </div>
)} 


{!isAdvertisement &&
  currentPost?.content && (
    <div
      className={`absolute bottom-16 left-0 z-[70] transition-all duration-300 ${
        showOverlay
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-1">

          {/* USER */}
          <Link
            to={`/profile/${currentPost?.user?.id}`}
            className="shrink-0"
          >
             <span className={`w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white text-lg font-bold border border-white/20 shadow-lg
              ${getColor(currentPost.user?.name)}`}>
              {getInitial(currentPost?.user?.name)}
              </span>
          </Link>

          <div className="min-w-0 flex-1">

            {/* USER NAME post */}
            <div className="flex flex-col">
            <div className="text-white font-bold text-xs mb-1">
              {currentPost?.user?.name || "Unknown User"}
            </div>
              
              </div>
            {/* CONTENT */}
            <div
              className="
                rounded-xl
                bg-black/25
                backdrop-blur-sm
                px-3
                py-2
                max-h-[55vh]
                overflow-y-auto
                overscroll-contain
                scrollbar-thin
                scrollbar-thumb-white/30
                scrollbar-track-transparent
              "
            >
              <p className="text-white text-xs leading-5 break-words [overflow-wrap:anywhere]">
                {showMore ? text : shortText}

                {hasLongText && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      setShowMore((prev) => !prev);

                      showVideoControls();
                    }}
                    className="ml-1 text-white underline font-semibold"
                  >
                    {showMore ? "See less" : "See more"}
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
          {!isAdvertisement && (
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
          </div>
          )}


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
        {!showCommentPop && (
          <div className="absolute right-0 bottom-14 z-[100] flex flex-col items-center gap-3">
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
                  className="absolute right-2 -top-7 bg-white rounded-full shadow-xl px-3 py-2 flex flex-row items-center gap-1 z-20 whitespace-nowrap"
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
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl border transition ${
                  myReaction
                    ? "bg-blue-600 border-blue-400"
                    : "bg-black/20 text-white border-gray-600"
                }`}
              >
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
              className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
            >
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
            </button>

            {/* SHARE */}

            <button
              onClick={(e) => {
                e.stopPropagation();

                setShares(
                  (prev) => !prev
                );
              }}
             className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
              </svg>
            </button>

            <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border 
            border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
            >
              <PostOptionsId
                post={currentPost}
              />
            </div>
          </div>
            )}

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
{/* COMMENT POPUP */}

{showCommentPop && (
  <>
    {/* LARGE SCREEN - RIGHT SIDE */}

    <div
      className="
        hidden lg:flex
        fixed
        top-0
        right-0
        bottom-0
        z-[999]
        w-[400px]
        xl:w-[450px]
        flex-col
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        border-l
        border-white/10
        shadow-2xl
        overflow-hidden
      "
    >
      {commentScreen}
    </div>


    {/* MOBILE - FIXED POPUP */}

    <div
      className="
        lg:hidden
        fixed
        inset-0
        px-2
        bg-black/70
        backdrop-blur-sm
        flex
        items-center
        justify-center
        z-[999]
      "
    >
      <div
        className="
          rounded-xl
          w-full
          max-w-xl
          h-[90vh]
          flex
          flex-col
          shadow-2xl
          overflow-hidden
          bg-[var(--bg-color)]
          text-[var(--text-color)]
        "
      >
        {commentScreen}
      </div>
    </div>
  </>
)}
      {/* SHARE POPUP */}

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