import { useState, useEffect, useRef } from "react";
import PostImageGridProfile from "./PostImageGridProfile";
import { useNavigate } from "react-router-dom";
import PostVideoCardProfile from "./PostVideoCardProfile";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import { PostFeedIdModalProfile } from "../../teacherdashboard/mediaprofile/PostFeedIdModalProfile";
import { Link } from "react-router-dom";
import Notification from "../../notification/Notification";
import EmojiPicker from "emoji-picker-react";


export default function PostProfileCard({ post, chats, image, setImage, postComments, 
  setPostComments, loading, setLoading, setPosts,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList,
        editContent, selectedPost, setPostLoading,fetchProfile,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal, commentsByPost, setCommentsByPost
 }) {

      const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

    const hasMedia = post.media?.some(
      media => media.type === "image" || media.type === "video"
    );

    // Different limits depending on whether there is media
    const contentLimit = hasMedia ? 32 :560;

    const shouldShowMore = text.length > contentLimit;

    const shortText = shouldShowMore
      ? text.substring(0, contentLimit) + "..."
      : text;

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
    <div className="bg-[var(----bg-color)] border border-green-200 lg:ml-52 rounded-lg max-w-xl text-[var(----text-color)] 
    shadow p-4 mb-4 ">
    <div className="relative ">
       <div className="px-2 flex justify-between mb-2 items-center">
       <div className="flex items-center  gap-3">
               <p className="font-bold text-white pb-1 bg-black text-[30px] rounded-full w-10 h-10 text-center
               flex flex-col items-center justify-center">
                 {post.user?.name?.[0]}
               </p>
               <div>
                 <p className="font-semibold">{post.user?.name}</p>
                 <p className="text-xs">{post.created_at}</p>
               </div>
             </div>
       <button
        onClick={handleOption}
        className="px-1 py-1 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>

      </button>

      {open && (
        <div className=" absolute top-6 right-0 mt-2 px-3 py-2 w-40 z-50 bg-gray-800 text-white border rounded shadow-lg z-10">
            {post.content && post.content.trim() !== "" && (
            <button
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:border border-blue-600 rounded"
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
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:border border-blue-600  rounded">
              Delete
            </button>
            <button onClick={() => {handleOption(); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:border border-blue-600  rounded">
              Share
            </button>
        </div>
      )}
      </div>
        
      {post.content && (
        <div className="px-3 pb-2 font-semibold break-words whitespace-normal
         text-[10px]">
          <p className="px-2">
            {shouldShowMore ? shortText : text}

            {shouldShowMore && (
              <button
                type="button"
                onClick={() => {
                        setPostIdModal(post);

                        setPostComments(
                          commentsByPost[post.id] || []
                        );

                        focusCommentInput();
                      }}
                className="
                  ml-1
                  text-blue-600
                  font-bold
                  hover:text-blue-800
                  hover:underline
                "
              >
                See more
              </button>
            )}
          </p>
        </div>
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
             counts = {counts}
                              total_reaction = {total}
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
                              setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
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
               counts = {counts}
                              total_reaction = {total}
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
                              setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
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
          ))}
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
    </div>

{/* Reaction List  */}


      <div className="flex justify-between border-t-2 px-4 mt-4 items-center ">

        <div className="flex gap-1 items-center">
       <div className=" text-xs inline-flex items-center gap-2 bg-[var(----bg-color)] text-[var(----text-color)] ">
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

        <p className="inline-flex bg-[var(----bg-color)] text-[var(----text-color)]  gap-1 items-center">
      {post.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex gap-1 bg-[var(----bg-color)] text-[var(----text-color)]  items-center">
      {post.shares_count}
           <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 bg-[var(----bg-color)] text-[var(----text-color)] "
        >
          <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
        </svg>
      </p>

       <p className="inline-flex gap-1 bg-[var(----bg-color)] text-[var(----text-color)]  items-center">
      {post.reposts_count}
           <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 bg-[var(----bg-color)] text-[var(----text-color)] "
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
  <div className="flex items-center bg-[var(----bg-color)] text-[var(----text-color)]  justify-around py-3 text-sm bg-[var(----bg-color)] text-[var(----text-color)] ">
                  <div className="flex justify-between text-white  mx-4">
                {/* like with hover picker */}
                <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                   {showReactions && (
                   <div
                     className="
                       absolute -top-14 left-0
                       opacity-0 group-hover:opacity-100
                       invisible group-hover:visible
                       group-hover:translate-y-2
                       transform transition-all duration-500
                       bg-white shadow-lg rounded-full
                       px-3 py-2 flex gap-2 z-20
                     "
                   >
                     {reactionList.map((emoji) => (
                       <span
                         key={emoji}
                         onClick={() => !reactionLoading && toggleReaction(emoji)}
                         className={`text-2xl transition cursor-pointer ${
                           reactionLoading
                             ? "opacity-50 pointer-events-none"
                             : "hover:scale-125"
                         }`}
                       >
                         {reactionLoading && myReaction === emoji
                           ? "⏳"
                           : emoji}
                       </span>
                     ))}
                 
                     {/* Plus / More Emojis */}
                     <div className="relative flex items-center">
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                 
                           if (!reactionLoading) {
                             setShowEmojiPicker((prev) => !prev);
                           }
                         }}
                         disabled={reactionLoading}
                         className={`
                           w-8 h-8
                           rounded-full
                           bg-gray-100
                           text-gray-600
                           text-xl
                           flex items-center justify-center
                           transition
                           ${
                             reactionLoading
                               ? "opacity-50 cursor-not-allowed"
                               : "hover:bg-gray-200 hover:scale-110"
                           }
                         `}
                       >
                         +
                       </button>
                 
                       {/* Full Emoji Picker */}
                       {showEmojiPicker && (
                         <div
                           className="absolute bottom-full left-0 mb-2 z-[9999]"
                           onClick={(e) => e.stopPropagation()}
                         >
                           <EmojiPicker
                             onEmojiClick={(emojiData) => {
                               toggleReaction(emojiData.emoji);
                               setShowEmojiPicker(false);
                             }}
                           />
                         </div>
                       )}
                     </div>
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
                  <button className="flex items-center font-semibold " onClick={() => {
                        setPostIdModal(post);

                        setPostComments(
                          commentsByPost[post.id] || []
                        );

                        focusCommentInput();
                      }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg> Comment
                  </button>

                   <button onClick={() => setShares(!shares)} className="flex items-center font-semibold gap-1 mx-4">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 bg-[var(----bg-color)] text-[var(----text-color)] "
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg>
                    Share
                  </button>
                </div>
                    {showDeleteModal && (
                      <div className="fixed inset-0 bg-black/50 flex z-50 items-center justify-center">
                        <div className="bg-gray-800 text-[var(----text-color)]  p-4 rounded w-72 text-center">
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
                        <div className=" text-white bg-gray-800  p-4 rounded-lg w-80 sm:w-96">
                          <h3 className="font-semibold my-4 text-center">Edit Post</h3>

                          <textarea
                            className="w-full border text-sm text-black p-2 h-40 rounded-lg 
                             scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
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
    <div className="space-y-2 max-h-96 relative overflow-y-auto bg-[var(----bg-color)] text-[var(----text-color)]  p-4 w-80 sm:w-96 mx-autoz-50 rounded-lg pr-2 scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      <h1 className="text-xl font-bold bg-[var(----bg-color)] text-[var(----text-color)]  py-3">User Likes</h1>
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
                    reactionLoading={reactionLoading}  setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
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
