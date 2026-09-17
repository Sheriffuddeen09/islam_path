import { Link, useNavigate } from "react-router-dom";
import logo from "../../layout/image/favicon.png";
import PostOptions from "./PostOption";
import { useState, useRef, useEffect } from "react";
import PostOptionsId from "./PostOptionId";

export default function ReplyImageSlider({
  images = [],
  post,
  chats,
  showOverlay,
  showMore,
  text,
  shortText,
  hasLongText,
  showReactions,
  setShowReactions,
  handleCommentPop,
  setShowMore,
  reactionList,
  reactionLoading,
  toggleReaction,
  setShowEmoji,
  total,
  myReaction,
  setShares, setShowOverlay, getColor, getInitial
}) {
  const [index, setIndex] = useState(0);

  const startX = useRef(0);
  const endX = useRef(0);
    
    const mouseTimerRef = useRef(null);
    const handleMouseMove = () => {
      setShowOverlay(true);

      clearTimeout(mouseTimerRef.current);

      mouseTimerRef.current = setTimeout(() => {
        setShowOverlay(false);
      }, 700);
    };


    useEffect(() => {
      return () => {
        clearTimeout(mouseTimerRef.current);
      };
    }, []);

    const formatPostTime = (date) => {
  if (!date) return "";

  const created = new Date(date);
  const now = new Date();

  const diffMs = now - created;
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds === 1 ? "" : "s"}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
};


  if (!images.length) return null;

  const next = () => {
    setIndex((i) => (i + 1) % images.length);
  };

  const prev = () => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    endX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = startX.current - endX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next();
      } else {
        prev();
      }
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
    >
      {/* IMAGE */}
      <img
        src={images[index]}
        alt="post"
        className="h-full w-96 object-contain select-none"
        draggable={false}
      />

      {/* DESKTOP IMAGE NAVIGATION */}
      {images.length > 1 && (
        <>
          {/* PREVIOUS */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 hidden sm:block z-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="rotate-90 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 border-white rounded-full text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {/* NEXT */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 hidden sm:block z-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="rotate-90 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 border-white rounded-full text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5-7.5"
              />
            </svg>
          </button>

          {/* COUNTER + TOP OPTIONS */}
          <div className="absolute top-4 right-4 z-50">
            <div className="inline-flex items-center gap-6">
              <p className="bg-white text-black text-xs px-2 py-2 font-bold rounded-full">
                {index + 1} / {images.length}
              </p>

              <div className="bg-white rounded-full">
                <PostOptions post={post} chats={chats} />
              </div>
            </div>
          </div>

          {/* CLOSE + LOGO */}
         
        </>
      )}

     
      { post?.content && (
              <div
                className={`absolute bottom-16 left-3 right-3 sm:left-5 sm:right-5 z-[70] transition-all duration-300 ${
                  showOverlay
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3 pointer-events-none"
                }`}
              >
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
          
                    {/* USER */}
                    <Link
                      to={`/profile/${post?.user?.id}`}
                      className="shrink-0"
                    >
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full bg-blue-700 text-white text-lg font-bold border border-white/20 shadow-lg
                      ${getColor(post.user?.name)}`}>
                      {getInitial(post?.user?.first_name)}
                      </span>
                    </Link>
          
                    <div className="min-w-0 flex-1">
          
                      {/* USER NAME */}
                      <div>
                      <div className="text-white font-bold text-xs mb-1">
                        {post?.user?.first_name || "Unknown User"} {post?.user?.last_name || "Unknown User"}
                       </div>
                       
                       <div className="text-[11px] sm:text-[12px] sm:mt-1">
                          {formatPostTime(post?.created_at)}
                        </div>

                      </div>
                      {/* CONTENT */}
                      <div
                        className="
                          rounded-xl
                          bg-black/25
                          backdrop-blur-sm
                          px-3
                          py-2
                          max-h-[55vh]
                          overflow-y-auto
                          overscroll-contain
                          scrollbar-thin
                          scrollbar-thumb-white/30
                          scrollbar-track-transparent
                        "
                      >
                        <p className="text-white text-xs leading-5 break-words [overflow-wrap:anywhere]">
                          {showMore ? text : shortText}
          
                          {hasLongText && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
          
                                setShowMore((prev) => !prev);
          
                              }}
                              className="ml-1 text-white underline font-semibold"
                            >
                              {showMore ? "See less" : "See more"}
                            </button>
                          )}
                        </p>
                      </div>
          
                    </div>
                  </div>
                </div>
              </div>
            )}


      <div className="absolute right-1 md:right-4 lg:right-10 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center gap-3">
        {/* ===================================================== */}
        {/* REACTION */}
        {/* ===================================================== */}

        <div
          className="relative"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* REACTION EMOJIS */}
          {showReactions && (
            <div
              className="absolute right-11 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-xl px-3 py-2 flex flex-row items-center gap-1 z-20 whitespace-nowrap"
              onClick={(e) => e.stopPropagation()}
            >
              {reactionList.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!reactionLoading) {
                      toggleReaction(emoji);
                    }
                  }}
                  className="text-xl hover:scale-125 transition"
                >
                  {emoji}
                </button>
              ))}

              {/* MORE EMOJIS */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  setShowReactions(false);
                  setShowEmoji(true);
                }}
                className="ml-1 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-semibold"
                title="More emojis"
              >
                +
              </button>
            </div>
          )}

          {/* REACTION COUNT */}
          <div className="text-white text-[10px] text-center mb-1">
            {total > 0 && total}
          </div>

          {/* LIKE BUTTON */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions((prev) => !prev);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border transition ${
              myReaction
                ? "bg-blue-600 border-blue-400"
                : "bg-black/20 text-white border-gray-600"
            }`}
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
                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
              />
            </svg>
          </button>
        </div>

        {/* ===================================================== */}
        {/* COMMENT */}
        {/* ===================================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCommentPop();
          }}
          className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
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
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
        </button>

        {/* ===================================================== */}
        {/* SHARE */}
        {/* ===================================================== */}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShares((prev) => !prev);
          }}
          className="w-9 h-9 rounded-full bg-black/20 backdrop-blur-xl border border-gray-600 text-white flex items-center justify-center hover:bg-black/40 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path d="M18 8a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 8ZM6 14a3 3 0 1 0 2.83 4H15a1 1 0 0 0 0-2H8.83A3 3 0 0 0 6 14Zm12 2a3 3 0 1 0-2.83-4H9a1 1 0 0 0 0 2h6.17A3 3 0 0 0 18 16Z" />
          </svg>
        </button>

        {/* ===================================================== */}
        {/* OPTIONS */}
        {/* ===================================================== */}

        <div
          className="
            w-9 h-9
            rounded-full
            bg-black/20
            backdrop-blur-xl
            border border-gray-600
            text-white
            flex items-center justify-center
            hover:bg-black/40
            transition
          "
        >
          <PostOptionsId post={post} />
        </div>
      </div>
    </div>
  );
}