import { useState } from "react";
import ReplyImage from "./ReplyImage";
import CommentImage from "./ComentImage";
import CommentWithCopy from "./CopyText";
import ReplyWithCopy from "./CopyTextReply";
import ReplyListMap from "./ReplyListMap";
import { useAuth } from "../../layout/AuthProvider";

export default function ReplyComment ({reactions, loading, handleDelete, handleUpdate, isEditing, isDeleting, toggleReaction, uniqueEmojisr, totalReaction, userReaction, onEdit, closeReply, onDelete, onReact, v, replyText, setReplyText, comment, onReplyAdded}){

    const [showFull, setShowFull] = useState(false);
    const [replyImage, setReplyImage] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(comment.body);
    const [showReactions, setShowReactions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteComment, setShowDeleteComment] = useState(false);
    const [emojiClick, setEmojiClick] = useState(false);
    const REPLY_EMOJIS = ['❤️','👍','😂','😮','😢','🔥'];
    const [isEditingComment, setIsEditingComment] = useState(false)
    const authUser = useAuth()
    console.log("authUser:", authUser)
   
// loading
    



const [isSubmitting, setIsSubmitting] = useState(false);

const handleReply = async ({ image = null, text = replyText } = {}) => {
  if (!text && !image) return;

  try {
    setIsSubmitting(true);
    await onReplyAdded(comment.id, text, image);
    setReplyText("");
    setReplyImage(null);
  } catch (err) {
    console.error("Failed to send reply:", err);
  } finally {
    setIsSubmitting(false);
  }
};


const sendTextReply = async () => {
  if (!replyText.trim()) return;

  setIsSubmitting(true);
  await onReplyAdded(comment.id, replyText, null, null);
  setReplyText("");
  setIsSubmitting(false);
};

const sendImageReply = async (file) => {
  if (!file) return;

  setIsSubmitting(true);
  await onReplyAdded(comment.id, null, file, null);
  setReplyImage(null);
  setIsSubmitting(false);
};

const sendEmojiReply = async (emoji) => {
  setIsSubmitting(true);
  await onReplyAdded(comment.id, null, null, emoji);
  setEmojiClick(false);
  setIsSubmitting(false);
};






    const words = v.description?.split(" ") || [];
    const isLong = words.length > 150;
    const shortDescription = isLong ? words.slice(0, 150).join(" ") + "..." : v.description;

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

const handleEmojiClick = () =>{
  setEmojiClick(!emojiClick)
}

const handlePopClick = () =>{
  setIsEditingComment(!isEditingComment)
}

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
    
        <div className="bg-white rounded-lg h-full w-full fixed left-0 top-0 z-50">
            <div className=" flex flex-col justify-between p-2 h-full w-full ">
    <div>
    <div className="flex  flex-row justify-between px-5 items-start border-b-2 border-blue-600 py-2 mb- z-50 gap-2 mt-2 ">
         <div>
      <span className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> 
              {v.user?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>
        <div className="text-xs">
          <div className="font-bold text-[14px] text-black">
            {v.user?.first_name} {v.user?.last_name}
          </div>
          <div className="text-[11px] text-black">
            {v.user?.role || v.user?.admin?.role || "No role"}
          </div>
        </div>
        <p className="text-xs text-black mb-3 mt-3">
         {showFull || !isLong ? v.description : shortDescription}{" "}
        {isLong && (
          <span
            onClick={() => setShowFull(!showFull)}
            className="text-blue-300 cursor-pointer ml-1"
          >
            {showFull ? "show less" : "read more"}
          </span>
        )}
      </p>
      </div>
      <button 
        onClick={closeReply} className="text-black">
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
<div className="overflow-y-auto overflow-x-hidden scroll-bar h-[340px]
    scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent">
         <p className="text-black px-5 inline-flex text-sm font-bold mt-1 items-center gap-2 ">Reply <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
</svg>{comment.replies.length}</p>
<div className="px-4 py-2">
    <div className="inline-flex gap-2 items-start">
    <p className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</p>
    <div className="bg-gray-50 px-4 py-2 rounded-lg ">
    <div className=" flex flex-row justify-between  items-start gap-16">
      <div>
    <p className="text-black font-bold">{comment.user.first_name} {comment.user.last_name}</p>
    <p className="text-black my-2 text-sm font-semibold">{comment.body}</p>
    </div>
    <div className="relative group inline-block">
        <button className="text-2xl text-black font-bold ">:</button>
        
        <div className={`inline-flex items-center absolute top-10 -right-5 mb-2 flex gap-2 p-2 bg-white border rounded shadow opacity-0 invisible group-hover:visible group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-200 z-50 gap-3 items-center shadow-md p-2 rounded-lg`}>
      {authUser?.user?.id === comment.user?.id && (
          <>
                  <button title="Edit" onClick={handlePopClick} className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          </button>
          <button title="Delete" onClick={() => setShowDeleteComment(true)} className="text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-red-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        </button>
        </>
      )}
        <CommentWithCopy comment={comment} />

        </div>
        </div>
        </div>

     {comment.image && <CommentImage image={comment.image} />}

        <div className="inline-flex gap-3 items-center cursor-pointer">
  <span className="text-black text-xs">{timeAgo(comment.created_at)}</span>
  <div className="relative group inline-block">
  {uniqueEmojisr.length > 0
      ? uniqueEmojisr.map(e => <span className="text-blue-600 text-sm" key={e}>{e}</span>)
      : <span className="text-sm text-blue-600">Like</span>}
  {totalReaction > 0 && <span className="text-black text-sm font-semibold ">{totalReaction}</span>}

  {/* Hover reactions */}
  <div className="absolute bottom-2 left-0 mb-2 flex gap-2 p-2 bg-white border rounded shadow opacity-0 invisible group-hover:visible group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-200 z-50">
    {['❤️','👍','😂','😮','😢','🔥'].map(e => (
      <button
        key={e}
        onClick={() => { toggleReaction(e); }}
        className="text-xl hover:scale-125 transition"
      >
        {e}
      </button>
    ))}
  </div>
  </div>
  {userReaction && (
  <div className="text-xs text-gray-600 mt-1">
   {userReaction}
  </div>
)}
</div>
    </div>
    </div>
     
</div>

{contentDelete}
{contentEdit}
{/* replies */}
{comment.replies.map(reply => (

        <>
        <ReplyListMap 
          editing = {editing} 
          setEditing={setEditing} reply={reply} 
          setShowDeleteConfirm={setShowDeleteConfirm} setShowReactions={setShowReactions} comment={comment} 
          timeAgo={timeAgo} showReactions={showReactions}
          editText={editText} setEditText={setEditText} onEdit={onEdit} onDelete={onDelete}
          isDeleting={isDeleting} isEditing={isEditing} showDeleteConfirm ={showDeleteConfirm}
          onReact={onReact} authUser={authUser ?? null}
             />
        </>
    ))}

      
      

      {/* Reply input */}
</div>
</div>


          {/* Reply Input */}
            <div className="mt-2 flex gap-2 relative px-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-4 py-6 text-black outline-0  border-2 border-blue-400 h-32 rounded"
              placeholder="Write a reply..."
              rows={4}
            />

        <button 
        onClick={() => setEmojiClick(!emojiClick)}
        className="absolute top-1 left-8 border rounded shadow">
          😮
        </button >


            <div className={`fixed bottom-14 left-10 gap-2 bg-white border p-2 rounded shadow z-50 ${emojiClick ? 'block' : 'hidden'}`}>
              {REPLY_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { sendEmojiReply(e); setEmojiClick(false)}}
                  className="text-xl hover:scale-125 transition"
                  disabled={isSubmitting}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="p-2 rounded absolute -top-0 left-14 hover:bg-gray-200 cursor-pointer">
             <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => sendImageReply(e.target.files[0])}
                />

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

            </label>
            <button onClick={sendTextReply} className="px-3 py-1 absolute right-5 top-3 text-white rounded">
                {isSubmitting ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
    </svg>
  ) : 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-700">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
</svg>
}
            </button>
          </div>
          </div>
        </div>

    )


    
}

