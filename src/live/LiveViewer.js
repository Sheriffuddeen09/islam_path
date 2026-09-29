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
    | Intersection Observer
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
    | Disconnect
    |--------------------------------------------------------------------------
    */

    const disconnectRoom = () => {

        const room = roomRef.current;

        if (!room) return;

        try {

            room.remoteParticipants.forEach(
                (participant) => {

                    participant.trackPublications.forEach(
                        (publication) => {

                            if (publication.track) {
                                try {
                                    publication.track.detach();
                                } catch (e) {}
                            }

                        }
                    );

                }
            );

            room.disconnect();

        } catch (error) {

            console.error(
                "LiveKit disconnect error:",
                error
            );
        }

        roomRef.current = null;

        if (mountedRef.current) {
            setWatching(false);
            setHasVideo(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Join LiveKit
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        mountedRef.current = true;

        let cancelled = false;

        const joinLive = async () => {

            if (!isVisible) {
                disconnectRoom();
                return;
            }

            if (!post?.id) {
                return;
            }

            if (roomRef.current) {
                return;
            }

            try {

                setConnecting(true);
                setWatching(false);
                setHasVideo(false);

                /*
                |--------------------------------------------------------------------------
                | Get viewer token
                |--------------------------------------------------------------------------
                */

                const tokenResponse = await api.get(
                    `/api/live/${post.id}/viewer-token`
                );

                if (
                    cancelled ||
                    !mountedRef.current
                ) {
                    return;
                }

                const liveData =
                    tokenResponse.data;

                if (
                    !liveData?.token ||
                    !liveData?.server_url
                ) {
                    throw new Error(
                        "Live video connection information is missing."
                    );
                }

                console.log(
                    "LiveKit viewer connection:",
                    {
                        server_url:
                            liveData.server_url,
                        room_name:
                            liveData.room_name,
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Create room
                |--------------------------------------------------------------------------
                */

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                });

                roomRef.current = room;

                /*
                |--------------------------------------------------------------------------
                | Track subscribed
                |--------------------------------------------------------------------------
                */

                room.on(
                    RoomEvent.TrackSubscribed,
                    (
                        track,
                        publication,
                        participant
                    ) => {

                        console.log(
                            "LiveKit track subscribed:",
                            {
                                identity:
                                    participant.identity,
                                kind:
                                    track.kind,
                                source:
                                    publication.source,
                            }
                        );

                        if (
                            track.kind !==
                            Track.Kind.Video
                        ) {
                            return;
                        }

                        if (
                            !videoRef.current
                        ) {
                            return;
                        }

                        try {
                            track.attach(
                                videoRef.current
                            );
                        } catch (error) {

                            console.error(
                                "Unable to attach live video:",
                                error
                            );

                            return;
                        }

                        const video =
                            videoRef.current;

                        video.muted = muted;
                        video.playsInline = true;
                        video.autoplay = true;

                        video
                            .play()
                            .then(() => {

                                if (
                                    !mountedRef.current
                                ) {
                                    return;
                                }

                                setHasVideo(true);
                                setWatching(true);
                                setConnecting(false);

                            })
                            .catch((error) => {

                                console.warn(
                                    "Live video play waiting:",
                                    error
                                );

                                if (
                                    !mountedRef.current
                                ) {
                                    return;
                                }

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

                        if (
                            track.kind ===
                            Track.Kind.Video
                        ) {

                            try {
                                track.detach();
                            } catch (e) {}

                            if (
                                mountedRef.current
                            ) {
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

                        if (
                            mountedRef.current
                        ) {
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

                        if (
                            !mountedRef.current
                        ) {
                            return;
                        }

                        setWatching(false);
                        setHasVideo(false);
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | CONNECT
                |--------------------------------------------------------------------------
                |
                | IMPORTANT:
                |
                | LiveKit requires:
                |
                | room.connect(
                |     serverUrl,
                |     token,
                |     options
                | )
                |
                */

                await room.connect(
                    liveData.server_url,
                    liveData.token,
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

                console.log(
                    "Connected to LiveKit room:",
                    room.name
                );

                /*
                |--------------------------------------------------------------------------
                | Check existing subscribed tracks
                |--------------------------------------------------------------------------
                */

                let foundVideo = false;

                room.remoteParticipants.forEach(
                    (participant) => {

                        participant.trackPublications.forEach(
                            (publication) => {

                                if (
                                    publication.isSubscribed &&
                                    publication.track &&
                                    publication.track.kind ===
                                        Track.Kind.Video
                                ) {

                                    foundVideo = true;

                                    const track =
                                        publication.track;

                                    if (
                                        videoRef.current
                                    ) {

                                        try {
                                            track.attach(
                                                videoRef.current
                                            );
                                        } catch (error) {
                                            console.error(
                                                "Existing track attach failed:",
                                                error
                                            );
                                        }

                                        videoRef.current.muted =
                                            muted;

                                        videoRef.current.playsInline =
                                            true;

                                        videoRef.current
                                            .play()
                                            .catch(() => {});
                                    }
                                }
                            }
                        );
                    }
                );

                if (foundVideo) {

                    setHasVideo(true);
                    setWatching(true);
                    setConnecting(false);

                } else {

                    /*
                     * Stay connected while waiting
                     * for broadcaster video.
                     */

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
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to join live video."
                );
            }
        };

        joinLive();

        return () => {

            cancelled = true;

            disconnectRoom();
        };

    }, [
        isVisible,
        post?.id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        return () => {

            mountedRef.current = false;

            disconnectRoom();
        };

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Mute
    |--------------------------------------------------------------------------
    */

    const toggleMute = () => {

        const video =
            videoRef.current;

        if (!video) return;

        const nextMuted =
            !video.muted;

        video.muted =
            nextMuted;

        setMuted(
            nextMuted
        );

        if (!nextMuted) {
            video.play().catch(() => {});
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Don't render if no longer live
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

            {/* LIVE */}

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

            {/* LOADING */}

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
                                ? "Connecting to live"
                                : "Waiting for live video"}
                        </span>

                    </div>

                </div>
            )}

            {/* MUTE */}

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