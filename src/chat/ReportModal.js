import toast, { Toaster } from "react-hot-toast";
import api from "../Api/axios";
import { useState } from "react";
import { useAuth } from "../layout/AuthProvider";

export function ReportModal({ message, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false)
  const {user: authUser} = useAuth()

  const reportedUserId = message.sender_id;

  const submitReport = async () => {
  if (!reason) return;

  if (!authUser) {
    toast.error("User not loaded. Try again.");
    return;
  }

  if (reportedUserId === authUser.id) {
    toast.error("You cannot report your own message.");
    return;
  }

  setLoading(true);
  try {
    const res = await api.post("/api/messages/report", {
      message_id: message.id,
      reported_user_id: reportedUserId,
      reason,
      details,
    });

    toast.success(res.data.message || "Message reported successfully");
    onClose();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};


  const content = (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white sm:w-96 w-72 rounded shadow p-4">
        <h2 className="font-semibold mb-3">Report message</h2>

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

        <textarea
          placeholder="Additional details (optional)"
          className="w-full border text-black rounded p-2 mt-2"
          onChange={(e) => setDetails(e.target.value)}
        />

        <div className="flex justify-end text-sm hover:text-gray-800 gap-2 mt-4">
          <button onClick={onClose} className="text-black">
            Cancel
          </button>
          <button
            disabled={!reason}
            onClick={submitReport}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
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
  ) : ( "Report")
}
          </button>
        </div>
      </div>
    </div>
  );

  return(
    <div>
      <Toaster position="top-right" />
      {content}
    </div>
  )
}
