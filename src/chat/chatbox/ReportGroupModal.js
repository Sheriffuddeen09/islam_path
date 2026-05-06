import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import api from "../../Api/axios";

export function ReportGroupModal({ chat, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!reason) return;

    setLoading(true);
    try {
      const res = await api.post("/api/chat/report", {
        chat_id: chat.id,
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

          <button onClick={onClose} className="text-black">
            Cancel
          </button>

          <button
            disabled={!reason || loading}
            onClick={submitReport}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            {loading ? "Reporting..." : "Report Group"}
          </button>

        </div>

      </div>

      <Toaster position="top-right" />
    </div>
  );
}