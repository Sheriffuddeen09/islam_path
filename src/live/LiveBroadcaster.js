import React, { useEffect, useRef, useState } from "react";
import { Room } from "livekit-client";

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

    /*
    |--------------------------------------------------------------------------
    | Recording
    |--------------------------------------------------------------------------
    */

    const recordingStartedRef = useRef(false);

    const [recording, setRecording] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Connection
    |--------------------------------------------------------------------------
    */

    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(true);
    const [cameraLoading, setCameraLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Ending
    |--------------------------------------------------------------------------
    */

    const [ending, setEnding] = useState(false);
    const [ended, setEnded] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Duration
    |--------------------------------------------------------------------------
    */

    const [liveDuration, setLiveDuration] = useState(0);

    /*
    |--------------------------------------------------------------------------
    | Camera / microphone
    |--------------------------------------------------------------------------
    */

    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);

    /*
    |--------------------------------------------------------------------------
    | Camera pause
    |--------------------------------------------------------------------------
    */

    const [videoPaused, setVideoPaused] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Camera position
    |--------------------------------------------------------------------------
    */

    const [cameraPosition, setCameraPosition] =
        useState("user");

    /*
    |--------------------------------------------------------------------------
    | Screen size
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Attach local camera track
    |--------------------------------------------------------------------------
    */

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
 

    const startRecording = async () => {
        if (
            !post?.id ||
            recordingStartedRef.current ||
            ended
        ) {
            return;
        }

        try {
            const response =
                await api.post(
                    `/api/live/${post.id}/record`
                );

            if (
                !response.data?.success
            ) {
                throw new Error(
                    response.data?.message ||
                    "Unable to start live recording."
                );
            }

            recordingStartedRef.current =
                true;

            setRecording(true);

            console.log(
                "Live recording started:",
                response.data
            );

        } catch (error) {
            console.error(
                "Live recording failed to start:",
                error?.response?.data ||
                    error
            );

            /*
             * We do NOT end the live session here.
             * The live can continue even if recording fails.
             */
            toast.error(
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Live recording could not be started."
            );
        }
    };

    

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

              

                room.on(
                    "disconnected",
                    () => {
                        if (!mounted) {
                            return;
                        }

                        setConnected(false);
                    }
                );
 

                room.on(
                    "localTrackPublished",
                    async () => {
                        if (!mounted) {
                            return;
                        }

                        await attachVideoTrack();
                    }
                );

                /*
                |--------------------------------------------------------------------------
                | Connect
                |--------------------------------------------------------------------------
                */

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
                | Publish audio + video
                |--------------------------------------------------------------------------
                */

                for (
                    const track of tracks
                ) {
                    await room.localParticipant
                        .publishTrack(track);
                }

                /*
                |--------------------------------------------------------------------------
                | Make sure microphone is enabled
                |--------------------------------------------------------------------------
                */

                await room.localParticipant
                    .setMicrophoneEnabled(
                        true
                    );

                /*
                |--------------------------------------------------------------------------
                | Make sure camera is enabled
                |--------------------------------------------------------------------------
                */

                await room.localParticipant
                    .setCameraEnabled(
                        true
                    );

                setMicEnabled(true);
                setCameraEnabled(true);
                setVideoPaused(false);

                /*
                |--------------------------------------------------------------------------
                | Attach camera preview
                |--------------------------------------------------------------------------
                */

                await attachVideoTrack();

                /*
                |--------------------------------------------------------------------------
                | Mark connected
                |--------------------------------------------------------------------------
                */

                setConnected(true);
                setConnecting(false);
                setCameraLoading(false);

                /*
                |--------------------------------------------------------------------------
                | IMPORTANT:
                | Start LiveKit Egress recording AFTER the
                | broadcaster has joined and published tracks.
                |--------------------------------------------------------------------------
                */

                if (
                    mounted &&
                    !recordingStartedRef.current
                ) {
                    await startRecording();
                }

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

            if (
                controlsTimerRef.current
            ) {
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

            if (
                videoRef.current
            ) {
                videoRef.current.srcObject =
                    null;
            }
        };

        // We intentionally only reconnect when the LiveKit
        // connection credentials change.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        (
                            Date.now() -
                            startedAt
                        ) / 1000
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
    | Cancel video
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
    | END LIVE
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

                /*
                |--------------------------------------------------------------------------
                | Tell Laravel to stop the live session.
                |
                | Laravel will stop LiveKit Egress using
                | live_egress_id.
                |--------------------------------------------------------------------------
                */

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
                setRecording(false);

                setShowEndModal(
                    false
                );

                /*
                |--------------------------------------------------------------------------
                | Stop local tracks AFTER the server
                | has received the end request.
                |--------------------------------------------------------------------------
                */

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

                /*
                |--------------------------------------------------------------------------
                | Parent can now update the post.
                |
                | IMPORTANT:
                | The recording may still be processing.
                | Your parent should poll for the Media record
                | or listen for LiveReplayReady.
                |--------------------------------------------------------------------------
                */

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

    /*
    |--------------------------------------------------------------------------
    | Avatar helpers
    |--------------------------------------------------------------------------
    */

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
        if (!value) {
            return "bg-gray-400";
        }

        const str =
            String(value);

        let hash = 0;

        for (
            let i = 0;
            i < str.length;
            i++
        ) {
            hash =
                str.charCodeAt(i) +
                ((hash << 5) - hash);
        }

        return colors[
            Math.abs(hash) %
                colors.length
        ];
    };

    const getInitial = (
        name
    ) => {
        if (!name) {
            return "?";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
       <div
            className="fixed inset-0 z-50 bg-black text-white overflow-hidden"
        > 

            {/* =====================================================
                CAMERA PREVIEW
            ===================================================== */}

            <div className="absolute inset-0 bg-black">

                {connectionError ? (
                    <div className="absolute inset-0 flex items-center justify-center p-6">

                        <div className="text-center max-w-sm">

                            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 flex items-center justify-center mb-4">

                                <AlertCircle
                                    size={32}
                                    className="text-red-500"
                                />

                            </div>

                            <h3 className="font-semibold text-lg">
                                Live connection failed
                            </h3>

                            <p className="text-sm text-white/60 mt-2">
                                {connectionError}
                            </p>

                        </div>

                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="
                                absolute
                                inset-0
                                w-full
                                h-full
                                object-cover
                            "
                        />

                        {cameraLoading &&
                            connected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">

                                    <Loader2
                                        size={42}
                                        className="animate-spin"
                                    />

                                </div>
                            )}

                        {!cameraEnabled &&
                            connected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black">

                                    <div className="text-center">

                                        <div
                                            className={`
                                                w-20
                                                h-20
                                                rounded-full
                                                mx-auto
                                                flex
                                                items-center
                                                justify-center
                                                ${getColor(
                                                    post?.user?.name ||
                                                    post?.user_id ||
                                                    post?.id
                                                )}
                                            `}
                                        >
                                            <span className="text-3xl font-semibold">
                                                {getInitial(
                                                    post?.user?.name ||
                                                    "User"
                                                )}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm text-white/60">
                                            Camera is off
                                        </p>

                                    </div>

                                </div>
                            )}

                        {videoPaused &&
                            connected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">

                                    <div className="text-center">

                                        <Pause
                                            size={40}
                                            className="mx-auto mb-3"
                                        />

                                        <p className="font-semibold">
                                            Video paused
                                        </p>

                                    </div>

                                </div>
                            )}
                    </>
                )}

            </div>

            {/* =====================================================
                TOP BAR
            ===================================================== */}

            <div className="absolute top-0 left-0 right-0 z-20 p-4">

                <div className="flex items-center justify-between">

                    {/* LIVE INDICATOR */}

                    <div className="flex items-center gap-2">

                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur">

                            <span className="relative flex h-3 w-3">

                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>

                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>

                            </span>

                            <span className="text-xs font-semibold">
                                LIVE
                            </span>

                        </div>

                        {/* RECORDING */}

                        {recording && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/50 backdrop-blur">

                                <Radio
                                    size={14}
                                    className="text-red-500"
                                />

                                <span className="text-xs">
                                    Recording
                                </span>

                            </div>
                        )}

                    </div>

                    {/* DURATION */}

                    <div className="px-3 py-2 rounded-full bg-black/50 backdrop-blur text-xs font-medium">

                        {formatDuration(
                            liveDuration
                        )}

                    </div>

                </div>

            </div>

            {/* =====================================================
                BOTTOM AREA
            ===================================================== */}

            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">

                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                <div className="mb-5 max-w-2xl mx-auto">

                    {!editingDescription ? (
                        <div className="flex items-start gap-3">

                            <div className="flex-1">

                                <p className="text-sm sm:text-base leading-relaxed text-white/90">
                                    {description ||
                                        "No description"}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={(
                                    e
                                ) => {
                                    e.stopPropagation();

                                    startEditingDescription();
                                }}
                                className="
                                    p-2
                                    rounded-full
                                    bg-white/10
                                    hover:bg-white/20
                                    transition
                                "
                                title="Edit description"
                            >
                                <Pencil
                                    size={16}
                                />
                            </button>

                        </div>
                    ) : (
                        <div className="flex items-end gap-2">

                            <div className="flex-1">

                                <textarea
                                    value={
                                        description
                                    }
                                    onChange={(
                                        e
                                    ) => {
                                        if (
                                            e.target
                                                .value
                                                .length <=
                                            700
                                        ) {
                                            setDescription(
                                                e.target
                                                    .value
                                            );
                                        }
                                    }}
                                    rows={3}
                                    maxLength={700}
                                    className="
                                        w-full
                                        resize-none
                                        rounded-xl
                                        bg-black/50
                                        border
                                        border-white/10
                                        px-4
                                        py-3
                                        text-sm
                                        text-white
                                        outline-none
                                        focus:border-white/30
                                    "
                                    placeholder="Write a description..."
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
                                onClick={(
                                    e
                                ) => {
                                    e.stopPropagation();

                                    saveDescription();
                                }}
                                className="
                                    p-2
                                    rounded-full
                                    bg-green-600
                                    hover:bg-green-700
                                    disabled:opacity-50
                                    transition
                                "
                                title="Save"
                            >
                                {savingDescription ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Check
                                        size={16}
                                    />
                                )}
                            </button>

                            <button
                                type="button"
                                disabled={
                                    savingDescription
                                }
                                onClick={(
                                    e
                                ) => {
                                    e.stopPropagation();

                                    cancelEditingDescription();
                                }}
                                className="
                                    p-2
                                    rounded-full
                                    bg-white/10
                                    hover:bg-white/20
                                    disabled:opacity-50
                                    transition
                                "
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
                            <Mic
                                size={21}
                            />
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
                            <Play
                                size={21}
                            />
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

                    {/* FRONT CAMERA */}

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

                    {/* BACK CAMERA */}

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

                    {/* END LIVE */}

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();

                            setShowEndModal(
                                true
                            );
                        }}
                        disabled={
                            ending ||
                            ended
                        }
                        className="
                            px-4
                            h-12
                            rounded-full
                            bg-red-600
                            hover:bg-red-700
                            disabled:opacity-50
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

            {/* =====================================================
                CONNECTING
            ===================================================== */}

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

            {/* =====================================================
                END MODAL
            ===================================================== */}

            {showEndModal && (
                <div
                    className="
                        absolute
                        inset-0
                        z-50
                        bg-black/70
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >

                    <div className="
                        w-full
                        max-w-sm
                        bg-[var(--bg-color,#fff)]
                        text-[var(--text-color,#000)]
                        rounded-2xl
                        p-6
                        shadow-2xl
                    ">

                        <h3 className="text-lg font-semibold text-center">
                            End live session?
                        </h3>

                        <p className="text-sm opacity-70 text-center mt-2">
                            Your live recording
                            will be processed
                            after the session
                            ends.
                        </p>

                        {recording && (
                            <div className="
                                mt-4
                                flex
                                items-center
                                justify-center
                                gap-2
                                text-xs
                                text-green-600
                            ">
                                <Radio
                                    size={14}
                                />

                                Recording is active
                            </div>
                        )}

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
                                            size={17}
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