import PostOptions from "./PostOption";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";
import { useEffect, useRef, useState } from "react";
import Notification from "../../Form/Notification";
import api from "../../Api/axios"; 
import { PostFeedIdModal } from "./PostFeedIdModal";
import {toast} from "react-hot-toast"
import PostVideoCard from "./PostVideoCard";


export default function PostCardVideo({ post, setPosts, image, setImage, postComments, setPostComments, 
  loading, setLoading, showUsersPopup, setShowUsersPopup, newComment, setNewComment, emojiList, setEmojiList,
showEmoji, setShowEmoji }) {

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


  return (
    <div
      className={`rounded-xl shadow md:w-96 lg:w-[400px] w-full border`}
    >
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
      <PostOptions post={post} />
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
      {post.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex gap-1 items-center">
      {post.comments_count}
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

                   <button className="flex items-center font-semibold gap-1 mx-4">
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
      
       <Notification
                  message={notify.message}
                  type={notify.type}
                  onClose={() => setNotify({ message: "", type: "" })}
                />
    </div>
  );
}
