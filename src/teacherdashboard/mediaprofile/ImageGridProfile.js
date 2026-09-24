import { useEffect, useRef, useState } from "react";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
import api from "../../Api/axios";
import ImageGridCommentReactionShare from "../../pages/post/previewimagevideo/ImageGridCommentReactionShare";
import toast from "react-hot-toast";
import { useAuth } from "../../layout/AuthProvider";
import { PostFeedIdModalProfile } from "./PostFeedIdModalProfile";

export default function ImageGridProfile({ media = [], post, chats, setPosts, loading, setNewComment,
  emojiList, setEmojiList, newComment, postComments, setPostComments, setLoading, showEmoji, setShowEmoji,
  user, image, setImage, commentsByPost, setCommentsByPost
 }) {
  const [openOptionId, setOpenOptionId] = useState(null);
  const [openOption, setOpenOption] = useState(false);
  const [messageOpenShare, setMessageOpenShare,] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [shares, setShares] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
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


  const postRef = useRef();
  const commentInputRef = useRef(null);

  const [hasViewed, setHasViewed] = useState(false);

  // delete


  const handleDelete = async () => {
  if (!deleteTarget) return;

  try {
    setLoadingProfile(true);

    const { mediaId, postId } = deleteTarget;

    const res = await api.delete(`/api/image/media/${mediaId}`);

    if (res.data.post_deleted) {
      // Remove entire post
      setPosts(prev => prev.filter(p => p.id !== postId));
    } else {
      // Remove only media
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, media: p.media.filter(m => m.id !== mediaId) }
            : p
        )
      );
    }

    setDeleteTarget(null);
    setOpenPreview(false);
    setPreviewIndex(0);

  } finally {
    setLoadingProfile(false);
  }
};


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

    

  
    // Render
    const text = post.content || "";
    const shortText = text.length > 200 ? text.substring(0, 200) + "....." : text;


 
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
         

      {openOption === img.id && (
        <div className=" absolute top-10 right-0 mt-2 px-3 py-2 w-40 z-50 bg-white border rounded shadow-lg z-10">
            <button 
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({
                mediaId: img.id,
                postId: post.id
              });
            }}

            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Delete
            </button>
            <button onClick={() => {setOpenOption(false); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Share
            </button>
        </div>
      )}


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
        scrollbar-thin
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


{deleteTarget && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded w-72 text-center">
      <p>Are you sure you want to delete this Image?</p>

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => setDeleteTarget(null)}
          className="text-white bg-gray-800 p-2 rounded text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={loadingProfile}
         className="bg-red-500 text-white px-3 py-1 rounded">
            {loadingProfile ? <p className="flex items-center gap-2">
          <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
        </p>
      : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

{deleteTargetId && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded w-72 text-center">
      <p>Are you sure you want to delete this Image?</p>

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => setDeleteTargetId(null)}
          className="text-white bg-gray-800 p-2 rounded text-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={loadingProfile}
         className="bg-red-500 text-white px-3 py-1 rounded">
            {loadingProfile ? <p className="flex items-center gap-2">
          <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
        </p>
      : "Delete"}
        </button>
      </div>
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
           
           <button
         className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
          onClick={() =>
            setDeleteTarget({
              mediaId: current.id,
              postId: postId
            })
          }
        >
              Delete
            </button>
            <button onClick={() => {setOpenOptionId(null); setShares(!shares)}} 
            className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded">
              Share
            </button>
        </div>
      )}
        
   
      

      <button
        className="absolute left-4 text-white text-3xl"
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
        className="absolute right-4 text-white text-3xl"
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

