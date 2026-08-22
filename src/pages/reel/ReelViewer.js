import React, {
    useEffect,
    useRef,
    useState,
} from "react";

const ReelViewer = ({
    reels = [],
    initialIndex = 0,
    onClose,
}) => {

    const [activeIndex, setActiveIndex] =
        useState(initialIndex);

    const [progress, setProgress] =
        useState(0);

    const videoRef = useRef(null);

    const timerRef = useRef(null);

    const activeReel = reels[activeIndex];

    /*
    |--------------------------------------------------------------------------
    | MOVE TO NEXT REEL
    |--------------------------------------------------------------------------
    */

    const handleVideoTimeUpdate = () => {

    const video = videoRef.current;

    if (!video) return;

    const duration = video.duration;

    if (!duration || duration <= 0) {
        return;
    }

    const percentage =
        (video.currentTime / duration) * 100;

    setProgress(
        Math.min(percentage, 100)
    );
};


    const nextReel = () => {

        if (activeIndex < reels.length - 1) {

            setActiveIndex(
                activeIndex + 1
            );

        } else {

            if (onClose) {
                onClose();
            }
        }
    };

    /*
    |--------------------------------------------------------------------------
    | MOVE TO PREVIOUS REEL
    |--------------------------------------------------------------------------
    */

    const previousReel = () => {

        if (activeIndex > 0) {

            setActiveIndex(
                activeIndex - 1
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setProgress(0);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        const duration =
            activeReel?.reel_type === "video"
                ? Math.min(
                    activeReel?.reel_duration || 90,
                    90
                )
                : 30;

        /*
        |--------------------------------------------------------------------------
        | VIDEO
        |--------------------------------------------------------------------------
        */

        if (
            activeReel?.reel_type ===
            "video"
        ) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | IMAGE / TEXT
        |--------------------------------------------------------------------------
        */

        const startedAt =
            Date.now();

        timerRef.current =
            setInterval(() => {

                const elapsed =
                    (Date.now() - startedAt)
                    / 1000;

                const percentage =
                    Math.min(
                        (elapsed / duration) *
                        100,
                        100
                    );

                setProgress(
                    percentage
                );

                if (elapsed >= duration) {

                    clearInterval(
                        timerRef.current
                    );

                    nextReel();
                }

            }, 50);

        return () => {

            if (timerRef.current) {

                clearInterval(
                    timerRef.current
                );
            }
        };

    }, [activeIndex, activeReel]);


    // const handleVideoTimeUpdate = () => {

    //     const video =
    //         videoRef.current;

    //     if (!video) {
    //         return;
    //     }

    //     const duration =
    //         Math.min(
    //             video.duration || 90,
    //             90
    //         );

    //     const percentage =
    //         (video.currentTime /
    //             duration) *
    //         100;

    //     setProgress(
    //         Math.min(
    //             percentage,
    //             100
    //         )
    //     );
    // };

    /*
    |--------------------------------------------------------------------------
    | VIDEO ENDED
    |--------------------------------------------------------------------------
    */

    const handleVideoEnded = () => {

        setProgress(100);

        nextReel();
    };

    if (!activeReel) {
        return null;
    }

    const media =
        activeReel.media?.[0];

    const mediaUrl =
        media
            ? `/storage/${media.path}`
            : null;

    return (
        <div
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

            {/* CLOSE */}

            <button
                onClick={onClose}
                className="
                    absolute
                    top-5
                    right-5
                    z-50
                    text-white
                    text-3xl
                "
            >
                ×
            </button>

            {/* PROGRESS BAR */}

            <div
                className="
                    absolute
                    top-3
                    left-3
                    right-3
                    z-40
                    h-1
                    bg-white/30
                    rounded-full
                    overflow-hidden
                "
            >

                <div
                    className="
                        h-full
                        bg-white
                        transition-[width]
                        duration-75
                        ease-linear
                    "
                    style={{
                        width:
                            `${progress}%`,
                    }}
                />

            </div>

            {/* PREVIOUS */}

            <button
                onClick={previousReel}
                className="
                    absolute
                    left-0
                    top-0
                    bottom-0
                    w-1/4
                    z-30
                "
                aria-label="Previous reel"
            />

            {/* NEXT */}

            <button
                onClick={nextReel}
                className="
                    absolute
                    right-0
                    top-0
                    bottom-0
                    w-1/4
                    z-30
                "
                aria-label="Next reel"
            />

            {/* VIDEO */}

            {activeReel.reel_type ===
                "video" && mediaUrl && (

                <video
                    ref={videoRef}
                    src={mediaUrl}
                    autoPlay
                    playsInline
                    onTimeUpdate={
                        handleVideoTimeUpdate
                    }
                    onEnded={
                        handleVideoEnded
                    }
                    className="
                        max-h-full
                        max-w-full
                        object-contain
                    "
                />

            )}

            {/* IMAGE */}

            {activeReel.reel_type ===
                "image" && mediaUrl && (

                <img
                    src={mediaUrl}
                    alt=""
                    className="
                        max-h-full
                        max-w-full
                        object-contain
                    "
                />

            )}

            {/* TEXT */}

            {activeReel.reel_type ===
                "text" && (

                <div
                    className="
                        w-full
                        h-full
                        flex
                        items-center
                        justify-center
                        p-10
                    "
                    style={{
                        backgroundColor:
                            activeReel.background_color ||
                            "#111827",

                        fontFamily:
                            activeReel.font ||
                            "Poppins",
                    }}
                >

                    <p
                        className="
                            text-white
                            text-4xl
                            md:text-6xl
                            text-center
                            font-semibold
                            max-w-4xl
                            whitespace-pre-wrap
                        "
                        style={{
                            fontFamily:
                                activeReel.font ||
                                "Poppins",
                        }}
                    >
                        {activeReel.content}
                    </p>

                </div>

            )}

        </div>
    );
};

export default ReelViewer;