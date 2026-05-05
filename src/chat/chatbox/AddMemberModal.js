import { useEffect, useMemo, useState } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { Loader2, X } from "lucide-react";

export default function AddMemberModal({ chat, onClose }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true); // ✅ NEW
  const [loadingId, setLoadingId] = useState(null);
  const [search, setSearch] = useState("");


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

  const memberIds = useMemo(() => {
    return (chat?.members || []).map((m) => Number(m.id));
  }, [chat]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true); // start loading

        const res = await api.get("/api/users");
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoadingUsers(false); // stop loading
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
  let list = users;

  // 🔥 remove members completely
  list = list.filter(
    (user) => !memberIds.includes(Number(user.id))
  );

  // 🔍 search
  if (search) {
    list = list.filter((user) => {
      const name = `${user.first_name} ${user.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });
  }

  return list;
}, [search, users, memberIds]);

  const addMember = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/add-member`, {
        user_id: userId,
      });

      toast.success("Member added");

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add member");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">

      <div className="bg-white w-80 rounded-lg shadow-lg flex flex-col max-h-[500px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-bold">Add Member</h3>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={25} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {/* 🔥 LOADING SKELETON */}
          {loadingUsers ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 animate-pulse"
              >
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isMember = memberIds.includes(Number(user.id));
              const isLoading = loadingId === user.id;

              return (
               <div
            key={user.id}
            className="flex justify-between items-center py-2 border-b"
            >
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

            <button
                onClick={() => addMember(user.id)}
                disabled={loadingId === user.id}
                className={`text-sm px-3 py-1 rounded ${
                loadingId === user.id
                    ? "bg-gray-300 text-gray-600"
                    : "text-blue-500 hover:text-blue-700"
                }`}
            >
                {loadingId === user.id ? (
                <span className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding
                </span>
                ) : (
                "Add"
                )}
            </button>
            </div>  
    );
            })
          )}

        </div>
      </div>
    </div>
  );
}