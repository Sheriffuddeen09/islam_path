import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import toast, { Toaster } from "react-hot-toast";



export default function StudentProfile({student, setStudent}) {
  const { id } = useParams();               // ✅ FIX 1
  const navigate = useNavigate();           // ✅ FIX 2
  const { user } = useAuth();

  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // 🔹 Fetch student profile + friend status
  useEffect(() => {
    api.get(`/api/students/${id}`)
      .then(res => {
        setStudent(res.data.student);
        setStatus(res.data.friend_status || "none");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  // 🔹 Send friend request
  const sendFriendRequest = async () => {   // ✅ FIX 3
    setBtnLoading(true);
    try {
      await api.post("/api/student-friend/request", {
        student_id: student.id,
      });

      setStatus("pending");
      toast.success("Friend request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setBtnLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading profile…</p>;
  }

  if (!student) {
    return <p className="text-center mt-10">Student not found</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-20 bg-white p-6 rounded-xl shadow">
   <Toaster position="top-right" />

      {/* Avatar */}
      <img
        src={student.avatar || "/avatar.png"}
        className="w-24 h-24 rounded-full mx-auto"
        alt="avatar"
      />

      {/* Name */}
      <h2 className="text-center mt-4 text-xl font-bold">
        {student.first_name} {student.last_name}
      </h2>

      {/* Action Button */}
      <div className="mt-6 flex justify-center">
        {/* 💬 MESSAGE */}
        {status === "accepted" && (
          <button
            onClick={() => navigate(`/chat/${student.id}`)}   // ✅ FIX 4
            className="bg-blue-600 text-white px-5 py-2 rounded"
          >
            💬 Message
          </button>
        )}

        {/* ⏳ PENDING */}
        {status === "pending" && (
          <button
            disabled
            className="bg-gray-300 px-5 py-2 rounded"
          >
            ⏳ Pending
          </button>
        )}

        {/* ➕ ADD FRIEND */}
        {status === "none" && user?.role === "student" && (
          <button
            disabled={btnLoading}
            onClick={sendFriendRequest}
            className="bg-green-600 text-white px-5 py-2 rounded"
          >
            {btnLoading ? "Sending…" : "➕ Add Friend"}
          </button>
        )}
      </div>
    </div>
  );
}
