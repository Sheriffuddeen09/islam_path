import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VideoCard({ v }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();

  // Auto play when visible (mobile scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current.play();
          setPlaying(true);
        } else {
          videoRef.current.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = () => {
    videoRef.current.play();
    setPlaying(true);
  };

  const handleMouseLeave = () => {
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setPlaying(false);
  };

  return (
    <div
      className="relative aspect-video bg-black cursor-pointer"
      onClick={() => navigate(`/video/${v.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={v.video_url}
        className="w-full h-64"
        muted
        loop
        playsInline
        controls={playing}   // show controls only when playing
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
