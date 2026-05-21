import toast from "react-hot-toast";
import api from "../Api/axios";
import { useState } from "react";

export default function ClearChatModal({ chatId, onClose, onCleared }) {

    const [loading, setLoading] = useState(false)


  const clearChat = async () => {
    setLoading(true)
    try {
      await api.delete(`/api/chats/${chatId}/clear`);
      toast.success("Chat cleared");
      onCleared();   // update UI
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear chat");
    }
    finally{
    setLoading(false)

    }
  };
  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/50 
    text-[var(--text-color)] backdrop-blur-md flex items-center justify-center p-4">

      <div
        className="w-full max-w-xs sm:max-w-sm
            bg-[var(--bg-color)]
            border border-white/30
            shadow-2xl
            rounded-2xl
            text-[var(--text-color)]
            overflow-hidden
            relative text-center"
      >

        <h3 className="text-sm font-semibold mb-3 p-4 border-b">Clear Chat?</h3>
        <p className="text-sm  my-6">
          This will remove all messages only for you?  
          <br />
          <b>All messages will be lost.</b>
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-sm rounded"
          >
            No
          </button>

          <button
            onClick={clearChat}
            className="px-4 py-2 bg-red-600 text-sm text-white rounded"
          >
            {
          loading ?
            <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-black"
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
          :
            "Yes, Clear"
}
          </button>
        </div>
      </div>
    </div>
  );
}
