import React, { useEffect, useRef, useState } from "react";
import {
    Room,
    Track,
} from "livekit-client";

import api from "../Api/axios";
import { toast } from "react-hot-toast";

import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Camera,
    Users,
    X,
    Radio,
    Loader2,
    RotateCcw,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";


export default function LiveBroadcaster({
    liveData,
    post,
    onEnded,
}) {
     
    const videoRef = useRef(null);
    const roomRef = useRef(null);

    const controlsTimerRef = useRef(null);

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [cameraLoading, setCameraLoading] = useState(true);

    const [connectionError, setConnectionError] = useState(null);
 

    const [ending, setEnding] = useState(false);
    const [ended, setEnded] = useState(false);

    const [showEndModal, setShowEndModal] = useState(false);

    const [liveDuration, setLiveDuration] = useState(0);
 
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    const [cameraPosition, setCameraPosition] = useState("user");
 

    const [showControls, setShowControls] = useState(true);

 

    const formatDuration = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(2, "0")}`;
    };





    const showVideoControls = () => {
        setShowControls(true);

        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
        }

        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };


    /*
    |--------------------------------------------------------------------------
    | Start controls timer
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        showVideoControls();

        return () => {
            if (controlsTimerRef.current) {
                clearTimeout(controlsTimerRef.current);
            }
        };
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Live duration
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!connected || ended) {
            return;
        }

        const interval = setInterval(() => {
            setLiveDuration((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [connected, ended]);


    /*
    |--------------------------------------------------------------------------
    | Connect to LiveKit
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !liveData?.token ||
            !liveData?.server_url
        ) {
            console.error(
                "Missing LiveKit credentials:",
                liveData
            );

            setConnecting(false);
            setCameraLoading(false);

            setConnectionError(
                "Live video connection information is missing."
            );

            return;
        }

        let mounted = true;
        let room = null;

        const connectLive = async () => {
            try {
                setConnecting(true);
                setCameraLoading(true);
                setConnected(false);
                setConnectionError(null);
                setEnded(false);

                console.log(
                    "Connecting to LiveKit"
                );

                console.log(
                    "LiveKit server:",
                    liveData.server_url
                );

                console.log(
                    "LiveKit room:",
                    liveData.room_name
                );

                /*
                |--------------------------------------------------------------------------
                | Create room
                |--------------------------------------------------------------------------
                */

                room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                });

                roomRef.current = room;


                /*
                |--------------------------------------------------------------------------
                | LiveKit events
                |--------------------------------------------------------------------------
                */

                room.on(
                    "connected",
                    () => {
                        console.log(
                            "LiveKit connected:",
                            room.name
                        );
                    }
                );


                room.on(
                    "disconnected",
                    (reason) => {
                        console.log(
                            "LiveKit disconnected:",
                            reason
                        );
                    }
                );


                room.on(
                    "connectionStateChanged",
                    (state) => {
                        console.log(
                            "LiveKit connection state:",
                            state
                        );
                    }
                );


                room.on(
                    "localTrackPublished",
                    (publication) => {
                        console.log(
                            "Local track published:",
                            publication.kind
                        );
                    }
                );


                room.on(
                    "localTrackUnpublished",
                    (publication) => {
                        console.log(
                            "Local track unpublished:",
                            publication.kind
                        );
                    }
                );


                /*
                |--------------------------------------------------------------------------
                | Connect
                |--------------------------------------------------------------------------
                */

                await room.connect(
                    liveData.server_url,
                    liveData.token,
                    {
                        autoSubscribe: true,
                    }
                );


                /*
                |--------------------------------------------------------------------------
                | Component unmounted during connection
                |--------------------------------------------------------------------------
                */

                if (!mounted) {
                    await room.disconnect();
                    return;
                }


                console.log(
                    "LiveKit room connected."
                );


                /*
                |--------------------------------------------------------------------------
                | Create camera + microphone
                |--------------------------------------------------------------------------
                */

                console.log(
                    "Requesting camera and microphone"
                );

                const tracks =
                    await room.localParticipant.createTracks({
                        audio: true,
                        video: true,
                    });


                if (!mounted) {
                    tracks.forEach((track) => {
                        track.stop();
                    });

                    await room.disconnect();

                    return;
                }


                console.log(
                    "Local tracks created:",
                    tracks
                );


                /*
                |--------------------------------------------------------------------------
                | Publish tracks
                |--------------------------------------------------------------------------
                */

                let videoAttached = false;

                for (const track of tracks) {
                    if (!mounted) {
                        track.stop();
                        continue;
                    }

                    console.log(
                        "Publishing:",
                        track.kind
                    );

                    await room.localParticipant.publishTrack(
                        track
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | Attach camera preview
                    |--------------------------------------------------------------------------
                    */

                    if (
                        track.kind ===
                        Track.Kind.Video
                    ) {
                        if (!videoRef.current) {
                            console.error(
                                "Video element is not ready."
                            );

                            track.stop();

                            throw new Error(
                                "Camera video element is not available."
                            );
                        }


                        console.log(
                            "Attaching camera"
                        );


                        track.attach(
                            videoRef.current
                        );


                        /*
                        |--------------------------------------------------------------------------
                        | Force browser playback
                        |--------------------------------------------------------------------------
                        */

                        try {
                            await videoRef.current.play();
                        } catch (playError) {
                            console.warn(
                                "Video autoplay warning:",
                                playError
                            );
                        }


                        videoAttached = true;

                        setCameraLoading(false);
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | Make sure camera actually attached
                |--------------------------------------------------------------------------
                */

                if (!videoAttached) {
                    throw new Error(
                        "Unable to attach the camera video."
                    );
                }


                if (!mounted) {
                    return;
                }


                /*
                |--------------------------------------------------------------------------
                | Only now consider live ready
                |--------------------------------------------------------------------------
                */

                setConnected(true);
                setConnecting(false);
                setCameraLoading(false);

                console.log(
                    "LIVE VIDEO READY."
                );

            } catch (error) {
                console.error(
                    "LiveKit connection error:",
                    error
                );

                console.error(
                    "LiveKit error details:",
                    {
                        name: error?.name,
                        message: error?.message,
                        code: error?.code,
                        reason: error?.reason,
                    }
                );


                if (mounted) {
                    setConnecting(false);
                    setConnected(false);
                    setCameraLoading(false);

                    setConnectionError(
                        error?.message ||
                        "Unable to start your camera and microphone."
                    );


                    toast.error(
                        error?.message ||
                        "Unable to start your camera and microphone."
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | Cleanup failed connection
                |--------------------------------------------------------------------------
                */

                if (room) {
                    try {
                        room.localParticipant.trackPublications.forEach(
                            (publication) => {
                                if (
                                    publication.track
                                ) {
                                    publication.track.stop();
                                }
                            }
                        );

                        await room.disconnect();

                    } catch (cleanupError) {
                        console.error(
                            "LiveKit cleanup error:",
                            cleanupError
                        );
                    }

                    roomRef.current = null;
                }
            }
        };


        connectLive();


        /*
        |--------------------------------------------------------------------------
        | Cleanup
        |--------------------------------------------------------------------------
        */

        return () => {
            mounted = false;

            const currentRoom =
                roomRef.current;


            if (currentRoom) {
                console.log(
                    "Cleaning up LiveKit room"
                );


                currentRoom.localParticipant.trackPublications.forEach(
                    (publication) => {
                        if (
                            publication.track
                        ) {
                            publication.track.stop();
                        }
                    }
                );


                currentRoom.disconnect();

                roomRef.current = null;
            }
        };

    }, [
        liveData?.token,
        liveData?.server_url,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Toggle microphone
    |--------------------------------------------------------------------------
    */

    const toggleMicrophone = async () => {
        const room = roomRef.current;

        if (
            !room ||
            !connected ||
            ended
        ) {
            return;
        }

        try {
            const nextState =
                !micEnabled;

            await room.localParticipant.setMicrophoneEnabled(
                nextState
            );

            setMicEnabled(nextState);

            showVideoControls();

        } catch (error) {
            console.error(
                "Microphone error:",
                error
            );

            toast.error(
                "Unable to change microphone."
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Toggle camera
    |--------------------------------------------------------------------------
    */

    const toggleCamera = async () => {
        const room = roomRef.current;

        if (
            !room ||
            !connected ||
            ended
        ) {
            return;
        }

        try {
            const nextState =
                !cameraEnabled;


            await room.localParticipant.setCameraEnabled(
                nextState
            );


            setCameraEnabled(nextState);


            if (nextState) {
                setCameraLoading(true);


                /*
                |--------------------------------------------------------------------------
                | Give LiveKit time to publish the camera
                |--------------------------------------------------------------------------
                */

                setTimeout(() => {
                    const publication =
                        Array.from(
                            room
                                .localParticipant
                                .videoTrackPublications
                                .values()
                        )[0];


                    const track =
                        publication?.track;


                    if (
                        track &&
                        videoRef.current
                    ) {
                        track.attach(
                            videoRef.current
                        );

                        videoRef.current
                            .play()
                            .catch(() => {});

                        setCameraLoading(false);
                    } else {
                        setCameraLoading(false);
                    }
                }, 150);

            } else {
                setCameraLoading(false);
            }


            showVideoControls();

        } catch (error) {
            console.error(
                "Camera error:",
                error
            );

            toast.error(
                "Unable to change camera."
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Flip camera
    |--------------------------------------------------------------------------
    */

    const flipCamera = async () => {
        const room = roomRef.current;

        if (
            !room ||
            !connected ||
            !cameraEnabled ||
            ended
        ) {
            return;
        }


        try {
            const nextPosition =
                cameraPosition === "user"
                    ? "environment"
                    : "user";


            /*
            |--------------------------------------------------------------------------
            | Find cameras
            |--------------------------------------------------------------------------
            */

            const devices =
                await navigator.mediaDevices.enumerateDevices();


            const cameras =
                devices.filter(
                    (device) =>
                        device.kind ===
                        "videoinput"
                );


            if (cameras.length < 2) {
                toast.error(
                    "Your device does not have another camera."
                );

                return;
            }


            /*
            |--------------------------------------------------------------------------
            | Current camera
            |--------------------------------------------------------------------------
            */

            const publication =
                Array.from(
                    room
                        .localParticipant
                        .videoTrackPublications
                        .values()
                )[0];


            const currentTrack =
                publication?.track;


            if (!currentTrack) {
                return;
            }


            const currentDeviceId =
                currentTrack
                    .mediaStreamTrack
                    ?.getSettings()
                    ?.deviceId;


            /*
            |--------------------------------------------------------------------------
            | Find another camera
            |--------------------------------------------------------------------------
            */

            let nextCamera =
                cameras.find(
                    (camera) =>
                        camera.deviceId !==
                        currentDeviceId
                );


            if (!nextCamera) {
                nextCamera =
                    cameras[0];
            }


            /*
            |--------------------------------------------------------------------------
            | Show loading
            |--------------------------------------------------------------------------
            */

            setCameraLoading(true);


            /*
            |--------------------------------------------------------------------------
            | Disable current camera
            |--------------------------------------------------------------------------
            */

            await room.localParticipant.setCameraEnabled(
                false
            );


            /*
            |--------------------------------------------------------------------------
            | Enable new camera
            |--------------------------------------------------------------------------
            */

            await room.localParticipant.setCameraEnabled(
                true,
                {
                    deviceId:
                        nextCamera.deviceId,
                }
            );


            /*
            |--------------------------------------------------------------------------
            | Reattach current LiveKit track
            |--------------------------------------------------------------------------
            */

            setTimeout(() => {
                const newPublication =
                    Array.from(
                        room
                            .localParticipant
                            .videoTrackPublications
                            .values()
                    )[0];


                const newTrack =
                    newPublication?.track;


                if (
                    newTrack &&
                    videoRef.current
                ) {
                    newTrack.attach(
                        videoRef.current
                    );


                    videoRef.current
                        .play()
                        .catch(() => {});


                    setCameraLoading(false);
                } else {
                    setCameraLoading(false);
                }
            }, 200);


            setCameraPosition(
                nextPosition
            );


            showVideoControls();

        } catch (error) {
            console.error(
                "Flip camera error:",
                error
            );

            setCameraLoading(false);

            toast.error(
                "Unable to switch camera."
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | End live
    |--------------------------------------------------------------------------
    */

    const endLive = async () => {
        if (
            ending ||
            !post?.id
        ) {
            return;
        }


        setEnding(true);


        /*
        |--------------------------------------------------------------------------
        | End live on backend
        |--------------------------------------------------------------------------
        */

        try {
            await api.post(
                `/api/live/${post.id}/end`
            );

        } catch (error) {
            console.error(
                "End live API error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Unable to end live video."
            );


            setEnding(false);

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Mark ended immediately
        |--------------------------------------------------------------------------
        */

        setEnded(true);
        setConnected(false);
        setConnecting(false);
        setCameraLoading(false);
        setShowEndModal(false);


        /*
        |--------------------------------------------------------------------------
        | Disconnect LiveKit
        |--------------------------------------------------------------------------
        */

        const room =
            roomRef.current;


        if (room) {
            try {
                room.localParticipant.trackPublications.forEach(
                    (publication) => {
                        if (
                            publication.track
                        ) {
                            publication.track.stop();
                        }
                    }
                );


                await room.disconnect();

            } catch (cleanupError) {
                console.error(
                    "LiveKit disconnect error:",
                    cleanupError
                );
            }


            roomRef.current = null;
        }


        /*
        |--------------------------------------------------------------------------
        | Detach preview
        |--------------------------------------------------------------------------
        */

        if (videoRef.current) {
            videoRef.current.srcObject =
                null;
        }


        toast.success(
            "Live video ended."
        );


        setEnding(false);


        /*
        |--------------------------------------------------------------------------
        | Tell parent
        |--------------------------------------------------------------------------
        */

        onEnded?.();
    };


    /*
    |--------------------------------------------------------------------------
    | Don't render after live has ended
    |--------------------------------------------------------------------------
    */

    if (ended) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="
                fixed
                inset-0
                z-[9999]
                bg-black
                text-white
                overflow-hidden
            "
            onMouseMove={showVideoControls}
            onMouseEnter={showVideoControls}
            onTouchStart={showVideoControls}
            onClick={showVideoControls}
        >

            {/*
            |--------------------------------------------------------------------------
            | Camera preview
            |--------------------------------------------------------------------------
            */}

            <div className="absolute inset-0">

                {cameraEnabled ? (
                    <>

                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`
                                h-full
                                w-full
                                object-cover

                                ${
                                    cameraPosition ===
                                    "user"
                                        ? "scale-x-[-1]"
                                        : ""
                                }
                            `}
                        />


                        {cameraLoading && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    z-10
                                    flex
                                    items-center
                                    justify-center
                                    bg-black/40
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
                                        size={38}
                                        className="
                                            animate-spin
                                            text-white
                                        "
                                    />

                                    <span
                                        className="
                                            text-sm
                                            text-white/80
                                        "
                                    >
                                        Starting camera
                                    </span>
                                </div>
                            </div>
                        )}

                    </>
                ) : (

                    /*
                    |--------------------------------------------------------------------------
                    | Camera disabled
                    |--------------------------------------------------------------------------
                    */

                    <div
                        className="
                            absolute
                            inset-0
                            flex
                            flex-col
                            items-center
                            justify-center
                            bg-neutral-950
                        "
                    >
                        <div
                            className="
                                flex
                                h-20
                                w-20
                                items-center
                                justify-center
                                rounded-full
                                bg-white/10
                            "
                        >
                            <VideoOff
                                size={34}
                                className="text-white/70"
                            />
                        </div>

                        <p
                            className="
                                mt-4
                                text-sm
                                text-white/60
                            "
                        >
                            Camera is off
                        </p>
                    </div>
                )}

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-b
                        from-black/60
                        via-transparent
                        to-black/90
                        pointer-events-none
                    "
                />

            </div>

            <div
                className={`
                    absolute
                    left-0
                    right-0
                    top-0
                    z-30
                    px-4
                    pt-4
                    transition-opacity
                    duration-300

                    ${
                        showControls
                            ? "opacity-100"
                            : "opacity-0"
                    }
                `}
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                h-10
                                w-10
                                flex-shrink-0
                                overflow-hidden
                                rounded-full
                                bg-white/10
                                border
                                border-white/20
                            "
                        >

                            {post?.user?.image ? (
                                <img
                                    src={
                                        post.user.image
                                    }
                                    alt=""
                                    className="
                                        h-full
                                        w-full
                                        object-cover
                                    "
                                />
                            ) : (
                                <div
                                    className="
                                        flex
                                        h-full
                                        w-full
                                        items-center
                                        justify-center
                                        text-sm
                                        font-bold
                                    "
                                >
                                    {post?.user?.first_name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "U"}
                                </div>
                            )}

                        </div>


                        <div className="min-w-0">

                            <div
                                className="
                                    truncate
                                    text-sm
                                    font-semibold
                                "
                            >
                                {post?.user?.first_name ||
                                    ""}{" "}
                                {post?.user?.last_name ||
                                    ""}
                            </div>


                            <div
                                className="
                                    mt-1
                                    flex
                                    items-center
                                    gap-2
                                    text-[11px]
                                    text-white/70
                                "
                            >

                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                        text-red-400
                                    "
                                >
                                    <span
                                        className="
                                            h-2
                                            w-2
                                            animate-pulse
                                            rounded-full
                                            bg-red-500
                                        "
                                    />

                                    LIVE
                                </span>

                                <span className="text-white/30">
                                    •
                                </span>


                                <span
                                    className="
                                        flex
                                        items-center
                                        gap-1
                                    "
                                >
                                    <Radio size={12} />

                                    {formatDuration(
                                        liveDuration
                                    )}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/*
                    |--------------------------------------------------------------------------
                    | Close button
                    |--------------------------------------------------------------------------
                    */}

                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowEndModal(true);
                        }}
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-black/40
                            border
                            border-white/10
                            backdrop-blur
                            transition
                            hover:bg-white/10
                        "
                    >
                        <X size={20} />
                    </button>

                </div>

            </div>


            {/*
            |--------------------------------------------------------------------------
            | Connecting overlay
            |--------------------------------------------------------------------------
            */}

            {connecting && (
                <div
                    className="
                        absolute
                        inset-0
                        z-40
                        flex
                        items-center
                        justify-center
                        bg-black/50
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            gap-4
                        "
                    >

                        <Loader2
                            size={42}
                            className="
                                animate-spin
                                text-white
                            "
                        />

                        <div
                            className="
                                text-sm
                                text-white/80
                            "
                        >
                            Connecting to live video
                        </div>

                    </div>

                </div>
            )}


            {/*
            |--------------------------------------------------------------------------
            | Connection error
            |--------------------------------------------------------------------------
            */}

            {connectionError &&
                !connected && (
                    <div
                        className="
                            absolute
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-black/80
                            p-6
                        "
                    >

                        <div
                            className="
                                w-full
                                max-w-sm
                                rounded-3xl
                                border
                                border-white/10
                                bg-neutral-900
                                p-6
                                text-center
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500/10
                                    text-red-500
                                "
                            >
                                <AlertCircle
                                    size={28}
                                />
                            </div>


                            <h3
                                className="
                                    mt-4
                                    text-lg
                                    font-bold
                                "
                            >
                                Unable to start live video
                            </h3>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    leading-6
                                    text-white/60
                                "
                            >
                                {connectionError}
                            </p>


                            <button
                                type="button"
                                onClick={() => {
                                    onEnded?.();
                                }}
                                className="
                                    mt-6
                                    w-full
                                    rounded-2xl
                                    bg-red-600
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-red-700
                                "
                            >
                                Close
                            </button>

                        </div>

                    </div>
                )}


            {/*
            |--------------------------------------------------------------------------
            | Bottom content
            |--------------------------------------------------------------------------
            */}

            <div
                className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    z-30
                    px-4
                    pb-6
                "
            >

                {/*
                |--------------------------------------------------------------------------
                | Post description
                |--------------------------------------------------------------------------
                */}

                {post?.content && (
                    <div
                        className="
                            mb-5
                            max-w-xl
                            text-sm
                            leading-6
                            text-white/90
                        "
                    >
                        {post.content}
                    </div>
                )}


                {/*
                |--------------------------------------------------------------------------
                | Controls
                |--------------------------------------------------------------------------
                */}

                <div
                    className={`
                        flex
                        items-center
                        justify-center
                        gap-3
                        transition-opacity
                        duration-300

                        ${
                            showControls
                                ? "opacity-100"
                                : "opacity-0"
                        }
                    `}
                >

                    {/*
                    |--------------------------------------------------------------------------
                    | Microphone
                    |--------------------------------------------------------------------------
                    */}

                    <button
                        type="button"
                        onClick={toggleMicrophone}
                        className={`
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/10
                            backdrop-blur
                            transition

                            ${
                                micEnabled
                                    ? "bg-white/15 hover:bg-white/25"
                                    : "bg-red-600 hover:bg-red-700"
                            }
                        `}
                    >
                        {micEnabled ? (
                            <Mic size={20} />
                        ) : (
                            <MicOff size={20} />
                        )}
                    </button>


                    {/*
                    |--------------------------------------------------------------------------
                    | Camera
                    |--------------------------------------------------------------------------
                    */}

                    <button
                        type="button"
                        onClick={toggleCamera}
                        className={`
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/10
                            backdrop-blur
                            transition

                            ${
                                cameraEnabled
                                    ? "bg-white/15 hover:bg-white/25"
                                    : "bg-red-600 hover:bg-red-700"
                            }
                        `}
                    >
                        {cameraEnabled ? (
                            <Video size={20} />
                        ) : (
                            <VideoOff size={20} />
                        )}
                    </button>


                    {/*
                    |--------------------------------------------------------------------------
                    | Flip camera
                    |--------------------------------------------------------------------------
                    */}

                    <button
                        type="button"
                        onClick={flipCamera}
                        disabled={
                            !cameraEnabled ||
                            !connected
                        }
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/10
                            bg-white/15
                            backdrop-blur
                            transition
                            hover:bg-white/25
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        <RotateCcw
                            size={20}
                        />
                    </button>


                    {/*
                    |--------------------------------------------------------------------------
                    | End live
                    |--------------------------------------------------------------------------
                    */}

                    <button
                        type="button"
                        onClick={() => {
                            setShowEndModal(true);
                        }}
                        className="
                            flex
                            h-12
                            items-center
                            gap-2
                            rounded-full
                            bg-red-600
                            px-5
                            text-sm
                            font-semibold
                            shadow-lg
                            shadow-black/30
                            transition
                            hover:bg-red-700
                        "
                    >
                        <Radio size={18} />

                        End Live
                    </button>

                </div>


                {/*
                |--------------------------------------------------------------------------
                | Safety message
                |--------------------------------------------------------------------------
                */}

                <div
                    className={`
                        mt-4
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-[11px]
                        text-white/50
                        transition-opacity
                        duration-300

                        ${
                            showControls
                                ? "opacity-100"
                                : "opacity-0"
                        }
                    `}
                >
                    <ShieldCheck size={13} />

                    Your live video is protected by
                    our community guidelines.
                </div>

            </div>


            {/*
            |--------------------------------------------------------------------------
            | End confirmation modal
            |--------------------------------------------------------------------------
            */}

            {showEndModal && (
                <div
                    className="
                        fixed
                        inset-0
                        z-[10000]
                        flex
                        items-center
                        justify-center
                        bg-black/70
                        p-5
                    "
                    onClick={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowEndModal(false);
                        }
                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-sm
                            rounded-3xl
                            border
                            border-white/10
                            bg-neutral-900
                            p-6
                            shadow-2xl
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-red-500/10
                                        text-red-500
                                    "
                                >
                                    <Radio size={24} />
                                </div>


                                <h3
                                    className="
                                        mt-4
                                        text-lg
                                        font-bold
                                    "
                                >
                                    End live video?
                                </h3>


                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-white/60
                                    "
                                >
                                    Your live video will
                                    end and viewers will
                                    no longer be able to
                                    watch it live.
                                </p>

                            </div>


                            <button
                                type="button"
                                disabled={ending}
                                onClick={() => {
                                    setShowEndModal(false);
                                }}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    flex-shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/5
                                    text-white/70
                                    hover:bg-white/10
                                "
                            >
                                <X size={18} />
                            </button>

                        </div>


                        {/*
                        |--------------------------------------------------------------------------
                        | Duration summary
                        |--------------------------------------------------------------------------
                        */}

                        <div
                            className="
                                mt-5
                                rounded-2xl
                                bg-white/5
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    text-sm
                                "
                            >

                                <span className="text-white/50">
                                    Live duration
                                </span>

                                <span className="font-semibold">
                                    {formatDuration(
                                        liveDuration
                                    )}
                                </span>

                            </div>

                        </div>
 
                        <div
                            className="
                                mt-6
                                grid
                                grid-cols-2
                                gap-3
                            "
                        >

                            <button
                                type="button"
                                disabled={ending}
                                onClick={() => {
                                    setShowEndModal(false);
                                }}
                                className="
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-white/10
                                    disabled:opacity-50
                                "
                            >
                                Continue Live
                            </button>


                            <button
                                type="button"
                                disabled={ending}
                                onClick={endLive}
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-red-600
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-red-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                {ending ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Ending
                                    </>
                                ) : (
                                    <>
                                        <Radio
                                            size={17}
                                        />

                                        End Live
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}