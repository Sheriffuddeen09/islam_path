export function PostCommentInput({
  commentInputRef,
  newComment,
  setNewComment,
  setImage,
  showEmoji,
  setShowEmoji,
  emojiList,
  postComment
}) {
  return (
    <div className="p-4">

      <div className="flex flex-col gap-2">

        <div className="flex relative items-center gap-2">

          <input
            ref={commentInputRef}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="
              flex-1
              px-4
              py-6
              text-black
              outline-0
              border-2
              border-gray-300
              h-24
              rounded
            "
          />

          {/* Emoji */}
          <button
            type="button"
            onClick={() => setShowEmoji(s => !s)}
            className="p-1 rounded absolute top-1 left-2 hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
              />
            </svg>
          </button>

          {/* Image */}
          <label className="p-1 rounded absolute top-1 left-10 hover:bg-gray-200 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files[0];

                if (!file) return;

                setImage(file);

                // Submit immediately
                postComment(null, file);

                e.target.value = "";
              }}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375 0 0 1 .75 0Z"
              />
            </svg>
          </label>

          {/* Send */}
          <button
            type="button"
            onClick={() => postComment()}
            className="px-3 py-1 absolute right-2 top-2 text-white rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 text-blue-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>

        </div>

        {/* Emoji list */}
        {showEmoji && emojiList.length > 0 && (
          <div className="flex gap-2 flex-wrap p-2 border rounded bg-gray-50">
            {emojiList.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => postComment(emoji)}
                className="text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}