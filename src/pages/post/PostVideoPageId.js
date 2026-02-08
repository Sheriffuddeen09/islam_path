import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import logo from '../../layout/image/favicon.png'
import PostOptions from "./PostOption";
import { useAuth } from "../../layout/AuthProvider";
import Notification from "../../Form/Notification";
import { PostCommentInput } from "./PostCommentInput";
import { useSwipeable } from "react-swipeable";
import PostOptionsId from "./PostOptionId";

export default function PostVideoPageId({ image, postComments, setPostComments, showUsersPopup, setShowUsersPopup, loadingComment,
  showEmoji, setShowEmoji, emojiList, newComment, setNewComment, setImage, 
 }) {

   const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
  
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
  
    const [isPlaying, setIsPlaying] = useState(false);
  
    const [notifyNext, setNotifyNext] = useState(false);
    const [cancelTimer, setCancelTimer] = useState(null);
  
    const [allowAutoNext, setAllowAutoNext] = useState(() => {
      return sessionStorage.getItem("autoNextUsed") !== "1";
    });
    const [counts, setCounts] = useState({});
    const [myReaction, setMyReaction] = useState(null);
    const [usersPreview, setUsersPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const {user: currentUser} = useAuth();
    const [showMore, setShowMore] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showCommentPop, setShowCommentPop] = useState(false);
    const [notify, setNotify] = useState({ message: "", type: "" });
    const [reactionLoading, setReactionLoading] = useState(false);
    
    const {user} = useAuth()
    const [showOverlay, setShowOverlay] = useState(true);
    const timeoutRef = useRef(null);
    
    const [isMuted, setIsMuted] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

const toggleMute = () => {
  const v = videoRef.current;
  if (!v) return;
  v.muted = !v.muted;
  setIsMuted(v.muted); // ✅ sync state
};

useEffect(() => {
  const v = videoRef.current;
  if (!v) return;
  const onVolume = () => setIsMuted(v.muted);
  v.addEventListener("volumechange", onVolume);
  return () => v.removeEventListener("volumechange", onVolume);
}, [currentIndex]);


useEffect(() => {
  const v = videoRef.current;
  if (!v) return;

  const onTime = () => {
    if (!isSeeking) {
      setCurrentTime(v.currentTime);
    }
  };
  const onLoaded = () => setDuration(v.duration || 0);

  v.addEventListener("timeupdate", onTime);
  v.addEventListener("loadedmetadata", onLoaded);

  return () => {
    v.removeEventListener("timeupdate", onTime);
    v.removeEventListener("loadedmetadata", onLoaded);
  };
}, [isSeeking, currentIndex]);


useEffect(() => {
  async function fetchVideos() {
      setLoadingVideos(true);
    try {
      const res = await api.get("/api/posts-get");
      const data = res.data.posts;
      if (!Array.isArray(data)) return;

      setVideos(data);

      const index = data.findIndex(v => v.id === Number(id));
      setCurrentIndex(index >= 0 ? index : 0);
    } finally {
      setLoadingVideos(false);
    }
  }
  fetchVideos();
}, []); // only once




   const currentPost = videos[currentIndex];
    const currentMedia = currentPost?.media?.find(m => m.type === "video");
  
    // Preload next video (instant switch)
    useEffect(() => {
      const next = videos[currentIndex + 1];
      const nextVideo = next?.media?.find(m => m.type === "video");
      if (nextVideo?.url) {
        const v = document.createElement("video");
        v.src = nextVideo.url;
        v.preload = "auto";
      }
    }, [currentIndex, videos]);
  
    
    // Sync UI with real video state
    useEffect(() => {
      const v = videoRef.current;
      if (!v) return;
  
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onVolume = () => setIsMuted(v.muted);
      const onTime = () => setCurrentTime(v.currentTime);
      const onLoaded = () => setDuration(v.duration || 0);
      const onEnded = () => handleVideoEnd();
  
      v.addEventListener("play", onPlay);
      v.addEventListener("pause", onPause);
      v.addEventListener("volumechange", onVolume);
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("loadedmetadata", onLoaded);
      v.addEventListener("ended", onEnded);
  
      return () => {
        v.removeEventListener("play", onPlay);
        v.removeEventListener("pause", onPause);
        v.removeEventListener("volumechange", onVolume);
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("loadedmetadata", onLoaded);
        v.removeEventListener("ended", onEnded);
      };
    }, [currentIndex, videos, allowAutoNext]);
  
    const togglePlay = () => {
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) v.play();
      else v.pause();
    };
  
  

    const handleNext = () => {
      if (currentIndex < videos.length - 1) {
        setCurrentIndex(i => i + 1);
      }
    };
  
    const handlePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(i => i -1 );
      }
    };
  
    const handleVideoEnd = () => {
      if (!allowAutoNext) return;
  
      if (currentIndex < videos.length - 1) {
        setNotifyNext(true);
  
        const t = setTimeout(() => {
          setNotifyNext(false);
          sessionStorage.setItem("autoNextUsed", "1");
          setAllowAutoNext(false);
          handleNext();
        }, 2000);
  
        setCancelTimer(t);
      }
    };
  
    const cancelAutoNext = () => {
      if (cancelTimer) {
        clearTimeout(cancelTimer);
        setCancelTimer(null);
        setNotifyNext(false);
      }
    };
  
  

  
    const handleMouseMove = () => {
      setShowOverlay(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowOverlay(false), 5000);
    };
  
    // ✅ Swipe handlers (mobile/tablet)
    const handlers = useSwipeable({
      onSwipedUp: handleNext,
      onSwipedDown: handlePrev,
      preventScrollOnSwipe: true,
      trackTouch: true,
      trackMouse: false,
    });


