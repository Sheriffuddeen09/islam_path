import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { X, Check, XCircle, Loader2 } from "lucide-react";

export default function PendingMembersModal({
  chat,
  isOpen,
  onClose,
  authUser,
  pending,
  setPending
}) {
  const [loadingId, setLoadingId] = useState(null);
  const [isFetching, setIsFetching] = useState(false); // 🔥 NEW

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
    if (!isAdmin || !chat?.id || !isOpen) return;

    const fetchPending = async () => {
      try {
        setIsFetching(true); // 🔥 START LOADING

        const res = await api.get(`/api/groups/${chat.id}/pending-members`);
        setPending(res.data);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load requests");
      } finally {
        setIsFetching(false); // 🔥 STOP LOADING
      }
    };

    fetchPending();
  }, [chat.id, isAdmin, isOpen]);

  // 🔥 APPROVE
  const approve = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/approve-member`, {
        user_id: userId,
      });

      setPending((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Member approved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve");
    } finally {
      setLoadingId(null);
    }
  };

  // 🔥 REJECT
  const reject = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/reject-member`, {
        user_id: userId,
      });

      setPending((prev) => prev.filter((u) => u.id !== userId));
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
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>

        {/* LIST */}
        <div className="overflow-y-auto flex-1 p-2">

          {/* 🔥 SKELETON LOADING */}
          {isFetching ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="w-24 h-3 bg-gray-300 rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))
          ) : pending.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              No pending requests
            </p>
          ) : (
            pending.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 border-b"
              >
                {/* USER */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${getColor(
                      user?.first_name
                    )}`}
                  >
                    {getInitial(user.first_name)}
                  </div>

                  <span className="text-sm">
                    {user.first_name} {user.last_name}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">

                  {/* APPROVE */}
                  <button
                    onClick={() => approve(user.id)}
                    disabled={loadingId === user.id}
                    className="p-1 px-2 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>

                  {/* REJECT */}
                  <button
                    onClick={() => reject(user.id)}
                    disabled={loadingId === user.id}
                    className="p-1 px-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    {loadingId === user.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle size={14} />
                    )}
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