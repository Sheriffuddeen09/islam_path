import React, { useRef, useState } from "react";
import api from "../../Api/axios";

import {
  Loader2,
  Download,
  MessageCircle,
} from "lucide-react";

import {
  FaFacebook,
  FaWhatsapp,
  FaTwitter,
  FaTelegram,
} from "react-icons/fa";
import PreviewCommentReactionShare from "./PreviewCommentReactionShare";
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
    commentsByPost,setCommentsByPost

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

      {/* =========================================================
          SHARE MODAL
      ========================================================= */}

      {shares && (
        <div
          className="
            fixed
            inset-0
            bg-black/70
            z-[10000]
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() => setShares(false)}
        >
          <div
            className="
              bg-white
              rounded-lg
              p-4
              w-80
              relative
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() => setShares(false)}
              className="
                absolute
                right-3
                top-2
                text-black
                bg-gray-100
                w-7
                h-7
                rounded
              "
            >
              ✕
            </button>

            <h2 className="font-bold text-black text-lg mb-4">
              Share Post
            </h2>

            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setMessageOpenShare(true);
                  setShares(false);
                }}
                className="
                  text-black
                  flex
                  flex-col
                  items-center
                  gap-1
                  hover:text-blue-600
                "
              >
                <MessageCircle
                  className="
                    border-2
                    border-black
                    rounded-full
                    p-1
                  "
                  size={35}
                />

                <span className="text-sm font-bold">
                  Chat List
                </span>
              </button>

              <div
                className="
                  grid
                  grid-cols-4
                  border-t-2
                  pt-3
                  gap-4
                  text-center
                  w-full
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    handleShare("facebook")
                  }
                  className="
                    text-black
                    flex
                    flex-col
                    items-center
                    gap-1
                  "
                >
                  <FaFacebook size={28} />
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
                    text-black
                    flex
                    flex-col
                    items-center
                    gap-1
                  "
                >
                  <FaWhatsapp size={28} />
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
                    text-black
                    flex
                    flex-col
                    items-center
                    gap-1
                  "
                >
                  <FaTwitter size={28} />
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
                    text-black
                    flex
                    flex-col
                    items-center
                    gap-1
                  "
                >
                  <FaTelegram size={28} />
                  <span className="text-xs">
                    Telegram
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SHARE TO CHAT
      ========================================================= */}

      {messageOpenShare && (
        <div
          className="
            fixed
            inset-0
            bg-black/50
            z-[10001]
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              bg-white
              rounded-lg
              p-4
              w-80
              max-h-[80vh]
              overflow-y-auto
            "
          >
            <h2 className="font-bold text-black mb-3">
              Share to chat
            </h2>

            {chats.length === 0 && (
              <p className="text-gray-500 text-sm">
                No chats available.
              </p>
            )}

            {chats.map((chat) => {
              const name =
                chat.other_user
                  ? `${chat.other_user.first_name} ${chat.other_user.last_name}`
                  : chat.teacher
                    ? `${chat.teacher.first_name} ${chat.teacher.last_name}`
                    : chat.student
                      ? `${chat.student.first_name} ${chat.student.last_name}`
                      : "Unknown User";

              return (
                <div
                  key={chat.id}
                  className={`
                    flex
                    items-center
                    gap-2
                    p-2
                    cursor-pointer
                    rounded
                    my-1
                    ${
                      selectedChats.includes(
                        chat.id
                      )
                        ? "bg-blue-200"
                        : "hover:bg-gray-100"
                    }
                  `}
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
                >
                  <input
                    type="checkbox"
                    checked={selectedChats.includes(
                      chat.id
                    )}
                    readOnly
                  />

                  <span className="text-black">
                    {name}
                  </span>
                </div>
              );
            })}

            {/* SEND */}

            <button
              type="button"
              disabled={
                sending ||
                selectedChats.length === 0
              }
              onClick={async () => {
                try {
                  setSending(true);

                  for (const chatId of selectedChats) {
                    await shareToChat(chatId);
                  }

                  setSelectedChats([]);
                  setMessageOpenShare(false);
                } catch (error) {
                  console.error(
                    "Failed to share to chat:",
                    error
                  );
                } finally {
                  setSending(false);
                }
              }}
              className={`
                mt-3
                w-full
                rounded
                py-2
                text-white
                ${
                  sending ||
                  selectedChats.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >
              {sending ? (
                <Loader2
                  className="
                    w-5
                    h-5
                    animate-spin
                    mx-auto
                  "
                />
              ) : (
                `Send (${selectedChats.length})`
              )}
            </button>

            {/* CANCEL */}

            <button
              type="button"
              onClick={() => {
                setMessageOpenShare(false);
                setSelectedChats([]);
              }}
              className="
                mt-3
                w-full
                bg-gray-200
                text-black
                rounded
                py-2
              "
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE MODAL
      ========================================================= */}

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