import { useNavigate } from "react-router-dom";

export default function ImageGrid({ media = [], postId }) {
  const navigate = useNavigate();
  const total = media.length;

  if (!total) return null;

  // 🟢 1 IMAGE
  if (total === 1) {
    return (
      <img
        src={media[0].url}
        className="w-full h-64 rounded-lg cursor-pointer"
        onClick={() => navigate(`/post/${postId}`)}
      />
    );
  }

  // 🟢 2 IMAGES → 2 columns
  if (total === 2) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {media.map(img => (
          <img
            key={img.id}
            src={img.url}
            className="h-64 w-full rounded-lg cursor-pointer"
            onClick={() => navigate(`/post/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 🟢 3 IMAGES → 1 big + 2 stacked (Facebook style)
  if (total === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5">
        <img
          src={media[0].url}
          className="row-span-2 h-full w-full rounded-lg cursor-pointer"
          onClick={() => navigate(`/post/${postId}`)}
        />

        {media.slice(1).map(img => (
          <img
            key={img.id}
            src={img.url}
            className="h-32  w-full rounded-lg cursor-pointer"
            onClick={() => navigate(`/post/${postId}`)}
          />
        ))}
      </div>
    );
  }

  // 🟢 4+ IMAGES
  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <div className="grid grid-cols-2 gap-1 px-4">
      {visible.map((img, index) => {
        const isLast = index === 3 && remaining > 0;

        return (
          <div
            key={img.id}
            className="relative h-40 cursor-pointer"
            onClick={() => navigate(`/post/${postId}`)}
          >
            <img
              src={img.url}
              className="w-full h-full rounded-lg"
            />

            {isLast && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                <span className="text-white text-3xl font-bold">
                  +{remaining}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
