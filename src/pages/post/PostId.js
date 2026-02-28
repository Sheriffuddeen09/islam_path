import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PostFeedId } from "./PostFeedId";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import Notification from "../../Form/Notification";
import SidebarLeft from "../homepageComponent/SideBarLeft";
import SideBarRIght from "../homepageComponent/SidebarRight";

export default function PostId({image, postComments, setPostComments, newComment, setNewComment,
  showEmoji, setShowEmoji, emojiList, setEmojiList, chats,
  loading, setLoading, setImage, setShowUsersPopup, showUsersPopup}) {


  const { id } = useParams();
  const [post, setPost] = useState(null);
  const {user: currentUser} = useAuth();
  const [usersPreview, setUsersPreview] = useState([]); 
  const {user} = useAuth()
  const [counts, setCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [postIdModal, setPostIdModal] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [notify, setNotify] = useState({ message: "", type: "" });


  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`);
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
    }
  };


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
    if (post?.reacted_users) {
      setUsersPreview(post.reacted_users.slice(0, 6));
    }
  }, [post?.reacted_users]);
  

  useEffect(() => {
  api.get(`/api/post/${post?.id}/reactions`).then(res => {
    setCounts(res.data.counts || {});
    setUsersPreview(res.data.users?.slice(0,6) || []);
    setMyReaction(res.data.my_reaction || null);
  });
}, [post]);

  
const showNotification = (msg) => {
    setNotify({ message: msg, type: "error" });

      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };

const commentInputRef = useRef(null);

const focusCommentInput = () => {
  setTimeout(() => commentInputRef.current?.focus(), 0);
};


const total = Object.values(counts || {}).reduce((a, b) => a + b, 0);

const othersCount = usersPreview.filter(
  (u) => u.id !== currentUser?.id
).length;

const me = usersPreview.find(
  (u) => u.id === currentUser?.id
);

  if (!post) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

    
      const largeScreen = (
        <div className="block md:hidden lg:block">
            <div className="flex flex-col lg:flex-row  items-center justify-around lg:mr-60  mx-auto min-h-screen bg-white text-gray-800">
            {/* Mobile Menu Button */}
        
        <div className="flex-1 transition-all mx-auto p-4 mt-14 gap-3 flex flex-col items-center">
          <PostFeedId 
            total={total} othersCount={othersCount} setShowUsersPopup={setShowUsersPopup} me={me} 
            image={image} setImage={setImage} postComments={postComments} loading={loading} setLoading={setLoading}
            showUsersPopup={showUsersPopup} currentUser={currentUser} usersPreview={usersPreview}
            user={user} counts={counts} setShowReactions={setShowReactions} 
            reactionLoading={reactionLoading}  setPostComments={setPostComments}
            showReactions={showReactions} reactionList={reactionList} commentInputRef={commentInputRef}
            toggleReaction={toggleReaction} onLikeClick={onLikeClick} focusCommentInput={focusCommentInput}
            myReaction={myReaction} postId={post.id} post={post}
            newComment={newComment} setNewComment={setNewComment}
            showEmoji={showEmoji} setShowEmoji={setShowEmoji}
            emojiList={emojiList} setEmojiList={setEmojiList} chats={chats}
     />
          </div>
         
          
          <SideBarRIght />
        </div>
        </div>
      );
    
      const ipadScreen = (
              <div className="md:block lg:hidden hidden">
            <div className="flex flex-col items-center  mx-auto min-h-screen bg-white text-gray-800">
            {/* Mobile Menu Button */}
    
          <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
          <PostFeedId 
            total={total} othersCount={othersCount} setShowUsersPopup={setShowUsersPopup} me={me} 
            image={image} setImage={setImage} postComments={postComments} loading={loading} setLoading={setLoading}
            showUsersPopup={showUsersPopup} currentUser={currentUser} usersPreview={usersPreview}
            user={user} counts={counts} setShowReactions={setShowReactions} 
            reactionLoading={reactionLoading}  setPostComments={setPostComments}
            showReactions={showReactions} reactionList={reactionList} commentInputRef={commentInputRef}
            toggleReaction={toggleReaction} onLikeClick={onLikeClick} focusCommentInput={focusCommentInput}
            myReaction={myReaction} postId={post.id} post={post}
            newComment={newComment} setNewComment={setNewComment}
            showEmoji={showEmoji} setShowEmoji={setShowEmoji}
            emojiList={emojiList} setEmojiList={setEmojiList} chats={chats}
     />
          </div>
          
        </div>
        </div>
      );
    

  return (
    <div>
        
    {largeScreen}
    {ipadScreen}  

      <Notification
                       message={notify.message}
                       type={notify.type}
                       onClose={() => setNotify({ message: "", type: "" })}
                     />
    </div>
  );
}