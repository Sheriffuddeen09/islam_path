import {
    Pin,
    X,
    Image as ImageIcon,
    Video,
    Music,
    FileText,
} from "lucide-react";

import api from "../../Api/axios";
import {
    useEffect,
    useRef,
    useState,
} from "react";


export function PinnedMessagesBar({
    messages = [],
    onSelect,
    setMessages,
    authUser,
}) {
    const [showModal, setShowModal] =
        useState(false);

    const [showPinDuration, setShowPinDuration] =
        useState(false);

    const [selectedMessage, setSelectedMessage] =
        useState(null);

    const [loadingPinId, setLoadingPinId] =
        useState(null);

    const [mediaDurations, setMediaDurations] =
        useState({});

    const [, setExpiryTick] = useState(0);

    const audioRefs = useRef({});
    const videoRefs = useRef({});

    /*
    |--------------------------------------------------------------------------
    | PINNED MESSAGES
    |--------------------------------------------------------------------------
    */

    const pinned = Array.isArray(messages)
        ? messages.filter((message) => {
              if (!message?.is_pinned) {
                  return false;
              }

              if (
                  message.pin_expires_at &&
                  new Date(
                      message.pin_expires_at
                  ).getTime() <= Date.now()
              ) {
                  return false;
              }

              return true;
          })
        : [];

    const lastPinned =
        pinned.length > 0
            ? pinned[pinned.length - 1]
            : null;

    const canUnpinLastPinned =
        !!lastPinned &&
        Number(lastPinned?.sender_id) ===
            Number(authUser?.id);

    /*
    |--------------------------------------------------------------------------
    | TEXT
    |--------------------------------------------------------------------------
    */

    const truncateText = (
        text,
        max = 20
    ) => {
        if (!text) {
            return "";
        }

        const value = String(text);

        return value.length > max
            ? value.slice(0, max) + "..."
            : value;
    };

    /*
    |--------------------------------------------------------------------------
    | DURATION
    |--------------------------------------------------------------------------
    */

    const formatDuration = (seconds) => {
        const sec = Number(seconds);

        if (
            !Number.isFinite(sec) ||
            sec <= 0
        ) {
            return "0:00";
        }

        const hours = Math.floor(
            sec / 3600
        );

        const mins = Math.floor(
            (sec % 3600) / 60
        );

        const secs = Math.floor(sec % 60);

        if (hours > 0) {
            return `${hours}:${mins
                .toString()
                .padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }

        return `${mins}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    /*
    |--------------------------------------------------------------------------
    | FILE URL
    |--------------------------------------------------------------------------
    */

    const getFileUrl = (file) => {
        if (!file) {
            return "";
        }

        const value =
            file?.file_url ||
            file?.file ||
            file?.url ||
            "";

        if (!value) {
            return "";
        }

        const url = String(value);

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        if (
            url.startsWith("/storage/")
        ) {
            return `${window.location.origin}${url}`;
        }

        if (
            url.startsWith("storage/")
        ) {
            return `${window.location.origin}/${url}`;
        }

        return `${window.location.origin}/storage/${url}`;
    };

    /*
    |--------------------------------------------------------------------------
    | MEDIA TYPE
    |--------------------------------------------------------------------------
    */

    const getMediaType = (
        file,
        fallbackMessage = null
    ) => {
        if (
            !file &&
            !fallbackMessage
        ) {
            return null;
        }

        const type = String(
            file?.type ||
                fallbackMessage?.type ||
                file?.mime_type ||
                fallbackMessage?.mime_type ||
                ""
        ).toLowerCase();

        if (
            type === "image" ||
            type.startsWith("image/")
        ) {
            return "image";
        }

        if (
            type === "video" ||
            type === "video_message" ||
            type.startsWith("video/")
        ) {
            return "video";
        }

        if (
            type === "audio" ||
            type === "voice" ||
            type === "voice_note" ||
            type.startsWith("audio/")
        ) {
            return "audio";
        }

        if (
            type === "file" ||
            type === "document" ||
            type === "pdf" ||
            type === "application/pdf" ||
            type.startsWith(
                "application/"
            )
        ) {
            return "document";
        }

        /*
         * Some APIs may not provide a type,
         * but the filename tells us what it is.
         */

        const fileName =
            file?.file_name ||
            file?.name ||
            fallbackMessage?.file_name ||
            "";

        const extension = String(
            fileName
        )
            .split(".")
            .pop()
            ?.toLowerCase();

        if (
            [
                "jpg",
                "jpeg",
                "png",
                "gif",
                "webp",
                "bmp",
                "svg",
            ].includes(extension)
        ) {
            return "image";
        }

        if (
            [
                "mp4",
                "webm",
                "mov",
                "avi",
                "mkv",
                "m4v",
            ].includes(extension)
        ) {
            return "video";
        }

        if (
            [
                "mp3",
                "wav",
                "ogg",
                "m4a",
                "aac",
                "flac",
                "webm",
            ].includes(extension)
        ) {
            return "audio";
        }

        if (fileName) {
            return "document";
        }

        return null;
    };

    /*
    |--------------------------------------------------------------------------
    | MESSAGE FILES
    |--------------------------------------------------------------------------
    */

    const getMessageFiles = (msg) => {
        if (!msg) {
            return [];
        }

        if (
            Array.isArray(msg.files) &&
            msg.files.length > 0
        ) {
            return msg.files;
        }

        if (
            msg.file ||
            msg.file_url ||
            msg.file_name
        ) {
            return [msg];
        }

        return [];
    };

    /*
    |--------------------------------------------------------------------------
    | FILE NAME
    |--------------------------------------------------------------------------
    */

    const getFileName = (
        file,
        msg = null
    ) => {
        return (
            file?.file_name ||
            file?.name ||
            file?.original_name ||
            file?.filename ||
            msg?.file_name ||
            msg?.name ||
            msg?.original_name ||
            ""
        );
    };

    /*
    |--------------------------------------------------------------------------
    | MEDIA SUMMARY
    |--------------------------------------------------------------------------
    */

    const getMediaSummary = (msg) => {
        const files =
            getMessageFiles(msg);

        if (!files.length) {
            return null;
        }

        const images =
            files.filter(
                (file) =>
                    getMediaType(
                        file,
                        msg
                    ) === "image"
            ).length;

        const videos =
            files.filter(
                (file) =>
                    getMediaType(
                        file,
                        msg
                    ) === "video"
            ).length;

        const audios =
            files.filter(
                (file) =>
                    getMediaType(
                        file,
                        msg
                    ) === "audio"
            ).length;

        const documents =
            files.filter(
                (file) =>
                    getMediaType(
                        file,
                        msg
                    ) === "document"
            ).length;

        return {
            total: files.length,
            images,
            videos,
            audios,
            documents,
        };
    };

    /*
    |--------------------------------------------------------------------------
    | STORED DURATION
    |--------------------------------------------------------------------------
    */

    const getStoredDuration = (
        file,
        msg = null
    ) => {
        const value =
            file?.duration ??
            file?.media_duration ??
            file?.audio_duration ??
            file?.video_duration ??
            msg?.duration ??
            msg?.media_duration ??
            msg?.audio_duration ??
            msg?.video_duration ??
            null;

        const duration =
            Number(value);

        return Number.isFinite(
            duration
        ) && duration > 0
            ? duration
            : 0;
    };

    /*
    |--------------------------------------------------------------------------
    | MEDIA DURATION KEY
    |--------------------------------------------------------------------------
    */

    const getDurationKey = (
        messageId,
        mediaIndex = 0
    ) => {
        return `${messageId}-${mediaIndex}`;
    };

    /*
    |--------------------------------------------------------------------------
    | MEDIA METADATA
    |--------------------------------------------------------------------------
    */

    const handleVideoMetadata = (
        durationKey
    ) => {
        const video =
            videoRefs.current[
                durationKey
            ];

        if (!video) {
            return;
        }

        const duration =
            Number(video.duration);

        if (
            Number.isFinite(duration) &&
            duration > 0
        ) {
            setMediaDurations(
                (prev) => {
                    if (
                        prev[durationKey] ===
                        duration
                    ) {
                        return prev;
                    }

                    return {
                        ...prev,
                        [durationKey]:
                            duration,
                    };
                }
            );
        }
    };

    const handleAudioMetadata = (
        durationKey
    ) => {
        const audio =
            audioRefs.current[
                durationKey
            ];

        if (!audio) {
            return;
        }

        const duration =
            Number(audio.duration);

        if (
            Number.isFinite(duration) &&
            duration > 0
        ) {
            setMediaDurations(
                (prev) => {
                    if (
                        prev[durationKey] ===
                        duration
                    ) {
                        return prev;
                    }

                    return {
                        ...prev,
                        [durationKey]:
                            duration,
                    };
                }
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | LOAD BACKEND DURATIONS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!pinned.length) {
            return;
        }

        setMediaDurations((prev) => {
            const next = {
                ...prev,
            };

            let changed = false;

            pinned.forEach((msg) => {
                const files =
                    getMessageFiles(msg);

                files.forEach(
                    (file, index) => {
                        const type =
                            getMediaType(
                                file,
                                msg
                            );

                        if (
                            type !==
                                "audio" &&
                            type !==
                                "video"
                        ) {
                            return;
                        }

                        const duration =
                            getStoredDuration(
                                file,
                                msg
                            );

                        if (
                            duration <= 0
                        ) {
                            return;
                        }

                        const key =
                            getDurationKey(
                                msg.id,
                                index
                            );

                        if (
                            next[key] !==
                            duration
                        ) {
                            next[key] =
                                duration;

                            changed = true;
                        }
                    }
                );
            });

            return changed
                ? next
                : prev;
        });
    }, [messages]);

    /*
    |--------------------------------------------------------------------------
    | CLEAN DURATION STATE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setMediaDurations(
            (prev) => {
                const validIds =
                    new Set(
                        messages.map(
                            (message) =>
                                Number(
                                    message.id
                                )
                        )
                    );

                const next = {};

                Object.keys(prev).forEach(
                    (key) => {
                        const messageId =
                            Number(
                                key.split(
                                    "-"
                                )[0]
                            );

                        if (
                            validIds.has(
                                messageId
                            )
                        ) {
                            next[key] =
                                prev[key];
                        }
                    }
                );

                return next;
            }
        );
    }, [messages]);

    /*
    |--------------------------------------------------------------------------
    | PIN EXPIRY TEXT
    |--------------------------------------------------------------------------
    */

    const getPinExpiryText = (
        expiresAt
    ) => {
        if (!expiresAt) {
            return "";
        }

        const expiry =
            new Date(expiresAt);

        if (
            Number.isNaN(
                expiry.getTime()
            )
        ) {
            return "";
        }

        const diff =
            expiry.getTime() -
            Date.now();

        if (diff <= 0) {
            return "Expired";
        }

        const hours = Math.ceil(
            diff /
                (1000 * 60 * 60)
        );

        if (hours < 24) {
            return `${hours}h left`;
        }

        const days = Math.ceil(
            hours / 24
        );

        return `${days}d left`;
    };

    /*
    |--------------------------------------------------------------------------
    | PIN PREVIEW
    |--------------------------------------------------------------------------
    */

    const getPinPreview = (msg) => {
        if (!msg) {
            return null;
        }

        const files =
            getMessageFiles(msg);

        const summary =
            getMediaSummary(msg);

        /*
        |--------------------------------------------------------------------------
        | GROUPED MEDIA
        |--------------------------------------------------------------------------
        */

        if (summary?.images > 1) {
            return (
                <>
                    📷 {summary.images} Images
                </>
            );
        }

        if (summary?.videos > 1) {
            return (
                <>
                    🎥 {summary.videos} Videos
                </>
            );
        }

        if (summary?.audios > 1) {
            return (
                <>
                    🎵 {summary.audios} Audios
                </>
            );
        }

        if (summary?.documents > 1) {
            return (
                <>
                    📎 {summary.documents} Documents
                </>
            );
        }

        if (
            summary &&
            summary.total > 1
        ) {
            const parts = [];

            if (summary.images > 0) {
                parts.push(
                    `📷 ${summary.images} ${
                        summary.images === 1
                            ? "Image"
                            : "Images"
                    }`
                );
            }

            if (summary.videos > 0) {
                parts.push(
                    `🎥 ${summary.videos} ${
                        summary.videos === 1
                            ? "Video"
                            : "Videos"
                    }`
                );
            }

            if (summary.audios > 0) {
                parts.push(
                    `🎵 ${summary.audios} ${
                        summary.audios === 1
                            ? "Audio"
                            : "Audios"
                    }`
                );
            }

            if (summary.documents > 0) {
                parts.push(
                    `📎 ${summary.documents} ${
                        summary.documents === 1
                            ? "Document"
                            : "Documents"
                    }`
                );
            }

            return parts.join(" • ");
        }

        /*
        |--------------------------------------------------------------------------
        | SINGLE FILE
        |--------------------------------------------------------------------------
        */

        const file =
            files[0];

        const mediaType =
            getMediaType(
                file,
                msg
            );

        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            mediaType === "image"
        ) {
            return "📷 Image";
        }

        /*
        |--------------------------------------------------------------------------
        | VIDEO
        |--------------------------------------------------------------------------
        */

        if (
            mediaType === "video"
        ) {
            const duration =
                mediaDurations[
                    getDurationKey(
                        msg.id,
                        0
                    )
                ] ||
                getStoredDuration(
                    file,
                    msg
                );

            return (
                <>
                    <span>
                        🎥 Video
                    </span>

                    {duration > 0 && (
                        <span className="ml-2 text-black n">
                            •{" "}
                            {formatDuration(
                                duration
                            )}
                        </span>
                    )}
                </>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | AUDIO
        |--------------------------------------------------------------------------
        */

        if (
            mediaType === "audio"
        ) {
            const duration =
                mediaDurations[
                    getDurationKey(
                        msg.id,
                        0
                    )
                ] ||
                getStoredDuration(
                    file,
                    msg
                );

            const type =
                String(
                    file?.type ||
                        msg.type ||
                        ""
                ).toLowerCase();

            const isVoice =
                type === "voice" ||
                type === "voice_note";

            return (
                <>
                    <span>
                        {isVoice
                            ? "🎙 Voice note"
                            : "🎵 Audio"}
                    </span>

                    {duration > 0 && (
                        <span className="ml-2 text-black/50">
                            •{" "}
                            {formatDuration(
                                duration
                            )}
                        </span>
                    )}
                </>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DOCUMENT
        |--------------------------------------------------------------------------
        */

        if (
            mediaType ===
            "document"
        ) {
            const fileName =
                getFileName(
                    file,
                    msg
                );

            return (
                <>
                    📎{" "}
                    {truncateText(
                        fileName ||
                            "Document"
                    )}
                </>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FALLBACK
        |--------------------------------------------------------------------------
        */

        const fileName =
            getFileName(
                file,
                msg
            );

        if (fileName) {
            return (
                <>
                    📎{" "}
                    {truncateText(
                        fileName
                    )}
                </>
            );
        }

        return truncateText(
            msg.message
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PIN / UNPIN
    |--------------------------------------------------------------------------
    */

    const handlePin = async (
        msg,
        days = 7
    ) => {
        if (!msg?.id) {
            return false;
        }

        if (
            loadingPinId !== null
        ) {
            return false;
        }

        const messageId =
            msg.id;

        setLoadingPinId(
            messageId
        );

        try {
            /*
            |--------------------------------------------------------------------------
            | UNPIN
            |--------------------------------------------------------------------------
            */

            if (msg.is_pinned) {
                await api.delete(
                    "/api/messages/pin",
                    {
                        data: {
                            message_id:
                                messageId,
                        },
                    }
                );

                setMessages((prev) =>
                    prev.map(
                        (message) =>
                            Number(
                                message.id
                            ) ===
                            Number(
                                messageId
                            )
                                ? {
                                      ...message,
                                      is_pinned:
                                          false,
                                      pin_expires_at:
                                          null,
                                  }
                                : message
                    )
                );

                return true;
            }

            /*
            |--------------------------------------------------------------------------
            | PIN
            |--------------------------------------------------------------------------
            */

            const res =
                await api.put(
                    "/api/messages/pin",
                    {
                        message_id:
                            messageId,
                        days:
                            Number(
                                days
                            ),
                    }
                );

            const updatedMessage =
                res?.data?.data;

            setMessages((prev) =>
                prev.map(
                    (message) =>
                        Number(
                            message.id
                        ) ===
                        Number(
                            messageId
                        )
                            ? {
                                  ...message,
                                  ...(updatedMessage ||
                                      {}),
                                  is_pinned:
                                      true,
                                  pin_expires_at:
                                      updatedMessage?.pin_expires_at ||
                                      null,
                              }
                            : message
                )
            );

            return true;
        } catch (error) {
            console.error(
                "Pin/unpin error:",
                error
            );

            return false;
        } finally {
            setLoadingPinId(
                null
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CONFIRM PIN
    |--------------------------------------------------------------------------
    */

    const confirmPin = async (
        days
    ) => {
        if (
            !selectedMessage ||
            loadingPinId !== null
        ) {
            return;
        }

        const success =
            await handlePin(
                selectedMessage,
                days
            );

        if (success) {
            setShowPinDuration(
                false
            );

            setSelectedMessage(
                null
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN PIN DURATION
    |--------------------------------------------------------------------------
    */

    const openPinDuration = (
        message
    ) => {
        if (!message?.id) {
            return;
        }

        if (
            loadingPinId !== null
        ) {
            return;
        }

        if (message.is_pinned) {
            handlePin(message);
            return;
        }

        setSelectedMessage(
            message
        );

        setShowPinDuration(
            true
        );
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING CHECK
    |--------------------------------------------------------------------------
    */

    const isLoading = (
        messageId
    ) => {
        return (
            loadingPinId !== null &&
            Number(
                loadingPinId
            ) ===
                Number(
                    messageId
                )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | EXPIRY TICK
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!pinned.length) {
            return;
        }

        const interval =
            setInterval(() => {
                setExpiryTick(
                    (value) =>
                        value + 1
                );
            }, 60 * 1000);

        return () =>
            clearInterval(
                interval
            );
    }, [pinned.length]);

    /*
    |--------------------------------------------------------------------------
    | REMOVE EXPIRED PINS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !Array.isArray(
                messages
            )
        ) {
            return;
        }

        const now =
            Date.now();

        const hasExpired =
            messages.some(
                (message) => {
                    if (
                        !message?.is_pinned ||
                        !message.pin_expires_at
                    ) {
                        return false;
                    }

                    const expiry =
                        new Date(
                            message.pin_expires_at
                        ).getTime();

                    return (
                        Number.isFinite(
                            expiry
                        ) &&
                        expiry <= now
                    );
                }
            );

        if (!hasExpired) {
            return;
        }

        setMessages((prev) =>
            prev.map(
                (message) => {
                    if (
                        !message?.is_pinned ||
                        !message.pin_expires_at
                    ) {
                        return message;
                    }

                    const expiry =
                        new Date(
                            message.pin_expires_at
                        ).getTime();

                    if (
                        Number.isFinite(
                            expiry
                        ) &&
                        expiry <=
                            Date.now()
                    ) {
                        return {
                            ...message,
                            is_pinned:
                                false,
                            pin_expires_at:
                                null,
                        };
                    }

                    return message;
                }
            )
        );
    }, [
        messages,
        setMessages,
    ]);

    /*
    |--------------------------------------------------------------------------
    | NOTHING PINNED
    |--------------------------------------------------------------------------
    */

    if (!pinned.length) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | MEDIA THAT NEEDS HTML METADATA
    |--------------------------------------------------------------------------
    */

    const durationMessages = [];

    pinned.forEach((msg) => {
        const files =
            getMessageFiles(msg);

        files.forEach(
            (file, index) => {
                const mediaType =
                    getMediaType(
                        file,
                        msg
                    );

                if (
                    mediaType !==
                        "audio" &&
                    mediaType !==
                        "video"
                ) {
                    return;
                }

                const backendDuration =
                    getStoredDuration(
                        file,
                        msg
                    );

                /*
                 * If backend already gave us
                 * duration, don't need a
                 * metadata loader.
                 */

                if (
                    backendDuration > 0
                ) {
                    return;
                }

                durationMessages.push({
                    ...file,
                    messageId:
                        msg.id,
                    mediaIndex:
                        index,
                    parentMessage:
                        msg,
                    mediaType,
                });
            }
        );
    });

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            {/* ================================================================
                HIDDEN AUDIO / VIDEO DURATION LOADERS
            ================================================================= */}

            <div
                className="
                    fixed
                    left-[-9999px]
                    top-[-9999px]
                    w-[1px]
                    h-[1px]
                    overflow-hidden
                    opacity-0
                    pointer-events-none
                "
                aria-hidden="true"
            >
                {durationMessages.map(
                    (item) => {
                        const {
                            messageId,
                            mediaIndex,
                            mediaType,
                        } = item;

                        const src =
                            getFileUrl(
                                item
                            );

                        if (!src) {
                            return null;
                        }

                        const durationKey =
                            getDurationKey(
                                messageId,
                                mediaIndex
                            );

                        /*
                        |--------------------------------------------------------------------------
                        | VIDEO
                        |--------------------------------------------------------------------------
                        */

                        if (
                            mediaType ===
                            "video"
                        ) {
                            return (
                                <video
                                    key={`duration-video-${durationKey}`}
                                    ref={(
                                        element
                                    ) => {
                                        if (
                                            element
                                        ) {
                                            videoRefs.current[
                                                durationKey
                                            ] =
                                                element;
                                        }
                                    }}
                                    src={src}
                                    preload="metadata"
                                    muted
                                    playsInline
                                    onLoadedMetadata={() =>
                                        handleVideoMetadata(
                                            durationKey
                                        )
                                    }
                                    onDurationChange={() =>
                                        handleVideoMetadata(
                                            durationKey
                                        )
                                    }
                                />
                            );
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | AUDIO
                        |--------------------------------------------------------------------------
                        */

                        return (
                            <audio
                                key={`duration-audio-${durationKey}`}
                                ref={(
                                    element
                                ) => {
                                    if (
                                        element
                                    ) {
                                        audioRefs.current[
                                            durationKey
                                        ] =
                                            element;
                                    }
                                }}
                                src={src}
                                preload="metadata"
                                onLoadedMetadata={() =>
                                    handleAudioMetadata(
                                        durationKey
                                    )
                                }
                                onDurationChange={() =>
                                    handleAudioMetadata(
                                        durationKey
                                    )
                                }
                            />
                        );
                    }
                )}
            </div>

            {/* ================================================================
                PINNED BAR
            ================================================================= */}

            <div
                onClick={() => {
                    if (
                        loadingPinId !==
                        null
                    ) {
                        return;
                    }

                    if (
                        pinned.length ===
                        1
                    ) {
                        onSelect?.(
                            lastPinned
                        );

                        return;
                    }

                    setShowModal(
                        true
                    );
                }}
                className="
                    sticky
                    top-0
                    z-20
                    bg-yellow-50
                    border-b-2
                    border-blue-800
                    px-3
                    py-1 w-full
                    cursor-pointer
                "
            >
                <div
                    className="
                        flex
                        justify-between
                        items-center
                        text-black
                        text-xs
                        font-semibold
                    "
                >
                    <div
                        className="
                            truncate
                            flex
                            items-center
                            gap-2
                            min-w-0
                        "
                    >
                        <span className="shrink-0">
                            📌
                        </span>

                        <div
                            className="
                                text-[12px]
                                text-black
                                shrink-0
                            "
                        >
                            {getPinExpiryText(
                                lastPinned?.pin_expires_at
                            )}
                        </div>

                        <div
                            className="
                                text-[12px]
                                text-black
                                truncate
                            "
                        >
                            {getPinPreview(
                                lastPinned
                            )}
                        </div>

                        {pinned.length >
                            1 && (
                            <span
                                className="
                                    text-blue-600
                                    shrink-0
                                "
                            >
                                +
                                {pinned.length -
                                    1}
                            </span>
                        )}
                    </div>

                    {pinned.length ===
                        1 &&
                        canUnpinLastPinned && (
                            <button
                                type="button"
                                disabled={isLoading(
                                    lastPinned?.id
                                )}
                                onClick={async (
                                    event
                                ) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    if (
                                        isLoading(
                                            lastPinned?.id
                                        )
                                    ) {
                                        return;
                                    }

                                    await handlePin(
                                        lastPinned
                                    );
                                }}
                                className="
                                    relative
                                    z-30
                                    shrink-0
                                    ml-2
                                    min-w-[62px]
                                    h-5
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    text-xs
                                    bg-gray-900
                                    px-3
                                    py-1.5
                                    rounded
                                    hover:bg-gray-800
                                    active:bg-gray-700
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {isLoading(
                                    lastPinned?.id
                                ) ? (
                                    <span
                                        className="
                                            animate-spin
                                            h-4 text-sm
                                            w-4
                                            border-2
                                            border-white
                                            border-t-transparent
                                            rounded-full
                                            inline-block
                                        "
                                    />
                                ) : (
                                    "Unpin"
                                )}
                            </button>
                        )}
                </div>
            </div>

            {/* ================================================================
                MULTIPLE PINNED MODAL
            ================================================================= */}

            {showModal && (
                <div
                    className="
                        fixed
                        inset-0
                        bg-black/80
                        backdrop-blur-sm
                        z-50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onClick={() => {
                        if (
                            loadingPinId !==
                            null
                        ) {
                            return;
                        }

                        setShowModal(
                            false
                        );
                    }}
                >
                    <div
                        className="
                            w-full
                            max-w-lg
                            max-h-[80vh]
                            overflow-hidden
                            rounded-2xl
                            bg-black
                            text-white
                            border
                            border-white/10
                            shadow-2xl
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-5
                                py-4
                                border-b
                                border-white/10
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >
                                <div
                                    className="
                                        w-10
                                        h-10
                                        rounded-full
                                        bg-white/10
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <Pin
                                        size={19}
                                        className="
                                            text-yellow-400
                                        "
                                    />
                                </div>

                                <div>
                                    <h2 className="font-bold text-base">
                                        Pinned Messages
                                    </h2>

                                    <p className="text-xs text-white">
                                        {
                                            pinned.length
                                        }{" "}
                                        pinned{" "}
                                        {pinned.length ===
                                        1
                                            ? "message"
                                            : "messages"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    loadingPinId !==
                                    null
                                }
                                onClick={() => {
                                    if (
                                        loadingPinId !==
                                        null
                                    ) {
                                        return;
                                    }

                                    setShowModal(
                                        false
                                    );
                                }}
                                className="
                                    w-9
                                    h-9
                                    rounded-full
                                    bg-white/5
                                    hover:bg-white/10
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* LIST */}

                        <div
                            className="
                                overflow-y-auto
                                max-h-[65vh]
                                p-3
                            "
                        >
                            {pinned.map(
                                (msg) => {
                                    const files =
                                        getMessageFiles(
                                            msg
                                        );

                                    const summary =
                                        getMediaSummary(
                                            msg
                                        );

                                    const mediaType =
                                        getMediaType(
                                            files[0],
                                            msg
                                        );

                                    const duration =
                                        mediaDurations[
                                            getDurationKey(
                                                msg.id,
                                                0
                                            )
                                        ] ||
                                        getStoredDuration(
                                            files[0],
                                            msg
                                        );

                                    const messageLoading =
                                        isLoading(
                                            msg.id
                                        );

                                    return (
                                        <div
                                            key={
                                                msg.id
                                            }
                                            className="
                                                group
                                                flex
                                                items-center
                                                gap-3
                                                p-3
                                                mb-2
                                                rounded-xl
                                                bg-white/[0.05]
                                                border
                                                border-white/[0.06]
                                                hover:bg-white/[0.09]
                                                transition
                                            "
                                            onClick={() => {
                                                if (
                                                    loadingPinId !==
                                                    null
                                                ) {
                                                    return;
                                                }

                                                onSelect?.(
                                                    msg
                                                );

                                                setShowModal(
                                                    false
                                                );
                                            }}
                                        >
                                            {/* ICON */}

                                            <div
                                                className="
                                                    shrink-0
                                                    w-11
                                                    h-11
                                                    rounded-xl
                                                    bg-white/10
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >
                                                {mediaType ===
                                                    "image" && (
                                                    <ImageIcon
                                                        size={
                                                            20
                                                        }
                                                        className="text-blue-400"
                                                    />
                                                )}

                                                {mediaType ===
                                                    "video" && (
                                                    <Video
                                                        size={
                                                            20
                                                        }
                                                        className="text-purple-400"
                                                    />
                                                )}

                                                {mediaType ===
                                                    "audio" && (
                                                    <Music
                                                        size={
                                                            20
                                                        }
                                                        className="text-green-400"
                                                    />
                                                )}

                                                {mediaType ===
                                                    "document" && (
                                                    <FileText
                                                        size={
                                                            20
                                                        }
                                                        className="text-orange-400"
                                                    />
                                                )}

                                                {!mediaType && (
                                                    <FileText
                                                        size={
                                                            20
                                                        }
                                                        className="text-white/60"
                                                    />
                                                )}
                                            </div>

                                            {/* CONTENT */}

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {getPinPreview(
                                                        msg
                                                    )}
                                                </div>

                                                {summary &&
                                                    summary.total >
                                                        1 && (
                                                        <div
                                                            className="
                                                                flex
                                                                flex-wrap
                                                                items-center
                                                                gap-2
                                                                mt-1
                                                                text-[11px]
                                                                text-white
                                                            "
                                                        >
                                                            <span>
                                                                {
                                                                    summary.total
                                                                }{" "}
                                                                files
                                                            </span>

                                                            {summary.images >
                                                                0 && (
                                                                <span>
                                                                    📷{" "}
                                                                    {
                                                                        summary.images
                                                                    }
                                                                </span>
                                                            )}

                                                            {summary.videos >
                                                                0 && (
                                                                <span>
                                                                    🎥{" "}
                                                                    {
                                                                        summary.videos
                                                                    }
                                                                </span>
                                                            )}

                                                            {summary.audios >
                                                                0 && (
                                                                <span>
                                                                    🎵{" "}
                                                                    {
                                                                        summary.audios
                                                                    }
                                                                </span>
                                                            )}

                                                            {summary.documents >
                                                                0 && (
                                                                <span>
                                                                    📎{" "}
                                                                    {
                                                                        summary.documents
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                {(
                                                    mediaType ===
                                                        "video" ||
                                                    mediaType ===
                                                        "audio"
                                                ) &&
                                                    summary?.total <=
                                                        1 &&
                                                    duration >
                                                        0 && (
                                                        <div
                                                            className="
                                                                mt-1
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-[11px]
                                                                text-white
                                                            "
                                                        >
                                                            {mediaType ===
                                                            "video" ? (
                                                                <Video
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                            ) : (
                                                                <Music
                                                                    size={
                                                                        12
                                                                    }
                                                                />
                                                            )}

                                                            <span>
                                                                {formatDuration(
                                                                    duration
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                <div
                                                    className="
                                                        mt-1
                                                        text-[10px]
                                                        text-white
                                                    "
                                                >
                                                    {getPinExpiryText(
                                                        msg.pin_expires_at
                                                    )}
                                                </div>
                                            </div>

                                            {/* UNPIN */}

                                            <button
                                                type="button"
                                                disabled={
                                                    loadingPinId !==
                                                    null
                                                }
                                                onClick={async (
                                                    event
                                                ) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();

                                                    if (
                                                        loadingPinId !==
                                                        null
                                                    ) {
                                                        return;
                                                    }

                                                    const success =
                                                        await handlePin(
                                                            msg
                                                        );

                                                    if (
                                                        success
                                                    ) {
                                                        setShowModal(
                                                            false
                                                        );
                                                    }
                                                }}
                                                className="
                                                    shrink-0
                                                    ml-2
                                                    min-w-[62px]
                                                    h-8
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-white
                                                    text-xs
                                                    bg-gray-900
                                                    px-2
                                                    py-1
                                                    rounded
                                                    hover:bg-gray-800
                                                    disabled:opacity-50
                                                    disabled:cursor-not-allowed
                                                "
                                            >
                                                {messageLoading ? (
                                                    <span
                                                        className="
                                                            animate-spin
                                                            h-4
                                                            w-4
                                                            border-2
                                                            border-white
                                                            border-t-transparent
                                                            rounded-full
                                                        "
                                                    />
                                                ) : (
                                                    "Unpin"
                                                )}
                                            </button>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================
                PIN DURATION MODAL
            ================================================================= */}

            {showPinDuration && (
                <div
                    className={`
                        fixed
                        inset-0
                        z-[100]
                        bg-black/80
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-4
                        ${
                            loadingPinId !==
                            null
                                ? "cursor-not-allowed"
                                : ""
                        }
                    `}
                    onMouseDown={(event) => {
                        if (
                            loadingPinId !==
                            null
                        ) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }}
                    onClick={(event) => {
                        if (
                            loadingPinId !==
                            null
                        ) {
                            event.preventDefault();
                            event.stopPropagation();
                            return;
                        }

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowPinDuration(
                                false
                            );

                            setSelectedMessage(
                                null
                            );
                        }
                    }}
                >
                    <div
                        className={`
                            w-full
                            max-w-sm
                            rounded-2xl
                            bg-black
                            text-white
                            border
                            border-white/10
                            shadow-2xl
                            overflow-hidden
                            ${
                                loadingPinId !==
                                null
                                    ? "pointer-events-none select-none"
                                    : ""
                            }
                        `}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* HEADER */}

                        <div
                            className="
                                px-5
                                py-4
                                border-b
                                border-white/10
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                        w-10
                                        h-10
                                        rounded-full
                                        bg-yellow-400/10
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <Pin
                                        size={18}
                                        className="text-yellow-400"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg">
                                        Pin message
                                    </h3>

                                    <p className="text-xs text-white">
                                        Choose how long
                                        this message
                                        stays pinned
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    loadingPinId !==
                                    null
                                }
                                onClick={() => {
                                    if (
                                        loadingPinId !==
                                        null
                                    ) {
                                        return;
                                    }

                                    setShowPinDuration(
                                        false
                                    );

                                    setSelectedMessage(
                                        null
                                    );
                                }}
                                className="
                                    w-8
                                    h-8
                                    rounded-full
                                    bg-white/5
                                    hover:bg-white/10
                                    flex
                                    items-center
                                    justify-center
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                "
                            >
                                <X size={17} />
                            </button>
                        </div>

                        {/* DURATION OPTIONS */}

                        <div
                            className="
                                p-4
                                space-y-2
                            "
                        >
                            {[7, 14, 30].map(
                                (days) => (
                                    <button
                                        key={
                                            days
                                        }
                                        type="button"
                                        disabled={
                                            loadingPinId !==
                                            null
                                        }
                                        onClick={() =>
                                            confirmPin(
                                                days
                                            )
                                        }
                                        className="
                                            w-full
                                            p-4
                                            rounded-xl
                                            bg-white/[0.05]
                                            hover:bg-white/[0.1]
                                            border
                                            border-white/10
                                            text-left
                                            transition
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        <div className="font-semibold">
                                            {days} days
                                        </div>

                                        <div className="text-xs text-white mt-1">
                                            Keep this
                                            message
                                            pinned for{" "}
                                            {days ===
                                            7
                                                ? "one week"
                                                : days ===
                                                  14
                                                ? "two weeks"
                                                : "one month"}
                                        </div>
                                    </button>
                                )
                            )}
                        </div>

                        {/* CANCEL */}

                        <div className="px-4 pb-4">
                            <button
                                type="button"
                                disabled={
                                    loadingPinId !==
                                    null
                                }
                                onClick={() => {
                                    if (
                                        loadingPinId !==
                                        null
                                    ) {
                                        return;
                                    }

                                    setShowPinDuration(
                                        false
                                    );

                                    setSelectedMessage(
                                        null
                                    );
                                }}
                                className="
                                    w-full
                                    py-3
                                    rounded-xl
                                    bg-white/5
                                    hover:bg-white/10
                                    text-sm
                                    text-white/60
                                    hover:text-white
                                    transition
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}