import toast from "react-hot-toast";
import api from "../Api/axios";
import { useState } from "react";

export default function ClearChatModal({ chatId, onClose, onCleared, chat }) {

    const [loading, setLoading] = useState(false)


  const clearChat = async () => {
    setLoading(true)
    try {
      await api.delete(`/api/chats/${chat.id}/clear`);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center">
        <h3 className="text-lg font-semibold mb-3">Clear Chat?</h3>
        <p className="text-sm text-gray-600 mb-6">
          This will remove all messages only for you?  
          <br />
          <b>All messages will be lost.</b>
        </p>

        <div className="flex justify-center gap-4">
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
