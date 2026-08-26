import React, { useState } from "react";
import {
    ArrowLeft,
    MoreVertical,
    Eye,
    Heart,
    Lock,
} from "lucide-react";

export default function MyReelModal({
    myReels, setReactionUsers, setMyMediaIndex, currentUser, setMyProgress,
    onClose, setSelectedMyIndex, setShowMyReelReview, chats
}) {


    
    
    const openMyReels = (reelIndex) => {
        setSelectedMyIndex(reelIndex);
        setMyMediaIndex(0);
        setMyProgress(0);

        setShowMyReelReview(true);
        setReactionUsers(false)
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


    const getPreview = (reel) => {

        if (
            reel?.media?.length &&
            reel.media[0]?.type === "image"
        ) {

            return (
                <img
                    src={reel.media[0].url}
                    alt=""
                    className="
                        w-full
                        h-full
                        object-cover
                    "
                />
            );
        }


        if (
            reel?.media?.length &&
            reel.media[0]?.type === "video"
        ) {

            return (
                <video
                    src={reel.media[0].url}
                    muted
                    playsInline
                    preload="metadata"
                    className="
                        w-full
                        h-full
                        object-cover
                    "
                />
            );
        }

        if (
            reel?.content &&
            reel.content.trim()
        ) {

            return (
                <div
                    className="
                        w-full
                        h-full
                        bg-gradient-to-br
                        from-blue-700
                        to-purple-700
                        p-3
                        flex
                        items-center
                        justify-center
                        text-center
                        text-white
                        text-xs
                        leading-relaxed
                    "
                >
                    <span className="line-clamp-5 text-xs">
                        {reel.content}
                    </span>
                </div>
            );
        }


        return (
            <div
                className="
                    w-full
                    h-full
                    flex
                    items-center
                    justify-center
                    text-xs
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                "
            >
                No preview
            </div>
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


                <div className="flex-1">
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

                <button
                    type="button"
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
                    <MoreVertical size={22} />
                </button>
            </div>

            <div
                className="
                    flex-1
                    overflow-y-auto 
                    scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                "
            >

                {myReels.length === 0 ? (

                    <div
                        className="
                            h-full
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-center
                            px-3
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

                    <div className="max-w-2xl mx-auto">

                        {myReels.map(
                            (reel, index) => (

                                <button
                                    key={reel.id}
                                    type="button"
                                    onClick={() => openMyReels(index)}
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

                                    {/* PREVIEW */}

                                    <div
                                    onClick={() => openMyReels(index)}
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
                                        {getPreview(
                                            reel
                                        )}
                                    </div>


                                    {/* DETAILS */}

                                    <div
                                    onClick={() => openMyReels(index)}
                                        className="
                                            flex-1
                                            min-w-0
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                            "
                                            onClick={() => openMyReels(index)}
                                        >
                                            {reel.user_reaction && (
                                                <Heart
                                                    size={17}
                                                    fill="currentColor"
                                                    className="
                                                    "
                                                />
                                            )}

                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                mt-1
                                                text-sm
                                            "
                                            onClick={() => openMyReels(index)}
                                        >

                                            <span>
                                                {formatCreatedTime(
                                                    reel.created_at
                                                )}
                                            </span>

                                            <span>
                                                •
                                            </span>

                                            <Eye
                                                size={15}
                                            />

                                            <span>
                                                {reel.views_count || 0}
                                            </span>

                                        </div>


                                        {/* CONTENT PREVIEW */}

                                        {reel.content &&
                                            reel.content.trim() && (

                                            <p
                                                onClick={() => openMyReels(index)}
                                                className="
                                                    mt-1
                                                    text-xs
                                                    truncate
                                                "
                                            >
                                                {
                                                    reel.content
                                                }
                                            </p>

                                        )}

                                    </div>


                                    {/* MENU */}

                                    <div
                                        className="
                                            shrink-0
                                        "
                                    >
                                        <MoreVertical
                                            size={20}
                                        />
                                    </div>

                                </button>

                            )
                        )}

                    </div>

                )}

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
