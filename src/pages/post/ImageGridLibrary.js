import { useNavigate } from "react-router-dom";
import api from "../../Api/axios";

export default function ImageGridLibrary({ media = [], postId }) {
  const navigate = useNavigate();
  const total = media.length;

  if (!total) return null;

 const getSrc = (img) => `http://localhost:8000/storage/${img.path}`;


  if (total === 1) {
    return (
      <img
        src={getSrc(media[0])}
        className="w-full h-40 rounded-lg object-cover cursor-pointer"
        onClick={() => navigate(`/post/image/${postId}`)}
      />
    );
  }

  if (total === 2) {
    return (
      <div className="grid grid-cols-2 gap-1 overflow-hidden">
        {media.map(img => (
          <img
            key={img.id}
            src={getSrc(img)}
            className="h-32 w-full rounded-lg object-cover cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  if (total === 3) {
    return (
      <div className="grid grid-cols-2 gap-1 overflow-hidden">
        <img
          src={getSrc(media[0])}
          className="row-span-2 w-full h-full rounded-lg object-cover cursor-pointer"
          onClick={() => navigate(`/post/image/${postId}`)}
        />
        {media.slice(1).map(img => (
          <img
            key={img.id}
            src={getSrc(img)}
            className="h-32 w-full rounded-lg object-cover cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <div className="grid grid-cols-2 gap-1 overflow-hidden">
      {visible.map((img, index) => {
        const isLast = index === 3 && remaining > 0;

        return (
          <div
            key={img.id}
            className="relative h-24 cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          >
            <img
              src={getSrc(img)}
              className="w-full h-full rounded-lg object-cover"
            />
            {isLast && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <span className="text-white text-2xl font-bold">+{remaining}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
