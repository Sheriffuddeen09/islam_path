import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

export default function StudentAccept({handleVisible}) {
  const [requests, setRequests] = useState([]);
  const [loadingRemoveId, setLoadingRemoveId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/live-class/teacher-requests-summary");
      setRequests(res.data.data.all);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRemove = async (id) => {
    if (loadingRemoveId) return;
    setLoadingRemoveId(id);
    try {
      await api.delete(`/api/live-class/clear-by-teacher/${id}`);
      toast.success("Request removed successfully");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to remove request");
      console.error(err);
    } finally {
      setLoadingRemoveId(null);
    }
  };

  return (
    <div className="sm:p-6 p-2">
      <Toaster position="top-right" />
      <h2 className="text-xl font-bold mb-4">Student Requests</h2>
      {requests.length === 0 && <p>No requests found</p>}
        <div className="overflow-y-auto overflow-x-hidden h-60
    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
      {requests.map((req) => (
        <div
          key={req.id}
          className="border p-3 rounded-lg mb-3 flex flex-wrap justify-between items-center "
        >
          <div>
            <p className="font-semibold mb-1 text-gray-900">
              {req.student.first_name} {req.student.last_name}
            </p>
            <p className="text-sm font-bold mb-1 text-gray-800">
              Status: {req.status}
            </p>
            <p className="text-[14px] font-bold mb-2 text-gray-800">
              Requested at: {new Date(req.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            {req.status === "accepted" && (
              <button
              onClick={() => handleVisible(8)}
                className="px-3 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Chat
              </button>
            )}

            {(req.status === "accepted" || req.status === "declined") && (
              <button
                onClick={() => handleRemove(req.id)}
                disabled={loadingRemoveId === req.id}
                className="px-3 py-1 text-white rounded bg-gray-900 hover:bg-gray-700 flex items-center gap-2"
              >
                {loadingRemoveId === req.id ? (
                  <svg
      className="animate-spin h-5 w-5 text-blue-800"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-white"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75 mx-auto"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
    </div>
  );
}
