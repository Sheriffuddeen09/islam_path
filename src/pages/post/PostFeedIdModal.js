import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import PostComment from "./PostComment";
import PostOptions from "./PostOption";
import api from "../../Api/axios";
import { PostCommentInput } from "./PostCommentInput";
import ImageFlex from "./ImageFlex";

export function PostFeedIdModal({ postId, post, onClose, user, total, othersCount, setShowUsersPopup, me, 
                                  showUsersPopup, currentUser, usersPreview, counts, setShowReactions,
                                showReactions, reactionList,toggleReaction, onLikeClick, myReaction, 
                                focusCommentInput, reactionLoading, postComments, setPostComments, commentInputRef
                              }) {

  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState()
  const [emojiList, setEmojiList] = useState(['❤️','👍','😂','😮','😢','🔥']);
  const [newComment, setNewComment] = useState('');

  const postComment = async (emoji = null, imageFile = null, parentId = null) => {
  setLoading(true)
  if (!newComment.trim() && !emoji && !imageFile) return;
  const formData = new FormData();
  if (emoji) {
    formData.append("body", emoji);
  } else if (newComment.trim()) {
    formData.append("body", newComment.trim());
  }
  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }
  try {
    const res = await api.post(`/api/posts/${postId}/comments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // important!
      },
    });
    setPostComments(prev => parentId
      ? addReplyToComment(prev, parentId, res.data.comment)
      : [res.data.comment, ...prev]
    );
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

//

const addReplyToComment = (postComments, parentId, reply) => {
return postComments.map(comment => {
if (comment.id === parentId) {
    return { ...comment, replies: [...(comment.replies || []), reply] };
}
if (comment.replies?.length) {
    return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
}
return comment;
});
};

  
  if (!post) return null;

  return (
    <div className="fixed px-2 inset-0 bg-white/90 flex sm:py-5 items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full h-full sm:my-4 flex flex-col py-3 max-w-xl border shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-center mx-auto">
            {post.user.name}'s Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:h-[400px] h-[300px] relative ">
          {/* User info */}
          <div className="flex justify-between items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2">
             <Link to={`/profile/${user?.id}`}>
              <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center
              flex flex-col items-center justify-center">
                {post.user.name?.[0]}
              </p>
              </Link>
            <div>
              <p className="font-semibold text-sm">{post.user.name}</p>
              <p className="text-xs text-gray-500">{post.created_at}</p>
            </div>
            </div>
            <PostOptions />
          </div>

          {/* Content */}
          {post.content && (
            <p className="text-sm mb-3 whitespace-pre-line">
              {post.content}
            </p>
          )}

          {/* Media preview */}
          <div className="px-4">
              {post.media.some(m => m.type === "image") && (
                <ImageFlex
                  media={post.media.filter(m => m.type === "image")}
                  postId={post.id}
                />
              )}
          </div>
      

          {post.media
          .filter(m => m.type === "video")
          .map(m => (
            <div
              key={m.id}
              className=" px-4 cursor-pointer"
            >
              <video
                src={m.url}
                className="w-full h-64 object-cover"
                muted
              />
              </div>
              ))}

        {/* Reaction Count */}
        <div className="flex justify-between border-t-2 py-2 mt-4 items-center ">

        <div className="flex gap-1 items-center">
       <div className=" text-xs inline-flex items-center gap-2 text-gray-600">
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        
        {total > 0 && (
      <div className="text-xs flex items-center gap-1 cursor-pointer">
        {/* YOU */}
        {me && (
          <span
            className="font-semibold hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            You
          </span>
        )}

        {/* AND */}
        {me && othersCount > 0 && <span>and</span>}

        {/* OTHERS */}
        {othersCount > 0 && (
          <span
            className="text-gray-500 hover:underline"
            onClick={() => setShowUsersPopup(true)}
          >
            {othersCount} other{othersCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    )}

      </div>  
      </div>
      <div className="inline-flex items-center gap-3">

        <p className="inline-flex gap-1 items-center">
      {post.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-700">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex gap-1 items-center">
      {post.comments_count}
           <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-gray-600"
          >
            <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
          </svg>
      </p>
      </div>

      </div>
      
    {/* Reactions */}
    <div className="flex items-center justify-around py- text-sm text-gray-600">
                  <div className="flex justify-between text-gray-600 mx-4">
                {/* like with hover picker */}
                <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {showReactions && (
                    <div className="absolute -top-14 left-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-white shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
                      {reactionList.map((emoji) => (
                        <span
                          key={emoji}
                          onClick={() => !reactionLoading && toggleReaction(emoji)}
                          className={`text-2xl transition cursor-pointer ${
                            reactionLoading ? "opacity-50 pointer-events-none" : "hover:scale-125"
                          }`}
                        >
                          {reactionLoading && myReaction === emoji ? "⏳" : emoji}
                        </span>
                      ))}

                    </div>
                  )}
        
                  <button onClick={onLikeClick}
                          className={`flex items-center font-semibold ${myReaction ? 'font-bold text-blue-900 p-1 ' : ''}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        Like
                  </button>
                </div>
                </div>
                  <button className="flex items-center font-semibold " onClick={focusCommentInput}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                    </svg> Comment
                  </button>

                   <button className="flex items-center font-semibold gap-1 mx-4">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-gray-600"
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg> Share
                  </button>
                </div>
         <div className="flex-1 w-full">
        <PostComment postId={post.id} post={post} postComments={postComments} 
        setPostComments={setPostComments} loading={loading} setLoading={setLoading} />
        </div> 
       
        </div>

        
        <PostCommentInput 
          newComment={newComment}
          loading={loading}
          setNewComment={setNewComment}
          setImage={setImage}
          image={image}
          showEmoji={showEmoji}
          setShowEmoji={setShowEmoji}
          emojiList={emojiList}
          postComment={postComment}
          commentInputRef={commentInputRef}
        />

      </div>
       {showUsersPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-80 p-4">
            <h3 className="font-semibold mb-3">Likes</h3>

             {usersPreview.map(u => (
              <div key={u.id} className="flex justify-between h-96 hover:text-blue-800 overflow-y-auto text-sm py-1">
                <Link to={`/profile/${u.id}`}>
                  <span className="hover:text-blue-400">
                    {u.id === currentUser?.id ? "You" : u.name}
                  </span>
                </Link>
              </div>
            ))}

            <button
              className="mt-4 w-full text-sm text-blue-600"
              onClick={() => setShowUsersPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
