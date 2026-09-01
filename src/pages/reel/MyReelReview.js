import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    X,
    ArrowLeft,
    ArrowRight,
    Eye,
    Heart,
} from "lucide-react";

import api from "../../Api/axios"; // change to your api path
import MyReelOptionPreview from "./MyReelOptionPreview";


export default function MyReelReview({
    myReels = [],
    selectedMyIndex,
    onPrevious,
    nextReel,
    myProgress,
    setMyProgress,
    onClose,

    reactionUsers = [],
    setReactionUsers,
    currentUser,
    myMediaIndex,
    setMyMediaIndex,
    chats,
    selectedReel,
    setReaction, open, setOpen, shares, setShares, showImagePicker,
    setShowImagePicker, messageOpenShare, setMessageOpenShare, openReport, setOpenReport, onReelDeleted
}) {
    const videoRef = useRef(null);

    const [createdTime, setCreatedTime] =
        useState("");

    const [showReactionUsers, setShowReactionUsers] =
        useState(false);

    const [loadingReactionUsers, setLoadingReactionUsers] =
        useState(false);

    const [viewUsers, setViewUsers] =
        useState([]);

    const [showViewUsers, setShowViewUsers] =
        useState(false);

    const [loadingViewUsers, setLoadingViewUsers] =
        useState(false);


    const [showFullDescription, setShowFullDescription] =
    useState(false);

    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    

    const timerRef = useRef(null);

    const [mediaReady, setMediaReady] = useState(true);
    const mediaLoadRef = useRef(null);
    
   const reel = myReels?.[selectedMyIndex] || null;

    const openRef = useRef(false);
    const reactionRef = useRef(false);
    const viewRef = useRef(false);

   
       const timerStartRef = useRef(null);
       const elapsedBeforePauseRef = useRef(0);
   
       useEffect(() => {
       openRef.current = open;
       }, [open]);

     const isProgressPaused = open
        useEffect(() => {
       reactionRef.current = showReactionUsers;
       }, [showReactionUsers]);

        useEffect(() => {
       viewRef.current = showViewUsers;
       }, [showViewUsers]);


const allUserReels = useMemo(() => {
    if (!Array.isArray(myReels)) {
        return [];
    }

    if (
        Array.isArray(
            myReels?.[selectedMyIndex]?.reels
        )
    ) {
        return myReels[selectedMyIndex].reels;
    }

    return myReels;
}, [
    myReels,
    selectedMyIndex
]);

const reelItems = useMemo(() => {
    const items = [];

    if (!Array.isArray(allUserReels)) {
        return items;
    }

    allUserReels
        .slice()
        .sort(
            (a, b) =>
                new Date(a.created_at || 0) -
                new Date(b.created_at || 0)
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
                    background_color:
                        reelItem.background_color,
                    font:
                        reelItem.font,
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

                        const mediaType =
                            mediaItem.type ||
                            mediaItem.media_type ||
                            (
                                mediaItem.mime_type
                                    ?.startsWith("video/")
                                    ? "video"
                                    : "image"
                            );

                        items.push({
                            ...mediaItem,

                            type: mediaType,

                            reelId:
                                reelItem.id,

                            created_at:
                                reelItem.created_at,

                            url:
                                mediaItem.url ||
                                mediaItem.path ||
                                mediaItem.media_url,
                        });
                    });
            }

            
            if (
                reelItem.video &&
                !Array.isArray(reelItem.media)
            ) {
                items.push({
                    type: "video",
                    id: `video-${reelItem.id}`,
                    reelId: reelItem.id,
                    url:
                        typeof reelItem.video === "string"
                            ? reelItem.video
                            : reelItem.video.url,
                    created_at:
                        reelItem.created_at,
                });
            }
        });

    return items;
}, [allUserReels]);
    
