import { useNavigate } from "react-router-dom";

export default function ImageFlex({ media = [], postId }) {
  const navigate = useNavigate();
  const total = media.length;
  if (!total) return null;

  // 1 image
  if (total === 1) {
    return (
      <img
        src={media[0].url}
        className="w-full sm:h-96 h-64 rounded-lg cursor-pointer object-cover"
        onClick={() => navigate(`/post/image/${postId}`)}
      />
    );
  }

  // 2 images
  if (total === 2) {
    return (
      <div className="grid grid-cols-1 gap-2">
        {media.map((img) => (
          <img
            key={img.id}
            src={img.url}
            className="sm:h-96 h-64 w-full cursor-pointer object-cover"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 3 images
  if (total === 3) {
    return (
      <div className="grid grid-cols-1 gap-2">
        <img
          src={media[0].url}
          className="sm:h-96 h-64 w-full cursor-pointer object-cover"
          onClick={() => navigate(`/post/image/${postId}`)}
        />

        {media.slice(1).map((img) => (
          <img
            key={img.id}
            src={img.url}
            className="sm:h-96 h-64 w-full cursor-pointer object-cover"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 4 or more → show ALL (no slice, no remaining)
  return (
    <div className="grid grid-cols-1 gap-2 sm:px-4">
      {media.map((img) => (
        <div
          key={img.id}
          className="relative sm:h-96 h-64 cursor-pointer"
          onClick={() => navigate(`/post/image/${postId}`)}
        >
          <img
            src={img.url}
            className="w-full sm:h-96 h-64 object-cover"
          />
        </div>
      ))}
    </div>
  );
}
