export default function MediaItem({ file, index, openPreview }) {
  
  const getUrl = (f) => {
  if (f.file_url?.startsWith("blob:")) return f.file_url;
  if (f.file?.startsWith("blob:")) return f.file;
  if (f.file_url?.startsWith("http")) return f.file_url;
  if (f.file_url) return `http://localhost:8000/storage/${f.file_url}`;
  if (f.file) return `http://localhost:8000/storage/${f.file}`;

  return null;
};

console.log(file);

  const url = getUrl(file);

if (!url) {
  console.warn("❌ No media URL", file);
}
const isVideo = file.type === "video";

  return (
    <div
      className="relative cursor-pointer w-full h-full"
      onPointerDown={(e) => e.stopPropagation()} // 🔥 FIX
      onClick={() => {
        console.log("OPEN PREVIEW", index); // DEBUG
        openPreview(index);
      }}
    >
      {isVideo ? (
        <video
            src={url}
            className="w-full h-full object-cover"
            preload="auto"        // 🔥 CHANGE THIS
            muted
            loop                  // optional (WhatsApp style preview)
            onLoadedData={(e) => {
              e.currentTarget.currentTime = 0.1; // 🔥 FORCE FRAME RENDER
            }}
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}