import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    X,
    MoreVertical,
    Heart,
    Send,
    ArrowLeft,
    ArrowRight,
} from "lucide-react";
import api from "../../Api/axios";
export default function ReelViewerModal({
    user,
    reel,

    onClose,
    onPrevious,

    chats,

    message,
    setMessage,
    onSendMessage,

    sending,

    reaction,
    onReaction,

    currentUserIndex,
    reelUsers,
    currentUser,

    mediaIndex,
    setMediaIndex,

    progress,
    setProgress,

    nextReel,
    markReelViewed
}) {

    const videoRef = useRef(null);

    const [showReactionUsers, setShowReactionUsers] =
        useState(false);

    const [reactionUsers, setReactionUsers] =
        useState([]);

    const [loadingReactionUsers, setLoadingReactionUsers] =
        useState(false);

    const [createdTime, setCreatedTime] = useState("");

        const timerRef = useRef(null);
    
    const [mediaReady, setMediaReady] = useState(true);

    const [showFullDescription, setShowFullDescription] =
    useState(false);

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

            if (
                typeof reelItem.content === "string" &&
                reelItem.content.trim()
            ) {

                items.push({
                    type: "content",
                    id: `content-${reelItem.id}`,
                    content: reelItem.content,
                    reelId: reelItem.id,
                    created_at: reelItem.created_at,
                });
            }
            if (
                Array.isArray(reelItem.media)
            ) {

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

                            reelId:
                                reelItem.id,

                            created_at:
                                reelItem.created_at,
                        });

                    });
            }

        });

    return items;

}, [allUserReels]);

