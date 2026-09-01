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
    MessageCircle,
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

export default function ReelOptionPreview({
    post,
    chats = [],
    open,
    setOpen,

    shares,
    setShares,
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


        console.log("AUTH USER:", authUser);
        console.log("CURRENT USER ID:", currentUserId);
        console.log("POST:", post);
        console.log("CURRENT ITEM:", currentItem);
        console.log("OWNER ID:", ownerId);
        console.log("IS OWNER:", isOwner);

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


    /*
    |--------------------------------------------------------------------------
    | Keep menu open while processing
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | COPY TEXT
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | SHARE URL
    |--------------------------------------------------------------------------
    */

    const shareUrl =
        `${window.location.origin}/post/${postId}/share`;

    const shareLinks = {
        facebook:
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
            )}`,

        whatsapp:
            `https://wa.me/?text=${encodeURIComponent(
                shareUrl
            )}`,

        twitter:
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
            )}`,

        telegram:
            `https://t.me/share/url?url=${encodeURIComponent(
                shareUrl
            )}`,
    };

   const handleShare = async (platform) => {
   
           if (!selectedPostId) {
   
               toast.error(
                   "Nothing to share."
               );
   
               return;
           }
   
   
           if (shares) {
               return;
           }
   
   
           try {
   
               setShares(true);
   
               const externalUrl =
                   shareLinks[platform];
   
   
               if (externalUrl) {
   
                   window.open(
                       externalUrl,
                       "_blank",
                       "noopener,noreferrer"
                   );
   
               } else {
   
                   await navigator.clipboard.writeText(
                       shareUrl
                   );
   
                   toast.success(
                       "Share link copied."
                   );
               }
   
               await api.post(
                   `/api/post/${selectedPostId}/share`,
                   {
                       post_media_id:
                           selectedMediaId,
                   }
               );
               toast.success(
                   "Shared successfully!"
               );
   
               setShares(false);
   
   
           } catch (error) {
   
               console.error(
                   "SHARE ERROR:",
                   error
               );
   
   
               toast.error(
                   error.response?.data?.message ||
                   "Share failed. Please try again."
               );
   
           } finally {
   
               setShares(false);
           }
       };
   
       const shareToChat = async (chatId) => {
   
           if (!selectedPostId) {
   
               throw new Error(
                   "No reel selected."
               );
           }
   
   
           await api.post(
               `/api/chats/${chatId}/messages`,
               {
                   type: "link",
   
                   message:
                       shareUrl,
   
                   post_id:
                       selectedPostId,
   
                   post_media_id:
                       selectedMediaId,
               }
           );
   
           await api.post(
               `/api/post/${selectedPostId}/share`,
               {
                   post_media_id:
                       selectedMediaId,
               }
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
   
               setShares(false);
   
   
           } catch (error) {
   
               console.error(
                   "CHAT SHARE ERROR:",
                   error
               );
   
   
               toast.error(
                   error.response?.data?.message ||
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
                                hover:bg-gray-500/20
                                hover:text-white
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
                                onClick={() => {

                                    setShares(
                                        true
                                    );

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

                                <Share2
                                    size={20}
                                />

                                <span>
                                    Share
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



            {shares && (

                <div
                    className="
                        fixed
                        inset-0
                        bg-black/70
                        z-[300]
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-[var(--bg-color)]
                            text-[var(--text-color)]
                            rounded-xl
                            p-5
                            w-full
                            max-w-sm
                            relative
                        "
                    >

                        {/* CLOSE */}

                        <button
                            type="button"
                            disabled={
                                shares
                            }
                            onClick={() =>
                                setShares(false)
                            }
                            className="
                                absolute
                                right-3
                                top-3
                                w-8
                                h-8
                                rounded-full
                                bg-gray-100
                                flex
                                items-center
                                justify-center
                                disabled:opacity-40
                            "
                        >
                            <X
                                size={18}
                            />
                        </button>


                        <h2
                            className="
                                font-bold
                                text-lg
                                mb-4
                            "
                        >
                            Share
                        </h2>


                        {/* CURRENT ITEM */}

                        <div
                            className="
                                text-sm
                                mb-4
                            "
                        >

                            {isContent &&
                                "Sharing text content"}

                            {isImage &&
                                `Sharing image ${selectedMediaId}`}

                            {isVideo &&
                                `Sharing video ${selectedMediaId}`}

                        </div>


                        {/* CHAT */}

                        <button
                            type="button"
                            disabled={
                                shares
                            }
                            onClick={() => {

                                setMessageOpenShare(
                                    true
                                );

                                setShares(
                                    false
                                );
                            }}
                            className="
                                w-full
                                flex
                                flex-col
                                items-center
                                justify-center
                                gap-1
                                py-3
                                hover:bg-gray-100
                                rounded-lg
                            "
                        >

                            <MessageCircle
                                className="
                                    border-2
                                    border-green-500
                                    rounded-full
                                    p-1
                                "
                                size={38}
                            />

                            <span
                                className="
                                    text-sm
                                    font-bold
                                "
                            >
                                Chat List
                            </span>

                        </button>


                        <div
                            className="
                                grid
                                grid-cols-4
                                border-t
                                mt-3
                                pt-4
                                gap-3
                                text-center
                            "
                        >

                            {/* FACEBOOK */}

                            <button
                                type="button"
                                disabled={
                                    shares
                                }
                                onClick={() =>
                                    handleShare(
                                        "facebook"
                                    )
                                }
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-1
                                    hover:opacity-70
                                    disabled:opacity-40
                                "
                            >

                                <FaFacebook
                                    size={28}
                                />

                                <span
                                    className="
                                        text-xs
                                    "
                                >
                                    Facebook
                                </span>

                            </button>


                            {/* WHATSAPP */}

                            <button
                                type="button"
                                disabled={
                                    shares
                                }
                                onClick={() =>
                                    handleShare(
                                        "whatsapp"
                                    )
                                }
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-1
                                    hover:opacity-70
                                    disabled:opacity-40
                                "
                            >

                                <FaWhatsapp
                                    size={28}
                                />

                                <span
                                    className="
                                        text-xs
                                    "
                                >
                                    WhatsApp
                                </span>

                            </button>


                            {/* TWITTER */}

                            <button
                                type="button"
                                disabled={
                                    shares
                                }
                                onClick={() =>
                                    handleShare(
                                        "twitter"
                                    )
                                }
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-1
                                    hover:opacity-70
                                    disabled:opacity-40
                                "
                            >

                                <FaTwitter
                                    size={28}
                                />

                                <span
                                    className="
                                        text-xs
                                    "
                                >
                                    Twitter
                                </span>

                            </button>


                            {/* TELEGRAM */}

                            <button
                                type="button"
                                disabled={
                                    shares
                                }
                                onClick={() =>
                                    handleShare(
                                        "telegram"
                                    )
                                }
                                className="
                                    flex
                                    flex-col
                                    items-center
                                    gap-1
                                    hover:opacity-70
                                    disabled:opacity-40
                                "
                            >

                                <FaTelegram
                                    size={28}
                                />

                                <span
                                    className="
                                        text-xs
                                    "
                                >
                                    Telegram
                                </span>

                            </button>

                        </div>


                        {/* SHARING STATUS */}

                        {shares && (

                            <div
                                className="
                                    mt-4
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    text-sm
                                    font-semibold
                                    text-blue-600
                                "
                            >

                                <svg
                                    className="
                                        animate-spin
                                        h-5
                                        w-5
                                    "
                                    viewBox="0 0 24 24"
                                >

                                    <circle
                                        className="
                                            opacity-25
                                        "
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />

                                    <path
                                        className="
                                            opacity-75
                                        "
                                        fill="currentColor"
                                        d="
                                            M4 12a8 8 0
                                            018-8v4a4 4
                                            0 00-4 4H4z
                                        "
                                    />

                                </svg>

                                Sharing...

                            </div>
                        )}

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

                        <h2 className="font-bold mb-4">
                            Share to chat
                        </h2>


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
                                            rounded
                                            cursor-pointer
                                            ${
                                                selectedChats.includes(
                                                    chat.id
                                                )
                                                    ? "bg-blue-200"
                                                    : "hover:bg-gray-100"
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
                                ? "Sharing..."
                                : `Send (${selectedChats.length})`}

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
                                bg-gray-200
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