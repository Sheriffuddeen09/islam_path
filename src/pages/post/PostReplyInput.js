
export function PostReplyInput({
  replyInputRef,
  sendImageReply,
  image,
  sendTextReply,
  setEmojiClick,
  sendEmojiReply,
  REPLY_EMOJIS,
  emojiClick,
  replyText,
  setReplyText,
  setReplyTo,
  replyTo,
  sendVideoReply,
}) {
  const hasText = replyText?.trim().length > 0;

  return (
    <div className="px-3 py-3 bg-transparent">
      <div className="relative">

        {/* Reply composer */}
        <div
          className="
            relative
            flex
            items-end
            gap-1
            w-full
            min-h-[52px]
            px-2
            py-2
            rounded-2xl
            bg-white
            border
            border-gray-200
            shadow-sm
            focus-within:border-blue-400
            focus-within:ring-2
            focus-within:ring-blue-100
            transition-all
          "
        >

          {/* Emoji */}
          <button
            type="button"
            onClick={() => setEmojiClick(!emojiClick)}
            className="
              shrink-0
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-gray-500
              hover:text-blue-600
              hover:bg-blue-50
              transition
            "
            title="Emoji"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
              />
            </svg>
          </button>

          {/* Image */}
          <label
            className="
              shrink-0
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-gray-500
              hover:text-blue-600
              hover:bg-blue-50
              cursor-pointer
              transition
            "
            title="Add image"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                sendImageReply(file);

                // Allow selecting the same image again
                e.target.value = "";
              }}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.125 8.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </label>

          {/* Video */}
          <label
            className="
              shrink-0
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-gray-500
              hover:text-blue-600
              hover:bg-blue-50
              cursor-pointer
              transition
            "
            title="Add video"
          >
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                sendVideoReply(file);

                e.target.value = "";
              }}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5 19.5 7.5v9l-3.75-3M4.5 6.75h9A2.25 2.25 0 0 1 15.75 9v6a2.25 2.25 0 0 1-2.25 2.25h-9A2.25 2.25 0 0 1 2.25 15V9A2.25 2.25 0 0 1 4.5 6.75Z"
              />
            </svg>
          </label>

          {/* Reply text */}
          <textarea
            ref={replyInputRef}
            value={replyText}
            onChange={(e) => {
              const value = e.target.value;

              setReplyText(value);

              if (
                replyTo &&
                !value.includes(`@${replyTo.name}`)
              ) {
                setReplyTo(null);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                if (hasText) {
                  sendTextReply();
                }
              }
            }}
            placeholder={
              replyTo
                ? `Reply to @${replyTo.name}...`
                : "Write a reply..."
            }
            rows={1}
            className="
              flex-1
              min-w-0
              max-h-24
              py-2
              px-1
              resize-none
              bg-transparent
              text-sm
              text-gray-800
              placeholder:text-gray-400
              outline-none
              border-none
               scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent
            "
          />

          {/* Send - only when there is text */}
          {hasText && (
            <button
              type="button"
              onClick={sendTextReply}
              className="
                shrink-0
                w-9
                h-9
                rounded-full
                flex
                items-center
                justify-center
                text-blue-600
                hover:text-white
                hover:bg-blue-600
                active:scale-95
                transition-all
              "
              title="Send reply"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.7"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Emoji picker */}
        {emojiClick && REPLY_EMOJIS?.length > 0 && (
          <div
            className="
              absolute
              bottom-full
              left-0
              mb-2
              p-2
              rounded-xl
              bg-white
              border
              border-gray-200
              shadow-lg
              z-50
              flex
              flex-wrap
              gap-1
              max-w-[280px]
            "
          >
            {REPLY_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  sendEmojiReply(e);
                  setEmojiClick(false);
                }}
                className="
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-xl
                  hover:bg-gray-100
                  hover:scale-110
                  active:scale-90
                  transition
                "
              >
                {e}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}