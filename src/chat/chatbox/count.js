{/* {showNewBtn && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewBtn(false);
            setNewCount(0);
          }}
          className="fixed bottom-24 right-4 md:right-8 lg:right-96 bg-green-500 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5"
              />
            </svg>
            {newCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {newCount}
              </span>
            )}
          </div>
        </button>
      )} */}