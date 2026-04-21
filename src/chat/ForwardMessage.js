import { useState, useMemo } from "react";

export function ForwardModal({
  messages = [],
  users = [],
  onSend,
  onClose,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);


  
      const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ extract correct user id
  const getUserId = (user) =>
    user.other_user?.id ||
    user.teacher?.id ||
    user.student?.id;

  const getUserName = (user) =>
    user.other_user
      ? `${user.other_user.first_name} ${user.other_user.last_name}`
      : user.teacher
      ? `${user.teacher.first_name} ${user.teacher.last_name}`
      : user.student
      ? `${user.student.first_name} ${user.student.last_name}`
      : "Unknown";

  const toggleUser = (user) => {
    const id = getUserId(user);
    if (!id) return;

    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(u => u !== id)
        : [...prev, id]
    );
  };

  // ✅ SEARCH FILTER
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      getUserName(user)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, users]);

  // ✅ SEND
  const handleSend = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);

    try {
      await onSend(selectedUsers);

      showToast("✅ Messages forwarded");
      onClose();
    } catch (err) {
      showToast("❌ Failed to forward");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MESSAGE PREVIEW
  const renderPreview = (msg) => {
    // TEXT
    if (msg.type === "text") {
      return <p className="text-sm truncate">{msg.message}</p>;
    }

    // MULTIPLE FILES
    if (msg.files && msg.files.length > 0) {
      return (
        <div className="flex gap-2 overflow-x-auto">
          {msg.files.slice(0, 3).map((file, i) => (
            <div key={i} className="w-12 h-12 rounded overflow-hidden bg-gray-200">
              
              {file.type.startsWith("image") ? (
                <img
                  src={file.file_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : file.type.startsWith("video") ? (
                <video
                  src={file.file_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs">
                  📎
                </div>
              )}

            </div>
          ))}

          {msg.files.length > 3 && (
            <div className="text-xs flex items-center">
              +{msg.files.length - 3}
            </div>
          )}
        </div>
      );
    }

    // VOICE
    if (msg.type === "voice") {
      return <p className="text-xs">🎤 Voice message</p>;
    }

    return <p className="text-xs">{msg.type}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}

      <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-xl p-4 flex flex-col">

        {/* HEADER */}
        <h2 className="font-semibold text-lg mb-3">
          Forward Messages ({messages.length})
        </h2>

        {/* PREVIEW */}
        <div className="max-h-32 overflow-y-auto mb-3 space-y-2">
          {messages.map(msg => (
            <div
              key={msg.id}
              className="p-2 bg-gray-100 rounded-lg"
            >
              {renderPreview(msg)}
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-2 py-1 mb-3 text-sm outline-none"
        />

        {/* USERS */}
        <div className="flex-1 overflow-y-auto space-y-1 mb-3">
          {filteredUsers.map(user => {
            const id = getUserId(user);
            const isSelected = selectedUsers.includes(id);

            return (
              <button
                key={id}
                onClick={() => toggleUser(user)}
                className={`w-full text-left p-2 rounded flex justify-between items-center transition ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">
                    {getUserName(user)}
                  </p>

                  {/* LAST MESSAGE */}
                  <p className="text-xs opacity-70 truncate">
                    {user.messages?.[0]?.message || "No messages yet"}
                  </p>
                </div>

                {isSelected && <span>✔</span>}
              </button>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1 rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Sending...
              </>
            ) : (
              `Forward (${selectedUsers.length})`
            )}
          </button>

          <button
            onClick={onClose}
            className="text-red-500 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}