const currentItem =
    reelItems[mediaIndex] || null;


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

    if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
    }

    if (!currentItem) {
        return;
    }

    // VIDEO controls its own progress
    if (currentItem.type === "video") {
        return;
    }

    // IMAGE is not loaded yet
    if (!mediaReady) {
        return;
    }

    const duration =
        currentItemDuration || 5;

    const startedAt = Date.now();

    setProgress(0);

    timerRef.current = setInterval(() => {

        const elapsed =
            (Date.now() - startedAt) / 1000;

        const percent =
            Math.min(
                (elapsed / duration) * 100,
                100
            );

        setProgress(percent);

        if (percent >= 100) {

            clearInterval(
                timerRef.current
            );

            timerRef.current = null;

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

    const isReelOwner =
        Number(currentUser?.id) ===
        Number(reel?.user?.id);

    
       const markedViewedRef = useRef(new Set());

        useEffect(() => {
            if (!currentItem?.reelId) {
                return;
            }

            const reelId = Number(currentItem.reelId);

            if (!reelId) {
                return;
            }

            if (markedViewedRef.current.has(reelId)) {
                return;
            }

            markedViewedRef.current.add(reelId);

            // DON'T await this
            markReelViewed?.(reelId);

        }, [
            currentItem?.reelId,
            markReelViewed
        ]);


    const fetchReactionUsers = async () => {

        if (!reel?.id) {
            return;
        }

        try {

            setLoadingReactionUsers(true);

            const response = await api.get(
                `/api/reels/${reel.id}/reactions`
            );

            setReactionUsers(
                response.data.users || []
            );

            setShowReactionUsers(true);

        } catch (error) {

            console.error(
                "REACTION USERS ERROR:",
                error
            );

        } finally {

            setLoadingReactionUsers(false);

        }
    };

   const getFirstUnviewedIndex = useCallback(() => {

    if (!allUserReels.length || !reelItems.length) {
        return 0;
    }

    const firstUnviewedReel =
        allUserReels.find(
            reelItem =>
                reelItem.has_viewed !== true
        );


    if (firstUnviewedReel) {

        const index =
            reelItems.findIndex(
                item =>
                    Number(item.reelId) ===
                    Number(firstUnviewedReel.id)
            );

        return index >= 0
            ? index
            : 0;
    }

    return 0;

}, [
    allUserReels,
    reelItems
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

    const nextIndex = mediaIndex + 1;

    if (nextIndex < reelItems.length) {

        setProgress(0);

        setMediaIndex(nextIndex);

        return;
    }
    setProgress(100);

    // Check if there is another user
    const hasNextUser =
        currentUserIndex <
        (reelUsers?.length || 0) - 1;

    if (hasNextUser) {

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


    const handleVideoTimeUpdate = (e) => {

    const video = e.currentTarget;

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
                        z-40
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
                            z-40
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

                {/* =================================================
                    BOTTOM CHAT BAR
                ================================================== */}

                <div
                    className="
                        absolute
                        bottom-0
                        left-0
                        right-0
                        z-50
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

                        {!isReelOwner && (
                        <button
                            type="button"
                            onClick={() =>
                                onReaction(
                                    reaction === "❤️"
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
                                    reaction
                                        ? "bg-green-500/30 border-red-400"
                                        : "bg-white/10 border-white/30"
                                }
                            `}
                        >
                            <Heart
                                size={20}
                                fill={
                                    reaction
                                        ? "currentColor"
                                        : "none"
                                }
                                className={
                                    reaction
                                        ? "text-green-400"
                                        : "text-white"
                                }
                            />
                        </button>
                    )}


                    {Number(reel?.reactions_count || 0) > 0 && (
                    <button
                        type="button"
                        onClick={fetchReactionUsers}
                        className="
                            shrink-0
                            flex
                            items-center
                            gap-1
                            px-2
                            h-9
                            rounded-full
                            bg-black/40
                            border
                            border-white/20
                            text-white
                            hover:bg-black/60
                            transition
                        "
                    >
                        <Heart
                            size={17}
                            fill="currentColor"
                            className="text-red-400"
                        />

                        <span className="text-sm">
                            {reel.reactions_count}
                        </span>
                    </button>
                )}

                        {/* INPUT */}

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
                                px-4
                                h-11
                            "
                        >

                            <input
                                type="text"
                                value={
                                    message
                                }
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {

                                    if (
                                        e.key ===
                                        "Enter"
                                    ) {
                                        onSendMessage();
                                    }

                                }}
                                placeholder={`Message ${user.first_name}...`}
                                className="
                                    flex-1
                                    min-w-0
                                    bg-transparent
                                    outline-none
                                    text-white
                                    placeholder:text-gray-300
                                    text-sm
                                "
                            />


                            <button
                                type="button"
                                disabled={
                                    !message.trim() ||
                                    sending
                                }
                                onClick={
                                    onSendMessage
                                }
                                className="
                                    shrink-0
                                    text-white
                                    disabled:opacity-30
                                "
                            >
                                <Send
                                    size={18}
                                />
                            </button>

                        </div>

                    </div>

                </div>


        {showReactionUsers && (
    <div
        className="
            fixed
            inset-0
            z-[100]
            bg-black/70
            flex
            items-center
            justify-center
            p-4
        "
        onClick={() =>
            setShowReactionUsers(false)
        }
    >

        <div
            className="
                w-full
                max-w-md
                max-h-[80vh]
                bg-[var(--bg-color)]
                rounded-2xl
                shadow-2xl
                overflow-hidden
                border
                border-white/10
            "
            onClick={(e) =>
                e.stopPropagation()
            }
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-5
                    py-4
                    border-b
                    border-white/10
                "
            >

                <div className="flex items-center gap-2">

                    <Heart
                        size={20}
                        fill="currentColor"
                        className="text-red-400"
                    />

                    <h3
                        className="
                            text-lg
                            font-semibold
                        "
                    >
                        Reactions
                    </h3>

                </div>

                <button
                    type="button"
                    onClick={() =>
                        setShowReactionUsers(false)
                    }
                    className="
                        w-8
                        h-8
                        rounded-full
                        flex
                        items-center
                        justify-center
                        bg-white/10
                        hover:bg-white/20
                    "
                >
                    ×
                </button>

            </div>


            {/* USERS */}

            <div
                className="
                    max-h-[60vh]
                    overflow-y-auto
                    overscroll-contain
                    px-4
                    py-3
                "
            >

                {loadingReactionUsers ? (

                    <div
                        className="
                            py-10
                            text-center
                            text-gray-400
                        "
                    >
                        Loading reactions
                    </div>

                ) : reactionUsers.length === 0 ? (

                    <div
                        className="
                            py-10
                            text-center
                            text-gray-400
                        "
                    >
                        No reactions yet.
                    </div>

                ) : (

                    <div className="space-y-2">

                        {reactionUsers.map(
                            (reactedUser) => (

                                <div
                                    key={
                                        reactedUser.id
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        px-3
                                        py-2
                                        rounded-xl
                                        hover:bg-white/5
                                    "
                                >

                                    {/* AVATAR */}

                                    {reactedUser.profile_photo ? (

                                        <img
                                            src={
                                                reactedUser.profile_photo
                                            }
                                            alt=""
                                            className="
                                                w-10
                                                h-10
                                                rounded-full
                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <div
                                            className="
                                                w-10
                                                h-10
                                                rounded-full
                                                bg-white/10
                                                flex
                                                items-center
                                                justify-center
                                                font-semibold
                                            "
                                        >
                                            {(
                                                reactedUser.first_name ||
                                                "U"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                    )}


                                    {/* NAME */}

                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                font-medium
                                                truncate
                                            "
                                        >
                                            {
                                                reactedUser.first_name
                                            }{" "}
                                            {
                                                reactedUser.last_name
                                            }
                                        </p>

                                    </div>


                                    {/* REACTION */}

                                    <span
                                        className="
                                            text-xl
                                        "
                                    >
                                        ❤️
                                    </span>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    </div>
)}
        </div>
        </div>
    );
}