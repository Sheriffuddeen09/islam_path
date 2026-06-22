export default function FromCommunityForward({ msg }) {

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  const getColor = (name = "") => {
    const index =
      (name?.charCodeAt?.(0) || 0) % colors.length;

    return colors[index];
  };

  const getInitial = (name = "") => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  const sourceName =
    msg.forward_source_name || "Forwarded Message";

  const sourceImage =
    msg.forward_source_image;

  const isFromCommunity =
    msg.forward_from_type === "community"; // ✅ key check

  return (
    <div className="overflow-hidden">

      {msg.is_forwarded && isFromCommunity && (
        <div className="flex items-center gap-2 py-2">

          {sourceImage ? (
            <img
              src={sourceImage}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                text-white font-bold text-2xl
                ${getColor(sourceName)}
              `}
            >
              {getInitial(sourceName)}
            </div>
          )}

          <div>
            <div className="text-sm font-semibold text-green-400">
              {sourceName}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}