import { useState } from "react";
import api from "../../Api/axios";
import { Link } from "react-router-dom";
import ReportForm from "../../report/ReportForm";
import { useAuth } from "../../layout/AuthProvider";

export default function VideoOptionsId({ video }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const [notification, setNotification] = useState("");
  const [shares, setShares] = useState({});
  const [openReport, setOpenReport] = useState(false)
  const {user} = useAuth()
  
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // hide after 3s
  };

 const handleDownload = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/download-video/${video.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // ✅ FORCE DEFAULT FILE NAME
    link.download = "IPK video.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    showNotification("Downloading video...");
  } catch (err) {
    console.error(err);
    showNotification("Failed to download video!");
  }
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


  const handleViewProfile = () => {
    window.location.href = `/profile/${user.id}`;
  };

  const handleOption = () =>{
    setOpen(!open)
  }

 const handleShare = (id) => {
  setShares((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

  if (navigator.share) {
    navigator.share({ 
      title: "Share Video", 
      url: `http://localhost:8000/video/${id}` // ✅ public page URL, not API
    })
    .catch((err) => console.error("Share failed:", err));
  } else {
    alert("Sharing not supported on this device.");
  }
};

const handleReport = () =>{
  setOpenReport(!openReport)
}
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="px- py- text-black rotate rounded hover:text-gray-700 hover:bg-gray-600 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 text-white">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
    </svg>

      </button>

      {open && (
        <div className="fixed -top-0 flex flex-col justify-center mx-auto right-0 h-80  mt-2 w-80 sm:w-96 bg-white border rounded shadow-lg z-10">
          <ul className="flex flex-col gap- p-4 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onClick={handleOption} class="size-6 cursor-pointer absolute top-0 right-6 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

            <li>
              <button onClick={ () => {handleDownload(); handleOption()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2  hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >Download</button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleSaveToLibrary()}} disabled={loading === "save"} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >
                {loading === "save" ? "Saving..." : "Save to Library"}
              </button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleCopyLink()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >Copy Link</button>
            </li>
            <li>

              <button onClick={() => {handleOption(); handleReport()}} className="flex items-center font-bold text-[15px] text-blue-800 gap-2 w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >Report</button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleShare()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >Share</button>
            </li>
            <li>
              <button onClick={() => {handleOption(); handleViewProfile()}} className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
              >View Poster Profile</button>
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
    <div className={`w-full h-full  fixed inset-0 bg-black bg-opacity-70 z-50 ${openReport ? 'block' : 'hidden'}`}>
        <ReportForm video={video} handleReport={handleReport} />
    </div>
    </div>
  );
}
