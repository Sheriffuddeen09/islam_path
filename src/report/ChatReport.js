import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";


export default function ChatReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/api/chat/report");
        setReports(res.data || []);

      } catch (err) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  /* ---------------- LOADING ---------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

 
  /* ---------------- EMPTY ---------------- */
  if (!reports.length) {
    return (
      <div className="p-6 text-center text-gray-900  ">
        No reports found.
      </div>
    );
  }

  const content = (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-6 text-center mt-20 text-gray-800">
        Reported Content
      </h2>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Reporter</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Reported User</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Chat Id</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.id}
                className="border-t text-black hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 text-sm">
                  {r.reporter
                    ? `${r.reporter.first_name} ${r.reporter.last_name}`
                    : "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {r.reported_user
                    ? `${r.reported_user.first_name} ${r.reported_user.last_name}`
                    : "—"}
                </td>

                <td className="px-4 py-3 text-sm">
                  {r.chat_id || "N/A"}
                </td>

                <td className="px-4 py-3 text-sm font-medium text-blue-600">
                  {r.reason}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {r.details}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                <button
                  onClick={() =>
                    navigate(`/chat/report/${r.id}`)
                  }
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    text-sm
                    px-4
                    py-2
                    rounded-lg
                    transition
                  "
                >
                  View
                </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl shadow border p-4 space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-blue-600">
                {r.reason}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-gray-700">
              <strong>Reporter:</strong> {r.reporter?.first_name || "—"} {r.reporter?.last_name || "—"}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Reported User:</strong> {r.reported_user?.first_name || "—"} {r.reported_user?.last_name || "—"}
            </ p>

            <p className="text-sm text-gray-700">
              <strong>Chat Id:</strong> {r.chat_id || "N/A"}
            </p>

            <p className="text-sm text-gray-700">
              <strong>Reason:</strong> {r.reason || "N/A"}
            </p>

            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {r.details}
            </p>
            <button
            onClick={() =>
              navigate(`/chat/report/${r.id}`)
            }
            className="
              w-full
              mt-3
              bg-blue-600
              hover:bg-blue-700
              text-white
              py-2
              rounded-lg
              transition
            "
          >
            View Details
          </button>

          </div>
        ))}
      </div>
    </div>
  );

  return (

    <div>
      
      <Toaster position="top-right" />
      {content}
    </div>
  )
}
