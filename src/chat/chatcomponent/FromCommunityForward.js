export default function FromCommunityForward({ msg }) {

      
    const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-indigo-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-emerald-400",
        "bg-lime-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-fuchsia-400",
        "bg-violet-400",
        "bg-sky-400",
        "bg-slate-400",
        "bg-gray-400",
        "bg-zinc-400",
        "bg-stone-400",
        "bg-neutral-400",
        "bg-red-500",
        "bg-blue-500",
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