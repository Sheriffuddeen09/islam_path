import { useState, useMemo } from "react";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { Loader2, X } from "lucide-react";

export default function RemoveMemberModal({
  chat,
  onClose,
  currentUserId,
}) {
  const [members, setMembers] = useState(chat.members || []);
  const [loadingId, setLoadingId] = useState(null);


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

  const removeMember = async (userId) => {
    try {
      setLoadingId(userId);

      await api.post(`/api/groups/${chat.id}/remove-member`, {
        user_id: userId,
      });

      setMembers((prev) => prev.filter((m) => m.id !== userId));
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    } finally {
      setLoadingId(null);
    }
  };

  // ❌ hide admin + current user
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      return (
        m.id !== currentUserId &&
        (m.role ?? "member") !== "admin"
      );
    });
  }, [members, currentUserId]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">

      <div className="bg-white w-80 rounded-lg shadow-lg flex flex-col max-h-[400px]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-bold">Remove Member</h3>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {filteredMembers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">
              No members available
            </p>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center py-2 border-b"
              >
               <div className="flex items-center gap-3">
                
                <div
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold ${getColor(
                    member?.first_name
                )}`}
                >
                {getInitial(`${member?.first_name} ${member?.last_name}`)}
                </div>

                <span className="text-sm">
                {member.first_name} {member.last_name}
                </span>
            </div>

                <button
                  onClick={() => removeMember(member.id)}
                  disabled={loadingId === member.id}
                  className={`text-sm px-3 py-1 rounded transition ${
                    loadingId === member.id
                      ? "bg-gray-300 text-gray-600"
                      : "text-red-500 hover:text-red-700"
                  }`}
                >
                  {loadingId === member.id ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing
                    </span>
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}