import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { Link } from "react-router-dom";
import ReportForm from "../../report/ReportForm";
import { useAuth } from "../../layout/AuthProvider";

export default function PostOptions({ post }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      `http://localhost:8000/api/download-post/${post.id}`,
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
    link.download = "IPK post.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    showNotification("Downloading post...");
  } catch (err) {
    console.error(err);
    showNotification("Failed to download post!");
  }
};

  const handleSaveToLibrary = async () => {
    try {
      setLoading("save");
      await api.post(`/api/posts/${post.id}/save-to-library`);
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
    showNotification("post link copied!");
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
      title: "Share post", 
      url: `http://localhost:8000/post/${id}` // ✅ public page URL, not API
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
        className="px-1 py-1 text-black rounded hover:text-gray-700 hover:bg-gray-100 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
</svg>

      </button>

      {open && (
        <div className="absolute top-10 right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10">
          <ul className="flex flex-col gap- p-4">
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
        <ReportForm post={post} handleReport={handleReport} />
    </div>
    </div>
  );
}
