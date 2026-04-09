export default function MediaItem({ file, index, openPreview, big = false }) {
  const getUrl = (f) => {
    if (f.file_url?.startsWith("blob:")) return f.file_url;
    if (f.file?.startsWith("blob:")) return f.file;
    return `http://localhost:8000/storage/${f.file_url || f.file}`;
  };

  const url = getUrl(file);
  const isVideo = file.type === "video";

  return (
    <div
      className="relative cursor-pointer w-full h-full"
      onClick={() => openPreview(index)}
    >
      {isVideo ? (
        <video
          src={url}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={url}
          className="w-full h-full object-cover"
        />
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 text-white p-2 rounded-full">
            ▶
          </div>
        </div>
      )}
    </div>
  );
}