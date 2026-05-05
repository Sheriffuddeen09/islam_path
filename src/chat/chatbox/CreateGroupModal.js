import { useState, useEffect } from "react";
import api from "../../Api/imageAxios";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

export default function CreateGroupModal({ users = [], onClose, loadingUsers }) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [onlyAdminCanSend, setOnlyAdminCanSend] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [toast, setToast] = useState(false)


  
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // =============================
  // Select / Remove User
  // =============================
  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  const removeUser = (id) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // =============================
  // Search Filter
  // =============================
  const filteredUsers = users.filter((u) =>
    `${u.first_name} ${u.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =============================
  // Avatar Preview
  // =============================
  useEffect(() => {
    if (!groupImage) return;
    const url = URL.createObjectURL(groupImage);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [groupImage]);

  // =============================
  // Group Users by First Letter
  // =============================
  const groupedSelected = selectedUsers.reduce((acc, user) => {
    const letter = user.first_name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(user);
    return acc;
  }, {});

  // =============================
  // Create Group API
  // =============================
  const createGroup = async () => {
  if (!groupName.trim()) return setToast("Group name required");

  const formData = new FormData();
  formData.append("name", groupName);
  formData.append("only_admin_send", onlyAdminCanSend ? 1 : 0);

  console.log("groupImage:", groupImage);
  console.log("type:", typeof groupImage);

  selectedUsers.forEach((u) => {
    formData.append("users[]", u.id);
  });

  if (groupImage && groupImage instanceof File) {
    formData.append("image", groupImage);
  } else {
    console.log("Invalid image file:", groupImage);
  }

  setCreateLoading(true);

  try {
    await api.post("/api/groups", formData); // no headers needed
    onClose();
  } catch (err) {
    console.error(err.response?.data || err.message);
  } finally {
    setCreateLoading(false);
  }
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
  
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];

      if (!file) return;

      setGroupImage(file);
      setPreview(URL.createObjectURL(file));
    };

  return (
    <div className="fixed inset-0 bg-[#0B141A] text-white z-50 overflow-auto">

      {/* ===================== STEP 1 ===================== */}
      {step === 1 && (
        <div className="p-4">

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              </button>
            <h2 className="text-sm font-bold">New group</h2>
          </div>

          {/* Search */}
          <input
            placeholder="Search name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-full bg-[#202C33]"
          />

          {/* Selected users */}
          <div className="flex gap-3 overflow-x-auto my-4">
            {selectedUsers.map((user) => (
              <div key={user.id} className="relative text-center">
                <div
        className={`relative w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-xl ${getColor(
          user?.first_name
        )}`}
      >
        {getInitial(user?.first_name)}
        </div>
                <button
                  onClick={() => removeUser(user.id)}
                  className="absolute top-0 right-2 bg-gray-600 rounded-full px-1 text-xs"
                >
                  ✕
                </button>
                <p className="text-xs">{user.first_name}</p>
              </div>
            ))}
          </div>

          {/* User list */}
          {/* User list */}
        <div>
          {loadingUsers ? (
            // ================= SKELETON =================
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border-b border-gray-700 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar skeleton */}
                  <div className="w-10 h-10 rounded-full bg-[#202C33]" />

                  {/* Text skeleton */}
                  <div className="flex flex-col gap-2">
                    <div className="w-32 h-3 bg-[#202C33] rounded" />
                    <div className="w-20 h-3 bg-[#202C33] rounded" />
                  </div>
                </div>

                {/* Circle skeleton */}
                <div className="w-5 h-5 rounded-full border-2 border-[#202C33]" />
              </div>
            ))
          ) : (
            // ================= REAL USERS =================
            filteredUsers.map((user) => {
              const selected = selectedUsers.find((u) => u.id === user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className="flex justify-between items-center p-3 border-b border-gray-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${getColor(
                        user?.first_name
                      )}`}
                    >
                      {getInitial(user?.first_name)}
                    </div>

                    <p>
                      {user.first_name} {user.last_name}
                    </p>
                  </div>

                  <div className="text-xl">
                    {selected ? <CheckCircle width={20} /> : <Circle width={20} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
          {/* Next Button */}
          {selectedUsers.length > 0 && (
            <button
              onClick={() => setStep(2)}
              className="fixed bottom-6 right-6 bg-[#25D366] w-14 h-14 rounded-full text-black text-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
              stroke="currentColor" class="size-6 text-white rotate-180 mx-auto">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ===================== STEP 2 ===================== */}
      {step === 2 && (
        <div className="p-4">

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setStep(1)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              </button>
            <h2 className="text-sm font-bold">New group</h2>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];

                  console.log("Selected file:", file);

                  setGroupImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />

              {preview ? (
                <img
                  src={preview}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>

                </div>
              )}
            </label>

            <input
              placeholder="Group subject"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="flex-1 p-3 bg-[#202C33] rounded"
            />
          </div>

          {/* Permissions */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm">Only admins can send messages</span>
           <div
            onClick={(e) => {
              e.stopPropagation();
              setOnlyAdminCanSend(!onlyAdminCanSend);
            }}
            className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer transition
              ${
                onlyAdminCanSend
                  ? "bg-[#25D366] border-[#25D366] text-white"
                  : "border-gray-400"
              }
            `}
          >
            {onlyAdminCanSend && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 text-black"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-7.071 7.071a1 1 0 01-1.414 0L3.293 9.85a1 1 0 011.414-1.414l3.515 3.515 6.364-6.364a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          </div>

          {/* Members */}
          <div>
            <p className="text-gray-400 mb-2 mt-2 border-b pb-2 border-white">
              Members: {selectedUsers.length}
            </p>

            {Object.keys(groupedSelected).map((letter) => (
              <div key={letter} className="mb-3">
                <p className="text-sm text-gray-500">{letter}</p>

                {groupedSelected[letter].map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-2"
                  >
                    <div className="flex items-center gap-2">
                     <div
                      className={`relative w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xl ${getColor(
                        user?.first_name
                      )}`}
                    >
                      {getInitial(user?.first_name)}
                      </div>
                      <span>{user.first_name}</span>
                    </div>

                    {/* Admin remove user */}
                    <button
                      onClick={() => removeUser(user.id)}
                      className="text-red-400 text-sm"
                    >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Create Button */}
          <button
            onClick={createGroup}
            className="fixed bottom-6 mx-auto  right-6 bg-[#25D366] w-14 h-14 rounded-full text-black text-xl"
          >
            {
              createLoading ? <Loader2 className="mx-auto text-white" /> :
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-auto text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
            }
          </button>
        </div>
      )}

      {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}
    </div>
  );
}