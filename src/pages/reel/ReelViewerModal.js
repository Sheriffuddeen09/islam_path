import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    X,
    Heart,
    Send,
    ArrowLeft,
    ArrowRight, Smile
} from "lucide-react";
  import api from "../../Api/axios";
import ReelOptionPreview from "./ReelOptionPreview";
import EmojiPicker from "emoji-picker-react";

export default function ReelViewerModal({
    user,
    reel,

    onClose,
    onPrevious,

    chats,

    message,
    setMessage,

    sending,

    currentUserIndex,
    reelUsers,
    mediaIndex,
    setMediaIndex,

    progress,
    setProgress,

    setReaction,

    setReelUsers,

    nextReel,
    markReelViewed, setSending, selectedReel, setMyReels, open, setOpen, shares, setShares, showImagePicker,
    setShowImagePicker, messageOpenShare, setMessageOpenShare, openReport, setOpenReport
}) {

    const videoRef = useRef(null);

    const [createdTime, setCreatedTime] = useState("");

        const timerRef = useRef(null);
    
    const [mediaReady, setMediaReady] = useState(true);

    const [showFullDescription, setShowFullDescription] =
    useState(false);

    const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

    const messageRef = useRef("");
    const openRef = useRef(false);

    const timerStartRef = useRef(null);
    const elapsedBeforePauseRef = useRef(0);

    useEffect(() => {
    openRef.current = open;
    }, [open]);

    useEffect(() => {
        messageRef.current = message;
    }, [message]);


    const isProgressPaused =
    message.trim().length > 0 || open;

const allUserReels =
    reelUsers?.[currentUserIndex]?.reels || [];

const reelItems = useMemo(() => {
    const items = [];

    allUserReels
        .slice()
        .sort(
            (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
        )
        .forEach((reelItem) => {

            // TEXT / CONTENT
            if (
                typeof reelItem.content === "string" &&
                reelItem.content.trim()
            ) {
                items.push({
                    type: "content",

                    id: `content-${reelItem.id}`,

                    // No media for content
                    mediaId: null,

                    reelId: reelItem.id,

                    content: reelItem.content,

                    created_at: reelItem.created_at,

                    // Reel-level fallback
                    user_reaction:
                        reelItem.user_reaction || null,

                    has_viewed:
                        reelItem.has_viewed === true,
                });
            }

            // MEDIA
            if (Array.isArray(reelItem.media)) {

                reelItem.media
                    .slice()
                    .sort(
                        (a, b) =>
                            Number(a.order || 0) -
                            Number(b.order || 0)
                    )
                    .forEach((mediaItem) => {

                        items.push({

                            ...mediaItem,

                            // VERY IMPORTANT
                            mediaId: Number(mediaItem.id),

                            reelId: Number(reelItem.id),

                            created_at:
                                reelItem.created_at,

                            // These should come from backend
                            user_reaction:
                                mediaItem.user_reaction || null,

                            has_viewed:
                                mediaItem.has_viewed === true,

                            message_count:
                                mediaItem.message_count || 0,
                        });

                    });
            }
        });

    return items;

}, [allUserReels]);


const currentItem =
    reelItems[mediaIndex] || null;

    const currentReaction =
    currentItem?.user_reaction || "";


    const onReaction = async (value) => {
    if (!selectedReel || !currentItem) {
        return;
    }

    const reelId = Number(
        currentItem.reelId || selectedReel.id
    );

    const mediaId = currentItem.mediaId
        ? Number(currentItem.mediaId)
        : null;

    
    setReaction(value || "");

    // -----------------------------------------
    // UPDATE REEL USERS
    // -----------------------------------------
    setReelUsers(prev =>
        prev.map(userGroup => ({
            ...userGroup,

            reels: Array.isArray(userGroup.reels)
                ? userGroup.reels.map(reel => {

                    if (
                        Number(reel.id) !==
                        reelId
                    ) {
                        return reel;
                    }

                    // -------------------------
                    // CONTENT ITEM
                    // -------------------------
                    if (!mediaId) {
                        return {
                            ...reel,
                            user_reaction:
                                value || null,
                        };
                    }

                    // -------------------------
                    // MEDIA ITEM
                    // -------------------------
                    return {
                        ...reel,

                        media:
                            Array.isArray(
                                reel.media
                            )
                                ? reel.media.map(
                                    media => {

                                        if (
                                            Number(
                                                media.id
                                            ) !==
                                            mediaId
                                        ) {
                                            return media;
                                        }

                                        return {
                                            ...media,
                                            user_reaction:
                                                value ||
                                                null,
                                        };
                                    }
                                )
                                : reel.media,
                    };
                })
                : userGroup.reels,
        }))
    );

    // -----------------------------------------
    // UPDATE MY REELS TOO
    // -----------------------------------------
    setMyReels(prev =>
        prev.map(reel => {

            if (
                Number(reel.id) !== reelId
            ) {
                return reel;
            }

            // CONTENT
            if (!mediaId) {
                return {
                    ...reel,
                    user_reaction:
                        value || null,
                };
            }

            // MEDIA
            return {
                ...reel,

                media:
                    Array.isArray(reel.media)
                        ? reel.media.map(media =>
                            Number(media.id) ===
                            mediaId
                                ? {
                                    ...media,
                                    user_reaction:
                                        value ||
                                        null,
                                }
                                : media
                        )
                        : reel.media,
            };
        })
    );

    // -----------------------------------------
    // SEND TO BACKEND
    // -----------------------------------------
    try {

        await api.post(
            `/api/reels/${reelId}/reaction`,
            {
                reaction: value,

                // null for text/content
                media_id: mediaId,
            }
        );

    } catch (error) {

        console.error(
            "REACTION ERROR:",
            error
        );

        // You can refetch here if needed
    }
};

   const onSendMessage = async () => {
    if (
        !message.trim() ||
        sending ||
        !currentItem
    ) {
        return;
    }

    try {
        setSending(true);

        // The post that owns the CURRENT item
        const postId = Number(
            currentItem.reelId
        );

        // Content has no post_media_id
        // Media has its own post_media_id
        const mediaId =
            currentItem.type === "content"
                ? null
                : Number(
                    currentItem.mediaId
                );

        await api.post(
            `/api/reels/${postId}/message`,
            {
                message: message.trim(),

                post_media_id: mediaId,
            }
        );

        setMessage("");

    } catch (error) {

        console.error(
            "MESSAGE ERROR:",
            error.response?.data || error
        );

    } finally {

        setSending(false);

    }
};


useEffect(() => {

    // Stop previous timer
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }

    setProgress(0);

    if (!currentItem) {
        setMediaReady(false);
        return;
    }

    if (isProgressPaused) {
        return;
    }

    // IMAGE must wait for loading
    if (currentItem.type === "image") {
        setMediaReady(false);
        return;
    }

    // CONTENT and VIDEO are immediately ready
    setMediaReady(true);

}, [
    currentItem?.id,
    currentItem?.type
]);



const getContentDuration = (text) => {

    if (!text) {
        return 5;
    }

    const length = text.trim().length;

    const seconds = Math.ceil(length / 15);

    return Math.min(
        Math.max(seconds, 5),
        30
    );
};

const currentItemDuration = useMemo(() => {

    if (!currentItem) {
        return 5;
    }

    if (currentItem.type === "content") {
        return getContentDuration(
            currentItem.content
        );
    }

    if (currentItem.type === "image") {
        return 30;
    }

    // Video is controlled by the <video>
    if (currentItem.type === "video") {
        return null;
    }

    return 5;

}, [currentItem]);


   useEffect(() => {

    // Clear previous timer
    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }

    if (!currentItem) {
        return;
    }

    // Video has its own progress
    if (currentItem.type === "video") {
        return;
    }

    // Wait until image is ready
    if (!mediaReady) {
        return;
    }

    const duration =
        currentItemDuration || 5;

    // Reset only when a NEW media item starts
    setProgress(0);

    elapsedBeforePauseRef.current = 0;
    timerStartRef.current = Date.now();

    timerRef.current = setInterval(() => {

        /*
        |--------------------------------------------------------------------------
        | PAUSE WHEN MESSAGE OR OPTIONS ARE OPEN
        |--------------------------------------------------------------------------
        */

        const shouldPause =
            messageRef.current.trim().length > 0 ||
            openRef.current === true;

        if (shouldPause) {

            // Save elapsed time only once
            if (timerStartRef.current) {

                elapsedBeforePauseRef.current +=
                    (
                        Date.now() -
                        timerStartRef.current
                    ) / 1000;

                timerStartRef.current = null;
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | RESUME
        |--------------------------------------------------------------------------
        */

        if (!timerStartRef.current) {
            timerStartRef.current = Date.now();
        }


        const elapsed =
            elapsedBeforePauseRef.current +
            (
                Date.now() -
                timerStartRef.current
            ) / 1000;


        const percent =
            Math.min(
                (elapsed / duration) * 100,
                100
            );


        setProgress(percent);


        /*
        |--------------------------------------------------------------------------
        | NEXT MEDIA
        |--------------------------------------------------------------------------
        */

        if (percent >= 100) {

            clearInterval(
                timerRef.current
            );

            timerRef.current = null;

            timerStartRef.current = null;

            handleNextMedia();
        }

    }, 50);


    return () => {

        if (timerRef.current) {

            clearInterval(
                timerRef.current
            );

            timerRef.current = null;
        }

        timerStartRef.current = null;
    };

}, [
    mediaIndex,
    currentItem?.id,
    currentItem?.type,
    currentItemDuration,
    mediaReady
]);
        
  useEffect(() => {
    if (!reel?.created_at) {
        setCreatedTime("");
        return;
    }

    const updateCreatedTime = () => {
        const created =
            new Date(reel.created_at).getTime();

        const now = Date.now();

        const difference = Math.max(
            0,
            now - created
        );

        const totalSeconds = Math.floor(
            difference / 1000
        );

        if (totalSeconds < 60) {
            setCreatedTime(
                `${totalSeconds}s`
            );
            return;
        }

        const totalMinutes = Math.floor(
            totalSeconds / 60
        );

        if (totalMinutes < 60) {
            setCreatedTime(
                `${totalMinutes}m`
            );
            return;
        }

        const totalHours = Math.floor(
            totalMinutes / 60
        );

        setCreatedTime(
            `${totalHours}h`
        );
    };

    updateCreatedTime();

    // Update every second so 59s -> 1m, etc.
    const interval = setInterval(
        updateCreatedTime,
        1000
    );

    return () => {
        clearInterval(interval);
    };

}, [reel?.created_at]);

    
       const markedViewedRef = useRef(new Set());

useEffect(() => {

    if (!currentItem) {
        return;
    }

    // =========================================
    // CONTENT
    // =========================================
    if (
        currentItem.type === "content"
    ) {

        const reelId =
            Number(currentItem.reelId);

        if (!reelId) {
            return;
        }

        const viewedKey =
            `reel-content-${reelId}`;

        if (
            markedViewedRef.current.has(
                viewedKey
            )
        ) {
            return;
        }

        markedViewedRef.current.add(
            viewedKey
        );

        markReelViewed?.(
            reelId,
            null
        );

        return;
    }

    // =========================================
    // IMAGE / VIDEO
    // =========================================
    const mediaId =
        Number(currentItem.mediaId);

    const reelId =
        Number(currentItem.reelId);

    if (!reelId || !mediaId) {
        return;
    }

    const viewedKey =
        `media-${mediaId}`;

    if (
        markedViewedRef.current.has(
            viewedKey
        )
    ) {
        return;
    }

    markedViewedRef.current.add(
        viewedKey
    );

    markReelViewed?.(
        reelId,
        mediaId
    );

}, [
    currentItem?.id,
    currentItem?.type,
    currentItem?.mediaId,
    currentItem?.reelId,
    markReelViewed
]);


   const getFirstUnviewedIndex = useCallback(() => {
    if (!reelItems.length) {
        return 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Find first item that has NOT been viewed
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | We check flattened reelItems, not only allUserReels.
    | This allows:
    |
    | content
    | image
    | video
    |
    | to each be treated as separate items.
    |
    */

    const index = reelItems.findIndex(item => {
        return item.has_viewed !== true;
    });

    return index >= 0 ? index : 0;

}, [reelItems]);


/*
|--------------------------------------------------------------------------
| INITIALIZE WHEN USER CHANGES
|--------------------------------------------------------------------------
*/

const previousUserIndexRef = useRef(null);

useEffect(() => {

    if (
        currentUserIndex == null ||
        !reelItems.length
    ) {
        return;
    }

    /*
    |--------------------------------------------------------------------------
    | Only initialize when the USER changes.
    |--------------------------------------------------------------------------
    */

    if (
        previousUserIndexRef.current ===
        currentUserIndex
    ) {
        return;
    }

    previousUserIndexRef.current =
        currentUserIndex;

    const startIndex =
        getFirstUnviewedIndex();

    setMediaIndex(startIndex);
    setProgress(0);

    /*
    |--------------------------------------------------------------------------
    | Reset video
    |--------------------------------------------------------------------------
    */

    if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }

}, [
    currentUserIndex,
    reelItems,
    getFirstUnviewedIndex,
    setMediaIndex,
    setProgress
]);

useEffect(() => {

    if (
        !reelItems.length ||
        currentUserIndex == null
    ) {
        return;
    }

    const startIndex =
        getFirstUnviewedIndex();

    setMediaIndex(startIndex);
    setProgress(0);

}, [
    currentUserIndex
]);

    const handlePreviousMedia = () => {

        if (mediaIndex > 0) {

            setProgress(0);

            setMediaIndex(
                mediaIndex - 1
            );

            return;
        }

        onPrevious?.();

    };

   const handleNextMedia = useCallback(() => {

    if (!reelItems.length) {
        onClose?.();
        return;
    }

    const nextIndex =
        mediaIndex + 1;

    if (
        nextIndex <
        reelItems.length
    ) {

        setProgress(0);

        setMediaIndex(
            nextIndex
        );

        return;
    }

    setProgress(100);

    const nextUserIndex =
        currentUserIndex + 1;

    if (
        nextUserIndex <
        (reelUsers?.length || 0)
    ) {

        setMediaIndex(0);

        setProgress(0);

        nextReel?.();

        return;
    }

    onClose?.();

}, [
    reelItems.length,
    mediaIndex,
    currentUserIndex,
    reelUsers?.length,
    nextReel,
    onClose,
    setMediaIndex,
    setProgress
]);


useEffect(() => {

    const video =
        videoRef.current;

    if (!video) {
        return;
    }

    if (message.trim()) {

        video.pause();

        return;
    }

    // Only resume if current item is video
    if (
        currentItem?.type === "video"
    ) {
        video.play().catch(() => {});
    }

}, [
    message,
    currentItem?.id,
    currentItem?.type
]);

    const handleVideoTimeUpdate = (e) => {

    const video = e.currentTarget;

    if (message.trim()) {
        return;
    }

    if (
        !video.duration ||
        !Number.isFinite(video.duration)
    ) {
        return;
    }
    

    const percent =
        (video.currentTime / video.duration) * 100;

    setProgress(
        Math.min(percent, 100)
    );
};

    const handleVideoEnded = async () => {

        setProgress(100);

        await handleNextMedia();
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[200]
                bg-black/95
                flex
                items-center
                justify-center
            "
        >

            <div
                className="
                    relative
                    w-full
                    h-full
                    sm:w-[430px]
                    sm:h-[90vh]
                    sm:rounded-2xl
                    overflow-hidden
                    bg-black
                "
            >


               <div
    className="
        absolute
        top-3
        left-3
        right-3
        z-50
        flex
        gap-1
    "
>
    {reelItems.map((item, index) => {

        let width = "0%";

        if (index < mediaIndex) {
            width = "100%";
        }

        if (index === mediaIndex) {
            width = `${progress}%`;
        }

        return (
            <div
                key={`${item.reelId}-${item.id}`}
                className="
                    flex-1
                    h-1
                    rounded-full
                    bg-white/30
                    overflow-hidden
                "
            >
                <div
                    className="
                        h-full
                        bg-white
                    "
                    style={{
                        width
                    }}
                />
            </div>
        );

    })}
</div>
                <div
                    className="
                        absolute
                        top-7
                        left-0
                        right-0
                        z-40
                        px-4
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        {/* USER INITIAL */}
                        <a
                            href={`/profile/${user.id}`}>
                        <div
                            className="
                                w-10
                                h-10
                                rounded-full
                                bg-blue-600
                                text-white
                                flex
                                items-center
                                justify-center
                                font-bold
                                border
                                border-white
                            "
                        >
                            {
                                user.initial
                            }
                        </div>

                        </a>


                        <div className="flex flex-col">

                        <a
                            href={`/profile/${user.id}`}
                            className="
                                text-white
                                font-semibold
                                hover:underline
                                leading-tight
                            "
                        >
                            {user.first_name}
                        </a>

                        <span
                            className="
                                text-white/70
                                text-[11px]
                                leading-tight
                            "
                        >
                            {createdTime}
                        </span>

                    </div>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                    
                        <ReelOptionPreview chats={chats} open={open} setOpen={setOpen}
                        showImagePicker={showImagePicker} post={selectedReel} currentItem={currentItem}
                        setShowImagePicker={setShowImagePicker}
                        messageOpenShare={messageOpenShare}
                        setMessageOpenShare={setMessageOpenShare}
                        openReport={openReport}
                        setOpenReport={setOpenReport}
                        shares={shares}
                        setShares={setShares}  />
                        {/* CLOSE */}

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="
                                w-9
                                h-9
                                rounded-full
                                bg-black/40
                                text-white
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <X
                                size={22}
                            />
                        </button>

                    </div>

                </div>



            {(
                mediaIndex > 0 ||
                currentUserIndex > 0
            ) && (
                <button
                    type="button"
                    onClick={handlePreviousMedia}
                    className="
                        absolute
                        left-2
                        top-1/2
                        -translate-y-1/2
                        z-10
                        w-10
                        h-10
                        rounded-full
                        bg-black/30
                        text-white
                        flex
                        items-center
                        justify-center
                        hover:bg-black/50
                        transition
                    "
                >
                    <ArrowLeft size={20} />
                </button>
            )}

               {mediaIndex < reelItems.length - 1 && (
                    <button
                        type="button"
                        onClick={handleNextMedia}
                        className="
                            absolute
                            right-2
                            top-1/2
                            -translate-y-1/2
                            z-10
                            w-10
                            h-10
                            rounded-full
                            bg-black/30
                            text-white
                            flex
                            items-center
                            justify-center
                            hover:bg-black/50
                            transition
                        "
                    >
                        <ArrowRight size={20} />
                    </button>
                )}
              
                <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-black
                    "
                >

                         {currentItem?.type === "image" && (
                            <img
                                key={`${currentItem.reelId}-${currentItem.id}`}
                                src={currentItem.url}
                                alt=""
                                onLoad={() => {
                                    setMediaReady(true);
                                }}
                                onError={() => {
                                    setMediaReady(true);
                                }}
                                className="
                                    w-full
                                    h-full
                                    object-contain
                                "
                            />
                        )}
                            {/* VIDEO */}
                            {currentItem?.type === "video" && (
                                <video
                                    key={`${reel.id}-${currentItem.id}`}
                                    ref={videoRef}
                                    src={currentItem.url}
                                    autoPlay
                                    muted
                                    playsInline
                                    controls={false}

                                    onLoadedMetadata={(e) => {
                                        const video =
                                            e.currentTarget;

                                        setProgress(0);

                                        video.currentTime = 0;

                                        video
                                            .play()
                                            .catch(error => {
                                                console.log(
                                                    "VIDEO AUTOPLAY ERROR:",
                                                    error
                                                );
                                            });
                                    }}

                                    onTimeUpdate={
                                        handleVideoTimeUpdate
                                    }

                                    onEnded={
                                        handleVideoEnded
                                    }

                                    className="
                                        w-full
                                        h-full
                                        object-contain
                                    "
                                />
                            )}


                            {/* TEXT ONLY */}
                           {currentItem?.type === "content" && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                    p-8
                                    text-white
                                    text-center
                                    bg-gradient-to-br
                                    from-blue-700
                                    to-purple-700
                                "
                            >
                                <p className="text-xl font-semibold">
                                    {currentItem.content}
                                </p>
                            </div>
                        )}

                </div>

                           {(currentItem?.type === "image" ||
                            currentItem?.type === "video") &&
                            currentItem?.description && (() => {

                                const description =
                                    typeof currentItem.description === "object"
                                        ? currentItem.description.content
                                        : currentItem.description;

                                if (!description) {
                                    return null;
                                }

                                const isLong =
                                    description.length > 80;

                                const displayedDescription =
                                    isLong && !showFullDescription
                                        ? description.slice(0, 80) + "..."
                                        : description;

                                return (
                                    <div
                                        className="
                                            absolute
                                            bottom-24
                                            left-4
                                            right-4
                                            z-30
                                            text-white
                                            text-sm
                                            drop-shadow-lg
                                        "
                                    >
                                        <p className="leading-relaxed">
                                            {displayedDescription}
                                        </p>

                                        {isLong && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowFullDescription(
                                                        !showFullDescription
                                                    )
                                                }
                                                className="
                                                    mt-1
                                                    font-semibold text-xs
                                                    text-green-400
                                                    hover:text-green-300
                                                "
                                            >
                                                {showFullDescription
                                                    ? "Read less"
                                                    : "Read more"}
                                            </button>
                                        )}
                                    </div>
                                );

                            })()}


                <div
                    className="
                        absolute
                        bottom-0
                        left-0
                        right-0
                        z-10
                        p-3
                        bg-gradient-to-t
                        from-black
                        via-black/80
                        to-transparent
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        {/* REACTION */}

                        <button
                                type="button"
                                onClick={() =>
                                    onReaction(
                                        currentReaction === "❤️"
                                            ? ""
                                            : "❤️"
                                    )
                                }
                                className={`
                                    shrink-0
                                    w-11
                                    h-11
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    border
                                    ${
                                        currentReaction
                                            ? "bg-green-500/30 border-green-400"
                                            : "bg-white/10 border-white/30"
                                    }
                                `}
                            >
                                <Heart
                                    size={20}
                                    fill={
                                        currentReaction
                                            ? "currentColor"
                                            : "none"
                                    }
                                    className={
                                        currentReaction
                                            ? "text-green-400"
                                            : "text-white"
                                    }
                                />
                            </button>
                        {/* INPUT */}

                        <div className="relative flex items-center gap-2 w-full flex-1">

                            {/* Emoji picker */}
                            {showEmojiPicker && (
                                <div
                                    className="
                                        absolute
                                        bottom-14
                                        left-0
                                        z-[100]
                                    "
                                >
                                    <EmojiPicker
                                        className="bg[var(--bg-color)] text[var(--text-color)]  
                                        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin "
                                        onEmojiClick={(emojiData) => {

                                            setMessage(
                                                prev =>
                                                    prev + emojiData.emoji
                                            );

                                        }}
                                        width={320}
                                        height={400}
                                        searchDisabled={false}
                                        skinTonesDisabled={false}
                                    />
                                </div>
                            )}

                            <div
                                className="
                                    flex
                                    flex-1
                                    items-center
                                    gap-2
                                    bg-white/10
                                    border
                                    border-white/30
                                    rounded-full
                                    px-3
                                    h-11
                                    w-full
                                "
                            >

                                {/* EMOJI BUTTON */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEmojiPicker(
                                            prev => !prev
                                        )
                                    }
                                    className="
                                        shrink-0
                                        text-xl
                                        text-white
                                        hover:scale-110
                                        transition
                                    "
                                    aria-label="Choose emoji"
                                >
                                    <Smile size={20} />
                                </button>


                                {/* MESSAGE INPUT */}
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) =>
                                        setMessage(
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) => {

                                        if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                        ) {
                                            e.preventDefault();

                                            if (
                                                message.trim() &&
                                                !sending
                                            ) {
                                                onSendMessage();

                                                // Close emoji picker
                                                setShowEmojiPicker(false);
                                            }
                                        }

                                    }}
                                    placeholder={`Message ${user.first_name}...`}
                                    className="
                                        flex-1
                                        bg-transparent
                                        outline-none
                                        text-white
                                        placeholder:text-gray-300
                                        text-sm w-full
                                    "
                                />


                                {/* SEND */}
                                <button
                                    type="button"
                                    disabled={
                                        !message.trim() ||
                                        sending
                                    }
                                    onClick={() => {

                                        onSendMessage();

                                        setShowEmojiPicker(false);

                                    }}
                                    className="
                                        shrink-0
                                        text-white
                                        disabled:opacity-30
                                        hover:scale-110
                                        transition
                                    "
                                >
                                    <Send size={18} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>


       
        </div>
        </div>
    );
}