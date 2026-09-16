import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import ReplyImageSlider from "./ReplyImageSlider";
import PostOptions from "./PostOption";
import { useAuth } from "../../layout/AuthProvider";
import Notification from "../../notification/Notification";
import { PostCommentInput } from "./PostCommentInput";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import PostOptionsId from "./PostOptionId";

export default function PostImagePageId({ image, postComments, setPostComments, showUsersPopup, setShowUsersPopup, loadingComment,
  showEmoji, setShowEmoji, emojiList, newComment, setNewComment, setImage, post, setPost, postId, chats, commentsByPost, setCommentsByPost
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

    const [showOverlay, setShowOverlay] = useState(true);
  
    
        const overlayTimerRef = useRef(null);
      
          const showVideoControls = () => {
            setShowOverlay(true);
      
            if (overlayTimerRef.current) {
              clearTimeout(overlayTimerRef.current);
            }
      
            if (loading) {
              return;
            }
      
            overlayTimerRef.current = setTimeout(() => {
              setShowOverlay(false);
            }, 1500);
          };
      
          const hideVideoControls = () => {
            if (overlayTimerRef.current) {
              clearTimeout(overlayTimerRef.current);
              overlayTimerRef.current = null;
            }
      
            setShowOverlay(false);
          };
      
          useEffect(() => {
            return () => {
              if (overlayTimerRef.current) {
                clearTimeout(overlayTimerRef.current);
              }
            };
          }, []);
      
          useEffect(() => {
              if (loading) {
                hideVideoControls();
                return;
              }
      
              
      }, [loading]);
      
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

const othersCount = usersPreview.filter(
  (u) => u.id !== currentUser?.id
).length;

const me = usersPreview.find(
  (u) => u.id === currentUser?.id
);



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
    
      const hasCurrentMedia = post
    
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
                <p className="font-bold text-white bg-black text-[30px] rounded-full w-12 h-12 text-center flex items-center justify-center">
                  {post?.user?.name?.[0] || "?"}
                </p>
              </Link>
    
              <div>
                <Link
                  to={`/profile/${post?.user?.id}`}
                >
                  <p className="font-semibold">
                    {post?.user?.name || "Unknown"}
                  </p>
                </Link>
    
                <p className="text-xs">
                  {post?.created_at}
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
            setImage={setImage}
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
    <div className="flex h-screen">
      {/* Left: Image slider sm */}
      <div className="flex-1 bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center relative">
         {Array.isArray(post.media) && post.media.some(m => m.type === "image") && (
            <ReplyImageSlider
            images={post.media.filter(m => m.type === "image").map(m => m.url)}
            post={post} chats={chats}
          />
          )}

          { post?.content && (
              <div
                className={`absolute bottom-16 left-3 right-3 sm:left-5 sm:right-5 z-[70] transition-all duration-300 ${
                  showOverlay
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
          
                    {/* USER */}
                    <Link
                      to={`/profile/${post?.user?.id}`}
                      className="shrink-0"
                    >
                      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white text-lg font-bold border border-white/20 shadow-lg">
                        {post?.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "A"}
                      </span>
                    </Link>
          
                    <div className="min-w-0 flex-1">
          
                      {/* USER NAME */}
                      <div className="text-white font-bold text-xs mb-1">
                        {post?.user?.name || "Unknown User"}
                      </div>
          
                      {/* CONTENT */}
                      <div
                        className="
                          rounded-xl
                          bg-black/25
                          backdrop-blur-sm
                          px-3
                          py-2
                          max-h-[55vh]
                          overflow-y-auto
                          overscroll-contain
                          scrollbar-thin
                          scrollbar-thumb-white/30
                          scrollbar-track-transparent
                        "
                      >
                        <p className="text-white text-xs leading-5 break-words [overflow-wrap:anywhere]">
                          {showMore ? text : shortText}
          
                          {hasLongText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
          
                                setShowMore((prev) => !prev);
          
                              }}
                              className="ml-1 text-white underline font-semibold"
                            >
                              {showMore ? "See less" : "See more"}
                            </button>
                          )}
                        </p>
                      </div>
          
                    </div>
                  </div>
                </div>
              </div>
            )}
                    <div className="absolute right-0 bottom-14 z-[100] flex flex-col items-center gap-3">
                      {/* REACTION */}
          
                      <div
                        className="relative"
                        onMouseEnter={() =>
                          setShowReactions(
                            true
                          )
                        }
                        onMouseLeave={() =>
                          setShowReactions(
                            false
                          )
                        }
                      >
                        {showReactions && (
                          <div
                            className="absolute right-12 top-0 bg-white rounded-full shadow-xl px-3 py-2 flex flex-row items-center gap-1 z-20 whitespace-nowrap"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            {reactionList.map(
                              (emoji) => (
                                <button
                                  type="button"
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
          
                                    if (
                                      !reactionLoading
                                    ) {
                                      toggleReaction(
                                        emoji
                                      );
                                    }
                                  }}
                                  className="text-xl hover:scale-125 transition"
                                >
                                  {emoji}
                                </button>
                              )
                            )}
          
                            {/* PLUS BUTTON */}
          
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
          
                                setShowReactions(
                                  false
                                );
                                setShowEmoji(true);
                              }}
                              className="ml-1 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold"
                              title="More emojis"
                            >
                              +
                            </button>
                          </div>
                        )}
          
                        <div className="text-white text-[10px] text-center mb-1">
                          {total > 0 &&
                            total}
                        </div>
          
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
          
                            setShowReactions(
                              (prev) =>
                                !prev
                            );
          
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl border transition ${
                            myReaction
                              ? "bg-blue-600 border-blue-400"
                              : "bg-black/20 text-white border-gray-600"
                          }`}
                        >
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
                              d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                            />
                          </svg>
                        </button>
                      </div>
          
                      {/* COMMENT */}
          
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
          
                          handleCommentPop();
                        }}
                        className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
                      >
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
                      </button>
          
                      {/* SHARE */}
          
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
          
                          setShares(
                            (prev) => !prev
                          );
                        }}
                       className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
                        </svg>
                      </button>
          
                      <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-xl border 
                      border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
                      >
                        <PostOptionsId
                          post={post}
                        />
                      </div>
                    </div>
          
        </div>

     {showCommentPop && (
      <div className="fixed inset-0 px-2 bg-black/70 flex items-center justify-center z-[999]">
        <div
          className="
            rounded-xl
            w-full
            lg:w-[400px]
            max-w-xl
            max-h-[90vh]
            flex
            flex-col
            shadow-lg
            overflow-hidden
            bg-[var(--bg-color)]
          "
        >
          {commentScreen}
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
