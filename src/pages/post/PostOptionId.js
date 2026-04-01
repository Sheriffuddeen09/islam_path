import { useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import { PostReportModal } from "./report/PostReportModal";
import DownloadImageFlex from "./DownloadImageFlex";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import Notification from "../../notification/Notification";


export default function PostOptionsId({ post,  chats }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notify, setNotify] = useState("");
  const [shares, setShares] = useState(false);
  const [openReport, setOpenReport] = useState(false)
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [messageOpenShare, setMessageOpenShare,] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);


  
  const currentUser = useAuth()
  const authUser = useAuth()

  console.log('chats', chats)
  const isOwner = authUser?.user?.id === post?.user?.id;


  const showNotification = (message, type = "success") => {
      setNotify({ message, type });
  
      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };

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

    showNotification("Downloading video...", "success");
  } catch (err) {
    console.error(err);
    showNotification("Failed to download video!", "error");
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
    showNotification("Failed to download image", "error");
  }
};



  const handleSaveToLibrary = async () => {
    try {
      setLoading("save");
      await api.post(`/api/post/${post.id}/save-to-library`);
      showNotification("Saved to your library!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save to library!", "error");
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
    alert("Copy failed. Try manually.");
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
    alert("Link copied! Paste it in the app to share.");
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
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="px-1 py-1 text-white rounded-full hover:text-white hover:bg-gray-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>

      </button>

      {open && (
        <div className="absolute -top-4 right-10 mt-2 w-56 bg-white border rounded shadow-lg z-10">
           {/* <button
            onClick={() => setOpen(!open)}
            className="absolute right-3 top-2  text-black rounded hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-6 h-6 flex items-center justify-center"
          >
            ✕

      </button> */}
          <ul className="flex flex-col gap- p-4">
            {/* {post.type  && ( */}
                {post?.media?.some(m => m.type === "video") && (
                <li>
                  <button
                    onClick={() => {
                      handleOption();
                      handleDownloadVideo();
                    }}
                    className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
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
                  className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
                >
                  Download Image
                </button>
              </li>
            )}

              {/* )} */}

            <li>
              <button onClick={() => {handleOption(); handleSaveToLibrary()}} disabled={loading === "save"} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >
                {loading === "save" ? "Saving..." : "Save to Library"}
              </button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleCopyLink()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >
                {copied? "Copy Image Link" : "Copy Text"}
              </button>
            </li>
            
            {!isOwner && (
              <li>
                <button
                  onClick={() => { handleOption(); handleReport(); }}
                  className="flex items-center font-bold text-gray-800 text-[15px] gap-2 w-full px-2 py-2 hover:text-gray-600 hover:bg-gray-50 rounded"
                >
                  Report
                </button>
              </li>
            )}

            <li>
              <button onClick={() => {handleOption(); setShares(!shares)}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >Share</button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleViewProfile()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >View Profile</button>
            </li>
          </ul>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-900 z-50 text-white px-4 py-2 rounded shadow-lg">
          {notification}
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

    {shares && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-4 w-80 relative max-h-[80vh] overflow-y-auto">
          <button onClick={() => setShares(!shares)}
            className="absolute right-3 top-2  text-black rounded hover:text-gray-700 hover:bg-gray-50 bg-gray-100 transition 
            w-6 h-6 flex items-center justify-center"
          >
            ✕
      </button>
        <div className="flex flex-col mx-auto gap-3 items-center">
          <button onClick={() => {setMessageOpenShare(!messageOpenShare); setShares(false);}} 
          className="text-black flex flex-col  items-center gap-1 hover:text-blue-600">
                <MessageCircle className="border-2 border-black rounded-full p-1" size={35} />
                <span className="text-sm font-bold">Chat List</span>
              </button>
            <div className="grid grid-cols-4 border-t-2 pt-2 gap-4 text-center">
              <button onClick={() => handleShare("facebook")} className="text-black flex flex-col items-center gap-1 hover:text-blue-600 text-black">
                <FaFacebook size={28} />
                <span className="text-sm">Facebook</span>
              </button>

              <button onClick={() => handleShare("whatsapp")} className="text-black flex flex-col items-center gap-1 hover:text-green-500">
                <FaWhatsapp size={28} />
                <span className="text-sm">WhatsApp</span>
              </button>

              <button onClick={() => handleShare("twitter")} className="text-black flex flex-col items-center gap-1 hover:text-sky-500">
                <FaTwitter size={28} />
                <span className="text-sm">Twitter</span>
              </button>

              <button onClick={() => handleShare("telegram")} className="text-black flex flex-col items-center gap-1 hover:text-blue-400">
                <FaTelegram size={28} />
                <span className="text-sm">Telegram</span>
              </button>
            </div>

        </div>
      
      </div>
      </div>
      )
      }

        {copied && (
          <div className="fixed inset-x-0 bottom-10 mx-auto bg-green-500 text-white p-2 rounded-lg w-40 text-center z-50">
            Copied!
          </div>
        )}
      {messageOpenShare && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <h2 className="font-bold mb-3">Share to chat</h2>

          {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-2 p-2 cursor-pointer rounded ${
              selectedChats.includes(chat.id)
                ? "bg-blue-200 my-1"
                : "hover:bg-gray-100 my-1"
            }`}
            onClick={() => {
              setSelectedChats((prev) =>
                prev.includes(chat.id)
                  ? prev.filter((id) => id !== chat.id)
                  : [...prev, chat.id]
              );
            }}
          >
            <input
              type="checkbox"
              checked={selectedChats.includes(chat.id)}
              readOnly
            />
            <span>
              <span>
              {chat.other_user
                ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                : chat.teacher
                  ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                  : chat.student
                    ? `${chat.student.first_name} ${chat.student.last_name}`
                    : "Unknown User"}
            </span>

            </span>
          </div>
        ))}

        <button
  disabled={sending || selectedChats.length === 0}
  onClick={async () => {
    try {
      setSending(true);
      for (const chatId of selectedChats) {
        await shareToChat(chatId);
      }
      setSelectedChats([]);
      setMessageOpenShare(false);
    } finally {
      setSending(false);
    }
  }}
  className={`mt-3 w-full rounded py-2 text-white ${
    sending || selectedChats.length === 0
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {sending ? <svg
      className="animate-spin h-5 w-5 text-white mx-auto flex justify-center items-center"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-blue-800"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> : `Send (${selectedChats.length})`}
</button>

      <button
        onClick={() => setMessageOpenShare(false)}
        className="mt-3 w-full bg-gray-200 rounded py-2"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{notify.message && (
          <Notification
            message={notify.message}
            type={notify.type} // "success" = green, "error" = red
            onClose={() => setNotify({ message: "", type: "" })}
          />
        )}
    </div>
  );
}
