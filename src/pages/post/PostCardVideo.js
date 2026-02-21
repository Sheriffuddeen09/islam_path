import PostOptions from "./PostOption";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";
import { useEffect, useRef, useState } from "react";
import Notification from "../../Form/Notification";
import api from "../../Api/axios"; 
import { PostFeedIdModal } from "./PostFeedIdModal";
import {toast} from "react-hot-toast"
import PostVideoCard from "./PostVideoCard";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import { Repost } from "./Repost";
import UndoRepost from "./UndoRepost";


export default function PostCardVideo({ post, setPosts, image, setImage, postComments, setPostComments, 
  loading, setLoading, showUsersPopup, setShowUsersPopup, newComment, setNewComment, emojiList, setEmojiList,
showEmoji, setShowEmoji, messageOpen, setMessageOpen, chats, setChats }) {

  const {user} = useAuth()
  const {user: currentUser} = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [counts, setCounts] = useState(post.reaction_counts || {});
  const [myReaction, setMyReaction] = useState(post.my_reaction || null);
  const [usersPreview, setUsersPreview] = useState([]); 
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [postIdModal, setPostIdModal] = useState(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [messageOpenShare, setMessageOpenShare] = useState(false)
  const [shares, setShares] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);

  const postRef = useRef();

const [hasViewed, setHasViewed] = useState(false);

useEffect(() => {
  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (entry.isIntersecting && !hasViewed) {
        try {
          await api.post(`/api/posts/${post.id}/view`);
          setHasViewed(true); // prevent multiple calls
        } catch (err) {
          console.error(err);
        }
      }
    },
    { threshold: 0.6 }
  );

  if (postRef.current) {
    observer.observe(postRef.current);
  }

  return () => {
    if (postRef.current) observer.disconnect();
  };
}, [post.id, hasViewed]);


  




  const showNotification = (msg) => {
    setNotify({ message: msg, type: "error" });

      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };

  const navigate = useNavigate();
  const reactionList = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

  
    const toggleReaction = async (emoji) => {
  if (!currentUser) {
    showNotification("Please log in to react.");
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
    showNotification("Reaction error", err);
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
    if (post.reacted_users) {
      setUsersPreview(post.reacted_users.slice(0, 6));
    }
  }, [post.reacted_users]);
  

  useEffect(() => {
  api.get(`/api/post/${post.id}/reactions`).then(res => {
    setCounts(res.data.counts || {});
    setUsersPreview(res.data.users?.slice(0,6) || []);
    setMyReaction(res.data.my_reaction || null);
  });
}, [post.id]);

  
    // Render
    const text = post.content || "";
    const shortText = text.length > 200 ? text.substring(0, 200) + "....." : text;


 
const total = Object.values(counts || {}).reduce((a, b) => a + b, 0);

const othersCount = usersPreview.filter(
  (u) => u.id !== currentUser?.id
).length;

const me = usersPreview.find(
  (u) => u.id === currentUser?.id
);




const commentInputRef = useRef(null);

const focusCommentInput = () => {
  setTimeout(() => commentInputRef.current?.focus(), 0);
};



