import { useState, useCallback, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import Cropper from "react-easy-crop";
import { Check } from "lucide-react";

export default function MediaPreviewModal({
  show,
  files,
  previewUrls,
  caption,
  setCaption,
  onClose,
  onSend,
  crop,setCrop, cropAppliedMap, setCroppedAreaPixels, setCroppedImages, croppedImages, selected, setCropAppliedMap,
  croppedAreaPixels, zoomMap, setZoomMap
}) {
  const [activeIndex, setActiveIndex] = useState(0);
 

  const [showEmoji, setShowEmoji] = useState(false);
  const [isTrimApplied, setIsTrimApplied] = useState(false);
  const videoRef = useRef(null);

  // 🔥 STORE PER FILE SETTINGS image
  const [trimMap, setTrimMap] = useState({});

  const [duration, setDuration] = useState(0);
  const [trim, setTrim] = useState({ start: 0, end: 5 });

  // 🖼 Crop
  const activeFile = files[activeIndex];
  const activeUrl = previewUrls[activeIndex];

   const addEmoji = (emojiData) => {
    setCaption((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };


 const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
  const image = await new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => resolve(img);
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

  // -------------------------
  // 🖼 CROP COMPLETE
  // -------------------------
  const onCropComplete = (_, areaPixels) => {
  setCroppedAreaPixels(areaPixels);
};

  
  const applyCrop = async () => {
  const blob = await getCroppedImg(activeUrl, croppedAreaPixels);

  const croppedFile = new File([blob], "cropped.jpg", {
    type: "image/jpeg",
  });

  setCroppedImages((prev) => ({
    ...prev,
    [activeIndex]: croppedFile,
  }));

  setCropAppliedMap((prev) => ({
    ...prev,
    [activeIndex]: true,
  }));
};
  // -------------------------
  // 🎥 TRIM APPLY
  // -------------------------
  const handleApplyTrim = () => {
    setIsTrimApplied(true);

    if (videoRef.current) {
      videoRef.current.currentTime = trim.start;
    }
  };

  // 🔥 SYNC VIDEO PREVIEW WITH TRIM
  const handleActiveImageChange = (index) => {
  setActiveIndex(index);
};

 useEffect(() => {
  if (files.length > 0) {
    setActiveIndex(0);
  }
}, [files]);

if (!previewUrls?.length || !previewUrls[activeIndex]) {
    return <div className="text-white">No image selected</div>;
  }

 

console.log("activeIndex:", activeIndex);
console.log("previewUrls:", previewUrls);
console.log("current image:", previewUrls?.[activeIndex]);
  if (!show) return null;


  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">

      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center py-2 px-4 text-white">
        <button className="bg-gray-900 rounded-full p-2" onClick={onClose}>
          ✕
        </button>

        <div className="flex gap-4 font-bold text-sm">
          {activeFile?.type.startsWith("image/") && <span>Crop</span>}
          {activeFile?.type.startsWith("video/") && <span>Trim</span>}
        </div>
      </div>

      {/* 🔥 MAIN */}
      <div className="flex-1 flex items-center justify-center relative">

        {/* ================= IMAGE ================= */}
        {activeFile?.type.startsWith("image/") && (
  <div className="relative w-full h-[65vh]  flex items-center justify-center">

          
    {/* 🖼 Cropper */}
    <Cropper
      image={
          previewUrls?.[activeIndex]
            ? previewUrls[activeIndex]
            : ""
      }
      crop={crop}
      zoom={zoomMap[activeIndex] ?? 1}
      aspect={1}
      cropShape="rect"
      showGrid={false}
      onCropChange={setCrop}
      onZoomChange={setZoomMap}
      onCropComplete={onCropComplete}
    />

    {/* 🔥 THIN OVERLAY LINES */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/50" />
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-white/50" />
      <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white/50" />
    </div>

    {/* 🔍 ZOOM SLIDER */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded">
    <div className="inline-flex items-center gap-2">
      <input
        type="range"
        min={1}
        max={3}
        step={0.1}
        value={zoomMap[activeIndex] ?? 1}
        onChange={(e) =>
          setZoomMap((prev) => ({
            ...prev,
            [activeIndex]: Number(e.target.value),
          }))
        }
        className="w-64 h-1 rounded-full"
      />
    </div>

    {/* ✅ APPLY CROP BUTTON */}
    <button
      onClick={applyCrop}
      className={`px-4 py-1 rounded text-white ${
        cropAppliedMap?.[activeIndex] ? "bg-green-700" : "bg-green-600"
      }`}
    >
      {cropAppliedMap?.[activeIndex] ? "Applied ✓" : "Apply Crop"}
    </button>
  </div>
  </div>
)}

        {/* ================= VIDEO ================= */}
        {/* 🎥 VIDEO */}
{activeFile?.type.startsWith("video/") && (
  <div className="w-full flex flex-col items-center text-white">

    {/* VIDEO PREVIEW */}
    <video
      ref={videoRef}
      src={activeUrl}
      controls
      className="max-h-[50vh] rounded"
      onLoadedMetadata={(e) => {
        const dur = e.target.duration;
        setDuration(dur);
        setTrim({ start: 0, end: Math.min(5, dur) });
      }}
    />

    {/* 🔥 TRIM BAR */}
    <div className="w-full px-4 mt-4">

      <div className="relative w-full h-12 bg-gray-800 rounded-lg">

        {/* SELECTED AREA */}
        <div
          className="absolute top-0 h-full bg-green-500/40 rounded"
          style={{
            left: `${(trim.start / duration) * 100}%`,
            width: `${((trim.end - trim.start) / duration) * 100}%`,
          }}
        />

        {/* LEFT HANDLE */}
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trim.start}
          onChange={(e) => {
            const value = Math.min(Number(e.target.value), trim.end - 0.5);
            setTrim((prev) => ({ ...prev, start: value }));
          }}
          className="absolute w-full h-12 bg-transparent appearance-none z-20"
        />

        {/* RIGHT HANDLE */}
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={trim.end}
          onChange={(e) => {
            const value = Math.max(Number(e.target.value), trim.start + 0.5);
            setTrim((prev) => ({ ...prev, end: value }));
          }}
          className="absolute w-full h-12 bg-transparent appearance-none z-10"
        />

        {/* 🎯 CUSTOM HANDLES VISUAL */}
        <div
          className="absolute top-0 w-2 h-full bg-white"
          style={{ left: `${(trim.start / duration) * 100}%` }}
        />

        <div
          className="absolute top-0 w-2 h-full bg-white"
          style={{ left: `${(trim.end / duration) * 100}%` }}
        />
      </div>

      {/* TIME LABEL */}
      <div className="flex justify-between text-xs mt-1 text-gray-300">
        <span>{trim.start.toFixed(1)}s</span>
        <span>{trim.end.toFixed(1)}s</span>
      </div>
    </div>

    {/* ✅ APPLY TRIM BUTTON */}
    <button
      onClick={() => {
        if (videoRef.current) {
          videoRef.current.currentTime = trim.start;
        }
      }}
      className="mt-3 bg-green-600 px-4 py-1 rounded text-sm"
    >
      Apply Trim
    </button>
  </div>
)}      </div>

      {/* 🧩 THUMBNAILS */}
     <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-black/80">
  {files.map((file, i) => (
    <div
      key={i}
      onClick={() => handleActiveImageChange(i)}
      className={`w-16 h-16 relative cursor-pointer border-2 transition-all duration-200 ${
        i === activeIndex
          ? "border-green-500 scale-105"
          : "border-gray-600"
      }`}
    >
      {file.type.startsWith("image/") ? (
        <img
          src={previewUrls[i]}
          className="w-full h-full object-cover"
        />
      ) : (
        <video
          src={previewUrls[i]}
          className="w-full h-full object-cover"
        />
      )}

      {/* OPTIONAL: selected tick indicator */}
      {i === activeIndex && (
        <Check className="absolute top-1 right-1 w-3 h-3 bg-green-800 text-white rounded-full" />
      )}
    </div>
  ))}
</div>
      {/* ✍️ CAPTION */}
      <div className="p-3 bg-gray-900 flex items-center gap-2">
              
              <div className="relative flex-1">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-full px-4 py-3 pr-10 text-sm"
                  placeholder="Write a caption..."
                />
      
                {/* EMOJI BUTTON */}
                <button
                  onClick={() => setShowEmoji((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
      
                </button>
      
                {/* EMOJI PICKER */}
                {showEmoji && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker onEmojiClick={addEmoji} />
                  </div>
                )}
              </div>
      
              {/* SEND */}
              <button
                onClick={() =>
                  onSend({
                    selectedFiles: files.filter((_, i) => selected[i]),
                    cropData: croppedImages,
                    trimData: trimMap,
                  })
                }
                className="bg-green-600 text-white px-4 py-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
      
              </button>
            </div>
        </div>
  );
}