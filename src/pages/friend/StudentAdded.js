import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import toast, { Toaster } from "react-hot-toast";



export default function StudentAdded({handleMessageOpen}) {
  const { id } = useParams();               // ✅ FIX 1

  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [student, setStudent] = useState(null)

  // 🔹 Fetch student profile + friend status
  useEffect(() => {
  api.get(`/api/student/profile/${id}`)
    .then(res => {
      setStudent(res.data.student);
      setStatus(res.data.status || "none"); // ✅ FIX HERE
    })
    .catch(() => toast.error("Failed to load profile"))
    .finally(() => setLoading(false));
}, [id]);


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
    return <p  className="bg-green-800 px-5 py-2 rounded">
      <p className=" rounded-lg text-xs flex items-center gap-2">
      <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
    </p></p>;
  }

  if (!student) {
    return <p className="text-center mt-10">Student not found</p>;
  }

  return (
    <div>
   <Toaster position="top-right" />

      {/* Action Button */}
      {status === "accepted" && (
        <button
        onClick={() => handleMessageOpen(student.id)}
        className="mt-1 px-4 bg-blue-800 hover:bg-purple-700 text-white text-sm py-3 rounded-lg"
      >
        💬 Message
      </button>

      )}

      {status === "pending" && (
        <button disabled className="bg-gray-500 px-5 py-2 rounded">
          ⏳ Pending
        </button>
      )}

      {status === "none" && (
        <button onClick={sendFriendRequest} className="bg-green-800 px-5 py-2 rounded">
          {
            btnLoading ?
             <p className=" rounded-lg text-xs flex items-center gap-2">
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
          :
          "➕ Add Friend"
        }
        </button>
      )}

    </div>
  );
}
