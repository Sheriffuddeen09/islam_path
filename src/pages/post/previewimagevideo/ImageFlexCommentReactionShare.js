import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
} from "lucide-react";
export default function ImageFlexCommentReactionShare({
  chats,
    post,
    currentUser,
    total,
    me,

    reactionList,
    reactionLoading,
    myReaction,
    toggleReaction,
    onLikeClick,  
    setOpen,

    setEmojiList,
    focusCommentInput,

    emojiList,

    showEmoji,
    setShowEmoji,
    loading,
    newComment,
    setNewComment,
    commentInputRef,
    postComments,
    setPostComments,
    getColor,
    setShowReactions,
    showReactions,
    showUsersPopup,
    setShowUsersPopup,
    showEmojiPicker,
    setShowEmojiPicker,
    allUsers,
    firstUser,
    counts,
    others,
    setLoading,
    setPostIdModal,
    setShares,
    shares,
    setMessageOpenShare,
    handleShare,
    sending,
    messageOpenShare,
    selectedChats,
    setSelectedChats,
    setSending,
    shareToChat,
    postIdModal

}) {
  return (
    <>
      {/* =========================================================
          MAIN ACTION AREA
          LIKE / COMMENT / SHARE ARE IN ONE COLUMN
      ========================================================== */}
      <div className="flex items-start justify-between px-4 mt-4">

        {/* =====================================================
            LEFT SIDE - USERS WHO REACTED
        ====================================================== */}
        <div className="flex-1 min-w-0">

          {/* Reaction summary */}
          {total > 0 && (
            <div className="flex items-center gap-2 text-xs">

              {/* Emoji summary */}
              <div className="flex items-center">
                {Object.keys(counts).map((emoji) => (
                  <span
                    key={emoji}
                    className="text-xs -mr-1"
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {/* Users */}
              <div className="flex items-center gap-1 cursor-pointer">

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

                {/* REMAINING USERS */}
                {others.length > 1 && (
                  <>
                    <span>and</span>

                    <span
                      className="font-semibold hover:underline"
                      onClick={() => setShowUsersPopup(true)}
                    >
                      {others.length - 1} other
                      {others.length - 1 > 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start 
        bg-black/30 py-5 px-2 rounded-xl gap-4">

          {/* ===================================================
              LIKE
          ==================================================== */}
          <div
            className="relative group"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {/* Reaction picker */}
            {showReactions && (
              <div
                className="
                  absolute
                  right-full
                  top-1/2
                  -translate-y-1/2
                  mr-2

                  opacity-0
                  invisible

                  group-hover:opacity-100
                  group-hover:visible

                  transform
                  transition-all
                  duration-300

                  bg-white
                  shadow-lg
                  rounded-full

                  px-3
                  py-2

                  flex
                  items-center
                  gap-2

                  z-[100]
                "
                onMouseEnter={() => setShowReactions(true)}
              >
                {reactionList.map((emoji) => (
                  <span
                    key={emoji}
                    onClick={() =>
                      !reactionLoading &&
                      toggleReaction(emoji)
                    }
                    className={`
                      text-2xl
                      transition
                      cursor-pointer

                      ${
                        reactionLoading
                          ? "opacity-50 pointer-events-none"
                          : "hover:scale-125"
                      }
                    `}
                  >
                    {reactionLoading &&
                    myReaction === emoji
                      ? "⏳"
                      : emoji}
                  </span>
                ))}

                {/* PLUS / MORE EMOJIS */}
                <div className="relative flex items-center">

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (!reactionLoading) {
                        setShowEmojiPicker((prev) => !prev);
                      }
                    }}
                    disabled={reactionLoading}
                    className={`
                      w-8
                      h-8
                      rounded-full
                      bg-gray-100
                      text-gray-600
                      text-xl
                      flex
                      p-1
                      items-center
                      justify-center
                      transition

                      ${
                        reactionLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-200 hover:scale-110"
                      }
                    `}
                  >
                    +
                  </button>

                  {/* FULL EMOJI PICKER */}
                  {showEmojiPicker && (
                    <div
                      className="
                        absolute
                        right-0
                        bottom-full
                        mb-2
                        z-[9999]
                      "
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          toggleReaction(emojiData.emoji);
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIKE BUTTON */}
            
            <button
              type="button"
              onClick={onLikeClick}
              className={`
                flex-col
                flex
                items-center
                gap-0.5
                font-semibold
                transition
                
                rounded-full 

                ${
                  myReaction
                    ? "font-bold text-blue-900 bg-white"
                    : "text-white"
                }

              `}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                />
              </svg>

            </button>
          </div>
                <div className="relative flex items-center">

          <button
            type="button"
            onClick={() => {setPostIdModal(post); focusCommentInput(); setOpen(false)}}
            className="
              flex
              flex-col
              items-center
              gap-0.5
              font-semibold
              transition
              text-white
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
              />
            </svg>

            <span className="absolute -top-4 right-0 text-red-500 font-bold">{post?.comments_count}</span>
          </button>
            </div>
                <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => setShares(true)}
            className="
              flex
              items-center
              flex-col
              gap-0.5
              font-semibold
              transition
              text-white
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 1 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 1 0 0 2h6.17A3 3 0 0 0 18 16Z" />
            </svg>

            <span className="absolute -top-4 right-0 text-red-500 font-bold">{post?.shares_count}</span>
          </button>
        </div>
        </div>
      </div>

      {showUsersPopup && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-[9999]
            flex
            items-center
            justify-center
          "
          onClick={() => setShowUsersPopup(false)}
        >
          <div
            className="
              relative
              w-80
              sm:w-96
              max-h-[80vh]
              overflow-y-auto
              bg-[var(--bg-color)]
              text-[var(--text-color)]
              rounded-xl
              p-4
              shadow-xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-xl font-bold py-3">
              User Likes
            </h1>

            <button
              type="button"
              onClick={() => setShowUsersPopup(false)}
              className="
                absolute
                right-4
                top-3
                w-8
                h-8
                rounded-full
                flex
                items-center
                justify-center
                hover:bg-gray-100
              "
            >
              ✕
            </button>

            <div className="space-y-1">
              {allUsers.map((user) => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    p-2
                    rounded-lg
                    hover:bg-gray-100
                    transition
                  "
                  onClick={() =>
                    setShowUsersPopup(false)
                  }
                >
                  <div
                    className={`
                      w-9
                      h-9
                      rounded-full
                      ${getColor(user.id)}
                      flex
                      items-center
                      justify-center
                      text-lg
                      font-semibold
                    `}
                  >
                    {user.id === currentUser?.id
                      ? "Y"
                      : user.name
                          ?.charAt(0)
                          .toUpperCase()}
                  </div>

                  <span className="font-medium">
                    {user.id === currentUser?.id
                      ? "You"
                      : user.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

    
    </>
  );
}