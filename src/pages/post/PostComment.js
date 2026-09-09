import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import PostCommentItem from "./PostCommentItem";

export default function PostComment({ post, postId, postComments, setPostComments, image }) {
  const [isEditing, setIsEditing] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)
  

  
  const fetchComments = async () => {
    setCommentLoading(true)
    try {
      const res = await api.get(`/api/posts/${postId}/comments`);
      setPostComments(res.data.comments);
    } catch (err) {
      console.error(err);
    }
    setCommentLoading(false)
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

 
   const updateCommentTree = (postComments, updatedComment) => {
  return postComments.map(c => {
    if (c.id === updatedComment.id) return { ...c, ...updatedComment };
    if (c.replies?.length) {
      return { ...c, replies: updateCommentTree(c.replies, updatedComment) };
    }
    return c;
  });
};

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/api/posts/${postId}/comment`);
      setPostComments(prev => prev.filter(c => c.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };
  
const handleReplyAdded = async (parentId, text = null, image = null, emoji=null) => {
  const formData = new FormData();
  formData.append("parent_id", parentId);

  if (emoji) {
    formData.append("body", emoji);
  } 
  if (text) formData.append("body", text);
  if (image instanceof File) formData.append("image", image);

  const res = await api.post(
    `/api/posts/${postId}/comments`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  const newReply = {
    ...res.data.comment,
    reactions: res.data.comment.reactions || [],
    replies: [],
  };

  setPostComments(prev =>
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
    await api.delete(`/api/posts/${replyId}/comment`);
    setPostComments(prev =>
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
    const res = await api.put(`/api/posts/${replyId}/comment`, {
      body: text,
    });
    setPostComments(prev =>
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
  }
};


if (commentLoading) {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500 border-solid" />
    </div>
  );
}

return (
  <div className="flex flex-col bg-[var(--bg-color)] w-full">
    {!postComments || postComments.length === 0 ? (
      /* NO COMMENTS */
      <div className="flex flex-col items-center justify-center h-20 text-center">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
        </div>

        <p className="text-xs font-semibold text-gray-500">
          No comments yet
        </p>

        <p className="text-[10px] text-gray-400">
          Be the first to comment.
        </p>
      </div>
    ) : (
      /* COMMENTS */
      <div className="h-44 max-h-44 overflow-y-auto overflow-x-hidden px-4 py-2 space-y-4 no-scrollbar overscroll-contain">
        {postComments.map((c) => (
          <PostCommentItem
            key={c.id}
            image={image}
            post={post}
            comment={c}
            onReplyAdded={handleReplyAdded}
            onDelete={handleDelete}
            updateCommentTree={updateCommentTree}
            postComments={postComments}
            setPostComments={setPostComments}
            handleDeleteReply={handleDeleteReply}
            handleEditReply={handleEditReply}
            isDeleting={isDeleting}
            isEdit={isEditing}
            setIsEdit={setIsEditing}
            setIsDeleting={setIsDeleting}
          />
        ))}
      </div>
    )}
  </div>
);
}