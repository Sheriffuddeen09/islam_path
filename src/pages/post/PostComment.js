import { useState, useEffect, useRef } from "react";
import api from "../../Api/axios";
import PostCommentItem from "./PostCommentItem";
import { useAuth } from "../../layout/AuthProvider";

export default function PostComment({
  post,
  postId,
  postComments,
  setPostComments,
  image,
  commentsByPost,
  setCommentsByPost,
  commentsMetaByPost,
  setCommentsMetaByPost,
  commentLoading, setCommentLoading
}) {
  const [isEditing, setIsEditing] = useState(false)
    const [loadingMoreComments, setLoadingMoreComments] = useState(false);

    const {authUser} = useAuth()
    const {user} = useAuth()
    const commentRequestRef = useRef(false);
    const moreCommentsRequestRef = useRef(false);
    const commentsContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);


    const findCommentNode = (items, id) => {
  for (const item of items) {
    if (item.id === id) return item;

    const found = findCommentNode(item.replies || [], id);

    if (found) return found;
  }

  return null;
};

const updateCommentNode = (items, id, updater) => {
  return items.map(item => {
    if (item.id === id) {
      return updater(item);
    }

    if (item.replies?.length) {
      return {
        ...item,
        replies: updateCommentNode(
          item.replies,
          id,
          updater
        ),
      };
    }

    return item;
  });
};

// Update both the visible comments and the post cache.
const updateCommentsAndCache = (updater) => {
  setPostComments(prev => {
    const updated = updater(prev);

    setCommentsByPost(cache => ({
      ...cache,
      [postId]: updated,
    }));

    return updated;
  });
};

const [loadingReplies, setLoadingReplies] = useState({});

const loadReplies = async (commentId) => {
  const target = findCommentNode(postComments, commentId);

  if (
    !target ||
    target.replies_loaded ||
    target.replies_loading
  ) {
    return;
  }

  updateCommentsAndCache(prev =>
    updateCommentNode(prev, commentId, item => ({
      ...item,
      replies_loading: true,
    }))
  );

  try {
    const res = await api.get(
      `/api/posts/${postId}/comments?parent_id=${commentId}&page=1`
    );

    const data = res.data;

    updateCommentsAndCache(prev =>
      updateCommentNode(prev, commentId, item => ({
        ...item,
        replies: data.replies || [],
        replies_loaded: true,
        replies_loading: false,
        replies_current_page: data.current_page,
        replies_last_page: data.last_page,
        replies_has_more: data.has_more,
        replies_count: data.total,
      }))
    );

  } catch (err) {
    console.error("Failed to load replies:", err);

    updateCommentsAndCache(prev =>
      updateCommentNode(prev, commentId, item => ({
        ...item,
        replies_loading: false,
      }))
    );
  }
};


