import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Users, CheckCircle, XCircle } from "lucide-react";
import api from "../../Api/axios";

export default function JoinGroup() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); 
  // idle | success | error

  const handleJoin = async () => {
    try {
      setLoading(true);
      setStatus("idle");

      const res = await api.post(`/api/invite/group/${token}`);

      toast.success(res.data.message || "Joined successfully");
      setStatus("success");

      // optional redirect after 2s
      setTimeout(() => {
        navigate("/chat"); // adjust route
      }, 2000);

    } catch (err) {
      console.error(err);
      toast.error("Invalid or expired invite link");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 text-center">

        {/* ICON */}
        <div className="flex justify-center mb-4">
          {status === "success" ? (
            <CheckCircle className="w-14 h-14 text-green-500" />
          ) : status === "error" ? (
            <XCircle className="w-14 h-14 text-red-500" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600 w-7 h-7" />
            </div>
          )}
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-2">
          {status === "success"
            ? "You're in!"
            : status === "error"
            ? "Join failed"
            : "Join Group"}
        </h2>

        {/* MESSAGE */}
        <p className="text-gray-800 text-sm text-sm mb-6">
          {status === "success"
            ? "You have successfully joined the group."
            : status === "error"
            ? "This invite link is invalid or expired."
            : "You've been invited to join a group. Click below to continue."}
        </p>

        {/* BUTTON */}
        {status === "idle" && (
          <button
            onClick={handleJoin}
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Joining...
              </span>
            ) : (
              "Join Group"
            )}
          </button>
        )}

        {/* BACK BUTTON */}
        {(status === "error" || status === "success") && (
          <button
            onClick={() => navigate("/")}
            className="mt-3 text-sm text-gray-500 hover:underline"
          >
            Go back
          </button>
        )}

      </div>
    </div>
  );
}