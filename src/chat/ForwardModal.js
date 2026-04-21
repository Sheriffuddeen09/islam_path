import { CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

export function ForwardModal({
  messages = [],
  users = [],
  onSend,
  onClose,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= GET USER ID CORRECTLY =================
  const getUserId = (user) => {
    return (
      user?.other_user?.id ||
      user?.teacher?.id ||
      user?.student?.id ||
      null
    );
  };

  const getUserName = (user) => {
    return (
      user?.other_user
        ? `${user.other_user.first_name} ${user.other_user.last_name}`
        : user?.teacher
        ? `${user.teacher.first_name} ${user.teacher.last_name}`
        : user?.student
        ? `${user.student.first_name} ${user.student.last_name}`
        : "Unknown User"
    );
  };

  // ================= SELECT USER =================
  const toggleUser = (id) => {
    if (!id) return;

    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  // ================= SEARCH =================
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      getUserName(user)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  // ================= PREVIEW =================

  const getMediaUrl = (file) => {
  if (!file) return null;

  if (file.file_url?.startsWith("http")) return file.file_url;

  if (file.file_url) {
    return `http://localhost:8000/storage/${file.file_url.replace(/^storage\//, "")}`;
  }

  if (file.file_name) {
    return `http://localhost:8000/storage/chat_files/${file.file_name}`;
  }

  return null;
};

  const getUrl = (f) => {
  if (f.file_url?.startsWith("blob:")) return f.file_url;
  if (f.file?.startsWith("blob:")) return f.file;
  if (f.file_url?.startsWith("http")) return f.file_url;
  if (f.file_url) return `http://localhost:8000/storage/${f.file_url}`;
  if (f.file) return `http://localhost:8000/storage/${f.file}`;
  return null;
};
  
 const renderPreview = (msg) => {
  if (msg.type === "text") {
    return <p className="text-sm truncate">{msg.message}</p>;
  }

  if (msg.files && msg.files.length > 0) {
    return (
      <div className="flex gap-2 overflow-x-auto">
        {msg.files.slice(0, 3).map((file, i) => {
          const url = getUrl(file);
          const urlVideo = getMediaUrl(file)

          return (
            <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 relative">

              {/* IMAGE */}
              {file.type.startsWith("image") && (
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {/* VIDEO */}
              {file.type?.startsWith("video") && (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={urlVideo}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                    onError={(e) => console.log("VIDEO FAIL:", url)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    ▶
                  </div>
                </div>
              )}

              {/* PLAY ICON */}
              {file.type.startsWith("video") && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 p-1 rounded-full">
                    ▶
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    );
  }

    // VOICE
    if (msg.type === "voice") {
      return <p className="text-xs">🎤 Voice message</p>;
    }

    return <p className="text-xs">{msg.type}</p>;
  };

  const getMessagePreview = (msg) => {
    if (!msg) return "";

    if (msg.type === "text") return msg.message;

    if (msg.type === "voice") return "🎤 Voice Message";
    if (msg.type === "audio") return "🎧 Audio";
    if (msg.type === "video") return "🎥 Video";
    if (msg.type === "image") return "🖼 Image";
    if (msg.type === "file") return "📎 Document";

    return "";
  };


  // ================= SEND =================
  const handleSend = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);

    await onSend(selectedUsers);

    setLoading(false);
    onClose();
  };

  // ================= EMPTY =================
  if (!messages || messages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded w-80 text-center">
          <p className="text-gray-500">No message selected</p>
          <button
            onClick={onClose}
            className="mt-4 text-red-500 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-md p-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">
            Forward ({messages.length})
          </h2>

          <button onClick={onClose} className="text-red-500">
            ✕
          </button>
        </div>

        {/* MESSAGE PREVIEW */}
        <div className="max-h-40 overflow-y-auto mb-3 space-y-2 border p-2 rounded">

          {messages.map((msg) => (
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
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />

        {/* USERS */}
        <div className="max-h-52 overflow-y-auto mb-3 space-y-1">

          {filteredUsers.map((user) => {
            const id = getUserId(user);

            return (
              <button
                key={id}
                onClick={() => toggleUser(id)}
                className={`w-full text-left p-2 rounded flex justify-between items-center transition ${
                  selectedUsers.includes(id)
                    ? "bg-green-700 text-white"
                    : "lg:hover:bg-gray-800 lg:hover:text-white"
                }`}
              >
                <div className="font-medium">
                  {getUserName(user)}
                </div>

                {/* LAST MESSAGE */}
                <div className="text-xs opacity-70 truncate">
                  {getMessagePreview(user.last_message)}
                </div>

                 {selectedUsers.includes(id) && <span>
                  <CheckCircle />
                  </span>}
              </button>
            );
          })}

        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center gap-2">

          <button
            onClick={handleSend}
            disabled={loading || selectedUsers.length === 0}
            className={`px-4 py-2 rounded text-white w-full ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Forwarding..."
              : `Forward (${selectedUsers.length})`}
          </button>

        </div>
      </div>
    </div>
  );
}