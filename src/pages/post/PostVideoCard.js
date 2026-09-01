import { useRef, useState, useEffect } from "react";
import api from "../../Api/axios";

export default function PostVideoCard({ v, post }) {

    const videoRef = useRef(null);
    const controlsTimerRef = useRef(null);
    const viewedRef = useRef(false);

    const [playing, setPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Show native video controls
    |--------------------------------------------------------------------------
    */

    const showVideoControls = () => {

        setShowControls(true);

        if (controlsTimerRef.current) {
            clearTimeout(
                controlsTimerRef.current
            );
        }

        /*
        | Keep controls visible while video is paused.
        | Hide them after 4 seconds while playing.
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
    | Cleanup
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
    | Intersection observer
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

                    if (entry.isIntersecting) {

                        /*
                        | Auto-play muted when visible
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
                            !videoRef.current.paused
                        ) {

                            videoRef.current.pause();

                        }

                        setPlaying(false);

                        /*
                        | Hide native controls when
                        | leaving viewport
                        */

                        setShowControls(false);
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
    | Click video
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Don't force play here.
    |
    | Clicking the video should reveal the native
    | browser controls.
    |
    */

    const handleVideoClick = (e) => {

        /*
        | If the user clicks the native controls,
        | don't interfere with them.
        */

        showVideoControls();

    };


    /*
    |--------------------------------------------------------------------------
    | Mouse enter
    |--------------------------------------------------------------------------
    */

    const handleMouseEnter = () => {

        showVideoControls();

    };


    /*
    |--------------------------------------------------------------------------
    | Mouse move
    |--------------------------------------------------------------------------
    */

    const handleMouseMove = () => {

        showVideoControls();

    };


    /*
    |--------------------------------------------------------------------------
    | Mouse leave
    |--------------------------------------------------------------------------
    */

    const handleMouseLeave = () => {

        if (controlsTimerRef.current) {

            clearTimeout(
                controlsTimerRef.current
            );

        }

        /*
        | Don't immediately hide controls.
        | Give the browser/player time to interact.
        */

        if (playing) {

            controlsTimerRef.current =
                setTimeout(() => {

                    setShowControls(false);

                }, 1000);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Video play
    |--------------------------------------------------------------------------
    */

    const handlePlay = () => {

        setPlaying(true);

        showVideoControls();

    };


    /*
    |--------------------------------------------------------------------------
    | Video pause
    |--------------------------------------------------------------------------
    */

    const handlePause = () => {

        setPlaying(false);

        /*
        | Keep controls visible when paused.
        */

        setShowControls(true);

    };


    /*
    |--------------------------------------------------------------------------
    | Count view once
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

                /*
                | metadata allows the duration
                | to appear in native controls
                */

                preload="metadata"

                /*
                |--------------------------------------------------------------------------
                | Native browser controls
                |--------------------------------------------------------------------------
                |
                | This is what gives you the controls
                | similar to the screenshot.
                |
                */

                controls={
                    showControls
                }

                /*
                | Allow all native controls
                */

                controlsList="
                    nodownload
                "

                /*
                | Keep PiP available
                */

                disablePictureInPicture={
                    false
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


            {/*
            |--------------------------------------------------------------------------
            | Custom center play button
            |--------------------------------------------------------------------------
            |
            | Only show it when video is paused AND
            | native controls are not currently visible.
            |
            */}

            {!playing &&
                !showControls && (

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

                            <path
                                d="
                                    M8 5v14l11-7z
                                "
                            />

                        </svg>

                    </div>

                </div>

            )}

        </div>

    );
}