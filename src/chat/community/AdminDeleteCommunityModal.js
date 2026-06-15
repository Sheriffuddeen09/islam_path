import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../Api/axios";
import { Loader2 } from "lucide-react";

export default function AdminDeleteCommunityModal({
  activeCommunity,
  onClose,
  setActiveCommunity,
  setCommunities,
}) {
  const [loading, setLoading] = useState(false);

  const handleDeleteChannel = async () => {
  try {

    setLoading(true);

    await api.post(
      `/api/communities/${activeCommunity.id}/admin-delete`
    );

    toast.success(
      "Channel deleted"
    );

    // Remove from admin list only
    setCommunities((prev) =>
      prev.filter(
        (community) =>
          community.id !== activeCommunity.id
      )
    );

    setActiveCommunity(null);

    onClose?.();

  } catch (err) {

    toast.error(
      err.response?.data?.message ||
      "Failed to delete channel"
    );

  } finally {

    setLoading(false);

  }
};

  return (
    <div className="bg-white w-80 rounded-xl p-5 shadow-lg text-center">

      <h2 className="text-lg font-semibold text-gray-900">
        Delete Channel
      </h2>

      <p className="text-sm text-gray-800 text-center mt-2">
        Are you sure you want to delete this Channel
        from your chat list?
      </p>

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border text-black"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteChannel}
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