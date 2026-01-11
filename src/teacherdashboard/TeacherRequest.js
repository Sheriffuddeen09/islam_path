import { useEffect, useState } from "react";
import api, { respondToRequest } from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherLiveRequests({ pendingCount, setPendingCount }) {
  const [requests, setRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/live-class/all-requests"); // your endpoint
      const requestsArray = Array.isArray(res.data.requests) ? res.data.requests : [];
      setRequests(requestsArray);

      // Count only pending requests for badge
      const pending = requestsArray.filter(r => r.status === "pending").length;
      setPendingCount(pending);

    } catch (err) {
      console.error("Failed to fetch requests", err);
      setRequests([]);
      setPendingCount(0);
    }
  };

  const clearByTeacher = async (id) => {
    setDeleteLoading(true)
  try {
    await api.delete(`/api/live-class/request/${id}/clear-teacher`);
    fetchRequests(); // refresh list
    toast.success("History Request Remove successfully");
  } catch (err) {
    toast.error("Failed to remove request", err);
  }
  finally{
    setDeleteLoading(true)

  }
};


  const handleResponse = async (id, action) => {
  if (loadingAction) return;

  setLoadingAction({ id, action });

  try {
    await respondToRequest(id, action);
    await fetchRequests();

    if (action === "accepted") {
      toast.success("Request accepted! You can start the live class now.");
    } else {
      toast.error("The user request has been declined by you");
    }
  } catch (err) {
    console.error("Failed to respond", err);
    toast.error("Something went wrong!");
  } finally {
    setLoadingAction(null);
  }
};


  // 🔹 Add this useEffect to call fetchRequests on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow lg:ml-60">
      <Toaster position="top-right" />
      <h2 className="font-bold text-lg mb-4">
        Student Requests ({pendingCount} pending)
      </h2>

      {requests.length === 0 && (
        <p className="text-gray-500">No pending requests</p>
      )}

      {requests.map((req) => (
        <div
          key={req.id}
          className="border p-4 rounded-lg mb-3 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {req.student.first_name} {req.student.last_name}
            </p>
            <p className="text-sm text-gray-500">
              Requested {new Date(req.created_at).toLocaleString("en-GB", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>

          <div className="flex gap-2">
            {req.status === "pending" && (
  <>
    <button
      onClick={() => handleResponse(req.id, "accepted")}
      disabled={
        loadingAction?.id === req.id &&
        loadingAction?.action === "accepted"
      }
      className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2 disabled:opacity-60"
    >
      {loadingAction?.id === req.id &&
      loadingAction?.action === "accepted" ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
        </>
      ) : (
        "Accept"
      )}
    </button>

    <button
      onClick={() => handleResponse(req.id, "declined")}
      disabled={
        loadingAction?.id === req.id &&
        loadingAction?.action === "declined"
      }
      className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-2 disabled:opacity-60"
    >
      {loadingAction?.id === req.id &&
      loadingAction?.action === "declined" ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
        </>
      ) : (
        "Decline"
      )}
    </button>
  </>
)}

          </div>

          {req.status !== "pending" && (
          <button
            onClick={() => clearByTeacher(req.id)}
             className="px-3 py-1 text-white rounded bg-gray-900 hover:bg-gray-700 flex items-center gap-2"
              >{
            deleteLoading ? 
            (
    <svg
      className="animate-spin h-5 w-5 text-blue-800"
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
        className="opacity-75 mx-auto"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          }
          </button>
        )}
        </div>
      ))}
    </div>
  );
}
