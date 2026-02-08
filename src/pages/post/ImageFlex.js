import { useNavigate } from "react-router-dom";

export default function ImageFlex({ media = [], postId }) {
  const navigate = useNavigate();
  const total = media.length;

  if (!total) return null;

  // 🟢 1 IMAGE
  if (total === 1) {
    return (
      <img
        src={media[0].url}
        className="w-full sm:h-96 h-64 rounded-lg cursor-pointer"
        onClick={() => navigate(`/post/image/${postId}`)}
      />
    );
  }

  // 🟢 2 IMAGES → 2 columns
  if (total === 2) {
    return (
      <div className="grid grid-cols-1 gap-2">
        {media.map(img => (
          <img
            key={img.id}
            src={img.url}
            className=" sm:h-96 h-64 w-full cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 🟢 3 IMAGES → 1 big + 2 stacked (Facebook style)
  if (total === 3) {
    return (
      <div className="grid grid-cols-1 gap-2">
        <img
          src={media[0].url}
          className="row-span-2 sm:h-96 h-64 w-full cursor-pointer"
          onClick={() => navigate(`/post/image/${postId}`)}
        />

        {media.slice(1).map(img => (
          <img
            key={img.id}
            src={img.url}
            className="sm:h-96 h-64  w-full  cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 🟢 4+ IMAGES
  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <div className="grid grid-cols-1  gap-1 sm:px-4">
      {visible.map((img, index) => {
        const isLast = index === 3 && remaining > 0;

        return (
          <div
            key={img.id}
            className="relative sm:h-96 h-64 cursor-pointer"
            onClick={() => navigate(`/post/image/${postId}`)}
          >
            <img
              src={img.url}
              className="w-full sm:h-96 h-64 border-b-8 pb-1 border-gray-400 "
            />

            
          </div>
        );
      })}
    </div>
  );
}
