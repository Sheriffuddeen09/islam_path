import { CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

export function ForwardModal({
  messages = [],
  users = [],
  onSend,
  onClose, loading, setSelectedUsers, selectedUsers, selectedMessages
}) {
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



 const getUserName = (item) => {
  if (item?.type === "group") {
    return item.name || "Unnamed Group";
  }

  return (
    item?.other_user
      ? `${item.other_user.first_name} ${item.other_user.last_name}`
      : item?.teacher
      ? `${item.teacher.first_name} ${item.teacher.last_name}`
      : item?.student
      ? `${item.student.first_name} ${item.student.last_name}`
      : "Unknown User"
  );
};


  
  const toggleUser = (id) => {
  if (!id) return;

  const safeId = String(id);

  setSelectedUsers((prev) =>
    prev.includes(safeId)
      ? prev.filter((u) => u !== safeId)
      : [...prev, safeId]
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
                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {name.charAt(5).toUpperCase()}
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

 const handleSend = async () => {
  if (!selectedMessages?.length) return;

  const user_ids = selectedUsers
    .filter(id => String(id).startsWith("user_"))
    .map(id => Number(id.replace("user_", "")));

  const group_ids = selectedUsers
    .filter(id => String(id).startsWith("group_"))
    .map(id => Number(id.replace("group_", "")));

  await onSend({
    message_ids: selectedMessages.map(m => m.id),
    user_ids,
    group_ids,
  });
};

const getSafeId = (item) => {
  if (!item) return null;

  // GROUP
  if (item.type === "group") {
    return `group_${item.id}`;
  }

  // USER (handle all cases)
  const userId =
    item?.other_user?.id ||
    item?.teacher?.id ||
    item?.student?.id ||
    item?.id;

  return userId ? `user_${userId}` : null;
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
    
      <div className="bg-black/30  w-full h-full ">
        <div className="w-[95%] max-w-md p-4 mx-auto bg-white mt-10 mb-10 rounded-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">
            Forward modal ({messages.length})
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
          className="w-full border p-2 rounded mb-2 "
        />

        {/* USERS */}
        <div className="max-h-52 overflow-y-auto mb-3 space-y-1">

          {filteredUsers.map((user) => {
            const safeId = getSafeId(user);

            return (
              <button
                key={safeId}
                onClick={() => toggleUser(getSafeId(user))} 
                className={`w-full text-left p-2 rounded flex justify-between items-center transition ${
                  selectedUsers.includes(safeId)
                    ? "bg-green-700 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">

                  {/* AVATAR */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden ${getColor(
                      getUserName(user)
                    )}`}
                  >
                    {user.type === "group" && user.image_url ? (
                      <img
                        src={user.image_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitial(getUserName(user))
                    )}
                  </div>

                  {/* NAME */}
                  <div className="font-medium">
                    {getUserName(user)}
                  </div>
                </div>

                {/* GROUP TAG */}
                {user.type === "group" && (
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                    group
                  </span>
                )}

                {/* SELECTED */}
                {selectedUsers.includes(safeId) && (
                  <CheckCircle />
                )}
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