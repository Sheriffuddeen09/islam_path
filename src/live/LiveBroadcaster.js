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

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [ending, setEnding] = useState(false);

    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [showEndModal, setShowEndModal] = useState(false);

    const [viewerCount, setViewerCount] = useState(
        post?.live_viewers_count || 0
    );

    const [cameraPosition, setCameraPosition] = useState("user");

    useEffect(() => {
        if (!liveData?.token || !liveData?.server_url) {
            return;
        }

        let mounted = true;

        const connectLive = async () => {
            try {
                setConnecting(true);

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                });

                roomRef.current = room;

                await room.connect(
                    liveData.server_url,
                    liveData.token,
                    {
                        autoSubscribe: true,
                    }
                );

                if (!mounted) {
                    await room.disconnect();
                    return;
                }

                setConnected(true);

                /*
                 * Create camera + microphone.
                 */
                const tracks =
                    await room.localParticipant.createTracks({
                        audio: true,
                        video: true,
                    });

                for (const track of tracks) {
                    if (!mounted) {
                        track.stop();
                        continue;
                    }

                    await room.localParticipant.publishTrack(track);

                    if (
                        track.kind === Track.Kind.Video &&
                        videoRef.current
                    ) {
                        track.attach(videoRef.current);
                    }
                }

                setConnecting(false);

            } catch (error) {
                console.error("Live connection error:", error);

                if (mounted) {
                    setConnecting(false);
                    setConnected(false);

                    toast.error(
                        "Unable to start your camera and microphone."
                    );
                }
            }
        };

        connectLive();

        return () => {
            mounted = false;

            const room = roomRef.current;

            if (room) {
                room.localParticipant.trackPublications.forEach(
                    (publication) => {
                        if (publication.track) {
                            publication.track.stop();
                        }
                    }
                );

                room.disconnect();

                roomRef.current = null;
            }
        };
    }, [liveData]);

    /*
     * Toggle microphone
     */
    const toggleMicrophone = async () => {
        const room = roomRef.current;

        if (!room || !connected) return;

        try {
            const nextState = !micEnabled;

            await room.localParticipant.setMicrophoneEnabled(
                nextState
            );

            setMicEnabled(nextState);
        } catch (error) {
            console.error("Microphone error:", error);

            toast.error(
                "Unable to change microphone."
            );
        }
    };

    /*
     * Toggle camera
     */
    const toggleCamera = async () => {
        const room = roomRef.current;

        if (!room || !connected) return;

        try {
            const nextState = !cameraEnabled;

            await room.localParticipant.setCameraEnabled(
                nextState
            );

            setCameraEnabled(nextState);
        } catch (error) {
            console.error("Camera error:", error);

            toast.error(
                "Unable to change camera."
            );
        }
    };

    /*
     * Flip camera
     *
     * This works mainly on devices that expose
     * front/back cameras.
     */
    const flipCamera = async () => {
        const room = roomRef.current;

        if (!room || !connected || !cameraEnabled) {
            return;
        }

        try {
            const nextPosition =
                cameraPosition === "user"
                    ? "environment"
                    : "user";

            const publication =
                Array.from(
                    room.localParticipant.videoTrackPublications.values()
                )[0];

            const track = publication?.track;

            if (!track) {
                return;
            }

            const devices =
                await navigator.mediaDevices.enumerateDevices();

            const cameras = devices.filter(
                (device) =>
                    device.kind === "videoinput"
            );

            if (cameras.length < 2) {
                toast.error(
                    "Your device does not have another camera."
                );

                return;
            }

            const currentDeviceId =
                track.mediaStreamTrack?.getSettings()
                    ?.deviceId;

            let nextCamera =
                cameras.find(
                    (camera) =>
                        camera.deviceId !==
                        currentDeviceId
                );

            if (!nextCamera) {
                nextCamera = cameras[0];
            }

            await room.localParticipant.setCameraEnabled(
                false
            );

            await room.localParticipant.setCameraEnabled(
                true,
                {
                    deviceId: nextCamera.deviceId,
                }
            );

            setCameraPosition(nextPosition);

        } catch (error) {
            console.error("Flip camera error:", error);

            toast.error(
                "Unable to switch camera."
            );
        }
    };

    /*
     * End live
     */
    const endLive = async () => {
        if (ending || !post?.id) return;

        try {
            setEnding(true);

            await api.post(
                `/api/live/${post.id}/end`
            );

            const room = roomRef.current;

            if (room) {
                room.localParticipant.trackPublications.forEach(
                    (publication) => {
                        if (publication.track) {
                            publication.track.stop();
                        }
                    }
                );

                await room.disconnect();

                roomRef.current = null;
            }

            setShowEndModal(false);
            setConnected(false);

            toast.success(
                "Live video ended."
            );

            onEnded?.();

        } catch (error) {
            console.error(
                "End live error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to end live video."
            );
        } finally {
            setEnding(false);
        }
    };

    /*
     * Get user name
     */
    const userName =
        post?.user?.first_name ||
        post?.user?.name ||
        "You";

    const userLastName =
        post?.user?.last_name || "";

    const fullName =
        `${userName} ${userLastName}`.trim();

    const profileImage =
        post?.user?.image || null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black text-white overflow-hidden">

            {/* =====================================================
                CAMERA PREVIEW
            ====================================================== */}

            <div className="absolute inset-0">

                {cameraEnabled ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="
                            h-full
                            w-full
                            object-cover
                            scale-x-[-1]
                        "
                    />
                ) : (
                    <div className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-neutral-950
                    ">
                        <div className="
                            flex
                            flex-col
                            items-center
                            gap-3
                            text-center
                        ">
                            <div className="
                                flex
                                h-20
                                w-20
                                items-center
                                justify-center
                                rounded-full
                                bg-white/10
                            ">
                                <VideoOff
                                    size={32}
                                    className="opacity-70"
                                />
                            </div>

                            <p className="text-sm opacity-70">
                                Camera is off
                            </p>
                        </div>
                    </div>
                )}

                {/* Dark cinematic overlay */}

                <div className="
                    absolute
                    inset-0
                    bg-gradient-to-b
                    from-black/50
                    via-transparent
                    to-black/80
                    pointer-events-none
                " />

            </div>


            {/* =====================================================
                TOP BAR
            ====================================================== */}

            <div className="
                absolute
                top-0
                left-0
                right-0
                z-20
                p-4
                sm:p-6
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                ">

                    {/* User */}

                    <div className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                    ">

                        <div className="
                            h-11
                            w-11
                            shrink-0
                            overflow-hidden
                            rounded-full
                            border
                            border-white/30
                            bg-white/10
                        ">

                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={fullName}
                                    className="
                                        h-full
                                        w-full
                                        object-cover
                                    "
                                />
                            ) : (
                                <div className="
                                    flex
                                    h-full
                                    w-full
                                    items-center
                                    justify-center
                                    text-sm
                                    font-bold
                                ">
                                    {fullName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                        </div>

                        <div className="min-w-0">

                            <p className="
                                truncate
                                text-sm
                                font-bold
                            ">
                                {fullName}
                            </p>

                            <div className="
                                mt-1
                                flex
                                items-center
                                gap-2
                            ">

                                <span className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    bg-red-600
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    uppercase
                                ">
                                    <span className="
                                        h-1.5
                                        w-1.5
                                        rounded-full
                                        bg-white
                                        animate-pulse
                                    " />

                                    LIVE
                                </span>

                                <span className="
                                    flex
                                    items-center
                                    gap-1
                                    text-[11px]
                                    opacity-80
                                ">
                                    <Users size={12} />

                                    {viewerCount}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* Connection status */}

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        <div className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            bg-black/40
                            px-3
                            py-2
                            backdrop-blur-md
                        ">

                            <span
                                className={`
                                    h-2
                                    w-2
                                    rounded-full
                                    ${
                                        connected
                                            ? "bg-green-500"
                                            : "bg-yellow-400 animate-pulse"
                                    }
                                `}
                            />

                            <span className="
                                text-[11px]
                                font-medium
                            ">
                                {connected
                                    ? "Connected"
                                    : "Connecting..."}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                CONNECTING SCREEN
            ====================================================== */}

            {connecting && (
                <div className="
                    absolute
                    inset-0
                    z-30
                    flex
                    items-center
                    justify-center
                    bg-black/50
                    backdrop-blur-sm
                ">

                    <div className="
                        flex
                        flex-col
                        items-center
                        text-center
                    ">

                        <div className="
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-red-600
                            shadow-lg
                            shadow-red-600/30
                        ">
                            <Loader2
                                size={28}
                                className="animate-spin"
                            />
                        </div>

                        <p className="
                            mt-4
                            text-base
                            font-semibold
                        ">
                            Starting your live video
                        </p>

                        <p className="
                            mt-1
                            text-xs
                            opacity-60
                        ">
                            Connecting camera and microphone...
                        </p>

                    </div>

                </div>
            )}


            {/* =====================================================
                DESCRIPTION
            ====================================================== */}

            {post?.content && (
                <div className="
                    absolute
                    bottom-32
                    left-4
                    right-4
                    z-10
                    sm:left-6
                    sm:right-6
                    sm:bottom-36
                ">

                    <div className="
                        max-w-xl
                        rounded-2xl
                        bg-black/35
                        p-4
                        backdrop-blur-md
                    ">

                        <p className="
                            text-sm
                            leading-6
                            text-white
                        ">
                            {post.content}
                        </p>

                    </div>

                </div>
            )}


            {/* =====================================================
                BOTTOM CONTROLS
            ====================================================== */}

            <div className="
                absolute
                bottom-0
                left-0
                right-0
                z-20
                p-4
                pb-6
                sm:p-6
            ">

                <div className="
                    mx-auto
                    flex
                    max-w-xl
                    flex-col
                    items-center
                ">

                    {/* Main controls */}

                    <div className="
                        flex
                        items-center
                        justify-center
                        gap-3
                        sm:gap-4
                    ">

                        {/* Microphone */}

                        <button
                            type="button"
                            onClick={toggleMicrophone}
                            disabled={!connected}
                            className={`
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                backdrop-blur-md
                                transition
                                active:scale-95
                                disabled:opacity-40
                                ${
                                    micEnabled
                                        ? "bg-white/15 hover:bg-white/25"
                                        : "bg-red-600 hover:bg-red-700"
                                }
                            `}
                            title={
                                micEnabled
                                    ? "Mute microphone"
                                    : "Unmute microphone"
                            }
                        >
                            {micEnabled ? (
                                <Mic size={20} />
                            ) : (
                                <MicOff size={20} />
                            )}
                        </button>


                        {/* Camera */}

                        <button
                            type="button"
                            onClick={toggleCamera}
                            disabled={!connected}
                            className={`
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                backdrop-blur-md
                                transition
                                active:scale-95
                                disabled:opacity-40
                                ${
                                    cameraEnabled
                                        ? "bg-white/15 hover:bg-white/25"
                                        : "bg-red-600 hover:bg-red-700"
                                }
                            `}
                            title={
                                cameraEnabled
                                    ? "Turn camera off"
                                    : "Turn camera on"
                            }
                        >
                            {cameraEnabled ? (
                                <Video size={20} />
                            ) : (
                                <VideoOff size={20} />
                            )}
                        </button>


                        {/* Flip */}

                        <button
                            type="button"
                            onClick={flipCamera}
                            disabled={
                                !connected ||
                                !cameraEnabled
                            }
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-white/15
                                backdrop-blur-md
                                transition
                                hover:bg-white/25
                                active:scale-95
                                disabled:opacity-40
                            "
                            title="Switch camera"
                        >
                            <RotateCcw size={20} />
                        </button>


                        {/* End */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowEndModal(true)
                            }
                            disabled={ending}
                            className="
                                flex
                                h-14
                                min-w-[120px]
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-red-600
                                px-5
                                font-bold
                                shadow-lg
                                shadow-red-600/30
                                transition
                                hover:bg-red-700
                                active:scale-95
                                disabled:opacity-50
                            "
                        >

                            <X size={19} />

                            <span>
                                End Live
                            </span>

                        </button>

                    </div>


                    {/* Safety */}

                    <div className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-center
                        text-[10px]
                        opacity-60
                    ">

                        <ShieldCheck size={13} />

                        <span>
                            Follow the community guidelines
                        </span>

                    </div>

                </div>

            </div>


            {/* =====================================================
                END CONFIRMATION MODAL
            ====================================================== */}

            {showEndModal && (
                <div className="
                    absolute
                    inset-0
                    z-[100]
                    flex
                    items-center
                    justify-center
                    bg-black/70
                    p-4
                    backdrop-blur-sm
                ">

                    <div className="
                        w-full
                        max-w-sm
                        rounded-3xl
                        border
                        border-white/10
                        bg-neutral-900
                        p-6
                        shadow-2xl
                    ">

                        <div className="
                            mx-auto
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-red-500/10
                            text-red-500
                        ">
                            <AlertCircle size={27} />
                        </div>

                        <h3 className="
                            mt-4
                            text-center
                            text-lg
                            font-bold
                        ">
                            End live video?
                        </h3>

                        <p className="
                            mt-2
                            text-center
                            text-sm
                            leading-6
                            text-white/60
                        ">
                            Your live video will end for everyone
                            watching. You can start another live
                            video later.
                        </p>

                        <div className="
                            mt-6
                            flex
                            gap-3
                        ">

                            <button
                                type="button"
                                disabled={ending}
                                onClick={() =>
                                    setShowEndModal(false)
                                }
                                className="
                                    flex-1
                                    rounded-2xl
                                    bg-white/10
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-white/15
                                    disabled:opacity-40
                                "
                            >
                                Continue Live
                            </button>

                            <button
                                type="button"
                                disabled={ending}
                                onClick={endLive}
                                className="
                                    flex-1
                                    rounded-2xl
                                    bg-red-600
                                    py-3
                                    text-sm
                                    font-semibold
                                    transition
                                    hover:bg-red-700
                                    disabled:opacity-50
                                "
                            >
                                {ending
                                    ? "Ending..."
                                    : "End Live"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}