const loadMoreReplies = async (commentId) => {
  const target = findCommentNode(postComments, commentId);

  if (
    !target ||
    !target.replies_has_more ||
    loadingReplies?.[commentId]
  ) {
    return;
  }

  setLoadingReplies(prev => ({
    ...prev,
    [commentId]: true,
  }));

  try {
    const nextPage = (target.replies_current_page || 1) + 1;

    const res = await api.get(
      `/api/posts/${postId}/comments?parent_id=${commentId}&page=${nextPage}`
    );

    const data = res.data;

    updateCommentsAndCache(prev =>
      updateCommentNode(prev, commentId, item => {
        const existingIds = new Set(
          (item.replies || []).map(reply => reply.id)
        );

        const newReplies = (data.replies || []).filter(
          reply => !existingIds.has(reply.id)
        );

        return {
          ...item,

          replies: [
            ...(item.replies || []),
            ...newReplies,
          ],

          replies_current_page: data.current_page,
          replies_has_more: data.has_more,
          replies_loaded: true,
        };
      })
    );

  } catch (err) {
    console.error("Failed to load more replies:", err);
  } finally {
    setLoadingReplies(prev => ({
      ...prev,
      [commentId]: false,
    }));
  }
};

    const fetchComments = async () => {
      if (!postId || commentRequestRef.current) return;

      // Reuse previously loaded comments.
      if (Object.prototype.hasOwnProperty.call(
        commentsByPost || {},
        postId
      )) {
        setPostComments(commentsByPost[postId]);
        return;
      }

      commentRequestRef.current = true;
      setCommentLoading(true);

      try {
        const res = await api.get(
              `/api/posts/${postId}/comments?page=1`
            );

            const comments = (res.data.comments || []).map(comment => ({
            ...comment,

            replies: comment.replies || [],

            replies_loaded: true,

            replies_current_page: 1,

            replies_has_more:
              comment.replies_count > (comment.replies?.length || 0),

            replies_loading: false,
          }));

            setPostComments(comments);

            setCommentsByPost(prev => ({
              ...prev,
              [postId]: comments,
            }));

            setCommentsMetaByPost(prev => ({
              ...prev,
              [postId]: {
                currentPage: res.data.current_page,
                lastPage: res.data.last_page,
                hasMore: res.data.has_more,
                total: res.data.total,
              },
            }));
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      } finally {
        commentRequestRef.current = false;
        setCommentLoading(false);
      }
    };

    useEffect(() => {
      fetchComments();
    }, [postId]);


    const loadMoreComments = async () => {
  const meta = commentsMetaByPost?.[postId];

  if (
    !meta?.hasMore ||
    loadingMoreComments ||
    moreCommentsRequestRef.current
  ) {
    return;
  }

  moreCommentsRequestRef.current = true;
  setLoadingMoreComments(true);

  try {
    const nextPage = meta.currentPage + 1;

    const res = await api.get(
      `/api/posts/${postId}/comments?page=${nextPage}`
    );

    const newComments = res.data.comments || [];

    setPostComments(prev => {
      const existingIds = new Set(prev.map(c => c.id));

      return [
        ...prev,
        ...newComments.filter(c => !existingIds.has(c.id)),
      ];
    });

    setCommentsByPost(prev => {
      const existing = prev[postId] || [];
      const existingIds = new Set(existing.map(c => c.id));

      return {
        ...prev,
        [postId]: [
          ...existing,
          ...newComments.filter(c => !existingIds.has(c.id)),
        ],
      };
    });

    setCommentsMetaByPost(prev => ({
      ...prev,
      [postId]: {
        currentPage: res.data.current_page,
        lastPage: res.data.last_page,
        hasMore: res.data.has_more,
      },
    }));

  } catch (err) {
    console.error("Failed to load more comments:", err);
  } finally {
    moreCommentsRequestRef.current = false;
    setLoadingMoreComments(false);
  }
};

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
  
  
  
  const handleReplyAdded = async (
    parentId,
    text = null,
    image = null,
    emoji = null,
    video = null,
    replyTo = null
) => {
    const replyBody = text?.trim() || emoji || "";

    const tempId = `temp-reply-${Date.now()}-${Math.random()}`;

    // Local previews for uploaded media
    const imagePreview = image instanceof File
        ? URL.createObjectURL(image)
        : null;

    const videoPreview = video instanceof File
        ? URL.createObjectURL(video)
        : null;

    // Get the currently logged-in user
    const currentUser = authUser ?? user

      const optimisticReply = {
          id: tempId,
          body: replyBody,
          parent_id: parentId,
          post_id: postId,

          user_id: currentUser?.id,

          user: {
              id: currentUser?.id,
              first_name: currentUser?.first_name || "",
              last_name: currentUser?.last_name || "",
              image: currentUser?.image || null,
          },

          reactions: [],
          replies: [],
          created_at: new Date().toISOString(),

          is_pending: true,
          is_optimistic: true,

          image_preview: imagePreview,
          video_preview: videoPreview,
      };
    // Immediately insert the reply into the UI
    setPostComments(prev =>
        prev.map(comment =>
            comment.id === parentId
                ? {
                    ...comment,

                    replies: [
                        optimisticReply,
                        ...(comment.replies || []),
                    ],

                    // Update latest reply immediately
                    latest_reply: optimisticReply,

                    // Increment reply count immediately
                    replies_count: (comment.replies_count || 0) + 1,
                }
                : comment
        )
    );

    try {
        const formData = new FormData();

        formData.append("parent_id", parentId);

        if (replyBody) {
            formData.append("body", replyBody);
        }

        if (image instanceof File) {
            formData.append("image", image);
        }

        if (video instanceof File) {
            formData.append("video", video);
        }

        // If replying to another reply
        if (replyTo) {
            formData.append(
                "reply_to",
                typeof replyTo === "object"
                    ? replyTo.id
                    : replyTo
            );
        }

        const res = await api.post(
            `/api/posts/${postId}/comments`,
            formData
        );

        const savedReply = {
            ...res.data.comment,

            // Laravel response contains the real user
            user: res.data.comment.user || currentUser,

            reactions: res.data.comment.reactions || [],
            replies: [],

            is_pending: false,
            is_optimistic: false,
        };

        // Replace temporary reply with actual saved reply
        setPostComments(prev =>
            prev.map(comment =>
                comment.id === parentId
                    ? {
                        ...comment,

                        replies: (comment.replies || []).map(reply =>
                            reply.id === tempId
                                ? savedReply
                                : reply
                        ),

                        // Replace optimistic latest reply
                        latest_reply:
                            comment.latest_reply?.id === tempId
                                ? savedReply
                                : comment.latest_reply,
                    }
                    : comment
            )
        );

        return savedReply;

    } catch (error) {

        // Remove failed optimistic reply
        setPostComments(prev =>
            prev.map(comment =>
                comment.id === parentId
                    ? {
                        ...comment,

                        replies: (comment.replies || []).filter(
                            reply => reply.id !== tempId
                        ),

                        replies_count: Math.max(
                            0,
                            (comment.replies_count || 1) - 1
                        ),

                        // Restore previous latest reply
                        latest_reply:
                            comment.replies?.find(
                                reply => reply.id !== tempId
                            ) || null,
                    }
                    : comment
            )
        );

        throw error;

    } finally {

        // Release local preview resources
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        if (videoPreview) {
            URL.revokeObjectURL(videoPreview);
        }
    }
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


useEffect(() => {
  const container = commentsContainerRef.current;
  const trigger = loadMoreTriggerRef.current;

  if (!container || !trigger) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreComments();
      }
    },
    {
      root: container,
      rootMargin: "0px 0px 100px 0px",
      threshold: 0,
    }
  );

  observer.observe(trigger);

  return () => observer.disconnect();
}, [
  postId,
  postComments,
  commentsMetaByPost,
  loadingMoreComments,
]);


if (commentLoading) {
  return (
    <div className="flex items-center justify-center h-16">
      <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500 border-solid" />
    </div>
  );
}

return (
  <div className="flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] w-full">
    {!postComments || postComments.length === 0 ? (
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

        <p className="text-xs font-semibold">
          No comments yet
        </p>

        <p className="text-[10px]">
          Be the first to comment.
        </p>
      </div>
    ) : (
     <div
  ref={commentsContainerRef}
  className="max-h-64 overflow-y-auto
  scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin px-4 py-2 space-y-4"
>
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

      onLoadReplies={loadReplies}
      onLoadMoreReplies={loadMoreReplies}
      loadingReplies={loadingReplies}
    />
  ))}

  {commentsMetaByPost?.[postId]?.hasMore && (
    <div
      ref={loadMoreTriggerRef}
      className="flex justify-center items-center py-3"
    >
      {loadingMoreComments && (
        <div className="flex items-center gap-2 text-xs text-blue-500">
          <span className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  )}

  {!commentsMetaByPost?.[postId]?.hasMore &&
    postComments.length > 0 && (
      <p className="text-center text-xs text-gray-400 py-3">
        You've reached the end of the comments.
      </p>
    )}
</div>
    )}
  </div>
);
}