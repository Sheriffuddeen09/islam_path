import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import ReplyImageSlider from "./ReplyImageSlider";
import { useAuth } from "../../layout/AuthProvider";
import Notification from "../../notification/Notification";
import { PostCommentInput } from "./PostCommentInput";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import PostOptionsId from "./PostOptionId";
import ImageFlex from "./ImageFlex"; 
import logo from "../../layout/image/favicon.png";


export default function PostImagePageId({ image, postComments, setPostComments, showUsersPopup, setShowUsersPopup, loadingComment,
  showEmoji, setShowEmoji, emojiList, newComment, setNewComment, setImage, post, setPost, postId, chats, commentsByPost, setCommentsByPost,
  user, setEmojiList, postIdModal, setPostIdModal, video, setVideo
 }) {
  const { id } = useParams();
  const [counts, setCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [usersPreview, setUsersPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const {user: currentUser} = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showCommentPop, setShowCommentPop] = useState(false);
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [reactionLoading, setReactionLoading] = useState(false);
  const [messageOpenShare, setMessageOpenShare] = useState(false)
  const [shares, setShares] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showOverlay, setShowOverlay] = useState(true);
  
    
       const formatPostTime = (date) => {
  if (!date) return "";

  const created = new Date(date);
  const now = new Date();

  const diffMs = now - created;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds === 1 ? "" : "s"}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
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
    });
  
    await api.post(`/api/post/${post.id}/share`);
  };

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then(res => setPost(res.data.post))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);


  
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
  
      const onLikeClick = () => {
        const emoji = myReaction || "👍";
        toggleReaction(emoji);
      };
    
      
  useEffect(() => {
  if (post) {
    setCounts(post.reaction_counts || {});
    setMyReaction(post.my_reaction || null);
    setUsersPreview(post.reacted_users?.slice(0, 6) || []);
  }
}, [post]);

useEffect(() => {
  if (!post?.id) return;

  api.get(`/api/post/${post.id}/reactions`).then(res => {
    setCounts(res.data.counts || {});
    setUsersPreview(res.data.users?.slice(0,6) || []);
    setMyReaction(res.data.my_reaction || null);
  });
}, [post]);
  
   const commentInputRef = useRef(null);
   
   const focusCommentInput = () => {
     setTimeout(() => commentInputRef.current?.focus(), 0);
   };
   

   const addReplyToComment = (postComments, parentId, reply) => {
      return postComments.map(comment => {
      if (comment.id === parentId) {
          return { ...comment, replies: [...(comment.replies || []), reply] };
      }
      if (comment.replies?.length) {
          return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
      }
      return comment;
      });
      };

    const postComment = async (emoji = null, imageFile = null, parentId = null) => {
      setLoading(true)
      if (!newComment.trim() && !emoji && !imageFile) return;
      const formData = new FormData();
      if (emoji) {
        formData.append("body", emoji);
      } else if (newComment.trim()) {
        formData.append("body", newComment.trim());
      }
      if (imageFile instanceof File) {
        formData.append("image", imageFile);
      }
      try {
        const res = await api.post(`/api/posts/${postId}/comments`, formData, {
          headers: {
            "Content-Type": "multipart/form-data", // important!
          },
        });
        setPostComments(prev => parentId
          ? addReplyToComment(prev, parentId, res.data.comment)
          : [res.data.comment, ...prev]
        );
        setNewComment("");
        setImage(null);
        setShowEmoji(false);
      } catch (err) {
        console.error(err.response?.data || err);
      }
      finally{
        setLoading(false)
      }
    };

      const total = Object.values(counts || {}).reduce((a, b) => a + b, 0);

      const me = usersPreview.find(
        (u) => u.id === currentUser?.id
      );



      const uniqueUsers = Array.from(
        new Map(usersPreview.map((u) => [u.id, u])).values()
      );

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



