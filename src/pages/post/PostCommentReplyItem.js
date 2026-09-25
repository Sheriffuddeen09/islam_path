import { useRef, useState } from "react";
import PostCommentImage from "./PostCommentImage";
import PostCommentCopyText from "./PostCommentCopyText";
import PostReplyListMap from "./PostReplyListMap";
import { useAuth } from "../../layout/AuthProvider";
import { useNavigate } from "react-router-dom";
import { PostReplyInput } from "./PostReplyInput";
import { CommentReportModal } from "./report/CommentReportModal";
import Linkify from "linkify-react";
import EmojiPicker from "emoji-picker-react";
import PostCommentVideo from "./PostCommentVideo";

import {
  Pencil,
  X,
  Check,
} from "lucide-react";

export default function PostCommentReplyItem ({image, handleReplyToComment, loading, loadingEmoji, 
                      replyInputRef, handleDelete, handleUpdate, isEditing, 
                      isDeleting, toggleReaction, uniqueEmojisr, totalReaction, onEdit, closeReply, 
                      onDelete, onReact, post, replyText, setReplyText, comment, onReplyAdded,
                      replyTo, focusReplyInput, setReplyTo, replyImage, setReplyImage, emojiClick, setEmojiClick}){

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.body);
    const [showReactions, setShowReactions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
    const REPLY_EMOJIS = ['❤️','👍','😂','😮','😢','🔥'];
    const [isEditingComment, setIsEditingComment] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const authUser = useAuth()
    const {user} = useAuth()
    const [openReport, setOpenReport] = useState(false);

     const [showCommentMenu, setShowCommentMenu] = useState(false);
      const [selectedComment, setSelectedComment] = useState(null);

   const handleReport = () =>{
  setOpenReport(!openReport)
}
// loading
  const commentPressTimer = useRef(null);
const commentLongPressTriggered = useRef(false);

const handleCommentTouchStart = (comment) => {
  clearTimeout(commentPressTimer.current);

  commentLongPressTriggered.current = false;

  commentPressTimer.current = setTimeout(() => {
    commentLongPressTriggered.current = true;

    // Select the comment
    setSelectedComment(comment);

    // Open comment options
    setShowCommentMenu(true);

    console.log("COMMENT LONG PRESS:", comment.id);
  }, 500);
};

const handleCommentTouchEnd = () => {
  clearTimeout(commentPressTimer.current);
};

const [isSubmitting, setIsSubmitting] = useState(false);
 


const sendTextReply = async () => {
  if (!replyText.trim()) return;

  setIsSubmitting(true);

  await onReplyAdded(comment.id, replyText, null, null);

  setReplyText("");
  setReplyTo(null);
  setIsSubmitting(false);
};


const sendVideoReply = async (file) => {
  if (!file) return;

  setIsSubmitting(true);

  try {
    await onReplyAdded(
      comment.id,
      replyText,
      null,
      null,
      file
    );

    setReplyText("");
    setReplyTo(null);
  } finally {
    setIsSubmitting(false);
  }
};

const sendImageReply = async (file) => {
  if (!file) return;

  setIsSubmitting(true);

  await onReplyAdded(comment.id, replyText, file, null);

  setReplyText("");
  setReplyTo(null);
  setIsSubmitting(false);
};


const sendEmojiReply = async (emoji) => {
  setIsSubmitting(true);

  await onReplyAdded(comment.id, replyText + emoji, null, emoji);

  setEmojiClick(false);
  setReplyText("");
  setReplyTo(null);
  setIsSubmitting(false);
};





//length


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

const navigate = useNavigate()

const contentDelete = (
  <div>
    {showDeleteConfirm && (
   <div className={`fixed inset-0 bg-black/30 z-50 flex items-center justify-center z-50 `}>
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
  </div>
    )
const contentEdit = (
  <div> 
{isEditingComment && (
  <div
    className="
      fixed inset-0 z-[9999]
      flex items-center justify-center
      p-4
      bg-black/60
      backdrop-blur-sm
    "
    onClick={() => {
      setIsEditingComment(false);
      setEditText(comment?.body || "");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        relative
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
      "
    >
      {/* ================= HEADER ================= */}
      <div
        className="
          flex items-center justify-between
          px-5 py-4
          border-b border-white/10
        "
      >
        <div className="flex items-center gap-3">
          {/* Edit Icon */}
          <div
            className="
              flex items-center justify-center
              w-10 h-10
              rounded-xl
              bg-blue-500/10
              text-blue-500
            "
          >
            <Pencil size={19} />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              Edit Comment
            </h3>

            <p className="text-xs opacity-50 mt-0.5">
              Make changes to your comment
            </p>
          </div>
        </div>

        {/* Header Close */}
        <button
          type="button"
          onClick={() => {
            setIsEditingComment(false);
            setEditText(comment?.body || "");
          }}
          className="
            flex items-center justify-center
            w-9 h-9
            rounded-full
            opacity-60
            hover:opacity-100
            hover:bg-white/10
            transition
          "
        >
          <X size={19} />
        </button>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-5">
        <label className="block text-xs font-medium opacity-60 mb-2">
          Your comment
        </label>

        {/* Textarea */}
        <div
          className="
            relative
            rounded-xl
            border border-white/10
            bg-black/5
            focus-within:border-blue-500/60
            focus-within:ring-2
            focus-within:ring-blue-500/10
            transition
          "
        >
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            maxLength={700}
            placeholder="Edit your comment..."
            className="
              w-full
              resize-none
              bg-transparent
              px-4 py-3
              text-sm
              outline-none
              placeholder:opacity-40
              scrollbar-thin
              scrollbar-thumb-white/20
              scrollbar-track-transparent
            "
          />

          {/* Character Count */}
          <div className="flex justify-end px-4 pb-2">
            <span className="text-[10px] opacity-40">
              {editText.length}/700 characters
            </span>
          </div>
        </div>

        <p className="mt-2 text-[11px] opacity-40">
          Edit your comment and save your changes.
        </p>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        className="
          flex items-center justify-end
          gap-2
          px-5 py-4
          border-t border-white/10
          bg-black/5
        "
      >
        {/* Cancel */}
        <button
          type="button"
          onClick={() => {
            setIsEditingComment(false);
            setEditText(comment?.body || "");
          }}
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-xl
            bg-white/5
            border border-white/10
            text-[var(--text-color)]
            opacity-70
            hover:opacity-100
            hover:bg-white/10
            transition
          "
          title="Cancel"
        >
          <X size={18} />
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={() => {
            handleUpdate(comment?.id, editText);
            setIsEditingComment(false);
            setEditText(comment?.body || "");
          }}
          disabled={!editText.trim()}
          className="
            flex items-center justify-center
            gap-2
            min-w-[105px]
            h-10
            px-4
            rounded-xl
            bg-blue-500
            hover:bg-blue-600
            active:scale-[0.98]
            text-white
            text-sm
            font-medium
            shadow-lg
            shadow-blue-500/20
            transition-all
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
          title="Save changes"
        >
          <Check size={18} />
          <span>Save</span>
        </button>
      </div>
    </div>
  </div>
)}

  </div>
)
    return(
    
        <div className="fixed px-2 inset-0 bg-white/90 flex sm:py-5 items-center justify-center z-50">
      <div className="bg-white  text-black rounded-xl w-full md:h-[570px]  sm:my-4 flex flex-col py-3 max-w-xl border shadow-lg">
{/* bg-gray-100 */}
    <div>
    <div className="flex justify-around sm:justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-center sm:mx-auto">
            {post.user.name}'s Post
          </h2>
          <button
            onClick={closeReply}
            className="w-8 h-8 sm:block hidden rounded-full flex items-center justify-center"
          >
            ✕
          </button>
          <button
            onClick={closeReply}
            className="block text-xs sm:hidden rounded-full font-bold whitespace-nowrap"
          >
            View Post
          </button>
        </div>
<div className="overflow-y-auto overflow-x-hidden scroll-bar h-[340px]
    scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
         <p className="text-black  px-5 inline-flex text-sm font-bold my-2 items-center gap-2 ">
          Reply {comment?.replies?.length}</p>
  <div className="px-4 py-2">
    <div className="inline-flex gap-2 items-start">
      <button onClick={() => navigate(`/profile/${user.id}`)} className="text-white w-8 h-8 flex flex-col justify-center items-center text-2xl font-bold  rounded-full bg-blue-800 "> 
        {comment?.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</button>
    <div className="bg-blue-100 w-fit
    max-w-64
    sm:max-w-64 flex-1 relative group 
     px-4 py-2 rounded "
     
      onTouchStart={(e) => {
        e.stopPropagation();

        // Don't start long press from buttons/links/images
        if (
          e.target.closest("button") ||
          e.target.closest("a") ||
          e.target.closest("input") ||
          e.target.closest("textarea")
        ) {
          return;
        }

        handleCommentTouchStart(comment);
      }}

      onTouchMove={() => {
        // Moving means scrolling, not long press
        if (!commentLongPressTriggered.current) {
          clearTimeout(commentPressTimer.current);
        }
      }}

      onTouchEnd={(e) => {
        e.stopPropagation();
        handleCommentTouchEnd();
      }}

      onTouchCancel={() => {
        handleCommentTouchEnd();
      }}>

           
          <div className="
          flex flex-1 justify-between items-center
      ">
          <button onClick={() => navigate(`/profile/${user.id}`)} className="text-black mr-6 font-bold">
            {comment?.user.first_name} {comment?.user.last_name}</button>
             
    <button
      type="button"
      onTouchStart={(e) => {
          e.stopPropagation();
          clearTimeout(commentPressTimer.current);
        }}
        onClick={(e) => {
          e.stopPropagation();

          setSelectedComment(comment);
          setShowCommentMenu(true);
        }}
      className="text-black p-1 lg:block hidden
      opacity-0 invisible group-hover:opacity-100 
      group-hover:visible transition-all duration-150
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
          d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
        />
      </svg>
    </button>

    </div>


           {comment?.body && (
            <p className="text-sm text-black  max-w-full
          whitespace-normal
          break-words
          overflow-wrap-anywhere">
              <Linkify
                options={{
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 underline break-all"
                }}
              >
                {comment?.body}
              </Linkify>
            </p>
          )}

     {/* Comment in Reply */}
            

     {comment?.image && <PostCommentImage image={comment?.image} />}

      {comment.video && (
        <div className="mt-2 max-w-full">
          <PostCommentVideo video={comment.video} />
        </div>
      )}
        
<div className="inline-flex gap-3 items-center cursor-pointer">
  <span className="text-xs">{timeAgo(comment.created_at)}</span>

  {/* Reaction hover group */}
  <div className="relative group/react inline-block">
    {uniqueEmojisr.length > 0 &&
      uniqueEmojisr.map(e => (
        <span className="text-sm" key={e}>{e}</span>
      ))
    }

    <span className="text-sm  ">Like</span>

    {totalReaction > 0 && (
      <span className="ml-2   text-sm font-semibold">{totalReaction}</span>
    )}

    {/* Hover reactions: ONLY when hovering this area */}
    <div
  className="
    absolute bottom-2 left-0 mb-2
    flex gap-2 p-2
    bg-white border rounded shadow
    opacity-0 invisible
    group-hover/react:visible group-hover/react:opacity-100
    transform group-hover/react:-translate-y-2
    transition-all duration-200 z-50
  "
>
  {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(e => (
    <button
      type="button"
      key={e}
      onClick={() => toggleReaction(e)}
      className="text-lg hover:scale-110 transition flex items-center justify-center"
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

  {/* Plus / More Emoji */}
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

    {/* Emoji Picker */}
    {showEmojiPicker && (
      <div
        className="absolute bottom-full right-0 mb-2 z-[9999]"
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
  </div>
</div>

    </div>
    </div>
     
</div>

{contentDelete}
{contentEdit}

 <div className={`w-full h-full  fixed inset-0 bg-black/30 z-50 ${openReport ? 'block' : 'hidden'}`}>
    <CommentReportModal comment={comment} onClose={handleReport} />
</div>

{showCommentMenu && selectedComment && (
  <div
    className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-[9999]
      p-4
    "
    onClick={() => setShowCommentMenu(false)}
  >
    <div
      className="
        bg-white text-black
        rounded-xl
        shadow-xl
        w-full
        max-w-xs
        p-4
      "
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">
          Comment Options
        </h3>

        <button
          type="button"
          onClick={() => setShowCommentMenu(false)}
          className="
            
            
            p-1
            rounded-full
            
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
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-1">

        {/* EDIT */}
        {isOwner && hasText && (
          <button
            type="button"
            onClick={() => {
              setIsEditingComment(true);
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

        {/* DELETE */}
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

        {/* COPY */}
        <div
          onClick={() => setShowCommentMenu(false)}
          className="
            w-full
            hover:border border-blue-500
            rounded-lg
            p-3
          "
        >
          <PostCommentCopyText
            comment={selectedComment}
          />
        </div>

        {/* REPORT */}
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

        {/* REPLY TO */}
        {!isOwner && (
          <button
            type="button"
            onClick={() => {
              setShowCommentMenu(false);
              handleReplyToComment(selectedComment);
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
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
              />
            </svg>

            Reply To
          </button>
        )}

      </div>
    </div>
  </div>
)}


{/* replies */}
      {(comment?.replies ?? []).map((reply) => (
        <PostReplyListMap
          key={reply.id}

          editing={editing}
          setEditing={setEditing}

          reply={reply}

          setShowDeleteConfirm={setShowDeleteConfirm}
          setShowReactions={setShowReactions}

          comment={comment}

          timeAgo={timeAgo}

          showReactions={showReactions}

          editText={editText}
          setEditText={setEditText}

          onEdit={onEdit}
          onDelete={onDelete}

          isDeleting={isDeleting}
          isEditing={isEditing}
          showDeleteConfirm={showDeleteConfirm}

          onReact={onReact}

          authUser={authUser ?? null}

          totalReaction={totalReaction}
          toggleReaction={toggleReaction}
          uniqueEmojisr={uniqueEmojisr}

          replyTo={replyTo}
          setReplyTo={setReplyTo}

          setReplyText={setReplyText}

          handleReplyToComment={handleReplyToComment}

          focusReplyInput={focusReplyInput}

          setEmojiClick={setEmojiClick}

          setReplyImage={setReplyImage}

          emojiClick={emojiClick}
          replyImage={replyImage}
        />
      ))}

      
      

      {/* Reply input */}
</div>
</div>


          {/* Reply Input */}

          <PostReplyInput image={image} isSubmitting={isSubmitting} sendImageReply={sendImageReply} replyInputRef={replyInputRef}
          sendTextReply={sendTextReply} setEmojiClick={setEmojiClick} sendEmojiReply={sendEmojiReply} setReplyTo={setReplyTo}
          REPLY_EMOJIS={REPLY_EMOJIS} emojiClick={emojiClick} replyText={replyText} setReplyText={setReplyText} replyTo={replyTo} 
          sendVideoReply={sendVideoReply} />
           </div>
        </div>

    )


    
}

