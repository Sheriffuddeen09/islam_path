







import React, { useEffect, useRef, useState } from "react";
import PreviewCommentReactionShare from "./PreviewCommentReactionShare";
import PostOptions from "./PostOption";
import VideoPreviewCommentReactionShare from "./previewimagevideo/VideoPreviewCommentReactionShare";

export default function PostVideoPreviewModal({
    preview,
    onClose,
    setVideoPreview,
    post,
    chats,

    counts,
    total_reaction,
    me,
    firstUser,
    others,
    allUsers,
    myReaction,
    reactionList,
    reactionLoading,
    toggleReaction,
    onLikeClick,

    showReactions,
    setShowReactions,

    showEmojiPicker,
    setShowEmojiPicker,

    showUsersPopup,
    setShowUsersPopup,

    currentUser,
    getColor,

    postComments,
    setPostComments,
    commentInputRef,
    focusCommentInput,

    newComment,
    setNewComment,

    loading,
    setLoading,

    showEmoji,
    setShowEmoji,
    emojiList,
    setEmojiList,

    setPostIdModal,
    postIdModal,

    shares,
    setShares,
    setMessageOpenShare,
    handleShare,

    sending,
    messageOpenShare,
    selectedChats,
    setSelectedChats,
    setSending,
    shareToChat,
}) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(true);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const [speed, setSpeed] = useState(1);

    const videoUrl =
        preview?.url ||
        preview?.video?.url ||
        preview?.video ||
        "";

    // --------------------------------------------------
    // FORMAT TIME
    // --------------------------------------------------
    const formatTime = (time) => {
        if (!Number.isFinite(time)) {
            return "0:00";
        }

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes}:${seconds
            .toString()
            .padStart(2, "0")}`;
    };

    // --------------------------------------------------
    // RESET WHEN PREVIEW CHANGES
    // --------------------------------------------------
    useEffect(() => {
        if (!preview) {
            return;
        }

        setIsVideoLoading(true);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);

        const video = videoRef.current;

        if (video) {
            video.pause();
            video.currentTime = 0;
            video.load();
        }
    }, [preview]);

    // --------------------------------------------------
    // INITIAL VIDEO SETTINGS
    // --------------------------------------------------
    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.volume = volume;
        video.playbackRate = speed;
    }, []);

    // --------------------------------------------------
    // KEEP VOLUME / SPEED UPDATED
    // --------------------------------------------------
    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.volume = volume;
        video.playbackRate = speed;
    }, [volume, speed]);

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------
    useEffect(() => {
        return () => {
            const video = videoRef.current;

            if (video) {
                video.pause();
            }
        };
    }, []);

    // --------------------------------------------------
    // AUTO PLAY AFTER VIDEO LOADS
    // --------------------------------------------------
    const autoPlayVideo = async () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        try {
            setIsVideoLoading(false);

            /*
             * Try to automatically play the video.
             *
             * Some browsers block autoplay when audio is enabled.
             * If blocked, the normal play button remains available.
             */
            await video.play();

            setIsPlaying(true);
        } catch (error) {
            console.log(
                "Autoplay was blocked by browser:",
                error
            );

            setIsPlaying(false);
        }
    };

    // --------------------------------------------------
    // VIDEO CAN PLAY
    // --------------------------------------------------
    const handleCanPlay = () => {
        setIsVideoLoading(false);

        autoPlayVideo();
    };

    // --------------------------------------------------
    // VIDEO WAITING / BUFFERING
    // --------------------------------------------------
    const handleWaiting = () => {
        setIsVideoLoading(true);
    };

    // --------------------------------------------------
    // VIDEO PLAYING
    // --------------------------------------------------
    const handlePlaying = () => {
        setIsVideoLoading(false);
        setIsPlaying(true);
    };

    // --------------------------------------------------
    // PLAY / PAUSE
    // --------------------------------------------------
    const togglePlay = async () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        try {
            if (video.paused) {
                setIsVideoLoading(true);

                await video.play();

                setIsPlaying(true);
                setIsVideoLoading(false);
            } else {
                video.pause();
            }
        } catch (error) {
            console.error(
                "VIDEO PLAY ERROR:",
                error
            );

            setIsVideoLoading(false);
        }
    };

    // --------------------------------------------------
    // PLAY
    // --------------------------------------------------
    const handlePlay = () => {
        setIsPlaying(true);
        setIsVideoLoading(false);
    };

    // --------------------------------------------------
    // PAUSE
    // --------------------------------------------------
    const handlePause = () => {
        setIsPlaying(false);
    };

    // --------------------------------------------------
    // TIME UPDATE
    // --------------------------------------------------
    const handleTimeUpdate = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        setCurrentTime(video.currentTime);
    };

    // --------------------------------------------------
    // METADATA
    // --------------------------------------------------
    const handleLoadedMetadata = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        setDuration(
            Number.isFinite(video.duration)
                ? video.duration
                : 0
        );

        setCurrentTime(video.currentTime || 0);
    };

    // --------------------------------------------------
    // SEEK
    // --------------------------------------------------
    const handleSeek = (e) => {
        const newTime = Number(e.target.value);

        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // --------------------------------------------------
    // BACKWARD 10 SEC
    // --------------------------------------------------
    const handleBackward = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const newTime = Math.max(
            0,
            video.currentTime - 10
        );

        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // --------------------------------------------------
    // FORWARD 10 SEC
    // --------------------------------------------------
    const handleForward = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const maxTime =
            Number.isFinite(video.duration)
                ? video.duration
                : duration;

        const newTime = Math.min(
            maxTime,
            video.currentTime + 10
        );

        video.currentTime = newTime;
        setCurrentTime(newTime);
    };

    // --------------------------------------------------
    // VOLUME
    // --------------------------------------------------
    const handleVolumeChange = (e) => {
        const newVolume = Number(e.target.value);

        const video = videoRef.current;

        setVolume(newVolume);

        if (!video) {
            return;
        }

        video.volume = newVolume;

        if (newVolume === 0) {
            video.muted = true;
            setIsMuted(true);
        } else {
            video.muted = false;
            setIsMuted(false);
        }
    };

    // --------------------------------------------------
    // MUTE
    // --------------------------------------------------
    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.muted || isMuted) {
            video.muted = false;

            const restoreVolume =
                volume === 0 ? 1 : volume;

            video.volume = restoreVolume;

            setVolume(restoreVolume);
            setIsMuted(false);
        } else {
            video.muted = true;
            setIsMuted(true);
        }
    };

    // --------------------------------------------------
    // SPEED
    // --------------------------------------------------
    const handleSpeedChange = (e) => {
        const newSpeed = Number(e.target.value);

        setSpeed(newSpeed);

        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.playbackRate = newSpeed;
    };

    // --------------------------------------------------
    // FULLSCREEN
    // --------------------------------------------------
    const handleFullscreen = async () => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        try {
            if (!document.fullscreenElement) {
                await container.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error(
                "FULLSCREEN ERROR:",
                error
            );
        }
    };

    // --------------------------------------------------
    // CLOSE
    // --------------------------------------------------
    const handleClose = () => {
        const video = videoRef.current;

        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        setIsPlaying(false);
        setIsVideoLoading(false);

        onClose?.();
    };

    // --------------------------------------------------
    // KEYBOARD CONTROLS
    // --------------------------------------------------
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!preview) {
                return;
            }

            if (e.target.tagName === "INPUT") {
                return;
            }

            if (e.key === " ") {
                e.preventDefault();
                togglePlay();
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                handleBackward();
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                handleForward();
            }

            if (e.key === "m" || e.key === "M") {
                toggleMute();
            }

            if (e.key === "f" || e.key === "F") {
                handleFullscreen();
            }

            if (
                e.key === "Escape" &&
                document.fullscreenElement
            ) {
                document.exitFullscreen();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        preview,
        volume,
        isMuted,
        duration,
        isPlaying,
    ]);

    // --------------------------------------------------
    // PROGRESS
    // --------------------------------------------------
    const progress =
        duration > 0
            ? Math.min(
                  100,
                  Math.max(
                      0,
                      (currentTime / duration) * 100
                  )
              )
            : 0;

    if (!preview) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="
                fixed
                inset-0
                z-[9999]
                bg-black
                flex
                items-center
                justify-center
            "
        >

            {/* ========================================= */}
            {/* TOP RIGHT - CLOSE + OPTIONS */}
            {/* ========================================= */}
            <div
                className="
                    absolute
                    right-4
                    top-4
                    z-[100]
                    flex
                    items-center
                    gap-2
                "
            >

                {/* OPTIONS */}
                <div
                    className="
                        bg-white
                        rounded-full
                        flex
                        items-center
                        justify-center
                    "
                >
                    <PostOptions
                        post={post}
                        chats={chats}
                    />
                </div>

                {/* CLOSE / CANCEL */}
                <button
                    type="button"
                    onClick={handleClose}
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
                        border
                        border-white/20
                    "
                    aria-label="Close preview"
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

            </div>

            {/* ========================================= */}
            {/* VIDEO AREA */}
            {/* ========================================= */}
            <div
                className="
                    relative
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                "
            >

                {/* VIDEO */}
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="
                        w-full
                        h-full
                        object-contain
                        bg-black
                    "
                    playsInline
                    preload="auto"

                    onLoadedMetadata={
                        handleLoadedMetadata
                    }

                    onCanPlay={
                        handleCanPlay
                    }

                    onWaiting={
                        handleWaiting
                    }

                    onPlaying={
                        handlePlaying
                    }

                    onTimeUpdate={
                        handleTimeUpdate
                    }

                    onPlay={
                        handlePlay
                    }

                    onPause={
                        handlePause
                    }

                    onEnded={() => {
                        setIsPlaying(false);
                    }}
                />

                {/* ===================================== */}
                {/* VIDEO LOADING OVERLAY */}
                {/* ===================================== */}
                {isVideoLoading && (
                    <div
                        className="
                            absolute
                            inset-0
                            z-40
                            flex
                            flex-col
                            items-center
                            justify-center
                            bg-black/40
                            pointer-events-none
                        "
                    >
                        <div
                            className="
                                w-12
                                h-12
                                rounded-full
                                border-4
                                border-white/30
                                border-t-white
                                animate-spin
                            "
                        />

                        <span
                            className="
                                mt-3
                                text-white
                                text-sm
                                font-medium
                            "
                        >
                        </span>
                    </div>
                )}

                {/* ===================================== */}
                {/* REACTION / COMMENT / SHARE */}
                {/* ===================================== */}
                {!isVideoLoading && (
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
                            z-30
                        "
                    >
                        <VideoPreviewCommentReactionShare
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

                            handleShare={
                                handleShare
                            }

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

                            shareToChat={
                                shareToChat
                            }

                            postIdModal={
                                postIdModal
                            }

                            setOpen={setVideoPreview}

                        />
                    </div>
                )}

                {/* ===================================== */}
                {/* CENTER LOADING / PLAY BUTTON */}
                {/* ===================================== */}
                {!isVideoLoading && (
                    <button
                        type="button"
                        onClick={togglePlay}
                        className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            z-30
                            w-16
                            h-16
                            rounded-full
                            bg-black/55
                            backdrop-blur-sm
                            text-white
                            flex
                            items-center
                            justify-center
                            hover:bg-black/70
                            transition
                        "
                        aria-label={
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
                                <path d="M6.5 5.5A1.5 1.5 0 0 1 8 7v10a1.5 1.5 0 0 1-3 0V7a1.5 1.5 0 0 1 1.5-1.5Zm11 0A1.5 1.5 0 0 1 19 7v10a1.5 1.5 0 0 1-3 0V7a1.5 1.5 0 0 1 1.5-1.5Z" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-8 h-8 ml-1"
                            >
                                <path d="M8.5 5.7a1 1 0 0 1 1.5-.86l8.3 6.3a1.08 1.08 0 0 1 0 1.72L10 19.16a1 1 0 0 1-1.5-.86V5.7Z" />
                            </svg>
                        )}
                    </button>
                )}

                {/* ===================================== */}
                {/* BOTTOM CONTROLS */}
                {/* ===================================== */}
                <div
                    className="
                        absolute
                        left-0
                        right-0
                        bottom-0
                        z-40
                        px-4
                        pb-4
                        pt-12
                        bg-gradient-to-t
                        from-black
                        via-black/80
                        to-transparent
                    "
                >

                    {/* PROGRESS */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={currentTime}
                        onChange={handleSeek}
                        className="
                            w-full
                            h-1
                            cursor-pointer
                            accent-white
                            mb-3
                        "
                        style={{
                            background: `linear-gradient(
                                to right,
                                white ${progress}%,
                                rgba(255,255,255,0.35) ${progress}%
                            )`,
                        }}
                        aria-label="Video progress"
                    />

                    {/* CONTROL ROW */}
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-white
                        "
                    >

                        {/* BACKWARD */}
                        <button
                            type="button"
                            onClick={handleBackward}
                            className="
                                w-9
                                h-9
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:bg-white/15
                                transition
                            "
                            title="Back 10 seconds"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9.5 7.5H4.75V2.75"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.25 8.25a7.5 7.5 0 1 1-.65 7.7"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v8"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 9.5 12 8l1.5 1.5"
                                />
                            </svg>
                        </button>

                        {/* PLAY / PAUSE */}
                        <button
                            type="button"
                            onClick={togglePlay}
                            className="
                                w-9
                                h-9
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:bg-white/15
                                transition
                            "
                        >
                            {isPlaying ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path d="M7 5.5A1.5 1.5 0 0 1 8.5 7v10A1.5 1.5 0 0 1 5.5 17V7A1.5 1.5 0 0 1 7 5.5Zm10 0A1.5 1.5 0 0 1 18.5 7v10A1.5 1.5 0 0 1 15.5 17V7A1.5 1.5 0 0 1 17 5.5Z" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-5 h-5 ml-0.5"
                                >
                                    <path d="M8 5.8a1 1 0 0 1 1.55-.83l8.15 6.2a1.05 1.05 0 0 1 0 1.66l-8.15 6.2A1 1 0 0 1 8 18.2V5.8Z" />
                                </svg>
                            )}
                        </button>

                        {/* FORWARD */}
                        <button
                            type="button"
                            onClick={handleForward}
                            className="
                                w-9
                                h-9
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:bg-white/15
                                transition
                            "
                            title="Forward 10 seconds"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.8"
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.5 7.5h4.75V2.75"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.75 8.25a7.5 7.5 0 1 0 .65 7.7"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v8"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10.5 9.5 12 8l1.5 1.5"
                                />
                            </svg>
                        </button>

                        {/* TIME */}
                        <span
                            className="
                                text-xs
                                sm:text-sm
                                whitespace-nowrap
                                ml-1
                            "
                        >
                            {formatTime(currentTime)}
                            {" / "}
                            {formatTime(duration)}
                        </span>

                        <div className="flex-1" />

                        {/* MUTE */}
                        <button
                            type="button"
                            onClick={toggleMute}
                            className="
                                w-9
                                h-9
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:bg-white/15
                                transition
                            "
                        >
                            {isMuted || volume === 0 ? (
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
                                        d="M11 5.25 6.75 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.75L11 18.75V5.25Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m16 9-4 4m0-4 4 4"
                                    />
                                </svg>
                            ) : (
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
                                        d="M11 5.25 6.75 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.75L11 18.75V5.25Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.5 8.5a5 5 0 0 1 0 7"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.5 6a8.5 8.5 0 0 1 0 12"
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
                                sm:w-24
                                cursor-pointer
                                accent-white
                                volume-slider
                            "
                            aria-label="Volume"
                        />

                        {/* SPEED */}
                        <select
                            value={speed}
                            onChange={
                                handleSpeedChange
                            }
                            className="
                                bg-black/70
                                text-white
                                border
                                border-white/30
                                rounded
                                px-2
                                py-1
                                text-xs
                                sm:text-sm
                                outline-none
                                cursor-pointer
                            "
                        >
                            <option value="0.25">
                                0.25x
                            </option>

                            <option value="0.5">
                                0.5x
                            </option>

                            <option value="0.75">
                                0.75x
                            </option>

                            <option value="1">
                                1x
                            </option>

                            <option value="1.25">
                                1.25x
                            </option>

                            <option value="1.5">
                                1.5x
                            </option>

                            <option value="1.75">
                                1.75x
                            </option>

                            <option value="2">
                                2x
                            </option>
                        </select>

                        {/* FULLSCREEN */}
                        <button
                            type="button"
                            onClick={
                                handleFullscreen
                            }
                            className="
                                w-9
                                h-9
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:bg-white/15
                                transition
                            "
                            title="Fullscreen"
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
                                    d="M4.5 9V5.5A1 1 0 0 1 5.5 4h3.5M15 4h3.5a1 1 0 0 1 1 1v3.5M20 15v3.5a1 1 0 0 1-1 1h-3.5M9 19.5H5.5a1 1 0 0 1-1-1V15"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================= */}
            {/* VOLUME SLIDER */}
            {/* ========================================= */}
            <style>
                {`
                    .volume-slider {
                        height: 3px;
                        appearance: none;
                        -webkit-appearance: none;
                        background: rgba(255,255,255,0.35);
                        border-radius: 9999px;
                    }

                    .volume-slider::-webkit-slider-runnable-track {
                        height: 3px;
                        border-radius: 9999px;
                    }

                    .volume-slider::-webkit-slider-thumb {
                        appearance: none;
                        -webkit-appearance: none;
                        width: 10px;
                        height: 10px;
                        margin-top: -3.5px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                    }

                    .volume-slider::-moz-range-track {
                        height: 3px;
                        border-radius: 9999px;
                        background: rgba(255,255,255,0.35);
                    }

                    .volume-slider::-moz-range-progress {
                        height: 3px;
                        border-radius: 9999px;
                        background: white;
                    }

                    .volume-slider::-moz-range-thumb {
                        width: 10px;
                        height: 10px;
                        border: none;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                    }
                `}
            </style>
        </div>
    );
}