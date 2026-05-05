import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import api from "../../Api/axios";

export default function GroupSettingsModal({
  chat,
  setChat,
  setShowModal,
}) {
  const [name, setName] = useState(chat.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(chat.image_url || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);

      if (image) {
        formData.append("image", image);
      }

      const res = await api.post(
        `/api/groups/${chat.id}/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
            <X size={25} />
          </button>
        </div>

        {/* IMAGE UPLOAD */}
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

            {/* ICON BUTTON */}
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700">
              <Camera size={16} />
              <input
                type="file"
                hidden
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

        {/* NAME INPUT */}
        <div>
          <label className="text-sm text-gray-500">Group Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Updating" : "Update"}
          </button>
        </div>

      </div>
    </div>
  );
}