import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";

export default function PostVideoCard({ v, post }) {
    const videoRef = useRef(null);
    const controlsTimerRef = useRef(null);

    const [playing, setPlaying] =
        useState(false);

    const [showControls, setShowControls] =
        useState(false);

    const viewedRef = useRef(false);

    /*
    |--------------------------------------------------------------------------
    | SHOW CONTROLS
    |--------------------------------------------------------------------------
    */

    const showVideoControls = () => {
        setShowControls(true);

        // Clear previous timer
        if (controlsTimerRef.current) {
            clearTimeout(
                controlsTimerRef.current
            );
        }

        /*
        Hide native controls after
        a few seconds if video is playing.
        */

        if (playing) {
            controlsTimerRef.current =
                setTimeout(() => {
                    setShowControls(false);
                }, 4000);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CLEANUP
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (controlsTimerRef.current) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | AUTOPLAY WHEN VISIBLE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    if (!videoRef.current) {
                        return;
                    }

                    if (
                        entry.isIntersecting
                    ) {
                        /*
                        Autoplay needs to be
                        muted in most browsers.
                        */

                        videoRef.current.muted =
                            true;

                        videoRef.current
                            .play()
                            .then(() => {
                                setPlaying(true);
                            })
                            .catch(() => {
                                setPlaying(false);
                            });
                    } else {
                        if (
                            !videoRef.current
                                .paused
                        ) {
                            videoRef.current.pause();
                        }

                        setPlaying(false);
                    }
                },
                {
                    threshold: 0.6
                }
            );

        observer.observe(video);

        return () => {
            observer.disconnect();
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | MOUSE ENTER
    |--------------------------------------------------------------------------
    */

    const handleMouseEnter = () => {
        showVideoControls();

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        /*
        Do not force play if the user
        has already paused it.
        */

        video.play().catch(() => {});

        setPlaying(true);
    };

    /*
    |--------------------------------------------------------------------------
    | MOUSE MOVE
    |--------------------------------------------------------------------------
    */

    const handleMouseMove = () => {
        showVideoControls();
    };

    /*
    |--------------------------------------------------------------------------
    | MOUSE LEAVE
    |--------------------------------------------------------------------------
    */

    const handleMouseLeave = () => {
        /*
        Don't pause or reset the video here.

        This allows the video to continue
        playing while controls disappear.
        */

        if (controlsTimerRef.current) {
            clearTimeout(
                controlsTimerRef.current
            );
        }

        controlsTimerRef.current =
            setTimeout(() => {
                setShowControls(false);
            }, 1000);
    };

    /*
    |--------------------------------------------------------------------------
    | CLICK / TOUCH
    |--------------------------------------------------------------------------
    */

    const handleVideoClick = () => {
        showVideoControls();

        const video =
            videoRef.current;

        if (!video) {
            return;
        }

        /*
        If video is playing, don't
        automatically pause it.

        The native controls will handle
        play/pause when the user clicks
        the actual play button.
        */

        if (video.paused) {
            video.play().catch(() => {});
            setPlaying(true);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | VIDEO PLAY
    |--------------------------------------------------------------------------
    */

    const handlePlay = () => {
        setPlaying(true);
    };

    /*
    |--------------------------------------------------------------------------
    | VIDEO PAUSE
    |--------------------------------------------------------------------------
    */

    const handlePause = () => {
        setPlaying(false);

        /*
        Keep controls visible when
        the user pauses the video.
        */

        setShowControls(true);
    };

    /*
    |--------------------------------------------------------------------------
    | RECORD VIEW
    |--------------------------------------------------------------------------
    */

    const onPlay = async () => {
        if (viewedRef.current) {
            return;
        }

        viewedRef.current = true;

        try {
            await api.post(
                `/api/post/${post.id}/view`
            );
        } catch (error) {
            console.error(
                "VIDEO VIEW ERROR:",
                error
            );
        }
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
            onMouseEnter={
                handleMouseEnter
            }
            onMouseMove={
                handleMouseMove
            }
            onMouseLeave={
                handleMouseLeave
            }
            onClick={
                handleVideoClick
            }
        >

            <video
                ref={videoRef}
                src={v.url}
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

                /*
                This is the important part.

                Controls are controlled by
                mouse movement / click.
                */

                controls={
                    showControls
                }

                onPlay={() => {
                    handlePlay();
                    onPlay();
                }}

                onPause={
                    handlePause
                }

                onMouseMove={
                    handleMouseMove
                }

                onTouchStart={
                    showVideoControls
                }
            />

            {/* ===================================================== */}
            {/* PLAY ICON */}
            {/* ===================================================== */}

            {!playing && (
                <div
                    className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        pointer-events-none
                    "
                >
                    <div
                        className="
                            w-14
                            h-14
                            rounded-full
                            bg-black/60
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="
                                w-8
                                h-8
                                text-white
                                ml-1
                            "
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

        </div>
    );
}