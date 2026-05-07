import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../Api/axios";
import { Loader2 } from "lucide-react";

export default function DeleteGroupModal({
  chat,
  onClose,
  setChats,
  setActiveChat,
}) {
  const [loading, setLoading] = useState(false);

  const deleteGroup = async () => {
    try {
      setLoading(true);

      await api.post(`/api/groups/${chat.id}/delete`);

      // ✅ REMOVE FROM CHAT LIST
      setChats((prev) =>
        prev.filter((c) => c.id !== chat.id)
      );

      // ✅ CLOSE ACTIVE CHAT
      setActiveChat(null);

      toast.success("Group deleted");
      onClose();

    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
        "Failed to delete group"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-80 rounded-xl p-5 shadow-lg">

      <h2 className="text-lg font-semibold text-gray-900">
        Delete Group
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        Are you sure you want to delete this group
        from your chat list?
      </p>

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border"
        >
          Cancel
        </button>

        <button
          onClick={deleteGroup}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deleting
            </>
          ) : (
            "Delete"
          )}
        </button>

      </div>
    </div>
  );
}