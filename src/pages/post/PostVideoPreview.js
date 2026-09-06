



import { useEffect, useRef, useState } from "react";
import PostOptionsId from "./PostOptionId";
import VideoCommentReactionShare from "./previewimagevideo/VideoCommentReactionShare";

export default function PostVideoPreview({
    post,
    chats,
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const touchStartX = useRef(null);

  
  useEffect(() => {
    if (!previewOpen) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closePreview();
      }

      if (e.key === "ArrowLeft") {
        goPrevious();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [previewOpen]);


  const videos = Array.isArray(post?.media)
    ? post.media.filter((m) => m.type === "video")
    : [];

  if (!videos.length) {
    return null;
  }

  const currentVideo = videos[previewIndex];

  const openPreview = (index) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const goPrevious = () => {
    setPreviewIndex((prev) =>
      Math.max(prev - 1, 0)
    );
  };

  const goNext = () => {
    setPreviewIndex((prev) =>
      Math.min(prev + 1, videos.length - 1)
    );
  };

  /* =========================================================
     TOUCH / DRAG
  ========================================================== */

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX =
      touchEndX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(deltaX) < 50) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  /* =========================================================
     ESC TO CLOSE
  ========================================================== */

  return (
    <>
      {/* =====================================================
          VIDEO LIST / POST PREVIEW
      ====================================================== */}

      {videos.map((video, index) => (
        <div
          key={video.id}
          className="px-4 cursor-pointer"
          onClick={() => openPreview(index)}
        >
          <video
            src={video.url}
            className="
              w-full
              h-64
              object-cover
              rounded-lg
            "
            muted
            playsInline
          />
        </div>
      ))}

      {/* =====================================================
          FULL SCREEN VIDEO PREVIEW
      ====================================================== */}

      {previewOpen && currentVideo && (
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
            if (e.target === e.currentTarget) {
              closePreview();
            }
          }}
        >

          {/* =================================================
              TOP RIGHT BUTTONS
          ================================================== */}

          <div
            className="
              absolute
              top-4
              right-4
              z-[100]
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
                w-10
                h-10
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                text-xl
                font-bold
                shadow-lg
                hover:bg-gray-200
              "
            >
              ✕
            </button>

            {/* POST OPTIONS */}
            <div
              className="
                rounded-full
                shadow-lg
              "
              onClick={(e) => e.stopPropagation()}
            >
              <PostOptionsId
                post={post}
                chats={chats}
              />
            </div>
          </div>

          {/* =================================================
              VIDEO CONTAINER
          ================================================== */}

          <div
            className="
              relative
              w-full
              h-full
              flex
              items-center
              justify-center
              px-4
              select-none
              relative
            "
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >

            <video
              key={currentVideo.id}
              src={currentVideo.url}
              className="
                max-w-[95vw]
                max-h-[90vh]
                w-auto
                h-auto
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

            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-30">
                                    <VideoCommentReactionShare
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
                                    setOpen={setPreviewOpen}
                                    />
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
                  z-50
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
                  transition
                "
              >
                ‹
              </button>
            )}

            {/* =============================================
                NEXT
            ============================================== */}

            {previewIndex <
              videos.length - 1 && (
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
                  z-50
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
                  transition
                "
              >
                ›
              </button>
            )}
          </div>

          {/* =================================================
              COUNTER
          ================================================== */}

          {videos.length > 1 && (
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
                py-1
                rounded-full
                z-50
              "
            >
              {previewIndex + 1} /{" "}
              {videos.length}
            </div>
          )}

          {/* =================================================
              MOBILE DRAG HINT
          ================================================== */}

          {videos.length > 1 && (
            <div
              className="
                md:hidden
                absolute
                bottom-14
                left-1/2
                -translate-x-1/2
                text-white/70
                text-xs
              "
            >
              Swipe left or right
            </div>
          )}
        </div>
      )}
    </>
  );
}