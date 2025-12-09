import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import ReplyComment from "./ReplyComment";
import Reply from "./Reply";

const EMOJIS = ["❤️","👍","😂","😮","😢","🔥"];

export default function CommentItem({ isDeleting, v, comment, onReplyAdded, onDelete,handleEditReply, handleDeleteReply, updateCommentTree, setComments }) {
  const [replyText, setReplyText] = useState("");
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

useEffect(() => {
  const arr = reactions && !Array.isArray(reactions)
    ? Object.entries(reactions).flatMap(([emoji, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
      )
    : reactions || [];

  const userReact = arr.find(r => r.user?.id === currentUser?.id)?.emoji || null;
  setSelectedReaction(userReact);
}, [reactions, currentUser]);


  // --- Get the reaction of the current user ---
 // Ensure reactions is always an array

 useEffect(() => {
  setReactions(comment.reactions || []);
}, [comment.reactions]);


const reactionArray = reactions && !Array.isArray(reactions)
  ? Object.entries(reactions).flatMap(([emoji, users]) =>
      Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
    )
  : reactions || [];

  const uniqueEmojis = [...new Set(reactionArray.map(r => r.emoji))];


// Now find current user reaction
const userReaction = reactionArray.find(r => r.user?.id === currentUser?.id)?.emoji || null;

// Total reactions
const totalReactions = reactionArray.length;

  // --- Post reply ---
  const postReply = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/videos/${comment.video_id}/comments`, {
        body: replyText,
        parent_id: comment.id
      });
      onReplyAdded && onReplyAdded(comment.id, res.data.comment);
      setReplyText("");
      setShowReplies(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle reaction ---
  const toggleReaction = async (emoji) => {
  setLoading(true);
  try {
    const res = await api.post(`/api/comments/${comment.id}/reaction`, { emoji });
    const apiReactions = res.data.reactions || {};

    // Convert to array of { emoji, user } for frontend
    const normalized = Object.entries(apiReactions).flatMap(([e, users]) =>
      Array.isArray(users) ? users.map(u => ({ emoji: e, user: u })) : []
    );

    setReactions(normalized); // ✅ store array for immediate UI update
    setHoverReactions(false);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // --- Update comment ---
  
  const handleUpdate = async (commentId, body) => {
  if (!body || body.trim() === "") return;

  setLoading(true);

  try {
    const res = await api.put(`/api/comments/${commentId}`, {
      body: body.trim()
    });

    setComments(prev =>
      updateCommentTree(prev, res.data.comment)
    );

    setIsEditing(false);

  } catch (err) {
    console.error(err.response?.data || err);
  } finally {
    setLoading(false);
  }
};

  
 const handleReact = async (commentId, emoji) => {
  setLoading(true);
  try {
    const res = await api.post(
      `/api/comments/${commentId}/reaction`,
      { emoji }
    );

    const apiReactions = res.data.reactions || {};

    // Normalize reactions for UI
    const normalized = Object.entries(apiReactions).flatMap(
      ([e, users]) =>
        Array.isArray(users)
          ? users.map(u => ({ emoji: e, user: u }))
          : []
    );

    setReactions(normalized);
    setHoverReactions(false);

  } catch (err) {
    console.error(err.response?.data || err);
  } finally {
    setLoading(false);
  }
};



  // --- Delete comment ---
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


const handleReplyToggle = () =>{
  setShowReplies(!showReplies)
}

  return (
    <div className="flex gap-3">
     <span className="text-white w-12 h-12 mx-auto flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>
      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded">
          {/* Comment Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-black">
                {comment.user?.first_name || "Anonymous"} {comment.user?.last_name || ""}
              </div>
              {/* Text */}
            {comment.body && (
              <p className="text-sm text-black">{comment.body}</p>
            )}
            {comment.image && (
            <img
              src={`${'http://localhost:8000'}/storage/${comment.image}`}
              alt="comment"
              className="mt-2 rounded w-40"
            />
          )}

              {isEditing && (
          <div className="fixed inset-0 flex bg-gray-50 items-center justify-center z-50">
            <div className="bg-gray-200 p-6 bg-gray-50 rounded w-96 flex flex-col gap-4 relative">
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

            <div className="flex flex-col items-end text-xs text-gray-400 gap-1">
              {!isEditing && (
                <div className="flex gap-2">
                  <button title="Edit" onClick={() => setIsEditing(true)} className="text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          </button>
          <button title="Delete" onClick={() => setShowDeleteConfirm(true)} className="text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
</button>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
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
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                </div>
              </div>
            </div>
          )}

          {/* Reactions & Reply */}
          {/* Reactions & Reply */}
<div className="mt-2 flex items-center gap-2 text-sm relative group inline-block ">
  {/* MAIN reaction button */}
  <span className="text-xs text-gray-400">
  {timeAgo(comment.created_at)}
</span>
  <div
    className="px-2 py-1 bg-gray-200 text-black rounded flex items-center gap-1 cursor-pointer"
    onMouseEnter={() => setHoverReactions(true)}
    onMouseLeave={() => setHoverReactions(false)}
  >
    {/* show ALL distinct emojis */}
    {uniqueEmojis.length > 0
      ? uniqueEmojis.map(e => <span key={e}>{e}</span>)
      : <span>👍</span>
    }

    {/* show TOTAL count */}
    {totalReactions > 0 && <span>{totalReactions}</span>}

    


    {/* Emoji picker */}
    {hoverReactions && (
      <div className="absolute bottom-full left-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 mb-2 flex gap-2 p-2 bg-white border rounded shadow z-10">
        {EMOJIS.map(e => (
          <button
            key={e}
            onClick={() => toggleReaction(e)}
            className="text-lg hover:scale-110 transition"
          >
            {loading ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-blue-900"
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
    </svg> : 
    <>    
            {e}
    </>
            }
          </button>
        ))}
      </div>
    )}
  </div>

  <button
     onClick={() => handleReplyToggle()}
    className="text-blue-600 text-sm"
  >
    reply
  </button>
  {userReaction && (
  <div className="text-xs text-gray-600 mt-1">
   {userReaction}
  </div>
)}
</div>
              


        </div>

        {/* Reply input */}
       
           <div className={`${showReplies ? 'block' : 'hidden'}`}>
           <Reply 
            loading={loading}
            replyText={replyText}
            setReplyText={setReplyText}
            postReply={postReply}
            closeReply={handleReplyToggle}
            v={v}
            comment={comment}
            onReplyAdded={onReplyAdded}
            handleReact={handleReact}
            handleDeleteReply={handleDeleteReply}
            onEdhandleEditReplyit={handleEditReply}
            totalReaction={totalReactions}
            userReaction={userReaction}
            uniqueEmojisr ={ uniqueEmojis}
            hoverReactions={hoverReactions}
            EMOJIS={EMOJIS}
            toggleReaction ={toggleReaction}
            isDeleting={isDeleting}
          /> 
       </div>

      </div>
    </div>
  );
}
