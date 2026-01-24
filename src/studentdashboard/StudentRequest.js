import { useEffect, useState } from "react"; 
import api from "../Api/axios";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";


export default function StudentRequest({handleVisible}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/live-class/my-requests"); 
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setRequests([]);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);


  const clearStudentRequest = async (id) => {
    setDeleteLoading(true)
  try {
    await api.delete(`/api/live-class/request/${id}/clear-student`);
    fetchRequests(); // refresh list
    toast.success("History Request Remove successfully");
  } catch (err) {
    toast.error("Failed to remove request", err);
  }
  finally{
    setDeleteLoading(true)

  }
};


  const handleResend = async (requestId, teacherId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.post("/api/live-class/request", { teacher_id: teacherId });
      fetchRequests();
      toast.success("Request resent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resend request");
    } finally {
      setActionLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );

  return (
    <div className="p- lg:p-6 lg:ml-60 max-w-7xl mx-auto">
      <Toaster position="top-right" autoClose={3000} />
      <h2 className="text-xl font-bold mb-6 text-black pb-2 text-start border-b-2 border-blue-500">Live Class Requests</h2>

      
        <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-md w-full no-scrollbar sm:w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-white bg-white">
                 {requests.length === 0 && (
        <p className="text-gray-500 p-4 text-center whitespace-nowrap">No Teacher Request Send</p>
      )}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase whitespace-nowrap tracking-wider">Date Sent</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Remove</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{req.teacher.first_name} {req.teacher.last_name}</td>
                  <td className="px-4 py-3 text-gray-600 font-medium capitalize whitespace-nowrap">{JSON.parse(req.teacher.teacher_info).coursetitle} &bull; {JSON.parse(req.teacher.teacher_info).experience}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {req.status === "accepted" && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Accepted</span>
                    )}
                    {req.status === "declined" && (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">Declined</span>
                    )}
                    {req.status === "pending" && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                    {req.status === "accepted" && (
                      <button 
                       
                        className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-md hover:bg-green-700 font-semibold transition"
                      >
                      Added to Your Message List
                      </button>
                    )}
                    {req.status === "declined" && (
                      <button
                        onClick={() => handleResend(req.id, req.teacher.id)}
                        disabled={actionLoading[req.id]}
                        className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {actionLoading[req.id] ? "Resending..." : "Resend"}
                      </button>
                    )}
                    {req.status === "pending" && (
                      <span className="text-gray-500 italic">Waiting...</span>
                    )}
                  </td>
                  <td>
                  {["accepted", "declined"].includes(req.status) && (
                  <button
                    onClick={() => clearStudentRequest(req.id)}
                    className="text-xs text-gray-900 hover:text-red-600 translate-x-5"
                  >
                    {
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

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
    </div>
  );
}
