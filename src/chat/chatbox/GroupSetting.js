import { useState, useEffect } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import api from "../../Api/axios";

export default function GroupSettingsModal({
  chat,
  setChat,
  setShowModal,
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [onlyAdminCanSend, setOnlyAdminCanSend] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ INIT VALUES FROM CHAT
  useEffect(() => {
    if (chat) {
      setName(chat.name || "");
      setPreview(chat.image_url || null);
      setOnlyAdminCanSend(chat.only_admin_send === 1);
    }
  }, [chat]);

  // ✅ IMAGE CHANGE
  const handleImageChange = (file) => {
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ UPDATE GROUP
  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("only_admin_send", onlyAdminCanSend ? 1 : 0);

      if (image) {
        formData.append("image", image);
      }

      const res = await api.post(
        `/api/groups/${chat.id}/update`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ UPDATE UI STATE
      setChat((prev) => ({
        ...prev,
        ...res.data.chat,
        members: prev.members,
      }));

      setShowModal(false);
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 space-y-4">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Group Settings</h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* IMAGE */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
              {preview ? (
                <img
                  src={preview}
                  alt="group"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* UPLOAD */}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow hover:bg-blue-700">
              <Camera size={16} />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e.target.files[0])
                }
              />
            </label>
          </div>

          <span className="text-xs text-gray-500">
            Tap icon to change photo
          </span>
        </div>

        {/* GROUP NAME */}
        <div>
          <label className="text-sm text-gray-500">
            Group Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
          />
        </div>

        {/* ONLY ADMIN SEND TOGGLE */}
        <div className="flex justify-between items-center">
          <span className="text-sm">
            Only admins can send messages
          </span>

          <div
            onClick={(e) => {
              e.stopPropagation();
              setOnlyAdminCanSend((prev) => !prev);
            }}
            className={`w-6 h-6 flex items-center justify-center rounded-full border-2 cursor-pointer transition ${
              onlyAdminCanSend
                ? "bg-green-500 border-green-500"
                : "border-gray-400"
            }`}
          >
            {onlyAdminCanSend && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3 text-white"
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

        {/* ACTIONS */}
        <div className="flex gap-2 pt-3">
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {loading ? "Updating" : "Update"}
          </button>
        </div>

      </div>
    </div>
  );
}