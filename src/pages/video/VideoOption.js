import { useState } from "react";
import api from "../../Api/axios";

export default function VideoOptions({ video }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // hide after 3s
  };

  const handleDownload = () => {
    window.location.href = `/api/videos/${video.id}/download`;
    showNotification("Downloading video...");
  };

  const handleSaveToLibrary = async () => {
    try {
      setLoading("save");
      await api.post(`/api/videos/${video.id}/save-to-library`);
      showNotification("Saved to your library!");
    } catch (err) {
      console.error(err);
      showNotification("Failed to save to library!");
    } finally {
      setLoading("");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showNotification("Video link copied!");
  };

  const handleReport = () => {
    showNotification("Video reported as inappropriate!");
  };

  const handleViewProfile = () => {
    window.location.href = `/profile/${video.user.id}`;
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-2 text-black rounded hover:text-gray-700 hover:bg-gray-200 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
</svg>

      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-50">
          <ul className="flex flex-col gap-2 p-2">
            <li>
              <button onClick={handleDownload}>Download</button>
            </li>
            <li>
              <button onClick={handleSaveToLibrary} disabled={loading === "save"}>
                {loading === "save" ? "Saving..." : "Save to Library"}
              </button>
            </li>
            <li>
              <button onClick={handleCopyLink}>Copy Link</button>
            </li>
            <li>
              <button onClick={handleReport} className="text-red-600">Report</button>
            </li>
            <li>
              <button onClick={handleViewProfile}>View Poster Profile</button>
            </li>
          </ul>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
}
