import {
    useMemo,
    useState,
} from "react";

import api from "../../Api/axios";

import {
    Check,
    ChevronRight,
    Forward,
    Image as ImageIcon,
    Play,
    Radio,
    Send,
    X,
} from "lucide-react";

import toast from "react-hot-toast";


export function ForwardCommunityModal({
    users = [],
    groups = [],

    onClose,

    setSelectedMessage,

    loadingUsers = false,
    loadingGroups = false,

    setShowForwardModal,

    forwardMessages,

    setForwardSuccess,

    onReelAdded,
}) {

    const [search, setSearch] = useState("");

    const [selectedTargets, setSelectedTargets] =
        useState([]);

    const [sending, setSending] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Reel states
    |--------------------------------------------------------------------------
    */

    const [showReelReview, setShowReelReview] =
        useState(false);

    const [addingToReel, setAddingToReel] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Current media whose description is being edited
    |--------------------------------------------------------------------------
    */

    const [activeMediaId, setActiveMediaId] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | Description for each selected media message
    |
    | Example:
    |
    | {
    |    32: "Beautiful image",
    |    40: "My second video"
    | }
    |--------------------------------------------------------------------------
    */

    const [reelDescriptions, setReelDescriptions] =
        useState({});


    const isLoading =
        loadingUsers || loadingGroups;


    /*
    |--------------------------------------------------------------------------
    | TARGETS
    |--------------------------------------------------------------------------
    */

    const allTargets = useMemo(() => {

        const privateTargets = (users || [])
            .filter((chat) => chat?.type !== "group")
            .map((chat) => {

                const user =
                    chat?.other_user ||
                    chat?.other ||
                    chat?.user ||
                    (
                        chat?.teacher_id
                            ? chat?.teacher
                            : chat?.student_id
                                ? chat?.student
                                : null
                    );

                if (!user?.id) {
                    return null;
                }

                const firstName =
                    user?.first_name || "";

                const lastName =
                    user?.last_name || "";

                const fullName =
                    `${firstName} ${lastName}`.trim();

                return {
                    id: Number(user.id),
                    user_id: Number(user.id),
                    chat_id: Number(chat.id),
                    type: "user",
                    __type: "user",

                    name:
                        fullName ||
                        user?.name ||
                        user?.username ||
                        user?.email ||
                        "Unnamed User",

                    image:
                        user?.profile_image ||
                        user?.profile_photo ||
                        user?.avatar ||
                        user?.image ||
                        null,
                };
            })
            .filter(Boolean);


        const groupTargets = (groups || [])
            .map((group) => {

                const groupData =
                    group?.group ||
                    group?.chat_group ||
                    group;

                if (!groupData?.id) {
                    return null;
                }

                return {
                    id: Number(groupData.id),
                    type: "group",
                    __type: "group",

                    name:
                        groupData?.name ||
                        groupData?.group_name ||
                        "Unnamed Group",

                    image:
                        groupData?.image ||
                        groupData?.group_image ||
                        groupData?.avatar ||
                        null,
                };
            })
            .filter(Boolean);


        return [
            ...privateTargets,
            ...groupTargets,
        ];

    }, [
        users,
        groups,
    ]);


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const filteredTargets =
        useMemo(() => {

            const value =
                search
                    .toLowerCase()
                    .trim();

            return allTargets.filter(
                (item) =>
                    (item.name || "")
                        .toLowerCase()
                        .includes(value)
            );

        }, [
            allTargets,
            search,
        ]);


    /*
    |--------------------------------------------------------------------------
    | TARGET SELECT
    |--------------------------------------------------------------------------
    */

    const toggleTarget = (item) => {

        const key =
            `${item.__type}-${item.id}`;

        setSelectedTargets((prev) => {

            if (prev.includes(key)) {

                return prev.filter(
                    (target) =>
                        target !== key
                );
            }

            return [
                ...prev,
                key,
            ];
        });
    };


    /*
    |--------------------------------------------------------------------------
    | COLORS
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


    const getColor = (name = "") => {

        if (!name) {
            return colors[0];
        }

        const index =
            name.charCodeAt(0) %
            colors.length;

        return colors[index];
    };


    const getInitial = (name) => {

        if (!name) {
            return "?";
        }

        return name
            .charAt(0)
            .toUpperCase();
    };


    /*
    |--------------------------------------------------------------------------
    | MESSAGE PREVIEW
    |--------------------------------------------------------------------------
    */

    const getPreview = (msg) => {

        if (!msg) {
            return "";
        }

        if (
            msg.approvals?.length > 0
        ) {

            const latestApproval =
                msg.approvals[
                    msg.approvals.length - 1
                ];

            return (
                latestApproval?.admin_response ||
                msg.message ||
                ""
            );
        }


        if (
            msg.type === "text"
        ) {

            return msg.message || "";
        }


        if (
            [
                "image",
                "video",
                "audio",
                "file",
            ].includes(msg.type)
        ) {

            return msg.message
                ? `📎 ${msg.message}`
                : `📎 ${msg.type}`;
        }


        return `${msg.type} message`;
    };


    /*
    |--------------------------------------------------------------------------
    | MEDIA URL
    |--------------------------------------------------------------------------
    */

    const getFileUrl = (message) => {

        if (!message?.file) {
            return null;
        }

        return `http://localhost:8000/storage/${message.file}`;
    };


    /*
    |--------------------------------------------------------------------------
    | SELECTED MEDIA FOR REEL
    |--------------------------------------------------------------------------
    */

    const reelMediaMessages =
        useMemo(() => {

            return (forwardMessages || [])
                .filter(
                    (message) =>
                        message?.type === "image" ||
                        message?.type === "video"
                );

        }, [
            forwardMessages,
        ]);


    /*
    |--------------------------------------------------------------------------
    | OPEN REEL REVIEW
    |--------------------------------------------------------------------------
    */

    const handleOpenReelReview = () => {

        if (!forwardMessages?.length) {

            toast.error(
                "There is no message to add to your Reel."
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Set first image/video as active media
        |--------------------------------------------------------------------------
        */

        const firstMedia =
            reelMediaMessages[0];


        setActiveMediaId(
            firstMedia?.id || null
        );


        /*
        |--------------------------------------------------------------------------
        | Pre-fill descriptions with existing
        | message text.
        |
        | User can change them in the review modal.
        |--------------------------------------------------------------------------
        */

        const initialDescriptions = {};

        reelMediaMessages.forEach(
            (message) => {

                initialDescriptions[
                    message.id
                ] =
                    message?.message || "";
            }
        );


        setReelDescriptions(
            initialDescriptions
        );


        setShowReelReview(true);
    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE REEL REVIEW
    |--------------------------------------------------------------------------
    */

    const handleCloseReelReview = () => {

        if (addingToReel) {
            return;
        }

        setShowReelReview(false);

        setActiveMediaId(null);

        setReelDescriptions({});
    };


    /*
    |--------------------------------------------------------------------------
    | CHANGE DESCRIPTION
    |--------------------------------------------------------------------------
    */

    const handleDescriptionChange = (
        messageId,
        value
    ) => {

        setReelDescriptions((prev) => ({
            ...prev,
            [messageId]: value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | SEND REEL
    |--------------------------------------------------------------------------
    */

    const handleAddToReel = async () => {

        if (!forwardMessages?.length) {

            toast.error(
                "There is no message to add to your Reel."
            );

            return;
        }


        if (addingToReel) {
            return;
        }


        try {

            setAddingToReel(true);


            /*
            |--------------------------------------------------------------------------
            | Send descriptions using message ID
            |--------------------------------------------------------------------------
            */

            const mediaDescriptions = {};

            reelMediaMessages.forEach(
                (message) => {

                    mediaDescriptions[
                        message.id
                    ] =
                        reelDescriptions[
                            message.id
                        ] || "";
                }
            );


            const response =
                await api.post(
                    "/api/reels/from-community-messages",
                    {
                        message_ids:
                            forwardMessages.map(
                                (message) =>
                                    message.id
                            ),

                        media_descriptions:
                            mediaDescriptions,
                    }
                );


            const newReel =
                response.data?.post ||
                response.data?.reel ||
                response.data?.data;


            if (!newReel) {

                throw new Error(
                    "The Reel was created but no Reel data was returned."
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Immediately update parent Reel list
            |--------------------------------------------------------------------------
            */

            onReelAdded?.(
                newReel
            );


            /*
            |--------------------------------------------------------------------------
            | Close review
            |--------------------------------------------------------------------------
            */

            setShowReelReview(false);

            setActiveMediaId(null);

            setReelDescriptions({});


            /*
            |--------------------------------------------------------------------------
            | Close forward modal
            |--------------------------------------------------------------------------
            */

            setShowForwardModal?.(
                false
            );

            setSelectedMessage?.(
                null
            );


            toast.success(
                "Added to your Reel status."
            );

        } catch (error) {

            console.error(
                "ADD TO REEL ERROR:",
                error?.response?.data ||
                error
            );

            toast.error(
                error?.response?.data?.message ||
                "Unable to add this message to your Reel."
            );

        } finally {

            setAddingToReel(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | FORWARD COMMUNITY MESSAGES
    |--------------------------------------------------------------------------
    */

    const forwardCommunityMessages =
        async (
            receiverTargets
        ) => {

            try {

                setSending(true);


                const payload = {

                    message_ids:
                        forwardMessages.map(
                            (m) => m.id
                        ),

                    targets:
                        receiverTargets.map(
                            (target) => {

                                if (
                                    typeof target ===
                                    "object"
                                ) {

                                    return {
                                        id: Number(
                                            target.id
                                        ),

                                        type:
                                            target.type ||
                                            target.__type ||
                                            "group",
                                    };
                                }


                                const [
                                    type,
                                    id,
                                ] =
                                    String(
                                        target
                                    ).split("-");


                                return {
                                    id: Number(id),
                                    type,
                                };
                            }
                        ),
                };


                const res =
                    await api.post(
                        "/api/community/messages/forward",
                        payload
                    );


                setForwardSuccess?.({

                    chatId:
                        res.data.chat_id,

                    messageId:
                        res.data.message_id,

                    targetCount:
                        res.data.forwarded_count,
                });


                setShowForwardModal?.(
                    false
                );

                setSelectedMessage?.(
                    []
                );


                toast.success(
                    "Messages forwarded successfully"
                );

            } catch (err) {

                console.error(
                    err?.response?.data ||
                    err
                );

                toast.error(
                    err?.response?.data?.message ||
                    "Failed to forward messages"
                );

            } finally {

                setSending(false);
            }
        };


    const handleSend = async () => {

        if (
            !selectedTargets.length
        ) {
            return;
        }

        await forwardCommunityMessages(
            selectedTargets
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SKELETON
    |--------------------------------------------------------------------------
    */

    const SkeletonItem = () => (

        <div
            className="
                animate-pulse
                flex
                items-center
                justify-between
                p-3
                rounded-xl
                border
                border-gray-200
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
                        bg-gray-300
                    "
                />

                <div>

                    <div
                        className="
                            h-3
                            w-24
                            bg-gray-300
                            rounded
                            mb-2
                        "
                    />

                    <div
                        className="
                            h-2
                            w-16
                            bg-gray-200
                            rounded
                        "
                    />

                </div>

            </div>

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | ACTIVE REEL MEDIA
    |--------------------------------------------------------------------------
    */

    const activeMedia =
        reelMediaMessages.find(
            (message) =>
                Number(message.id) ===
                Number(activeMediaId)
        ) || null;


    return (

        <div
            className="
                fixed
                inset-0
                z-[999]
                bg-black/60
                backdrop-blur-sm
                flex
                items-center
                justify-center
                p-3
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    max-h-[98vh]
                    overflow-hidden
                    bg-white
                    text-black
                    rounded-2xl
                    shadow-2xl
                    flex
                    flex-col
                    relative
                "
            >

                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        px-4
                        py-2
                        border-b
                        border-gray-200
                    "
                >

                    <div>

                        <h2
                            className="
                                font-bold
                                text-lg
                            "
                        >
                            Forward
                        </h2>

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Share with chats or groups
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => {

                            if (showReelReview) {
                                handleCloseReelReview();
                                return;
                            }

                            onClose?.();

                            setSelectedMessage?.(
                                null
                            );
                        }}
                        className="
                            w-9
                            h-9
                            rounded-full
                            flex
                            items-center
                            justify-center
                            hover:bg-gray-100
                            transition
                        "
                    >

                        <X size={19} />

                    </button>

                </div>


                {/* =====================================================
                    ADD TO REEL
                ====================================================== */}

                <div className="px-4 pt-2">

                    <button
                        type="button"
                        disabled={
                            addingToReel ||
                            !forwardMessages?.length
                        }
                        onClick={
                            handleOpenReelReview
                        }
                        className="
                            group
                            w-full
                            text-left
                            rounded-2xl
                            overflow-hidden
                            bg-gradient-to-r
                            from-purple-600
                            via-pink-500
                            to-orange-400
                            p-[1px]
                            disabled:opacity-60
                            transition
                            hover:scale-[1.01]
                        "
                    >

                        <div
                            className="
                                rounded-2xl
                                bg-white
                                px-4
                                py-2
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    relative
                                    w-12
                                    h-12
                                    rounded-full
                                    bg-gradient-to-br
                                    from-purple-600
                                    via-pink-500
                                    to-orange-400
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    shrink-0
                                "
                            >

                                <Radio
                                    size={22}
                                />

                            </div>


                            <div
                                className="
                                    flex-1
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <p
                                        className="
                                            font-bold
                                            text-sm
                                        "
                                    >
                                        Add to your Reel status
                                    </p>

                                    <span
                                        className="
                                            text-[9px]
                                            font-bold
                                            uppercase
                                            px-1.5
                                            py-0.5
                                            rounded-full
                                            bg-pink-100
                                            text-pink-600
                                        "
                                    >
                                        Status
                                    </span>

                                </div>


                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    Review before sharing
                                </p>

                            </div>


                            <ChevronRight
                                size={20}
                                className="
                                    text-gray-400
                                    group-hover:text-pink-500
                                    transition
                                "
                            />

                        </div>

                    </button>

                </div>


                {/* =====================================================
                    MESSAGE PREVIEW
                ====================================================== */}

                <div
                    className="
                        mx-4
                        mt-3
                        p-3
                        rounded-xl
                        bg-gray-100
                        max-h-48
                        overflow-y-auto
                        scrollbar
                        scrollbar-thumb-gray-200
                        scrollbar-track-transparent
                        scrollbar-thin
                        space-y-2
                    "
                >

                    {forwardMessages.map(
                        (m) => {

                            const previewText =
                                getPreview(m);

                            const fileUrl =
                                getFileUrl(m);


                            return (

                                <div
                                    key={m.id}
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        bg-white
                                        rounded-xl
                                        p-2
                                        border
                                        border-gray-200
                                    "
                                >

                                    {m.type === "image" &&
                                        fileUrl && (

                                            <img
                                                src={fileUrl}
                                                alt=""
                                                className="
                                                    w-12
                                                    h-12
                                                    object-cover
                                                    rounded-lg
                                                    shrink-0
                                                "
                                            />

                                        )}


                                    {m.type === "video" &&
                                        fileUrl && (

                                            <div
                                                className="
                                                    relative
                                                    w-12
                                                    h-12
                                                    rounded-lg
                                                    overflow-hidden
                                                    bg-black
                                                    shrink-0
                                                "
                                            >

                                                <video
                                                    src={fileUrl}
                                                    className="
                                                        w-full
                                                        h-full
                                                        object-cover
                                                    "
                                                />

                                                <div
                                                    className="
                                                        absolute
                                                        inset-0
                                                        flex
                                                        items-center
                                                        justify-center
                                                        bg-black/20
                                                    "
                                                >

                                                    <Play
                                                        size={17}
                                                        className="text-white"
                                                        fill="white"
                                                    />

                                                </div>

                                            </div>

                                        )}


                                    {!fileUrl && (

                                        <div
                                            className="
                                                w-12
                                                h-12
                                                rounded-lg
                                                bg-gray-200
                                                flex
                                                items-center
                                                justify-center
                                                shrink-0
                                            "
                                        >

                                            {m.type === "text"
                                                ? "T"
                                                : "📎"
                                            }

                                        </div>

                                    )}


                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                text-[10px]
                                                font-semibold
                                                text-gray-500
                                                uppercase
                                            "
                                        >
                                            {m.type}
                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                text-gray-800
                                                break-words
                                                line-clamp-2
                                            "
                                        >
                                            {previewText}
                                        </p>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>


                {/* =====================================================
                    SEARCH
                ====================================================== */}

                <div className="px-4 pt-3">

                    <div className="relative">

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search users or groups..."
                            className="
                                w-full
                                border
                                border-gray-300
                                p-2
                                pr-10
                                rounded-xl
                                outline-none
                                focus:border-blue-500
                            "
                        />

                    </div>

                </div>


                {/* =====================================================
                    TARGETS
                ====================================================== */}

                <div
                    className="
                        px-4
                        py-3
                        flex-1
                        min-h-0
                        overflow-y-auto
                        scrollbar
                        scrollbar-thumb-gray-200
                        scrollbar-track-transparent
                        scrollbar-thin
                        space-y-2
                    "
                >

                    {isLoading &&
                        Array.from({
                            length: 6,
                        }).map((_, i) => (

                            <SkeletonItem
                                key={i}
                            />

                        ))}


                    {!isLoading &&
                        filteredTargets.map(
                            (item) => {

                                const key =
                                    `${item.__type}-${item.id}`;

                                const isSelected =
                                    selectedTargets.includes(
                                        key
                                    );


                                return (

                                    <button
                                        type="button"
                                        key={key}
                                        onClick={() =>
                                            toggleTarget(
                                                item
                                            )
                                        }
                                        className={`
                                            w-full
                                            flex
                                            items-center
                                            justify-between
                                            p-3
                                            rounded-xl
                                            border
                                            text-left
                                            transition
                                            ${
                                                isSelected
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            }
                                        `}
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                min-w-0
                                            "
                                        >

                                            <div
                                                className={`
                                                    w-11
                                                    h-11
                                                    rounded-full
                                                    flex
                                                    items-center
                                                    justify-center
                                                    font-bold
                                                    text-white
                                                    shrink-0
                                                    ${getColor(
                                                        item.name
                                                    )}
                                                `}
                                            >

                                                {getInitial(
                                                    item.name
                                                )}

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        font-semibold
                                                        truncate
                                                    "
                                                >
                                                    {item.name}
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-gray-500
                                                        capitalize
                                                    "
                                                >
                                                    {item.__type ===
                                                    "user"
                                                        ? "Chat"
                                                        : "Group"}
                                                </p>

                                            </div>

                                        </div>


                                        {isSelected && (

                                            <div
                                                className="
                                                    w-7
                                                    h-7
                                                    rounded-full
                                                    bg-green-500
                                                    text-white
                                                    flex
                                                    items-center
                                                    justify-center
                                                    shrink-0
                                                "
                                            >

                                                <Check
                                                    size={17}
                                                    strokeWidth={3}
                                                />

                                            </div>

                                        )}

                                    </button>

                                );
                            }
                        )}


                    {!isLoading &&
                        filteredTargets.length === 0 && (

                            <div
                                className="
                                    text-center
                                    py-8
                                    text-gray-500
                                "
                            >
                                No users or groups found
                            </div>

                        )}

                </div>


                {/* =====================================================
                    FORWARD BUTTON
                ====================================================== */}

                <div
                    className="
                        px-4
                        py-3
                        border-t
                        border-gray-200
                    "
                >

                    <button
                        type="button"
                        onClick={() => {

                            handleSend();

                            setSelectedMessage?.(
                                null
                            );
                        }}
                        disabled={
                            !selectedTargets.length ||
                            sending
                        }
                        className="
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            py-3
                            rounded-xl
                            font-semibold
                            disabled:bg-gray-300
                            disabled:text-gray-500
                            transition
                        "
                    >

                        {sending ? (

                            <>

                                <div
                                    className="
                                        w-4
                                        h-4
                                        border-2
                                        border-white
                                        border-t-transparent
                                        rounded-full
                                        animate-spin
                                    "
                                />

                                Forwarding

                            </>

                        ) : (

                            <>

                                <Forward
                                    size={18}
                                />

                                Forward

                                {selectedTargets.length
                                    ? ` (${selectedTargets.length})`
                                    : ""
                                }

                            </>

                        )}

                    </button>

                </div>


                {/* =====================================================
                    REEL REVIEW MODAL
                ====================================================== */}

                {showReelReview && (

                    <div
                        className="
                            absolute
                            inset-0
                            z-[20]
                            bg-white
                            rounded-2xl
                            flex
                            flex-col
                        "
                    >

                        {/* =================================================
                            REVIEW HEADER
                        ================================================== */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-4
                                py-3
                                border-b
                                border-gray-200
                                shrink-0
                            "
                        >

                            <div>

                                <h3
                                    className="
                                        font-bold
                                        text-base
                                    "
                                >
                                    Review your Reel
                                </h3>

                                <p
                                    className="
                                        text-xs
                                        text-gray-500
                                        mt-0.5
                                    "
                                >
                                    Add descriptions before sharing
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseReelReview
                                }
                                disabled={
                                    addingToReel
                                }
                                className="
                                    w-9
                                    h-9
                                    rounded-full
                                    flex
                                    items-center
                                    justify-center
                                    hover:bg-gray-100
                                "
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* =================================================
                            REEL PREVIEW AREA
                        ================================================== */}

                        <div
                            className="
                                flex-1
                                min-h-0
                                overflow-y-auto
                                scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                                px-4
                                py-4
                            "
                        >
                            {reelMediaMessages.length >
                                0 && (

                                <div
                                    className="
                                        mt-4
                                        flex
                                        gap-2
                                        overflow-x-auto
                                        pb-1
                                        scrollbar-thin
                                    "
                                >

                                    {reelMediaMessages.map(
                                        (message) => {

                                            const isActive =
                                                Number(
                                                    activeMediaId
                                                ) ===
                                                Number(
                                                    message.id
                                                );

                                            const url =
                                                getFileUrl(
                                                    message
                                                );


                                            return (

                                                <button
                                                    type="button"
                                                    key={message.id}
                                                    onClick={() =>
                                                        setActiveMediaId(
                                                            message.id
                                                        )
                                                    }
                                                    className={`
                                                        relative
                                                        w-16
                                                        h-16
                                                        rounded-xl
                                                        overflow-hidden
                                                        shrink-0
                                                        border-2
                                                        transition
                                                        ${
                                                            isActive
                                                                ? "border-pink-500 ring-2 ring-pink-100"
                                                                : "border-gray-200"
                                                        }
                                                    `}
                                                >

                                                    {message.type ===
                                                    "image" ? (

                                                        <img
                                                            src={url}
                                                            alt=""
                                                            className="
                                                                w-full
                                                                h-full
                                                                object-cover
                                                            "
                                                        />

                                                    ) : (

                                                        <div
                                                            className="
                                                                w-full
                                                                h-full
                                                                bg-black
                                                                relative
                                                            "
                                                        >

                                                            <video
                                                                src={url}
                                                                className="
                                                                    w-full
                                                                    h-full
                                                                    object-cover
                                                                "
                                                            />

                                                            <div
                                                                className="
                                                                    absolute
                                                                    inset-0
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    bg-black/20
                                                                "
                                                            >

                                                                <Play
                                                                    size={17}
                                                                    className="text-white"
                                                                    fill="white"
                                                                />

                                                            </div>

                                                        </div>

                                                    )}


                                                    {/* NUMBER */}

                                                    <span
                                                        className="
                                                            absolute
                                                            bottom-1
                                                            right-1
                                                            min-w-5
                                                            h-5
                                                            px-1
                                                            rounded-full
                                                            bg-black/70
                                                            text-white
                                                            text-[9px]
                                                            font-bold
                                                            flex
                                                            items-center
                                                            justify-center
                                                        "
                                                    >

                                                        {reelMediaMessages.findIndex(
                                                            (item) =>
                                                                item.id ===
                                                                message.id
                                                        ) + 1}

                                                    </span>

                                                </button>

                                            );
                                        }
                                    )}

                                </div>

                            )}

                            {activeMedia && (

                                <div
                                    className="
                                        w-full
                                        aspect-[9/14]
                                        max-h-[430px]
                                        rounded-2xl
                                        overflow-hidden
                                        bg-black
                                        relative
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    {activeMedia.type ===
                                        "image" ? (

                                        <img
                                            src={getFileUrl(
                                                activeMedia
                                            )}
                                            alt=""
                                            className="
                                                w-full
                                                h-full
                                                object-contain
                                            "
                                        />

                                    ) : (

                                        <video
                                            src={getFileUrl(
                                                activeMedia
                                            )}
                                            controls
                                            className="
                                                w-full
                                                h-full
                                                object-contain
                                            "
                                        />

                                    )}


                                    {/* MEDIA TYPE */}

                                    <div
                                        className="
                                            absolute
                                            top-3
                                            left-3
                                            px-2
                                            py-1
                                            rounded-full
                                            bg-black/60
                                            text-white
                                            text-[10px]
                                            uppercase
                                            font-bold
                                            flex
                                            items-center
                                            gap-1
                                        "
                                    >

                                        {activeMedia.type ===
                                        "image" ? (

                                            <ImageIcon
                                                size={12}
                                            />

                                        ) : (

                                            <Play
                                                size={12}
                                                fill="white"
                                            />

                                        )}

                                        {activeMedia.type}

                                    </div>

                                </div>

                            )}


                            {/* ==========================================
                                MEDIA SELECTOR
                            =========================================== */}



                            {/* ==========================================
                                ACTIVE MEDIA INFO
                            =========================================== */}

                            {activeMedia && (

                                <div
                                    className="
                                        mt-3
                                        text-xs
                                        text-gray-500
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span>
                                        Editing description
                                    </span>

                                    <span>
                                        {
                                            reelMediaMessages.findIndex(
                                                (item) =>
                                                    item.id ===
                                                    activeMedia.id
                                            ) + 1
                                        }{" "}
                                        /{" "}
                                        {
                                            reelMediaMessages.length
                                        }
                                    </span>

                                </div>

                            )}


                            {/* ==========================================
                                TEXT-ONLY MESSAGES
                            =========================================== */}

                            {reelMediaMessages.length === 0 && (

                                <div
                                    className="
                                        rounded-2xl
                                        bg-gray-50
                                        border
                                        border-gray-200
                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            w-12
                                            h-12
                                            rounded-full
                                            bg-gradient-to-br
                                            from-purple-500
                                            to-pink-500
                                            text-white
                                            flex
                                            items-center
                                            justify-center
                                            font-bold
                                            mx-auto
                                            mb-3
                                        "
                                    >
                                        T
                                    </div>

                                    <p
                                        className="
                                            text-center
                                            text-sm
                                            text-gray-700
                                            whitespace-pre-wrap
                                            break-words
                                        "
                                    >

                                        {forwardMessages
                                            ?.map(
                                                (message) =>
                                                    message.message
                                            )
                                            .filter(Boolean)
                                            .join("\n\n")
                                        }

                                    </p>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            DESCRIPTION COMPOSER
                        ================================================== */}

                        <div
                            className="
                                border-t
                                border-gray-200
                                px-3
                                py-3
                                shrink-0
                                bg-white
                            "
                        >

                            {activeMedia && (

                                <div
                                    className="
                                        flex
                                        items-end
                                        gap-2
                                    "
                                >

                                    {/* ================================
                                        INPUT
                                    ================================= */}

                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                            border
                                            border-gray-300
                                            rounded-2xl
                                            bg-gray-50
                                            px-3
                                            py-2
                                            focus-within:border-pink-500
                                            focus-within:ring-2
                                            focus-within:ring-pink-100
                                            transition
                                        "
                                    >

                                        <textarea
                                            value={
                                                reelDescriptions[
                                                    activeMedia.id
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                handleDescriptionChange(
                                                    activeMedia.id,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                activeMedia.type ===
                                                "image"
                                                    ? "Add a description for this image..."
                                                    : "Add a description for this video..."
                                            }
                                            maxLength={700}
                                            rows={2}
                                            className="
                                                w-full
                                                bg-transparent
                                                outline-none
                                                resize-none
                                                text-sm
                                                text-gray-800
                                                placeholder:text-gray-400
                                            "
                                        />


                                        <div
                                            className="
                                                text-[10px]
                                                text-gray-400
                                                text-right
                                            "
                                        >

                                            {
                                                (
                                                    reelDescriptions[
                                                        activeMedia.id
                                                    ] || ""
                                                ).length
                                            }
                                            /700

                                        </div>

                                    </div>


                                    {/* ================================
                                        SEND BUTTON
                                    ================================= */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleAddToReel
                                        }
                                        disabled={
                                            addingToReel
                                        }
                                        className="
                                            w-11
                                            h-11
                                            rounded-full
                                            shrink-0
                                            bg-gradient-to-r
                                            from-purple-600
                                            via-pink-500
                                            to-orange-400
                                            text-white
                                            flex
                                            items-center
                                            justify-center
                                            shadow-md
                                            hover:scale-105
                                            active:scale-95
                                            transition
                                            disabled:opacity-60
                                            disabled:hover:scale-100
                                        "
                                    >

                                        {addingToReel ? (

                                            <div
                                                className="
                                                    w-5
                                                    h-5
                                                    border-2
                                                    border-white
                                                    border-t-transparent
                                                    rounded-full
                                                    animate-spin
                                                "
                                            />

                                        ) : (

                                            <Send
                                                size={18}
                                                fill="white"
                                            />

                                        )}

                                    </button>

                                </div>

                            )}


                            {/* ==========================================
                                TEXT ONLY SEND BUTTON
                            =========================================== */}

                            {!activeMedia && (

                                <div
                                    className="
                                        flex
                                        justify-end
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handleAddToReel
                                        }
                                        disabled={
                                            addingToReel
                                        }
                                        className="
                                            w-11
                                            h-11
                                            rounded-full
                                            bg-gradient-to-r
                                            from-purple-600
                                            via-pink-500
                                            to-orange-400
                                            text-white
                                            flex
                                            items-center
                                            justify-center
                                            shadow-md
                                            hover:scale-105
                                            active:scale-95
                                            transition
                                            disabled:opacity-60
                                        "
                                    >

                                        {addingToReel ? (

                                            <div
                                                className="
                                                    w-5
                                                    h-5
                                                    border-2
                                                    border-white
                                                    border-t-transparent
                                                    rounded-full
                                                    animate-spin
                                                "
                                            />

                                        ) : (

                                            <Send
                                                size={18}
                                                fill="white"
                                            />

                                        )}

                                    </button>

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}