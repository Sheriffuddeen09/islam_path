import { useEffect, useState } from "react"; 
import api from "../Api/axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StudentRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

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
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Live Class Requests</h2>

      {requests.length === 0 ? (
        <p className="text-gray-500 text-center">No live class requests sent yet.</p>
      ) : (
        // Scrollable container
        <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-md w-80 sm:w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Teacher</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase whitespace-nowrap tracking-wider">Date Sent</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{req.teacher.first_name} {req.teacher.last_name}</td>
                  <td className="px-4 py-3 text-gray-600 font-medium capitalize whitespace-nowrap">{JSON.parse(req.teacher.teacher_info).course_title} &bull; {JSON.parse(req.teacher.teacher_info).experience}</td>
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
                      <Link 
                        to={`/live-class/${req.teacher.id}`} 
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
                      >
                        Start
                      </Link>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
