import { useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import {
    FaFacebook,
    FaWhatsapp,
    FaTwitter,
    FaTelegram,
} from "react-icons/fa";
import {
    MoreVertical,
    Loader2,
    X,
    Download,
    Save,
    Copy,
    Flag,
    Share2,
    User,
    Trash,
} from "lucide-react";
import { PostReportModal } from "../post/report/PostReportModal";
import { toast } from "react-toastify";

export default function MyReelOptionPreview({
    post,
    chats = [],
    open,
    setOpen,

    messageOpenShare,
    setMessageOpenShare,

    openReport,
    setOpenReport,

    currentItem = null,
    onReelDeleted
}) {


    const ownerId =
    currentItem?.user_id ??
    currentItem?.user?.id ??
    post?.user_id ??
    post?.user?.id ??
    null;

    const auth = useAuth();

    const authUser =
        auth?.user?.user ??
        auth?.user ??
        auth ??
        null;

    const currentUserId =
        authUser?.id ?? null;

    const isOwner =
        ownerId != null &&
        currentUserId != null &&
        Number(ownerId) === Number(currentUserId);


    const [loading, setLoading] = useState("");
    const [selectedChats, setSelectedChats] = useState([]);
    const [sending, setSending] = useState(false);
    const [copied, setCopied] = useState(false);
    
   const postId =
    currentItem?.reelId ??
    post?.id ??
    post?.post_id ??
    null;

const mediaId =
    currentItem?.type === "content"
        ? null
        : currentItem?.mediaId
            ? Number(currentItem.mediaId)
            : null;



    const closeOptions = () => {
        if (loading) {
            return;
        }

        setOpen(false);
    };

    const handleDownloadVideo = async () => {
        if (!mediaId) {
            toast.error("Video not found.");
            return;
        }

        try {
            setLoading("video");

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `/api/download/video/${mediaId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Download failed: ${response.status}`
                );
            }

            const blob =
                await response.blob();

            if (!blob.size) {
                throw new Error(
                    "Downloaded video is empty."
                );
            }

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `reel-video-${mediaId}.mp4`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success(
                "Video downloaded successfully."
            );

            setOpen(false);

        } catch (error) {
            console.error(
                "VIDEO DOWNLOAD ERROR:",
                error
            );

            toast.error(
                "Failed to download video."
            );

        } finally {
            setLoading("");
        }
    };


    const selectedPostId =
        Number(
            currentItem?.reelId ||
            post?.id ||
            0
        );

    const selectedMediaId =
        currentItem?.type === "content"
            ? null
            : Number(
                currentItem?.mediaId ||
                (
                    typeof currentItem?.id === "number"
                        ? currentItem.id
                        : 0
                ) ||
                0
            );


   

            const currentType =
                currentItem?.type ?? null;

            const isContent =
                currentType === "content";

            const isImage =
                currentType === "image";

            const isVideo =
                currentType === "video";

 const handleDownloadImage = async () => {

        if (!selectedMediaId) {

            toast.error(
                "No image selected."
            );

            return;
        }


        try {

            setLoading("image")


            const response =
                await api.get(
                    `/api/download/image/${selectedMediaId}`,
                    {
                        responseType: "blob",

                        onDownloadProgress:
                            (event) => {

                                if (
                                    !event.total
                                ) {
                                    return;
                                }


                                const percent =
                                    Math.round(
                                        (
                                            event.loaded *
                                            100
                                        ) /
                                        event.total
                                    );
                            },
                    }
                );


            const blob =
                new Blob([
                    response.data
                ]);


            const url =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href = url;


            const fileName =
                currentItem?.url
                    ?.split("/")
                    .pop()
                    ?.split("?")[0] ||
                `image-${selectedMediaId}.jpg`;


            link.download =
                fileName;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                url
            );


            toast.success(
                "Image downloaded successfully."
            );

            setOpen(false);

        } catch (error) {

            console.error(
                "IMAGE DOWNLOAD ERROR:",
                error
            );


            toast.error(
                "Failed to download image."
            );


        } finally {

            setLoading("");
        }
    };



    const handleSaveToLibrary = async () => {
        if (!postId) {
            toast.error(
                "Reel not found."
            );

            return;
        }

        try {

            setLoading("save");

            await api.post(
                `/api/post/${postId}/save-to-library`
            );

            toast.success(
                "Saved to your library."
            );

            setOpen(false);

        } catch (error) {

            console.error(error);

            toast.error(
                "Failed to save to library."
            );

        } finally {

            setLoading("");
        }
    };

   
    const handleCopyText = async () => {

        try {

            setLoading("copy");

            let text = "";


            if (
                currentItem?.type ===
                "content"
            ) {

                text =
                    currentItem?.content ||
                    post?.content ||
                    "";

            }

            /*
             * MEDIA DESCRIPTION
             */

            else if (
                currentItem?.description
            ) {

                text =
                    typeof currentItem.description ===
                    "string"
                        ? currentItem.description
                        : currentItem.description
                              ?.content || "";

            }

            /*
             * POST CONTENT
             */

            else if (
                post?.content
            ) {

                text = post.content;

            }

            /*
             * NOTHING TO COPY
             */

            if (!text.trim()) {

                toast.info(
                    "There is no text to copy."
                );

                return;
            }

            await navigator.clipboard.writeText(
                text
            );

            setCopied(true);

            toast.success(
                "Text copied successfully."
            );

            /*
             * Close only after successful copy
             */

            setOpen(false);

            setTimeout(() => {
                setCopied(false);
            }, 1500);

        } catch (error) {

            console.error(
                "COPY ERROR:",
                error
            );

            toast.error(
                "Failed to copy text."
            );

        } finally {

            setLoading("");
        }
    };


    const handleDeleteReel = async () => {

    if (!postId) {
        toast.error("Reel not found.");
        return;
    }

    if (!isOwner) {
        toast.error(
            "You can only delete your own reel."
        );
        return;
    }

    try {

        setLoading("delete");


        if (
            currentItem &&
            currentItem.type !== "content" &&
            currentItem.mediaId
        ) {

            await api.delete(
                `/api/reels/${postId}/media/${currentItem.mediaId}`
            );

            toast.success(
                "Media deleted successfully."
            );


            onReelDeleted?.({
                postId,
                mediaId: currentItem.mediaId,
            });

        }


        else if (
            currentItem?.type === "content"
        ) {

            await api.delete(
                `/api/reels/${postId}/content`
            );

            toast.success(
                "Content deleted successfully."
            );

            onReelDeleted?.({
                postId,
                content: true,
            });

        }


        else {

            await api.delete(
                `/api/reels/${postId}`
            );

            toast.success(
                "Reel deleted successfully."
            );

            onReelDeleted?.({
                postId,
                deletedReel: true,
            });
        }

        setOpen(false);

        setMessageOpenShare?.(false);
        setOpenReport?.(false);

    } catch (error) {

        console.error(
            "DELETE REEL ERROR:",
            error.response?.data || error
        );

        toast.error(
            error.response?.data?.message ||
            "Failed to delete reel."
        );

    } finally {

        setLoading("");
    }
};

   
       const shareToChat = async (chatId) => {

            if (!selectedPostId) {
                throw new Error("No reel selected.");
            }

            if (!currentItem) {
                throw new Error("No reel content selected.");
            }

            let type;
            let message = null;

            if (currentItem.type === "content") {

                type = "text";

                message =
                    currentItem.content?.trim() || null;

                if (!message) {
                    throw new Error(
                        "This reel has no text content."
                    );
                }
            }


            else if (currentItem.type === "image") {

                type = "image";

                message = null;

                if (!selectedMediaId) {
                    throw new Error(
                        "No image media selected."
                    );
                }
            }

            else if (currentItem.type === "video") {

                type = "video";

                message = null;

                if (!selectedMediaId) {
                    throw new Error(
                        "No video media selected."
                    );
                }
            }

            else {

                throw new Error(
                    "Unsupported reel type."
                );
            }

            const payload = {
                type,

                message,

                post_id: Number(
                    selectedPostId
                ),

                post_media_id:
                    selectedMediaId
                        ? Number(selectedMediaId)
                        : null,
            };

            console.log(
                "SHARING REEL:",
                payload
            );

            await api.post(
                `/api/chats/${chatId}/share-reel`,
                payload
            );
        };

            const handleSendToChats = async () => {

                    if (
                        sending ||
                        selectedChats.length === 0
                    ) {
                        return;
                    }

                    try {

                        setSending(true);

                        for (
                            const chatId of selectedChats
                        ) {

                            await shareToChat(
                                chatId
                            );
                        }

                        toast.success(
                            `Shared successfully to ${selectedChats.length} ${
                                selectedChats.length === 1
                                    ? "chat"
                                    : "chats"
                            }.`
                        );

                        setSelectedChats([]);

                        setMessageOpenShare(false);

                        setOpen(false);

                    } catch (error) {

                        console.error(
                            "CHAT SHARE ERROR:",
                            error
                        );

                        toast.error(
                            error.response?.data?.message ||
                            error.message ||
                            "Unable to share to one or more chats."
                        );

                    } finally {

                        setSending(false);
                    }
                };

    const handleReport = () => {

        if (!postId) {

            toast.error(
                "Reel not found."
            );

            return;
        }

        setOpenReport(true);
    };

    const handleViewProfile = () => {

        const userId =
            post?.user_id ??
            post?.user?.id ??
            currentItem?.user_id;

        if (!userId) {
            return;
        }

        window.location.href =
            `/profile/${userId}`;


            setOpen(false);
    };


    const copyableText =
        currentItem?.type === "content"
            ? currentItem?.content
            : currentItem?.description?.content ||
              post?.content ||
              "";

    const hasCopyableText =
        Boolean(
            copyableText?.trim()
        );



    return (
        <div
            className="
                inline-block
                relative
                z-[300]
            "
        >

            {/* =========================================================
                OPTION BUTTON
            ========================================================= */}

            <button
                type="button"
                onClick={() => {

                    if (loading) {
                        return;
                    }

                    setOpen(
                        !open
                    );
                }}
                className="
                    w-10
                    h-10
                    rounded-full
                    bg-black/50
                    text-white
                    flex
                    items-center
                    justify-center
                    hover:bg-black/70
                    transition
                    relative
                    z-[310]
                "
            >

                <MoreVertical
                    size={22}
                    strokeWidth={2}
                />

            </button>


            {/* =========================================================
                OPTIONS MODAL
            ========================================================= */}

            {open && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[250]
                        bg-black/70
                        flex
                        items-end
                        justify-center
                    "
                >

                    <div
                        className="
                            relative
                            w-full
                            sm:max-w-xl
                            bg-[var(--bg-color)]
                            text-[var(--text-color)]
                            rounded-t-2xl
                            p-4
                            max-h-[75vh]
                            overflow-y-auto
                            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                        "
                    >

                        {/* CLOSE */}

                        <button
                            type="button"
                            disabled={Boolean(
                                loading
                            )}
                            onClick={
                                closeOptions
                            }
                            className="
                                absolute
                                right-3
                                top-3
                                w-8
                                h-8
                                rounded-full
                                flex
                                items-center
                                justify-center
                                hover:text-white
                                hover:bg-gray-500/20
                            "
                        >

                            <X size={20} />

                        </button>


                        <div className="pt-6">

                            {/* =================================================
                                DOWNLOAD VIDEO
                            ================================================= */}

                            {(
                                currentItem?.type ===
                                    "video"
                            ) && (

                                <button
                                    type="button"
                                    disabled={
                                        Boolean(
                                            loading
                                        )
                                    }
                                    onClick={
                                        handleDownloadVideo
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        w-full
                                        px-3
                                        py-3
                                        rounded-lg
                                        hover:text-white
                                        hover:bg-gray-700
                                        hover:text-white
                                    "
                                >

                                    <Download
                                        size={20}
                                    />

                                    <span>

                                        {loading ===
                                        "video"
                                            ? "Downloading video..."
                                            : "Download Video"}

                                    </span>

                                </button>
                            )}

                            {(
                                currentItem?.type ===
                                    "image" 
                            ) && (

                                <button
                                    type="button"
                                    disabled={
                                        Boolean(
                                            loading
                                        )
                                    }
                                    onClick={
                                        handleDownloadImage
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        w-full
                                        px-3
                                        py-3
                                        rounded-lg
                                        hover:bg-gray-700
                                        hover:text-white
                                    "
                                >

                                    <Download
                                        size={20}
                                    />

                                    {loading ===
                                        "image"
                                            ? "Downloading Image..."
                                            : "Download Image"}

                                </button>
                            )}


                            <button
                                type="button"
                                disabled={
                                    Boolean(
                                        loading
                                    )
                                }
                                onClick={
                                    handleSaveToLibrary
                                }
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    w-full
                                    px-3
                                    py-3
                                    rounded-lg
                                    hover:bg-gray-700
                                    hover:text-white
                                "
                            >

                                <Save
                                    size={20}
                                />

                                <span>

                                    {loading ===
                                    "save"
                                        ? "Saving to Library"
                                        : "Save to Library"}

                                </span>

                            </button>

                            {hasCopyableText && (

                                <button
                                    type="button"
                                    disabled={
                                        Boolean(
                                            loading
                                        )
                                    }
                                    onClick={
                                        handleCopyText
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        w-full
                                        px-3
                                        py-3
                                        rounded-lg
                                        hover:bg-gray-700
                                        hover:text-white
                                    "
                                >

                                    <Copy
                                        size={20}
                                    />

                                    <span>

                                        {loading ===
                                        "copy"
                                            ? "Copying..."
                                            : copied
                                            ? "Copied!"
                                            : "Copy Text"}

                                    </span>

                                </button>
                            )}

                            {isOwner && (

                                <button
                                    type="button"
                                    disabled={
                                        Boolean(
                                            loading
                                        )
                                    }
                                    onClick={
                                        handleDeleteReel
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        w-full
                                        px-3
                                        py-3
                                        rounded-lg
                                        hover:bg-gray-700
                                        hover:text-white
                                    "
                                >

                                     <Trash
                                        size={20}
                                    />

                                    <span>

                                        {loading ===
                                        "delete"
                                            ? "Deleting..."
                                            : "Delete"}

                                    </span>

                                </button>
                            )}

                             {!isOwner && (

                                <button
                                    type="button"
                                    disabled={
                                        Boolean(
                                            loading
                                        )
                                    }
                                    onClick={
                                        handleReport
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        w-full
                                        px-3
                                        py-3
                                        rounded-lg
                                        hover:bg-gray-700
                                        hover:text-white
                                    "
                                >

                                    <Flag
                                        size={20}
                                    />

                                    <span>
                                        Report
                                    </span>

                                </button>
                            )}

                            <button
                                type="button"
                                disabled={
                                    Boolean(
                                        loading
                                    )
                                }
                                onClick={() =>
                                        setMessageOpenShare(true)
                                    }
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    w-full
                                    px-3
                                    py-3
                                    rounded-lg
                                    hover:bg-gray-700
                                    hover:text-white
                                "
                            >

                                <Share2
                                    size={20}
                                />

                                <span>
                                    Forward to
                                </span>

                            </button>

                         {!isOwner && (
                            <button
                                type="button"
                                disabled={
                                    Boolean(
                                        loading
                                    )
                                }
                                onClick={() => {

                                    setOpen(false);

                                    handleViewProfile();

                                }}
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    w-full
                                    px-3
                                    py-3
                                    rounded-lg
                                    hover:bg-gray-700
                                    hover:text-white
                                "
                            >

                                <User
                                    size={20}
                                />

                                <span>
                                    View Profile
                                </span>

                            </button>
                         )}
                        </div>

                    </div>

                </div>
            )} 


            {messageOpenShare && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[600]
                        bg-black/70
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-[var-(--bg-color)]
                            bg-[var-(--bg-color)]
                            rounded-xl
                            p-5
                            w-full
                            max-w-md
                            max-h-[80vh]
                            overflow-y-auto
                        "
                    >

                    <div className="flex flex-row justify-between items-center ">
                        <h2 className="font-bold text-sm">
                            Share to chat
                        </h2>

                        <button
                            type="button"
                             disabled={
                                sending
                            }
                            onClick={() =>
                                setMessageOpenShare(false)
                            }
                            className="
                                w-8
                                h-8
                                rounded-full
                                bg-gray-600
                                flex justify-center items-center
                                text-white
                                disabled:opacity-40
                            "
                        >
                            <X
                                size={18}
                            />
                        </button>

                        </div>

                            <p className="text-sm my-2">
                            {isContent &&
                                "Sharing text content"}

                            {isImage &&
                                `Sharing image ${selectedMediaId}`}

                            {isVideo &&
                                `Sharing video ${selectedMediaId}`}

                            </p>
                        {chats.map(
                            (chat) => {

                                const name =
                                    chat.other_user
                                        ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                                        : chat.teacher
                                        ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                                        : chat.student
                                        ? `${chat.student.first_name} ${chat.student.last_name}`
                                        : "Unknown User";

                                return (

                                    <div
                                        key={
                                            chat.id
                                        }
                                        className={`
                                            flex
                                            items-center
                                            gap-2
                                            p-2
                                            my-1
                                            rounded
                                            cursor-pointer
                                            ${
                                                selectedChats.includes(
                                                    chat.id
                                                )
                                                    ? "bg-blue-500 text-sm"
                                                    : "hover:border border-blue-500 text-sm"
                                            }
                                        `}
                                        onClick={() =>
                                            setSelectedChats(
                                                (prev) =>
                                                    prev.includes(
                                                        chat.id
                                                    )
                                                        ? prev.filter(
                                                            (
                                                                id
                                                            ) =>
                                                                id !==
                                                                chat.id
                                                        )
                                                        : [
                                                            ...prev,
                                                            chat.id,
                                                        ]
                                            )
                                        }
                                    >

                                        <input
                                            type="checkbox"
                                            className="p-2 cursor-pointer"
                                            checked={selectedChats.includes(
                                                chat.id
                                            )}
                                            readOnly
                                        />

                                        <span>
                                            {name}
                                        </span>

                                    </div>
                                );
                            }
                        )}


                        <button
                            type="button"
                            disabled={
                                sending ||
                                !selectedChats.length
                            }
                            onClick={
                                handleSendToChats
                            }
                            className="
                                mt-4
                                w-full
                                bg-blue-600
                                text-white
                                rounded
                                py-2
                                disabled:bg-gray-400
                            "
                        >

                            {sending
                                ? <p className='inline-flex gap-2 items-center'>
                                    <Loader2 className="animate-spin" />
                                Forwarding {selectedChats.length}</p> 
                                : `Forward (${selectedChats.length})`}

                        </button>


                        <button
                            type="button"
                            disabled={
                                sending
                            }
                            onClick={() =>
                                setMessageOpenShare(
                                    false
                                )
                            }
                            className="
                                mt-2
                                w-full
                                bg-gray-800
                                rounded
                                py-2
                            "
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}

            {openReport && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[700]
                        bg-black/70
                    "
                >

                    <PostReportModal
                        post={post}
                        onClose={() => {

                            setOpenReport(
                                false
                            );

                        }}
                    />

                </div>
            )}

        </div>
    );
}