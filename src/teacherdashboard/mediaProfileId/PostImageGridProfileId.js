import { useState } from "react";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import api from "../../Api/axios";

export default function PostImageGridProfileId({ media = [], post, chats,
setEditContent, setSelectedPost, setShowEditModal, setPosts,
 
 }) {
  const [open, setOpen] = useState(false);
  const [showDeleteModalId, setShowDeleteModalId] = useState(false);
  const [openOptionId, setOpenOptionId] = useState(null);
  const [index, setIndex] = useState(0);
  const [messageOpenShare, setMessageOpenShare,] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [shares, setShares] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);


 
  if (!media || media.length === 0) return null;
  
  
   


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


  if (!media.length) return null;

  const total = media.length;

  const openPreview = (i) => {
    setIndex(i);
    setOpen(true);
  };

  // 1 IMAGE → FULL WIDTH
  if (!media || media.length === 0) return null;

if (total === 1 && media[0]) {

    return (
      <>
        <img
          src={media[index]?.url}
          className="w-full max-h-[450px] object-cover rounded cursor-pointer"
          onClick={() => openPreview(0)}
        />
        <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}  />
      </>
    );
  }

  // 2 IMAGES → 2 GRID
  if (total === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">
          {media.map((img, i) => (
            <>
            {media[index] &&(
            <img
              key={img.id}
              src={img?.url}
              className="h-40 border w-full rounded cursor-pointer"
              onClick={() => openPreview(i)}
            />
          )
            }

           </>
          ))}
            <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
        </div>
        
      </>
    );
  }

  // 3 IMAGES → 2 / 1 LAYOUT
  if (total === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">
          <img
            src={media[0].url}
            className="row-span-2 h-full w-full rounded cursor-pointer"
            onClick={() => openPreview(0)}
          />
          {media.slice(1).map((img, i) => (
            <>
            <img
              key={img.id}
              src={img.url}
              className="h-24 border w-full rounded cursor-pointer"
              onClick={() => openPreview(i + 1)}
            />
           </>
          ))}
            <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
        </div>
        
      </>
    );
  }

  // 4+ IMAGES → 2x2 + REMAINING
  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <>
      <div className="grid grid-cols-2 gap-1 w-full">
        {visible.map((img, i) => (
          <>
          <div
            key={img.id}
            className="relative h-40 cursor-pointer"
            onClick={() => openPreview(i)}
          >
            <img
              src={img.url}
              className="h-full w-full object-cover rounded"
            />
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                <span className="text-white text-2xl font-bold">+{remaining}</span>
              </div>
            )}
          </div>
      </>
        ))}
      <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
      </div>
  
    
    </>
  );

  function PreviewModal({ open, setOpen, media, index, setIndex, post }) {
  if (!open || !media || !media[index]) return null;

  const current = media[index];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="absolute top-4 right-4 inline-flex items-center gap-4">
        <button
          className="text-black bg-white rounded-full w-10 h-10 text-xl"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <button
            onClick={() => current && setOpenOptionId(current.id)}
            className="px-1 py-1 text-black bg-white rounded-full hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        </svg>

      </button>

        {openOptionId === current.id && (
          <div className="absolute top-10 right-0 mt-2 px-3 py-2 w-40 bg-white border rounded shadow-lg">
            

            <button onClick={() => {setOpenOptionId(null); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Share
            </button>
          </div>
        )}
      </div>

       <button
            className="absolute left-4  w-8 h-8 border-2 rounded-full flex items-center justify-center pb-2 hover:bg-gray-800 text-white text-2xl"
            onClick={() => setIndex(i => Math.max(i - 1, 0))}
          >
            ‹
          </button>

      <img
        src={current.url}
        className="max-h-[80vh] max-w-[90vw] object-contain"
      />

      <button
            className="absolute right-4 w-8 h-8 border-2 rounded-full flex items-center justify-center pb-2 hover:bg-gray-800 text-white text-2xl"
            onClick={() => setIndex(i => Math.min(i + 1, media.length - 1))}
          >
          ›
        </button>
    


    
    
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

    </div>
  );
}

}