const isGroupedReels = useMemo(() => {

    return (
        Array.isArray(myReels) &&
        myReels.some(
            item => Array.isArray(item?.reels)
        )
    );

}, [myReels]);

    const currentItem =
        reelItems[myMediaIndex] || null;

    
    
    useEffect(() => {

            // Stop previous timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Cancel previous image preload
            if (mediaLoadRef.current) {
                mediaLoadRef.current.onload = null;
                mediaLoadRef.current.onerror = null;
                mediaLoadRef.current = null;
            }

            setMyProgress(0);

            if (isUsersModalOpen) {
                setMediaReady(false);
                return;
            }

            if (!currentItem) {
                setMediaReady(false);
                return;
            }

            // -----------------------------------------
            // CONTENT
            // -----------------------------------------

            if (currentItem.type === "content") {
                setMediaReady(true);
                return;
            }

            // -----------------------------------------
            // VIDEO
            // -----------------------------------------

            if (currentItem.type === "video") {
                setMediaReady(true);
                return;
            }

            // -----------------------------------------
            // IMAGE
            // -----------------------------------------

            if (currentItem.type === "image") {

                setMediaReady(false);

                const image = new Image();

                mediaLoadRef.current = image;

                image.onload = () => {

                    // Make sure this is still the
                    // currently selected image
                    if (
                        mediaLoadRef.current === image
                    ) {
                        setMediaReady(true);
                    }
                };

                image.onerror = () => {

                    // Even if image fails,
                    // don't allow progress to get stuck
                    if (
                        mediaLoadRef.current === image
                    ) {
                        setMediaReady(true);
                    }
                };

                image.src = currentItem.url;

                // IMPORTANT:
                // Cached image may already be complete
                if (image.complete) {

                    if (image.naturalWidth > 0) {
                        setMediaReady(true);
                    } else {
                        setMediaReady(true);
                    }
                }

                return;
            }

            setMediaReady(true);

            return () => {

                if (mediaLoadRef.current) {
                    mediaLoadRef.current.onload = null;
                    mediaLoadRef.current.onerror = null;
                    mediaLoadRef.current = null;
                }

            };

        }, [
            currentItem?.id,
            currentItem?.type,
            currentItem?.url,
            myMediaIndex,
            isUsersModalOpen
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

            if (isUsersModalOpen) {
                return;
            }
        
            if (isProgressPaused) {
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
            setMyProgress(0);
        
            elapsedBeforePauseRef.current = 0;
            timerStartRef.current = Date.now();
        
            timerRef.current = setInterval(() => {
        
                const shouldPause =
                    reactionRef.current === true ||
                    viewRef.current === true || 
                    openRef.current === true;
        
                if (shouldPause) {
        
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
        
        
                setMyProgress(percent);
        
        
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
            myMediaIndex,
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
    
    
        const handlePreviousReel = () => {
    
            if (myMediaIndex > 0) {
    
                setMyProgress(0);
    
                setMyMediaIndex(
                    myMediaIndex - 1
                );
    
                return;
            }
    
            onPrevious?.();
    
        };
    
      const handleNextMedia = useCallback(() => {

            if (isUsersModalOpen) {
                return;
            }

            if (!reelItems.length) {
                onClose?.();
                return;
            }

            const nextIndex = myMediaIndex + 1;

            if (nextIndex < reelItems.length) {

                setMyProgress(0);

                setMyMediaIndex(nextIndex);

                return;
            }

            if (!isGroupedReels) {

                setMyProgress(100);

                onClose?.();

                return;
            }

            const hasNextUser =
                selectedMyIndex <
                myReels.length - 1;

            if (hasNextUser) {

                setMyProgress(0);

                setMyMediaIndex(0);

                nextReel?.();

                return;
            }

            setMyProgress(100);

            onClose?.();

        }, [
            isUsersModalOpen,
            reelItems.length,
            myMediaIndex,
            isGroupedReels,
            selectedMyIndex,
            myReels.length,
            nextReel,
            onClose,
            setMyMediaIndex,
            setMyProgress
        ]);
    
    
        const handleVideoTimeUpdate = (e) => {

            if (isUsersModalOpen) {
                return;
            }
    
        const video = e.currentTarget;
    
        if (
            !video.duration ||
            !Number.isFinite(video.duration)
        ) {
            return;
        }
    
        const percent =
            (video.currentTime / video.duration) * 100;
    
        setMyProgress(
            Math.min(percent, 100)
        );
    };
    
        const handleVideoEnded = async () => {
    
            setMyProgress(100);
    
            await handleNextMedia();
        };

    useEffect(() => {

        if (!reel?.created_at) {

            setCreatedTime("");

            return;
        }

        const updateCreatedTime = () => {

            const created =
                new Date(
                    reel.created_at
                ).getTime();


            const difference =
                Math.max(
                    0,
                    Date.now() - created
                );


            const totalSeconds =
                Math.floor(
                    difference / 1000
                );


            if (
                totalSeconds < 60
            ) {

                setCreatedTime(
                    `${totalSeconds}s`
                );

                return;
            }


            const totalMinutes =
                Math.floor(
                    totalSeconds / 60
                );


            if (
                totalMinutes < 60
            ) {

                setCreatedTime(
                    `${totalMinutes}m`
                );

                return;
            }


            const totalHours =
                Math.floor(
                    totalMinutes / 60
                );


            setCreatedTime(
                `${totalHours}h`
            );

        };


        updateCreatedTime();


        const interval =
            setInterval(
                updateCreatedTime,
                1000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, [
        reel?.created_at
    ]);


    useEffect(() => {
    setReaction(selectedReel?.user_reaction || "");
    }, [selectedReel?.id]);

    const fetchReactionUsers = async () => {
    if (!reel?.id) {
        return;
    }

    // Open immediately so loading is visible
    setIsUsersModalOpen(true);
    setShowReactionUsers(true);
    setLoadingReactionUsers(true);

    // Stop video
    if (videoRef.current) {
        videoRef.current.pause();
    }

    try {
        const response = await api.get(
            `/api/reels/${reel.id}/reactions`
        );

        setReactionUsers?.(
            response.data?.users || []
        );

    } catch (error) {
        console.error(
            "REACTION USERS ERROR:",
            error
        );
    } finally {
        setLoadingReactionUsers(false);
    }
};


const fetchViewUsers = async () => {
    if (!reel?.id) {
        return;
    }

    // Open immediately so loading is visible
    setIsUsersModalOpen(true);
    setShowViewUsers(true);
    setLoadingViewUsers(true);

    // Stop video
    if (videoRef.current) {
        videoRef.current.pause();
    }

    try {
        const response = await api.get(
            `/api/reels/${reel.id}/views`
        );

        setViewUsers(
            response.data?.users || []
        );

    } catch (error) {
        console.error(
            "VIEW USERS ERROR:",
            error
        );
    } finally {
        setLoadingViewUsers(false);
    }
};


    if (!reel) {
        return null;
    }



    return (
        <div
            className="
                fixed
                inset-0
                z-[300]
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

                        if (index < myMediaIndex) {
                            width = "100%";
                        }

                        if (index === myMediaIndex) {
                            width = `${myProgress}%`;
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
                        z-[90]
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
                            {reel.user?.initial ||
                                currentUser?.initial ||
                                "?"}
                        </div>


                        <div
                            className="
                                flex
                                flex-col
                            "
                        >

                            <span
                                className="
                                    text-white
                                    font-semibold
                                "
                            >
                                {
                                    reel.user
                                        ?.first_name ||
                                    currentUser
                                        ?.first_name ||
                                    "You"
                                }
                            </span>


                            <span
                                className="
                                    text-white/70
                                    text-[11px]
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

                       <MyReelOptionPreview post={reel} currentItem={currentItem}
                       chats={chats} open={open} setOpen={setOpen}
                       showImagePicker={showImagePicker}
                        setShowImagePicker={setShowImagePicker}
                        messageOpenShare={messageOpenShare}
                        setMessageOpenShare={setMessageOpenShare}
                        openReport={openReport}
                        setOpenReport={setOpenReport}
                        shares={shares} onClose={onClose}
                        setShares={setShares} onReelDeleted={onReelDeleted} />

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
                            <X size={22} />
                        </button>

                    </div>

                </div>

                     {(
                myMediaIndex > 0 ||
                selectedMyIndex > 0
            ) && (
                    <button
                        type="button"
                        onClick={
                            handlePreviousReel
                        }
                        className="
                            absolute
                            left-2
                            top-1/2
                            -translate-y-1/2
                            z-[80]
                            w-10
                            h-10
                            rounded-full
                            bg-black/30
                            text-white
                            flex
                            items-center
                            justify-center
                            hover:bg-black/50
                        "
                    >
                        <ArrowLeft
                            size={20}
                        />
                    </button>
                )}

                {(
                    myMediaIndex < reelItems.length - 1 ||
                    selectedMyIndex < myReels.length - 1
                ) && (
                    <button
                        type="button"
                        onClick={
                           handleNextMedia
                        }
                        className="
                            absolute
                            right-2
                            top-1/2
                            -translate-y-1/2
                            z-[80]
                            w-10
                            h-10
                            rounded-full
                            bg-black/30
                            text-white
                            flex
                            items-center
                            justify-center
                            hover:bg-black/50
                        "
                    >
                        <ArrowRight
                            size={20}
                        />
                    </button>
                )}

                <div
                    className="
                        absolute
                        inset-0
                        bg-black
                        flex
                        items-center
                        justify-center
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
                                // Don't leave the progress stuck forever
                                setMediaReady(true);
                            }}
                            className="
                                w-full
                                h-full
                                object-contain
                            "
                        />
                    )}

                    {currentItem?.type ===
                        "video" && (
                        <video
                            key={
                                `${reel.id}-${currentItem?.id}`
                            }
                            ref={
                                videoRef
                            }
                            src={
                                currentItem?.url
                            }
                            autoPlay
                            muted
                            playsInline
                            controls={false}
                            onLoadedMetadata={(e) => {
                                const video =
                                    e.currentTarget;

                                setMyProgress(0);

                                video.currentTime = 0;

                                 if (isUsersModalOpen) {
                                        return;
                                    }

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


                   {currentItem?.type === "content" && (
                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                p-2
                                text-white
                                text-center
                                bg-gradient-to-br
                                from-blue-700
                                to-purple-700
                                min-w-0
                                whitespace-pre-wrap
                                break-words
                                [overflow-wrap:anywhere]
                            "
                        >
                            <p className="text-xl font-semibold 
                            min-w-0
                            whitespace-pre-wrap
                            break-words
                            [overflow-wrap:anywhere]">
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
                                            font-semibold
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
                        bottom-5
                        left-4
                        right-4
                        z-[10]
                        flex
                        items-center
                        justify-end
                        gap-3
                    "
                >

                    <button
                        type="button"
                        onClick={fetchReactionUsers}
                        className={`
                            w-10
                            h-10
                            rounded-full
                            text-white
                            flex
                            items-center
                            justify-center
                            backdrop-blur-sm
                            relative
                            transition-colors
                            ${
                                reel?.reactions_count  
                                    ? "bg-green-500"
                                    : "bg-black/50"
                            }
                        `}
                    >
                        <Heart
                            size={21}
                            fill={
                                reel?.reactions_count  
                                    ? "currentColor"
                                    : "none"
                            }
                        />

                        <span className="text-sm absolute right-2 top-2">
                            {reel?.reactions_count || 0}
                        </span>
                    </button>

                    {/* VIEW USERS */}

                    <button
                        type="button"
                        onClick={fetchViewUsers}
                        className="
                            flex
                            items-center
                            gap-2
                            px-3
                            h-10
                            rounded-full
                            bg-black/50
                            text-white
                            backdrop-blur-sm
                        "
                    >

                        <Eye
                            size={21}
                        />

                        <span
                            className="
                                text-sm
                            "
                        >
                            {reel.views_count ||
                                0}
                        </span>

                    </button>

                </div>


              

                {showReactionUsers && (
                    <div
                        className="
                            absolute
                            inset-0
                            z-[200]
                            bg-black/70
                            flex
                            items-end
                            justify-center
                        "
                    >

                        <div
                            className="
                                w-full
                                bg-[var(--bg-color)]
                                rounded-t-2xl
                                p-4
                                max-h-[60%]
                                overflow-y-auto
                                scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                    "
                                >
                                    Reactions
                                </h3>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowReactionUsers(
                                            false
                                        )
                                    }
                                >
                                    <X />
                                </button>

                            </div>


                            {loadingReactionUsers ? (
                                <div
                                    className="
                                        py-8
                                        text-center
                                    "
                                >
                                    Loading Reaction
                                </div>
                            ) : reactionUsers.length ===
                              0 ? (
                                <div
                                    className="
                                        py-8
                                        text-center
                                        text-gray-500
                                    "
                                >
                                    No reactions yet
                                </div>
                            ) : (
                                reactionUsers.map(
                                    user => (
                                        <div
                                            key={
                                                user.id
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                py-2
                                            "
                                        >

                                            <div
                                                className="
                                                    w-9
                                                    h-9
                                                    rounded-full
                                                    bg-blue-600
                                                    text-white
                                                    flex
                                                    items-center
                                                    justify-center
                                                    font-bold
                                                "
                                            >
                                                {
                                                    user.initial ||
                                                    user.first_name
                                                        ?.charAt(
                                                            0
                                                        )
                                                }
                                            </div>

                                            <span>
                                                {
                                                    user.first_name
                                                }
                                            </span>

                                        </div>
                                    )
                                )
                            )}

                        </div>

                    </div>
                )}


                {/* =================================================
                    VIEW USERS MODAL
                ================================================= */}

                {showViewUsers && (
                    <div
                        className="
                            absolute
                            inset-0
                            z-[200]
                            bg-black/70
                            flex
                            items-end
                            justify-center
                        "
                    >

                        <div
                            className="
                                w-full
                                bg-[var(--bg-color)]
                                rounded-t-2xl
                                p-4
                                max-h-[60%]
                                overflow-y-auto
                                scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-4
                                "
                            >

                                <h3
                                    className="
                                        font-semibold
                                    "
                                >
                                    Viewed by
                                </h3>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowViewUsers(
                                            false
                                        )
                                    }
                                >
                                    <X />
                                </button>

                            </div>


                            {loadingViewUsers ? (
                                <div
                                    className="
                                        py-8
                                        text-center
                                    "
                                >
                                    Loading Viewed Reel
                                </div>
                            ) : viewUsers.length ===
                              0 ? (
                                <div
                                    className="
                                        py-8
                                        text-center
                                        text-gray-500
                                    "
                                >
                                    No views yet
                                </div>
                            ) : (

                                <div
                                    className="
                                        flex
                                        gap-4
                                        overflow-x-auto
                                        pb-3
                                    "
                                >

                                    {viewUsers.map(
                                        user => (
                                            <div
                                                key={
                                                    user.id
                                                }
                                                className="
                                                    shrink-0
                                                    flex
                                                    flex-col
                                                    items-center
                                                    gap-1
                                                "
                                            >

                                                <div
                                                    className="
                                                        w-12
                                                        h-12
                                                        rounded-full
                                                        bg-blue-600
                                                        text-white
                                                        flex
                                                        items-center
                                                        justify-center
                                                        font-bold
                                                        border-2
                                                        border-white
                                                    "
                                                >
                                                    {
                                                        user.initial ||
                                                        user.first_name
                                                            ?.charAt(
                                                                0
                                                            )
                                                    }
                                                </div>

                                                <span
                                                    className="
                                                        text-xs
                                                        max-w-16
                                                        truncate
                                                    "
                                                >
                                                    {
                                                        user.first_name
                                                    }
                                                </span>

                                            </div>
                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}