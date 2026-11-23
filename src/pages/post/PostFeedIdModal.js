import { Link } from "react-router-dom";
import { useState } from "react";
import PostComment from "./PostComment";
import api from "../../Api/axios";
import { PostCommentInput } from "./PostCommentInput";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";

export function PostFeedIdModal({ postId, post, onClose, commentsByPost, setCommentsByPost,
                                postComments, setPostComments, commentInputRef,
                                image, setImage, loading, currentUser, newComment, setNewComment, emojiList, showEmoji,
                                setShowEmoji, chats, video, setVideo
                              }) {

  const [messageOpenShare, setMessageOpenShare] = useState(false)
  const [shares, setShares] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);
  const [commentsMetaByPost, setCommentsMetaByPost] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);

  const replaceCommentById = (comments, tempId, newComment) => {
    return comments.map(comment => {
      if (comment.id === tempId) {
        return newComment;
      }
  
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: replaceCommentById(
            comment.replies,
            tempId,
            newComment
          ),
        };
      }
  
      return comment;
    });
  };
  
  
  const removeCommentById = (comments, tempId) => {
    return comments
      .filter(comment => comment.id !== tempId)
      .map(comment => ({
        ...comment,
        replies: comment.replies?.length
          ? removeCommentById(comment.replies, tempId)
          : comment.replies,
      }));
  };
  
  const postComment = async (
  emoji = null,
  imageFile = null,
  parentId = null,
  videoFile = null
) => {
  const commentBody =
    emoji || newComment?.trim() || "";

  if (
    !commentBody &&
    !imageFile &&
    !videoFile
  ) {
    return;
  }

  const tempId = `temp-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const imagePreview =
    imageFile instanceof File
      ? URL.createObjectURL(imageFile)
      : null;

  const videoPreview =
    videoFile instanceof File
      ? URL.createObjectURL(videoFile)
      : null;

  const temporaryComment = {
    id: tempId,

    body: commentBody,

    image: imagePreview,

    video: videoPreview,

    user: currentUser,
    user_id: currentUser?.id,

    created_at: new Date().toISOString(),

    is_pending: true,
  };

  setPostComments(prev => {
  const updated = parentId
    ? addReplyToComment(prev, parentId, temporaryComment)
    : [temporaryComment, ...prev];

  setCommentsByPost(cache => ({
    ...cache,
    [postId]: updated,
  }));

  return updated;
});

  setNewComment("");
  setImage(null);
  setShowEmoji(false);

  const formData = new FormData();

  if (commentBody) {
    formData.append("body", commentBody);
  }

  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  if (videoFile instanceof File) {
    formData.append("video", videoFile);
  }

  try {
    const res = await api.post(
      `/api/posts/${postId}/comments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const savedComment = res.data.comment;

    setPostComments(prev => {
  const updated = replaceCommentById(
    prev,
    tempId,
    savedComment
  );

  setCommentsByPost(cache => ({
    ...cache,
    [postId]: updated,
  }));

  return updated;
});

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

  } catch (err) {
    console.error(
      err.response?.data || err
    );

    setPostComments(prev => {
  const updated = removeCommentById(prev, tempId);

  setCommentsByPost(cache => ({
    ...cache,
    [postId]: updated,
  }));

  return updated;
});

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  }
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


  
  if (!post) return null;

  return (
    <div
      className="
                                fixed
                                inset-0
                                z-[200]
                                bg-black/70
                                flex
                                w-full 
                                h-full
                                flex-1
                                items-end
                                justify-center
                            "
                        >
    
                            <div
                                className="
                                    w-full relative
                                    bg-[var(--bg-color)]
                                    rounded-t-2xl
                                    p-4
                                    max-h-[80%]
                                    sm:max-w-[60%]
                                    
                                "
                            >
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-center mx-auto">
            {post.user.name}'s Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
       
         <div className="flex-1 w-full">
       <PostComment
          postId={post.id}
          image={image}
          post={post}
          postComments={postComments}
          setPostComments={setPostComments}
          commentsByPost={commentsByPost}
          setCommentsByPost={setCommentsByPost}
          commentsMetaByPost={commentsMetaByPost}
          setCommentsMetaByPost={setCommentsMetaByPost}
          commentLoading={commentLoading}
          setCommentLoading={setCommentLoading}
        />
        </div> 
       

        
        <PostCommentInput 
          newComment={newComment}
          loading={loading}
          setNewComment={setNewComment}
          setImage={setImage} video={video} setVideo={setVideo}
          image={image}
          showEmoji={showEmoji}
          setShowEmoji={setShowEmoji}
          emojiList={emojiList}
          postComment={postComment}
          commentInputRef={commentInputRef}
          commentLoading={commentLoading}
          setCommentLoading={setCommentLoading}
        />

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
  );
}
