import { useState } from "react";
import PostCommentImage from "./PostCommentImage";
import PostCommentCopyText from "./PostCommentCopyText";
import PostReplyListMap from "./PostReplyListMap";
import { useAuth } from "../../layout/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { PostReplyInput } from "./PostReplyInput";
import { CommentReportModal } from "./report/CommentReportModal";
import Linkify from "linkify-react";

export default function PostCommentReplyItem ({image, handleReplyToComment, loading, loadingEmoji, 
                      setIsEditing, replyInputRef, handleDelete, handleUpdate, isEditing, 
                      isDeleting, toggleReaction, uniqueEmojisr, totalReaction, onEdit, closeReply, 
                      onDelete, onReact, post, replyText, setReplyText, comment, onReplyAdded,
                      replyTo, focusReplyInput, setReplyTo, replyImage, setReplyImage, emojiClick, setEmojiClick}){

    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.body);
    const [showReactions, setShowReactions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteComment, setShowDeleteComment] = useState(false);
    const REPLY_EMOJIS = ['❤️','👍','😂','😮','😢','🔥'];
    const [isEditingComment, setIsEditingComment] = useState(false)
    const authUser = useAuth()
    const {user} = useAuth()
    const [openReport, setOpenReport] = useState(false);

   const handleReport = () =>{
  setOpenReport(!openReport)
}
// loading
    



const [isSubmitting, setIsSubmitting] = useState(false);

const buildReplyBody = (baseText = "") => {
  if (!replyTo) return baseText;
  const mention = `@${replyTo.name} `;
  return baseText.startsWith(mention) ? baseText : mention + baseText;
};


const sendTextReply = async () => {
  if (!replyText.trim()) return;

  setIsSubmitting(true);
  const body = buildReplyBody(replyText);
  await onReplyAdded(comment.id, body, null, null);
  setReplyText("");
  setReplyTo(null);
  setIsSubmitting(false);
};

const sendImageReply = async (file) => {
  if (!file) return;

  setIsSubmitting(true);
  const body = buildReplyBody(""); // 👈 still send mention in body
  await onReplyAdded(comment.id, body, file, null);
  setIsSubmitting(false);
};

