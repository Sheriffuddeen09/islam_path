// src/pages/LibraryPage.jsx
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { Heart, MessageSquare, Trash2, Loader2, Download } from "lucide-react";
import Navbar from "../../layout/Header";

export default function LibraryPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null); // NEW ✔v
  const [downloading, setDownLoading] = useState(null); // NEW ✔v
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // hide after 3s
  };


  useEffect(() => {
  let mounted = true;

  const fetchLibrary = async () => {
    try {
      const res = await api.get("/api/library", { withCredentials: true });

      if (mounted) {
        setVideos(res.data.videos || []);
      }
    } catch (err) {
      console.error("Library fetch failed:", err);
    } finally {
      if (mounted) {
        setLoading(false); // ✅ THIS WAS MISSING
      }
    }
  };

  fetchLibrary();

  window.addEventListener("focus", fetchLibrary);

  return () => {
    mounted = false;
    window.removeEventListener("focus", fetchLibrary);
  };
}, []);



  const handleRemove = async (videoId) => {
    setDeleteLoading(videoId); // start loading for this video

    try {
      await api.delete(`/api/library/${videoId}`, { withCredentials: true });
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(null); // stop loading
    }
  };

  const handleDownload = async (video) => {
    setDownLoading(true)
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
  finally{
    setDownLoading(false)
  }
};

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

    if (!videos.length) {
    return (
      <div className="p-6 text-center flex flex-col justify-center items-center  text-black text-3xl font-bold">
        Library is Empty.
      </div>
    );
  }
  const content = (
    <div className="p-4 grid grid-cols-1 pt-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {videos.map(video => (
        <div
          key={video.id}
          className="relative border rounded overflow-hidden hover:shadow-xl transition"
        >
          <video
            key={video.id}
            src={video.video_url}
            className="w-full h-40 object-cover bg-black"
            controls
          />

          <div className="p-2 flex flex-col gap-1">
            <h3 className="text-sm font-semibold truncate">{video.title}</h3>
            <p className="text-xs text-gray-500">
              {video.views} views • {video.created_at}
            </p>

            <div className="flex items-center gap-4 mt-1 text-gray-700 text-xs">
             <div className="flex items-center gap-2 mt- text-gray-700 text-xs">
            {video.reactions && Object.entries(video.reactions).map(([emoji,count]) => (
              <span key={emoji} className="flex items-center gap-1">
                {emoji} {count}
              </span>
            ))}
          </div>


              <span className="flex text-black items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                {video.total_comments}
              </span>
            </div>
          </div>

          {/* Delete Button with Loading */}
          <button
            onClick={() => handleRemove(video.id)}
            className="absolute top-2 right-2 p-1 bg-white rounded hover:bg-gray-200"
            title="Remove"
            disabled={deleteLoading === video.id} // disable when loading
          >
            {deleteLoading === video.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </button>

          <button
            onClick={() => handleDownload(video)}
            className="absolute top-2 right-12 p-1 bg-white rounded hover:bg-gray-200"
            title="Download"
           
          >
            {downloading === video.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {content}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}
    </div>
  )
}
