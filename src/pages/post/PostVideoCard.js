import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";

export default function PostVideoCard({
    v,
    post,
    onOpenPreview,
    
}) {
    const videoRef = useRef(null);
    const viewedRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const currentVideo = videoRef.current;

                if (!currentVideo) {
                    return;
                }

                if (entry.isIntersecting) {
                    currentVideo.muted = true;

                    currentVideo
                        .play()
                        .then(() => {
                            setPlaying(true);
                        })
                        .catch(() => {
                            setPlaying(false);
                        });
                } else {
                    currentVideo.pause();
                    setPlaying(false);
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

    const handleVideoClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const video = videoRef.current;

        const currentTime = video?.currentTime || 0;

        if (video) {
            video.pause();
            setPlaying(false);
        }

        onOpenPreview?.({
            video: v,
            post,
            currentTime,
        });
    };

    const handlePlay = async () => {
        setPlaying(true);

        if (viewedRef.current) {
            return;
        }

        viewedRef.current = true;

        try {
            await api.post(`/api/posts/${post.id}/view`);
        } catch (error) {
            console.error("VIDEO VIEW ERROR:", error);
        }
    };

    const handlePause = () => {
        setPlaying(false);
    };

    return (
        <div
            className="
                relative
                w-full
                bg-black
                overflow-hidden
                cursor-pointer
            "
            onClick={handleVideoClick}
        >
            {/* White loading indicator */}
            {loading && (
                <div
                    className="
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                        bg-black
                    "
                >
                    <div
                        className="
                            w-8
                            h-8
                            border-4
                            border-white/30
                            border-t-white
                            rounded-full
                            animate-spin
                        "
                    />
                </div>
            )}

            <video
                ref={videoRef}
                src={v?.url}
                className="
                    w-full
                    h-64
                    sm:h-96
                    object-contain
                    bg-black
                "
                muted
                playsInline
                preload="metadata"
                controls={false}

                onLoadedMetadata={() => {
                    setLoading(false);
                }}

                onCanPlay={() => {
                    setLoading(false);
                }}

                onWaiting={() => {
                    setLoading(true);
                }}

                onPlaying={() => {
                    setLoading(false);
                }}

                onError={() => {
                    setLoading(false);
                }}

                onPlay={handlePlay}
                onPause={handlePause}
            />
        </div>
    );
}