const handleHidePost = async (postId) => {
  try {
    await api.post(`/api/posts/${postId}/hide`);
    toast.success("Post removed");
    setPosts(prev => prev.filter(p => p.id !== postId));
  } catch (err) {
    console.error(err);
  }
};

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



  return (
    <div
      className={`rounded-xl shadow md:w-96 lg:w-[400px] w-full border`}
    >
 {post.is_repost && (
         <div className="flex p-4 bg-gray-100 mb-1 items-center justify-between">
         <div className="inline-flex items-center gap-3 justify-between">
           <Link to={`/profile/${user?.id}`}>
         <p className="font-bold text-white pb-1 bg-blue-600 text-[40px] rounded-full w-12 h-12 text-center
         flex flex-col items-center justify-center">
           {post.reposted_by?.name[0]}
         </p>
         </Link>
         
          <div>
           <Link to={`/profile/${user.id}`}>
           <p className="font-semibold text-black text-sm">{post.reposted_by?.name}</p>
           </Link>
           <p className="text-xs opacity-70">{post.created_at}</p>
         </div>
          <p className="text-xs h-6 bg-gray-800 px-2 rounded text-white py-1 ">
          Reposted
          </p>
         </div>
        {post.is_repost && post.reposted_by?.id === currentUser?.id && ( 
               <UndoRepost post={post} setPosts={setPosts} />
                   )}
         </div>
       )} 
   
      {/* USER */}
      <div className="flex p-4 bg-gray-100 items-start justify-between">

      <div className="flex items-center  gap-3">
        <Link to={`/profile/${user?.id}`}>
        <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center
        flex flex-col items-center justify-center">
          {post.user.name?.[0]}
        </p>
        </Link>
        <div>
          <Link to={`/profile/${user.id}`}>
          <p className="font-semibold">{post.user.name}</p>
          </Link>
          <p className="text-xs opacity-70">{post.created_at}</p>
        </div>
      </div>

        <div className='inline-flex items-center gap-3'>
      <PostOptions post={post} 
       messageOpen={messageOpen}
      setMessageOpen={setMessageOpen}
      chats={chats}
      setChats={setChats}/>
      <button
      onClick={() => handleHidePost(post.id)}
      className="w-8 h-8 flex items-center justify-center"
          >
            ✕
    </button>

      </div>
      </div>

      {/* TEXT */}
     <div
  className="bg-white p-4 text-black text-[14px]">
  {post.content && (
    <p className="cursor-pointer px-2">
      {showMore
        ? text
        : shortText}
        {
          showMore ? "" : <button onClick={(e) => {
            e.preventDefault();
            setShowMore(!showMore);
          }}>See more</button>
          
        }
        
    </p>
  )}
</div>


{/* VIDEOS video */}
    {post.media
      .filter(m => m.type === "video")
      .map(m => (

        <PostVideoCard v={m}  post={post} />

      ))
    }

      <div className="flex justify-between px-4 mt-4 items-center ">

        <div className="flex gap-1 items-center">
       <div className=" text-xs inline-flex items-center gap-2 text-gray-600">
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        
        {total > 0 && (
      <div className="text-xs flex items-center gap-1 cursor-pointer">
        {/* YOU */}
        {me && (
          <span
            className="font-semibold hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            You
          </span>
        )}

        {/* AND */}
        {me && othersCount > 0 && <span>and</span>}

        {/* OTHERS Share*/}
        {othersCount > 0 && (
          <span
            className="text-gray-500 hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            {othersCount} other{othersCount > 1 ? "s" : ""}
          </span>
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
      <p className="inline-flex text-gray-800 gap-1 items-center">
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
          
      <div className="flex items-center justify-around py-3 text-sm text-gray-600">
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
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        Like
                  </button>
                </div>
                </div>
                  <button className="flex items-center font-semibold " onClick={() => {setPostIdModal(post); focusCommentInput()}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
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

                   {post.user.id !== user.id &&
                    <button className="flex items-center font-semibold gap-1 mx-4">
                      <Repost post={post} setPosts={setPosts} />
                    </button>
                    }
                </div>
        
                    {postIdModal && (
                  <PostFeedIdModal
                   total={total} othersCount={othersCount} setShowUsersPopup={setShowUsersPopup} me={me} 
                   image={image} setImage={setImage} postComments={postComments} loading={loading} setLoading={setLoading}
                   showUsersPopup={showUsersPopup} currentUser={currentUser} usersPreview={usersPreview}
                    user={user} counts={counts} setShowReactions={setShowReactions} 
                    reactionLoading={reactionLoading}  setPostComments={setPostComments}
                    showReactions={showReactions} reactionList={reactionList} commentInputRef={commentInputRef}
                    toggleReaction={toggleReaction} onLikeClick={onLikeClick} focusCommentInput={focusCommentInput}
                    myReaction={myReaction} postId={post.id} post={postIdModal}
                    onClose={() => setPostIdModal(null)}
                    newComment={newComment} setNewComment={setNewComment}
                    showEmoji={showEmoji} setShowEmoji={setShowEmoji}
                    emojiList={emojiList} setEmojiList={setEmojiList}
                  />
                )}
               {showUsersPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 p-4">
            <h3 className="font-semibold mb-3">Likes</h3>

            {usersPreview.map(u => (
              <div key={u.id} className="flex justify-between text-sm py-1">
                <Link to={`/profile/${u.id}`}>
                  <span>
                    {u.id === currentUser?.id ? "You" : u.name}
                  </span>
                </Link>
              </div>
            ))}

            <button
              className="mt-4 w-full text-sm text-blue-600"
              onClick={() => setShowUsersPopup(false)}
            >
              Close
            </button>
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

       <Notification
                  message={notify.message}
                  type={notify.type}
                  onClose={() => setNotify({ message: "", type: "" })}
                />
    </div>
  );
}
