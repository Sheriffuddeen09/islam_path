import React, { useEffect, useRef, useState } from "react";

const ReelFeedCard = ({ reel, onClick, onImpression }) => {
    const cardRef = useRef(null);
    const impressionSentRef = useRef(false);
    const impressionSendingRef = useRef(false);

    const media = Array.isArray(reel?.media) ? reel.media : [];

    const videoMedia = media.find(
        (item) => item?.type === "video" && item?.url
    );

    const videoUrl =
        videoMedia?.url ||
        reel?.video_url ||
        reel?.media_url ||
        null;

    const viewCount = Number(
        reel?.view_count ??
        reel?.views_count ??
        reel?.views ??
        0
    );

    const [videoReady, setVideoReady] = useState(false);
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        setVideoReady(false);
        setVideoError(false);
    }, [reel?.id, videoUrl]);

    // Record the reel impression.
    useEffect(() => {
        const element = cardRef.current;

        if (
            !element ||
            !reel?.id ||
            typeof onImpression !== "function"
        ) {
            return;
        }

        let cancelled = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    !entry.isIntersecting ||
                    impressionSentRef.current ||
                    impressionSendingRef.current
                ) {
                    return;
                }

                impressionSendingRef.current = true;

                Promise.resolve(onImpression(reel))
                    .then(() => {
                        if (!cancelled) {
                            impressionSentRef.current = true;
                        }
                    })
                    .catch((error) => {
                        console.error(
                            "Failed to record reel impression:",
                            error
                        );
                    })
                    .finally(() => {
                        impressionSendingRef.current = false;
                    });
            },
            { threshold: 0.5 }
        );

        observer.observe(element);

        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [reel, onImpression]);

    if (!reel) return null;

    const handleClick = () => {
        if (!videoUrl) {
            onClick?.(reel);
            return;
        }

        // Open the actual video directly in the browser.
        window.location.href = videoUrl;
    };

    return (
        <button
            ref={cardRef}
            type="button"
            onClick={handleClick}
            className="
                relative block shrink-0 overflow-hidden
                w-full md:w-96 lg:w-[480px]
                h-64 lg:h-80 max-w-full
                aspect-[4/5] rounded-xl
                bg-gray-900 text-white shadow-md
                transition-transform hover:scale-[1.01]
            "
            aria-label={`Open reel video with ${viewCount.toLocaleString()} views`}
        >
            {videoUrl && !videoError ? (
                <>
                    <video
                        key={videoUrl}
                        src={videoUrl}
                        muted
                        playsInline
                        preload="auto"
                        controls={false}
                        onLoadedData={(event) => {
                            const video = event.currentTarget;

                            // Show the first actual video frame.
                            if (video.readyState >= 2) {
                                setVideoReady(true);
                            }
                        }}
                        onCanPlay={() => setVideoReady(true)}
                        onError={(event) => {
                            console.error(
                                "Reel video failed to load:",
                                event.currentTarget.error,
                                videoUrl
                            );
                            setVideoError(true);
                        }}
                        className={`
                            absolute inset-0
                            h-full w-full object-cover
                            ${videoReady ? "opacity-100" : "opacity-0"}
                        `}
                    />

                    {/* Loading spinner */}
                    {!videoReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
                            <svg
                                className="h-10 w-10 animate-spin text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="opacity-25"
                                />
                                <path
                                    d="M21 12a9 9 0 0 0-9-9"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                            </svg>
 
                        </div>
                    )}

                    {videoError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <span className="text-sm">
                                Unable to load video
                            </span>
                        </div>
                    )}

                    {/* Video play indicator */} 
            {videoReady && !videoError && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center justify-center rounded-full bg-black/60 p-4">
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-10 w-10 text-white"
                            aria-hidden="true"
                        >
                            <path d="M8 5.5v13l11-6.5z" />
                        </svg>
                    </div>
                </div>
            )}
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <span className="text-sm">
                        {videoError
                            ? "Unable to load video"
                            : "Video unavailable"}
                    </span>
                </div>
            )}

            {/* Dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

            {/* View count */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 text-sm font-semibold pointer-events-none">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="h-5 w-5"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.5-7 9.75-7 9.75 7 9.75 7-3.5 7-9.75 7S2.25 12 2.25 12Z"
                    />
                    <circle cx="12" cy="12" r="3" />
                </svg>

                <span>{viewCount.toLocaleString()}</span>
            </div>
        </button>
    );
};

export default ReelFeedCard;