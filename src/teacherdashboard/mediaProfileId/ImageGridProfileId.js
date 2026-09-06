

import { useEffect, useRef, useState } from "react";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import api from "../../Api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../layout/AuthProvider";
import { PostFeedIdModalProfile } from "../mediaprofile/PostFeedIdModalProfile";
import ImageGridCommentReactionShare from "../../pages/post/previewimagevideo/ImageGridCommentReactionShare";

export default function ImageGridProfileId({ media = [], post, chats,  loading, setNewComment,
  emojiList, setEmojiList, newComment, postComments, setPostComments, setLoading, showEmoji, setShowEmoji,
  user, image, setImage }) {
  const [openOptionId, setOpenOptionId] = useState(null);
  const [openOption, setOpenOption] = useState(false);
  const [messageOpenShare, setMessageOpenShare,] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [shares, setShares] = useState(false);
  const [sending, setSending] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);


  
    const {user: currentUser} = useAuth();
    const [ showUsersPopup, setShowUsersPopup] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [counts, setCounts] = useState(post.reaction_counts || {});
    const [myReaction, setMyReaction] = useState(post.my_reaction || null);
    const [usersPreview, setUsersPreview] = useState([]); 
    const [postIdModal, setPostIdModal] = useState(null);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  
    const commentInputRef = useRef(null);


