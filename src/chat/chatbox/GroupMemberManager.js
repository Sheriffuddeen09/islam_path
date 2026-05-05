import { useState, useMemo } from "react";
import { Shield, Search, X, Loader2 } from "lucide-react";
import api from "../../Api/axios";

export default function GroupMembersManager({
  chat,
  members = [],
  currentUserId,
  getColor,
  getInitial,
  setActiveChat,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  // ✅ check if current user is admin
  const isAdmin = members.some(
    (m) => m.id === currentUserId && m.role === "admin"
  );

  // ✅ filter members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const name = `${m.first_name} ${m.last_name}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, members]);

  // 🔥 TOGGLE ADMIN ONLY
  const handleToggleAdmin = async (userId, currentRole) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/toggle-admin`, {
        user_id: userId,
        action: currentRole === "admin" ? "remove" : "make",
      });

      // ✅ instant UI update
      setActiveChat((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === userId
            ? {
                ...m,
                role: m.role === "admin" ? "member" : "admin",
              }
            : m
        ),
      }));
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
      <div className="bg-white w-80 rounded-lg shadow-lg flex flex-col max-h-[500px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-bold text-lg">Administer</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b">
          <div className="flex items-center border rounded px-2">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-2 outline-none"
            />
          </div>
        </div>

        {/* MEMBERS LIST */}
        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <p className="text-center text-gray-400 p-3">
              No members found
            </p>
          ) : (
            filteredMembers.map((member) => (
              <Row
                key={member.id}
                user={member}
                role={member.role}
                loading={loadingId === member.id}
                getColor={getColor}
                getInitial={getInitial}
                action={
                  isAdmin && member.id !== currentUserId && (
                    <ActionButton
                      icon={<Shield size={14} />}
                      label={
                        member.role === "admin"
                          ? "Remove Admin"
                          : "Make Admin"
                      }
                      onClick={() =>
                        handleToggleAdmin(member.id, member.role)
                      }
                      loading={loadingId === member.id}
                    />
                  )
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* 🔥 ROW */
function Row({ user, role, getColor, getInitial, action, loading }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getColor(
            user.first_name
          )}`}
        >
          {getInitial(user.first_name)}
        </div>

        <div>
          <p className="text-sm font-medium">
            {user.first_name} {user.last_name}
          </p>

          <span className="text-xs text-gray-500 capitalize">
            {role}
          </span>
        </div>
      </div>

      <div>
        {loading ? (
          <button className="bg-green-500 text-white p-2 rounded">
          <Loader2 className="w-4 h-4 animate-spin " />
          </button>
        ) : (
          action
        )}
      </div>
    </div>
  );
}

/* 🔥 BUTTON */
function ActionButton({ icon, label, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs px-2 py-2 rounded bg-green-500 text-white"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : icon}
      {label}
    </button>
  );
}