import { Link } from "react-router-dom";
import { useState } from "react";
import PostComment from "./PostComment";
import api from "../../Api/axios";
import { PostCommentInput } from "./PostCommentInput";
import ImageFlex from "./ImageFlex";
import { FaFacebook, FaWhatsapp, FaTwitter, FaTelegram } from "react-icons/fa";
import { MessageCircle, X, Check, Send } from "lucide-react";
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
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-sm
        relative
        shadow-2xl
        border
        border-gray-200/20
      "
    >

      {/* ========================================================= */}
      {/* CLOSE                                                     */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => setShares(false)}
        className="
          absolute
          right-3
          top-3
          w-8
          h-8
          rounded-full
          bg-gray-800
          text-white
          flex
          items-center
          justify-center
          hover:bg-red-500
          transition
        "
      >
        <X size={17} />
      </button>

      {/* ========================================================= */}
      {/* TITLE                                                     */}
      {/* ========================================================= */}

      <div className="text-center mb-5">
        <h2 className="text-lg font-bold">
          Share
        </h2>

        <p className="text-xs opacity-60 mt-1">
          Choose how you want to share this
        </p>
      </div>

      {/* ========================================================= */}
      {/* CHAT LIST                                                  */}
      {/* ========================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(true);
          setShares(false);
        }}
        className="
          w-full
          flex
          items-center
          gap-3
          p-3
          rounded-xl
          border
          border-gray-200/20
          hover:bg-blue-50
          hover:text-blue-600
          transition
          mb-4
        "
      >
        <div
          className="
            w-11
            h-11
            rounded-full
            bg-blue-100
            text-blue-600
            flex
            items-center
            justify-center
          "
        >
          <MessageCircle size={23} />
        </div>

        <div className="flex-1 text-left">
          <div className="font-semibold text-sm">
            Chat List
          </div>

          <div className="text-xs opacity-60">
            Share with your chats
          </div>
        </div>
      </button>

      {/* ========================================================= */}
      {/* SOCIAL SHARE                                               */}
      {/* ========================================================= */}

      <div className="border-t border-gray-200/20 pt-4">

        <div className="
          grid
          grid-cols-4
          gap-2
          text-center
        ">

          <button
            type="button"
            onClick={() =>
              handleShare("facebook")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-600
              transition
            "
          >
            <FaFacebook size={25} />

            <span className="text-[11px]">
              Facebook
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("whatsapp")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-green-50
              hover:text-green-500
              transition
            "
          >
            <FaWhatsapp size={25} />

            <span className="text-[11px]">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("twitter")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-sky-50
              hover:text-sky-500
              transition
            "
          >
            <FaTwitter size={25} />

            <span className="text-[11px]">
              Twitter
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleShare("telegram")
            }
            className="
              flex
              flex-col
              items-center
              gap-1
              p-2
              rounded-xl
              hover:bg-blue-50
              hover:text-blue-400
              transition
            "
          >
            <FaTelegram size={25} />

            <span className="text-[11px]">
              Telegram
            </span>
          </button>

        </div>
      </div>
    </div>
  </div>
)}


{/* ============================================================= */}
{/* SHARE TO CHAT MODAL                                           */}
{/* ============================================================= */}

