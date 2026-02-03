export function PostCommentInput({ commentInputRef, newComment, loading, setNewComment, setImage, image, showEmoji, setShowEmoji, emojiList, postComment }) {
 
    //
  return (
     <div className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex relative items-center gap-2">
            <input
              ref={commentInputRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-4 border outline-0 border-gray-300 text-black w-full rounded h-20"
            />

            {/* Emoji toggle button */}
            <button
              onClick={() => setShowEmoji(s => !s)}
              className="p-1 rounded absolute top-1 left-2 hover:bg-gray-200"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
              </svg>
            </button>

            {/* Upload image */}
            <label className="p-1 rounded absolute top-1 left-10 hover:bg-gray-200 cursor-pointer">
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

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
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
          
      </>
}
        </div>
        <div >
          {image && <div className="fixed px-2 font-bold text-xl text-black inset-0 bg-white/80 flex items-center justify-center z-50">
          Uploading Selected Image: {image.name}</div>}
        </div>
      </div>
 
  );
}
