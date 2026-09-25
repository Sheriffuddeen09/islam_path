import React, { useRef, useState } from "react";
import api from "../../Api/axios";

import {
  Loader2,
  X, Check, Send,
  MessageCircle,
} from "lucide-react";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import ImageFlexCommentReactionShare from "./previewimagevideo/ImageFlexCommentReactionShare";

export default function ImageFlex({
  media = [],
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
  video, setVideo,
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
    postIdModal, image, setImage, user, usersPreview,
    commentsByPost,setCommentsByPost, setShowCommentPop

}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [openOptionId, setOpenOptionId] = useState(null);


  const [showDeleteModalId, setShowDeleteModalId] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);

  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | No media
  |--------------------------------------------------------------------------
  */

  if (!media || media.length === 0) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Current media
  |--------------------------------------------------------------------------
  */

  const current = media[previewIndex];

  /*
  |--------------------------------------------------------------------------
  | Open preview
  |--------------------------------------------------------------------------
  */

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
    setOpenOptionId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Close preview
  |--------------------------------------------------------------------------
  */

  const closePreview = () => {
    setPreviewOpen(false);
    setOpenOptionId(null);
    setShares(false);
    setMessageOpenShare(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Previous / Next
  |--------------------------------------------------------------------------
  */

  const goPrevious = () => {
    setPreviewIndex((index) => Math.max(index - 1, 0));
    setOpenOptionId(null);
  };

  const goNext = () => {
    setPreviewIndex((index) =>
      Math.min(index + 1, media.length - 1)
    );
    setOpenOptionId(null);
  };

  /*
  |--------------------------------------------------------------------------
  | Touch swipe
  |--------------------------------------------------------------------------
  */

  const handleTouchStart = (e) => {
    const touch = e.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

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

    // Ignore vertical scrolling
    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    // Ignore small movement
    if (Math.abs(deltaX) < 50) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete media
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (mediaId, postId) => {
    if (!mediaId || !postId) {
      return;
    }

    try {
      setLoadingProfile(true);

      const res = await api.delete(
        `/api/image/media/${mediaId}`
      );

      if (fetchProfile) {
        await fetchProfile();
      }

      if (res.data?.post_deleted) {
        setPosts((prev) =>
          prev.filter((p) => p.id !== postId)
        );

        closePreview();
      } else {
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) {
              return p;
            }

            return {
              ...p,
              media: (p.media || []).filter(
                (m) => m.id !== mediaId
              ),
            };
          })
        );

        // If this was the last media, close preview
        if (media.length <= 1) {
          closePreview();
        } else {
          setPreviewIndex((index) =>
            Math.min(index, media.length - 2)
          );
        }
      }

      setShowDeleteModalId(false);
      setSelectedMediaId(null);
      setSelectedPostId(null);
    } catch (error) {
      console.error(
        "Failed to delete media:",
        error
      );
    } finally {
      setLoadingProfile(false);
    }
  };

 

  const ImageItem = ({
    image,
    index,
    className = "",
  }) => {
    if (!image) {
      return null;
    }

    return (
      <img
        src={image.url}
        alt=""
        onClick={() => openPreview(index)}
        draggable={false}
        className={`
          cursor-pointer
          ${className}
        `}
      />
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Total
  |--------------------------------------------------------------------------
  */

  const total = media.length;

  return (
    <>
      {/* =========================================================
          MEDIA GRID
      ========================================================= */}

      {total === 1 && (
        <ImageItem
          image={media[0]}
          index={0}
          className="
            w-full
            sm:h-96
            h-64
            rounded-lg
            object-cover
          "
        />
      )}

      {total === 2 && (
        <div className="grid grid-cols-1 gap-2">
          {media.map((img, index) => (
            <ImageItem
              key={img.id || index}
              image={img}
              index={index}
              className="
                sm:h-96
                h-64
                w-full
                object-cover
                rounded-lg
              "
            />
          ))}
        </div>
      )}

      {total === 3 && (
        <div className="grid grid-cols-1 gap-2">
          <ImageItem
            image={media[0]}
            index={0}
            className="
              sm:h-96
              h-64
              w-full
              object-cover
              rounded-lg
            "
          />

          {media.slice(1).map((img, index) => (
            <ImageItem
              key={img.id || index}
              image={img}
              index={index + 1}
              className="
                sm:h-96
                h-64
                w-full
                object-cover
                rounded-lg
              "
            />
          ))}
        </div>
      )}

      {total >= 4 && (
        <div
          className="
            grid
            grid-cols-1
            gap-2
            sm:px-4
          "
        >
          {media.map((img, index) => (
            <div
              key={img.id || index}
              className="
                relative
                sm:h-96
                h-64
                cursor-pointer
              "
            >
              <ImageItem
                image={img}
                index={index}
                className="
                  w-full
                  sm:h-96
                  h-64
                  object-cover
                  rounded-lg
                "
              />
            </div>
          ))}
        </div>
      )}

      {/* =========================================================
          PREVIEW MODAL
      ========================================================= */}

      {previewOpen && current && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-black/90
            flex
            items-center
            justify-center
          "
          onClick={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closePreview();
            }
          }}
        >
          {/* =====================================================
              CLOSE BUTTON
          ===================================================== */}

          <button
            type="button"
            onClick={closePreview}
            className="
              absolute
              top-4
              right-4
              z-[100]
              w-10
              h-10
              rounded-full
              bg-white
              text-black
              flex
              items-center
              justify-center
              text-xl
              font-semibold
            "
          >
            ✕
          </button>

          {/* =====================================================
              OPTIONS BUTTON
          ===================================================== */}

          <div className="absolute top-4 right-16 z-[100]">
            <button
              type="button"
              onClick={() => {
                setOpenOptionId((prev) =>
                  prev === current.id
                    ? null
                    : current.id
                );
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
                hover:bg-gray-100
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
                    M12 6.75a.75.75 0 1 1 0-1.5
                    .75.75 0 0 1 0 1.5ZM12 12.75
                    a.75.75 0 1 1 0-1.5.75.75 0
                    0 1 0 1.5ZM12 18.75a.75.75
                    0 1 1 0-1.5.75.75 0 0 1
                    0 1 0 1.5Z
                  "
                />
              </svg>
            </button>

            {/* =================================================
                OPTIONS MENU
            ================================================= */}

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
                  text-black
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
                        font-bold
                        text-sm
                        w-full
                        px-3
                        py-2
                        hover:bg-gray-100
                        rounded
                      "
                      onClick={() => {
                        setSelectedPost(post);
                        setEditContent(
                          post.content
                        );
                        setShowEditModal(true);
                        setOpenOptionId(null);
                        setPreviewOpen(false);
                      }}
                    >
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
                    font-bold
                    text-sm
                    w-full
                    px-3
                    py-2
                    hover:bg-red-50
                    text-red-600
                    rounded
                  "
                  onClick={() => {
                    setSelectedMediaId(
                      current.id
                    );

                    setSelectedPostId(
                      post?.id
                    );

                    setShowDeleteModalId(true);
                    setOpenOptionId(null);
                  }}
                >
                  Delete
                </button>

                {/* SHARE */}

                <button
                  type="button"
                  className="
                    flex
                    items-center
                    gap-2
                    font-bold
                    text-sm
                    w-full
                    px-3
                    py-2
                    hover:bg-gray-100
                    rounded
                  "
                  onClick={() => {
                    setOpenOptionId(null);
                    setShares(true);
                  }}
                >
                  Share
                </button>
              </div>
            )}
          </div>

          {/* =====================================================
              MEDIA
          ===================================================== */}

          <div
            className="
              max-w-[95vw]
              max-h-[90vh]
              flex
              items-center
              justify-center
              touch-pan-y
              select-none
              relative
            "
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={current.url}
              alt=""
              draggable={false}
              className="
                max-w-[95vw]
                max-h-[90vh]
                object-contain
                select-none
                pointer-events-none
              "
            />

         <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
                         <ImageFlexCommentReactionShare
                         post={post}
                         setShowCommentPop={closePreview}
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
                         setPostComments={setPostComments}
                         commentsByPost={commentsByPost}
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
                         setPosts={setPosts}
                          image={image}
                          usersPreview={usersPreview}
                          setImage={setImage}
                          video={video} setVideo={setVideo}
                          user={user}
                          setOpen={setPreviewOpen}
                         />
                         </div>
          </div>

          {previewIndex > 0 && (
            <button
              type="button"
              onClick={goPrevious}
              className="
                hidden
                md:flex
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                z-40
                w-10
                h-10
                rounded-full
                border-2
                border-white
                bg-black/40
                text-white
                items-center
                justify-center
                text-3xl
                pb-1
                hover:bg-black/70
              "
            >
              ‹
            </button>
          )}

          {/* =====================================================
              NEXT
          ===================================================== */}

          {previewIndex < media.length - 1 && (
            <button
              type="button"
              onClick={goNext}
              className="
                hidden
                md:flex
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                z-40
                w-10
                h-10
                rounded-full
                border-2
                border-white
                bg-black/40
                text-white
                items-center
                justify-center
                text-3xl
                pb-1
                hover:bg-black/70
              "
            >
              ›
            </button>
          )}

          {/* =====================================================
              COUNTER
          ===================================================== */}

          {media.length > 1 && (
            <div
              className="
                absolute
                bottom-5
                left-1/2
                -translate-x-1/2
                bg-black/60
                text-white
                text-xs
                px-3
                py-1
                rounded-full
              "
            >
              {previewIndex + 1} / {media.length}
            </div>
          )}
        </div>
      )}

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
            bg-black/50
            z-[10002]
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              bg-white
              p-4
              rounded-lg
              w-72
              text-center
            "
          >
            <p className="text-black">
              Are you sure you want to
              delete this image?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="
                  text-white
                  bg-gray-800
                  p-2
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
                  text-white
                  px-3
                  py-2
                  rounded
                  min-w-20
                "
              >
                {loadingProfile ? (
                  <Loader2
                    className="
                      w-5
                      h-5
                      animate-spin
                      mx-auto
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
    </>
  );
}