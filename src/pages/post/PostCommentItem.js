import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import PostCommentImage from "./PostCommentImage";
import PostCommentCopyText from "./PostCommentCopyText";
import { Link, useNavigate } from "react-router-dom";
import PostCommentReply from "./PostCommentReply";
import { CommentReportModal } from "./report/CommentReportModal";
import Linkify from "linkify-react";

import EmojiPicker from "emoji-picker-react";

const EMOJIS = ["❤️","👍","😂","😮","😢","🔥"];

export default function PostCommentItem({image, setIsDeleting, setIsEdit, isEdit, isDeleting, post, comment, onReplyAdded, onDelete,handleEditReply, handleDeleteReply, updateCommentTree, setPostComments }) {
  
  const [showReplies, setShowReplies] = useState(false);
  const [editText, setEditText] = useState(comment.body || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const [editImage, setEditImage] = useState(comment.image || null);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []); // ✅ array of { emoji, user }
  const [hoverReactions, setHoverReactions] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [loadingEmoji, setLoadingEmoji] = useState(null);
  const authUser = useAuth()
  const {user} = useAuth()
  const [replyText, setReplyText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { id, name }
  const [replyImage, setReplyImage] = useState(null);
  const [emojiClick, setEmojiClick] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showCommentMenu, setShowCommentMenu] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const replyInputRef = useRef(null);

  const focusReplyInput = () => {
    setTimeout(() => replyInputRef.current?.focus(), 0);
  };

  const handleReplyToComment = () => {
    const name = `${comment.user.first_name} ${comment.user.last_name}`;
      setReplyTo({ id: comment.user.id, name });
    
      // Pre-fill input with mention
      setReplyText(`@${name} `);
    
      focusReplyInput();
    };


  
useEffect(() => {
  const arr = reactions && !Array.isArray(reactions)
    ? Object.entries(reactions).flatMap(([emoji, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
      )
    : reactions || [];

  const userReact = arr.find(r => r.user?.id === currentUser?.id)?.emoji || null;
  setSelectedReaction(userReact);
}, [reactions, currentUser]);


 useEffect(() => {
  setReactions(comment.reactions || []);
}, [comment.reactions]);


const reactionArray = reactions && !Array.isArray(reactions)
  ? Object.entries(reactions).flatMap(([emoji, users]) =>
      Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
    )
  : reactions || [];

  const uniqueEmojis = [...new Set(reactionArray.map(r => r.emoji))];


const userReaction = reactionArray.find(r => r.user?.id === currentUser?.id)?.emoji || null;

const totalReactions = reactionArray.length;


  const toggleReaction = async (emoji) => {
  setLoadingEmoji(emoji); // 👈 only this emoji loads
  try {
    const res = await api.post(`/api/comments/${comment.id}/reaction`, { emoji });

    const apiReactions = res.data.reactions || {};
    const normalized = Object.entries(apiReactions).flatMap(([e, users]) =>
      Array.isArray(users) ? users.map(u => ({ emoji: e, user: u })) : []
    );

    setReactions(normalized);
    setHoverReactions(false);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingEmoji(null); // 👈 stop loading
  }
};

  useEffect(() => {
  const loadReactions = async () => {
    const res = await api.get(`/api/comments/${comment.id}/reactions`);
    setReactions(res.data.reactions || []);
  };
  loadReactions();
}, [comment.id]);

  // --- Update comment ---
  const handleUpdate = async (commentId, body) => {
  if (!body || body.trim() === "") return;

  try {
    const res = await api.put(
      `/api/posts/${commentId}/comment`,
      {
        body: body.trim()
      }
    );

    // Update comment immediately after API response
    setPostComments(prev =>
      updateCommentTree(prev, res.data.comment)
    );

    setIsEditing(false);

  } catch (err) {
    console.error(err.response?.data || err);
  }
};

const pressTimerRef = useRef(null);

const handleCommentTouchStart = (comment) => {
  pressTimerRef.current = setTimeout(() => {
    setSelectedComment(comment);
    setShowCommentMenu(true);
  }, 500);
};

const handleCommentTouchEnd = () => {
  if (pressTimerRef.current) {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = null;
  }
};


  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(comment.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const handleReport = () =>{
  setOpenReport(!openReport)
}

  
  function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w`;

  const years = Math.floor(days / 365);
  return `${years}y`;
}

const isOwner = authUser?.user?.id === comment.user?.id;
const hasText = !!comment.body;



const handleReplyToggle = () =>{
  setShowReplies(!showReplies)
}

const navigate = useNavigate()
  return (
    <div className="flex gap-3">
      
     <button onClick={() => navigate(`/profile/${user.id}`)}  className="text-white w-12 h-12 mx-auto flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"} </button>
      
      <div className="flex-1">
       <div
  className="
    bg-gray-100
    p-3
    rounded
    w-fit
    max-w-64
    sm:max-w-64
    relative
    group
  "
 onTouchStart={() => handleCommentTouchStart(comment)}
  onTouchEnd={handleCommentTouchEnd}
  onTouchCancel={handleCommentTouchEnd}
>

  {!isEditing && (
  <div className="absolute top-2 right-2 opacity-0 invisible group-hover:opacity-100 
  group-hover:visible transition-all duration-150">
    <button
      type="button"
      onClick={() => {
        setSelectedComment(comment);
        setShowCommentMenu(true);
      }}
      className="text-black p-1 rounded-full hover:bg-gray-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
        />
      </svg>
    </button>

  </div>
)}


  {/* Comment Header absolute */}
  <div className="flex items-start">

    <div className="min-w-0 max-w-full">

      {/* User */}
      <button
        onClick={() => navigate(`/profile/${comment.user?.id}`)}
        className="
          font-semibold
          text-black
          block
          max-w-full
          break-words
        "
      >
        {comment.user?.first_name || "Anonymous"}{" "}
        {comment.user?.last_name || ""}
      </button>


      {comment.body && (() => {
  const words = comment.body.trim().split(/\s+/);
  const isLongComment = words.length > 20;
  const displayedText = isLongComment
    ? words.slice(0, 20).join(" ") + "..."
    : comment.body;

  return (
    <div>
      <p
        className="
          text-sm
          text-black
          max-w-full
          whitespace-normal
          break-words
          overflow-wrap-anywhere
        "
      >
        <Linkify
          options={{
            target: "_blank",
            rel: "noopener noreferrer",
            className:
              "text-blue-600 underline break-all"
          }}
        >
          {displayedText}
        </Linkify>
      </p>

      {isLongComment && (
        <button
          type="button"
          onClick={() => handleReplyToggle()}
          className="
            mt-1
            text-sm
            font-medium
            text-blue-600
            hover:underline
          "
        >
          Show more
        </button>
      )}
    </div>
  );
})()}

      {/* Image */}
      {comment.image && (
        <div className="mt-2 max-w-full">
          <PostCommentImage image={comment.image} />
        </div>
      )}

      {/* Sending */}
      {comment.is_pending && (
        <div className="flex items-center gap-1 mt-2">
          <svg
            className="animate-spin h-4 w-4 text-blue-600"
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
              strokeWidth="3"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          <span className="text-xs text-gray-400">
            Sending...
          </span>
        </div>
      )}

    
              {isEditing && (
          <div  className=" flex fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[var(----bg-color)] text-[var(----text-color)]  p-6 rounded w-96 flex flex-col gap-4 relative">
              <h3 className="font-semibold text-lg text-center">Edit Comment</h3>

              {/* Text Input comment.body */}
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="border p-2 rounded-lg outline-none border
                 border-blue-700  w-full text-black p-4"
                placeholder="Edit your comment..."
              />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-2">
        <button onClick={() => handleUpdate(comment.id, editText)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
                  </button>
          
        <button
          onClick={() => {
            setIsEditing(false);
            setEditText(comment.body);
            setEditImage(comment.image);
            setSelectedReaction(userReaction);
          }}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
        </button>
      </div>
    </div>
  </div>
)}

</div>

       {/* create a modal */}

       {showCommentMenu && selectedComment && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
    onClick={() => setShowCommentMenu(false)}
  >
    <div
      className="bg-[var(----bg-color)] text-[var(----text-color)] rounded-xl shadow-xl w-full max-w-xs p-4"
      onClick={e => e.stopPropagation()}
    >

      {/* Modal Header */}
      <div className="flex items-center justify-between mb-3">

        <h3 className="font-semibold text-lg">
          Comment Options
        </h3>

        <button
          type="button"
          onClick={() => setShowCommentMenu(false)}
          className=""
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

      </div>

      <div className="flex flex-col gap-1">

        {/* Edit */}
        {authUser?.user?.id === selectedComment.user?.id &&
          isOwner &&
          selectedComment.body && (
            <button
              type="button"
              onClick={() => {
                setEditText(selectedComment.body);
                setIsEditing(true);
                setShowCommentMenu(false);
              }}
              className="
                w-full
                text-left
                text-sm
                hover:border border-blue-500
                rounded-lg
                p-3
                flex
                items-center
                gap-3
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                />
              </svg>

              Edit Comment
            </button>
          )}

        {/* Delete */}
        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setShowCommentMenu(false);
              setShowDeleteConfirm(true);
            }}
            className="
              w-full
              text-left
              text-sm
              border border-red-500
              rounded-lg
              p-3
              flex
              items-center
              gap-3
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>

            Delete Comment
          </button>
        )}

        {/* Copy */}
        <div
          onClick={() => setShowCommentMenu(false)}
          className="
            w-full
            hover:border border-blue-500
            rounded-lg
            p-3
          "
        >
          <PostCommentCopyText comment={selectedComment} />
        </div>

        {/* Report */}
        {!isOwner && (
          <button
            type="button"
            onClick={() => {
              setShowCommentMenu(false);
              handleReport(selectedComment);
            }}
            className="
              w-full
              text-left
              text-sm
              hover:border border-blue-500
              rounded-lg
              p-3
              flex
              items-center
              gap-3
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>

            Report
          </button>
        )}

      </div>
    </div>
  </div>
)}
          </div>
               <div className={`w-full h-full  fixed inset-0 bg-black/30 z-50 ${openReport ? 'block' : 'hidden'}`}>
                  <CommentReportModal comment={comment} onClose={handleReport} />
              </div>
          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div  className=" flex fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div className="bg-[var(----bg-color)] text-[var(----text-color)]  p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
                <span>Are you sure you want to delete this comment?</span>
                <div className="flex gap-3 justify-center">
                  <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded">
                    {loading ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-white"
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
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
}
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                </div>
              </div>
            </div>
          )}

          {/* Reactions & Reply Like */}
          {/* Reactions & Reply */}
          <div className="mt-2 flex items-center gap-2 text-sm relative group inline-block ">

            {comment.is_pending && (
        <div className="flex items-center gap-2 mt-1">
          <svg
            className="animate-spin h-4 w-4 text-blue-600"
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
              strokeWidth="3"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>

          <span className="text-xs bg-[var(----bg-color)] text-[var(----text-color)] ">
            Sending
          </span>
        </div>
      )}
            {/* MAIN reaction button */}
            <span className="text-xs bg-[var(----bg-color)] text-[var(----text-color)] ">
            {timeAgo(comment.created_at)}
          </span>
            <div
        className={`relative group inline-flex items-center gap-1 cursor-pointer
          ${userReaction ? "text-blue-600 font-semibold" : "bg-[var(----bg-color)] text-[var(----text-color)] "}`}
              onMouseEnter={() => setHoverReactions(true)}
              onMouseLeave={() => setHoverReactions(false)}
            >
              {/* LEFT: emojis or Like */}
              {uniqueEmojis.length > 0 &&(
                <div className="flex -space-x-1">
                  {uniqueEmojis.map(e => (
                    <span key={e}>{e}</span>
                  ))}
                </div>
              )}
                <span>Like</span>
              

              {/* RIGHT: count */}
              {totalReactions > 0 && (
                <span className="text-sm bg-[var(----bg-color)] text-[var(----text-color)] ">{totalReactions}</span>
              )}

  
    {/* Emoji picker */}
    {hoverReactions && (
  <div
    className="
      absolute -top-10 left-0
      opacity-0 group-hover:opacity-100
      invisible group-hover:visible
      group-hover:translate-y-2
      transform transition-all duration-500
      bg-white shadow-lg rounded-full
      px-3 py-2 flex gap-2 z-20
    "
  >
    {EMOJIS.map(e => (
      <button
        type="button"
        key={e}
        onClick={() => toggleReaction(e)}
        className="
          text-lg
          hover:scale-110
          transition
          flex items-center justify-center
        "
        disabled={loadingEmoji !== null}
      >
        {loadingEmoji === e ? (
          <svg
            className="animate-spin h-5 w-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
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
        ) : (
          e
        )}
      </button>
    ))}

    {/* Plus / More Emojis */}
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowEmojiPicker(prev => !prev);
        }}
        className="
          w-7 h-7
          rounded-full
          bg-gray-100
          text-gray-600
          text-lg
          flex items-center justify-center
          hover:bg-gray-200
          hover:scale-110
          transition
        "
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
  </div>

  <button
     onClick={() => {handleReplyToggle(); handleReplyToComment()}}
    className="bg-[var(----bg-color)] text-[var(----text-color)]  text-sm"
  >
    reply
  </button>
</div>
              


        </div>

        {/* Reply input */}
       
           <div className={`${showReplies ? 'block' : 'hidden'}`}>
           <PostCommentReply
           image={image}
            emojiClick={emojiClick}
            setEmojiClick={setEmojiClick}
            replyImage={replyImage}
            setReplyImage={setReplyImage}
            loading={loading}
            replyInputRef={replyInputRef}
            replyText={replyText}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            setReplyText={setReplyText}
            handleReplyToComment={handleReplyToComment}
            focusReplyInput={focusReplyInput}
            closeReply={handleReplyToggle}
            post={post}
            comment={comment}
            onReplyAdded={onReplyAdded}
            handleDeleteReply={handleDeleteReply}
            onEdit={handleEditReply}
            totalReaction={totalReactions}
            userReaction={userReaction}
            uniqueEmojisr ={ uniqueEmojis}
            hoverReactions={hoverReactions}
            EMOJIS={EMOJIS}
            toggleReaction ={toggleReaction}
            isDeleting={isDeleting}
            isEditing={isEdit}
            setIsEditing={setIsEdit}
            setIsDeleting={setIsDeleting}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            reactions={reactions}
            setHoverReactions={setHoverReactions} uniqueEmojis={uniqueEmojis} 
            totalReactions={totalReactions} 
            loadingEmoji={loadingEmoji}
          /> 
       </div>
      {comment.replies?.length > 0 && (
  <button onClick={handleReplyToggle} className="text-xs bg-[var(----bg-color)] text-[var(----text-color)]  font-semibold mt-1 text-end">
    {comment.replies[0].user.first_name} {comment.replies[0].user.last_name}
    {comment.replies.length > 1 && ` • ${comment.replies.length}`} reply to your comment
  </button>
)}
      </div>
    </div>
  );
}
