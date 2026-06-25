import { CheckCircle } from "lucide-react";
import { useState, useMemo } from "react";

export function ForwardModalLargeScreen({
  messages = [],
  users = [],
  groups = [],
  onSend,
  onClose,
  loading,
  loadingChats = false,
  loadingGroups = false,
  handleSendMeeting
}) {
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [search, setSearch] = useState("");

  const isLoading = loadingChats || loadingGroups;


   const allTargets = useMemo(() => {
  const map = new Map();
  users.forEach((item) => {
    if (!item) return;
    if (
      item.type === "group" ||
      item.group_id ||
      item.group ||
      item.chat_group
    ) {
      return;
    }
    const user =
      item.other_user ||
      item.teacher ||
      item.student ||
      item.user ||
      item;
    const userId = user?.id || item.id;
    if (!userId) return;
    const fullName =
      `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

    const key = `user-${userId}`;

    if (!map.has(key)) {
      map.set(key, {
        id: userId,
        __type: "user",
        name: fullName || user.name || `User ${userId}`,
      });
    }
  });

  groups.forEach((group) => {
    if (!group?.id) return;

    const key = `group-${group.id}`;
    if (!map.has(key)) {
      map.set(key, {
        id: group.id,
        __type: "group",
        name:
          group.name ||
          group.group_name ||
          "Unnamed Group",
      });
    }
  });

  return Array.from(map.values());
}, [users, groups]);

const filteredTargets = useMemo(() => {
    return allTargets.filter((item) =>
      (item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [allTargets, search]);

  const toggleTarget = (item) => {
    const key = `${item.__type}-${item.id}`;

    setSelectedTargets((prev) =>
      prev.includes(key)
        ? prev.filter((t) => t !== key)
        : [...prev, key]
    );
  };

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
  if (!Array.isArray(selectedTargets)) {
    console.error("selectedTargets is NOT array:", selectedTargets);
    return;
  }
  await onSend([...selectedTargets]); 
};
  
  if (!messages.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded w-80 text-center">
          <p className="text-gray-500">No message selected</p>
          <button onClick={onClose} className="mt-4 text-red-500">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-[95%] max-w-md bg-white p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">
            Forward ({messages.length})
          </h2>
          <button onClick={onClose} className="text-red-500 text-xl">
            ✕
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin mb-3 space-y-2 border p-2 rounded">
          {messages.map((msg) => (
            <div key={msg.id} className="p-2 bg-gray-100 rounded-lg">
              <p className="text-sm truncate">
                {renderPreview(msg)}
              </p>
            </div>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search user or group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-2 rounded mb-2"
        />
        <div className="max-h-52 overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin space-y-2">

  {/* SKELETON LOADING */}
  {isLoading && (
    <>
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center justify-between p-3 rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />

            <div>
              <div className="h-3 w-28 bg-gray-300 rounded mb-2" />
              <div className="h-2 w-16 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="w-5 h-5 rounded-full bg-gray-300" />
        </div>
      ))}
    </>
  )}

        {!isLoading &&
          filteredTargets.map((item) => {

            const key = `${item.__type}-${item.id}`;
            const isSelected = selectedTargets.includes(key);

            return (
              <button
                key={key}
                onClick={() => toggleTarget(item)}
                className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition ${
                  isSelected
                    ? "bg-green-700 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">

                  {/* AVATAR */}
                  <div
                    className={`
                      w-9
                      h-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      font-bold
                      text-white
                      ${getColor(item.name)}
                    `}
                  >
                    {getInitial(item.name)}
                  </div>
                  <div>
                    <div className="font-medium">
                      {item.name}
                    </div>

                    <div className="text-xs opacity-70 capitalize">
                      {item.__type}
                    </div>
                  </div>
                </div>

                {isSelected && <CheckCircle />}
              </button>
            );
          })}

        {/* EMPTY */}
        {!isLoading && filteredTargets.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            No users or groups found
          </div>
        )}
      </div>
       <button
            onClick={() => {handleSend(); handleSendMeeting()}}
            disabled={loading || selectedTargets.length === 0}
            className={`px-4 py-3 mt-4 rounded text-white w-full ${
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
              : `Forward (${selectedTargets.length})`}
          </button>

        </div>
    </div>
  );
}