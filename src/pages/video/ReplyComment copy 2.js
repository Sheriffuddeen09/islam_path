import { useState } from "react";

export default function ReplyComment({
  comment,
  v,
  replyText,
  setReplyText,
  loading,
  onReplyAdded,
  onEdit,
  onDelete,
  onReact,
  closeReply,
}) {
  const [showFull, setShowFull] = useState(false);
  const [replyImage, setReplyImage] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState(comment.reactions || []);

  const uniqueEmojis = [...new Set(reactions.map((r) => r.emoji))];
  const totalReactions = reactions.length;

  const handleReact = async (emoji) => {
    try {
      const res = await onReact(comment.id, emoji);
      const apiReactions = res.reactions || {};
      const normalized = Object.entries(apiReactions).flatMap(([e, users]) =>
        users.map((userId) => ({ emoji: e, user_id: userId }))
      );
      setReactions(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async ({ image = null, text = replyText } = {}) => {
    if (!text && !image) return;
    await onReplyAdded(comment.id, text, image);
    setReplyText("");
    setReplyImage(null);
  };

  const words = v.description?.split(" ") || [];
  const isLong = words.length > 150;
  const shortDescription = isLong ? words.slice(0, 150).join(" ") + "..." : v.description;

  return (
    <div className="bg-white rounded-lg h-full w-full fixed left-0 top-0 z-50">
      <div className="flex flex-col justify-between p-2 h-full w-full">
        {/* Header */}
        <div className="flex flex-row justify-between px-5 items-start border-b-2 border-blue-600 py-2 mb-2 gap-2 mt-2">
          <div>
            <span className="text-white w-12 h-12 flex justify-center items-center text-4xl font-bold rounded-full bg-blue-800">
              {v.user?.first_name?.charAt(0)?.toUpperCase() || "A"}
            </span>
            <div className="text-xs">
              <div className="font-bold text-[14px] text-black">
                {v.user?.first_name} {v.user?.last_name}
              </div>
              <div className="text-[11px] text-black">
                {v.user?.role || v.user?.admin?.role || "No role"}
              </div>
            </div>
            <p className="text-xs text-black mb-3 mt-3">
              {showFull || !isLong ? v.description : shortDescription}{" "}
              {isLong && (
                <span
                  onClick={() => setShowFull(!showFull)}
                  className="text-blue-300 cursor-pointer ml-1"
                >
                  {showFull ? "show less" : "read more"}
                </span>
              )}
            </p>
          </div>
          <button onClick={closeReply} className="text-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Comment Body */}
        <div className="overflow-y-auto overflow-x-hidden scroll-bar h-[340px] scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent px-4 py-2">
          {/* Parent Comment */}
          <div className="inline-flex gap-2 items-start mb-2">
            <p className="text-white w-12 h-12 flex justify-center items-center text-4xl font-bold rounded-full bg-blue-800">
              {comment.user?.first_name?.charAt(0)?.toUpperCase() || "A"}
            </p>
            <div className="bg-blue-50 px-4 py-2 rounded">
              <p className="text-black font-bold">
                {comment.user.first_name} {comment.user.last_name}
              </p>
              <p className="text-black my-2 text-sm font-semibold">{comment.body}</p>
              {comment.image && (
                <img
                  src={`http://localhost:8000/storage/${comment.image}`}
                  className="w-24 h-24 rounded mt-1"
                />
              )}
            </div>
          </div>

          {/* Replies */}
          {comment.replies?.map((reply) => (
            <div className="inline-flex gap-2 items-start mb-2" key={reply.id}>
              <p className="text-white w-12 h-12 flex justify-center items-center text-4xl font-bold rounded-full bg-blue-800">
                {reply.user?.first_name?.charAt(0)?.toUpperCase() || "A"}
              </p>
              <div className="bg-blue-50 px-4 py-2 rounded">
                <div className="flex justify-between items-center">
                  <p className="text-black font-bold">
                    {reply.user.first_name} {reply.user.last_name}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(!editing)}>
                      {/* Edit Icon */}
                    </button>
                    <button onClick={() => onDelete(reply.id)}>
                      {/* Delete Icon */}
                    </button>
                  </div>
                </div>
                <p className="text-black my-2 text-sm font-semibold">{reply.body}</p>
                {reply.image && (
                  <img
                    src={`http://localhost:8000/storage/${reply.image}`}
                    className="w-24 h-24 rounded mt-1"
                  />
                )}

                {/* Reactions */}
                <div
                  className="px-2 py-1 bg-gray-100 w-10 rounded flex gap-1 cursor-pointer relative"
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                >
                  {uniqueEmojis.length > 0
                    ? uniqueEmojis.map((e) => <span key={e}>{e}</span>)
                    : <span>👍</span>}
                  {totalReactions > 0 && <span>{totalReactions}</span>}

                  {showReactions && (
                    <div className="absolute bottom-full left-0 flex gap-2 bg-white p-2 rounded shadow z-50">
                      {["❤️", "👍", "😂", "😮", "😢", "🔥"].map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            handleReact(e);
                            setShowReactions(false);
                          }}
                          className="text-xl hover:scale-125 transition"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Edit Input */}
          {editing && (
            <div className="flex gap-1 mt-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
              />
              <button
                onClick={() => onEdit(comment.id, editText, replyImage)}
                className="px-2 py-1 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div className="mt-2 flex gap-2 relative px-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 px-4 py-4 text-black outline-0 border-2 border-blue-400 h-32 rounded"
            placeholder="Write a reply..."
          />
          <label className="p-2 rounded absolute -top-1 left-10 hover:bg-gray-200 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setReplyImage(file);
                await handleReply({ image: file, text: replyText });
              }}
            />
            {/* Upload Icon */}
          </label>
          <button
            onClick={handleReply}
            className="px-3 py-1 absolute right-5 top-3 text-white bg-blue-700 rounded"
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
