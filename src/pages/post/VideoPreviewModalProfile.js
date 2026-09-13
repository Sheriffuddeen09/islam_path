import React, { useRef, useState } from "react";
import api from "../../Api/axios";

import {
  MessageCircle,
  Trash2,
  Share2,
} from "lucide-react";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import ProfileVideoModalCommentReactionShare from "./previewimagevideo/ProfileVideoModalCommentReactionShare";

export default function VideoPreviewModalProfile({
  open,
  setOpen,
  media = [],
  index = 0,
  setIndex, commentsByPost, setCommentsByPost,
  setPosts,
  chats,
    post,
    currentUser,
    total_reaction,
    me,

    reactionList,
    reactionLoading,
    myReaction,
    toggleReaction,
    onLikeClick,

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
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);


  const [deleting, setDeleting] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  if (!open || !media || !media[index]) {
    return null;
  }

  const current = media[index];

 
  const closePreview = () => {
    setOpen(false);
    setShowOptions(false);
  };

  // =====================================================
  // PREVIOUS
  // =====================================================
  const goPrevious = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  // =====================================================
  // NEXT
  // =====================================================
  const goNext = () => {
    setIndex((prev) =>
      Math.min(prev + 1, media.length - 1)
    );
  };

  // =====================================================
  // MOBILE TOUCH START
  // =====================================================
  const handleTouchStart = (e) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  // =====================================================
  // MOBILE TOUCH END
  // =====================================================
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) {
      return;
    }

    const touch = e.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Ignore vertical dragging
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    // Ignore small swipe
    if (Math.abs(deltaX) < 50) {
      return;
    }

    // Swipe LEFT = NEXT
    if (deltaX < 0) {
      goNext();
    }

    // Swipe RIGHT = PREVIOUS
    if (deltaX > 0) {
      goPrevious();
    }
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async () => {
    if (!current?.id || !post?.id) {
      return;
    }

    try {
      setDeleting(true);

      const res = await api.delete(
        `/api/video/media/${current.id}`
      );

      if (res.data?.post_deleted) {
        setPosts((prev) =>
          prev.filter((p) => p.id !== post.id)
        );

        setShowDeleteModal(false);
        setOpen(false);

        return;
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== post.id) {
            return p;
          }

          return {
            ...p,
            media: p.media.filter(
              (m) => m.id !== current.id
            ),
          };
        })
      );

     

      setShowDeleteModal(false);

      // If deleting last video
      if (media.length <= 1) {
        setOpen(false);
      } else {
        // Move to previous if deleting last item
        if (index >= media.length - 1) {
          setIndex(Math.max(index - 1, 0));
        }
      }

    } catch (error) {
      console.error(
        "Video delete error:",
        error
      );
    } finally {
      setDeleting(false);
    }
  };

  const shareUrl =
    `${window.location.origin}/post/${post?.id}/share`;

  const shareLinks = {
    facebook:
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,

    whatsapp:
      `https://wa.me/?text=${encodeURIComponent(
        shareUrl
      )}`,

    twitter:
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}`,

    telegram:
      `https://t.me/share/url?url=${encodeURIComponent(
        shareUrl
      )}`,
  };

  return (
    <>
   
      <div
        className="
          fixed
          inset-0
          z-[9999]
          bg-black/90
          flex
          items-center
          justify-center
          touch-none
        "
       onClick={(e) => {
          if (e.target === e.currentTarget) {
            closePreview();
          }
        }}
      >
        {/* =================================================
    TOP RIGHT ACTIONS
================================================= */}
<div
  className="
    absolute
    top-4
    right-4
    z-[10010]
    flex
    items-center
    gap-3
  "
  onClick={(e) => e.stopPropagation()}
>
  {/* =============================================
      CLOSE
  ============================================= */}
  <button
    type="button"
    onClick={closePreview}
    className="
      w-10
      h-10
      rounded-full
      bg-white
      text-black
      flex
      items-center
      justify-center
      text-xl
      shadow-lg
      hover:bg-gray-200
      transition
      cursor-pointer
    "
    aria-label="Close video preview"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  </button>

  {/* =============================================
      OPTIONS
  ============================================= */}
  <div className="relative">

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setShowOptions((prev) => !prev);
      }}
      className="
        w-10
        h-10
        rounded-full
        bg-white
        text-black
        flex
        items-center
        justify-center
        shadow-lg
        hover:bg-gray-200
        transition
        cursor-pointer
      "
      aria-label="Video options"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-7 h-7 rotate-90"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="
            M12 6.75a.75.75 0 1 1
            0-1.5.75.75 0 0 1
            0 1.5ZM12 12.75a.75.75 0 1 1
            0-1.5.75.75 0 1 1
            0 1.5ZM12 18.75a.75.75 0 1 1
            0-1.5.75.75 0 1 1
            0 1.5Z
          "
        />
      </svg>
    </button>

    {/* =============================================
        OPTIONS POPUP
    ============================================= */}
    {showOptions && (
      <div
        className="
          absolute
          top-12
          right-0
          w-40
          bg-white
          rounded-lg
          shadow-xl
          border
          p-2
          z-[10020]
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* DELETE */}
        <button
          type="button"
          onClick={() => {
            setShowOptions(false);
            setShowDeleteModal(true);
          }}
          className="
            w-full
            flex
            items-center
            gap-2
            px-3
            py-2
            text-sm
            font-semibold
            text-red-600
            hover:bg-red-50
            rounded
          "
        >
          <Trash2 size={17} />
          Delete
        </button>

        {/* SHARE */}
        <button
          type="button"
          onClick={() => {
            setShowOptions(false);
            setShowShareModal(true);
          }}
          className="
            w-full
            flex
            items-center
            gap-2
            px-3
            py-2
            text-sm
            font-semibold
            text-gray-800
            hover:bg-gray-100
            rounded
          "
        >
          <Share2 size={17} />
          Share
        </button>

      </div>
    )}

  </div>
</div>

        {/* =================================================
            VIDEO / SWIPE AREA
        ================================================= */}
        <div
          className="
            relative
            w-full
            h-full
            flex
            items-center
            justify-center
            px-3
            md:px-16
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >


           <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
                              <ProfileVideoModalCommentReactionShare
                              post={post}
              
                              counts = {counts}
                              total = {total_reaction}
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
                              setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
                              commentInputRef={commentInputRef}
                              focusCommentInput={focusCommentInput}
                              newComment={newComment}
                              setNewComment={setNewComment}
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
                              setOpen={setOpen}
                              />
                              </div>

          {/* PREVIOUS
              HIDDEN ON MOBILE
          */}
          {index > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrevious();
              }}
              className="
                hidden
                md:flex
                absolute
                left-5
                top-1/2
                -translate-y-1/2
                z-40
                w-11
                h-11
                rounded-full
                border-2
                border-white
                bg-black/50
                text-white
                items-center
                justify-center
                text-3xl
                pb-1
                hover:bg-black/80
              "
            >
              ‹
            </button>
          )}

          {/* VIDEO */}
          <video
            key={current.id}
            src={current.url}
            className="
              max-h-[85vh]
              max-w-[95vw]
              md:max-w-[85vw]
              object-contain
              rounded-lg
            "
            controls
            autoPlay
            playsInline
            onClick={(e) =>
              e.stopPropagation()
            }
          />

          {/* NEXT
              HIDDEN ON MOBILE
          */}
          {index < media.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="
                hidden
                md:flex
                absolute
                right-5
                top-1/2
                -translate-y-1/2
                z-40
                w-11
                h-11
                rounded-full
                border-2
                border-white
                bg-black/50
                text-white
                items-center
                justify-center
                text-3xl
                pb-1
                hover:bg-black/80
              "
            >
              ›
            </button>
          )}

          {/* COUNTER */}
          {media.length > 1 && (
            <div
              className="
                absolute
                bottom-6
                left-1/2
                -translate-x-1/2
                bg-black/60
                text-white
                text-xs
                px-3
                py-1.5
                rounded-full
              "
            >
              {index + 1} / {media.length}
            </div>
          )}

        </div>

        {/* =================================================
            DELETE MODAL
        ================================================= */}
        {showDeleteModal && (
          <div
            className="
              fixed
              inset-0
              z-[10030]
              bg-black/70
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                text-center
                shadow-2xl
              "
            >
              <h3 className="text-lg font-bold text-black">
                Delete Video
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                Are you sure you want to delete this video?
              </p>

              <div className="flex justify-end gap-2 mt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                  className="
                    px-4
                    py-2
                    rounded
                    bg-gray-800
                    text-white
                    text-sm
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="
                    px-4
                    py-2
                    rounded
                    bg-red-600
                    text-white
                    text-sm
                    min-w-[80px]
                  "
                >
                  {deleting ? (
                    <span
                      className="
                        inline-block
                        w-5
                        h-5
                        border-2
                        border-white
                        border-t-transparent
                        rounded-full
                        animate-spin
                      "
                    />
                  ) : (
                    "Delete"
                  )}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* =================================================
            SHARE MODAL
        ================================================= */}
        {showShareModal && (
          <div
            className="
              fixed
              inset-0
              z-[10030]
              bg-black/70
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                relative
                shadow-2xl
              "
            >

              <button
                type="button"
                onClick={() =>
                  setShowShareModal(false)
                }
                className="
                  absolute
                  top-3
                  right-3
                  w-7
                  h-7
                  bg-gray-100
                  rounded-full
                  text-black
                "
              >
                ✕
              </button>

              <h2 className="
                text-lg
                font-bold
                text-black
                text-center
                mb-5
              ">
                Share Video
              </h2>

              <div className="
                flex
                flex-col
                items-center
                gap-5
              ">

                {/* CHAT */}
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShowChatModal(true);
                  }}
                  className="
                    flex
                    flex-col
                    items-center
                    gap-1
                    text-black
                    hover:text-blue-600
                  "
                >
                  <MessageCircle
                    size={38}
                    className="
                      border-2
                      border-black
                      rounded-full
                      p-1
                    "
                  />

                  <span className="text-sm font-bold">
                    Chat List
                  </span>
                </button>

                {/* SOCIAL */}
                <div
                  className="
                    grid
                    grid-cols-4
                    gap-4
                    border-t
                    pt-4
                    w-full
                  "
                >

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
                      text-black
                    "
                  >
                    <FaFacebook size={25} />
                    <span className="text-xs">
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
                      text-black
                    "
                  >
                    <FaWhatsapp size={25} />
                    <span className="text-xs">
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
                      text-black
                    "
                  >
                    <FaTwitter size={25} />
                    <span className="text-xs">
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
                      text-black
                    "
                  >
                    <FaTelegram size={25} />
                    <span className="text-xs">
                      Telegram
                    </span>
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CHAT SHARE MODAL
        ================================================= */}
        {showChatModal && (
          <div
            className="
              fixed
              inset-0
              z-[10040]
              bg-black/60
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                bg-white
                rounded-xl
                p-5
                w-80
                max-w-full
                max-h-[80vh]
                overflow-y-auto
              "
            >

              <div className="
                flex
                items-center
                justify-between
                mb-4
              ">
                <h2 className="
                  font-bold
                  text-lg
                  text-black
                ">
                  Share to chat
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setShowChatModal(false)
                  }
                  className="
                    w-7
                    h-7
                    bg-gray-100
                    rounded-full
                    text-black
                  "
                >
                  ✕
                </button>
              </div>

              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`
                    flex
                    items-center
                    gap-2
                    p-2
                    rounded
                    cursor-pointer
                    my-1
                    ${
                      selectedChats.includes(chat.id)
                        ? "bg-blue-200"
                        : "hover:bg-gray-100"
                    }
                  `}
                  onClick={() => {
                    setSelectedChats((prev) =>
                      prev.includes(chat.id)
                        ? prev.filter(
                            (id) => id !== chat.id
                          )
                        : [...prev, chat.id]
                    );
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedChats.includes(
                      chat.id
                    )}
                    readOnly
                  />

                  <span className="
                    text-sm
                    text-black
                  ">
                    {chat.other_user
                      ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                      : chat.teacher
                      ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                      : chat.student
                      ? `${chat.student.first_name} ${chat.student.last_name}`
                      : "Unknown User"}
                  </span>
                </div>
              ))}

              <button
                type="button"
                disabled={
                  sending ||
                  selectedChats.length === 0
                }
                onClick={shareToChat}
                className={`
                  mt-4
                  w-full
                  py-2
                  rounded
                  text-white
                  ${
                    sending ||
                    selectedChats.length === 0
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {sending ? (
                  <span
                    className="
                      inline-block
                      w-5
                      h-5
                      border-2
                      border-white
                      border-t-transparent
                      rounded-full
                      animate-spin
                    "
                  />
                ) : (
                  `Send (${selectedChats.length})`
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowChatModal(false)
                }
                className="
                  mt-2
                  w-full
                  py-2
                  rounded
                  bg-gray-200
                  text-black
                "
              >
                Cancel
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}

