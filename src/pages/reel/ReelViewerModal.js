import React, {
    useEffect,
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

export default function ReelViewerModal({
    user,
    reel,
    reelIndex,
    totalReels,

    onClose,
    onNext,
    onPrevious,

    showOptions,
    setShowOptions,

    message,
    setMessage,
    onSendMessage,

    sending,

    reaction,
    onReaction,
}) {

    const [progress, setProgress] =
        useState(0);

    const videoRef = useRef(null);

    const timerRef = useRef(null);


    /*
    |--------------------------------------------------------------------------
    | REEL DURATION
    |--------------------------------------------------------------------------
    */

    const duration =
        Number(reel.duration) > 0
            ? Number(reel.duration)
            : 30;


    /*
    |--------------------------------------------------------------------------
    | PROGRESS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setProgress(0);

        if (
            reel.media?.[0]?.type ===
            "video"
        ) {
            return;
        }

        const started =
            Date.now();

        timerRef.current =
            setInterval(() => {

                const elapsed =
                    (
                        Date.now() -
                        started
                    ) / 1000;

                const percent =
                    Math.min(
                        (elapsed /
                            duration) *
                            100,
                        100
                    );

                setProgress(percent);

                if (
                    percent >= 100
                ) {

                    clearInterval(
                        timerRef.current
                    );

                    onNext();
                }

            }, 50);


        return () => {

            clearInterval(
                timerRef.current
            );

        };

    }, [
        reel.id,
        reelIndex,
        duration,
    ]);


    /*
    |--------------------------------------------------------------------------
    | VIDEO PROGRESS
    |--------------------------------------------------------------------------
    */

    const handleVideoTimeUpdate =
        (e) => {

            const video =
                e.currentTarget;

            if (
                !video.duration
            ) {
                return;
            }

            const percent =
                (
                    video.currentTime /
                    video.duration
                ) *
                100;

            setProgress(
                Math.min(
                    percent,
                    100
                )
            );
        };


    const handleVideoEnded = () => {

        setProgress(100);

        onNext();
    };


    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
    */

    const media =
        reel.media?.[0];


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

            {/* =====================================================
                MAIN VIEWER
            ====================================================== */}

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

                {/* =================================================
                    PROGRESS LINES
                ================================================== */}

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

                    {Array.from({
                        length:
                            totalReels,
                    }).map(
                        (_, index) => {

                            let width =
                                "0%";

                            if (
                                index <
                                reelIndex
                            ) {

                                width =
                                    "100%";

                            } else if (
                                index ===
                                reelIndex
                            ) {

                                width =
                                    `${progress}%`;
                            }

                            return (
                                <div
                                    key={index}
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
                                            transition-[width]
                                            duration-75
                                        "
                                        style={{
                                            width,
                                        }}
                                    />
                                </div>
                            );
                        }
                    )}

                </div>


                {/* =================================================
                    HEADER
                ================================================== */}

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


                        <a
                            href={`/profile/${user.id}`}
                            className="
                                text-white
                                font-semibold
                                hover:underline
                            "
                        >
                            {
                                user.first_name
                            }
                        </a>

                    </div>


                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        {/* OPTIONS */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowOptions(
                                    (prev) =>
                                        !prev
                                )
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
                            <MoreVertical
                                size={20}
                            />
                        </button>


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


                {/* =================================================
                    OPTIONS
                ================================================== */}

                {showOptions && (
                    <div
                        className="
                            absolute
                            top-20
                            right-4
                            z-[60]
                            w-44
                            bg-white
                            text-black
                            rounded-xl
                            shadow-xl
                            overflow-hidden
                        "
                    >

                        <button
                            type="button"
                            className="
                                w-full
                                text-left
                                px-4
                                py-3
                                hover:bg-gray-100
                            "
                        >
                            Report Reel
                        </button>

                        <button
                            type="button"
                            className="
                                w-full
                                text-left
                                px-4
                                py-3
                                hover:bg-gray-100
                            "
                        >
                            Hide Reel
                        </button>

                    </div>
                )}


                {/* =================================================
                    PREVIOUS
                ================================================== */}

                <button
                    type="button"
                    onClick={
                        onPrevious
                    }
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
                    "
                >
                    <ArrowLeft
                        size={20}
                    />
                </button>


                {/* =================================================
                    NEXT
                ================================================== */}

                <button
                    type="button"
                    onClick={onNext}
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
                    "
                >
                    <ArrowRight
                        size={20}
                    />
                </button>


                {/* =================================================
                    MEDIA
                ================================================== */}

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

                    {media?.type ===
                        "image" && (

                        <img
                            src={media.url}
                            alt=""
                            className="
                                w-full
                                h-full
                                object-contain
                            "
                        />
                    )}


                    {media?.type ===
                        "video" && (

                        <video
                            ref={videoRef}
                            src={media.url}
                            autoPlay
                            playsInline
                            controls={false}
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


                    {!media &&
                        reel.content && (

                            <div
                                className="
                                    w-full
                                    h-full
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
                                <p
                                    className="
                                        text-xl
                                        font-semibold
                                    "
                                >
                                    {
                                        reel.content
                                    }
                                </p>
                            </div>
                        )}

                </div>


                {/* =================================================
                    DESCRIPTION
                ================================================== */}

                {reel.content &&
                    media && (

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
                        {
                            reel.content
                        }
                    </div>
                )}


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

                        <button
                            type="button"
                            onClick={() =>
                                onReaction(
                                    reaction ===
                                        "❤️"
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
                                        ? "bg-red-500/30 border-red-400"
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
                                        ? "text-red-400"
                                        : "text-white"
                                }
                            />

                        </button>


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

            </div>

        </div>
    );
}