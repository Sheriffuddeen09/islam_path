import React, { useEffect, useRef, useState } from "react";
import {
    Room,
    RoomEvent,
    Track,
} from "livekit-client";
import api from "../Api/axios";
import { toast } from "react-hot-toast";
import {
    Volume2,
    VolumeX,
    Loader2,
} from "lucide-react";

export default function LiveViewer({ post }) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const roomRef = useRef(null);

    const [watching, setWatching] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [muted, setMuted] = useState(true);
    const [connecting, setConnecting] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Detect when the live post is visible
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const element = containerRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.65,
            }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Connect / disconnect LiveKit depending on visibility
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let mounted = true;

        const joinLive = async () => {
            if (!isVisible) return;

            if (roomRef.current) return;

            try {
                setConnecting(true);

                const response = await api.post(
                    `/api/live/${post.id}/join`
                );

                const {
                    token,
                    server_url,
                } = response.data.live;

                if (!mounted) return;

                const room = new Room();

                roomRef.current = room;

                /*
                |--------------------------------------------------------------------------
                | Video subscribed
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.TrackSubscribed,
                    (track) => {
                        if (
                            track.kind === Track.Kind.Video &&
                            videoRef.current
                        ) {
                            track.attach(videoRef.current);

                            videoRef.current.muted = true;

                            videoRef.current
                                .play()
                                .catch(() => {});
                        }
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Track unsubscribed
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.TrackUnsubscribed,
                    (track) => {
                        track.detach();
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Connect
                |--------------------------------------------------------------------------
                */

                await room.connect(
                    server_url,
                    token,
                    {
                        autoSubscribe: true,
                    }
                );

                if (!mounted) return;

                setWatching(true);
                setConnecting(false);

            } catch (error) {
                console.error("LiveKit connection error:", error);

                if (mounted) {
                    setConnecting(false);

                    toast.error(
                        error.response?.data?.message ||
                        "Unable to join live video."
                    );
                }
            }
        };

        const leaveLive = () => {
            if (!roomRef.current) return;

            roomRef.current.disconnect();

            roomRef.current = null;

            setWatching(false);
        };

        if (isVisible) {
            joinLive();
        } else {
            leaveLive();
        }

        return () => {
            mounted = false;
        };

    }, [isVisible, post.id]);

    /*
    |--------------------------------------------------------------------------
    | Mute / unmute
    |--------------------------------------------------------------------------
    */

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;

        setMuted(video.muted);
    };

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="
                relative
                w-full
                aspect-video
                bg-black
                rounded-xl
                overflow-hidden
            "
        >

            {/* =========================================================
                Video
            ========================================================== */}

            <video
                ref={videoRef}
                autoPlay
                muted={muted}
                playsInline
                className="
                    absolute
                    inset-0
                    w-full
                    h-full
                    object-cover
                "
            />

            {/* =========================================================
                LIVE badge
            ========================================================== */}

            <div className="absolute top-3 left-3 z-10">

                <div
                    className="
                        flex
                        items-center
                        gap-2
                        bg-red-600
                        text-white
                        px-3
                        py-1.5
                        rounded-full
                        text-xs
                        font-bold
                        shadow-lg
                    "
                >

                    <span
                        className="
                            w-2
                            h-2
                            bg-white
                            rounded-full
                            animate-pulse
                        "
                    />

                    LIVE

                </div>

            </div>

            {/* =========================================================
                Viewer count
            ========================================================== */}

            <div
                className="
                    absolute
                    top-3
                    right-3
                    z-10
                    bg-black/60
                    backdrop-blur-sm
                    text-white
                    px-3
                    py-1.5
                    rounded-full
                    text-xs
                "
            >
                {post.live_viewers_count || 0} watching
            </div>

            {/* =========================================================
                Connecting
            ========================================================== */}

            {(connecting || !watching) && (
                <div
                    className="
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                        bg-black/40
                        text-white
                    "
                >

                    <div className="flex flex-col items-center gap-2">

                        <Loader2
                            size={28}
                            className="animate-spin"
                        />

                        <span className="text-sm">
                            Connecting to live...
                        </span>

                    </div>

                </div>
            )}

            {/* =========================================================
                Mute button
            ========================================================== */}

            {watching && (
                <button
                    type="button"
                    onClick={toggleMute}
                    className="
                        absolute
                        bottom-3
                        right-3
                        z-30
                        w-10
                        h-10
                        rounded-full
                        bg-black/60
                        backdrop-blur-sm
                        text-white
                        flex
                        items-center
                        justify-center
                        hover:bg-black/80
                        transition
                    "
                    aria-label={
                        muted
                            ? "Unmute live"
                            : "Mute live"
                    }
                >

                    {muted ? (
                        <VolumeX size={18} />
                    ) : (
                        <Volume2 size={18} />
                    )}

                </button>
            )}

        </div>
    );
}