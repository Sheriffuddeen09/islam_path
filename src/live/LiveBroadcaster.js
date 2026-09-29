import React, { useEffect, useRef, useState } from "react";
import {
    Room,
} from "livekit-client";

import api from "../Api/axios";
import { toast } from "react-hot-toast";

import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Pause,
    Play,
    Pencil,
    Check,
    X,
    Radio,
    Loader2,
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

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | cameraEnabled and videoPaused are independent.
    |--------------------------------------------------------------------------
    */

    const [videoPaused, setVideoPaused] = useState(false);

    const [cameraPosition, setCameraPosition] =
        useState("user");

     

    const [isLargeScreen, setIsLargeScreen] =
        useState(
            typeof window !== "undefined"
                ? window.innerWidth >= 1024
                : false
        );

    /*
    |--------------------------------------------------------------------------
    | Description
    |--------------------------------------------------------------------------
    */

    const [description, setDescription] = useState(
        post?.content || ""
    );

    const [originalDescription, setOriginalDescription] =
        useState(post?.content || "");

    const [editingDescription, setEditingDescription] =
        useState(false);

    const [savingDescription, setSavingDescription] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Detect screen size
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(
                window.innerWidth >= 1024
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        handleResize();

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Keep description synchronized
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const value = post?.content || "";

        setDescription(value);
        setOriginalDescription(value);
    }, [post?.id, post?.content]);
 

    const attachVideoTrack = async () => {
        const room = roomRef.current;

        if (
            !room ||
            !videoRef.current
        ) {
            return;
        }

        try {
            const publications =
                Array.from(
                    room.localParticipant
                        .videoTrackPublications
                        .values()
                );

            const publication =
                publications.find(
                    (pub) => pub?.track
                );

            const track =
                publication?.track;

            if (!track) {
                return;
            }

            try {
                track.detach(
                    videoRef.current
                );
            } catch (e) {}

            videoRef.current.srcObject =
                null;

            track.attach(
                videoRef.current
            );

            videoRef.current.muted =
                true;

            videoRef.current.playsInline =
                true;

            await videoRef.current
                .play()
                .catch(() => {});

            setCameraLoading(false);
        } catch (error) {
            console.error(
                "Failed to attach camera track:",
                error
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Connect LiveKit
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let mounted = true;

        const connectToRoom = async () => {
            if (
                !liveData?.token ||
                !liveData?.server_url
            ) {
                setConnectionError(
                    "Live connection information is missing."
                );

                setConnecting(false);

                return;
            }

            try {
                setConnecting(true);
                setConnectionError(null);

                const room = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                });

                roomRef.current = room;

                /*
                |--------------------------------------------------------------------------
                | Disconnected
                |--------------------------------------------------------------------------
                */

                room.on(
                    "disconnected",
                    () => {
                        if (!mounted) {
                            return;
                        }

                        setConnected(false);
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Local track published
                |--------------------------------------------------------------------------
                */

                room.on(
                    "localTrackPublished",
                    async () => {
                        if (!mounted) {
                            return;
                        }

                        await attachVideoTrack();
                    }
                );
 

                await room.connect(
                    liveData.server_url,
                    liveData.token
                );

                if (!mounted) {
                    room.disconnect();
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Create camera + microphone
                |--------------------------------------------------------------------------
                */

                const tracks =
                    await room.localParticipant
                        .createTracks({
                            audio: true,
                            video: true,
                        });

                if (!mounted) {
                    tracks.forEach(
                        (track) => {
                            try {
                                track.stop();
                            } catch (e) {}
                        }
                    );

                    room.disconnect();

                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Publish tracks
                |--------------------------------------------------------------------------
                */

                for (
                    const track of tracks
                ) {
                    await room.localParticipant
                        .publishTrack(track);
                }

                await room.localParticipant
                    .setMicrophoneEnabled(
                        true
                    );

                await room.localParticipant
                    .setCameraEnabled(
                        true
                    );

                setMicEnabled(true);
                setCameraEnabled(true);
                setVideoPaused(false);

                await attachVideoTrack();

                setConnected(true);
                setConnecting(false);
                setCameraLoading(false);
            } catch (error) {
                console.error(
                    "LiveKit connection failed:",
                    error
                );

                if (!mounted) {
                    return;
                }

                setConnectionError(
                    error?.message ||
                        "Unable to connect to the live session."
                );

                setConnecting(false);
            }
        };

        connectToRoom();

        return () => {
            mounted = false;

            if (controlsTimerRef.current) {
                clearTimeout(
                    controlsTimerRef.current
                );
            }

            const room =
                roomRef.current;

            if (room) {
                try {
                    room.localParticipant
                        .trackPublications
                        .forEach(
                            (publication) => {
                                try {
                                    publication
                                        .track
                                        ?.stop();
                                } catch (e) {}
                            }
                        );
                } catch (e) {}

                try {
                    room.disconnect();
                } catch (e) {}
            }

            roomRef.current = null;

            if (videoRef.current) {
                videoRef.current.srcObject =
                    null;
            }
        };
    }, [
        liveData?.token,
        liveData?.server_url,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Duration
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !connected ||
            ended
        ) {
            return;
        }

        const startedAt =
            post?.live_started_at
                ? new Date(
                      post.live_started_at
                  ).getTime()
                : Date.now();

        const updateDuration = () => {
            const seconds =
                Math.max(
                    0,
                    Math.floor(
                        (Date.now() -
                            startedAt) /
                            1000
                    )
                );

            setLiveDuration(
                seconds
            );
        };

        updateDuration();

        const interval =
            setInterval(
                updateDuration,
                1000
            );

        return () =>
            clearInterval(
                interval
            );
    }, [
        connected,
        ended,
        post?.live_started_at,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Format duration
    |--------------------------------------------------------------------------
    */

    const formatDuration = (
        seconds
    ) => {
        const hrs =
            Math.floor(
                seconds / 3600
            );

        const mins =
            Math.floor(
                (seconds % 3600) / 60
            );

        const secs =
            seconds % 60;

        if (hrs > 0) {
            return `${String(
                hrs
            ).padStart(
                2,
                "0"
            )}:${String(
                mins
            ).padStart(
                2,
                "0"
            )}:${String(
                secs
            ).padStart(
                2,
                "0"
            )}`;
        }

        return `${String(
            mins
        ).padStart(
            2,
            "0"
        )}:${String(
            secs
        ).padStart(
            2,
            "0"
        )}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Microphone
    |--------------------------------------------------------------------------
    */

    const toggleMicrophone =
        async () => {
            const room =
                roomRef.current;

            if (
                !room ||
                !connected
            ) {
                return;
            }

            try {
                const nextState =
                    !micEnabled;

                await room.localParticipant
                    .setMicrophoneEnabled(
                        nextState
                    );

                setMicEnabled(
                    nextState
                );

            
            } catch (error) {
                console.error(
                    "Microphone toggle failed:",
                    error
                );

                toast.error(
                    "Unable to change microphone."
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Camera ON / OFF
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | This does NOT change videoPaused.
    |--------------------------------------------------------------------------
    */

    const toggleCamera =
        async () => {
            const room =
                roomRef.current;

            if (
                !room ||
                !connected
            ) {
                return;
            }

            try {
                const nextState =
                    !cameraEnabled;

                await room.localParticipant
                    .setCameraEnabled(
                        nextState
                    );

                setCameraEnabled(
                    nextState
                );

                /*
                 * DO NOT change videoPaused here.
                 */

                if (nextState) {
                    setCameraLoading(
                        true
                    );

                    setTimeout(
                        async () => {
                            await attachVideoTrack();
                        },
                        150
                    );
                } else {
                    if (
                        videoRef.current
                    ) {
                        videoRef.current.srcObject =
                            null;
                    }

                    setCameraLoading(
                        false
                    );
                }

            
            } catch (error) {
                console.error(
                    "Camera toggle failed:",
                    error
                );

                toast.error(
                    "Unable to change camera."
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Pause / Resume VIDEO
    |--------------------------------------------------------------------------
    |
    | This is independent from cameraEnabled.
    |--------------------------------------------------------------------------
    */

    const togglePauseVideo =
        async () => {
            const room =
                roomRef.current;

            if (
                !room ||
                !connected
            ) {
                return;
            }

            try {
                const nextPaused =
                    !videoPaused;

                if (nextPaused) {
                    /*
                     * Stop broadcasting video,
                     * but DO NOT change cameraEnabled.
                     */

                    await room.localParticipant
                        .setCameraEnabled(
                            false
                        );

                    setVideoPaused(
                        true
                    );

                    if (
                        videoRef.current
                    ) {
                        videoRef.current.srcObject =
                            null;
                    }
                } else {
                    /*
                     * Only restore camera if the
                     * camera state is supposed to be ON.
                     */

                    setVideoPaused(
                        false
                    );

                    if (
                        cameraEnabled
                    ) {
                        await room.localParticipant
                            .setCameraEnabled(
                                true
                            );

                        setCameraLoading(
                            true
                        );

                        setTimeout(
                            async () => {
                                await attachVideoTrack();
                            },
                            200
                        );
                    }
                }

            
            } catch (error) {
                console.error(
                    "Pause/resume failed:",
                    error
                );

                toast.error(
                    "Unable to pause/resume video."
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Get cameras
    |--------------------------------------------------------------------------
    */

    const getCameras =
        async () => {
            try {
                const devices =
                    await navigator
                        .mediaDevices
                        .enumerateDevices();

                return devices.filter(
                    (device) =>
                        device.kind ===
                        "videoinput"
                );
            } catch (error) {
                console.error(
                    "Unable to get cameras:",
                    error
                );

                return [];
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Select camera
    |--------------------------------------------------------------------------
    */

    const selectCamera =
        async (
            position
        ) => {
            /*
             * Front/back controls are
             * disabled on large screens.
             */
            if (isLargeScreen) {
                return;
            }

            const room =
                roomRef.current;

            if (
                !room ||
                !connected ||
                videoPaused ||
                !cameraEnabled ||
                cameraLoading
            ) {
                return;
            }

            try {
                setCameraLoading(
                    true
                );

                const cameras =
                    await getCameras();

                if (!cameras.length) {
                    toast.error(
                        "No camera found."
                    );

                    setCameraLoading(
                        false
                    );

                    return;
                }

                let selectedCamera =
                    null;

                if (
                    position ===
                    "user"
                ) {
                    selectedCamera =
                        cameras.find(
                            (camera) => {
                                const label =
                                    camera.label?.toLowerCase() ||
                                    "";

                                return (
                                    label.includes(
                                        "front"
                                    ) ||
                                    label.includes(
                                        "user"
                                    ) ||
                                    label.includes(
                                        "facetime"
                                    )
                                );
                            }
                        );
                }

                if (
                    position ===
                    "environment"
                ) {
                    selectedCamera =
                        cameras.find(
                            (camera) => {
                                const label =
                                    camera.label?.toLowerCase() ||
                                    "";

                                return (
                                    label.includes(
                                        "back"
                                    ) ||
                                    label.includes(
                                        "rear"
                                    ) ||
                                    label.includes(
                                        "environment"
                                    )
                                );
                            }
                        );
                }

                /*
                 * If browser does not expose
                 * camera labels, use camera order.
                 */

                if (
                    !selectedCamera &&
                    cameras.length >= 2
                ) {
                    selectedCamera =
                        position ===
                        "user"
                            ? cameras[0]
                            : cameras[1];
                }

                if (
                    !selectedCamera
                ) {
                    toast.error(
                        position ===
                            "user"
                            ? "Front camera was not found."
                            : "Back camera was not found."
                    );

                    setCameraLoading(
                        false
                    );

                    return;
                }

                await room.localParticipant
                    .setCameraEnabled(
                        false
                    );

                await room.localParticipant
                    .setCameraEnabled(
                        true,
                        {
                            deviceId:
                                selectedCamera.deviceId,
                        }
                    );

                setCameraPosition(
                    position
                );

                setCameraEnabled(
                    true
                );

                setTimeout(
                    async () => {
                        await attachVideoTrack();
                        setCameraLoading(
                            false
                        );
                    },
                    250
                );

            
            } catch (error) {
                console.error(
                    "Camera switch failed:",
                    error
                );

                setCameraLoading(
                    false
                );

                toast.error(
                    "Unable to switch camera."
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | CANCEL VIDEO
    |--------------------------------------------------------------------------
    |
    | Clears the current camera video.
    |
    | IMPORTANT:
    | It does NOT change videoPaused.
    |--------------------------------------------------------------------------
    */

    const cancelVideo =
        async () => {
            const room =
                roomRef.current;

            if (
                !room ||
                !connected
            ) {
                return;
            }

            try {
                await room.localParticipant
                    .setCameraEnabled(
                        false
                    );

                setCameraEnabled(
                    false
                );

                /*
                 * DO NOT modify videoPaused.
                 */

                if (
                    videoRef.current
                ) {
                    videoRef.current.pause();
                    videoRef.current.srcObject =
                        null;
                }

                setCameraLoading(
                    false
                );

                toast.success(
                    "Video cleared."
                );

            
            } catch (error) {
                console.error(
                    "Cancel video failed:",
                    error
                );

                toast.error(
                    "Unable to clear video."
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | Description editing
    |--------------------------------------------------------------------------
    */

    const startEditingDescription =
        () => {
            setOriginalDescription(
                description
            );

            setEditingDescription(
                true
            );

        
        };

    const cancelEditingDescription =
        () => {
            setDescription(
                originalDescription
            );

            setEditingDescription(
                false
            );

        
        };

    const saveDescription =
        async () => {
            if (
                !post?.id ||
                savingDescription
            ) {
                return;
            }

            try {
                setSavingDescription(
                    true
                );

                const value =
                    description.trim();

                const response =
                    await api.patch(
                        `/api/live/${post.id}/description`,
                        {
                            content: value,
                        }
                    );

                const updatedPost =
                    response.data?.post;

                const updatedContent =
                    updatedPost?.content ??
                    value;

                setDescription(
                    updatedContent
                );

                setOriginalDescription(
                    updatedContent
                );

                setEditingDescription(
                    false
                );

                toast.success(
                    "Description updated."
                );

            
            } catch (error) {
                console.error(
                    "Description update failed:",
                    error
                );

                toast.error(
                    error?.response?.data
                        ?.message ||
                        "Unable to update description."
                );
            } finally {
                setSavingDescription(
                    false
                );
            }
        };

    /*
    |--------------------------------------------------------------------------
    | End live
    |--------------------------------------------------------------------------
    */

    const endLive =
        async () => {
            if (
                !post?.id ||
                ending
            ) {
                return;
            }

            try {
                setEnding(true);

                const response =
                    await api.post(
                        `/api/live/${post.id}/end`
                    );

                if (
                    !response.data?.success
                ) {
                    throw new Error(
                        response.data
                            ?.message ||
                            "Unable to end live."
                    );
                }

                setEnded(true);
                setConnected(false);
                setShowEndModal(
                    false
                );

                const room =
                    roomRef.current;

                if (room) {
                    try {
                        room.localParticipant
                            .trackPublications
                            .forEach(
                                (
                                    publication
                                ) => {
                                    try {
                                        publication
                                            .track
                                            ?.stop();
                                    } catch (
                                        e
                                    ) {}
                                }
                            );
                    } catch (e) {}

                    try {
                        room.disconnect();
                    } catch (e) {}
                }

                roomRef.current =
                    null;

                if (
                    videoRef.current
                ) {
                    videoRef.current.pause();
                    videoRef.current.srcObject =
                        null;
                }

                toast.success(
                    "Live session ended."
                );

                if (
                    typeof onEnded ===
                    "function"
                ) {
                    await onEnded(
                        response.data
                            ?.post
                    );
                }
            } catch (error) {
                console.error(
                    "End live failed:",
                    error
                );

                toast.error(
                    error?.response?.data
                        ?.message ||
                        "Unable to end live."
                );
            } finally {
                setEnding(false);
            }
        };

         const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-indigo-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-emerald-400",
        "bg-lime-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-fuchsia-400",
        "bg-violet-400",
        "bg-sky-400",
        "bg-slate-400",
        "bg-gray-400",
        "bg-zinc-400",
        "bg-stone-400",
        "bg-neutral-400",
        "bg-red-500",
        "bg-blue-500",
            ];



        const getColor = (value) => {
            if (!value) return "bg-gray-400";

            const str = String(value);

            let hash = 0;

            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }

            return colors[Math.abs(hash) % colors.length];
        };

        const getInitial = (name) => {
            if (!name) return "?";

            return name
                .trim()
                .charAt(0)
                .toUpperCase();
        };
    /*
    |--------------------------------------------------------------------------
    | Ended
    |--------------------------------------------------------------------------
    */

    if (ended) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Connection error
    |--------------------------------------------------------------------------
    */

    if (connectionError) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white">
                <div className="max-w-md px-6 text-center">
                    <AlertCircle
                        size={50}
                        className="mx-auto mb-4 text-red-400"
                    />

                    <h2 className="text-xl font-semibold mb-2">
                        Unable to start live
                    </h2>

                    <p className="text-white/70">
                        {connectionError}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black text-white overflow-hidden"
        > 
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    transition-opacity
                    duration-200
                    ${
                        cameraPosition ===
                        "user"
                            ? "scale-x-[-1]"
                            : ""
                    }
                    ${
                        videoPaused
                            ? "opacity-0"
                            : "opacity-100"
                    }
                `}
            />

            {/* =========================================================
                PAUSED OVERLAY
            ========================================================= */}

            {videoPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="text-center">
                        <Pause
                            size={55}
                            className="mx-auto mb-4 text-white/80"
                        />

                        <p className="text-lg font-semibold">
                            Video paused
                        </p>

                        <p className="text-sm text-white/60 mt-1">
                            Your microphone is still live
                        </p>
                    </div>
                </div>
            )}

            {/* =========================================================
                CAMERA LOADING
            ========================================================= */}

            {cameraLoading &&
                connected &&
                !videoPaused && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Loader2
                            size={38}
                            className="animate-spin text-white"
                        />
                    </div>
                )}

            {/* =========================================================
                TOP
            ========================================================= */}

            <div
                className={`
                    absolute
                    top-0
                    left-0
                    right-0
                    z-20
                    p-4
                    bg-gradient-to-b
                    from-black/70
                    to-transparent
                    transition-opacity
                    duration-300
                    
                `}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <div
                        className={`
                            w-10
                            h-10
                            rounded-full
                            flex
                            items-center
                            justify-center
                            border-2
                            border-white
                            text-white
                            font-semibold
                            text-sm
                            shrink-0
                            ${getColor(post?.user?.first_name)}
                        `}
                    >
                        {getInitial(post?.user?.first_name)}
                    </div>

                    <div>
                        <div className="font-semibold">
                            {post?.user?.first_name}{" "}
                            {post?.user?.last_name}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-red-400">
                                <Radio size={12} />
                                LIVE
                            </span>

                            <span className="text-white/70">
                                {formatDuration(liveDuration)}
                            </span>
                        </div>
                    </div>
                </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEndModal(
                                true
                            );
                        }}
                        className="w-10 h-10 rounded-full bg-black/50 hover:bg-red-600 flex items-center justify-center transition"
                    >
                        <X size={21} />
                    </button>
                </div>
            </div>

            {/* =========================================================
                BOTTOM
            ========================================================= */}

            <div
                className={`
                    absolute
                    bottom-0
                    left-0
                    right-0
                    z-20
                    p-4
                    sm:p-6
                    bg-gradient-to-t
                    from-black/90
                    via-black/50
                    to-transparent
                    transition-opacity
                    duration-300
                    
                `}
            >
                {/* =====================================================
                    DESCRIPTION
                ===================================================== */}

                <div className="max-w-xl mx-auto mb-5">
                    {!editingDescription ? (
                        <div className="flex items-start gap-2">
                            <div className="flex-1 text-sm sm:text-base leading-6 text-white/90">
                                {description ||
                                    "Add a description for your live"}
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingDescription();
                                }}
                                className="shrink-0 p-1.5 rounded-full hover:bg-white/10 transition"
                                title="Edit description"
                            >
                                <Pencil
                                    size={15}
                                />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-end gap-2">
                            <div className="relative flex-1">
                                <textarea
                                    autoFocus
                                    value={
                                        description
                                    }
                                    maxLength={
                                        700
                                    }
                                    rows={1}
                                    onChange={(
                                        e
                                    ) =>
                                        setDescription(
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    onClick={(
                                        e
                                    ) =>
                                        e.stopPropagation()
                                    }
                                    className="
                                        w-full
                                        resize-none
                                        bg-transparent
                                        border-0
                                        border-b
                                        border-white/60
                                        focus:border-white
                                        outline-none
                                        text-white
                                        placeholder:text-white/40
                                        text-sm
                                        sm:text-base
                                        py-1
                                        px-0
                                    "
                                    placeholder="Write a description"
                                />

                                <div className="text-[10px] text-white/50 mt-1">
                                    {
                                        description.length
                                    }
                                    /700
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    savingDescription
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    saveDescription();
                                }}
                                className="p-2 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 transition"
                                title="Save"
                            >
                                {savingDescription ? (
                                    <Loader2
                                        size={
                                            16
                                        }
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check
                                        size={
                                            16
                                        }
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    savingDescription
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEditingDescription();
                                }}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 transition"
                                title="Cancel"
                            >
                                <X
                                    size={16}
                                />
                            </button>
                        </div>
                    )}
                </div>

                {/* =====================================================
                    CONTROLS
                ===================================================== */}

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">

                    {/* MIC */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleMicrophone();
                        }}
                        className={`
                            w-12
                            h-12
                            rounded-full
                            flex
                            items-center
                            justify-center
                            transition
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
                            <Mic size={21} />
                        ) : (
                            <MicOff
                                size={21}
                            />
                        )}
                    </button>

                    {/* PAUSE VIDEO */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePauseVideo();
                        }}
                        className={`
                            w-12
                            h-12
                            rounded-full
                            flex
                            items-center
                            justify-center
                            transition
                            ${
                                videoPaused
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-white/15 hover:bg-white/25"
                            }
                        `}
                        title={
                            videoPaused
                                ? "Resume video"
                                : "Pause video"
                        }
                    >
                        {videoPaused ? (
                            <Play size={21} />
                        ) : (
                            <Pause
                                size={21}
                            />
                        )}
                    </button>

                    {/* CAMERA ON / OFF */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCamera();
                        }}
                        className={`
                            w-12
                            h-12
                            rounded-full
                            flex
                            items-center
                            justify-center
                            transition
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
                            <Video
                                size={21}
                            />
                        ) : (
                            <VideoOff
                                size={21}
                            />
                        )}
                    </button>

                    {/* =================================================
                        FRONT CAMERA
                        Disabled on large screen
                    ================================================= */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();

                            selectCamera(
                                "user"
                            );
                        }}
                        disabled={
                            isLargeScreen ||
                            !connected ||
                            videoPaused ||
                            !cameraEnabled ||
                            cameraLoading
                        }
                        className="
                            h-12
                            px-4
                            rounded-full
                            bg-white/15
                            hover:bg-white/25
                            disabled:opacity-40
                            flex
                            items-center
                            justify-center
                            transition
                            text-sm
                            font-medium
                        "
                        title="Front camera"
                    >
                        Front
                    </button>

                    {/* =================================================
                        BACK CAMERA
                        Disabled on large screen
                    ================================================= */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();

                            selectCamera(
                                "environment"
                            );
                        }}
                        disabled={
                            isLargeScreen ||
                            !connected ||
                            videoPaused ||
                            !cameraEnabled ||
                            cameraLoading
                        }
                        className="
                            h-12
                            px-4
                            rounded-full
                            bg-white/15
                            hover:bg-white/25
                            disabled:opacity-40
                            flex
                            items-center
                            justify-center
                            transition
                            text-sm
                            font-medium
                        "
                        title="Back camera"
                    >
                        Back
                    </button>

                   
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEndModal(
                                true
                            );
                        }}
                        className="
                            px-4
                            h-12
                            rounded-full
                            bg-red-600
                            hover:bg-red-700
                            font-semibold
                            text-sm
                            transition
                        "
                    >
                        End Live
                    </button>
                </div>

                {/* =====================================================
                    SAFETY
                ===================================================== */}

                <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-white/50">
                    <ShieldCheck
                        size={13}
                    />

                    Your live session is protected.
                </div>
            </div>

            {/* =========================================================
                CONNECTING
            ========================================================= */}

            {connecting && (
                <div className="absolute inset-0 z-40 bg-black/80 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2
                            size={42}
                            className="animate-spin mx-auto mb-4"
                        />

                        <p className="font-semibold">
                            Starting live
                        </p>

                        <p className="text-sm text-white/60 mt-1">
                            Connecting to LiveKit
                        </p>
                    </div>
                </div>
            )}

            {/* =========================================================
                END MODAL
            ========================================================= */}

            {showEndModal && (
                <div
                    className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <div className="w-full max-w-sm bg-[var(--bg-color,#fff)] text-[var(--text-color,#000)] rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-center">
                            End live session?
                        </h3>

                        <p className="text-sm opacity-70 text-center mt-2">
                            Your live recording
                            will be processed
                            after the session
                            ends.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                disabled={
                                    ending
                                }
                                onClick={() =>
                                    setShowEndModal(
                                        false
                                    )
                                }
                                className="
                                    flex-1
                                    py-3
                                    rounded-xl
                                    bg-black/10
                                    hover:bg-black/20
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    ending
                                }
                                onClick={
                                    endLive
                                }
                                className="
                                    flex-1
                                    py-3
                                    rounded-xl
                                    bg-red-600
                                    text-white
                                    hover:bg-red-700
                                    disabled:opacity-50
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >
                                {ending ? (
                                    <>
                                        <Loader2
                                            size={
                                                17
                                            }
                                            className="animate-spin"
                                        />
                                        Ending
                                    </>
                                ) : (
                                    "End Live"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}