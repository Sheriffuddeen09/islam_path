import { useEffect, useState } from "react";
import { getLiveRequests, respondToRequest } from "../Api/axios";

export default function TeacherLiveRequests() {
  const [requests, setRequests] = useState([]);

 const fetchRequests = async () => {
  try {
    const res = await getLiveRequests();
    setRequests(res.data || []);
  } catch (err) {
    console.error("Failed to fetch requests", err);
    setRequests([]);
  }
};


  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (id, action) => {
    await respondToRequest(id, action);
    fetchRequests(); // refresh list
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-bold text-lg mb-4">Student Requests</h2>

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
              Requested {req.created_at}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleResponse(req.id, "accept")}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Accept
            </button>
            <button
              onClick={() => handleResponse(req.id, "decline")}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
