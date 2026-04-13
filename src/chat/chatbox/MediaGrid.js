import MediaItem from './MediaItem'

export default function MediaGrid({ msg, setPreview }) {
  const files = msg.files || [msg];
  const total = files.length;

  const remaining = total - 3;

  const getUrl = (f) => {
  if (f.file_url?.startsWith("blob:")) return f.file_url;
  if (f.file?.startsWith("blob:")) return f.file;
  if (f.file_url?.startsWith("http")) return f.file_url;
  if (f.file_url) return `http://localhost:8000/storage/${f.file_url}`;
  if (f.file) return `http://localhost:8000/storage/${f.file}`;

  return null;
};

  const openPreview = (index) => {
  const items = files.map((f) => {
    const url = getUrl(f);

    console.log("PREVIEW URL:", url); // 🔥 DEBUG

    return {
      type: f.type || msg.type,
      url,
    };
  });

  setPreview({
    items,
    index,
  });
};

  if (total === 1) {
  return (
    <div className="w-56 h-44 rounded-xl overflow-hidden">
      <MediaItem file={files[0]} index={0} openPreview={openPreview} />
    </div>
  );
}

  if (total === 2) {
  return (
    <div className="w-56 h-44 grid grid-cols-2 gap-1 rounded-xl overflow-hidden">
      {files.map((file, i) => (
        <MediaItem
          key={i}
          file={file}
          index={i}
          openPreview={openPreview}
        />
      ))}
    </div>
  );
}

  return (
  <div className="w-56 rounded-xl overflow-hidden flex flex-col gap-1">
    <div className="w-full h-32">
      <MediaItem
        file={files[0]}
        index={0}
        openPreview={openPreview}
        big
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      {files.slice(1, 3).map((file, i) => {
        const realIndex = i + 1;
        const isLast = realIndex === 2 && total > 3;

        return (
          <div key={realIndex} className="relative">
            <MediaItem
              file={file}
              index={realIndex}
              openPreview={openPreview}
            />

            {isLast && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                +{remaining}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}