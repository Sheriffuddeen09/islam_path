import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import PostCommentItem from "./PostCommentItem";

export default function PostComment({ post, postId, postComments, setPostComments, setLoading }) {
  const [isEditing, setIsEditing] = useState(false)

  
  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/api/posts/${postId}/comments`);
      setPostComments(res.data.comments);
    } catch (err) {
      console.error(err);
    }
    setLoading(false)
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
      await api.delete(`/api/posts/${postId}`);
      setPostComments(prev => prev.filter(c => c.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };
  
const handleReplyAdded = async (parentId, text = null, image = null) => {
  const formData = new FormData();
  formData.append("parent_id", parentId);

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
    await api.delete(`/api/comments/${replyId}`);
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
    setIsEditing(true);
    const res = await api.put(`/api/comments/${replyId}`, {
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
  } finally {
    setIsEditing(false);
  }
};




  return (
    <div className="flex flex-col bg-white w-full bg-white py-2">
      {/* Comments list */}
      <div className="flex-1 p-4 space-y-4">
        {postComments.map(c => (
          <PostCommentItem
          key={c.id}
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
          setIsEditing={setIsEditing}
          setIsDeleting={setIsDeleting}
        />
        ))}
      </div>

      {/* New comment input */}
        </div>
  );
}
