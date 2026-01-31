export function PostInput({ inputRef, newComment, loading, setNewComment, setImage, image, showEmoji, setShowEmoji, emojiList, postComment }) {
 
  return (
     <div className="p-4 border-t bg-white">
        <div className="flex flex-col gap-2">
          <div className="flex relative items-center gap-2">
            <input
              ref={inputRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-4 border outline-0 border-gray-300 text-black w-full rounded h-20"
            />

            {/* Emoji toggle button */}
            <button
              onClick={() => setShowEmoji(s => !s)}
              className="p-2 rounded absolute -top-1 hover:bg-gray-200"
            >
              😊
            </button>

            {/* Upload image */}
            <label className="p-2 rounded absolute -top-0 left-8 hover:bg-gray-200 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                const file = e.target.files[0];
                if (!file) return;

                setImage(file);
                postComment(null, file);
              }}
              />

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-black">
            <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>

            </label>

            {/* Submit comment */}
            <button
              onClick={() => postComment()}
              className="px-3 py-1 absolute right-0 text-white rounded"
            >
              {loading ? (
            <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            >
            <circle
                className="opacity-25 text-blue-800"
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
            </svg>
        ) : 
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-700">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
                }

            </button>
          </div>

          {/* Emoji selection panel */}
          {showEmoji && emojiList.length > 0 && (
            <div className="flex gap-2 flex-wrap p-2 border rounded bg-gray-50">
              {emojiList.map(e => (
                <button 
                  key={e} 
                  type="button"
                  onClick={() => postComment(e)} 
                  className="text-lg"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          {loading ? (
            <svg
            className="animate-spin h-5 w-5 text-white"
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
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
            </svg>
        ) : <>
          {image && <div className="text-sm text-gray-500">Selected: {image.name}</div>}
      </>
}
        </div>
      </div>
 
  );
}
