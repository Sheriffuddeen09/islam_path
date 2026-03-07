import { useState, useEffect, useRef } from "react";
import PostImageGridProfile from "./PostImageGridProfile";
import { useNavigate } from "react-router-dom";
import PostVideoCardProfile from "./PostVideoCardProfile";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import { PostFeedIdModalProfile } from "../../teacherdashboard/mediaprofile/PostFeedIdModalProfile";
import { Link } from "react-router-dom";
import Notification from "../../Form/Notification";


export default function PostProfileCard({ post, chats, image, setImage, postComments, 
  setPostComments, loading, setLoading, setPosts,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList,
        editContent, selectedPost, setPostLoading,fetchProfile,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal
 }) {

    const [showMore, setShowMore] = useState(false)
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const [messageOpenShare, setMessageOpenShare,] = useState(false)
    const [selectedChats, setSelectedChats] = useState([]);
    const [shares, setShares] = useState(false);
    const [sending, setSending] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [counts, setCounts] = useState(post.reaction_counts || {});
    const [myReaction, setMyReaction] = useState(post.my_reaction || null);
    const [usersPreview, setUsersPreview] = useState([]); 
    const [notify, setNotify] = useState('');
    const [postIdModal, setPostIdModal] = useState(null);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const {user: currentUser} = useAuth();
    const {user} = useAuth()
    const [ showUsersPopup, setShowUsersPopup] = useState(false);

    const showNotification = (message, type = "success") => {
    setNotify({ message, type });

    // Clear after 5 seconds
    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };
    
      const reactionList = ["❤️", "👍", "😂", "😮", "😢", "🔥"];
    
      
        const toggleReaction = async (emoji) => {
      if (!currentUser) {
        showNotification("Please log in to react.", "error");
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
        showNotification("Reaction error", "error");
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

    const text = post.content || "";
    const shortText = text.length > 330 ? text.substring(0, 330) + "..." : text;

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

        const getColor = (id) => colors[id % colors.length];


        

  const handleOption = () =>{
    setOpen(!open)
  }

  const commentInputRef = useRef(null);
  
  const focusCommentInput = () => {
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };
  

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


const handleEdit = async () => {
  if (!selectedPost) return;

  try {
    setLoadingProfile(true);
    const res = await api.put(`/api/posts-single/${selectedPost.id}`, {
      content: editContent,
    });

    setPosts(prev =>
      prev.map(p =>
        p.id === selectedPost.id
          ? { ...p, ...res.data.post }  // ✅ merge, don’t replace
          : p
      )
    );

    setShowEditModal(false);
  } finally {
    setLoadingProfile(false);
  }
};

const handleDelete = async (id) => {
  try {
    setLoadingProfile(true);
    await api.delete(`/api/posts-single/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
    setShowDeleteModal(false);
  } finally {
    setLoadingProfile(false);
  }
};


const media = Array.isArray(post.media) ? post.media : [];

  return (
    <div className="bg-white rounded-t-xl shadow p-4 mb-4 ">
    <div className="h-56  relative overflow-y-auto no-scrollbar">
       
          
       <div className="px-2 flex justify-between mb-2 items-center">
       <div className="flex items-center  gap-3">
               <p className="font-bold text-white pb-1 bg-black text-[30px] rounded-full w-10 h-10 text-center
               flex flex-col items-center justify-center">
                 {post.user?.name?.[0]}
               </p>
               <div>
                 <p className="font-semibold">{post.user?.name}</p>
                 <p className="text-xs opacity-70">{post.created_at}</p>
               </div>
             </div>
       <button
        onClick={handleOption}
        className="px-1 py-1 text-black rounded-full hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>

      </button>

      {open && (
        <div className=" absolute top-6 right-0 mt-2 px-3 py-2 w-40 z-50 bg-white border rounded shadow-lg z-10">
            {post.content && post.content.trim() !== "" && (
            <button
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              onClick={() => {
                setSelectedPost(post);
                setEditContent(post.content);
                setShowEditModal(true);
                handleOption();

              }}
            >
                  Edit
            </button>
          )}
            <button 
            onClick={() => {
              setSelectedPost(post);
              setShowDeleteModal(true);
              handleOption(); 
            }} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Delete
            </button>
            <button onClick={() => {handleOption(); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Share
            </button>
        </div>
      )}
      </div>
        
      {post.content && (
    <p onClick={() => navigate(`/post/text/${post.id}`)}
     className="cursor-pointer px-2 text-sm mb-5">
      {showMore
        ? text
        : shortText}
        {
          showMore ? "" : <button onClick={(e) => {
            e.preventDefault();
            setShowMore(!showMore);
          }}>see more</button>
          
        }
    </p>
  )}
        {/* Image */}
        {media?.some(m => m.type === "image") && (
          <PostImageGridProfile
            media={post.media.filter(m => m.type === "image")}
            post={post}
            chats={chats}
            setPosts={setPosts}
            setEditContent={setEditContent}
            setSelectedPost={setSelectedPost}
            setShowEditModal={setShowEditModal}
            setShowDeleteModal={setShowDeleteModal}
            showDeleteModal={showDeleteModal}
            selectedPost={selectedPost}
            loadingProfile={loadingProfile}
            handleDelete={handleDelete}
            fetchProfile={fetchProfile}
            setPostLoading={setPostLoading}
          />
        )}
      {/* Video */}
        {media
          ?.filter(m => m.type === "video")
          .map(m => (
            <PostVideoCardProfile
              key={m.id}
              v={m}
              post={post}
              chats={chats}
              setEditContent={setEditContent}
              setSelectedPost={setSelectedPost}
              setShowEditModal={setShowEditModal}
              setShowDeleteModal={setShowDeleteModal}
              showDeleteModal={showDeleteModal}
              selectedPost={selectedPost}
              handleDelete={handleDelete}
              loadingProfile={loadingProfile}
            />
          ))}

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

{/* Reaction List  */}


      <div className="flex justify-between border-t-2 px-4 mt-4 items-center ">

        <div className="flex gap-1 items-center">
       <div className=" text-xs inline-flex items-center gap-2 text-gray-600">
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        
        {total > 0 && (
  <div className="text-xs flex items-center gap-1 cursor-pointer">

    {/* YOU */}
    {me && (
      <>
        <span
          className="font-semibold hover:underline"
          onClick={() => setShowUsersPopup(true)}
        >
          You
        </span>
        {total > 1 && <span>,</span>}
      </>
    )}

    {/* FIRST OTHER USER */}
    {firstUser && (
      <span
        className="font-semibold hover:underline"
        onClick={() => setShowUsersPopup(true)}
      >
        {firstUser.name.slice(0, 6)}
      </span>
    )}

    {/* REMAINING USERS COUNT */}
    {others.length > 1 && (
      <>
        <span> and </span>
        <span
          className="font-semibold hover:underline"
          onClick={() => setShowUsersPopup(true)}
        >
          {others.length - 1} other{others.length - 1 > 1 ? "s" : ""}
        </span>
      </>
    )}
  </div>
)}


      </div>  
      </div>
      <div className="inline-flex items-center gap-3">

        <p className="inline-flex text-gray-800 gap-1 items-center">
      {post.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex gap-1 text-gray-800 items-center">
      {post.shares_count}
           <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-gray-600"
        >
          <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
        </svg>
      </p>

       <p className="inline-flex gap-1 text-gray-800 items-center">
      {post.reposts_count}
           <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 
              3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865
              a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
      </p>
      </div>

      </div>
  <div className="flex items-center bg-white justify-around py-3 text-sm text-gray-600">
                  <div className="flex justify-between text-gray-600 mx-4">
                {/* like with hover picker */}
                <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {showReactions && (
                    <div className="absolute -top-14 left-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-white shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
                      {reactionList.map((emoji) => (
                      <span
                        key={emoji}
                        onClick={() => !reactionLoading && toggleReaction(emoji)}
                        className={`text-2xl transition cursor-pointer ${
                          reactionLoading ? "opacity-50 pointer-events-none" : "hover:scale-125"
                        }`}
                      >
                        {reactionLoading && myReaction === emoji ? "⏳" : emoji}
                      </span>
                    ))}

                    </div>
                  )}
        
                  <button onClick={onLikeClick}
                          className={`flex items-center font-semibold ${myReaction ? 'font-bold text-blue-900 p-1 ' : ''}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        Like
                  </button>
                </div>
                </div>
                  <button className="flex items-center font-semibold " onClick={() => {setPostIdModal(post); focusCommentInput()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg> Comment
                  </button>

                   <button onClick={() => setShares(!shares)} className="flex items-center font-semibold gap-1 mx-4">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg>
                    Share
                  </button>
                </div>
                    {showDeleteModal && (
                      <div className="fixed inset-0 bg-black/50 flex z-50 items-center justify-center">
                        <div className="bg-white p-4 rounded w-72 text-center">
                          <p>Are you sure you want to delete this post?</p>

                          <div className="flex justify-end gap-2 mt-3">
                            <button className="text-white bg-gray-800 p-2 rounded text-sm" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button
                              onClick={() => handleDelete(selectedPost.id)}
                              disabled={loadingProfile}
                              className="bg-red-500 text-white px-3 py-1 rounded"
                            >
                              {loadingProfile ? <p className="flex items-center gap-2">
                            <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
                          </p>
                        : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showEditModal && (
                      <div className="fixed inset-0 bg-black/50 flex z-50 items-center justify-center">
                        <div className="bg-white p-4 rounded w-80 sm:w-96">
                          <h3 className="font-semibold my-4 text-center">Edit Post</h3>

                          <textarea
                            className="w-full border p-2 h-40 rounded-lg no-scrollbar"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                          />

                          <div className="flex justify-end gap-2 mt-3">
                            <button className="text-white bg-gray-800 p-2 rounded text-sm" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button
                              onClick={handleEdit}
                              disabled={loadingProfile}
                              className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                              {loadingProfile ? <p className="flex items-center gap-2">
                          <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
                        </p> : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}


                    {showUsersPopup && (
  <div 
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
    onClick={() => setShowUsersPopup(false)}
  >
    <div className="space-y-2 max-h-96 relative overflow-y-auto bg-white p-4 w-80 sm:w-96 mx-autoz-50 rounded-lg pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"><h1 className="text-xl font-bold text-black py-3">User Likes</h1>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
  onClick={() =>setShowUsersPopup(false)}class="size-6 absolute right-4 top-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

  {allUsers.map((user) => (
    <Link
      key={user.id}
      to={`/profile/${user.id}`}   // 👈 profile route
      className="flex items-center gap-2 text-sm hover:bg-gray-100 p-2 rounded transition"
      onClick={() => setShowUsersPopup(false)} // close popup on click
    >
      <div
        className={`w-8 h-8 rounded-full ${getColor(user.id)} flex items-center justify-center text-xl font-semibold text-white`}
      >
        {user.id === currentUser?.id
          ? "Y"
          : user.name?.charAt(0).toUpperCase()}
      </div>

      <span className="font-medium">
        {user.id === currentUser?.id ? "You" : user.name}
      </span>
    </Link>
  ))}
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
                  />
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
