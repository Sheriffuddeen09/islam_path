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
    const mountedRef = useRef(false);

    const [isVisible, setIsVisible] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [watching, setWatching] = useState(false);
    const [muted, setMuted] = useState(true);
    const [hasVideo, setHasVideo] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Intersection Observer /join
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
    | Join / Leave LiveKit room
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        mountedRef.current = true;

        let cancelled = false;

        const disconnectRoom = () => {
            const room = roomRef.current;

            if (!room) return;

            try {
                room.remoteParticipants.forEach((participant) => {
                    participant.trackPublications.forEach((publication) => {
                        if (publication.track) {
                            publication.track.detach();
                        }
                    });
                });

                room.disconnect();
            } catch (error) {
                console.error("LiveKit disconnect error:", error);
            }

            roomRef.current = null;

            if (mountedRef.current) {
                setWatching(false);
                setHasVideo(false);
            }
        };

        const joinLive = async () => {
            if (!isVisible) {
                disconnectRoom();
                return;
            }

            if (roomRef.current) {
                return;
            }

            try {
                setConnecting(true);
                setWatching(false);
                setHasVideo(false);

                const response = await api.post(
                        `/api/live/${post.id}/view`
                    );

                if (cancelled || !mountedRef.current) {
                    return;
                }

                const live = response.data?.live;

                const token = live?.token;
                const serverUrl = live?.server_url;

                if (!token || !serverUrl) {
                    throw new Error(
                        "Live video information is unavailable."
                    );
                }

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                });

                roomRef.current = room;

                /*
                |--------------------------------------------------------------------------
                | Video track subscribed
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.TrackSubscribed,
                    (track, publication, participant) => {
                        console.log(
                            "Live video subscribed:",
                            participant.identity,
                            track.kind
                        );

                        if (
                            track.kind !== Track.Kind.Video ||
                            !videoRef.current
                        ) {
                            return;
                        }

                        track.attach(videoRef.current);

                        const video = videoRef.current;

                        video.muted = true;
                        video.playsInline = true;
                        video.autoplay = true;

                        video
                            .play()
                            .then(() => {
                                if (!mountedRef.current) return;

                                setHasVideo(true);
                                setWatching(true);
                                setConnecting(false);
                            })
                            .catch((error) => {
                                console.log(
                                    "Video autoplay waiting:",
                                    error
                                );

                                if (!mountedRef.current) return;

                                setHasVideo(true);
                                setWatching(true);
                                setConnecting(false);
                            });
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
                        if (track.kind === Track.Kind.Video) {
                            track.detach();

                            if (mountedRef.current) {
                                setHasVideo(false);
                            }
                        }
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Participant disconnected
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.ParticipantDisconnected,
                    (participant) => {
                        console.log(
                            "Live participant disconnected:",
                            participant.identity
                        );

                        if (mountedRef.current) {
                            setHasVideo(false);
                            setWatching(false);
                        }
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Room disconnected
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.Disconnected,
                    () => {
                        if (!mountedRef.current) return;

                        setWatching(false);
                        setHasVideo(false);
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Connect
                |--------------------------------------------------------------------------
                */

                await room.connect(
                    serverUrl,
                    token,
                    {
                        autoSubscribe: true,
                    }
                );

                if (
                    cancelled ||
                    !mountedRef.current
                ) {
                    room.disconnect();
                    roomRef.current = null;
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Check already subscribed tracks
                |--------------------------------------------------------------------------
                */

                room.remoteParticipants.forEach(
                    (participant) => {
                        participant.trackPublications.forEach(
                            (publication) => {
                                if (
                                    publication.isSubscribed &&
                                    publication.track &&
                                    publication.track.kind ===
                                        Track.Kind.Video &&
                                    videoRef.current
                                ) {
                                    const track =
                                        publication.track;

                                    track.attach(
                                        videoRef.current
                                    );

                                    videoRef.current.muted = true;

                                    videoRef.current
                                        .play()
                                        .catch(() => {});

                                    setHasVideo(true);
                                    setWatching(true);
                                    setConnecting(false);
                                }
                            }
                        );
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | If connected but no video yet, keep loading
                |--------------------------------------------------------------------------
                */

                if (mountedRef.current && !hasVideo) {
                    setConnecting(false);
                }

            } catch (error) {
                console.error(
                    "LiveKit connection error:",
                    error
                );

                if (
                    cancelled ||
                    !mountedRef.current
                ) {
                    return;
                }

                setConnecting(false);
                setWatching(false);
                setHasVideo(false);

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to join live video."
                );
            }
        };

        if (isVisible) {
            joinLive();
        } else {
            disconnectRoom();
        }

        return () => {
            cancelled = true;
            disconnectRoom();
        };
    }, [isVisible, post?.id]);

    /*
    |--------------------------------------------------------------------------
    | Cleanup when component disappears
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        return () => {
            mountedRef.current = false;

            const room = roomRef.current;

            if (room) {
                try {
                    room.remoteParticipants.forEach(
                        (participant) => {
                            participant.trackPublications.forEach(
                                (publication) => {
                                    if (publication.track) {
                                        publication.track.detach();
                                    }
                                }
                            );
                        }
                    );

                    room.disconnect();
                } catch (error) {
                    console.error(
                        "LiveViewer cleanup error:",
                        error
                    );
                }

                roomRef.current = null;
            }
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Mute / Unmute
    |--------------------------------------------------------------------------
    */

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;

        setMuted(video.muted);

        if (!video.muted) {
            video.play().catch(() => {});
        }
    };

    /*
    |--------------------------------------------------------------------------
    | If post is no longer live
    |--------------------------------------------------------------------------
    */

    if (
        !post?.is_live ||
        post?.live_status !== "live"
    ) {
        return null;
    }

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

            {/* VIDEO */}

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
                    bg-black
                "
            />

            {/* LIVE BADGE */}

            <div
                className="
                    absolute
                    top-3
                    left-3
                    z-30
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


            {(!hasVideo || connecting) && (
                <div
                    className="
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        text-white
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            gap-3
                        "
                    >
                        <Loader2
                            size={32}
                            className="animate-spin"
                        />

                        <span className="text-sm">
                            {connecting
                                ? "Connecting to live..."
                                : "Waiting for live video..."}
                        </span>
                    </div>
                </div>
            )}

            {/* MUTE BUTTON */}

            {hasVideo && watching && (
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