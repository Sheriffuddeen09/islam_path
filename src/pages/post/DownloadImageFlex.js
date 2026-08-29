





export default function DownloadImageFlex({ media = [], downloadSingleImage, progressMap = {} }) {
  if (!media.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2 w-full ">
      {media.map((img) => (
        <div
          key={img.id}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => downloadSingleImage(img)}
        >
          <img
            src={img.url}
            className="w-full sm:w-40 h-32 rounded hover:scale-105"
            alt=""
          />
         
            {/* ✅ Progress bar */}
            {progressMap[img.id] !== undefined && (
              <div className="w-full rounded h-2 mt-2">
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
