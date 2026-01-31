import { useEffect, useState } from "react";
import ReplyWithCopy from "./CopyTextReply";
import ReplyImage from "./ReplyImage";
import { Link } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";


export default function ReplyListMap({authUser, onReact, reply, setShowReactions,comment, timeAgo, showReactions, editText, setEditText, onEdit, onDelete, isDeleting, isEditing }){
  const [reactions, setReactions] = useState([]);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const {user} = useAuth()
  // Normalize reactions on mount or reply change
  useEffect(() => {
    const parsed = typeof reply.reactions === "string" ? JSON.parse(reply.reactions) : reply.reactions || {};
    const normalized = Object.entries(parsed).flatMap(([emoji, users]) =>
      Array.isArray(users) && users.length > 0
        ? users.map(user_id => ({
            emoji,
            user: user_id ? { id: user_id } : { id: null, name: "Guest" },
          }))
        : []
    );
    setReactions(normalized);
  }, [reply.reactions]);

  // Handle react
  const reactToReply = async (emoji) => {
    try {
      // Optional: assign a guest ID to track unique guest reactions
      const guestIdKey = `guest_${reply.id}`;
      let guestId = localStorage.getItem(guestIdKey);
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem(guestIdKey, guestId);
      }

      // Call backend
      const res = await onReact(reply.id, emoji, guestId); // backend should accept optional guestId

      // Normalize reactions
      const normalized = Object.entries(res.reactions || {}).flatMap(([emo, users]) =>
        Array.isArray(users)
          ? users.map(user_id => ({
              emoji: emo,
              user: user_id ? { id: user_id } : { id: null, name: "Guest" },
            }))
          : []
      );
      setReactions(normalized);
    } catch (err) {
      console.error("Failed to react to reply:", err);
    }
  };

  // Compute unique emojis and counts
  const uniqueEmojis = [...new Set(reactions.map(r => r.emoji))];


    return(

        <div className="px-4 py-2">
    <div className="flex gap-2 items-start justify-end">
    <div className="bg-gray-50 px-4 py-2">
    <div className="inline-flex gap-12 items-center">
      <Link to={`/profile/${user.id}`} className="">
        <p className="text-black font-bold">{reply?.user?.first_name} {reply?.user?.last_name}</p>
      </Link>
        <div className="relative group inline-block">
        <button className="text-2xl text-black font-bold ">:</button>
        <div className={`inline-flex items-center absolute top-10 -right-5 mb-2 flex gap p-2 bg-white border rounded shadow opacity-0 invisible group-hover:visible group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-200 z-50 gap-3 items-center shadow-md p-2 rounded-lg`}>
        {authUser?.user?.id === reply.user?.id && (
          <>
        <button onClick={() => {
          setEditingReplyId(reply.id);
          setEditText(reply.body);  
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-blue-800 hover:text-gray-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg></button>
        <button onClick={() => setDeletingReplyId(reply.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-red-500 text-red-800">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        </button>
          </>
        )} 
        <ReplyWithCopy reply={reply} />
        </div>
        </div>

    </div>
  
    <p className="text-black my-2 text-sm font-semibold">{reply.body}</p>
        {/* ✅ Image preview */}
       {reply.image && <ReplyImage image={reply.image} />}


        <div
        className="px-2 py-1 text-blue-600 text-sm flex  items-end gap-2 rounded flex gap-1 cursor-pointer"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
        >
        <p className="text-blue-600 text-xs">{timeAgo(reply.created_at)}</p>
        <div className="relative inline-block group">
        <div className="flex gap-1 items-center">
         {reactions.length > 0
  ? [...new Set(reactions.map(r => r.emoji))].map(e => {
      const count = reactions.filter(r => r.emoji === e).length;
      return (
        <span key={e} className="flex items-center gap-1 text-sm bg-gray-200 px-2 py-0.5 rounded">
          {e} {count}
        </span>
      );
    })
  : <span className="text-blue-600">Like</span>
}


        </div>





            {showReactions && (
            <div className="absolute bottom-2 left-0 mb-2 flex gap-2 p-2 bg-white border rounded shadow opacity-0 invisible group-hover:visible group-hover:opacity-100 transform group-hover:-translate-y-2 transition-all duration-200 z-50">
                {['❤️','👍','😂','😮','😢','🔥'].map(e => (
                <button
                    key={e}
                    onClick={() =>{ reactToReply(e); setShowReactions(false)}} 

                    className="text-xl hover:scale-125 transition"
                >
                    {e}
                </button>
                ))}
            </div>
            )}
      </div>
      </div>

    </div>
    <Link to={`/profile/${user.id}`} className="">
    <p className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</p>
    </Link>
    </div>


    {/* Reply Edit  */}

    {editingReplyId === reply.id && (

        <div className=" flex fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-200 p-6 bg-gray-50 rounded w-96 flex flex-col gap-4 relative">
              <h3 className="font-semibold text-lg text-center text-black">Edit Reply</h3>

              {/* Text Input comment.body */}
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="border p-2 rounded-lg h-40 outline-none border
                 border-blue-700  w-full text-black p-4"
                placeholder="Edit your reply..."
              />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-2">
       <button
        onClick={async () => {
          try {
            await onEdit(reply.id, editText);
            setEditingReplyId(null);
          } catch (e) {
            // optional: toast error
          }
        }}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >

          {isEditing ? <svg
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
            setEditingReplyId(false);}}
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

     {/* Reply Delete */}

     {deletingReplyId === reply.id && (
      <>
            <div   className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center z-50 `}>
              <div className="bg-gray-200 text-red-700 p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
                <span>Are you sure you want to delete this comment?</span>
                <div className="flex gap-3 justify-center">
                  <button
            onClick={async () => {
              try {
                await onDelete(reply.id);
                setDeletingReplyId(null);  // CLOSE MODAL
              } catch (e) {}
            }}
            className="px-3 py-1 bg-red-600 text-white rounded"
            >
                    {isDeleting ? <svg
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
                  <button onClick={() => setDeletingReplyId(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                </div>
              </div>
            </div>
            </>
          )}

    </div>
    )
}