const handleCommentPop = () =>{

setShowCommentPop(!showCommentPop)
focusCommentInput()
}

  const navigate = useNavigate()


  const text =
      post?.content || "";
  
    const hasLongText =
      text.length > 200;
  
    const shortText =
      hasLongText
        ? `${text.substring(
            0,
            200
          )}...`
        : text;
  
    const imageMedia = post?.media?.find(
        media => media.type === "image"
      );

      const imageUrl = imageMedia?.url || imageMedia?.media_url || imageMedia?.path;

    if (loading) {
        return (
          <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
    
              <p className="text-white/70 text-sm">
                Loading Image
              </p>
            </div>
          </div>
        );
      }
    
      const hasCurrentMedia = Boolean(imageUrl);
    
      if (!hasCurrentMedia) {
        return (
          <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-[100]">
            <div className="text-center text-white px-6">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-2.36a.75.75 0 0 1 1.08.67v6.38a.75.75 0 0 1-1.08.67l-4.72-2.36M4.5 18.75h7.5a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 12 5.25H4.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
    
              <p className="text-lg font-semibold">
                No Image available
              </p>
    
              <button
                onClick={() =>
                  navigate("/")
                }
                className="mt-5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition"
              >
                Go back
              </button>
            </div>
          </div>
        );
      }
     
    const commentScreen = (
      <div className="h-full flex flex-col overflow-hidden bg-[var(--bg-color)] text-[var(--text-color)]">
    
        {/* HEADER */}
        <div className="shrink-0">
          <div className="flex p-4 items-start justify-between">
            <div className="flex items-center gap-3">
              <Link
                to={`/profile/${post?.user?.id}`}
              >
                <p className={`font-bold text-[30px] rounded-full w-12 h-12 text-center flex items-center justify-center
                  ${getColor(post.user?.name)}`}>
                  {getInitial(post?.user?.first_name)}
                </p>
              </Link>
    
              <div>
                <Link
                  to={`/profile/${post?.user?.id}`}
                >
                  <p className="font-semibold">
                    {post?.user?.first_name || "Unknown"} {post?.user?.last_name || "Unknown"}
                  </p>
                </Link>
    
                <p className="text-xs">
                  {formatPostTime(post?.created_at)}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-3">
              <PostOptionsId
                post={post}
                chats={chats}
              />
    
              <button
                type="button"
                onClick={handleCommentPop}
                className="w-10 h-10 rounded-full text-black bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 text-black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
    
          {/* TEXT */}
          {post?.content && (
            <div className="px-5 pb-4">
              <div className="max-h-28 overflow-y-auto no-scrollbar">
                <p className="text-xs leading-6 break-words [overflow-wrap:anywhere]">
                  {showMore ? text : shortText}
    
                  {hasLongText && (
                    <button
                      type="button"
                      onClick={() => setShowMore((prev) => !prev)}
                      className="ml-1 text-blue-600 font-semibold hover:underline"
                    >
                      {showMore ? " See less" : " See more"}
                    </button>
                  )}
                </p>
              </div>
            </div>
          )}

            {post.media.some(m => m.type === "image") && (
                          <ImageFlex
                            media={post.media.filter(m => m.type === "image")}
                            postId={post.id}
                             post={post}
                          setShowCommentPop={setShowCommentPop}
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
                          setNewComment={setNewComment} commentsByPost={commentsByPost}
                          setCommentsByPost={setCommentsByPost}
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
                          user={user}
                          image={image}
                          usersPreview={usersPreview}
                          setImage={setImage} video={video} setVideo={setVideo}

                          />
                        )}
          
          {/* COUNTS */}
          <div className="flex justify-between border-t py-3 mx-4 items-center bg-[var(--bg-color)] text-[var(--text-color)]">
            <div className="flex gap-1 items-center">
              <div className="text-xs inline-flex items-center gap-2 bg-[var(--bg-color)] text-[var(--text-color)]">
                {Object.keys(counts).map((emoji) => (
                  <span
                    key={emoji}
                    className="text-xs"
                  >
                    {emoji}
                  </span>
                ))}
    
                {total > 0 && (
                  <div className="text-xs flex items-center gap-1 cursor-pointer">
                    {me && (
                      <span
                        className="font-semibold hover:underline"
                        onClick={() =>
                          setShowUsersPopup(true)
                        }
                      >
                        You
                      </span>
                    )}
    
                    {me && othersCount > 0 && (
                      <span>
                        and
                      </span>
                    )}
    
                    {othersCount > 0 && (
                      <span
                        className="hover:underline"
                        onClick={() =>
                          setShowUsersPopup(true)
                        }
                      >
                        {othersCount} other
                        {othersCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
    
            <div className="inline-flex items-center gap-3">
              {/* COMMENTS COUNT */}
              <p className="inline-flex bg-[var(--bg-color)] text-[var(--text-color)] gap-1 items-center">
                {post?.comments_count}
    
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                  />
                </svg>
              </p>
    
              {/* SHARES COUNT */}
              <p className="inline-flex bg-[var(--bg-color)] text-[var(--text-color)] gap-1 items-center">
                {post?.shares_count}
    
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
                </svg>
              </p>
            </div>
          </div>
    
          {/* REACTION BUTTONS */}
          <div className="flex items-center justify-around px-3 py-2 text-sm bg-[var(--bg-color)] text-[var(--text-color)] border-t">
            <div
              className="relative group"
              onMouseEnter={() =>
                setShowReactions(true)
              }
              onMouseLeave={() =>
                setShowReactions(false)
              }
            >
              {showReactions && (
                <div className="absolute bottom-10 left-0 bg-white shadow-xl rounded-full px-3 py-2 flex flex-row items-center gap-2 z-20">
                  {reactionList.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() =>
                        !reactionLoading &&
                        toggleReaction(emoji)
                      }
                      className="text-2xl cursor-pointer hover:scale-125 transition shrink-0"
                    >
                      {emoji}
                    </button>
                  ))}
    
                  {/* MORE EMOJIS */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
    
                      setShowReactions(false);
                      setShowEmoji(true);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold shrink-0"
                    title="More emojis"
                  >
                    +
                  </button>
                </div>
              )}
    
              {/* LIKE */}
              <button
                type="button"
                onClick={onLikeClick}
                className={`flex items-center gap-1 font-semibold ${
                  myReaction
                    ? "text-blue-800"
                    : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                  />
                </svg>
    
                Like
              </button>
            </div>
    
            {/* COMMENT */}
            <button
              type="button"
              className="flex items-center gap-1 font-semibold"
              onClick={handleCommentPop}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                />
              </svg>
    
              Comment
            </button>
    
            {/* SHARE */}
            <button
              type="button"
              onClick={() =>
                setShares(!shares)
              }
              className="flex items-center gap-1 font-semibold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
              </svg>
    
              Share
            </button>
          </div>
        </div>
    
        <div className="shrink-0 overflow-hidden">
          {post && (
            <PostComment
              postId={post.id}
              image={image}
              post={post}
              postComments={postComments}
              setPostComments={setPostComments}
              commentsByPost={commentsByPost}
              setCommentsByPost={setCommentsByPost}
            />
          )}
        </div>
        
        <div
          className="shrink-0 p-2 border-t"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <PostCommentInput
            newComment={newComment}
            loading={loadingComment}
            setNewComment={setNewComment}
            setImage={setImage} video={video} setVideo={setVideo}
            image={image}
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
            emojiList={emojiList}
            postComment={postComment}
            commentInputRef={commentInputRef}
          />
        </div>
    
      </div>
    );
    

  return (
    <div className="relative flex h-screen w-full overflow-hidden">

 <div
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 z-50"
          >
            <div className="inline-flex gap-4 items-center">
              {/* CLOSE */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-10 h-10 bg-white text-black px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>

              {/* LOGO */}
              <img
                onClick={() => navigate("/")}
                src={logo}
                alt="IPK"
                className="
                 w-10
                h-10
                bg-white
                rounded-full
                p-0.5
                cursor-pointer
                "
              />
            </div>
          </div>
 <div
    className={`
      bg-[var(--bg-color)]
      text-[var(--text-color)]
      flex
      items-center
      justify-center
      relative
      h-full
      transition-all
      duration-300

      ${
        showCommentPop
          ? "w-full lg:w-[calc(100%-400px)]"
          : "w-full"
      }
    `}
  >
    {Array.isArray(post.media) && post.media.some(m => m.type === "image") && (
            <ReplyImageSlider
            images={post.media.filter(m => m.type === "image").map(m => m.url)}
            post={post} chats={chats} showOverlay={showOverlay} showMore={showMore} text={text} shortText={shortText}
            hasLongText={hasLongText} showReactions={showReactions} setShowReactions={setShowReactions} 
            handleCommentPop={handleCommentPop} setShowMore={setShowMore} reactionList={reactionList} 
            reactionLoading={reactionLoading} toggleReaction={toggleReaction} setShowEmoji={setShowEmoji} 
            total={total} myReaction={myReaction} setShares={setShares} setShowOverlay={setShowOverlay}
            getColor={getColor} getInitial={getInitial}
          />
          )}
  </div>
 
  {showCommentPop && (
    <div
      className="
        hidden
        lg:flex
        w-[400px]
        h-full
        shrink-0
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        border-l
        border-green-400
        shadow-2xl
        flex-col
        overflow-hidden
        z-[100]
      "
    >
      {commentScreen}
    </div>
  )}

  {showCommentPop && (
    <div
      className="
        lg:hidden
        fixed
        inset-0
        bg-black/60
        z-[999]
        flex
        items-end
      "
      onClick={handleCommentPop}
    >
      <div
        className="
          w-full
          h-[85vh]
          bg-[var(--bg-color)]
          text-[var(--text-color)]
          rounded-t-2xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {commentScreen}
      </div>
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