const goFullScreen = () => {
  if (videoRef.current?.requestFullscreen) {
    videoRef.current.requestFullscreen();
  }
};



  
   const showNotification = (msg) => {
      setNotify({ message: msg, type: "error" });
  
        // Clear after 5 seconds
        setTimeout(() => {
          setNotify({ message: "", type: "" });
        }, 5000);
      };
  
    const reactionList = ["❤️", "👍", "😂", "😮", "😢", "🔥"];
  
    
      const toggleReaction = async (emoji) => {

        if (!currentPost?.id) return;

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
  
        await api.delete(`/api/post/${currentPost.id}/reaction`);
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
  
      const res = await api.post(`/api/post/${currentPost.id}/reaction`, { emoji });
  
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
  
      const onLikeClick = () => {
        const emoji = myReaction || "👍";
        toggleReaction(emoji);
      };
    
      
  useEffect(() => {
  if (!currentPost) return;

  setCounts(currentPost.reaction_counts || {});
  setMyReaction(currentPost.my_reaction || null);
  setUsersPreview(currentPost.reacted_users?.slice(0, 6) || []);
}, [currentPost]);


useEffect(() => {
  if (!currentPost?.id) return;

  api.get(`/api/post/${currentPost.id}/reactions`).then(res => {
    setCounts(res.data.counts || {});
    setUsersPreview(res.data.users?.slice(0,6) || []);
    setMyReaction(res.data.my_reaction || null);
  });
}, [currentPost?.id]);


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
    
      if (!currentPost?.id) return;

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
        const res = await api.post(`/api/posts/${currentPost.id}/comments`, formData, {
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

const text = currentPost?.content || "";
const shortText = text.length > 200 ? text.substring(0, 200) + "....." : text;


const handleCommentPop = () =>{

setShowCommentPop(!showCommentPop)
focusCommentInput()
}

    if (!currentMedia) return <div>No video</div>;
    //Post not


  if (loadingVideos) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    )
//sm
  const commentScreen = (
    <div>
      <div className="lg:w-[400px] w-full border-l z-50">
        <div className="flex p-4 items-start justify-between">
              <div className="flex items-center  gap-3">
                <Link to={`/profile/${currentPost?.user?.id}`}>
                  <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center flex items-center justify-center">
                    {currentPost?.user?.name?.[0] || "?"}
                  </p>
                </Link>

                <div>
                  <Link to={`/profile/${currentPost?.user?.id}`}>
                    <p className="font-semibold text-black">{currentPost?.user?.name || "Unknown"}</p>
                  </Link>
                  <p className="text-xs text-black">{currentPost?.created_at}</p>
                </div>

              </div>
        
                <div className='inline-flex items-center gap-3'>
              <PostOptions post={currentPost} />

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
            
          {currentPost?.content && (
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

        <p className="inline-flex gap-1 items-center">
      {currentPost?.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex gap-1 items-center">
      {currentPost?.comments_count}
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

                   <button className="flex items-center font-semibold gap-1 mx-4">
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
          {currentPost && (
            <PostComment
              postId={currentPost.id}
              image={image}
              post={currentPost}
              postComments={postComments}
              setPostComments={setPostComments}
            />
          )}
        </div>
        
        {/* Input Comment sm*/}
      <div className="fixed bottom-0 md:bottom-20 lg:bottom-4 -translate-x-2 sm:translate-x-0 lg:w-96 w-full md:w-9/12 justify-center mx-auto flex-col flex flex-1">
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
         {/* Desktop buttons (RIGHT SIDE like Facebook) */}
       <button
          onClick={handleNext}
          disabled={currentIndex === videos.length - 1}
          className="bg-black/60 text-white px-4 py-3 translate-y-10 rounded-full absolute left-4 hidden sm:block
                    disabled:opacity-40 disabled:pointer-events-none"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="bg-transparent size-14 rotate-180 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 
        border-white rounded-full text-white rounded-full">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>
           
        </button>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="bg-black/60 text-white px-4 py-3 rotate-180 -translate-y-10 rounded-full absolute left-4 hidden sm:block
                    disabled:opacity-40 disabled:pointer-events-none"
        >

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="bg-transparent size-14 rotate-180 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 
        border-white rounded-full text-white rounded-full">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>
          </button>

      {/* Top Left Logo */}
      <div
          className="absolute top-4 right-4 z-50"
          >
            <div className="inline-flex sm:gap-12 gap-4 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
            onClick={() => navigate('/')}
            class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

            <img onClick={() => navigate('/')} src={logo} alt="IPK" className="w-10 h-10 bg-white rounded-full
            p-0.5 cursor-pointer" />
          </div>
          </div>
    
         <div
  {...handlers}
  className="relative h-screen sm:max-w-xl w-full bg-black flex items-center justify-center"
  onMouseMove={handleMouseMove}
>
  
      <video
        ref={videoRef}
        src={currentMedia.url}
        className="sm:h-full h-[450px] w-auto max-w-full"
        preload="auto"
        autoPlay
        playsInline
      />

  {/* CENTER PLAY/PAUSE */}
  <button
    onClick={togglePlay}
    className="absolute inset-0 flex items-center justify-center z-40"
  >
    <div className={`bg-black/60 p-2 rounded-full ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {isPlaying ? (
        <span className="text-white text-4xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
      </svg>
        </span>
      ) : (
        <span className="text-white text-4xl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
      </svg>

        </span>
      )}
    </div>
  </button>

  {/* TOP RIGHT CONTROLS */}
  <div className={`absolute top-4 left-0 px-2 sm:translate-x-6 translate-x-2 flex items-center gap-2 z-50 ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
    
    <button onClick={goFullScreen} className={`bg-gray-800 w-10 h-10 flex justify-center items-center rounded-full text-white text-xl ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>

      
      </button>
 <button onClick={toggleMute} className="bg-gray-800 w-10 h-10 flex justify-center items-center rounded-full">
  {isMuted ? "🔇" : "🔊"}
</button>

  </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 z-50 text-white">
        <span>{Math.floor(currentTime)}s</span>
        <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onMouseDown={() => setIsSeeking(true)}
        onMouseUp={(e) => {
          const t = Number(e.target.value);
          videoRef.current.currentTime = t;
          setCurrentTime(t);
          setIsSeeking(false);
        }}
        onChange={(e) => {
          setCurrentTime(Number(e.target.value)); // preview while dragging
        }}
        className="flex-1"
      />
        <span>{Math.floor(duration)}s</span>
      </div>

      {/* Auto-next notify */}
      {notifyNext && (
        <div className="absolute top-4 right-4 bg-black text-white p-3 rounded">
          Next video in 2s…
          <button onClick={cancelAutoNext} className="ml-2 bg-red-500 px-2 rounded">
            Cancel
          </button>
        </div>
      )}
      {/* Description */}
       <div
        className={`absolute bg-black bg-opacity-10 bottom-16 hidden lg:block left-1/2 -translate-x-40
                   w-80 px-4 py-2 rounded text-black font-semibold
                    transition-all duration-300
                    flex flex-col items-start space-y-1
                    ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >

      <div className="flex items-start my-6 z-50 gap-2 mt-2 ">
        <Link to={`/profile/${user.id}`} className="z-50">
      <span className="text-white w-12 h-12 mx-auto flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> 
              {currentPost?.user?.name?.charAt(0)?.toUpperCase() || "A"} 
        </span>
      </Link>
        <div className="text-xs">
          
          <div className="font-bold text-[14px] sm:text-[14px] text-white">
            {currentPost?.user?.name}
          </div>
          <div className="text-[11px] sm:text-[12px] sm:mt-1 text-white">
            {currentPost?.user?.role || "No role"}
          </div>
        
          {currentPost?.content && (
            <p className="cursor-pointer text-white text-xs">
              {showMore
                ? text
                : shortText}
                {
                  showMore ? "" : <button onClick={(e) => {
                    e.preventDefault();
                    setShowMore(!showMore);
                  }}> See more</button>
                  
                }
                
            </p>
          )} 
        </div>
      </div>
    </div>

    {/* Mobile View  */}

    <div 
        className={`absolute bottom-16 sm:bottom-20 left-1/2 bg-black/10 -translate-x-40 sm:-translate-x-48 z-50 pointer-events-auto
                      w-80 sm:w-96 lg:hidden px-4 py-2 rounded text-white
                    transition-all duration-300
                    flex flex-col items-start space-y-1
                  `}
      >

      <div className="flex items-start my-6 z-50 gap-2 mt-2 ">
        <Link to={`/profile/${user.id}`} className="z-50">
      <span className="text-white w-12 h-12 mx-auto flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> 
              {currentPost?.user?.name?.charAt(0)?.toUpperCase() || "A"} </span>
      </Link>
        <div className="text-xs">
          
          <div className="font-bold text-[14px] sm:text-[18px] text-white">
            {currentPost?.user?.name}
          </div>
          <div className="text-[11px] sm:text-[15px] sm:mt-1 text-white">
            {currentPost?.user?.role || "No role"}
          </div>
        </div> 
      </div>

        {currentPost?.content && (
            <p className="cursor-pointer px-2 text-black text-sm">
              {showMore
                ? text
                : shortText}
                {
                  showMore ? "Show less" : <button onClick={(e) => {
                    e.preventDefault();
                    setShowMore(!showMore);
                  }}> See more</button>
                  
                }
                
            </p>
          )}
    </div>


           
         <div className="absolute right-0 z-50 pointer-events-auto">
            <div className="flex gap-4 w-full p-2 flex-col justify-center items-center mx-auto sm:px-3 text-sm text-gray-600">
                  <div className="flex justify-between text-gray-600">
                {/* like with hover picker */}
                <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {showReactions && (
                    <div className="absolute -top-10 right-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-white shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
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
        
                  <div className="flex flex-col gap-2 ">
                 
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
    {/* Reaction */}

    <button onClick={() => setShowReactions(true)}
                className={`flex items-center font-semibold text-xs ${myReaction ? 'font-semibold  text-white rounded-full w-12 h-12 bg-blue-700 py-1 px-1 ' : 'bg-gray-900 py-1 px-1 text-white rounded-full w-12 h-12'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
              </svg>
              Like
        </button>

        </div>
      </div>
        
        
      </div>
                  <button className="flex items-center justify-center font-semibold gap-1 w-10 h-10 mx-4 bg-gray-900 rounded-full text-white font-bold p-1" onClick={handleCommentPop}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white font-bold">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg> 
                    {currentPost?.comments_count}
                  </button>

                   <button className="flex items-center justify-center font-semibold gap-1 w-10 h-10 mx-4 bg-gray-900 rounded-full text-white font-bold p-1">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 bg-gray-900 rounded-lg text-white font-bold"
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg> 
                  {currentPost?.comments_count}
                  </button>

                  <div className="bg-gray-800 rounded-full">  
                    <PostOptionsId post={currentPost} />
                  </div>
                </div>

    
          </div>
      </div>
       </div>

    
    {
      showCommentPop &&(
      <div className="fixed px-2 inset-0 bg-white/70 flex sm:py-5 items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full lg:w-[400px] h-full sm:my-4 flex flex-col max-w-xl border shadow-lg">

      {commentScreen}
      </div>
      </div>
      )
    }
      

 <Notification
                  message={notify.message}
                  type={notify.type}
                  onClose={() => setNotify({ message: "", type: "" })}
                />
    </div>
  );
}
