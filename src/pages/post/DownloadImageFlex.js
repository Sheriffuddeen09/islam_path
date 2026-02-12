export default function DownloadImageFlex({ media = [], downloadSingleImage, progressMap = {} }) {
  if (!media.length) return null;

  return (
    <div className="">
      {media.map((img) => (
        <div
          key={img.id}
          className="flex  flex-col items-center gap-3 p-2 justify-center cursor-pointer"
          onClick={() => downloadSingleImage(img)}
        >
          <img
            src={img.url}
            className="w-full h-40 rounded hover:scale-105"
            alt=""
          />
         
            {/* ✅ Progress bar */}
            {progressMap[img.id] !== undefined && (
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${progressMap[img.id]}%` }}
                />
              </div>
            )}
          </div>
       
      ))}
    </div>
  );
}
