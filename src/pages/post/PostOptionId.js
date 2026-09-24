import { useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import { PostReportModal } from "./report/PostReportModal";
import DownloadImageFlex from "./DownloadImageFlex";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import { toast } from "react-toastify";


export default function PostOptionsId({ post,  chats }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState(false);
  const [openReport, setOpenReport] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [messageOpenShare, setMessageOpenShare,] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);


  
  const currentUser = useAuth()
  const authUser = useAuth()

  const isOwner = authUser?.user?.id === post?.user?.id;



   const handleDownloadVideo = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/download/video/${post.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // ✅ FORCE DEFAULT FILE NAME
    link.download = "IPK video.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Downloading video...", "success");
  } catch (err) {
    console.error(err);
    toast.error("Failed to download video!", "error");
  }
};


  const [progressMap, setProgressMap] = useState({});

const downloadSingleImage = async (img) => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.get(`/api/download/image/${img.id}`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onDownloadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgressMap((prev) => ({ ...prev, [img.id]: percent }));
      },
    });

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = img.path?.split("/").pop() || "image.jpg";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error(err);
    toast.error("Failed to download image", "error");
  }
};



  const handleSaveToLibrary = async () => {
    try {
      setLoading("save");
      await api.post(`/api/post/${post.id}/save-to-library`);
      toast.success("Saved to your library!", "success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save to library!", "error");
    } finally {
      setLoading("");
    }
  };

  const [copied, setCopied] = useState(false);
  
    const BASE_URL = "http://localhost:8000"; // or your real domain
  
  const handleCopyLink = async () => {
  try {
    let textToCopy = "";

    if (post?.image) {
      textToCopy = post.image.startsWith("http")
        ? post.image
        : `${BASE_URL}/storage/${post.image}`;
    } else if (post?.body) {
      textToCopy = post.body;
    } else {
      textToCopy = `${BASE_URL}/post/${post.id}`; // ✅ fallback
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch (err) {
    console.error("Failed to copy:", err);
    toast.error("Copy failed. Try manually.", 'error');
  }
};

  
   

const handleViewProfile = () => {
    window.location.href = `/profile/${currentUser?.user?.id}`;
  };

  const handleOption = () =>{
    setOpen(!open)
  }

 const shareUrl = `${window.location.origin}/post/${post?.id}/share`;

const shareLinks = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
};

const handleShare = async (platform) => {
  const url = shareLinks[platform];

  if (url) {
    window.open(url, "_blank");
  } else {
    // For TikTok / Instagram / YouTube
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied! Paste it in the app to share.", 'success');
  }

  await api.post(`/api/post/${post.id}/share`);
};


const shareToChat = async (chatId) => {
  await api.post(`/api/chats/${chatId}/messages`, {
    type: "link",
    message: shareUrl,
    post_id: post.id
  });

  await api.post(`/api/post/${post.id}/share`);
};



const handleReport = () =>{
  setOpenReport(!openReport)
}
  return (
    <div className="inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="px-1 py-1 rounded-full transition bg-black/20 text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 rotate-90">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>

      </button>

      {open && (
        <div
                        className="
                            fixed
                            inset-0
                            z-[200]
                            bg-black/70
                            flex
                            items-end
                            justify-center
                            w-full 
                            h-full
                            flex-1
                        "
                    >

                        <div
                            className="
                                w-full
                                relative
                                bg-[var(--bg-color)]
                                text-[var(--text-color)]
                                rounded-t-2xl
                                p-4
                                max-h-[60%]
                                sm:max-w-[60%]
                                overflow-y-auto
                                scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                            "
                        >
           <button
            onClick={() => setOpen(!open)}
            className="absolute right-3 top-2  transition 
            w-6 h-6 flex items-center justify-center"
          >
            ✕

      </button>
          <ul className="flex flex-col gap- p-4">
            {/* {post.type  && ( */}
                {post?.media?.some(m => m.type === "video") && (
                <li>
                  <button
                    onClick={() => {
                      handleOption();
                      handleDownloadVideo();
                    }}
                    className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[var(--text-color)] hover:bg-gray-50 rounded"
                  >
                    Download Video
                  </button>
                </li>
              )}


              {post?.media?.some(m => m.type === "image") && (
              <li>
                <button
                  onClick={() => {
                    handleOption();
                    setShowImagePicker(true);
                  }}
                  className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[--text-color] hover:bg-gray-50 rounded"
                >
                  Download Image
                </button>
              </li>
            )}

              {/* )} */}

            <li>
              <button onClick={() => {handleOption(); handleSaveToLibrary()}} disabled={loading === "save"} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[--text-color] hover:bg-gray-50 rounded"
              >
                {loading === "save" ? "Saving..." : "Save to Library"}
              </button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleCopyLink()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[--text-color] hover:bg-gray-50 rounded"
              >
                {copied? "Copy Image Link" : "Copy Text"}
              </button>
            </li>
            
            {!isOwner && (
              <li>
                <button
                  onClick={() => { handleOption(); handleReport(); }}
                  className="flex items-center font-bold text-[--text-color] text-[15px] gap-2 w-full px-2 py-2 hover:text-gray-600 hover:bg-gray-50 rounded"
                >
                  Report
                </button>
              </li>
            )}

            <li>
              <button onClick={() => {handleOption(); setShares(!shares)}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[--text-color] hover:bg-gray-50 rounded"
              >Share</button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleViewProfile()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-[--text-color] hover:bg-gray-50 rounded"
              >View Profile</button>
            </li>
          </ul>
        </div>
        </div>
      )}

    <div className={`w-full h-full  fixed inset-0 bg-black bg-opacity-70 z-50 ${openReport ? 'block' : 'hidden'}`}>
        <PostReportModal post={post} onClose={handleReport} />
    </div>
    {showImagePicker && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
    <div className="bg-white relative rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <button
            onClick={() => setShowImagePicker(!showImagePicker)}
            className="absolute right-3 top-4  text-black rounded-full hover:text-gray-700 hover:bg-gray-50 bg-gray-100 transition 
            w-6 h-6 flex items-center justify-center"
          >
            ✕

      </button> 
      <h2 className="font-bold mb-3">Select image to download</h2>

      {post.media.some(m => m.type === "image") && (
          <div
            className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
            
          >
            <DownloadImageFlex downloadSingleImage={downloadSingleImage} 
            progressMap={progressMap}
            media={post.media.filter(m => m.type === "image")} />

          </div>
        )}
    </div>
  </div>
)}
 
        {copied && (
          <div className="fixed inset-x-0 bottom-10 mx-auto bg-green-500 text-white p-2 rounded-lg w-40 text-center z-50">
            Copied!
          </div>
        )}
     {shares && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-sm
        relative
        shadow-2xl
        border
        border-gray-200/20
      "
    >

      {/* ========================================================= */}
      {/* CLOSE                                                     */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => setShares(false)}
        className="
          absolute
          right-3
          top-3
          w-8
          h-8
          rounded-full
          bg-gray-800
          text-white
          flex
          items-center
          justify-center
          hover:bg-red-500
          transition
        "
      >
        <X size={17} />
      </button>

      {/* ========================================================= */}
      {/* TITLE                                                     */}
      {/* ========================================================= */}

      <div className="text-center mb-5">
        <h2 className="text-lg font-bold">
          Share
        </h2>

        <p className="text-xs opacity-60 mt-1">
          Choose how you want to share this
        </p>
      </div>

      {/* ========================================================= */}
      {/* CHAT LIST                                                  */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(true);
          setShares(false);
        }}
        className="
          w-full
          flex
          items-center
          gap-3
          p-3
          rounded-xl
          border
          border-gray-200/20
          hover:bg-blue-50
          hover:text-blue-600
          transition
          mb-4
        "
      >
        <div
          className="
            w-11
            h-11
            rounded-full
            bg-blue-100
            text-blue-600
            flex
            items-center
            justify-center
          "
        >
          <MessageCircle size={23} />
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-sm">
            Chat List
          </div>

          <div className="text-xs opacity-60">
            Share with your chats
          </div>
        </div>
      </button>

      {/* ========================================================= */}
      {/* SOCIAL SHARE                                               */}
      {/* ========================================================= */}

      <div className="border-t border-gray-200/20 pt-4">

        <div className="
          grid
          grid-cols-4
          gap-2
          text-center
        ">

          <button
            type="button"
            onClick={() =>
              handleShare("facebook")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-600
              transition
            "
          >
            <FaFacebook size={25} />

            <span className="text-[11px]">
              Facebook
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("whatsapp")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-green-50
              hover:text-green-500
              transition
            "
          >
            <FaWhatsapp size={25} />

            <span className="text-[11px]">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("twitter")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-sky-50
              hover:text-sky-500
              transition
            "
          >
            <FaTwitter size={25} />

            <span className="text-[11px]">
              Twitter
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("telegram")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-400
              transition
            "
          >
            <FaTelegram size={25} />

            <span className="text-[11px]">
              Telegram
            </span>
          </button>

        </div>
      </div>
    </div>
  </div>
)}


{/* ============================================================= */}
{/* SHARE TO CHAT MODAL                                           */}
{/* ============================================================= */}

{messageOpenShare && (
  <div className="
    fixed
    inset-0
    bg-black/70
    z-[60]
    flex
    items-center
    justify-center
    p-4
  ">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-md
        max-h-[85vh]
        overflow-hidden
        shadow-2xl
        border
        border-gray-200/20
        flex
        flex-col
      "
    >

      {/* ======================================================= */}
      {/* HEADER                                                   */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-4
      ">
        <div>
          <h2 className="font-bold text-lg">
            Share to chat
          </h2>

          <p className="text-xs opacity-60 mt-1">
            Select one or more chats
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessageOpenShare(false);
            setSelectedChats([]);
          }}
          className="
            w-8
            h-8
            rounded-full
            bg-gray-800
            text-white
            flex
            items-center
            justify-center
            hover:bg-red-500
            transition
          "
        >
          <X size={17} />
        </button>
      </div>

      {/* ======================================================= */}
      {/* SELECTED COUNT                                          */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-3
      ">
        <span className="text-xs opacity-60">
          {selectedChats.length === 0
            ? "No chat selected"
            : `${selectedChats.length} chat${
                selectedChats.length > 1
                  ? "s"
                  : ""
              } selected`}
        </span>

        {selectedChats.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setSelectedChats([])
            }
            className="
              text-xs
              text-red-500
              hover:text-red-600
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* ======================================================= */}
      {/* CHAT LIST                                               */}
      {/* ======================================================= */}

      <div className="
        flex-1
        overflow-y-auto
        space-y-2
        pr-1
        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
      ">
        {chats.map((chat) => {

          const isSelected =
            selectedChats.includes(
              chat.id
            );

          const chatUser =
            chat.other_user ||
            chat.other ||
            chat.teacher ||
            chat.student;

          const firstName =
            chatUser?.first_name || "";

          const lastName =
            chatUser?.last_name || "";

          const fullName =
            `${firstName} ${lastName}`
              .trim() ||
            chatUser?.name ||
            chat.name ||
            "Unknown User";

          const avatar =
            chatUser?.profile_image ||
            chatUser?.profile_picture ||
            chatUser?.avatar ||
            chat.image ||
            null;

          return (
            <button
              type="button"
              key={chat.id}
              onClick={() => {
                setSelectedChats((prev) =>
                  prev.includes(chat.id)
                    ? prev.filter(
                        (id) =>
                          id !== chat.id
                      )
                    : [
                        ...prev,
                        chat.id,
                      ]
                );
              }}
              className={`
                w-full
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                border
                text-left
                transition-all
                duration-200
                ${
                  isSelected
                    ? `
                      bg-blue-50
                      dark:bg-blue-900/20
                      border-blue-500
                      shadow-sm
                    `
                    : `
                      border-gray-200/20
                      hover:bg-gray-100/10
                      hover:border-gray-300
                    `
                }
              `}
            >

              {/* ================================================= */}
              {/* AVATAR                                             */}
              {/* ================================================= */}

              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="
                    w-11
                    h-11
                    rounded-full
                    object-cover
                    flex-shrink-0
                  "
                />
              ) : (
                <div className="
                  w-11
                  h-11
                  rounded-full
                  bg-blue-500
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  flex-shrink-0
                ">
                  {fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* ================================================= */}
              {/* NAME                                               */}
              {/* ================================================= */}

              <div className="flex-1 min-w-0">

                <div
                  className={`
                    font-medium
                    text-sm
                    truncate
                    ${
                      isSelected
                        ? "text-blue-600"
                        : ""
                    }
                  `}
                >
                  {fullName}
                </div>

                <div className="text-[11px] opacity-50 mt-0.5">
                  {chat.type === "group"
                    ? "Group"
                    : "Chat"}
                </div>

              </div>

              {/* ================================================= */}
              {/* SELECT ICON                                       */}
              {/* ================================================= */}

              <div
                className={`
                  w-7
                  h-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                  transition-all
                  ${
                    isSelected
                      ? `
                        bg-blue-600
                        text-white
                      `
                      : `
                        border-2
                        border-gray-300
                        text-transparent
                      `
                  }
                `}
              >
                <Check
                  size={16}
                  strokeWidth={3}
                />
              </div>

            </button>
          );
        })}

        {/* ===================================================== */}
        {/* EMPTY CHAT LIST                                       */}
        {/* ===================================================== */}

        {chats.length === 0 && (
          <div className="
            py-10
            text-center
            opacity-50
          ">
            <MessageCircle
              size={35}
              className="mx-auto mb-2"
            />

            <p className="text-sm">
              No chats available
            </p>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* SEND                                                     */}
      {/* ======================================================= */}

      <button
        type="button"
        disabled={
          sending ||
          selectedChats.length === 0
        }
        onClick={async () => {
          try {
            setSending(true);

            for (
              const chatId of selectedChats
            ) {
              await shareToChat(chatId);
            }

            setSelectedChats([]);
            setMessageOpenShare(false);

          } finally {
            setSending(false);
          }
        }}
        className={`
          mt-4
          w-full
          rounded-xl
          py-3
          flex
          items-center
          justify-center
          gap-2
          font-medium
          transition
          ${
            sending ||
            selectedChats.length === 0
              ? `
                bg-gray-400
                cursor-not-allowed
                text-white
              `
              : `
                bg-blue-600
                hover:bg-blue-700
                text-white
              `
          }
        `}
      >
        {sending ? (
          <>
            <svg
              className="
                animate-spin
                h-5
                w-5
              "
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            Sending...
          </>
        ) : (
          <>
            <Send size={18} />

            Send
            {selectedChats.length > 0 &&
              ` (${selectedChats.length})`}
          </>
        )}
      </button>

      {/* ======================================================= */}
      {/* CANCEL                                                   */}
      {/* ======================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(false);
          setSelectedChats([]);
        }}
        disabled={sending}
        className="
          mt-2
          w-full
          rounded-xl
          py-2.5
          bg-gray-200
          text-gray-700
          hover:bg-gray-300
          transition
        "
      >
        Cancel
      </button>

    </div>
  </div>
)}


    </div>
  );
}
