import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function VideoCard ({ v }) {
  const [showMore, setShowMore] = useState(false);
   const navigate = useNavigate()
  const text = v.description || "";

  const shortText = text.length > 100 ? text.substring(0, 100) + "..." : text;

  return (
    <div>
      <Link to={`/videos/${v.id}`} className="flex mb-6 cursor-pointer items-center gap-3">
        <span className="text-sm font-semibold">
          {showMore ? text : shortText}
        </span>

        {text.length > 100 && (
          <button
            onClick={(e) => {
              e.preventDefault(); // stop redirect
              setShowMore(!showMore);
            }}
            className="text-blue-600 text-sm cursor-pointer ml-2"
          >
            {showMore ? "Read Less" : "read more"}
          </button>
        )}
      </Link>
      <div className="relative w-full h-96">
        <video
          src={v.video_url}
          className="w-full h-full object-cover rounded cursor-pointer"
          muted
          onClick={() => navigate(`/video/${v.id}`)}
        />

        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center cursor-pointer justify-center">
          <div className="bg-black/50 w-16 h-16 rounded-full cursor-pointer flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            onClick={() => navigate(`/video/${v.id}`)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.259v7.482a1 1 0 001.234.95l6.518-1.879a1 1 0 00.748-.954V12.12a1 1 0 00-.748-.952z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
