import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../Api/axios";
import { Loader2 } from "lucide-react";

export default function DeleteChatModal({
  chat,
  onClose,
  setChats,
  setActiveChat,
}) {
  const [loading, setLoading] = useState(false);

  const deleteChat = async () => {
    try {
      setLoading(true);

      await api.post(`/api/chats/${chat.id}/delete`);

      // ✅ REMOVE CHAT ONLY FROM CURRENT USER UI
      setChats((prev) =>
        prev.filter((c) => c.id !== chat.id)
      );

      // ✅ CLOSE ACTIVE CHAT
      setActiveChat(null);

      toast.success("Chat removed");

      onClose();

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to remove chat"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-80 rounded-2xl p-5 shadow-xl">

      <h2 className="text-lg font-semibold text-gray-900 text-center">
        Delete Chat
      </h2>

      <p className="text-sm text-black text-center mt-2">
        This chat will disappear from your chat list.
        If the user messages you again, the chat
        will automatically come back.
      </p>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={deleteChat}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Removing
            </>
          ) : (
            "Remove"
          )}
        </button>

      </div>
    </div>
  );
}