const sendEmojiReply = async (emoji) => {
  setIsSubmitting(true);
  const body = buildReplyBody(emoji); // 👈 emoji + mention
  await onReplyAdded(comment.id, body, null, emoji);
  setEmojiClick(false);
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
    {showDeleteComment && (
   <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center z-50 `}>
              <div className="bg-gray-200 text-red-700 p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
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
                  <button onClick={() => setShowDeleteComment(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
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
          <div className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center z-50`}>
            <div className="bg-gray-200 p-6 bg-gray-50 rounded sm:w-96 w-80 items-center mx-auto justify-center flex flex-col gap-4">
              <h3 className="font-semibold text-lg text-center text-black">Edit Comment</h3>

              {/* Text Input comment.body */}
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="border p-2 rounded-lg h-40 outline-none border
                 border-blue-700  w-full text-black p-4"
                placeholder="Edit your comment..."
              />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-2">
        <button onClick={() => handleUpdate(comment.id, editText)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
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
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>

}
                  </button>
          
        <button
          onClick={() => {
            setIsEditingComment(false);
            setEditText(comment.body);
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
)
    return(
    
        <div className="fixed px-2 inset-0 bg-white/90 flex sm:py-5 items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full md:h-[570px]  sm:my-4 flex flex-col py-3 max-w-xl border shadow-lg">

    <div>
    <div className="flex justify-around sm:justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-black text-center sm:mx-auto">
            {post.user.name}'s Post
          </h2>
          <button
            onClick={closeReply}
            className="w-8 h-8 sm:block hidden rounded-full bg-gray-200 flex items-center justify-center"
          >
            ✕
          </button>
          <button
            onClick={closeReply}
            className="block text-xs text-blue-900 sm:hidden rounded-full font-bold whitespace-nowrap"
          >
            View Post
          </button>
        </div>
<div className="overflow-y-auto overflow-x-hidden scroll-bar h-[340px]
    scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
         <p className="text-black px-5 inline-flex text-sm font-bold my-2 items-center gap-2 ">
          Reply {comment.replies.length}</p>
  <div className="px-4 py-2">
    <div className="inline-flex gap-2 items-start">
      <button onClick={() => navigate(`/profile/${user.id}`)} className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> 
        {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</button>
    <div className="bg-gray-50 sm:w-60 w-full flex-1 relative group  px-4 py-2 rounded-lg ">
        <div className=" flex flex-row justify-between  items-start">
          <div>
          <button onClick={() => navigate(`/profile/${user.id}`)} className="text-black font-bold">
            {comment.user.first_name} {comment.user.last_name}</button>
           {comment.body && (
            <p className="text-sm text-black max-w-xs break-words">
              <Linkify
                options={{
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 underline break-all"
                }}
              >
                {comment.body}
              </Linkify>
            </p>
          )}

        </div>
     {/* Comment in Reply */}
              <div className="absolute top-2 right-2">
            <div className="opacity-0 group-hover:opacity-100 transition">
              <div className="relative group/icon">
                
                {/* ICON */}
                <button className="text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                </button>

                {/* MENU: only on ICON hover */}
                <div className="absolute right-0 bg-white border rounded shadow
                                opacity-0 invisible
                                group-hover/icon:visible group-hover/icon:opacity-100
                                transition p-2 flex flex-col gap-2 z-50">

                  {isOwner && hasText && (
                    <button onClick={() => setIsEditing(true)} className="whitespace-nowrap text-sm hover:text-gray-800 inline-flex items-center gap-2 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-blue-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Edit Comment
                    </button>
                  )}

                  {isOwner && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="whitespace-nowrap text-sm hover:text-gray-800 inline-flex items-center gap-2 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-red-500">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      Delete Comment
                      </button>
                  )}

                  <PostCommentCopyText comment={comment} />

                  {!isOwner && (
                  <button onClick={handleReport}  className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>

                    Report
                  </button>
                  )}

                  {!isOwner && (
                  <button onClick={handleReplyToComment} className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                    </svg>

                    Reply To
                  </button>
                  )}
                </div>

              </div>
            </div>
          </div>

    </div>

     {comment.image && <PostCommentImage image={comment.image} />}

        
<div className="inline-flex gap-3 items-center cursor-pointer">
  <span className="text-black text-xs">{timeAgo(comment.created_at)}</span>

  {/* Reaction hover group */}
  <div className="relative group/react inline-block">
    {uniqueEmojisr.length > 0 &&
      uniqueEmojisr.map(e => (
        <span className="text-blue-600 text-sm" key={e}>{e}</span>
      ))
    }

    <span className="text-sm text-blue-600">Like</span>

    {totalReaction > 0 && (
      <span className="ml-2 text-gray-700 text-sm font-semibold">{totalReaction}</span>
    )}

    {/* Hover reactions: ONLY when hovering this area */}
    <div className="absolute bottom-2 left-0 mb-2 flex gap-2 p-2 bg-white border rounded shadow
                    opacity-0 invisible
                    group-hover/react:visible group-hover/react:opacity-100
                    transform group-hover/react:-translate-y-2 transition-all duration-200 z-50">
      {['❤️','👍','😂','😮','😢','🔥'].map(e => (
        <button
          key={e}
          onClick={() => toggleReaction(e)}
          className="text-lg hover:scale-110 transition"
          disabled={loadingEmoji !== null}
        >
          {loadingEmoji === e ? (
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : e}
        </button>
      ))}
    </div>
  </div>
</div>

    </div>
    </div>
     
</div>

{contentDelete}
{contentEdit}

 <div className={`w-full h-full  fixed inset-0 bg-black bg-opacity-70 z-50 ${openReport ? 'block' : 'hidden'}`}>
    <CommentReportModal comment={comment} onClose={handleReport} />
</div>
{/* replies */}
{comment.replies.map(reply => (

        <>
        <PostReplyListMap 
          editing = {editing} 
          setEditing={setEditing} reply={reply} 
          setShowDeleteConfirm={setShowDeleteConfirm} setShowReactions={setShowReactions} comment={comment} 
          timeAgo={timeAgo} showReactions={showReactions}
          editText={editText} setEditText={setEditText} onEdit={onEdit} onDelete={onDelete}
          isDeleting={isDeleting} isEditing={isEditing} showDeleteConfirm ={showDeleteConfirm}
          onReact={onReact} authUser={authUser ?? null}
          totalReaction={totalReaction} toggleReaction={toggleReaction} uniqueEmojisr={uniqueEmojisr}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            setReplyText={setReplyText}
            handleReplyToComment={handleReplyToComment}
            focusReplyInput={focusReplyInput}
            setEmojiClick={setEmojiClick}
            setReplyImage={setReplyImage}
            emojiClick={emojiClick} replyImage={replyImage}
             />
        </>
    ))}

      
      

      {/* Reply input */}
</div>
</div>


          {/* Reply Input */}

          <PostReplyInput image={image} isSubmitting={isSubmitting} sendImageReply={sendImageReply} replyInputRef={replyInputRef}
          sendTextReply={sendTextReply} setEmojiClick={setEmojiClick} sendEmojiReply={sendEmojiReply}
          REPLY_EMOJIS={REPLY_EMOJIS} emojiClick={emojiClick} replyText={replyText} setReplyText={setReplyText} />
           </div>
        </div>

    )


    
}

