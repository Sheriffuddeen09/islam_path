import { useEffect, useState, useMemo } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { X, Check, XCircle } from "lucide-react";

export default function PendingMembersModal({
  chat,
  isOpen,
  onClose,
  authUser,
  setPendingCount,
  pending
}) {
  const [loadingId, setLoadingId] = useState(null);

  const isAdmin = authUser?.role === "admin";

  const colors = [
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500"
    ];
  
    const getColor = (name = "") => {
      const index = name.charCodeAt(0) % colors.length;
      return colors[index];
    };
  
    const getInitial = (name) => {
      if (!name) return "?";
      return name.charAt(0).toUpperCase();
    };

  // 🔥 FETCH PENDING MEMBERS
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    const fetchPending = async () => {
      try {
        const res = await api.get(`/api/groups/${chat.id}/pending-members`);
        setPendingCount(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load requests");
      }
    };

    fetchPending();
  }, [isOpen, chat.id, isAdmin]);

  // 🔥 APPROVE MEMBER
  const approve = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/approve-member`, {
        user_id: userId,
      });

      setPendingCount((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Member approved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔥 REJECT MEMBER
  const reject = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/reject-member`, {
        user_id: userId,
      });

      setPendingCount((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Member rejected");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject");
    } finally {
      setLoadingId(null);
    }
  };

  if (!isOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-80 rounded-xl shadow-lg flex flex-col max-h-[500px]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="font-semibold">Pending Requests</h2>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>

        {/* LIST */}
        <div className="overflow-y-auto flex-1 p-2">

          {pending.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              No pending requests
            </p>
          ) : (
            pending.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 border-b"
              >

                {/* AVATAR + NAME */}
                <div className="flex items-center gap-3">
                
                <div
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${getColor(
                    user?.first_name
                )}`}
                >
                {getInitial(`${user?.first_name} ${user?.last_name}`)}
                </div>

                <span className="text-sm">
                {user.first_name} {user.last_name}
                </span>
            </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  <button
                    onClick={() => approve(user.id)}
                    disabled={loadingId === user.id}
                    className="p-1 px-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    <Check size={14} />
                  </button>

                  <button
                    onClick={() => reject(user.id)}
                    disabled={loadingId === user.id}
                    className="p-1 px-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <XCircle size={14} />
                  </button>

                </div>

              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}