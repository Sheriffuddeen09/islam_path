import { CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

export function ForwardModal({
  messages = [],
  users = [],
  onSend,
  onClose, loading, setLoading
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");

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

  const toggleUser = (id) => {
    if (!id) return;

    setSelectedUsers((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      getUserName(user)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [users, search]);

  const getUrl = (f) => {
  if (f.file_url?.startsWith("blob:")) return f.file_url;
  if (f.file?.startsWith("blob:")) return f.file;
  if (f.file_url?.startsWith("http")) return f.file_url;
  if (f.file_url) return `http://localhost:8000/storage/${f.file_url}`;
  if (f.file) return `http://localhost:8000/storage/${f.file}`;
  return null;
};
  const getFileName = (file) => {
  if (file.file_name) return file.file_name;
  if (file.file_url) {
    const parts = file.file_url.split("/");
    return parts[parts.length - 1];
  }
  return "File";
};

const renderPreview = (msg) => {
   if (!msg) return null;
  if (msg.type === "text") {
    return <p className="text-sm truncate">{msg.message}</p>;
  }

  if (msg.files && msg.files.length > 0) {
    return (
      <div className="flex gap-2 overflow-x-auto">
        {msg.files.slice(0, 3).map((file, i) => {
          const url = getUrl(file);
          const name = getFileName(file);

          return (
            <div
              key={i}
              className=" rounded-lg overflow-hidden bg-gray-200 relative flex items-center justify-center"
            >
              {/* IMAGE */}
              {file.type?.startsWith("image") && (
                <img
                  src={url}
                  alt=""
                  className="w-16 h-16 object-cover"
                />
              )}

              {/* VIDEO → first letter */}
              {file.type?.startsWith("video") && (
                <div className="w-full h-full bg-black flex items-center justify-center text-white font-bold text-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* AUDIO → file name */}
              {file.type === "audio" && (
                <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                  🎵 {name}
                </div>
              )}

              {file.type === "file" && (
                <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                  📎 {name}
                </div>
              )}

              {/* VOICE → type */}
              {file.type === "voice" && (
                <div className="text-sm whitespace-nowrap font-bold text-gray-700">
                  🎤 Voice Message
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
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
  await onSend(selectedUsers);
};



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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
            class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
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
              ? <p className="inline-flex gap-2 items-center "> 
                <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> Forwarding
              </p>
              : `Forward (${selectedUsers.length})`}
          </button>

        </div>
      </div>
    </div>
  );
}