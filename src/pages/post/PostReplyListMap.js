import { useEffect, useRef, useState } from "react";
import ReplyImage from "./PostReplyImage";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";
import PostReplyCopyText from "./PostReplyCopyText";
import api from "../../Api/axios";
import { ReplyReportModal } from "./report/ReplyReportModal";
import Linkify from "linkify-react";
import EmojiPicker from "emoji-picker-react";
import {
  Pencil,
  X,
  Check,
} from "lucide-react";
import PostReplyVideo from "./PostReplyVideo";


export default function PostReplyListMap({authUser, reply, timeAgo, editText, setEditText, onEdit,
                           onDelete, isDeleting, setReplyTo,setReplyText,
                           focusReplyInput }){
  
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const [reactions, setReactions] = useState(reply.reactions || []); // ✅ array of { emoji, user }
  const [loadingEmoji, setLoadingEmoji] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const {user} = useAuth()
  const {currentUser} = useAuth()
  const [openReport, setOpenReport] = useState(false);
  const [showReplyMenu, setShowReplyMenu] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

  const toggleReplyText = (replyId) => {
  setExpandedReplies((prev) => ({
    ...prev,
    [replyId]: !prev[replyId],
  }));
};
  
     const handleReport = () =>{
    setOpenReport(!openReport)
  }
 const replyPressTimer = useRef(null);
const replyLongPressTriggered = useRef(false);

const handleReplyPressStart = (reply) => {
  clearTimeout(replyPressTimer.current);

  replyLongPressTriggered.current = false;

  replyPressTimer.current = setTimeout(() => {
    replyLongPressTriggered.current = true;

    setSelectedReply(reply);
    setShowReplyMenu(true);

    console.log("REPLY LONG PRESS:", reply.id);
  }, 500);
};

const handleReplyPressEnd = () => {
  clearTimeout(replyPressTimer.current);
};

  useEffect(() => {
    const arr = reactions && !Array.isArray(reactions)
      ? Object.entries(reactions).flatMap(([emoji, users]) =>
          Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
        )
      : reactions || [];
  
    const userReact = arr.find(r => r.user?.id === currentUser?.id)?.emoji || null;
    setSelectedReaction(userReact);
  }, [reactions, currentUser]);
  
  
   useEffect(() => {
    setReactions(reply.reactions || []);
  }, [reply.reactions]);
  
  
  const reactionArray = reactions && !Array.isArray(reactions)
    ? Object.entries(reactions).flatMap(([emoji, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
      )
    : reactions || [];
  
    const uniqueEmojisr = [...new Set(reactionArray.map(r => r.emoji))];
  
  
  const userReaction = reactionArray.find(r => r.user?.id === currentUser?.id)?.emoji || null;
  
  const totalReaction = reactionArray.length;
  
  
    const toggleReaction = async (emoji) => {
    setLoadingEmoji(emoji); // 👈 only this emoji loads
    try {
      const res = await api.post(`/api/comments/${reply.id}/reaction`, { emoji });
  
      const apiReactions = res.data.reactions || {};
      const normalized = Object.entries(apiReactions).flatMap(([e, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji: e, user: u })) : []
      );
  
      setReactions(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmoji(null); // 👈 stop loading
    }
  };
  
  useEffect(() => {
    const loadReactions = async () => {
      const res = await api.get(`/api/comments/${reply.id}/reactions`);
      setReactions(res.data.reactions || []);
    };
    loadReactions();
  }, [reply.id]);
  
  
  
  const isOwner = authUser?.user?.id === reply.user?.id;


const handleReplyToReply = (reply) => {
  const user = reply.user ?? reply; // fallback if user is not nested

  console.log("Full reply object:", reply);
  console.log("reply.user:", reply.user);

  if (!user?.first_name) {
    console.warn("User data missing", reply);
    return;
  }

  const name = `${user.first_name} ${user.last_name ?? ""}`;
  const id = user.id ?? null;

  setReplyTo({ id, name });
  setReplyText(`@${name} `);
  focusReplyInput();
};


  function renderWithMention(text) {
  if (!text) return null;

  const parts = text.split(/(@\{[^}]+\}|@[a-zA-Z]+\s[a-zA-Z]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const clean = part.startsWith("@{")
        ? part.slice(2, -1)
        : part.slice(1);

      return (
        <button
          key={index}
          onClick={() => navigate(`/profile/${clean}`)}
          className="text-blue-600 font-bold hover:underline"
        >
          {part}
        </button>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

 
const navigate = useNavigate()

    return(

        <div className="px-4 py-2">
        <div className="flex gap-2 items-start justify-end">
        <div className="bg-blue-100 rounded
        w-fit
        max-w-64
        sm:max-w-64 relative group  px-4 py-2 " 
        onTouchStart={(e) => {
        e.stopPropagation();

        // Do not start long press from buttons/links
        if (
          e.target.closest("button") ||
          e.target.closest("a") ||
          e.target.closest("input") ||
          e.target.closest("textarea")
        ) {
          return;
        }

        handleReplyPressStart(reply);
      }}
      onTouchMove={() => {
        // Moving means this is probably scrolling, not long press
        if (!replyLongPressTriggered.current) {
          clearTimeout(replyPressTimer.current);
        }
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        handleReplyPressEnd();
      }}
      onTouchCancel={handleReplyPressEnd}>
        <div className=" flex flex-row justify-between  items-center flex-1">
        <button onClick={() => navigate(`/profile/${user.id}`)}
         className="text-black font-bold mr-6">{reply?.user?.first_name} {reply?.user?.last_name}
        </button>
              
          <button
          type="button"
          onTouchStart={(e) => {
            e.stopPropagation();
            clearTimeout(replyPressTimer.current);
          }}
          onClick={(e) => {
            e.stopPropagation();

            setSelectedReply(reply);
            setShowReplyMenu(true);
          }}
          className="text-black p-1 opacity-0 invisible group-hover:opacity-100 
        group-hover:visible transition-all duration-150 lg:block hidden"
        >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              />
            </svg>
          </button>

        </div>
      
    {reply.body && (() => {
        const words = reply.body.trim().split(/\s+/);
        const isLongReply = words.length > 20;
        const isExpanded = expandedReplies[reply.id];

        const displayedText =
          isLongReply && !isExpanded
            ? words.slice(0, 20).join(" ") + "..."
            : reply.body;

        return (
          <div className="my-2">
            <p
              className="
                text-sm
                text-black
                max-w-full
                whitespace-normal
                break-words
                overflow-wrap-anywhere
              "
            >
              <Linkify
                options={{
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-blue-600 underline break-all",
                }}
              >
                {renderWithMention(displayedText)}
              </Linkify>
            </p>

            {isLongReply && (
              <button
                type="button"
                onClick={() => toggleReplyText(reply.id)}
                className="
                  mt-1
                  text-sm
                  font-medium
                  text-blue-600
                  hover:underline
                "
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        );
      })()}
        {/* ✅ Image preview */}
       {reply.image && <ReplyImage image={reply.image} />}

        {reply.video && (
          <PostReplyVideo video={reply.video} />
        )}
        {/* Time and Reaction */}

        <div className="inline-flex gap-3 items-center cursor-pointer">
          <span className="  text-xs">{timeAgo(reply.created_at)}</span>
          <div className="relative group/react inline-block">
        {/* Current reactions */}
{uniqueEmojisr.length > 0 &&
  uniqueEmojisr.map(e => (
    <span
      className="  text-sm"
      key={e}
    >
      {e}
    </span>
  ))}

<span className="text-sm  ">Like</span>

{totalReaction > 0 && (
  <span className="text-black ml-2   text-sm font-semibold">
    {totalReaction}
  </span>
)}

{/* Hover reactions */}
<div
  className="
    absolute bottom-2 left-0 mb-2
    flex gap-2 p-2
    bg-white border rounded shadow
    opacity-0 invisible
    group-hover/react:visible group-hover/react:opacity-100
    transform group-hover/react:-translate-y-2
    transition-all duration-200 z-50
  "
>
  {['❤️', '👍', '😂', '😮', '😢', '🔥'].map(e => (
    <button
      type="button"
      key={e}
      onClick={() => toggleReaction(e)}
      className="text-lg hover:scale-110 transition flex items-center justify-center"
      disabled={loadingEmoji !== null}
    >
      {loadingEmoji === e ? (
        <svg
          className="animate-spin h-5 w-5 text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
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
      ) : (
        e
      )}
    </button>
  ))}

  {/* Plus button */}
  <div className="relative">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setShowEmojiPicker(prev => !prev);
      }}
      className="
        w-7 h-7
        rounded-full
        bg-gray-100
        text-gray-600
        text-lg
        flex items-center justify-center
        hover:bg-gray-200
        hover:scale-110
        transition
      "
    >
      +
    </button>

    {/* Emoji picker */}
    {showEmojiPicker && (
      <div
        className="
          absolute bottom-full right-0 mb-2
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
          </div>
        </div>

    </div>
    <button onClick={() => navigate(`/profile/${user.id}`)} className="text-white w-8 h-8 flex flex-col justify-center items-center text-2xl font-bold  rounded-full bg-blue-800 ">
       {reply.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</button>
    </div>


    {/* Reply Edit  */}
{editingReplyId === reply.id && (
  <div
    className="
      fixed inset-0 z-[9999]
      flex items-center justify-center
      p-4
      bg-black/60
      backdrop-blur-sm
    "
    onClick={() => {
      setEditingReplyId(null);
      setEditText(reply?.body || "");
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        relative
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        border border-white/10
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
      "
    >
      {/* ================= HEADER ================= */}
      <div
        className="
          flex items-center justify-between
          px-5 py-4
          border-b border-white/10
        "
      >
        <div className="flex items-center gap-3">
          {/* Edit Icon */}
          <div
            className="
              flex items-center justify-center
              w-10 h-10
              rounded-xl
              bg-blue-500/10
              text-blue-500
            "
          >
            <Pencil size={19} />
          </div>

          {/* Title */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold">
              Edit Reply
            </h3>

            <p className="text-xs opacity-50 mt-0.5">
              Make changes to your reply
            </p>
          </div>
        </div>

        {/* Header Close */}
        <button
          type="button"
          onClick={() => {
            setEditingReplyId(null);
            setEditText(reply?.body || "");
          }}
          className="
            flex items-center justify-center
            w-9 h-9
            rounded-full
            opacity-60
            hover:opacity-100
            hover:bg-white/10
            transition
          "
          title="Close"
        >
          <X size={19} />
        </button>
      </div>

      {/* ================= BODY ================= */}
      <div className="p-5">
        <label className="block text-xs font-medium opacity-60 mb-2">
          Your reply
        </label>

        {/* Textarea */}
        <div
          className="
            relative
            rounded-xl
            border border-white/10
            bg-black/5
            focus-within:border-blue-500/60
            focus-within:ring-2
            focus-within:ring-blue-500/10
            transition
          "
        >
          <textarea
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            maxLength={700}
            placeholder="Edit your reply..."
            className="
              w-full
              resize-none
              bg-transparent
              px-4 py-3
              text-sm
              outline-none
              placeholder:opacity-40
              scrollbar-thin
              scrollbar-thumb-white/20
              scrollbar-track-transparent
            "
          />

          {/* Character Count */}
          <div className="flex justify-end px-4 pb-2">
            <span className="text-[10px] opacity-40">
              {editText.length}/700 characters
            </span>
          </div>
        </div>

        <p className="mt-2 text-[11px] opacity-40">
          Edit your reply and save your changes.
        </p>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        className="
          flex items-center justify-end
          gap-2
          px-5 py-4
          border-t border-white/10
          bg-black/5
        "
      >
        {/* Cancel */}
        <button
          type="button"
          onClick={() => {
            setEditingReplyId(null);
            setEditText(reply?.body || "");
          }}
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-xl
            bg-white/5
            border border-white/10
            text-[var(--text-color)]
            opacity-70
            hover:opacity-100
            hover:bg-white/10
            transition
          "
          title="Cancel"
        >
          <X size={18} />
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={async () => {
            try {
              await onEdit(reply.id, editText);
              setEditingReplyId(null);
              setEditText(reply?.body || "");
            } catch (e) {
              // Keep modal open if update fails
              console.error("Failed to edit reply:", e);
            }
          }}
          disabled={!editText.trim()}
          className="
            flex items-center justify-center
            gap-2
            min-w-[105px]
            h-10
            px-4
            rounded-xl
            bg-blue-500
            hover:bg-blue-600
            active:scale-[0.98]
            text-white
            text-sm
            font-medium
            shadow-lg
            shadow-blue-500/20
            transition-all
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
          title="Save changes"
        >
          <Check size={18} />
          <span>Save</span>
        </button>
      </div>
    </div>
  </div>
)}
 

{showReplyMenu && selectedReply && (
  <div
    className="
      fixed
      inset-0
      bg-black/50
      flex
      items-center
      justify-center
      z-[9999]
      p-4
    "
    onClick={() => setShowReplyMenu(false)}
  >
    <div
      className="
       bg-white text-black
        rounded-xl
        shadow-xl
        w-full
        max-w-xs
        p-4
      "
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">

        <h3 className="font-semibold text-lg">
          Reply Options
        </h3>

        <button
          type="button"
          onClick={() => setShowReplyMenu(false)}
          className="
             
            p-1
            rounded-full
           
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>

      </div>

      <div className="flex flex-col gap-1">

        {/* =========================
            OWNER
        ========================== */}

        {isOwner && (
          <>
            {/* EDIT - TEXT ONLY */}
            {!selectedReply.image && selectedReply.body && (
              <button
                type="button"
                onClick={() => {
                  setEditingReplyId(selectedReply.id);
                  setEditText(selectedReply.body);
                  setShowReplyMenu(false);
                }}
                className="
                  w-full
                  text-left
                  text-sm
                  hover:border border-blue-500
                  rounded-lg
                  p-3
                  flex
                  items-center
                  gap-3
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>

                Edit Reply
              </button>
            )}

            {/* DELETE */}
            <button
              type="button"
              onClick={() => {
                setShowReplyMenu(false);
                setDeletingReplyId(selectedReply.id);
              }}
              className="
                w-full
                text-left
                text-sm
                hover:border border-red-500
                rounded-lg
                p-3
                flex
                items-center
                gap-3
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>

              Delete Reply
            </button>

            {/* COPY */}
            <div
              onClick={() => setShowReplyMenu(false)}
              className="
                w-full
                hover:border border-blue-500
                rounded-lg
                p-3
              "
            >
              <PostReplyCopyText reply={selectedReply} />
            </div>
          </>
        )}

        {/* =========================
            NOT OWNER
        ========================== */}

        {!isOwner && (
          <>
            {/* COPY */}
            <div
              onClick={() => setShowReplyMenu(false)}
              className="
                w-full
                hover:border border-blue-500
                rounded-lg
                p-3
              "
            >
              <PostReplyCopyText reply={selectedReply} />
            </div>

            {/* REPLY TO */}
            <button
              type="button"
              onClick={() => {
                setShowReplyMenu(false);
                handleReplyToReply(selectedReply);
              }}
              className="
                w-full
                text-left
                text-sm
                hover:border border-blue-500
                rounded-lg
                p-3
                flex
                items-center
                gap-3
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                />
              </svg>

              Reply To
            </button>

            {/* REPORT */}
            <button
              type="button"
              onClick={() => {
                setShowReplyMenu(false);
                handleReport(selectedReply);
              }}
              className="
                w-full
                text-left
                text-sm
                hover:border border-blue-500
                rounded-lg
                p-3
                flex
                items-center
                gap-3
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>

              Report
            </button>
          </>
        )}

      </div>
    </div>
  </div>
)}
     {/* Reply Delete Like*/}

     {deletingReplyId === reply.id && (
      <>
            <div   className={`fixed inset-0 bg-black/30 z-50 flex items-center justify-center z-50 `}>
              <div className=" bg-white text-black p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
                <span>Are you sure you want to delete this reply?</span>
                <div className="flex gap-3 justify-center">
                  <button
            onClick={async () => {
              try {
                await onDelete(reply.id);
                setDeletingReplyId(null);  // CLOSE MODAL
              } catch (e) {}
            }}
            className="px-3 py-1 bg-red-600 text-white rounded"
            >
                    {isDeleting ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-white"
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
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
}
                  </button>
                  <button onClick={() => setDeletingReplyId(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                </div>
              </div>
            </div>
            </>
          )}

          <div className={`w-full h-full  fixed inset-0 bg-black/30 z-50 ${openReport ? 'block' : 'hidden'}`}>
              <ReplyReportModal reply={reply} onClose={handleReport} />
          </div>
    </div>
    )
}