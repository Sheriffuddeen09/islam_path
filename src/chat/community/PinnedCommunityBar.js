import { useEffect, useState } from "react";
import api from "../../Api/axios";
import {
    Pin,
    X,
    Image as ImageIcon,
    Video,
    Loader2,
} from "lucide-react";

export function PinnedCommunityBar({
    communityMessages,
    onSelect,
    setMessages,
    isAdmin,
}) {
    const safeMessages = Array.isArray(communityMessages)
        ? communityMessages
        : [];

    const [showModal, setShowModal] = useState(false);
    const [loadingPinId, setLoadingPinId] = useState(null);
    const [videoDurations, setVideoDurations] = useState({});

    const pinned = safeMessages
        .filter((m) => m?.is_pinned)
        .sort((a, b) => Number(b.id) - Number(a.id));

    const lastPinned = pinned[0];

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const truncateText = (text, max = 20) => {
        if (!text) return "";

        const value = String(text);

        return value.length > max
            ? value.slice(0, max) + "..."
            : value;
    };

    const getUrl = (file) => {
        if (!file) return null;

        if (
            typeof file === "string" &&
            file.startsWith("blob:")
        ) {
            return file;
        }

        if (
            typeof file === "string" &&
            file.startsWith("http")
        ) {
            return file;
        }

        if (typeof file === "object") {
            if (
                file.file_url &&
                file.file_url.startsWith("blob:")
            ) {
                return file.file_url;
            }

            if (
                file.file_url &&
                file.file_url.startsWith("http")
            ) {
                return file.file_url;
            }

            if (file.file_url) {
                return `http://localhost:8000/storage/${file.file_url}`;
            }

            if (
                file.file &&
                file.file.startsWith("http")
            ) {
                return file.file;
            }

            if (
                file.file &&
                file.file.startsWith("blob:")
            ) {
                return file.file;
            }

            if (file.file) {
                return `http://localhost:8000/storage/${file.file}`;
            }
        }

        return null;
    };

    const getMessageUrl = (msg) => {
        if (!msg) return null;

        if (msg.file_url) {
            return getUrl(msg.file_url);
        }

        if (msg.file) {
            return getUrl(msg.file);
        }

        if (
            Array.isArray(msg.files) &&
            msg.files.length > 0
        ) {
            return getUrl(msg.files[0]);
        }

        return null;
    };

    const getMessageType = (msg) => {
        if (!msg) return null;

        const type = String(msg.type || "").toLowerCase();

        if (type === "image") return "image";

        if (
            type === "video" ||
            type === "video_message"
        ) {
            return "video";
        }

        if (type === "text") return "text";

        return null;
    };

    const getApprovedText = (msg) => {
        if (!msg) return "";

        if (
            Array.isArray(msg.approvals) &&
            msg.approvals.length > 0
        ) {
            const latestApproval =
                msg.approvals[msg.approvals.length - 1];

            return (
                latestApproval?.admin_response ||
                msg.message ||
                ""
            );
        }

        return msg.message || "";
    };

    const getPinnedPreview = (msg) => {
        if (!msg) return null;

        const type = getMessageType(msg);

        /*
        |--------------------------------------------------------------------------
        | TEXT
        |--------------------------------------------------------------------------
        */
        if (type === "text") {
            return (
                <span className="text-sm">
                    {truncateText(getApprovedText(msg), 175)}
                </span>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */
        if (type === "image") {
            return (
                <div className="flex items-center gap-2 min-w-0">
                    

                    <div className="flex items-center gap-1 min-w-0">
                        <ImageIcon
                            size={15}
                            className="shrink-0 text-blue-600"
                        />

                        <span className="text-sm truncate">
                            Image
                        </span>
                    </div>
                </div>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | VIDEO
        |--------------------------------------------------------------------------
        */
        if (type === "video") {
            const duration =
                videoDurations[msg.id] || 0;

            return (
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="
                            relative
                            w-16
                            h-10
                            rounded
                            overflow-hidden
                            bg-black
                            shrink-0
                        "
                    >
                        <video
                            src={getMessageUrl(msg)}
                            className="
                                w-full
                                h-full
                                object-cover
                            "
                            preload="metadata"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                                const value =
                                    e.currentTarget.duration;

                                if (
                                    Number.isFinite(value) &&
                                    value > 0
                                ) {
                                    setVideoDurations((prev) => ({
                                        ...prev,
                                        [msg.id]: value,
                                    }));
                                }
                            }}
                        />

                        <div
                            className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                            "
                        >
                            <div
                                className="
                                    w-6
                                    h-6
                                    rounded-full
                                    bg-black/60
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <Video size={13} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                            <Video
                                size={15}
                                className="shrink-0 text-blue-600"
                            />

                            <span className="text-sm">
                                Video
                            </span>
                        </div>

                        {duration > 0 && (
                            <span className="text-[11px] text-gray-500">
                                {formatDuration(duration)}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        /*
        |--------------------------------------------------------------------------
        | FALLBACK
        |--------------------------------------------------------------------------
        */
        return (
            <span className="text-sm">
                {truncateText(getApprovedText(msg), 175)}
            </span>
        );
    };

    const getTopBarPreview = (msg) => {
        if (!msg) return "";

        const type = getMessageType(msg);

        if (type === "image") {
            return "📷 Image";
        }

        if (type === "video") {
            const duration =
                videoDurations[msg.id] || 0;

            return duration > 0
                ? `🎥 Video • ${formatDuration(duration)}`
                : "🎥 Video";
        }

        return getApprovedText(msg);
    };

    const formatDuration = (seconds) => {
        if (!seconds || !Number.isFinite(Number(seconds))) {
            return "0:00";
        }

        const totalSeconds = Math.floor(Number(seconds));

        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;

        return `${minutes}:${String(remainingSeconds).padStart(
            2,
            "0"
        )}`;
    };

    /*
    |--------------------------------------------------------------------------
    | Pin / Unpin
    |--------------------------------------------------------------------------
    */

    const handlePin = async (msg) => {
        if (!msg || loadingPinId) return;

        setLoadingPinId(msg.id);

        try {
            if (msg.is_pinned) {
                await api.delete(
                    "/api/community/messages/pin",
                    {
                        data: {
                            message_id: msg.id,
                        },
                    }
                );
            } else {
                /*
                 * Normally community pinning should already be done
                 * through your duration menu. This fallback keeps the
                 * component safe if handlePin is called for an unpinned
                 * message.
                 */
                await api.put(
                    "/api/community/messages/pin",
                    {
                        message_id: msg.id,
                        days: 7,
                    }
                );
            }

            setMessages?.((prev) =>
                Array.isArray(prev)
                    ? prev.map((m) =>
                          m.id === msg.id
                              ? {
                                    ...m,
                                    is_pinned:
                                        !m.is_pinned,
                                    pin_expires_at:
                                        msg.is_pinned
                                            ? null
                                            : m.pin_expires_at,
                                }
                              : m
                      )
                    : prev
            );

            /*
             * If we unpinned the item currently displayed in the modal,
             * close the modal when it becomes empty.
             */
            if (msg.is_pinned && pinned.length <= 1) {
                setShowModal(false);
            }
        } catch (err) {
            console.error(
                "Community pin error:",
                err
            );
        } finally {
            setLoadingPinId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Bar click
    |--------------------------------------------------------------------------
    */

    const handleBarClick = () => {
        if (!lastPinned) return;

        /*
         * One pinned message:
         * directly select it.
         */
        if (pinned.length === 1) {
            onSelect?.(lastPinned);
            return;
        }

        /*
         * More than one:
         * show pinned modal.
         */
        setShowModal(true);
    };

    /*
    |--------------------------------------------------------------------------
    | No pinned messages
    |--------------------------------------------------------------------------
    */

    if (!pinned.length) {
        return null;
    }

    return (
        <>
            {/* ============================================================
                TOP PIN BAR
            ============================================================ */}
            <div
                onClick={handleBarClick}
                className="
                    sticky
                    top-0
                    z-20
                    bg-yellow-50
                    border-b-2
                    border-blue-800
                    px-3
                    py-1
                    cursor-pointer
                    text-black
                "
            >
                <div
                    className="
                        flex
                        justify-between
                        items-center
                        gap-3
                        text-xs
                        font-semibold
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            min-w-0
                            flex-1
                        "
                    >
                        <Pin
                            size={10}
                            className="
                                shrink-0
                                text-blue-700
                                fill-blue-700
                            "
                        />

                        <span className="truncate">
                            {truncateText(
                                getTopBarPreview(lastPinned),
                                75
                            )}
                        </span>

                        {pinned.length > 1 && (
                            <span
                                className="
                                    text-blue-600
                                    shrink-0
                                "
                            >
                                +{pinned.length - 1}
                            </span>
                        )}
                    </div>

                    {isAdmin && pinned.length ===
                        1 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();

                                handlePin(lastPinned);
                            }}
                            disabled={
                                loadingPinId === lastPinned.id
                            }
                            className="
                                shrink-0
                                bg-gray-700
                                text-white
                                px-2  
                                py-1
                                rounded
                                text-xs
                                hover:bg-gray-800
                                disabled:opacity-60
                            "
                        >
                            {loadingPinId ===
                            lastPinned.id ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin"
                                />
                            ) : (
                                "Unpin"
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* ============================================================
                MULTIPLE PINNED MESSAGES MODAL
            ============================================================ */}
           {showModal && pinned.length > 1 && (
    <div
        className="
            fixed
            inset-0
            z-50
            bg-black/50
            flex
            items-center
            justify-center
            p-4
        "
        onClick={() => {
            /*
             * Do not close the modal while an
             * unpin request is running.
             */
            if (loadingPinId !== null) {
                return;
            }

            setShowModal(false);
        }}
    >
        <div
            className="
                bg-white
                w-full
                max-w-lg
                max-h-[70vh]
                overflow-hidden
                rounded-xl
                text-black
                shadow-xl
            "
            onClick={(e) =>
                e.stopPropagation()
            }
        >
            {/* HEADER */}
            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    border-b
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >
                    <Pin
                        size={18}
                        className="
                            text-blue-700
                            fill-blue-700
                        "
                    />

                    <h2 className="font-bold">
                        Pinned Messages
                    </h2>

                    <span
                        className="
                            text-xs
                            bg-gray-100
                            px-2
                            py-1
                            rounded-full
                            text-gray-600
                        "
                    >
                        {pinned.length}
                    </span>
                </div>

                <button
                    type="button"
                    disabled={
                        loadingPinId !== null
                    }
                    onClick={() => {
                        if (
                            loadingPinId !== null
                        ) {
                            return;
                        }

                        setShowModal(false);
                    }}
                    className="
                        p-1
                        rounded
                        hover:bg-gray-100
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                    "
                >
                    <X size={20} />
                </button>
            </div>

            {/* PINNED LIST */}
            <div
                className="
                    p-3
                    overflow-y-auto
                    max-h-[calc(70vh-60px)]
                "
            >
                {pinned.map((msg) => {
                    const isLoading =
                        loadingPinId === msg.id;

                    return (
                        <div
                            key={msg.id}
                            className="
                                flex
                                items-center
                                gap-3
                                bg-gray-100
                                hover:bg-gray-200
                                p-2
                                mb-2
                                rounded-lg
                                cursor-pointer
                                transition
                            "
                            onClick={() => {
                                /*
                                 * Do not select/open another
                                 * message while unpinning.
                                 */
                                if (
                                    loadingPinId !==
                                    null
                                ) {
                                    return;
                                }

                                onSelect?.(msg);
                                setShowModal(false);
                            }}
                        >
                            {/* PREVIEW */}
                            <div className="flex-1 min-w-0">
                                {getPinnedPreview(msg)}
                            </div>

                            {/* UNPIN */}
                            {isAdmin && (
                                <button
                                    type="button"
                                    disabled={
                                        loadingPinId !==
                                            null
                                    }
                                    onClick={async (
                                        e
                                    ) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        /*
                                         * Prevent another
                                         * unpin request.
                                         */
                                        if (
                                            loadingPinId !==
                                            null
                                        ) {
                                            return;
                                        }

                                        /*
                                         * IMPORTANT:
                                         * Wait for the API
                                         * request to finish.
                                         */
                                        const success =
                                            await handlePin(
                                                msg
                                            );

                                        /*
                                         * ONLY close the
                                         * modal when the
                                         * unpin succeeded.
                                         */
                                        if (
                                            success ===
                                            true
                                        ) {
                                            setShowModal(
                                                false
                                            );
                                        }

                                        /*
                                         * If success is false,
                                         * the modal remains open.
                                         */
                                    }}
                                    className="
                                        shrink-0
                                        min-w-[58px]
                                        h-7
                                        flex
                                        items-center
                                        justify-center
                                        bg-red-500
                                        text-white
                                        text-xs
                                        font-semibold
                                        px-2
                                        py-1
                                        rounded
                                        hover:bg-red-600
                                        disabled:opacity-60
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {isLoading ? (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        "Unpin"
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
)}
        </>
    );
}