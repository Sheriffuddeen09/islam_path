
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function PostVideoCard({ v, post }) {
    const videoRef = useRef(null);
    const viewedRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [videoLoading, setVideoLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);

    const hideControlsTimer = useRef(null);

    const navigate = useNavigate();

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const revealControls = () => {
        setShowControls(true);

        if (hideControlsTimer.current) {
            clearTimeout(hideControlsTimer.current);
        }

        if (playing) {
            hideControlsTimer.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };


    useEffect(() => {
        return () => {
            if (hideControlsTimer.current) {
                clearTimeout(hideControlsTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!videoRef.current) return;

                if (entry.isIntersecting) {
                    videoRef.current
                        .play()
                        .catch(() => {});

                    setPlaying(true);
                    revealControls();
                } else {
                    if (!videoRef.current.paused) {
                        videoRef.current.pause();
                    }

                    setPlaying(false);
                    setShowControls(true);
                }
            },
            {
                threshold: 0.6,
            }
        );

        observer.observe(video);

        return () => {
            observer.disconnect();
        };
    }, []);

    const handleMouseEnter = () => {
        revealControls();

        const video = videoRef.current;

        if (!video) return;

        video.play().catch(() => {});

        setPlaying(true);
    };

    const handleMouseLeave = () => {
        const video = videoRef.current;

        if (!video) return;

        video.pause();
        video.currentTime = 0;

        setCurrentTime(0);
        setPlaying(false);
        setShowControls(true);
    };

    const togglePlay = (e) => {
        e.stopPropagation();

        const video = videoRef.current;

        if (!video) return;

        if (video.paused) {
            video.play().catch(() => {});
            setPlaying(true);
        } else {
            video.pause();
            setPlaying(false);
        }

        revealControls();
    };

    const toggleMute = (e) => {
        e.stopPropagation();

        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;

        setIsMuted(video.muted);

        revealControls();
    };

    const changeSpeed = (e) => {
        e.stopPropagation();

        const video = videoRef.current;

        if (!video) return;

        const speeds = [1, 1.25, 1.5, 1.75, 2];

        const currentIndex = speeds.indexOf(playbackRate);

        const nextIndex =
            currentIndex === -1
                ? 0
                : (currentIndex + 1) % speeds.length;

        const nextSpeed = speeds[nextIndex];

        video.playbackRate = nextSpeed;

        setPlaybackRate(nextSpeed);

        revealControls();
    };


    const goFullScreen = (e) => {
        e.stopPropagation();

        const video = videoRef.current;

        if (!video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen?.();
        } else if (video.requestFullscreen) {
            video.requestFullscreen();
        }

        revealControls();
    };

    const handleSeek = (e) => {
        e.stopPropagation();

        const video = videoRef.current;

        if (!video || !duration) return;

        const value = Number(e.target.value);

        video.currentTime = value;

        setCurrentTime(value);

        revealControls();
    };

    const handleVideoLoaded = () => {
        setVideoLoading(false);

        const video = videoRef.current;

        if (video) {
            setDuration(video.duration || 0);
        }
    };


    const handleCanPlay = () => {
        setVideoLoading(false);
    };


    const handleWaiting = () => {
        setVideoLoading(true);
    };


    const handlePlaying = () => {
        setVideoLoading(false);
        setPlaying(true);
    };


    const handleTimeUpdate = () => {
        const video = videoRef.current;

        if (!video) return;

        setCurrentTime(video.currentTime);
    };


    const handleLoadedMetadata = () => {
        const video = videoRef.current;

        if (!video) return;

        setDuration(video.duration || 0);
    };


    const onPlay = async () => {
        if (viewedRef.current) return;

        viewedRef.current = true;

        try {
            await api.post(
                `/api/post/${post.id}/view`
            );
        } catch (error) {
            console.error(
                "VIDEO VIEW ERROR:",
                error.response?.data || error
            );

            viewedRef.current = false;
        }
    };

    const handleCardClick = () => {
        navigate(`/post/video/${post.id}`);
    };


    return (
        <div
            key={v.id}
            className="
                group
                relative
                aspect-video
                bg-black
                cursor-pointer
                overflow-hidden
                rounded-2xl
                shadow-md
                hover:shadow-xl
                transition-all
                px-2
                duration-300
            "
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={revealControls}
        >
            <video
                ref={videoRef}
                src={v.url}
                className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                "
                muted={isMuted}
                playsInline
                preload="auto"

                onLoadedData={handleVideoLoaded}
                onCanPlay={handleCanPlay}
                onWaiting={handleWaiting}
                onPlaying={handlePlaying}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={onPlay}
            />
            <div
                className="
                    absolute
                    inset-0
                    pointer-events-none
                    bg-gradient-to-b
                    from-black/20
                    via-transparent
                    to-black/70
                "
            />
            {videoLoading && (
                <div
                    className="
                        absolute
                        inset-0
                        z-30
                        flex
                        items-center
                        justify-center
                        pointer-events-none
                    "
                >
                    <div
                        className="
                            w-11
                            h-11
                            rounded-full
                            border-[3px]
                            border-white/25
                            border-t-white
                            animate-spin
                        "
                    />
                </div>
            )}
           
            <div
                className={`
                    absolute
                    left-0
                    right-0
                    bottom-0
                    z-40
                    px-3
                    pb-3
                    pt-8

                    transition-all
                    duration-300

                    ${
                        showControls
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2 pointer-events-none"
                    }
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative w-full mb-2">

                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.1"
                        value={currentTime}
                        onChange={handleSeek}
                        className="
                            video-progress
                            w-full
                            h-[3px]
                            appearance-none
                            cursor-pointer
                            rounded-full
                            bg-white/25
                            accent-white
                        "
                    />

                </div>
                <div className="flex items-center justify-between">

                    {/* LEFT */}

                    <div className="flex items-center gap-2">

                        {/* PLAY */}

                        <button
                            type="button"
                            onClick={togglePlay}
                            className="
                                w-8
                                h-8
                                rounded-full
                                bg-black/30
                                backdrop-blur-md
                                border
                                border-white/15
                                flex
                                items-center
                                justify-center
                                text-white
                                hover:bg-black/50
                                transition
                            "
                        >
                            {playing ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4 ml-[1px]"
                                >
                                    <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l9.88-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
                                </svg>
                            )}
                        </button>


                        <button
                            type="button"
                            onClick={toggleMute}
                            className="
                                w-8
                                h-8
                                rounded-full
                                bg-black/30
                                backdrop-blur-md
                                border
                                border-white/15
                                flex
                                items-center
                                justify-center
                                text-white
                                hover:bg-black/50
                                transition
                            "
                        >

                            {isMuted ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 5 6 9H3v6h3l5 4V5Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        d="m16 9 4 4m0-4-4 4"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 5 6 9H3v6h3l5 4V5Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"
                                    />
                                </svg>
                            )}

                        </button>

                        <span
                            className="
                                text-[11px]
                                sm:text-xs
                                text-white
                                font-medium
                                tabular-nums
                                ml-1
                            "
                        >
                            {formatTime(currentTime)}
                            <span className="text-white/50 mx-1">
                                /
                            </span>
                            {formatTime(duration)}
                        </span>

                    </div>


                    <div className="flex items-center gap-2">

                        {/* SPEED */}

                        <button
                            type="button"
                            onClick={changeSpeed}
                            className="
                                h-8
                                min-w-8
                                px-2
                                rounded-full
                                bg-black/30
                                backdrop-blur-md
                                border
                                border-white/15
                                flex
                                items-center
                                justify-center
                                gap-1
                                text-white
                                hover:bg-black/50
                                transition
                            "
                        >

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 12a8 8 0 1 1 16 0"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M12 12 16 8"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M7 19h10"
                                />
                            </svg>

                            <span className="text-[10px] font-semibold">
                                {playbackRate}x
                            </span>

                        </button>


                        {/* FULLSCREEN */}

                        <button
                            type="button"
                            onClick={goFullScreen}
                            className="
                                w-8
                                h-8
                                rounded-full
                                bg-black/30
                                backdrop-blur-md
                                border
                                border-white/15
                                flex
                                items-center
                                justify-center
                                text-white
                                hover:bg-black/50
                                transition
                            "
                        >

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                className="w-4 h-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    d="M8 3H5a2 2 0 0 0-2 2v3"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M16 3h3a2 2 0 0 1 2 2v3"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M8 21H5a2 2 0 0 1-2-2v-3"
                                />

                                <path
                                    strokeLinecap="round"
                                    d="M16 21h3a2 2 0 0 0 2-2v-3"
                                />
                            </svg>

                        </button>

                    </div>

                </div>

            </div>


            {/* ------------------------------------------------
                SMALL SPEED INDICATOR
            ------------------------------------------------ */}

            {playbackRate !== 1 && playing && (
                <div
                    className="
                        absolute
                        top-3
                        right-3
                        z-30

                        px-2
                        py-1

                        rounded-full

                        bg-black/35
                        backdrop-blur-md

                        border
                        border-white/15

                        text-white
                        text-[10px]
                        font-semibold

                        pointer-events-none
                    "
                >
                    {playbackRate}x
                </div>
            )}

        </div>
    );
}