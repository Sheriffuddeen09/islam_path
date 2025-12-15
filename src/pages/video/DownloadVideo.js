import { useEffect, useState } from "react";// your axios instance
import api from "../../Api/axios";

export default function DownloadedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloadedVideos();
  }, []);

  const fetchDownloadedVideos = async () => {
    try {
      const res = await api.get("/api/downloaded-videos"); // your API endpoint
      if (res.data.status) {
        setVideos(res.data.videos);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (video) => {
    // Open API endpoint in a new tab to trigger download
    const link = document.createElement("a");
    link.href = `/api/download-video/${video.id}`;
    link.target = "_blank";
    link.click();

  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="border rounded p-3 shadow">
          {/* Video Preview */}
          <video
            src={video.video_path}
            className="w-full h-48 object-cover rounded cursor-pointer"
            controls
          />

          {/* Video Info */}
          <h3 className="mt-2 font-semibold text-lg">{video.title}</h3>
          <p className="text-sm text-gray-500">{video.category}</p>
          <p className="text-sm text-gray-400">{video.created_at}</p>

          {/* Stats */}
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>👍 {video.total_likes}</span>
            <span>💬 {video.total_comments}</span>
            <span>👁️ {video.total_views}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => handleDownload(video)}
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
