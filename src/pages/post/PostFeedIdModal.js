import { Link } from "react-router-dom";
import { useState } from "react";
import PostComment from "./PostComment";
import api from "../../Api/axios";
import { PostCommentInput } from "./PostCommentInput";
import ImageFlex from "./ImageFlex";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import PostOptionsId from "./PostOptionId";
import PostVideoPreview from "./PostVideoPreview";

export function PostFeedIdModal({ postId, post, onClose, user, total, others, setShowUsersPopup, me, 
                                  counts, setShowReactions, commentsByPost, setCommentsByPost,
                                showReactions, reactionList, toggleReaction, onLikeClick, myReaction, 
                                focusCommentInput, reactionLoading, postComments, setPostComments, commentInputRef,
                                image, setImage, loading, currentUser, newComment, setNewComment, emojiList, showEmoji,
                                setShowEmoji, chats, firstUser, allUsers, showEmojiPicker, setShowEmojiPicker,
                                getColor, setLoading, setEmojiList, showUsersPopup, setPostIdModal, postIdModal, usersPreview
                              }) {

  const [messageOpenShare, setMessageOpenShare] = useState(false)
  const [shares, setShares] = useState(false)
  const [selectedChats, setSelectedChats] = useState([]);
  const [sending, setSending] = useState(false);

  const replaceCommentById = (comments, tempId, newComment) => {
    return comments.map(comment => {
      if (comment.id === tempId) {
        return newComment;
      }
  
      if (comment.replies?.length) {
        return {
          ...comment,
          replies: replaceCommentById(
            comment.replies,
            tempId,
            newComment
          ),
        };
      }
  
      return comment;
    });
  };
  
  
  const removeCommentById = (comments, tempId) => {
    return comments
      .filter(comment => comment.id !== tempId)
      .map(comment => ({
        ...comment,
        replies: comment.replies?.length
          ? removeCommentById(comment.replies, tempId)
          : comment.replies,
      }));
  };
  
  const postComment = async (
  emoji = null,
  imageFile = null,
  parentId = null
) => {
  const commentBody =
    emoji || newComment?.trim() || "";

  if (!commentBody && !imageFile) return;

  const tempId = `temp-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const imagePreview =
    imageFile instanceof File
      ? URL.createObjectURL(imageFile)
      : null;

  const temporaryComment = {
    id: tempId,

    body: commentBody,

    image: imagePreview,

    user: currentUser,
    user_id: currentUser?.id,

    created_at: new Date().toISOString(),

    is_pending: true,
  };

  setPostComments((prev) =>
    parentId
      ? addReplyToComment(
          prev,
          parentId,
          temporaryComment
        )
      : [temporaryComment, ...prev]
  );

  setNewComment("");
  setImage(null);
  setShowEmoji(false);

  const formData = new FormData();

  if (commentBody) {
    formData.append("body", commentBody);
  }

  if (imageFile instanceof File) {
    formData.append("image", imageFile);
  }

  try {
    const res = await api.post(
      `/api/posts/${postId}/comments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const savedComment = res.data.comment;

    setPostComments((prev) =>
      replaceCommentById(
        prev,
        tempId,
        savedComment
      )
    );

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

  } catch (err) {
    console.error(
      err.response?.data || err
    );

    setPostComments((prev) =>
      removeCommentById(
        prev,
        tempId
      )
    );

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }
};
  

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

const shareUrl = `${window.location.origin}/post/${post?.id}`;

const shareLinks = {
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
};

const handleShare = async (platform) => {
  const url = shareLinks[platform];

  if (url) {
    window.open(url, "_blank");
  } else {
    // For TikTok / Instagram / YouTube
    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied! Paste it in the app to share.");
  }

  await api.post(`/api/post/${post.id}/share`);
};


