import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function PostVideoCardLibrary({ v, post }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();

  // Auto play when + visible (mobile scroll)
 useEffect(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!videoRef.current) return;

      if (entry.isIntersecting) {
        videoRef.current.play().catch(() => {});
        setPlaying(true);
      } else {
        if (!videoRef.current.paused) {
          videoRef.current.pause();
        }
        setPlaying(false);
      }
    },
    { threshold: 0.6 }
  );

  if (videoRef.current) observer.observe(videoRef.current);
  return () => observer.disconnect();
}, []);

  const handleMouseEnter = () => {
    videoRef.current?.play();
    setPlaying(true);
  };

  const handleMouseLeave = () => {
    videoRef.current?.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  };

  const viewedRef = useRef(false);

const onPlay = async () => {
  if (viewedRef.current) return;
  viewedRef.current = true;
  await api.post(`/api/post/${post.id}/view`);
};


  return (
    <div
      key={v.id}
      className="relative rounded-lg  aspect-video bg-black cursor-pointer"
      onClick={() => navigate(`/post/video/${post.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={v.url}
        className="w-full h-48"
        muted
        playsInline
        onPlay={onPlay}
      />

      {/* Play icon (only when NOT playing) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-white bg-black/60 rounded-full p-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
