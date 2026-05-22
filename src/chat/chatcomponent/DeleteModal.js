import {
  useState,
  useRef,
  useEffect
} from "react";

import api from "../../Api/axios";
import toast, {
  Toaster
} from "react-hot-toast";

export default function DeleteModal({
  message,
  currentUserId,
  setMessages,
  onClose,
}) {

  const [loading, setLoading] =
    useState(false);

  const ref = useRef();

  useEffect(() => {

    const handler = (e) => {

      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handler
      );

  }, [onClose]);

  const isOwner =
    message.sender_id === currentUserId;

  const deleteMessage = async (type) => {
  setLoading(true);

  try {
    const res = await api.delete(
      `/api/messages/${message.id}`,
      {
        data: { type },
      }
    );

    toast.success(res.data.message);

    setMessages((prev) =>
      prev
        .map((msg) => {
          // ✅ delete for everyone
          if (
            msg.id === message.id &&
            res.data.deleted_for_everyone
          ) {
            return {
              ...msg,
              deleted: true,
              message: null,
              file: null,
              files: [],
            };
          }

          if (
            msg.id === message.id &&
            !res.data.deleted_for_everyone
          ) {
            return null;
          }

          return msg;
        })
        .filter(Boolean)
    );

  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        "Failed to delete message"
    );
  } finally {
    setLoading(false);
    onClose();
  }
};



  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/50 
    text-[var(--text-color)] backdrop-blur-md flex items-center justify-center p-4">

      <div
        ref={ref}
        className="w-full max-w-xs sm:max-w-sm
            bg-[var(--bg-color)]
            border border-white/30
            shadow-2xl
            rounded-2xl
            text-[var(--text-color)]
            overflow-hidden
            relative"
      >

        {/* INFO */}
        <div className="flex flex-col justify-center mx-auto items-center gap-2 font-bold text-sm p-2 text-center rounded mb-3">

          <p>
            ⚠️ This message,
            {isOwner
              ? " You can delete it for yourself or for everyone."
              : " It will only be deleted for you."}
          </p>

          {loading && (
            <div>

              <svg
                className="animate-spin h-5 w-5"
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
                />

                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />

              </svg>

            </div>
          )}

        </div>

        {/* OWNER */}
        {isOwner ? (

          <div className="flex flex-col items-end px-3 w-full border-t gap-2 font-semibold">

            <button
              onClick={() =>
                deleteMessage(
                  "forEveryone"
                )
              }
              className="px-3 py-2  text-sm rounded"
            >
              Delete for Everyone
            </button>

            <button
              onClick={() =>
                deleteMessage(
                  "forMe"
                )
              }
              className="px-3 py-2 text-sm rounded"
            >
              Delete for Me
            </button>

            <button
              className="px-3 py-2 text-sm rounded"
              onClick={onClose}
            >
              Cancel
            </button>

          </div>

        ) : (

          <div className="flex flex-row items-center justify-between px-3 w-full border-t gap-2 font-semibold">

            <button
              className="px-3 py-2  text-sm rounded"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              onClick={() =>
                deleteMessage(
                  "forMe"
                )
              }
              className="px-3 py-2  text-sm rounded"
            >
              Delete for Me
            </button>

          </div>

        )}

        <Toaster position="top-right" />

      </div>
    </div>
  );
}