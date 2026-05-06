import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import api from "../../Api/axios";

export function ReportGroupModal({ chat, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 pick admin as reported user
  const reportedUserId =
    chat?.members?.find(m => m.role === "admin")?.id ||
    chat?.created_by ||
    null;

  const submitReport = async () => {
    if (!reason) return;

    if (!reportedUserId) {
      toast.error("No admin found to report");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/chat/report", {
        chat_id: chat.id,
        reported_user_id: reportedUserId, // ✅ FIX
        reason,
        details,
      });

      toast.success(res.data.message || "Group reported successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to report group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white sm:w-96 w-72 rounded shadow p-4">

        <h2 className="font-semibold mb-3">
          Report Group
        </h2>

        {/* REASONS */}
        {[
          "Spam or misleading",
          "Harassment or hate",
          "Sexual content",
          "Violence",
          "Other",
        ].map((r) => (
          <label key={r} className="flex gap-2 mb-2 text-black">
            <input
              type="radio"
              name="reason"
              value={r}
              onChange={() => setReason(r)}
            />
            {r}
          </label>
        ))}

        {/* DETAILS */}
        <textarea
          placeholder="Additional details (optional)"
          className="w-full border text-black rounded p-2 mt-2"
          onChange={(e) => setDetails(e.target.value)}
        />

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-4 text-sm">

          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
            Cancel
          </button>

          <button
            disabled={!reason || loading}
            onClick={submitReport}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-white mx-auto"
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
        ) : ( "Report Group")
      }
          </button>

        </div>

      </div>

      <Toaster position="top-right" />
    </div>
  );
}