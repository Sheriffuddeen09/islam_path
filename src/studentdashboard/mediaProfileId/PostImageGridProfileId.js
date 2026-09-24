

import React, { useRef, useState } from "react";
import api from "../../Api/axios";

import {
  MessageCircle, X, Check, Send
} from "lucide-react";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import ProfileImageCommentReactionShare from "../../pages/post/previewimagevideo/ProfileImageCommentReactionShare";

export default function PostImageGridProfileId({
  media = [], commentsByPost, setCommentsByPost,
  post,
  chats = [],
  setEditContent,
  setSelectedPost,
  setShowEditModal,
  setPosts,
  fetchProfile,
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
    handleShare,
    sending,
    messageOpenShare,
    selectedChats,
    setSelectedChats,
    shareToChat,
    postIdModal,
    setSending,
    setMessageOpenShare
}) {
  const [open, setOpen] = useState(false);
  const [showDeleteModalId, setShowDeleteModalId] = useState(false);
  const [openOptionId, setOpenOptionId] = useState(null);

  const [index, setIndex] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Mobile swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  if (!media || media.length === 0) {
    return null;
  }

  const total = media.length;

  // =========================================================
  // DELETE IMAGE
  // =========================================================
  const handleDelete = async (mediaId, postId) => {
    if (!mediaId || !postId) return;

    try {
      setLoadingProfile(true);

      const res = await api.delete(`/api/image/media/${mediaId}`);

      await fetchProfile();

      if (res.data.post_deleted) {
        // Remove entire post
        setPosts((prev) =>
          prev.filter((p) => p.id !== postId)
        );
      } else {
        // Remove only selected media
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) {
              return p;
            }

            return {
              ...p,
              media: p.media.filter(
                (m) => m.id !== mediaId
              ),
            };
          })
        );
      }

      setOpen(false);
      setShowDeleteModalId(false);
      setOpenOptionId(null);
      setIndex(0);

    } catch (error) {
      console.error("Delete image error:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const openPreview = (i) => {
    setIndex(i);
    setOpen(true);
    setOpenOptionId(null);
  };

  // =========================================================
  // CLOSE PREVIEW
  // =========================================================
  const closePreview = () => {
    setOpen(false);
    setOpenOptionId(null);
  };

  // =========================================================
  // PREVIOUS
  // =========================================================
  const goPrevious = () => {
    setIndex((currentIndex) =>
      Math.max(currentIndex - 1, 0)
    );
  };

  // =========================================================
  // NEXT
  // =========================================================
  const goNext = () => {
    setIndex((currentIndex) =>
      Math.min(
        currentIndex + 1,
        media.length - 1
      )
    );
  };

  // =========================================================
  // MOBILE TOUCH START
  // =========================================================
  const handleTouchStart = (e) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  // =========================================================
  // MOBILE TOUCH END
  // =========================================================
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) {
      return;
    }

    const touch = e.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;

    // Ignore mostly vertical movement
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    // Ignore small movement
    if (Math.abs(deltaX) < 50) {
      return;
    }

    // Swipe LEFT → NEXT
    if (deltaX < 0) {
      goNext();
    }

    // Swipe RIGHT → PREVIOUS
    if (deltaX > 0) {
      goPrevious();
    }
  };

  // =========================================================
  // IMAGE GRID
  // =========================================================

  // ---------------------------------------------------------
  // 1 IMAGE
  // ---------------------------------------------------------
  if (total === 1) {
    return (
      <>
        <img
          src={media[0]?.url}
          alt=""
          className="
            w-full
            max-h-[350px]
            object-cover
            rounded
            cursor-pointer
          "
          onClick={() => openPreview(0)}
        />

        <PreviewModal
          open={open}
          setOpen={setOpen}
          media={media}
          index={index}
          setIndex={setIndex}
          post={post}
        />
      </>
    );
  }

  // ---------------------------------------------------------
  // 2 IMAGES
  // ---------------------------------------------------------
  if (total === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">
          {media.map((img, i) => (
            <img
              key={img.id ?? i}
              src={img?.url}
              alt=""
              className="
                h-full
                w-full
                object-cover
                rounded
                cursor-pointer
              "
              onClick={() => openPreview(i)}
            />
          ))}
        </div>

        <PreviewModal
          open={open}
          setOpen={setOpen}
          media={media}
          index={index}
          setIndex={setIndex}
          post={post}
        />
      </>
    );
  }

  // ---------------------------------------------------------
  // 3 IMAGES
  // ---------------------------------------------------------
  if (total === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">

          <img
            src={media[0]?.url}
            alt=""
            className="
              row-span-2
              h-full
              min-h-[194px]
              w-full
              object-cover
              rounded
              cursor-pointer
            "
            onClick={() => openPreview(0)}
          />

          {media.slice(1).map((img, i) => (
            <img
              key={img.id ?? i}
              src={img?.url}
              alt=""
              className="
                h-40
                w-full
                object-cover
                rounded
                cursor-pointer
              "
              onClick={() => openPreview(i + 1)}
            />
          ))}

        </div>

        <PreviewModal
          open={open}
          setOpen={setOpen}
          media={media}
          index={index}
          setIndex={setIndex}
          post={post}
        />
      </>
    );
  }

  // ---------------------------------------------------------
  // 4+ IMAGES
  // ---------------------------------------------------------
  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <>
      <div className="grid grid-cols-2 gap-1 w-full">

        {visible.map((img, i) => (
          <div
            key={img.id ?? i}
            className="
              relative
              h-40
              cursor-pointer
            "
            onClick={() => openPreview(i)}
          >
            <img
              src={img?.url}
              alt=""
              className="
                h-full
                w-full
                object-cover
                rounded
              "
            />

            {i === 3 && remaining > 0 && (
              <div
                className="
                  absolute
                  inset-0
                  bg-black/60
                  flex
                  items-center
                  justify-center
                  rounded
                "
              >
                <span
                  className="
                    text-white
                    text-2xl
                    font-bold
                  "
                >
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        ))}

      </div>

      <PreviewModal
        open={open}
        setOpen={setOpen}
        media={media}
        index={index}
        setIndex={setIndex}
        post={post}
      />
    </>
  );

  // =========================================================
  // PREVIEW MODAL
  // =========================================================
  function PreviewModal({
    open,
    setOpen,
    media,
    index,
    setIndex,
    post,
  }) {
    if (!open || !media || !media[index]) {
      return null;
    }

    const current = media[index];

    return (
      <div
        className="
          fixed
          inset-0
          bg-black/90
          z-[9999]
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
            TOP RIGHT BUTTONS
        ================================================= */}
        <div
          className="
            absolute
            top-4
            right-4
            z-[10000]
            flex
            items-center
            gap-3
          "
        >

          {/* CLOSE */}
          <button
            type="button"
            onClick={closePreview}
            className="
              text-black
              bg-white
              rounded-full
              w-10
              h-10
              text-xl
              flex
              items-center
              justify-center
              shadow-lg
              hover:bg-gray-100
            "
          >
            ✕
          </button>

          {/* OPTIONS */}
          <div className="relative">

            <button
              type="button"
              onClick={() =>
                current &&
                setOpenOptionId(
                  openOptionId === current.id
                    ? null
                    : current.id
                )
              }
              className="
                w-10
                h-10
                flex
                items-center
                justify-center
                text-black
                bg-white
                rounded-full
                hover:bg-gray-100
                shadow-lg
              "
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
                    0-1.5.75.75 0 0 1
                    0 1.5ZM12 18.75a.75.75 0 1 1
                    0-1.5.75.75 0 0 1
                    0 1.5Z
                  "
                />
              </svg>
            </button>

            {/* OPTIONS MENU */}
            {openOptionId === current.id && (
              <div
                className="
                  absolute
                  top-12
                  right-0
                  w-40
                  bg-white
                  border
                  rounded-lg
                  shadow-xl
                  p-2
                  z-[10001]
                "
              >

                {/* EDIT */}
                {post?.content &&
                  post.content.trim() !== "" && (
                    <button
                      type="button"
                      className="
                        flex
                        items-center
                        gap-2
                        font-semibold
                        text-sm
                        w-full
                        px-3
                        py-2
                        text-gray-800
                        hover:bg-gray-100
                        rounded
                      "
                      onClick={() => {
                        setSelectedPost(post);
                        setEditContent(post.content);
                        setShowEditModal(true);
                        setOpenOptionId(null);
                        setOpen(false);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="
                            m16.862 4.487
                            1.687-1.688
                            a1.875 1.875 0 1 1
                            2.652 2.652L10.582 16.07
                            a4.5 4.5 0 0 1-1.897 1.13
                            l-3.41 1.02
                            1.02-3.41
                            a4.5 4.5 0 0 1
                            1.13-1.897L16.863 4.487Z
                          "
                        />
                      </svg>

                      Edit
                    </button>
                  )}

                {/* DELETE */}
                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-2
                    font-semibold
                    text-sm
                    w-full
                    px-3
                    py-2
                    text-red-600
                    hover:bg-red-50
                    rounded
                  "
                  onClick={() => {
                    setSelectedMediaId(current?.id);
                    setSelectedPostId(post?.id);
                    setShowDeleteModalId(true);
                    setOpenOptionId(null);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="
                        m14.74 9-.346 9
                        m-4.788 0L9.26 9
                        m9.968-3.21c.342.052.682.107
                        1.022.166m-1.022-.165L18.16 19.673
                        a2.25 2.25 0 0 1-2.244 2.077
                        H8.084a2.25 2.25 0 0 1-2.244-2.077
                        L4.772 5.79
                        m14.456 0a48.108 48.108 0 0 0-3.478-.397
                        m-12 .562c.34-.059.68-.114
                        1.022-.165m0 0a48.11 48.11 0 0 1
                        3.478-.397m7.5 0v-.916
                        c0-1.18-.91-2.164-2.09-2.201
                        a51.964 51.964 0 0 0-3.32 0
                        c-1.18.037-2.09 1.022-2.09 2.201v.916
                      "
                    />
                  </svg>

                  Delete
                </button>

                {/* SHARE */}
                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-2
                    font-semibold
                    text-sm
                    w-full
                    px-3
                    py-2
                    text-gray-800
                    hover:bg-gray-100
                    rounded
                  "
                  onClick={() => {
                    setOpenOptionId(null);
                    setShares(true);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="
                        M7.217 10.907a2.25 2.25 0 1 0
                        0 2.186m0-2.186c.18.324.283.696.283 1.093
                        s-.103.77-.283 1.093m0-2.186
                        9.566-5.314m-9.566 7.5
                        9.566 5.314m0 0a2.25 2.25 0 1 0
                        1.093 1.973 2.25 2.25 0 0 0-1.093-1.973Zm0-10.628
                        a2.25 2.25 0 1 0 1.093 1.973
                        2.25 2.25 0 0 0-1.093-1.973Z
                      "
                    />
                  </svg>

                  Share
                </button>

              </div>
            )}
          </div>
        </div>

        {/* =================================================
            MOBILE SWIPE AREA
        ================================================= */}
        <div
          className="
            relative
            w-full
            h-full
            flex
            items-center
            justify-center
            px-4
            md:px-16
            select-none
          "
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* =================================================
              PREVIOUS BUTTON
              HIDDEN ON MOBILE
          ================================================= */}
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

          {/* =================================================
              IMAGE
          ================================================= */}
          <img
            src={current.url}
            alt=""
            draggable={false}
            className="
              max-h-[82vh]
              max-w-[95vw]
              md:max-w-[85vw]
              object-contain
              rounded
              pointer-events-none
              select-none
            "
          />

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
          <ProfileImageCommentReactionShare
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
                          setOpen={closePreview}
                                    />
                                    </div>

          {/* =================================================
              NEXT BUTTON
              HIDDEN ON MOBILE
          ================================================= */}
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

          {/* =================================================
              IMAGE COUNTER
          ================================================= */}
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
        scrollbar-thin
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



        {showDeleteModalId && (
          <div
            className="
              fixed
              inset-0
              bg-black/60
              z-[10030]
              flex
              items-center
              justify-center
              p-4
            "
          >
            <div
              className="
                bg-white
                p-5
                rounded-xl
                w-80
                max-w-full
                text-center
                shadow-2xl
              "
            >
              <h3 className="font-bold text-lg text-black mb-2">
                Delete Image
              </h3>

              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this image?
              </p>

              <div className="flex justify-end gap-2 mt-5">

                <button
                  type="button"
                  className="
                    text-white
                    bg-gray-800
                    px-4
                    py-2
                    rounded
                    text-sm
                  "
                  onClick={() =>
                    setShowDeleteModalId(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedMediaId,
                      selectedPostId
                    )
                  }
                  disabled={loadingProfile}
                  className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded
                    text-sm
                    min-w-[80px]
                  "
                >
                  {loadingProfile ? (
                    <span
                      className="
                        animate-spin
                        inline-block
                        h-5
                        w-5
                        border-2
                        border-white
                        border-t-transparent
                        rounded-full
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

      </div>
    );
  }
}