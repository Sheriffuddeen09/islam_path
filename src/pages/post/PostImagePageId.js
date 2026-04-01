import { Link, useParams } from "react-router-dom";
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
  showEmoji, setShowEmoji, emojiList, newComment, setNewComment, setImage, post, setPost, postId, chats
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


const text = post?.content || "";
const shortText = text.length > 200 ? text.substring(0, 200) + "....." : text;


const handleCommentPop = () =>{

setShowCommentPop(!showCommentPop)
focusCommentInput()
}

  
  if (loading) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  if (!post) return <div className="text-black lg:ml-96 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-sm font-bold ">
                      Post not found</div>;
//sm
  const commentScreen = (
    <div>
      <div className="lg:w-[400px] w-full border-l z-50">
        <div className="flex p-4 items-start justify-between">
              <div className="flex items-center  gap-3">
                <Link to={`/profile/${post?.user?.id}`}>
                  <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center flex items-center justify-center">
                    {post?.user?.name?.[0] || "?"}
                  </p>
                </Link>

                <div>
                  <Link to={`/profile/${post?.user?.id}`}>
                    <p className="font-semibold text-black">{post?.user?.name || "Unknown"}</p>
                  </Link>
                  <p className="text-xs text-black">{post?.created_at}</p>
                </div>

              </div>
        
                <div className='inline-flex items-center gap-3'>
              <PostOptionsId post={post} chats={chats}/>

              <button onClick={handleCommentPop}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
                w-10  h-10 cursor-pointer">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
        
              </div>
              </div>
        
              {/* TEXT */}
             <div
          className="p-4">
            
          {post.content && (
            <p className="cursor-pointer px-2 text-black text-sm">
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
        

        <div className="flex justify-between border-t-2 py-2 mx-4 mt-4 items-center ">

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

        {/* OTHERS */}
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
      </div>

      </div>
      
    {/* Reactions */}
    <div className="flex items-center justify-around px-3 text-sm text-gray-600">
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
                  <button className="flex items-center font-semibold " onClick={handleCommentPop}>
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
                  </svg> Share
                  </button>
                </div>

                {/* Comment */}
        <div className=" overflow-y-auto h-60 md:h-96 lg:h-60 md:translate-y-10 lg:translate-y-0  no-scrollbar ">
        <PostComment postId={post.id} image={image} post={post} postComments={postComments} 
        setPostComments={setPostComments} />
        </div>
        
        {/* Input Comment sm*/}
      <div className="fixed bottom-0 md:bottom-20 lg:bottom-0 -translate-x-2 sm:translate-x-0 lg:w-96 w-full md:w-9/12 justify-center mx-auto flex-col flex flex-1">
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

      {showUsersPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 p-4">
            <h3 className="font-semibold mb-3">Likes</h3>

             {usersPreview.map(u => (
              <div key={u.id} className="flex justify-between h-96 hover:text-blue-800 overflow-y-auto text-sm py-1">
                <Link to={`/profile/${u.id}`}>
                  <span className="hover:text-blue-400">
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
    </div>
  )

  return (
    <div className="flex h-screen">
      {/* Left: Image slider sm */}
      <div className="flex-1 bg-black flex items-center justify-center relative">
         {Array.isArray(post.media) && post.media.some(m => m.type === "image") && (
            <ReplyImageSlider
            images={post.media.filter(m => m.type === "image").map(m => m.url)}
            post={post} chats={chats}
          />
          )}

          <div className="absolute lg:hidden block bottom-10">
            <div className="flex gap-4 w-full p-2 flex-row justify-center items-end mx-auto px-3 text-sm text-gray-600">
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
        
                  <div className="flex flex-col gap-4 ">
                 
       <div className=" text-sm inline-flex items-center gap-2 text-white">
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        
        {total > 0 && (
      <div className="text-sm flex items-center gap-1 cursor-pointer">
        {me && (
          <span
            className="font-semibold hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            You
          </span>
        )}

        {me && othersCount > 0 && <span>and</span>}

        {othersCount > 0 && (
          <span
            className="text-white text-sm hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            {othersCount} other{othersCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    )} 

      </div>
    {/* Reaction Share */}

    <button onClick={onLikeClick}
                className={`flex items-center font-semibold ${myReaction ? 'font-bold bg-gray-200 rounded-lg text-blue-900 py-2 px-2 ' : 'bg-gray-900 hover:text-white hover:bg-gray-700 transition py-2 px-2 text-white rounded-lg'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              Like
        </button>

        </div>
      </div>
        
        
      </div>
                  <button  className="flex items-center  justify-center font-semibold gap-1 w-16 h-10 mx-4 bg-gray-900 rounded-lg text-white font-bold py-2" onClick={handleCommentPop}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white font-bold">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg> {post.comments_count}
                  </button>

                   <button className="flex items-center justify-center font-semibold gap-1 w-16 h-10 mx-4 bg-gray-900 rounded-lg text-white font-bold py-2">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 bg-gray-900 rounded-lg text-white font-bold"
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg> {post.shares_count}
                  </button>
                </div>

    
          </div>
      </div>

      {/* Right: Fixed comments 60 */}
      <div className="hidden lg:block">
      {commentScreen}
      </div>
    
    {
      showCommentPop &&(
      <div className="fixed px-2 inset-0 bg-white flex sm:py-5 items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full h-full sm:my-4 flex flex-col py-3 max-w-xl border shadow-lg">

      {commentScreen}
      </div>
      </div>
      )
    }
      
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
