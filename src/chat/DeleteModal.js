import { useState, useRef, useEffect } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function DeleteModal({
  message,
  currentUserId,
  setMessages,
  onClose,
}) {
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isOwner = message.sender_id === currentUserId;

  const deleteMessage = async (type) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/messages/${message.id}`, {
        data: { type },
      });

      toast.success(res.data.message);

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== message.id)
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete message"
      );
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div
        ref={ref}
        className="bg-white text-black w-72 sm:w-96 rounded-lg p-4 relative"
      >

        {/* ❌ Close button */}
        
        {/* 🟡 NOTE MESSAGE (NEW PART) */}
        <div className=" text-green-800 font-bold text-sm p-2 text-center rounded mb-3">
          ⚠️ This message, 
          {isOwner
            ? " You can delete it for yourself or for everyone."
            : " It will only be deleted for you."}
        </div>

        {/* ACTIONS */}
        {isOwner ? (
          <div className="flex flex-col items-end px-3 w-full border-t gap-2 font-semibold">

            <button
              onClick={() => deleteMessage("forEveryone")}
              className="px-3 py-2 hover:text-green-800 text-green-700 text-sm rounded"
            >
              Delete for Everyone
            </button>

            <button
              onClick={() => deleteMessage("forMe")}
              className="px-3 py-2 hover:text-green-800 text-green-700 text-sm rounded"
            >
              Delete for Me
            </button>
             
             <button 
            className="px-3 py-2 hover:text-green-800 text-green-700 text-sm rounded"
              onClick={onClose}
            >Cancel</button>
          </div>
        ) : (
          <div className="flex flex-row items-center justify-between px-3 w-full border-t  gap-2 font-semibold">

            <button 
            className="px-3 py-2 hover:text-green-800 text-green-700 text-sm rounded"
              onClick={onClose}
            >Cancel</button>
            <button
              onClick={() => deleteMessage("forMe")}
              className="px-3 py-2 hover:text-green-800 text-green-700 text-sm rounded"
            >
              Delete for Me
            </button>

          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="absolute top-2 right-2">
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
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

        <Toaster position="top-right" />
      </div>
    </div>
  );
}