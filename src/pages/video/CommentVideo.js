import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import CommentItem from "./CommentItem";
import { Link } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";

export default function CommentsSidebar({ v, videoId, setShowComments, comments, setComments }) {
  const [newComment, setNewComment] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState()
  const [emojiList, setEmojiList] = useState(['❤️','👍','😂','😮','😢','🔥']);
  const inputRef = useRef(null);
  const [showFull, setShowFull] = useState(false);
  const [isEditing, setIsEditing] = useState(false)

  const {user} = useAuth()


  // Fetch comments
  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/videos/${videoId}/comments`);
      setComments(res.data.comments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  // Post new comment (text or emoji)
 const postComment = async (emoji = null, imageFile = null, parentId = null) => {
  setLoading(true)
  // ✅ Nothing to send
  if (!newComment.trim() && !emoji && !imageFile) return;

  const formData = new FormData();

  // Append text if it exists
  if (emoji) {
    formData.append("body", emoji);
  } else if (newComment.trim()) {
    formData.append("body", newComment.trim());
  }

  // Append image if it's a real File object
  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  try {
    const res = await api.post(`/api/videos/${videoId}/comments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // important!
      },
    });

    // Update state with new comment
    setComments(prev => parentId
      ? addReplyToComment(prev, parentId, res.data.comment)
      : [res.data.comment, ...prev]
    );

    // Reset input fields
    setNewComment("");
    setImage(null);
    setShowEmoji(false);
  } catch (err) {
    console.error(err.response?.data || err);
  }
  finally{
    setLoading(false)
  }
};



      const addReplyToComment = (comments, parentId, reply) => {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return { ...comment, replies: [...(comment.replies || []), reply] };
    }
    if (comment.replies?.length) {
      return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
    }
    return comment;
  });
};


   const updateCommentTree = (comments, updatedComment) => {
  return comments.map(c => {
    if (c.id === updatedComment.id) return { ...c, ...updatedComment };
    if (c.replies?.length) {
      return { ...c, replies: updateCommentTree(c.replies, updatedComment) };
    }
    return c;
  });
};

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };


   const words = v.description?.split(" ") || [];
  const isLong = words.length > 150;
  const shortDescription = isLong ? words.slice(0, 150).join(" ") + "..." : v.description;

  
const handleReplyAdded = async (parentId, text = null, image = null) => {
  const formData = new FormData();
  formData.append("parent_id", parentId);

  if (text) formData.append("body", text);
  if (image instanceof File) formData.append("image", image);

  const res = await api.post(
    `/api/videos/${videoId}/comments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  const newReply = {
    ...res.data.comment,
    reactions: res.data.comment.reactions || [],
    replies: [],
  };

  setComments(prev =>
    prev.map(c =>
      c.id === parentId
        ? { ...c, replies: [newReply, ...(c.replies || [])] }
        : c
    )
  );

  return newReply;
};


const [isDeleting, setIsDeleting] = useState(false);

const handleDeleteReply = async (replyId) => {
  try {
    setIsDeleting(true); // start loading
    await api.delete(`/api/comments/${replyId}`);

    // remove deleted reply from state
    setComments(prev =>
      prev.map(c => ({
        ...c,
        replies: c.replies?.filter(r => r.id !== replyId)
      }))
    );
  } catch (err) {
    console.error("Failed to delete reply:", err);
  } finally {
    setIsDeleting(false); // stop loading
  }
};

const handleEditReply = async (replyId, text) => {
  try {
    setIsEditing(true);

    const res = await api.put(`/api/comments/${replyId}`, {
      body: text,
    });

    // res.data.comment is the updated comment
    // but we only want to update the specific reply in state
    setComments(prev =>
      prev.map(comment => ({
        ...comment,
        replies: comment.replies?.map(reply =>
          reply.id === replyId
            ? { ...reply, body: res.data.comment.body, updated_at: res.data.comment.updated_at }
            : reply
        ),
      }))
    );

    return true;
  } catch (err) {
    console.error("Failed to edit reply:", err);
    throw err;
  } finally {
    setIsEditing(false);
  }
};




  return (
    <div className="flex flex-col bg-white h-screen w-full md:w-[400px] lg:w-96 px-2">
     <div className="flex  flex-row justify-between px-5 items-start border-b-2 border-blue-600 py-2 mb- z-50 gap-2 mt-2 ">
      <div>
        <Link to={`/profile/${user.id}`} className="z-50 flex items-center gap-2">
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
        </Link>
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
        onClick={() => setShowComments(s => !s)} className="text-black sm:hidden block">
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
        </button>
      
      </div>

      <p className="text-black px-5 inline-flex text-sm font-bold mt-1 items-center gap-2 ">Comment <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
</svg> {comments.length}</p>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map(c => (
          <CommentItem
          key={c.id}
          v={v}
          comment={c}
          onReplyAdded={handleReplyAdded}
          onDelete={handleDelete}
          updateCommentTree={updateCommentTree}
          comments={comments}
          setComments={setComments}
          handleDeleteReply={handleDeleteReply}
          handleEditReply={handleEditReply}
          isDeleting={isDeleting}
          isEdit={isEditing}
          setIsEditing={setIsEditing}
          setIsDeleting={setIsDeleting}
        />
        ))}
      </div>

      {/* New comment input */}
      <div className="p-4 border-t bg-white">
        <div className="flex flex-col gap-2">
          <div className="flex relative items-center gap-2">
            <input
              ref={inputRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-4 border outline-0 border-gray-300 text-black w-full rounded h-20"
            />

            {/* Emoji toggle button */}
            <button
              onClick={() => setShowEmoji(s => !s)}
              className="p-2 rounded absolute -top-1 hover:bg-gray-200"
            >
              😊
            </button>

            {/* Upload image */}
            <label className="p-2 rounded absolute -top-0 left-8 hover:bg-gray-200 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                const file = e.target.files[0];
                if (!file) return;

                setImage(file);
                postComment(null, file);
              }}
              />

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
</svg>

            </label>

            {/* Submit comment */}
            <button
              onClick={() => postComment()}
              className="px-3 py-1 absolute right-0 text-white rounded"
            >
              {loading ? (
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

          {/* Emoji selection panel */}
          {showEmoji && emojiList.length > 0 && (
            <div className="flex gap-2 flex-wrap p-2 border rounded bg-gray-50">
              {emojiList.map(e => (
                <button 
                  key={e} 
                  type="button"
                  onClick={() => postComment(e)} 
                  className="text-lg"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : <>
          {image && <div className="text-sm text-gray-500">Selected: {image.name}</div>}
      </>
}
        </div>
      </div>
    </div>
  );
}
