// src/components/VideoCard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate} from "react-router-dom";
import api from "../Api/axios";

export default function VideoCard({ onDelete, video }) {
  const [showMore, setShowMore] = useState(false);
  const [showUsersPopup, setShowUsersPopup] = useState(false);
  const [notification, setNotification] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate()


  const deleteVideo = (id) => {
  return api.delete(`/api/videos/${id}`, {
    withCredentials: true,
  });
};

const handleDelete = async () => {
  if (deleting) return;

  try {
    setDeleting(true);

    await deleteVideo(video.id);
    onDelete(video.id);

    setNotification({ type: "success", text: "Video deleted successfully" });
  } catch (err) {
    setNotification({ type: "error", text: "Failed to delete video" });
  } finally {
    setDeleting(false);
    setTimeout(() => setNotification(null), 3000);
  }
};


  const text = video.description || "";
  const shortText = text.length > 45 ? text.substring(0, 45) + "..." : text;


  const  handleDeletePop = () =>{
    setShowUsersPopup(!showUsersPopup)
  }

  
  return (

  <div className="bg-white rounded-xl overflow-hidden">
     <Link
          to={`/video/${video.id}`}
          className="text-blue-600 hover:underline text-xs"
        >
    <div
      className="relative aspect-video bg-black cursor-pointer"
      onClick={() => navigate(`/video/${video.id}`)}
    >
      <video
        src={video.video_url}
        className="w-full h-full object-cover"
        muted
      />

      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/60 rounded-full p-">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24" 
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
</Link>
    {/* Content */}
    <div className="p-4">
      {/* Meta */}
      <div className="flex justify-between items-center ">
       <div className="text-xs text-gray-500 flex gap-2">
        <span>{video.views_count || 0} views</span>
        <span>•</span>
        <span>{video.time_ago}</span>
      </div>

      </div>

      {/* Description */}
      <p className="text-xs text-gray-700 mt-2">
        {showMore ? text : shortText}
        {text.length > 50 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMore(!showMore);
            }}
            className="text-blue-600 ml-1"
          >
            {showMore ? "Read less" : "Read more"}
          </button>
        )}
      </p>

      {/* Stats */}
      <div className="flex items-center border-t py-2 justify-between mt-4 -mb-2 text-sm text-gray-600">
        <div className="flex items-center gap-4">
         <span className="flex items-center gap-2">
            {video.reaction_counts &&
                Object.entries(video.reaction_counts).map(([emoji, count]) => (
                <span key={emoji}>
                    {emoji} {count}
                </span>
                ))}
            </span>

           <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg> {video.comments_count}
          </span>
        </div>

        <svg onClick={handleDeletePop} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-red-800 hover:text-red-900 cursor-pointer">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>

      </div>
    </div>

    {
}
{showUsersPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
    <div className="bg-gray-200 text-red-700 p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
      <span>Are you sure you want to delete this video?</span>

      <div className="flex gap-3 justify-center">
        {/* CONFIRM */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1 bg-red-600 text-white rounded flex items-center justify-center"
        >
          {deleting ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>

          )}
        </button>

        {/* CANCEL */}
        <button
          onClick={() => setShowUsersPopup(false)}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

        </button>
      </div>
    </div>
  </div>
)}

    {notification && (
        <div
            className={`fixed top-4 right-4 px-4 py-2 rounded text-white text-sm
            ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
            {notification.text}
        </div>
        )}

  </div>
);


}