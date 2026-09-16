import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import CommunityMediaReaction from "./CommunityMediaReaction";
import DeleteMessageModal from "./DeleteMessageModal";
import api from "../../Api/axios";
import PreviewMessageText from "../chatbox/PreviewMessageText";

export default function MediaPreview({
    showPreview,
    setShowPreview,
    previewMessage,
    authUser,
    isAdmin,
    react,
    msg,
    activeCommunity,
    reactionMsg,
    setReactionMsg,
    setMessages,
    openForward,
    setSelectedMessage,
    selectedMessage,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const [showPinDuration, setShowPinDuration] =
        useState(false);

    const [pinningMessage, setPinningMessage] =
        useState(null);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [loadingPinId, setLoadingPinId] =
        useState(null);

    /* =========================================================
       VIDEO
    ========================================================= */

    const videoRef = useRef(null);
    const videoContainerRef = useRef(null);

    const controlsTimerRef = useRef(null);

    const touchStartRef = useRef({
        x: 0,
        y: 0,
    });

    const [videoLoading, setVideoLoading] =
        useState(false);

    const [imageLoading, setImageLoading] =
        useState(false);

    const [isPlaying, setIsPlaying] =
        useState(false);

    const [duration, setDuration] =
        useState(0);

    const [currentTime, setCurrentTime] =
        useState(0);

    const [volume, setVolume] =
        useState(1);

    const [isMuted, setIsMuted] =
        useState(false);

    const [playbackRate, setPlaybackRate] =
        useState(1);

    const [showSpeed, setShowSpeed] =
        useState(false);

    const [showVideoControls, setShowVideoControls] =
        useState(true);

    const [isSeeking, setIsSeeking] =
        useState(false);

    /* =========================================================
       MEDIA
    ========================================================= */

    const mediaUrl =
        previewMessage?.files?.[0]?.file_url ||
        previewMessage?.file_url ||
        previewMessage?.file
            ? getImage(
                  previewMessage?.files?.[0]?.file_url ||
                      previewMessage?.file_url ||
                      previewMessage?.file
              )
            : null;

    const isImage =
        previewMessage?.type === "image";

    const isVideo =
        previewMessage?.type === "video";

    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime = (time) => {
        const seconds = Number(time);

        if (
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "00:00";
        }

        const minutes = Math.floor(
            seconds / 60
        );

        const remainingSeconds = Math.floor(
            seconds % 60
        );

        return `${String(minutes).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    /* =========================================================
       SHOW VIDEO CONTROLS
    ========================================================= */

    const showVideoControlsNow =
        useCallback(() => {
            setShowVideoControls(true);

            if (controlsTimerRef.current) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }

            if (
                isVideo &&
                isPlaying &&
                !videoLoading
            ) {
                controlsTimerRef.current =
                    setTimeout(() => {
                        setShowVideoControls(
                            false
                        );
                        setShowSpeed(false);
                    }, 2500);
            }
        }, [
            isVideo,
            isPlaying,
            videoLoading,
        ]);

    useEffect(() => {
        return () => {
            if (
                controlsTimerRef.current
            ) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }
        };
    }, []);

    /* =========================================================
       RESET VIDEO WHEN MEDIA CHANGES
    ========================================================= */

    useEffect(() => {
        if (!showPreview) {
            return;
        }

        setMenuOpen(false);
        setShowSpeed(false);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);

        if (isImage) {
            setImageLoading(true);
            setVideoLoading(false);
        }

        if (isVideo) {
            setImageLoading(false);
            setVideoLoading(true);
            setShowVideoControls(true);

            const video =
                videoRef.current;

            if (!video) {
                return;
            }

            video.currentTime = 0;
            video.volume = volume;
            video.playbackRate =
                playbackRate;

            const startVideo = async () => {
                try {
                    await video.play();
                } catch (error) {
                    /*
                     * Browser may block autoplay
                     * with sound.
                     *
                     * Try muted autoplay so
                     * the video still starts.
                     */
                    try {
                        video.muted = true;
                        setIsMuted(true);

                        await video.play();
                    } catch (err) {
                        console.log(
                            "Autoplay blocked:",
                            err
                        );
                    }
                }
            };

            startVideo();
        }

        return () => {
            if (
                controlsTimerRef.current
            ) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }

            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, [
        showPreview,
        previewMessage?.id,
        mediaUrl,
        isImage,
        isVideo,
    ]);

    /* =========================================================
       AUTO HIDE CONTROLS
    ========================================================= */

    useEffect(() => {
        if (
            !isVideo ||
            !isPlaying ||
            videoLoading
        ) {
            setShowVideoControls(true);
            return;
        }

        showVideoControlsNow();

        return () => {
            if (
                controlsTimerRef.current
            ) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }
        };
    }, [
        isVideo,
        isPlaying,
        videoLoading,
        showVideoControlsNow,
    ]);

    /* =========================================================
       VIDEO EVENTS
    ========================================================= */

    const handleLoadedMetadata = (e) => {
        const video = e.currentTarget;

        const videoDuration =
            video.duration;

        if (
            Number.isFinite(
                videoDuration
            ) &&
            videoDuration > 0
        ) {
            setDuration(
                videoDuration
            );
        }

        setCurrentTime(
            video.currentTime || 0
        );

        setVideoLoading(false);
    };

    const handleVideoCanPlay = (e) => {
        const video = e.currentTarget;

        if (
            Number.isFinite(
                video.duration
            ) &&
            video.duration > 0
        ) {
            setDuration(
                video.duration
            );
        }

        setVideoLoading(false);
    };

    const handleVideoPlaying = (e) => {
        const video = e.currentTarget;

        if (
            Number.isFinite(
                video.duration
            ) &&
            video.duration > 0
        ) {
            setDuration(
                video.duration
            );
        }

        setIsPlaying(true);
        setVideoLoading(false);

        showVideoControlsNow();
    };

    const handleVideoWaiting = () => {
        setVideoLoading(true);
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
        setShowVideoControls(true);
    };

    const handleTimeUpdate = (e) => {
        const video = e.currentTarget;

        if (!isSeeking) {
            setCurrentTime(
                video.currentTime || 0
            );
        }

        if (
            Number.isFinite(
                video.duration
            ) &&
            video.duration > 0
        ) {
            setDuration(
                video.duration
            );
        }
    };

    const handleVideoEnded = (e) => {
        const video = e.currentTarget;

        setCurrentTime(
            video.duration || 0
        );

        if (
            Number.isFinite(
                video.duration
            ) &&
            video.duration > 0
        ) {
            setDuration(
                video.duration
            );
        }

        setIsPlaying(false);
        setShowVideoControls(true);
    };

    const handleVideoError = () => {
        setVideoLoading(false);
        toast.error(
            "Unable to load this video"
        );
    };

    /* =========================================================
       PLAY / PAUSE
    ========================================================= */

    const togglePlay = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        try {
            if (video.paused) {
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            console.error(
                "Play error:",
                error
            );
        }

        showVideoControlsNow();
    };

    /* =========================================================
       VOLUME
    ========================================================= */

    const toggleMute = (e) => {
        if (e) {
            e.stopPropagation();
        }

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        if (
            video.muted ||
            video.volume === 0
        ) {
            const restoredVolume =
                volume > 0
                    ? volume
                    : 1;

            video.muted = false;
            video.volume =
                restoredVolume;

            setVolume(
                restoredVolume
            );

            setIsMuted(false);
        } else {
            video.muted = true;
            setIsMuted(true);
        }

        showVideoControlsNow();
    };

    const handleVolumeChange = (e) => {
        const value = Number(
            e.target.value
        );

        if (!Number.isFinite(value)) {
            return;
        }

        setVolume(value);

        const video =
            videoRef.current;

        if (video) {
            video.volume = value;
            video.muted =
                value === 0;
        }

        setIsMuted(value === 0);

        showVideoControlsNow();
    };

    /* =========================================================
       SPEED
    ========================================================= */

    const handleSpeedChange = (e) => {
        const value = Number(
            e.target.value
        );

        if (!Number.isFinite(value)) {
            return;
        }

        setPlaybackRate(value);

        if (videoRef.current) {
            videoRef.current.playbackRate =
                value;
        }

        showVideoControlsNow();
    };

    /* =========================================================
       FULLSCREEN
    ========================================================= */

    const goFullScreen = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        const element =
            videoContainerRef.current;

        if (!element) {
            return;
        }

        try {
            if (
                document.fullscreenElement
            ) {
                await document.exitFullscreen();
            } else if (
                element.requestFullscreen
            ) {
                await element.requestFullscreen();
            }
        } catch (error) {
            console.error(
                "Fullscreen error:",
                error
            );
        }

        showVideoControlsNow();
    };

    /* =========================================================
       SEEK
    ========================================================= */

    const handleSeekStart = (e) => {
        e.stopPropagation();

        setIsSeeking(true);

        showVideoControlsNow();
    };

    const handleSeekChange = (e) => {
        e.stopPropagation();

        const value = Number(
            e.target.value
        );

        if (!Number.isFinite(value)) {
            return;
        }

        setCurrentTime(value);

        if (videoRef.current) {
            videoRef.current.currentTime =
                value;
        }

        showVideoControlsNow();
    };

    const handleSeekEnd = (e) => {
        e.stopPropagation();

        setIsSeeking(false);

        showVideoControlsNow();
    };

    /* =========================================================
       IMAGE LOADING
    ========================================================= */

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        toast.error(
            "Unable to load this image"
        );
    };

    /* =========================================================
       TOUCH / MOBILE SWIPE
    ========================================================= */

    const handleTouchStart = (e) => {
        const touch =
            e.touches?.[0];

        if (!touch) {
            return;
        }

        touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
        };

        if (isVideo) {
            showVideoControlsNow();
        }
    };

    const handleTouchEnd = (e) => {
        const touch =
            e.changedTouches?.[0];

        if (!touch) {
            return;
        }

        const start =
            touchStartRef.current;

        const deltaX =
            touch.clientX - start.x;

        const deltaY =
            touch.clientY - start.y;

        const threshold = 60;

        /*
         * IMAGE:
         * swipe right = previous
         * swipe left = next
         *
         * This component only previews
         * one community message, so there
         * is no next/previous message
         * collection here.
         *
         * Therefore we only reveal controls
         * for video. The swipe handler is
         * kept ready for a collection if
         * previewMessage later becomes an
         * array.
         */
        if (isVideo) {
            if (
                Math.abs(deltaY) >
                    Math.abs(deltaX) &&
                Math.abs(deltaY) >
                    threshold
            ) {
                showVideoControlsNow();
            }
        }
    };

    /* =========================================================
       MOUSE CONTROLS
    ========================================================= */

    const handleMouseMove = () => {
        if (isVideo) {
            showVideoControlsNow();
        }
    };

    /* =========================================================
       PIN
    ========================================================= */

    const openPinDuration = (message) => {
        if (!message) {
            return;
        }

        /*
         * Already pinned → UNPIN
         */
        if (message.is_pinned) {
            handleUnpin(message);

            setSelectedMessage(null);
            setMenuOpen(false);

            return;
        }

        /*
         * Not pinned → choose duration
         */
        setPinningMessage(message);
        setShowPinDuration(true);

        setSelectedMessage(null);
        setMenuOpen(false);
    };

    const handlePin = async (
        message,
        days
    ) => {
        if (
            !message?.id ||
            loadingPinId !== null
        ) {
            return false;
        }

        setLoadingPinId(
            message.id
        );

        try {
            await api.put(
                "/api/communities/messages/pin",
                {
                    message_id:
                        message.id,
                    community_id:
                        activeCommunity?.id,
                    days,
                }
            );

            setMessages((prev) =>
                prev.map((item) =>
                    Number(item.id) ===
                    Number(message.id)
                        ? {
                              ...item,
                              is_pinned: true,
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
                        : item
                )
            );

            setShowPinDuration(false);
            setPinningMessage(null);

            toast.success(
                "Message pinned"
            );

            return true;
        } catch (error) {
            console.error(
                "Pin error:",
                error
            );

            toast.error(
                error?.response
                    ?.data?.message ||
                    "Failed to pin message"
            );

            return false;
        } finally {
            setLoadingPinId(null);
        }
    };

    const handleUnpin = async (
        message
    ) => {
        if (
            !message?.id ||
            loadingPinId !== null
        ) {
            return false;
        }

        setLoadingPinId(
            message.id
        );

        try {
            await api.delete(
                "/api/communities/messages/pin",
                {
                    data: {
                        message_id:
                            message.id,
                        community_id:
                            activeCommunity?.id,
                    },
                }
            );

            setMessages((prev) =>
                prev.map((item) =>
                    Number(item.id) ===
                    Number(message.id)
                        ? {
                              ...item,
                              is_pinned: false,
                              pin_expires_at:
                                  null,
                          }
                        : item
                )
            );

            toast.success(
                "Message unpinned"
            );

            return true;
        } catch (error) {
            console.error(
                "Unpin error:",
                error
            );

            toast.error(
                error?.response
                    ?.data?.message ||
                    "Failed to unpin message"
            );

            return false;
        } finally {
            setLoadingPinId(null);
        }
    };

    /* =========================================================
       DOWNLOAD
    ========================================================= */

    const handleDownloadMessage =
        async (message) => {
            if (!message) {
                return;
            }

            const toastId =
                toast.loading(
                    `Downloading ${
                        message.file_name ||
                        "file"
                    }...`
                );

            try {
                const token =
                    localStorage.getItem(
                        "token"
                    );

                const response =
                    await fetch(
                        `http://localhost:8000/api/community/messages/download/${message.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                if (!response.ok) {
                    const text =
                        await response.text();

                    throw new Error(
                        text ||
                            "Download failed"
                    );
                }

                const blob =
                    await response.blob();

                const downloadUrl =
                    window.URL.createObjectURL(
                        blob
                    );

                const a =
                    document.createElement(
                        "a"
                    );

                a.href =
                    downloadUrl;

                a.download =
                    message.file_name ||
                    `file-${message.id}`;

                document.body.appendChild(
                    a
                );

                a.click();

                document.body.removeChild(
                    a
                );

                window.URL.revokeObjectURL(
                    downloadUrl
                );

                toast.success(
                    "Download completed",
                    {
                        id: toastId,
                    }
                );
            } catch (error) {
                console.error(
                    "Download error:",
                    error
                );

                toast.error(
                    error.message ||
                        "Failed to download file",
                    {
                        id: toastId,
                    }
                );
            }
        };

    /* =========================================================
       COPY LINK
    ========================================================= */

    const handleCopyLink = async (
        message
    ) => {
        try {
            let file = null;

            if (
                message?.files
                    ?.length
            ) {
                file =
                    message.files[0]
                        ?.file_url;
            } else if (
                message?.file
            ) {
                file =
                    getImage(
                        message.file
                    );
            }

            if (!file) {
                toast.error(
                    "No media link found"
                );
                return;
            }

            await navigator.clipboard.writeText(
                file
            );

            toast.success(
                "Media link copied"
            );
        } catch (error) {
            console.error(error);

            toast.error(
                "Failed to copy link"
            );
        }
    };

    /* =========================================================
       COPY TEXT
    ========================================================= */

    const handleCopyText = async (
        message
    ) => {
        try {
            let text = "";

            if (
                message?.approvals
                    ?.length > 0
            ) {
                const latestApproval =
                    message.approvals[
                        message
                            .approvals
                            .length - 1
                    ];

                text =
                    latestApproval?.admin_response ||
                    "";
            } else {
                text =
                    message?.message ||
                    "";
            }

            if (!text) {
                toast.error(
                    "No text found"
                );
                return;
            }

            await navigator.clipboard.writeText(
                text
            );

            toast.success(
                "Text copied"
            );
        } catch (error) {
            console.error(error);

            toast.error(
                "Failed to copy text"
            );
        }
    };

    /* =========================================================
       IMAGE URL
    ========================================================= */

    function getImage(image) {
        if (!image) {
            return null;
        }

        if (
            typeof image === "string" &&
            image.startsWith("http")
        ) {
            return image;
        }

        return `http://localhost:8000/storage/${image}`;
    }

    /* =========================================================
       CLOSE
    ========================================================= */

    const closePreview = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }

        setShowPreview(false);
        setMenuOpen(false);
        setShowSpeed(false);
        setReactionMsg(null);
    };

    /* =========================================================
       ESC
    ========================================================= */

    useEffect(() => {
        if (!showPreview) {
            return;
        }

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                closePreview();
            }
        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [showPreview]);

    if (
        !showPreview ||
        !previewMessage
    ) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-[99999]
                bg-black/90
                backdrop-blur-md
                flex
                flex-col
                overflow-hidden
            "
        >
            {/* =====================================================
                HEADER
            ====================================================== */}

            <div
                className="
                    h-16
                    shrink-0
                    px-4
                    flex
                    items-center
                    justify-between
                    relative
                    z-[200]
                "
            >
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={
                            closePreview
                        }
                        className="
                            text-white
                            flex
                            items-center
                            justify-center
                            shrink-0
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
                                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                            />
                        </svg>
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            {activeCommunity?.community_image && (
                                <img
                                    src={getImage(
                                        activeCommunity.community_image
                                    )}
                                    alt={
                                        activeCommunity.community_name
                                    }
                                    className="
                                        w-10
                                        h-10
                                        rounded-full
                                        object-cover
                                        shrink-0
                                    "
                                />
                            )}

                            <div className="min-w-0">
                                <h3
                                    className="
                                        font-bold
                                        block
                                        sm:hidden
                                        text-lg
                                        text-white
                                    "
                                >
                                    {activeCommunity?.community_name?.length >
                                    9
                                        ? `${activeCommunity.community_name.slice(
                                              0,
                                              9
                                          )}...`
                                        : activeCommunity?.community_name}
                                </h3>

                                <h3
                                    className="
                                        font-bold
                                        hidden
                                        sm:block
                                        text-lg
                                        text-white
                                    "
                                >
                                    {
                                        activeCommunity?.community_name
                                    }
                                </h3>
                            </div>
                        </div>

                        <div className="text-[9px] text-white">
                            {previewMessage?.created_at &&
                                new Date(
                                    previewMessage.created_at
                                ).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "numeric",
                                        minute: "2-digit",
                                    }
                                )}
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* DOWNLOAD */}
                    <button
                        type="button"
                        onClick={() =>
                            handleDownloadMessage(
                                previewMessage
                            )
                        }
                        className="text-white"
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
                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                        </svg>
                    </button>

                    {/* MENU */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setMenuOpen(
                                    (prev) =>
                                        !prev
                                )
                            }
                            className="text-white"
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
                                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0-1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                                />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div
                                className="
                                    absolute
                                    right-0
                                    top-full
                                    mt-2
                                    bg-[#111]
                                    rounded-xl
                                    w-44
                                    overflow-hidden
                                    shadow-xl
                                    z-[300]
                                "
                            >
                                <MenuItem
                                    label="Forward"
                                    onClick={() => {
                                        openForward(
                                            previewMessage
                                        );
                                        setMenuOpen(
                                            false
                                        );
                                        setShowPreview(
                                            false
                                        );
                                    }}
                                    icon={
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
                                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                                            />
                                        </svg>
                                    }
                                />

                                {(previewMessage?.type ===
                                    "image" ||
                                    previewMessage?.type ===
                                        "video") && (
                                    <MenuItem
                                        label="Copy Link"
                                        onClick={() => {
                                            handleCopyLink(
                                                previewMessage
                                            );
                                            setMenuOpen(
                                                false
                                            );
                                        }}
                                    />
                                )}

                                {(previewMessage?.message ||
                                    previewMessage?.approvals
                                        ?.length) && (
                                    <MenuItem
                                        label="Copy Text"
                                        onClick={() => {
                                            handleCopyText(
                                                previewMessage
                                            );
                                            setMenuOpen(
                                                false
                                            );
                                        }}
                                    />
                                )}

                                {isAdmin && (
                                    <MenuItem
                                        onClick={() =>
                                            openPinDuration(
                                                previewMessage
                                            )
                                        }
                                        label={
                                            previewMessage.is_pinned
                                                ? "Unpin"
                                                : "Pin"
                                        }
                                        icon={
                                            previewMessage.is_pinned ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                    className="w-5 h-5"
                                                >
                                                    <path d="M12 2a1 1 0 0 1 1 1v6.586l3.707 3.707A1 1 0 0 1 16 15H8a1 1 0 0 1-.707-1.707L11 9.586V3a1 1 0 0 1 1-1Z" />
                                                    <path d="M12 15v7" />
                                                </svg>
                                            ) : (
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
                                                        d="M12 3v6m0 0 3 3m-3-3-3 3m3-3v12"
                                                    />
                                                </svg>
                                            )
                                        }
                                    />
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
                    min-h-0
                    min-w-0
                    w-full
                    bg-black/50
                    flex
                    items-center
                    justify-center
                    relative
                    overflow-hidden
                "
            >
                <div
                    ref={
                        videoContainerRef
                    }
                    onTouchStart={
                        handleTouchStart
                    }
                    onTouchEnd={
                        handleTouchEnd
                    }
                    onMouseMove={
                        handleMouseMove
                    }
                    onMouseEnter={() => {
                        if (isVideo) {
                            showVideoControlsNow();
                        }
                    }}
                    onClick={() => {
                        if (isVideo) {
                            showVideoControlsNow();
                        }
                    }}
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
                                onLoadStart={() => {
                                    setVideoLoading(
                                        true
                                    );
                                    setDuration(
                                        0
                                    );
                                    setCurrentTime(
                                        0
                                    );
                                }}
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
                                onError={
                                    handleVideoError
                                }
                            />
                        )}

                    {/* =================================================
                        NO MEDIA
                    ================================================== */}

                    {!mediaUrl && (
                        <div className="text-white/70 text-sm">
                            No media available
                        </div>
                    )}

                    {/* =================================================
                        LOADING
                    ================================================== */}

                    {(imageLoading ||
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
                        VIDEO TOP CONTROLS
                    ================================================== */}

                    {isVideo && (
                        <div
                            className={`
                                absolute
                                top-3
                                left-3
                                right-3
                                sm:top-4
                                sm:left-5
                                sm:right-5
                                z-[160]
                                flex
                                items-center
                                justify-end
                                gap-2
                                sm:gap-3
                                transition-all
                                duration-300
                                ${
                                    showVideoControls
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 -translate-y-2 pointer-events-none"
                                }
                            `}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            onTouchStart={(e) =>
                                e.stopPropagation()
                            }
                            onTouchMove={(e) =>
                                e.stopPropagation()
                            }
                            onTouchEnd={(e) =>
                                e.stopPropagation()
                            }
                        >
                            {/* VOLUME */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-black/60
                                    backdrop-blur-md
                                    rounded-full
                                    px-3
                                    py-2
                                    text-white
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        toggleMute
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                    "
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
                                    onMouseDown={(
                                        e
                                    ) =>
                                        e.stopPropagation()
                                    }
                                    onTouchStart={(
                                        e
                                    ) =>
                                        e.stopPropagation()
                                    }
                                    className="
                                        w-16
                                        sm:w-20
                                        h-[3px]
                                        appearance-none
                                        accent-white
                                        cursor-pointer
                                    "
                                />
                            </div>

                            {/* SPEED */}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(
                                        e
                                    ) => {
                                        e.stopPropagation();

                                        setShowSpeed(
                                            (prev) =>
                                                !prev
                                        );

                                        showVideoControlsNow();
                                    }}
                                    className="
                                        bg-black/60
                                        backdrop-blur-md
                                        border
                                        border-white/20
                                        text-white
                                        rounded-full
                                        px-3
                                        py-2
                                        text-xs
                                        sm:text-sm
                                    "
                                >
                                    {
                                        playbackRate
                                    }
                                    x
                                </button>

                                {showSpeed && (
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-11
                                            w-40
                                            bg-black/95
                                            border
                                            border-white/20
                                            rounded-xl
                                            p-3
                                            z-[300]
                                        "
                                        onClick={(
                                            e
                                        ) =>
                                            e.stopPropagation()
                                        }
                                    >
                                        <div className="text-white text-xs mb-2">
                                            Playback speed
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
                                            "
                                        />

                                        <div className="flex justify-between text-[10px] text-white/60 mt-1">
                                            <span>
                                                0.5x
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
                                    goFullScreen
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-full
                                    bg-black/60
                                    backdrop-blur-md
                                    border
                                    border-white/20
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="w-5 h-5"
                                >
                                    <path
                                        d="M8 3H5a2 2 0 0 0-2 2v3"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M16 3h3a2 2 0 0 1 2 2v3"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M8 21H5a2 2 0 0 1-2-2v-3"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M16 21h3a2 2 0 0 0 2-2v-3"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* =================================================
                        CENTER PLAY / PAUSE
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
                                z-[140]
                                flex
                                items-center
                                justify-center
                                transition-opacity
                                duration-300
                                ${
                                    showVideoControls &&
                                    !videoLoading
                                        ? "opacity-100"
                                        : "opacity-0 pointer-events-none"
                                }
                            `}
                        >
                            <span
                                className="
                                    w-12
                                    h-12
                                    sm:w-14
                                    sm:h-14
                                    rounded-full
                                    bg-black/40
                                    backdrop-blur-md
                                    border
                                    border-white/30
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
                        BOTTOM VIDEO PROGRESS
                    ================================================== */}

                    {isVideo && (
                        <div
                            className={`
                                absolute
                                bottom-3
                                left-3
                                right-3
                                sm:bottom-4
                                sm:left-5
                                sm:right-5
                                z-[160]
                                transition-all
                                duration-300
                                ${
                                    showVideoControls
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 translate-y-2 pointer-events-none"
                                }
                            `}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            onMouseDown={(e) =>
                                e.stopPropagation()
                            }
                            onTouchStart={(e) =>
                                e.stopPropagation()
                            }
                            onTouchMove={(e) =>
                                e.stopPropagation()
                            }
                            onTouchEnd={(e) =>
                                e.stopPropagation()
                            }
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
                                <span className="w-[38px] shrink-0">
                                    {formatTime(
                                        currentTime
                                    )}
                                </span>

                                <input
                                    type="range"
                                    min="0"
                                    max={
                                        duration >
                                        0
                                            ? duration
                                            : 0
                                    }
                                    step="0.01"
                                    value={
                                        duration >
                                        0
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
                                    disabled={
                                        duration <=
                                        0
                                    }
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

                                <span className="w-[38px] shrink-0 text-right">
                                    {formatTime(
                                        duration
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
                CAPTION
            ====================================================== */}

            {previewMessage.message && (
                <div
                    className="
                        px-5
                        py-4
                        mx-auto
                        mt-3
                        text-white
                        w-full
                        max-w-md
                        bg-[#0c0c0c]
                        shrink-0
                    "
                >
                    <PreviewMessageText
                        msg={
                            previewMessage
                        }
                    />
                </div>
            )}

            {/* =====================================================
                REACTIONS
            ====================================================== */}

            <div
                className="
                    px-4
                    pb-5
                    pt-3
                    flex
                    items-center
                    gap-3
                    shrink-0
                "
            >
                {reactionMsg?.id ===
                    msg?.id && (
                    <div>
                        <CommunityMediaReaction
                            onReact={
                                react
                            }
                            message={
                                reactionMsg
                            }
                            isMine={
                                reactionMsg &&
                                reactionMsg.sender_id ===
                                    authUser?.id
                            }
                            setShowReactions={() =>
                                setReactionMsg(
                                    null
                                )
                            }
                        />
                    </div>
                )}

                <span>
                    {msg?.reactions
                        ?.length >
                        0 && (
                        <div
                            className="
                                bg-[#1e1e1e]
                                rounded-full
                                px-4
                                py-2
                                flex
                                gap-2
                            "
                        >
                            {Object.values(
                                msg.reactions.reduce(
                                    (
                                        acc,
                                        reaction
                                    ) => {
                                        if (
                                            !acc[
                                                reaction
                                                    .emoji
                                            ]
                                        ) {
                                            acc[
                                                reaction
                                                    .emoji
                                            ] = {
                                                emoji:
                                                    reaction.emoji,
                                                count: 0,
                                            };
                                        }

                                        acc[
                                            reaction
                                                .emoji
                                        ].count++;

                                        return acc;
                                    },
                                    {}
                                )
                            ).map(
                                (
                                    reaction,
                                    index
                                ) => (
                                    <span
                                        key={
                                            index
                                        }
                                    >
                                        {
                                            reaction.emoji
                                        }
                                        {reaction.count >
                                            1 &&
                                            ` ${reaction.count}`}
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();

                        setReactionMsg(
                            msg
                        );
                    }}
                    className="
                        w-10
                        h-10
                        rounded-full
                        bg-[#1e1e1e]
                        flex
                        items-center
                        justify-center
                    "
                >
                    😊
                </button>
            </div>

            {/* =====================================================
                DELETE MODAL
            ====================================================== */}

            <DeleteMessageModal
                open={
                    showDeleteModal
                }
                message={
                    selectedMessage
                }
                setMessages={
                    setMessages
                }
                onClose={() => {
                    setShowDeleteModal(
                        false
                    );

                    setSelectedMessage(
                        null
                    );
                }}
            />

            {/* =====================================================
                PIN DURATION MODAL
            ====================================================== */}

            {showPinDuration && (
                <div
                    className={`
                        fixed
                        inset-0
                        z-[100000]
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                        ${
                            loadingPinId !==
                            null
                                ? "cursor-not-allowed"
                                : ""
                        }
                    `}
                    onMouseDown={(e) => {
                        if (
                            loadingPinId !==
                            null
                        ) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    onClick={(e) => {
                        if (
                            loadingPinId !==
                            null
                        ) {
                            e.preventDefault();
                            e.stopPropagation();
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
                                loadingPinId !==
                                null
                                    ? "pointer-events-none select-none"
                                    : ""
                            }
                        `}
                        style={{
                            backgroundColor:
                                "var(--bg-color)",
                            color: "var(--text-color)",
                        }}
                        onClick={(e) =>
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
                                    loadingPinId !==
                                    null
                                }
                                onClick={() => {
                                    if (
                                        loadingPinId !==
                                        null
                                    ) {
                                        return;
                                    }

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
                            How long should this
                            message stay pinned?
                        </p>

                        <div className="space-y-2">
                            {[7, 14, 30].map(
                                (days) => (
                                    <button
                                        key={
                                            days
                                        }
                                        type="button"
                                        disabled={
                                            loadingPinId !==
                                            null
                                        }
                                        onClick={() => {
                                            if (
                                                loadingPinId !==
                                                null
                                            ) {
                                                return;
                                            }

                                            handlePin(
                                                pinningMessage,
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
                                            Message
                                            will
                                            expire
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
 
function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
        danger ? "text-red-400" : "text-white"
      }`}
    >
      {label}
    </button>
  );
}