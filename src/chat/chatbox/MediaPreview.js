import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReadMoreCaption from "./ReadMoreCaption";
import ReactionMediaPopup from "./ReactionMediaPopup";
import DeleteModal from "../chatcomponent/DeleteModal";
import { ReportModal } from "../chatcomponent/ReportModal";
import { useAuth } from "../../layout/AuthProvider";
import PreviewMessageText from "./PreviewMessageText";
import api from "../../Api/axios";


export default function MediaPreview({
    preview,
    setPreview,
    activeChat,
    msg,
    react,
    setSelectedMessages,
    setUiState,
    isMine,
    setSelectedMsg,
    messages,
    selectedMessages,
    setForwardMessage,
    togglePin,
    setMessages,
    setActiveMenuId,
}) {
    const { user } = useAuth();

    const { items = [], index = 0 } = preview || {};

    const current = items[index];

    /* =========================================================
       GENERAL STATE
    ========================================================= */

    const [showMenu, setShowMenu] = useState(false);
    const [showReactionPopupId, setShowReactionPopupId] =
        useState(null);

    const [openDelete, setOpenDelete] = useState(false);
    const [reportMessage, setReportMessage] =
        useState(false);

    /* =========================================================
       PIN
    ========================================================= */

    const [showPinDuration, setShowPinDuration] =
        useState(false);

    const [pinningMessage, setPinningMessage] =
        useState(null);

    const [pinLoading, setPinLoading] =
        useState(false);

    /* =========================================================
       MEDIA LOADING
    ========================================================= */

    const [mediaLoading, setMediaLoading] =
        useState(true);

    const [videoLoading, setVideoLoading] =
        useState(false);

    const [imageLoading, setImageLoading] =
        useState(false);

    /* =========================================================
       VIDEO
    ========================================================= */

    const videoRef = useRef(null);
    const videoContainerRef = useRef(null);

    const [isPlaying, setIsPlaying] =
        useState(false);

    const [isMuted, setIsMuted] =
        useState(false);

    const [volume, setVolume] =
        useState(1);

    const [playbackRate, setPlaybackRate] =
        useState(1);

    const [showSpeed, setShowSpeed] =
        useState(false);

    const [showOverlay, setShowOverlay] =
        useState(true);

    const [currentTime, setCurrentTime] =
        useState(0);

    const [duration, setDuration] =
        useState(0);

    const hideControlsTimer =
        useRef(null);

    const navigationLockRef =
        useRef(false);

    /* =========================================================
       SWIPE
    ========================================================= */

    const touchStartX =
        useRef(0);

    const touchStartY =
        useRef(0);

    const touchEndX =
        useRef(0);

    const touchEndY =
        useRef(0);

    /* =========================================================
       TYPE
    ========================================================= */

    const isGroup =
        activeChat?.type === "group";

    const currentType =
        String(
            current?.type ||
                current?.media_type ||
                current?.mime_type ||
                ""
        ).toLowerCase();

    const isVideo =
        currentType === "video" ||
        currentType === "video_message" ||
        currentType.startsWith("video/");

    const isImage =
        currentType === "image" ||
        currentType.startsWith("image/");

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const hasPrevious =
        index > 0;

    const hasNext =
        index < items.length - 1;

    const next = () => {
        if (
            navigationLockRef.current ||
            !hasNext
        ) {
            return;
        }

        setPreview((p) => ({
            ...p,
            index: p.index + 1,
        }));
    };

    const prev = () => {
        if (
            navigationLockRef.current ||
            !hasPrevious
        ) {
            return;
        }

        setPreview((p) => ({
            ...p,
            index: p.index - 1,
        }));
    };

    /* =========================================================
       PIN
    ========================================================= */

    const openPinDuration = (message) => {
        if (message.is_pinned) {
            togglePin(message);
            return;
        }

        setPinningMessage(message);
        setShowPinDuration(true);
    };

    const confirmPin = async (days) => {
        if (
            !pinningMessage ||
            pinLoading
        ) {
            return;
        }

        setPinLoading(true);

        try {
            await api.put(
                "/api/messages/pin",
                {
                    message_id:
                        pinningMessage.id,
                    days,
                }
            );

            setMessages((prev) =>
                prev.map((m) =>
                    Number(m.id) ===
                    Number(
                        pinningMessage.id
                    )
                        ? {
                              ...m,
                              is_pinned:
                                  true,
                              pin_expires_at:
                                  new Date(
                                      Date.now() +
                                          days *
                                              24 *
                                              60 *
                                              60 *
                                              1000
                                  ).toISOString(),
                          }
                        : m
                )
            );

            setShowPinDuration(false);
            setPinningMessage(null);

            toast.success(
                `Message pinned for ${days} days`
            );
        } catch (err) {
            console.error(
                "Pin error:",
                err
            );

            toast.error(
                "Failed to pin message"
            );
        } finally {
            setPinLoading(false);
        }
    };

    /* =========================================================
       DISPLAY
    ========================================================= */

    const displayName = isGroup
        ? activeChat?.group_name ||
          activeChat?.name ||
          "Unnamed Group"
        : `${activeChat?.other_user?.first_name || ""} ${
              activeChat?.other_user?.last_name || ""
          }`;

    const avatarName = isGroup
        ? displayName
        : activeChat?.other_user
              ?.first_name;

    /* =========================================================
       MEDIA URL
    ========================================================= */

    const getMediaUrl = (message) => {
        if (
            message?.url
        ) {
            return message.url;
        }

        if (
            message?.file_url
        ) {
            return message.file_url;
        }

        if (
            message?.files?.length > 0
        ) {
            return (
                message.files[0]
                    ?.file_url ||
                message.files[0]
                    ?.url ||
                null
            );
        }

        if (message?.file) {
            if (
                message.file.startsWith(
                    "http://"
                ) ||
                message.file.startsWith(
                    "https://"
                ) ||
                message.file.startsWith(
                    "blob:"
                )
            ) {
                return message.file;
            }

            if (
                message.file.startsWith(
                    "/storage/"
                )
            ) {
                return `http://localhost:8000${message.file}`;
            }

            return `http://localhost:8000/storage/${message.file}`;
        }

        return null;
    };

    const mediaUrl =
        getMediaUrl(current);

    /* =========================================================
       MEDIA LOAD RESET
    ========================================================= */

    useEffect(() => {
        setMediaLoading(true);

        setImageLoading(isImage);
        setVideoLoading(isVideo);

        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        setShowSpeed(false);
        setShowOverlay(true);

        navigationLockRef.current =
            true;

        if (
            !isVideo
        ) {
            navigationLockRef.current =
                false;
        }

        clearHideControlsTimer();
    }, [
        index,
        isImage,
        isVideo,
        mediaUrl,
    ]);

    /* =========================================================
       HIDE VIDEO CONTROLS
    ========================================================= */

    const clearHideControlsTimer =
        () => {
            if (
                hideControlsTimer.current
            ) {
                clearTimeout(
                    hideControlsTimer.current
                );

                hideControlsTimer.current =
                    null;
            }
        };

    const showVideoControls = () => {
        setShowOverlay(true);

        clearHideControlsTimer();

        /*
         * Don't hide while video is paused
         * or loading.
         */
        if (
            !isPlaying ||
            videoLoading
        ) {
            return;
        }

        hideControlsTimer.current =
            setTimeout(() => {
                setShowOverlay(false);
            }, 2500);
    };

    const hideVideoControls = () => {
        if (
            !isPlaying ||
            videoLoading
        ) {
            return;
        }

        clearHideControlsTimer();

        hideControlsTimer.current =
            setTimeout(() => {
                setShowOverlay(false);
            }, 1200);
    };

    /* =========================================================
       MOUSE MOVE
    ========================================================= */

    const handleMouseMove = () => {
        if (!isVideo) return;

        showVideoControls();
    };

    /* =========================================================
       IMAGE LOADED
    ========================================================= */

    const handleImageLoad = () => {
        setImageLoading(false);
        setMediaLoading(false);

        navigationLockRef.current =
            false;
    };

    const handleImageError = () => {
        setImageLoading(false);
        setMediaLoading(false);

        navigationLockRef.current =
            false;

        toast.error(
            "Failed to load image"
        );
    };

     
 

    useEffect(() => {
        if (
            !isVideo ||
            !mediaUrl
        ) {
            return;
        }

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        video.currentTime = 0;

        video.volume =
            volume;

        video.muted =
            isMuted;

        video.playbackRate =
            playbackRate;

        setCurrentTime(0);
        setIsPlaying(false);

        /*
         * Browser needs the source to be
         * attached before play().
         */
        const timer =
            setTimeout(async () => {
                try {
                    await video.play();

                    setIsPlaying(true);
                } catch (err) {
                    try {
                        video.muted =
                            true;

                        setIsMuted(
                            true
                        );

                        await video.play();

                        setIsPlaying(
                            true
                        );
                    } catch (
                        autoplayError
                    ) {
                        setIsPlaying(
                            false
                        );
                    }
                }
            }, 100);

        return () => {
            clearTimeout(
                timer
            );

            try {
                video.pause();
            } catch {}
        };
    }, [
        index,
        mediaUrl,
        isVideo,
    ]);

    /* =========================================================
       PLAY / PAUSE
    ========================================================= */

    const togglePlay = (
        e
    ) => {
        e?.stopPropagation();

        if (
            !videoRef.current ||
            videoLoading
        ) {
            return;
        }

        if (
            videoRef.current.paused
        ) {
            videoRef.current
                .play()
                .then(() => {
                    setIsPlaying(
                        true
                    );

                    showVideoControls();
                })
                .catch(() => {});
        } else {
            videoRef.current.pause();

            setIsPlaying(false);

            setShowOverlay(true);

            clearHideControlsTimer();
        }
    };

    /* =========================================================
       MUTE
    ========================================================= */

    const toggleMute = (
        e
    ) => {
        e?.stopPropagation();

        if (
            !videoRef.current
        ) {
            return;
        }

        const nextMuted =
            !videoRef.current
                .muted;

        videoRef.current.muted =
            nextMuted;

        setIsMuted(
            nextMuted
        );

        showVideoControls();
    };

    /* =========================================================
       VOLUME
    ========================================================= */

    const handleVolumeChange =
        (e) => {
            e.stopPropagation();

            const value =
                Number(
                    e.target.value
                );

            setVolume(value);

            if (
                videoRef.current
            ) {
                videoRef.current.volume =
                    value;

                if (
                    value > 0
                ) {
                    videoRef.current.muted =
                        false;

                    setIsMuted(
                        false
                    );
                } else {
                    videoRef.current.muted =
                        true;

                    setIsMuted(
                        true
                    );
                }
            }

            showVideoControls();
        };

    /* =========================================================
       SPEED
    ========================================================= */

    const handleSpeedChange =
        (e) => {
            e.stopPropagation();

            const value =
                Number(
                    e.target.value
                );

            setPlaybackRate(
                value
            );

            if (
                videoRef.current
            ) {
                videoRef.current.playbackRate =
                    value;
            }

            showVideoControls();
        };

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

const handleVideoCanPlay = (e) => {
    const video = e.currentTarget;

    // Some browsers don't give duration reliably
    // until canplay/loadeddata.
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
};

const handleVideoWaiting = () => {
    setVideoLoading(true);
};

const handleVideoPause = () => {
    setIsPlaying(false);
};

const handleTimeUpdate = (e) => {
    const video = e.currentTarget;

    setCurrentTime(video.currentTime || 0);

    // Keep duration synchronized with the real video.
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

    if (
        Number.isFinite(video.duration) &&
        video.duration > 0
    ) {
        setDuration(video.duration);
    }
};

    const handleSeekStart =
        (e) => {
            e.stopPropagation();

            clearHideControlsTimer();

            setShowOverlay(true);
        };
 
    const handleSeekEnd =
        (e) => {
            e.stopPropagation();

            showVideoControls();
        };

   const handleSeekChange = (e) => {
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


    const goFullScreen =
        async (e) => {
            e?.stopPropagation();

            try {
                if (
                    !videoContainerRef.current
                ) {
                    return;
                }

                if (
                    document.fullscreenElement
                ) {
                    await document.exitFullscreen();
                } else {
                    await videoContainerRef.current.requestFullscreen();
                }
            } catch (err) {
                console.error(
                    "Fullscreen error:",
                    err
                );
            }

            showVideoControls();
        };

    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime = (
        seconds
    ) => {
        if (
            !Number.isFinite(
                seconds
            )
        ) {
            return "0:00";
        }

        const mins =
            Math.floor(
                seconds / 60
            );

        const secs =
            Math.floor(
                seconds % 60
            );

        return `${mins}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    /* =========================================================
       TOUCH
    ========================================================= */

    const handleVideoTouch =
        () => {
            if (isVideo) {
                showVideoControls();
            }
        };

    const handleTouchStart =
        (e) => {
            if (
                !e.changedTouches
                    ?.length
            ) {
                return;
            }

            const touch =
                e.changedTouches[0];

            touchStartX.current =
                touch.screenX;

            touchStartY.current =
                touch.screenY;

            touchEndX.current =
                touch.screenX;

            touchEndY.current =
                touch.screenY;

            if (isVideo) {
                showVideoControls();
            }
        };

    const handleTouchMove =
        (e) => {
            if (
                !e.changedTouches
                    ?.length
            ) {
                return;
            }

            const touch =
                e.changedTouches[0];

            touchEndX.current =
                touch.screenX;

            touchEndY.current =
                touch.screenY;

            if (isVideo) {
                showVideoControls();
            }
        };

    const handleTouchEnd =
        (e) => {
            if (
                !e.changedTouches
                    ?.length
            ) {
                return;
            }

            if (
                navigationLockRef.current
            ) {
                return;
            }

            const touch =
                e.changedTouches[0];

            touchEndX.current =
                touch.screenX;

            touchEndY.current =
                touch.screenY;

            const diffX =
                touchStartX.current -
                touchEndX.current;

            const diffY =
                touchStartY.current -
                touchEndY.current;

            const absX =
                Math.abs(diffX);

            const absY =
                Math.abs(diffY);

            const threshold =
                60;

            /*
             * VIDEO
             *
             * Swipe UP = next
             * Swipe DOWN = previous
             */
            if (isVideo) {
                if (
                    absY <
                        threshold ||
                    absY <= absX
                ) {
                    return;
                }

                if (diffY > 0) {
                    next();
                } else {
                    prev();
                }

                return;
            }

            /*
             * IMAGE
             *
             * Swipe LEFT = next
             * Swipe RIGHT = previous
             */
            if (isImage) {
                if (
                    absX <
                        threshold ||
                    absX <= absY
                ) {
                    return;
                }

                if (diffX > 0) {
                    next();
                } else {
                    prev();
                }
            }
        };

    /* =========================================================
       COPY
    ========================================================= */

    const [copied, setCopied] =
        useState(false);

    const handleCopy =
        async () => {
            try {
                await navigator.clipboard.writeText(
                    msg.message || ""
                );

                setCopied(true);

                setTimeout(
                    () =>
                        setCopied(
                            false
                        ),
                    1500
                );
            } catch {
                toast.error(
                    "Failed to copy"
                );
            }
        };

    /* =========================================================
       DELETE
    ========================================================= */

    const handleDeletePop =
        () => {
            setOpenDelete(true);
        };

    /* =========================================================
       ACTIONS
    ========================================================= */

    const actions = [
        {
            label: copied
                ? "Copied ✓"
                : "Copy Text",

            show:
                msg.type ===
                    "text" ||
                ([
                    "image",
                    "video",
                    "audio",
                    "file",
                ].includes(
                    msg.type
                ) &&
                    msg.message),

            onClick: () => {
                handleCopy();

                setActiveMenuId(
                    null
                );
            },
        },

        {
            label: "Copy Link",

            show: [
                "image",
                "video",
                "audio",
                "file",
            ].includes(
                msg.type
            ),

            onClick:
                async () => {
                    try {
                        const url =
                            getMediaUrl(
                                msg
                            );

                        if (!url) {
                            toast.error(
                                "No media link found"
                            );

                            return;
                        }

                        await navigator.clipboard.writeText(
                            url
                        );

                        toast.success(
                            "Link copied"
                        );
                    } catch {
                        toast.error(
                            "Failed to copy link"
                        );
                    }

                    setActiveMenuId(
                        null
                    );
                },
        },

        {
            label: "Delete",
            show: true,

            onClick:
                handleDeletePop,
        },

        {
            label: "Forward",
            show: true,

            onClick: (m) => {
                const safeMsg =
                    m || msg;

                let messagesToForward =
                    [];

                if (
                    selectedMessages.length >
                    0
                ) {
                    messagesToForward =
                        messages.filter(
                            (x) =>
                                selectedMessages.includes(
                                    x.id
                                )
                        );
                } else if (
                    safeMsg
                ) {
                    messagesToForward =
                        [safeMsg];
                }

                setForwardMessage(
                    {
                        open: true,
                        messages:
                            messagesToForward.filter(
                                Boolean
                            ),
                    }
                );

                setSelectedMessages(
                    []
                );
            },
        },

        {
            label: msg.is_pinned
                ? "Unpin"
                : "Pin",

            show: isMine,

            onClick: () => {
                openPinDuration(
                    msg
                );

                setShowMenu(
                    false
                );
            },
        },

        {
            label: "Report",

            show: !isMine,

            onClick: () =>
                setReportMessage(
                    true
                ),
        },
    ].filter(
        (a) => a.show
    );

    /* =========================================================
       KEYBOARD
    ========================================================= */

    useEffect(() => {
        const handleKey =
            (e) => {
                if (
                    e.key ===
                    "Escape"
                ) {
                    setPreview({
                        items: [],
                        index: 0,
                    });

                    return;
                }

                if (
                    e.key ===
                    "ArrowRight"
                ) {
                    next();
                }

                if (
                    e.key ===
                    "ArrowLeft"
                ) {
                    prev();
                }

                /*
                 * Video keyboard navigation
                 */
                if (
                    isVideo &&
                    e.key ===
                        "ArrowUp"
                ) {
                    prev();
                }

                if (
                    isVideo &&
                    e.key ===
                        "ArrowDown"
                ) {
                    next();
                }
            };

        window.addEventListener(
            "keydown",
            handleKey
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleKey
            );
    }, [
        index,
        items.length,
        isVideo,
    ]);

    /* =========================================================
       CLEANUP
    ========================================================= */

    useEffect(() => {
        return () => {
            clearHideControlsTimer();

            try {
                videoRef.current?.pause();
            } catch {}
        };
    }, []);

       
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

    const getColor = (
        name = ""
    ) => {
        if (!name) {
            return colors[0];
        }

        return colors[
            name.charCodeAt(0) %
                colors.length
        ];
    };

    const getInitial = (
        name
    ) => {
        if (!name) {
            return "?";
        }

        return name
            .charAt(0)
            .toUpperCase();
    };

    /* =========================================================
       DOWNLOAD
    ========================================================= */

    const handleDownload =
        async (
            type,
            message
        ) => {
            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                const res =
                    await fetch(
                        `http://localhost:8000/api/messages/download/${type}/${message.id}`,
                        {
                            headers:
                                {
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

                const extMap = {
                    video: "mp4",
                    image: "jpg",
                    audio: "mp3",
                    file: "pdf",
                };

                link.download = `${
                    message.id
                }.${
                    extMap[type] ||
                    "bin"
                }`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    url
                );

                toast.success(
                    `${type} downloading...`
                );
            } catch (err) {
                console.error(err);

                toast.error(
                    `Failed to download ${type}`
                );
            }
        };

    /* =========================================================
       BACK
    ========================================================= */

    const onBack = () => {
        setPreview(null);
    };

    /* =========================================================
       NO PREVIEW
    ========================================================= */

    if (
        !items.length ||
        !current
    ) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                bg-black/95
                backdrop-blur-md
                z-[999]
                flex
                w-full 
                flex-col
                overflow-hidden
                text-white
            "
        >
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    w-full 
                    border-b
                    border-white/10
                    shrink-0
                    z-[200]
                "
            >
                {/* LEFT */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                    "
                >
                    <button
                        type="button"
                        onClick={
                            onBack
                        }
                        className="
                            shrink-0
                            hover:opacity-70
                            transition
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.7"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>

                    <div
                        className={`
                            w-10
                            h-10
                            rounded-full
                            overflow-hidden
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-lg
                            shrink-0
                            ${getColor(
                                avatarName
                            )}
                        `}
                    >
                        {isGroup &&
                        activeChat?.image_url ? (
                            <img
                                src={
                                    activeChat
                                        .image_url
                                }
                                alt=""
                                className="
                                    w-full
                                    h-full
                                    object-cover
                                "
                            />
                        ) : (
                            getInitial(
                                avatarName
                            )
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3
                            className="
                                hidden
                                sm:block
                                font-bold
                                text-lg
                                truncate
                            "
                        >
                            {
                                displayName
                            }
                        </h3>

                        <h3
                            className="
                                block
                                sm:hidden
                                font-bold
                                text-lg
                            "
                        >
                            {displayName?.length >
                            9
                                ? `${displayName.slice(
                                      0,
                                      9
                                  )}...`
                                : displayName}
                        </h3>

                        {isGroup && (
                            <p className="text-[11px] text-white/60">
                                {activeChat.members_count ||
                                    activeChat
                                        .members
                                        ?.length ||
                                    0}{" "}
                                members
                            </p>
                        )}
                    </div>
                </div>

                {/* RIGHT */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >
                    <button
                        type="button"
                        onClick={() =>
                            handleDownload(
                                msg.type,
                                msg
                            )
                        }
                        className="
                            hover:opacity-70
                            transition
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 16.5v-9m0 9-3-3m3 3 3-3M3.75 15v3A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18v-3"
                            />
                        </svg>
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setShowMenu(
                                    (prev) =>
                                        prev ===
                                        msg.id
                                            ? null
                                            : msg.id
                                )
                            }
                            className="
                                hover:opacity-70
                                transition
                            "
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.6"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                                />
                            </svg>
                        </button>

                        {showMenu ===
                            msg.id && (
                            <div
                                className="
                                    absolute
                                    right-0
                                    mt-2
                                    w-44
                                    rounded-xl
                                    bg-[#1d1d1d]
                                    shadow-2xl
                                    overflow-hidden
                                    z-[300]
                                "
                            >
                                {actions.map(
                                    (
                                        action,
                                        i
                                    ) => (
                                        <button
                                            key={
                                                i
                                            }
                                            type="button"
                                            onClick={() => {
                                                action.onClick(
                                                    msg
                                                );

                                                setShowMenu(
                                                    null
                                                );
                                            }}
                                            className="
                                                w-full
                                                text-left
                                                px-4
                                                py-2.5
                                                text-sm
                                                hover:bg-white/10
                                            "
                                        >
                                            {
                                                action.label
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* =====================================================
                MEDIA AREA
            ====================================================== */}

            <div
                className="
                    flex-1
                    w-full
                    bg-black/50
                    flex
                    items-center
                    justify-center
                    relative
                    overflow-hidden
                "
            >
                {/* =================================================
                    DESKTOP PREVIOUS
                ================================================== */}

                {hasPrevious && (
                    <button
                        type="button"
                        onClick={
                            prev
                        }
                        disabled={
                            navigationLockRef.current
                        }
                        className="
                            bg-black/60
                            border
                            border-white
                            text-white
                            p-2
                            rounded-full
                            absolute
                            left-4
                            top-1/2
                            -translate-y-16
                            hidden
                            sm:flex
                            items-center
                            justify-center
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            hover:bg-black/80
                            transition
                            z-[120]
                        "
                        title={
                            isVideo
                                ? "Previous video"
                                : "Previous"
                        }
                    >
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

                {/* =================================================
                    DESKTOP NEXT
                ================================================== */}

                {hasNext && (
                    <button
                        type="button"
                        onClick={
                            next
                        }
                        disabled={
                            navigationLockRef.current
                        }
                        className="
                            bg-black/60
                            border
                            border-white
                            text-white
                            p-2
                            rounded-full
                            absolute
                            left-4
                            top-1/2
                            translate-y-4
                            hidden
                            sm:flex
                            items-center
                            justify-center
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            hover:bg-black/80
                            transition
                            z-[120]
                        "
                        title={
                            isVideo
                                ? "Next video"
                                : "Next"
                        }
                    >
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

                {/* =================================================
                    MEDIA CARD
                ================================================== */}

                <div
                    ref={
                        videoContainerRef
                    }
                    onTouchStart={
                        handleTouchStart
                    }
                    onTouchMove={
                        handleTouchMove
                    }
                    onTouchEnd={
                        handleTouchEnd
                    }
                    onMouseMove={
                        handleMouseMove
                    }
                    onMouseEnter={
                        isVideo
                            ? showVideoControls
                            : undefined
                    }
                    onClick={
                        isVideo
                            ? showVideoControls
                            : undefined
                    }
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
                >
                    {/* =================================================
                        IMAGE
                    ================================================== */}

                    {isImage &&
                        mediaUrl && (
                            <img
                                src={
                                    mediaUrl
                                }
                                alt=""
                                draggable={
                                    false
                                }
                                onLoad={
                                    handleImageLoad
                                }
                                onError={
                                    handleImageError
                                }
                                className="
                                    h-full
                                    w-full
                                    object-contain
                                    bg-black
                                "
                            />
                        )}

                    {/* =================================================
                        VIDEO
                    ================================================== */}

                    {isVideo &&
                        mediaUrl && (
                            <video
                                key={
                                    mediaUrl
                                }
                                ref={
                                    videoRef
                                }
                                src={
                                    mediaUrl
                                }
                                className="
                                    h-full
                                    w-full
                                    object-contain
                                    bg-black
                                "
                                playsInline
                                preload="auto"
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
                                onEnded={
                                    handleVideoEnded
                                }
                                onTimeUpdate={
                                    handleTimeUpdate
                                }
                            />
                        )}

                    {/* =================================================
                        NO MEDIA
                    ================================================== */}

                    {!mediaUrl && (
                        <div
                            className="
                                flex
                                items-center
                                justify-center
                                h-full
                                text-white/70
                                text-sm
                            "
                        >
                            No media available
                        </div>
                    )}

                    {/* =================================================
                        LOADING
                    ================================================== */}

                    {(mediaLoading ||
                        imageLoading ||
                        videoLoading) && (
                        <div
                            className="
                                absolute
                                inset-0
                                z-[150]
                                flex
                                items-center
                                justify-center
                                bg-black/20
                                pointer-events-none
                            "
                        >
                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-full
                                    border-[3px]
                                    border-white/20
                                    border-t-white
                                    animate-spin
                                "
                            />
                        </div>
                    )}

                    {/* =================================================
                        CENTER PLAY max-w-xl
                    ================================================== */}

                    {isVideo && (
                        <button
                            type="button"
                            onClick={
                                togglePlay
                            }
                            disabled={
                                videoLoading
                            }
                            className={`
                                absolute
                                inset-0
                                z-[100]
                                flex
                                items-center
                                justify-center
                                transition-opacity
                                duration-300
                                ${
                                    showOverlay &&
                                    !videoLoading
                                        ? "opacity-100"
                                        : "opacity-0 pointer-events-none"
                                }
                            `}
                        >
                            <span
                                className="
                                    w-10
                                    h-10
                                    sm:w-10
                                    sm:h-10
                                    rounded-full
                                    bg-black/30
                                    backdrop-blur-md
                                    border
                                    border-white/20
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    shadow-xl
                                "
                            >
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

                    {/* =================================================
                        VIDEO TOP CONTROLS sm:w-auto sm:max-w-[min(720px,90vw)]
                    ================================================== */}

                    {isVideo && (
                        <div
                            className={`
                                absolute
                                top-4
                                right-3
                                z-[130]
                                flex
                                items-center
                                gap-2
                                transition-all
                                duration-300
                                ${
                                    showOverlay
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 -translate-y-2 pointer-events-none"
                                }
                            `}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            {/* FULLSCREEN */}

                            <button
                                type="button"
                                onClick={
                                    goFullScreen
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-black/30
                                    backdrop-blur-md
                                    border
                                    border-white/10
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-black/50
                                    transition
                                "
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
                                        d="M3.75 8.25v-2.5A2 2 0 0 1 5.75 3.75h2.5M15.75 3.75h2.5a2 2 0 0 1 2 2v2.5M20.25 15.75v2.5a2 2 0 0 1-2 2h-2.5M8.25 20.25h-2.5a2 2 0 0 1-2-2v-2.5"
                                    />
                                </svg>
                            </button>

                            {/* SPEED */}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(
                                        e
                                    ) => {
                                        e.stopPropagation();

                                        setShowSpeed(
                                            (
                                                prev
                                            ) =>
                                                !prev
                                        );

                                        showVideoControls();
                                    }}
                                    className="
                                        w-10
                                        h-10
                                        rounded-full
                                        bg-black/30
                                        backdrop-blur-md
                                        border
                                        border-white/10
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        hover:bg-black/50
                                        transition
                                    "
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
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                        className="
                                            absolute
                                            top-12
                                            right-0
                                            w-48
                                            rounded-xl
                                            bg-black/80
                                            backdrop-blur-xl
                                            border
                                            border-white/10
                                            p-3
                                            shadow-2xl
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                justify-between
                                                text-white
                                                text-xs
                                                mb-2
                                            "
                                        >
                                            <span>
                                                Speed
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    playbackRate
                                                }
                                                x
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
                                                text-[10px]
                                                text-white/50
                                                mt-2
                                            "
                                        >
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

                            {/* MUTE + VOLUME */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-black/30
                                    backdrop-blur-md
                                    border
                                    border-white/10
                                    rounded-full
                                    px-3
                                    h-10
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        toggleMute
                                    }
                                    className="flex items-center justify-center"
                                >
                                    {isMuted ||
                                    volume ===
                                        0 ? (
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
                                    className="
                                        w-20
                                        h-[3px]
                                        appearance-none
                                        accent-white
                                        cursor-pointer
                                    "
                                    aria-label="Volume"
                                />
                            </div>
                        </div>
                    )}

                    {/* =================================================
                        VIDEO BOTTOM PROGRESS
                    ================================================== */}
{isVideo && (
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
                max={duration > 0 ? duration : 0}
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
)}

                    {/* =================================================
                        MOBILE SWIPE INDICATOR
                    ================================================== */}

                    {items.length >
                        1 && (
                        <div
                            className="
                                absolute
                                bottom-3
                                left-1/2
                                -translate-x-1/2
                                md:hidden
                                text-[10px]
                                text-white/40
                                pointer-events-none
                                z-[90]
                            "
                        >
                            {isVideo
                                ? "Swipe up / down"
                                : "Swipe left / right"}
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                BOTTOM INFORMATION
            ====================================================== */}

            <div
                className="
                    bg-[#0c0c0c]
                    px-4
                    pt-1
                    pb-3
                    border-t
                    border-white/10
                    shrink-0
                    z-[180]
                "
            >
                {/* CAPTION */}

                {msg.message && (
                    <div
                        className="
                            px-5
                            py-3
                            mx-auto
                            text-white
                            w-full
                            max-w-md
                        "
                    >
                        <PreviewMessageText
                            msg={msg}
                        />
                    </div>
                )}

                {/* REACTIONS */}

                <div
                    className="
                        flex
                        items-center
                        justify-center
                        gap-3
                    "
                >
                    <div
                        className="
                            bg-[#1d1d1d]
                            rounded-full
                            px-3
                            py-2
                            flex
                            items-center
                            gap-2
                            text-white
                            text-sm
                        "
                    >
                        {msg.reactions
                            ?.length ? (
                            <div>
                                {Object.values(
                                    msg.reactions.reduce(
                                        (
                                            acc,
                                            r
                                        ) => {
                                            if (
                                                !acc[
                                                    r.emoji
                                                ]
                                            ) {
                                                acc[
                                                    r.emoji
                                                ] =
                                                    {
                                                        emoji:
                                                            r.emoji,
                                                        count: 0,
                                                    };
                                            }

                                            acc[
                                                r.emoji
                                            ].count++;

                                            return acc;
                                        },
                                        {}
                                    )
                                ).map(
                                    (
                                        r,
                                        i
                                    ) => (
                                        <span
                                            key={
                                                i
                                            }
                                            className="mr-1"
                                        >
                                            {
                                                r.emoji
                                            }{" "}
                                            {r.count >
                                                1 &&
                                                r.count}
                                        </span>
                                    )
                                )}
                            </div>
                        ) : (
                            <span>
                                No reaction
                            </span>
                        )}
                    </div>

                    {/* REACTION BUTTON */}

                    <div className="relative">
                        <button
                            type="button"
                            onClick={(
                                e
                            ) => {
                                e.stopPropagation();

                                setShowReactionPopupId(
                                    (
                                        prev
                                    ) =>
                                        prev ===
                                        msg.id
                                            ? null
                                            : msg.id
                                );
                            }}
                            className="
                                w-10
                                h-10
                                rounded-full
                                bg-[#1d1d1d]
                                flex
                                items-center
                                justify-center
                            "
                        >
                            😊
                        </button>

                        {showReactionPopupId ===
                            msg.id && (
                            <div
                                className="
                                    absolute
                                    bottom-14
                                    left-1/2
                                    -translate-x-1/2
                                    z-[99999]
                                "
                                onClick={(
                                    e
                                ) =>
                                    e.stopPropagation()
                                }
                            >
                                <ReactionMediaPopup
                                    onReact={
                                        react
                                    }
                                    setShowReactions={
                                        setShowReactionPopupId
                                    }
                                    message={
                                        msg
                                    }
                                    showReactions={
                                        showReactionPopupId
                                    }
                                    setSelectedMessages={
                                        setSelectedMessages
                                    }
                                    setSelectedMsg={
                                        setSelectedMsg
                                    }
                                    isMine={
                                        isMine
                                    }
                                    setUiState={
                                        setUiState
                                    }
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* COUNTER */}

                {items.length >
                    1 && (
                    <div
                        className="
                            text-center
                            text-white/60
                            text-xs
                            mt-3
                        "
                    >
                        {index + 1} /{" "}
                        {
                            items.length
                        }
                    </div>
                )}
            </div>

            {/* =====================================================
                DELETE
            ====================================================== */}

            {openDelete && (
                <DeleteModal
                    message={msg}
                    onClose={() =>
                        setOpenDelete(
                            false
                        )
                    }
                    setMessages={
                        setMessages
                    }
                    currentUserId={
                        user.id
                    }
                />
            )}

            {/* =====================================================
                REPORT
            ====================================================== */}

            {reportMessage && (
                <ReportModal
                    activeChat={
                        activeChat
                    }
                    onClose={() =>
                        setReportMessage(
                            false
                        )
                    }
                />
            )}

            {/* =====================================================
                PIN DURATION
            ====================================================== */}

            {showPinDuration && (
                <div
                    className={`
                        fixed
                        inset-0
                        z-[1000]
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                        ${
                            pinLoading
                                ? "cursor-not-allowed"
                                : ""
                        }
                    `}
                    onMouseDown={(
                        e
                    ) => {
                        if (
                            pinLoading
                        ) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onClick={(
                        e
                    ) => {
                        if (
                            pinLoading
                        ) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setShowPinDuration(
                                false
                            );

                            setPinningMessage(
                                null
                            );
                        }
                    }}
                >
                    <div
                        className={`
                            w-full
                            max-w-sm
                            rounded-xl
                            p-5
                            shadow-xl
                            ${
                                pinLoading
                                    ? "pointer-events-none select-none"
                                    : ""
                            }
                        `}
                        style={{
                            backgroundColor:
                                "var(--bg-color)",
                            color:
                                "var(--text-color)",
                        }}
                        onClick={(
                            e
                        ) =>
                            e.stopPropagation()
                        }
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-lg">
                                Pin message
                            </h2>

                            <button
                                type="button"
                                disabled={
                                    pinLoading
                                }
                                onClick={() => {
                                    if (
                                        pinLoading
                                    )
                                        return;

                                    setShowPinDuration(
                                        false
                                    );

                                    setPinningMessage(
                                        null
                                    );
                                }}
                                className="
                                    text-lg
                                    px-1
                                    rounded
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm opacity-70 mb-4">
                            How long should
                            this message stay
                            pinned?
                        </p>

                        <div className="space-y-2">
                            {[7, 14, 30].map(
                                (
                                    days
                                ) => (
                                    <button
                                        key={
                                            days
                                        }
                                        type="button"
                                        disabled={
                                            pinLoading
                                        }
                                        onClick={() => {
                                            if (
                                                pinLoading
                                            )
                                                return;

                                            confirmPin(
                                                days
                                            );
                                        }}
                                        className="
                                            w-full
                                            px-4
                                            py-3
                                            rounded-lg
                                            border
                                            text-left
                                            hover:bg-black/5
                                            dark:hover:bg-white/5
                                            transition
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                        style={{
                                            borderColor:
                                                "var(--text-color)",
                                        }}
                                    >
                                        <div className="font-medium">
                                            {
                                                days
                                            }{" "}
                                            days
                                        </div>

                                        <div className="text-xs opacity-60">
                                            Expires
                                            after{" "}
                                            {
                                                days
                                            }{" "}
                                            days
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