const shareToChat = async (chatId) => {
  await api.post(`/api/chats/${chatId}/messages`, {
    type: "link",
    message: shareUrl,
    post_id: post.id
  });

  await api.post(`/api/post/${post.id}/share`);
};


  
  if (!post) return null;

  return (
    <div className="fixed px-2 inset-0 bg-white/40 flex sm:py-5 items-center justify-center z-[999]">
      <div className="bg-[var(--bg-color)] 
            text-[var(--text-color)] rounded-xl w-full h-full sm:my-4 flex flex-col py-3 max-w-xl border shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-center mx-auto">
            {post.user.name}'s Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 text-black flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto
        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
         overflow-x-hidden p-4 sm:h-[400px] h-[300px] relative ">
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
              <p className="text-xs">{post.created_at}</p>
            </div>
            </div>
            <div className="rounded-full">
            <PostOptionsId 
            post={post} 
            chats={chats}
            />
          </div>
          </div>

          {/* Content */}
          {post.content && (
            <p className="text-sm mb-3 px-4 whitespace-pre-line">
              {post.content}
            </p>
          )}

          {/* Media preview Share */}
          <div className="px-4">
              {post.media.some(m => m.type === "image") && (
                <ImageFlex
                  media={post.media.filter(m => m.type === "image")}
                  postId={post.id}
                   post={post}

                counts = {counts}
                total = {total}
                me={me}
                firstUser={firstUser}
                others = {others} 
                allUsers = {allUsers}
                myReaction={myReaction}
                reactionList = {reactionList}
                reactionLoading = {reactionLoading}
                toggleReaction ={toggleReaction}
                onLikeClick = {onLikeClick}

                showReactions={showReactions}
                setShowReactions={setShowReactions}

                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}

                showUsersPopup={showUsersPopup}
                setShowUsersPopup={setShowUsersPopup}
                currentUser={currentUser}
                getColor={getColor}

                // Comment
                postComments = {postComments} 
                setPostComments={setPostComments}
                commentInputRef={commentInputRef}
                focusCommentInput={focusCommentInput}
                newComment={newComment}
                setNewComment={setNewComment} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
                loading={loading}
                setLoading={setLoading}

                showEmoji={showEmoji}
                setShowEmoji={setShowEmoji}
                emojiList={emojiList}
                setEmojiList={setEmojiList}

                // Share
                chats = {chats}
                setPostIdModal={setPostIdModal}
                shares={shares}
                setShares={setShares}
                setMessageOpenShare={setMessageOpenShare}
                handleShare={handleShare}
                sending={sending}
                messageOpenShare={messageOpenShare}
                selectedChats={selectedChats}
                setSelectedChats={setSelectedChats}
                setSending={setSending}
                shareToChat={shareToChat}
                postIdModal={postIdModal}
                user={user}
                image={image}
                usersPreview={usersPreview}
                setImage={setImage}
                />
              )}
          </div>
      

      <PostVideoPreview
        post={post}
        chats={chats}
                    
              counts = {counts}
              total = {total}
              me={me}
              firstUser={firstUser}
              others = {others} 
              allUsers = {allUsers}
              myReaction={myReaction}
              reactionList = {reactionList}
              reactionLoading = {reactionLoading}
              toggleReaction ={toggleReaction}
              onLikeClick = {onLikeClick}

              showReactions={showReactions}
              setShowReactions={setShowReactions}

              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}

              showUsersPopup={showUsersPopup}
              setShowUsersPopup={setShowUsersPopup}
              currentUser={currentUser}
              getColor={getColor}

              // Comment
              postComments = {postComments} 
              setPostComments={setPostComments}
              commentInputRef={commentInputRef}
              focusCommentInput={focusCommentInput} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
              newComment={newComment}
              setNewComment={setNewComment}
              loading={loading}
              setLoading={setLoading}

              showEmoji={showEmoji}
              setShowEmoji={setShowEmoji}
              emojiList={emojiList}
              setEmojiList={setEmojiList}

              // Share
              setPostIdModal={setPostIdModal}
              shares={shares}
              setShares={setShares}
              setMessageOpenShare={setMessageOpenShare}
              handleShare={handleShare}
              sending={sending}
              messageOpenShare={messageOpenShare}
              selectedChats={selectedChats}
              setSelectedChats={setSelectedChats}
              setSending={setSending}
              shareToChat={shareToChat}
              postIdModal={postIdModal}
              user={user}
              image={image}
              usersPreview={usersPreview}
              setImage={setImage}
      />


        {/* Reaction Count setShowUsersPopup */}
        <div className="flex justify-between border-t-2 py-2 mt-4 items-center ">

        <div className="flex gap-1 items-center">
       <div className=" text-xs inline-flex items-center gap-2 bg-[var(--bg-color)]
            text-[var(--text-color)]">
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        
        {total > 0 && (
  <div className="text-xs flex items-center gap-1 cursor-pointer">

    {/* YOU */}
    {me && (
      <>
        <span
          className="font-semibold hover:underline"
          onClick={() => setShowUsersPopup(true)}
        >
          You
        </span>
        {total > 1 && <span>,</span>}
      </>
    )}

    {/* FIRST OTHER USER */}
    {firstUser && (
      <span
        className="font-semibold hover:underline"
        onClick={() => setShowUsersPopup(true)}
      >
        {firstUser.name}
      </span>
    )}

    {/* REMAINING USERS COUNT */}
    {others.length > 1 && (
      <>
        <span> and </span>
        <span
          className="font-semibold hover:underline"
          onClick={() => setShowUsersPopup(true)}
        >
          {others.length - 1} other{others.length - 1 > 1 ? "s" : ""}
        </span>
      </>
    )}
  </div>
)}


      </div>  
      </div>
      <div className="inline-flex items-center gap-3">

        <p className="inline-flex bg-[var(--bg-color)]
            text-[var(--text-color)] gap-1 items-center">
      {post.comments_count}
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-[var(--text-color)]">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
      </p>
      <p className="inline-flex bg-[var(--bg-color)]
            text-[var(--text-color)] gap-1 items-center">
      {post.shares_count}
           <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 "
          >
            <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
          </svg>
      </p>

      <p className="inline-flex gap-1 bg-[var(--bg-color)]
            text-[var(--text-color)] items-center">
      {post.reposts_count}
           <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 bg-[var(--bg-color)]
            text-[var(--text-color)]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 
              3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865
              a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
      </p>
      </div>

      </div>
      
    {/* Reactions */}
    <div className="flex items-center justify-around py- text-sm bg-[var(--bg-color)]
            text-[var(--text-color)]">
                  <div className="flex justify-between text-[var(--text-color)] mx-4">
                {/* like with hover picker */}
                <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
                  {showReactions && (
                    <div className="absolute -top-14 left-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-[var(--bg-color)]
            text-[var(--text-color)] shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
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

                   <button onClick={() => setShares(!shares)} className="flex items-center font-semibold gap-1 mx-4">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 "
                  >
                    <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z"/>
                  </svg> Share
                  </button>
                </div>
         <div className="flex-1 w-full">
       <PostComment
          postId={post.id}
          image={image}
          post={post}
          postComments={postComments}
          setPostComments={setPostComments}
          commentsByPost={commentsByPost}
          setCommentsByPost={setCommentsByPost}
        />
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
       
      
      {shares && (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
        <div className="bg-[var(--bg-color)]
            text-[var(--text-color)] rounded-lg p-4 w-80 relative max-h-[80vh] overflow-y-auto">
          <button onClick={() => setShares(!shares)}
            className="absolute right-3 top-2  rounded-full  hover:bg-gray-50 bg-gray-100 transition 
            w-6 h-6 flex items-center justify-center"
          >
            ✕
      </button>
        <div className="flex flex-col mx-auto gap-3 items-center">
          <button onClick={() => {setMessageOpenShare(!messageOpenShare); setShares(false);}} 
          className="bg-[var(--bg-color)]
            text-[var(--text-color)] flex flex-col  items-center gap-1 hover:text-blue-600">
                <MessageCircle className="border-2 border-black rounded-full p-1" size={35} />
                <span className="text-sm font-bold">Chat List</span>
              </button>
            <div className="grid grid-cols-4 border-t-2 pt-2 gap-4 text-center">
              <button onClick={() => handleShare("facebook")} className="bg-[var(--bg-color)]
            text-[var(--text-color)] flex flex-col items-center gap-1 hover:text-blue-600 bg-[var(--bg-color)]
            text-[var(--text-color)]">
                <FaFacebook size={28} />
                <span className="text-sm">Facebook</span>
              </button>

              <button onClick={() => handleShare("whatsapp")} className="bg-[var(--bg-color)]
            text-[var(--text-color)] flex flex-col items-center gap-1 hover:text-green-500">
                <FaWhatsapp size={28} />
                <span className="text-sm">WhatsApp</span>
              </button>

              <button onClick={() => handleShare("twitter")} className="bg-[var(--bg-color)]
            text-[var(--text-color)] flex flex-col items-center gap-1 hover:text-sky-500">
                <FaTwitter size={28} />
                <span className="text-sm">Twitter</span>
              </button>

              <button onClick={() => handleShare("telegram")} className="bg-[var(--bg-color)]
            text-[var(--text-color)] flex flex-col items-center gap-1 hover:text-blue-400">
                <FaTelegram size={28} />
                <span className="text-sm">Telegram</span>
              </button>
            </div>

        </div>
      
      </div>
      </div>
      )
      }

      {messageOpenShare && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-[var(--bg-color)]
            text-[var(--text-color)] rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
      <h2 className="font-bold mb-3">Share to chat</h2>

       {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-2 p-2 cursor-pointer rounded ${
              selectedChats.includes(chat.id)
                ? "bg-blue-200 my-1"
                : "hover:bg-gray-100 my-1"
            }`}
            onClick={() => {
              setSelectedChats((prev) =>
                prev.includes(chat.id)
                  ? prev.filter((id) => id !== chat.id)
                  : [...prev, chat.id]
              );
            }}
          >
            <input
              type="checkbox"
              checked={selectedChats.includes(chat.id)}
              readOnly
            />
            <span>
              <span>
              {chat.other_user
                ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                : chat.teacher
                  ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                  : chat.student
                    ? `${chat.student.first_name} ${chat.student.last_name}`
                    : "Unknown User"}
            </span>

            </span>
          </div>
        ))}

<button
  disabled={sending || selectedChats.length === 0}
  onClick={async () => {
    try {
      setSending(true);
      for (const chatId of selectedChats) {
        await shareToChat(chatId);
      }
      setSelectedChats([]);
      setMessageOpenShare(false);
    } finally {
      setSending(false);
    }
  }}
  className={`mt-3 w-full rounded py-2 text-white ${
    sending || selectedChats.length === 0
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {sending ? <svg
      className="animate-spin h-5 w-5 text-white mx-auto flex justify-center items-center"
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
    </svg> : `Send (${selectedChats.length})`}
</button>


      <button
        onClick={() => setMessageOpenShare(false)}
        className="mt-3 w-full bg-gray-200 rounded py-2"
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
}