const shareUrl = `${window.location.origin}/post/${post?.id}`;

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



  const reactionList = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

  
    const toggleReaction = async (emoji) => {
  if (!currentUser) {
    toast.error("Please log in to react.", "error");
    return;
  }

  if (reactionLoading) return; // ⛔ prevent double clicks

  setReactionLoading(true);

  try {
    if (myReaction === emoji) {
      setMyReaction(null);

      setCounts((prev) => {
        const copy = { ...prev };
        copy[emoji] = (Number(copy[emoji] || 0) - 1);
        if (copy[emoji] <= 0) delete copy[emoji];
        return copy;
      });

      setUsersPreview((prev) => prev.filter((u) => u.id !== currentUser.id));

      await api.delete(`/api/post/${post.id}/reaction`);
      return;
    }

    setCounts((prev) => {
      const copy = { ...prev };
      if (myReaction) {
        copy[myReaction] = (Number(copy[myReaction] || 1) - 1);
        if (copy[myReaction] <= 0) delete copy[myReaction];
      }
      copy[emoji] = (Number(copy[emoji] || 0) + 1);
      return copy;
    });

    setMyReaction(emoji);

    const res = await api.post(`/api/post/${post.id}/reaction`, { emoji });

    if (res?.data?.counts) setCounts(res.data.counts);
    if (res?.data?.users) setUsersPreview(res.data.users.slice(0, 6));
    if (res?.data?.my_reaction) setMyReaction(res.data.my_reaction);
  } catch (err) {
    toast.error("Reaction error", "error");
  } finally {
    setReactionLoading(false);
    setShowReactions(false);
  }
};

    // Clicking the Like button: quick toggle (use myReaction or default 👍)
    const onLikeClick = () => {
      const emoji = myReaction || "👍";
      toggleReaction(emoji);
    };
  
    useEffect(() => {
      const fetchReactions = async () => {
        const res = await api.get(`/api/post/${post.id}/reactions`);
        setCounts(res.data.counts || {});
        setUsersPreview(res.data.users || []);
        setMyReaction(res.data.my_reaction || null);
      };

      fetchReactions();
    }, [post.id]);

 
    const total = Object.values(counts || {}).reduce((a, b) => a + b, 0);


      const uniqueUsers = Array.from(
        new Map(usersPreview.map((u) => [u.id, u])).values()
      );

      // Find me
      const me = uniqueUsers.find(u => u.id === currentUser?.id);

      // Remove me from list
      const others = uniqueUsers.filter(u => u.id !== currentUser?.id);

      const firstUser = others[0];
      const lastUser = others[others.length - 1];
      const othersCount = total - (me ? 1 : 0) - (others.length > 1 ? 2 : others.length);

      const allUsers = uniqueUsers; // 👈 this is your full popup list


      
        const colors = [
          "bg-red-400",
          "bg-blue-400",
          "bg-green-400",
          "bg-purple-400",
          "bg-pink-400",
          "bg-yellow-400",
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


const focusCommentInput = () => {
  setTimeout(() => commentInputRef.current?.focus(), 0);
};

  const closePreview = () => {
    setOpenPreview(false)
  }

  if (!media || media.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 grid-cols-1 px-3 mb-4 w-full">
        {media.slice(0, 4).map((img, i) => (
        <div key={img.id} className="relative">
          <img
            src={img.url}
            className="sm:h-52 h-60 w-full rounded cursor-pointer"
            onClick={() => {
              setPreviewIndex(i);
              setOpenPreview(true);
            }}
          />
          

      {openPreview && (
        <PreviewModal
          media={media}
          index={previewIndex}
          setIndex={setPreviewIndex}
          onClose={() => setOpenPreview(false)}
          postId={post.id}
          setDeleteTarget={setDeleteTarget}
        />
      )}

      </div>
        ))}

        
         
      </div>

      

       {/* End image */}
    
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

                        
  {postIdModal && (
                  <PostFeedIdModalProfile
                    total={total} others={others} setShowUsersPopup={setShowUsersPopup} me={me} 
                    image={image} setImage={setImage} postComments={postComments} loading={loading} setLoading={setLoading}
                    showUsersPopup={showUsersPopup} currentUser={currentUser} usersPreview={usersPreview}
                    user={user} counts={counts} setShowReactions={setShowReactions} 
                    reactionLoading={reactionLoading}  setPostComments={setPostComments}
                    showReactions={showReactions} reactionList={reactionList} commentInputRef={commentInputRef}
                    toggleReaction={toggleReaction} onLikeClick={onLikeClick} focusCommentInput={focusCommentInput}
                    myReaction={myReaction} postId={post.id} post={postIdModal} firstUser={firstUser} 
                    onClose={() => setPostIdModal(null)} getColor={getColor} allUsers={allUsers} 
                    newComment={newComment} setNewComment={setNewComment}
                    showEmoji={showEmoji} setShowEmoji={setShowEmoji}
                    emojiList={emojiList} setEmojiList={setEmojiList} chats={chats}
                    setPostIdModal={setPostIdModal} 
                    postIdModal={postIdModal} setShowEmojiPicker={setShowEmojiPicker} 
                    showEmojiPicker={showEmojiPicker}
                  />
  )}
    </>
  );

  function PreviewModal({
  media = [],
  index,
  setIndex,
  onClose,
  postId,
  setDeleteTarget
}) {
  if (!media || media.length === 0) return null;

  const safeIndex = Math.min(index, media.length - 1);
  const current = media[safeIndex];

  if (!current) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

     <div className="absolute top-4 right-4 inline-flex items-center gap-4">
          <button
            className=" text-black bg-white rounded-full w-10 h-10 text-xl"
            onClick={() => setOpenPreview(false)}
          >
            ✕
          </button>

          <button
           onClick={() => setOpenOptionId(!openOptionId)}
            className="px-1 py-1 text-black bg-white rounded-full hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        </svg>

      </button>
    </div>

    {openOptionId && (
        <div className=" absolute top-10 right-4 mt-6 px-3 py-2 w-40 z-50 bg-white border rounded shadow-lg z-10">
           
           
            <button onClick={() => {setOpenOptionId(null); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Share
            </button>
        </div>
      )}
        
   
      

      <button
        className="absolute left-14 text-white text-3xl"
        onClick={() => setIndex(i => Math.max(i - 1, 0))}
      >
        ‹
      </button>

      <img
        src={current.url}
        className="max-h-[80vh] max-w-[90vw] object-contain"
      />

       <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
                            <ImageGridCommentReactionShare
                            post={post}
                            setOpen={closePreview}
                            counts = {counts}
                            total = {total}
                            me={me}
                            firstUser={firstUser}
                            others = {others} 
                            allUsers = {allUsers}
                            myReaction={myReaction}
                            reactionList = {reactionList}
                            reactionLoading = {reactionLoading}
                            toggleReaction ={toggleReaction}
                            onLikeClick = {onLikeClick}
            
                            showReactions={showReactions}
                            setShowReactions={setShowReactions}
            
                            showEmojiPicker={showEmojiPicker}
                            setShowEmojiPicker={setShowEmojiPicker}
            
                            showUsersPopup={showUsersPopup}
                            setShowUsersPopup={setShowUsersPopup}
                            currentUser={currentUser}
                            getColor={getColor}
            
                            // Comment
                            postComments = {postComments} 
                            setPostComments={setPostComments}
                            commentInputRef={commentInputRef}
                            focusCommentInput={focusCommentInput}
                            newComment={newComment}
                            setNewComment={setNewComment}
                            loading={loading}
                            setLoading={setLoading}
            
                            showEmoji={showEmoji}
                            setShowEmoji={setShowEmoji}
                            emojiList={emojiList}
                            setEmojiList={setEmojiList}
            
                            // Share
                            chats = {chats}
                            setPostIdModal={setPostIdModal}
                            shares={shares}
                            setShares={setShares}
                            setMessageOpenShare={setMessageOpenShare}
                            handleShare={handleShare}
                            sending={sending}
                            messageOpenShare={messageOpenShare}
                            selectedChats={selectedChats}
                            setSelectedChats={setSelectedChats}
                            setSending={setSending}
                            shareToChat={shareToChat}
                            postIdModal={postIdModal}
                            />
                            </div>
      

      <button
        className="absolute right-14 text-white text-3xl"
        onClick={() =>
          setIndex(i => Math.min(i + 1, media.length - 1))
        }
      >
        ›
      </button>
    </div>
  );
}

}

