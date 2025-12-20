import { useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";


export default function EditModal({ message, onMessageUpdate, onClose }) {

 const [editText, setEditText] = useState(message?.message || "");
 const [loading, setLoading] = useState(false)

  const saveEdit = async () => {
  if (!editText.trim()) return;

  setLoading(true);
  try {
    const res = await api.put(`/api/messages/${message.id}`, {
      message: editText
    });

    onMessageUpdate(res.data.message);
    onClose(); // ✅ will now work
  } catch (err) {
    toast.error(err.response?.data?.message || err.message);

  } finally {
    setLoading(false);
  }
};


  const content = (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded sm:w-96 w-72 ">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="border text-black border-blue-600 outline-0  p-2 rounded-md my-3  w-full mb-2"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-300 px-3 py-1 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

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
  )
  return(
    <div>
      {content}
      <Toaster position="top-right" />
    </div>
  );
}
