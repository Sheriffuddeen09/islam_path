



import React, { useMemo, useState } from "react";
import {
    ArrowLeft,
    Eye,
    Heart,
    Lock,
} from "lucide-react";
import ReelOptions from "./ReelOption";

export default function MyReelModal({
    myReels, setReactionUsers, setMyMediaIndex, currentUser, setMyProgress,
    onClose, setSelectedMyIndex, setShowMyReelReview, chats, onReelDeleted, shares, setShares, showImagePicker,
    setShowImagePicker, messageOpenShare, setMessageOpenShare, openReport, setOpenReport
}) {


    
    const [openOptionId, setOpenOptionId] = useState(null);

    const reelItems = useMemo(() => {

    const items = [];

    (myReels || [])
        .slice()
        .sort(
            (a, b) =>
                new Date(a.created_at) -
                new Date(b.created_at)
        )
        .forEach((reel) => {

            /*
            |--------------------------------------------------------------------------
            | STANDALONE TEXT CONTENT
            |--------------------------------------------------------------------------
            */

            if (
                typeof reel.content === "string" &&
                reel.content.trim()
            ) {

                items.push({

                    id:
                        `content-${reel.id}`,

                    listId:
                        `content-${reel.id}`,

                    type:
                        "content",

                    reelId:
                        Number(reel.id),

                    mediaId:
                        null,

                    content:
                        reel.content,

                    description:
                        null,

                    url:
                        null,

                    created_at:
                        reel.created_at,

                    user_reaction:
                        reel.user_reaction ?? null,

                    has_viewed:
                        Boolean(reel.has_viewed),

                    views_count:
                        reel.views_count ?? 0,

                    user:
                        reel.user,

                    reel,
                });
            }


            /*
            |--------------------------------------------------------------------------
            | MEDIA
            |--------------------------------------------------------------------------
            */

            if (
                Array.isArray(reel.media)
            ) {

                reel.media
                    .slice()
                    .sort(
                        (a, b) =>
                            Number(a.order || 0) -
                            Number(b.order || 0)
                    )
                    .forEach(
                        (media) => {

                            items.push({

                                id:
                                    `media-${reel.id}-${media.id}`,

                                listId:
                                    `media-${reel.id}-${media.id}`,

                                type:
                                    media.type,

                                reelId:
                                    Number(reel.id),

                                mediaId:
                                    Number(media.id),

                                url:
                                    media.url,

                                path:
                                    media.path,

                                description:
                                    media.description ?? null,

                                content:
                                    null,

                                created_at:
                                    reel.created_at,

                                user_reaction:
                                    media.user_reaction ??
                                    null,

                                has_viewed:
                                    Boolean(
                                        media.has_viewed
                                    ),

                                views_count:
                                    media.views_count ??
                                    0,

                                user:
                                    reel.user,

                                reel,
                            });
                        }
                    );
            }

        });

    return items;

}, [myReels]);

const openMyReels = (itemIndex) => {
    const item = reelItems[itemIndex];

    if (!item) {
        return;
    }

    const reelIndex = myReels.findIndex(
        reel => Number(reel.id) === Number(item.reelId)
    );

    if (reelIndex === -1) {
        return;
    }

    setSelectedMyIndex(reelIndex);

    // This is the FLATTENED item index
    setMyMediaIndex(itemIndex);

    setMyProgress(0);

    setShowMyReelReview(true);

    setReactionUsers(false);
};

    const formatCreatedTime = (date) => {

        if (!date) {
            return "";
        }

        const created =
            new Date(date);

        const now =
            new Date();

        const difference =
            Math.max(
                0,
                now.getTime() -
                    created.getTime()
            );

        const totalSeconds =
            Math.floor(
                difference / 1000
            );

        if (totalSeconds < 60) {
            return `${totalSeconds}s`;
        }

        const totalMinutes =
            Math.floor(
                totalSeconds / 60
            );

        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        }

        const totalHours =
            Math.floor(
                totalMinutes / 60
            );

        if (totalHours < 24) {
            return `${totalHours}h`;
        }

        const totalDays =
            Math.floor(
                totalHours / 24
            );

        if (totalDays === 1) {
            return "Yesterday";
        }

        if (totalDays < 7) {
            return `${totalDays}d`;
        }

        return created.toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
            }
        );
    };


    return (
        <div
            className="
                fixed
                inset-0
                z-[250]
                bg-black
                flex
                flex-col
            "
        >
            <div
                className="
                    h-16
                    shrink-0
                    border-b
                    border-gray-800
                    flex
                    items-center
                    px-4
                    gap-4
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                "
            >

                <button
                    type="button"
                    onClick={onClose}
                    className="
                        w-10
                        h-10
                        rounded-full
                        flex
                        items-center
                        justify-center
                        hover:bg-white/10
                    "
                >
                    <ArrowLeft size={24} />
                </button>


                <div className="flex-1 bg-[var(--bg-color)]
                    text-[var(--text-color)]">
                    <h2
                        className="
                            font-semibold
                            text-lg
                        "
                    >
                        My status
                    </h2>
                    <p
                        className="
                            text-xs
                        "
                    >
                        {myReels.length}{" "}
                        {myReels.length === 1
                            ? "status"
                            : "statuses"}
                    </p>
                </div>

              
            </div>

            <div
                className="
                    flex-1
                    overflow-y-auto bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                "
            >

                {reelItems.length === 0 ? (

                    <div
                        className="
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            px-3 bg-[var(--bg-color)]
                            text-[var(--text-color)]
                        "
                    >

                        <div
                            className="
                                w-20
                                h-20
                                rounded-full
                                flex
                                items-center
                                justify-center
                                mb-4
                            "
                        >

                            <span
                                className="
                                    text-2xl
                                    font-bold
                                "
                            >
                                {currentUser?.initial}
                            </span>

                        </div>

                        <p
                            className="
                                font-semibold
                            "
                        >
                            No status updates
                        </p>

                        <p
                            className="
                                text-sm
                                mt-1
                            "
                        >
                            Your status updates will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="max-w-2xl mx-auto bg-[var(--bg-color)]
                    text-[var(--text-color)]">
    {reelItems.map((item, index) => {

    const optionId =
        `${item.type}-${item.reelId}-${item.mediaId ?? "content"}`;

    return (
        <div
            key={optionId}
            className="
                w-full
                flex
                items-center
                gap-2
                px-3
                py-2
                border-b
                border-green-800
                text-left
                hover:bg-white/5
                transition
            "
        >

            {/* CLICKABLE STATUS AREA */}
            <div
                className="
                    flex
                    items-center
                    gap-2
                    flex-1
                    min-w-0
                    cursor-pointer
                "
                onClick={() => openMyReels(index)}
            >

                {/* PREVIEW */}
                <div
                    className="
                        relative
                        shrink-0
                        w-10
                        h-10
                        rounded-full
                        overflow-hidden
                        bg-gray-800
                    "
                >

                    {item.type === "image" && item.url && (
                        <img
                            src={item.url}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    )}

                    {item.type === "video" && item.url && (
                        <video
                            src={item.url}
                            muted
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                        />
                    )}

                    {item.type === "content" && (
                        <div
                            className="
                                w-full
                                h-full
                                bg-gradient-to-br
                                from-blue-700
                                to-purple-700
                                p-1
                                flex
                                items-center
                                justify-center
                                text-center
                                text-white
                                text-[9px]
                                leading-tight
                            "
                        >
                            <span className="line-clamp-4">
                                {item.content}
                            </span>
                        </div>
                    )}

                </div>

                {/* TEXT */}
                <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2">

                        {item.user_reaction && (
                            <Heart
                                size={17}
                                fill="currentColor"
                                className="text-green-500"
                            />
                        )}

                    </div>

                    <div className="flex items-center gap-2 mt-1 text-sm">

                        <span>
                            {formatCreatedTime(item.created_at)}
                        </span>

                        <span>•</span>

                        <Eye size={15} />

                        <span>
                            {item.views_count || 0}
                        </span>

                    </div>

                    {item.type === "content" &&
                        item.content?.trim() && (
                            <p className="mt-1 text-xs truncate">
                                {item.content}
                            </p>
                        )}

                    {item.type !== "content" &&
                        item.description?.content && (
                            <p className="mt-1 text-xs truncate">
                                {item.description.content}
                            </p>
                        )}

                </div>

            </div>


            <div
                className="shrink-0"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >

                <ReelOptions
                    post={item.reel}
                    currentItem={item}
                    selectedPostId={item.reelId}
                    selectedMediaId={item.mediaId}
                    selectedType={item.type}
                    
                    chats={chats}
                    onReelDeleted={onReelDeleted}
                    open={
                        openOptionId === optionId
                    }

                    setOpen={(value) => {
                        setOpenOptionId(
                            value
                                ? optionId
                                : null
                        );
                    }}

                    showImagePicker={
                        showImagePicker
                    }

                    setShowImagePicker={
                        setShowImagePicker
                    }

                    messageOpenShare={
                        messageOpenShare
                    }

                    setMessageOpenShare={
                        setMessageOpenShare
                    }

                    openReport={
                        openReport
                    }

                    setOpenReport={
                        setOpenReport
                    }

                    shares={shares}
                    setShares={setShares}
                />

            </div>

        </div>
    );
})}

</div>                )}

            </div>

            {myReels.length > 0 && (

                <div
                    className="
                        shrink-0
                        py-6
                        px-6
                        text-center
                        text-xs
                        bg-[var(--bg-color)]
                        text-[var(--text-color)]
                    "
                >

                    <div
                        className="
                            flex
                            justify-center
                            items-center
                            gap-1
                            mb-1
                        "
                    >

                        <Lock size={12} />

                        <span>
                            Your statuses are
                            <span
                                className="
                                    text-green-500
                                    font-semibold
                                    mx-1
                                "
                            >
                                end-to-end encrypted
                            </span>
                        </span>

                    </div>

                    <p>
                        They will disappear after
                        24 hours.
                    </p>

                </div>

            )}

            

            
        </div>
    );
}