{messageOpenShare && (
  <div className="
    fixed
    inset-0
    bg-black/70
    z-[60]
    flex
    items-center
    justify-center
    p-4
  ">
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-2xl
        p-5
        w-full
        max-w-md
        max-h-[85vh]
        overflow-hidden
        shadow-2xl
        border
        border-gray-200/20
        flex
        flex-col
      "
    >

      {/* ======================================================= */}
      {/* HEADER                                                   */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-4
      ">
        <div>
          <h2 className="font-bold text-lg">
            Share to chat
          </h2>

          <p className="text-xs opacity-60 mt-1">
            Select one or more chats
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessageOpenShare(false);
            setSelectedChats([]);
          }}
          className="
            w-8
            h-8
            rounded-full
            bg-gray-800
            text-white
            flex
            items-center
            justify-center
            hover:bg-red-500
            transition
          "
        >
          <X size={17} />
        </button>
      </div>

      {/* ======================================================= */}
      {/* SELECTED COUNT                                          */}
      {/* ======================================================= */}

      <div className="
        flex
        items-center
        justify-between
        mb-3
      ">
        <span className="text-xs opacity-60">
          {selectedChats.length === 0
            ? "No chat selected"
            : `${selectedChats.length} chat${
                selectedChats.length > 1
                  ? "s"
                  : ""
              } selected`}
        </span>

        {selectedChats.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setSelectedChats([])
            }
            className="
              text-xs
              text-red-500
              hover:text-red-600
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* ======================================================= */}
      {/* CHAT LIST                                               */}
      {/* ======================================================= */}

      <div className="
        flex-1
        overflow-y-auto
        space-y-2
        pr-1
        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
      ">
        {chats.map((chat) => {

          const isSelected =
            selectedChats.includes(
              chat.id
            );

          const chatUser =
            chat.other_user ||
            chat.other ||
            chat.teacher ||
            chat.student;

          const firstName =
            chatUser?.first_name || "";

          const lastName =
            chatUser?.last_name || "";

          const fullName =
            `${firstName} ${lastName}`
              .trim() ||
            chatUser?.name ||
            chat.name ||
            "Unknown User";

          const avatar =
            chatUser?.profile_image ||
            chatUser?.profile_picture ||
            chatUser?.avatar ||
            chat.image ||
            null;

          return (
            <button
              type="button"
              key={chat.id}
              onClick={() => {
                setSelectedChats((prev) =>
                  prev.includes(chat.id)
                    ? prev.filter(
                        (id) =>
                          id !== chat.id
                      )
                    : [
                        ...prev,
                        chat.id,
                      ]
                );
              }}
              className={`
                w-full
                flex
                items-center
                gap-3
                p-3
                rounded-xl
                border
                text-left
                transition-all
                duration-200
                ${
                  isSelected
                    ? `
                      bg-blue-50
                      dark:bg-blue-900/20
                      border-blue-500
                      shadow-sm
                    `
                    : `
                      border-gray-200/20
                      hover:bg-gray-100/10
                      hover:border-gray-300
                    `
                }
              `}
            >

              {/* ================================================= */}
              {/* AVATAR                                             */}
              {/* ================================================= */}

              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  className="
                    w-11
                    h-11
                    rounded-full
                    object-cover
                    flex-shrink-0
                  "
                />
              ) : (
                <div className="
                  w-11
                  h-11
                  rounded-full
                  bg-blue-500
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  flex-shrink-0
                ">
                  {fullName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              {/* ================================================= */}
              {/* NAME                                               */}
              {/* ================================================= */}

              <div className="flex-1 min-w-0">

                <div
                  className={`
                    font-medium
                    text-sm
                    truncate
                    ${
                      isSelected
                        ? "text-blue-600"
                        : ""
                    }
                  `}
                >
                  {fullName}
                </div>

                <div className="text-[11px] opacity-50 mt-0.5">
                  {chat.type === "group"
                    ? "Group"
                    : "Chat"}
                </div>

              </div>

              {/* ================================================= */}
              {/* SELECT ICON                                       */}
              {/* ================================================= */}

              <div
                className={`
                  w-7
                  h-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                  transition-all
                  ${
                    isSelected
                      ? `
                        bg-blue-600
                        text-white
                      `
                      : `
                        border-2
                        border-gray-300
                        text-transparent
                      `
                  }
                `}
              >
                <Check
                  size={16}
                  strokeWidth={3}
                />
              </div>

            </button>
          );
        })}

        {/* ===================================================== */}
        {/* EMPTY CHAT LIST                                       */}
        {/* ===================================================== */}

        {chats.length === 0 && (
          <div className="
            py-10
            text-center
            opacity-50
          ">
            <MessageCircle
              size={35}
              className="mx-auto mb-2"
            />

            <p className="text-sm">
              No chats available
            </p>
          </div>
        )}
      </div>

      {/* ======================================================= */}
      {/* SEND                                                     */}
      {/* ======================================================= */}

      <button
        type="button"
        disabled={
          sending ||
          selectedChats.length === 0
        }
        onClick={async () => {
          try {
            setSending(true);

            for (
              const chatId of selectedChats
            ) {
              await shareToChat(chatId);
            }

            setSelectedChats([]);
            setMessageOpenShare(false);

          } finally {
            setSending(false);
          }
        }}
        className={`
          mt-4
          w-full
          rounded-xl
          py-3
          flex
          items-center
          justify-center
          gap-2
          font-medium
          transition
          ${
            sending ||
            selectedChats.length === 0
              ? `
                bg-gray-400
                cursor-not-allowed
                text-white
              `
              : `
                bg-blue-600
                hover:bg-blue-700
                text-white
              `
          }
        `}
      >
        {sending ? (
          <>
            <svg
              className="
                animate-spin
                h-5
                w-5
              "
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
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            Sending...
          </>
        ) : (
          <>
            <Send size={18} />

            Send
            {selectedChats.length > 0 &&
              ` (${selectedChats.length})`}
          </>
        )}
      </button>

      {/* ======================================================= */}
      {/* CANCEL                                                   */}
      {/* ======================================================= */}

      <button
        type="button"
        onClick={() => {
          setMessageOpenShare(false);
          setSelectedChats([]);
        }}
        disabled={sending}
        className="
          mt-2
          w-full
          rounded-xl
          py-2.5
          bg-gray-200
          text-gray-700
          hover:bg-gray-300
          transition
        "
      >
        Cancel
      </button>

    </div>
  </div>
)}

    </div>
  );
}
