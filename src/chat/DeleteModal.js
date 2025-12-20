import { useState, useRef, useEffect } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function DeleteModal({ message, currentUserId, setMessages, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isOwner = message.sender_id === currentUserId;

  // Delete message API
  const deleteMessage = async (type) => {
    setLoading(true);
    try {
      const res = await api.delete(`/api/messages/${message.id}`, {
        data: { type }, // "forMe" or "forEveryone"
      });
      toast.success(res.data.message);

      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== message.id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete message");
    } finally {
      setLoading(false);
      setMenuOpen(false);
    }
  };

  return (
    <div>

      {/* Popup Menu */}
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        

          {isOwner ? (
            <div className="bg-white text-black w-72 relative sm:w-96 rounded-lg p-2 h-40 mx-auto flex flex-col justify-center font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 absolute right-5 cursor-pointer top-3" onClick={onClose}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
              <button
                onClick={() => deleteMessage("forEveryone")}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                Delete for Everyone
              </button>
              <button
                onClick={() => deleteMessage("forMe")}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                Delete for Me
              </button>
            </div>
          ) : (
            <div className="bg-white text-black w-72 relative sm:w-96 rounded-lg p-2 h-28 mx-auto flex flex-col justify-center font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 absolute right-5 cursor-pointer top-3" onClick={onClose}>
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
            <button
              onClick={() => deleteMessage("forMe")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              Delete for Me
            </button>
            </div>
          )}
        </div>

      {loading && (
        <div className="absolute top-0 right-0">
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      )}
      <Toaster position="top-right" />
    </div>
  );
}
