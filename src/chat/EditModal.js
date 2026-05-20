
import { useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

import {
  encryptMessage,
} from "../utils/encryption";

export default function EditModal({
  message,
  onMessageUpdate,
  onClose,
  chatId,
}) {

  const [editText, setEditText] = useState(
    message?.message || ""
  );

  const [loading, setLoading] = useState(false);

  console.log("CHAT ID:", chatId);

  console.log(
    "CHAT KEY:",
    localStorage.getItem(`chat_key_${chatId}`)
  );

  const saveEdit = async () => {

    if (!editText.trim()) return;

    setLoading(true);

    try {
      const chatKey = localStorage.getItem(
        `chat_key_${chatId}`
      );

      if (!chatKey) {
        toast.error("Encryption key missing now");
        return;
      }

      

      const encrypted = await encryptMessage(
        editText,
        chatKey
      );
      const res = await api.put(
        `/api/messages/${message.id}`,
        {
          message: encrypted.encrypted,
          iv: encrypted.iv,
        }
      );
      const updatedMessage = {
        ...res.data.message,
        message: editText,
      };

      onMessageUpdate(updatedMessage);

      onClose();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        err.message
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/50 text-[var(--text-color)] backdrop-blur-md flex items-center justify-center p-4">

        <div
          className="w-full max-w-xs sm:max-w-sm
          bg-[var(--bg-color)]
          border border-white/30
          shadow-2xl
          rounded-2xl
          text-[var(--text-color)]
          overflow-hidden
          relative p-4"
        >

          <textarea
            value={editText}
            onChange={(e) =>
              setEditText(e.target.value)
            }
            className="border text-black no-scrollbar border-blue-600 outline-0 p-2 rounded-md my-3 w-full mb-2"
          />

          <div className="flex justify-end gap-2">

            <button
              onClick={onClose}
              className="bg-gray-800 px-3 py-1 rounded"
            >
              ✕
            </button>

            <button onClick={saveEdit} className="bg-blue-500 text-white px-3 py-1 rounded">{
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>

          }
          </button>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}