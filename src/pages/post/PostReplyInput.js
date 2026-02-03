export function PostReplyInput ({isSubmitting, replyInputRef, sendImageReply, sendTextReply, setEmojiClick, sendEmojiReply, 
    REPLY_EMOJIS, emojiClick, replyText, setReplyText}) {


    return(
         <div className="mt-2 flex gap-2 relative px-4">
            <textarea
              ref={replyInputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-4 py-6 text-black outline-0  border-2 border-blue-400 h-32 rounded"
              placeholder="Write a reply..."
              rows={4}
            />

        <button 
        onClick={() => setEmojiClick(!emojiClick)}
        className="absolute top-1 left-8 hover:bg-gray-200 cursor-pointer p-1 rounded shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
              </svg>
        </button >


            <div className={`fixed bottom-64 left-10 gap-2 bg-white border p-2 rounded shadow z-50 ${emojiClick ? 'block' : 'hidden'}`}>
              {REPLY_EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { sendEmojiReply(e); setEmojiClick(false)}}
                  className="text-xl hover:scale-125 transition"
                  disabled={isSubmitting}
                >
                  {e}
                </button>
              ))}
            </div>

            <label className="py-1 px-1 rounded absolute top-1 left-16 hover:bg-gray-200 cursor-pointer">
             <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => sendImageReply(e.target.files[0])}
                />

              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>

            </label>
            <button onClick={sendTextReply} className="px-3 py-1 absolute right-5 top-3 text-white rounded">
                {isSubmitting ? (
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
          
    )
}