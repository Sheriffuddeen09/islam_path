import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { Check } from "lucide-react";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


export default function MediaPreviewModal({
  show,
  files,
  previewUrls,
  caption,
  setCaption,
  onClose,
  onSend,
  crop,setCrop, cropAppliedMap,  croppedImages, selected, setCropAppliedMap,
  setTrimMap, setDurationMap, trimMap, durationMap, dragType, setDragType,
  setTrimAppliedMap, trimAppliedMap, setCroppedImages
}) {
  const [activeIndex, setActiveIndex] = useState(0);
 

  const [showEmoji, setShowEmoji] = useState(false);
  // Tracks pixel dimensions for drawing on the canvas later
  const [completedCrops, setCompletedCrops] = useState({});

  const videoRef = useRef(null);

  // 🔥 STORE PER FILE SETTINGS image

  // 🖼 Crop
  const activeFile = files[activeIndex];

   const addEmoji = (emojiData) => {
    setCaption((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const duration = durationMap[activeIndex] ?? 0;
  const currentTrim = trimMap[activeIndex] ?? {
    start: 0,
    end: duration,
  };

const handleDrag = (clientX, rect) => {
  if (!dragType) return;

  const percent = Math.min(
    Math.max((clientX - rect.left) / rect.width, 0),
    1
  );

  const time = percent * duration;

  setTrimMap((prev) => {
    const current = prev[activeIndex] || {
      start: 0,
      end: 5,
    };

    let start = current.start;
    let end = current.end;

    if (dragType === "left") {
      start = Math.min(time, end - 0.5);
    }

    if (dragType === "right") {
      end = Math.max(time, start + 0.5);
    }

    if (dragType === "move") {
      const length = end - start;

      start = Math.max(0, time - length / 2);
      end = start + length;

      if (end > duration) {
        end = duration;
        start = duration - length;
      }
    }

    if (videoRef.current) {
      videoRef.current.currentTime = start;
    }

    return {
      ...prev,
      [activeIndex]: { start, end },
    };
  });
};

const trackRef = useRef(null);

useEffect(() => {
  const move = (e) => {
    if (!dragType || !trackRef.current) return;

    const rect =
      trackRef.current.getBoundingClientRect();

    handleDrag(e.clientX, rect);
  };

  const touchMove = (e) => {
    if (!dragType || !trackRef.current) return;

    const rect =
      trackRef.current.getBoundingClientRect();

    handleDrag(
      e.touches[0].clientX,
      rect
    );
  };

  const stop = () => {
    setDragType(null);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);

  window.addEventListener("touchmove", touchMove);
  window.addEventListener("touchend", stop);

  return () => {
    window.removeEventListener(
      "mousemove",
      move
    );

    window.removeEventListener(
      "mouseup",
      stop
    );

    window.removeEventListener(
      "touchmove",
      touchMove
    );

    window.removeEventListener(
      "touchend",
      stop
    );
  };
}, [dragType, duration, activeIndex]);



const isTrimmed =
  currentTrim.start > 0 || currentTrim.end < duration;
  

const handleTimeUpdate = () => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  if (video.currentTime >= currentTrim.end) {
    video.currentTime = currentTrim.start;
  }

  if (video.currentTime < currentTrim.start) {
    video.currentTime = currentTrim.start;
  }
};

const handlePlay = () => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  // 🔥 ALWAYS START FROM TRIM START
  if (video.currentTime < currentTrim.start) {
    video.currentTime = currentTrim.start;
  }

  video.play();
};


const getCroppedImg = (image, crop) => {
  if (!crop || !crop.width || !crop.height) {
    return null;
  }

  const canvas = document.createElement("canvas");

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context missing");
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

  
 const applyCrop = async () => {
  try {
    const activeCrop = crop[activeIndex];

    const imageElement = document.querySelector(
      "img[alt='Source preview']"
    );

    if (!imageElement) {
      alert("Image not found");
      return;
    }

    if (
      !activeCrop ||
      !activeCrop.width ||
      !activeCrop.height
    ) {
      alert("Select crop area first");
      return;
    }

    // GET CROPPED BLOB
    const croppedBlob = await getCroppedImg(
      imageElement,
      activeCrop
    );

    if (!croppedBlob) return;

    // CONVERT BLOB TO FILE
    const croppedFile = new File(
      [croppedBlob],
      `cropped-${Date.now()}.jpg`,
      {
        type: "image/jpeg",
      }
    );

    // SAVE CROPPED FILE
    setCroppedImages((prev) => ({
      ...prev,
      [activeIndex]: croppedFile,
    }));

    // MARK APPLIED
    setCropAppliedMap((prev) => ({
      ...prev,
      [activeIndex]: true,
    }));

  } catch (error) {
    console.error("Crop failed:", error);
  }
};

const getPreviewSrc = (index) => {
  const item = croppedImages?.[index];

  if (item instanceof File || item instanceof Blob) {
    return URL.createObjectURL(item);
  }

  return previewUrls?.[index] || "";
};
  // -------------------------
  // 🎥 TRIM APPLY 
  // -------------------------

  const applyTrim = () => {
  setTrimAppliedMap((prev) => ({
    ...prev,
    [activeIndex]: true,
  }));
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



  if (!show) return null;


  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="flex justify-between items-center py-2 px-4 text-white">
        <button className="bg-gray-900 rounded-full p-2" onClick={onClose}>
          ✕
        </button>
        <div className="flex gap-4 font-bold text-sm">
          {activeFile?.type.startsWith("image/") && <span>Crop</span>}
          {activeFile?.type.startsWith("video/") && <span>Trim</span>}
        </div>
      </div>
     <div className="flex-1 flex  justify-center overflow-hidden">
  {activeFile?.type.startsWith("image/") && (
    <div className="relative w-full max-w-md h-[60vh] bg-black scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-black overflow-y-auto overflow-x-hidden rounded-xl">
      <div className="min-h-full flex items-center justify-center p-4">
      <ReactCrop
        crop={crop?.[activeIndex]} 
        className="green-crop"
        onChange={(c) => {
            setCrop((prev) => ({
              ...prev,
              [activeIndex]: c,
            }));
        }}
         onComplete={(pixelCrop) => {
          setCompletedCrops(prev => ({
            ...prev,
            [activeIndex]: pixelCrop
          }));
        }}
        
        aspect={undefined} 
      >
        <img
          src={getPreviewSrc(activeIndex)}
          alt="Source preview"
          className="max-w-full h-auto object-contain select-none" // Added select-none to avoid native drag glitches
          onLoad={(e) => {
            const { width, height } = e.currentTarget;
            setCrop((prev) => {
            if (prev?.[activeIndex]) return prev;
              return {
                ...prev,
                [activeIndex]: undefined,
              };            
            });
          }}
        />
      </ReactCrop>
    </div>
      {/* Control Action Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={applyCrop}
          className={`px-4 py-1 rounded text-white shadow-md ${
            cropAppliedMap?.[activeIndex] ? "bg-green-700" : "bg-green-600"
          }`}
        >
          {cropAppliedMap?.[activeIndex] ? "Applied ✓" : "Apply Crop"}
        </button>
      </div>
    </div>
  )}


  {activeFile?.type.startsWith("video/") && (
  <div className="w-full flex flex-col items-center text-white">
    <video
      ref={videoRef}
      src={previewUrls[activeIndex]}
      controls
      className="max-h-[50vh] rounded"
      onTimeUpdate={handleTimeUpdate}   // ✅ IMPORTANT onSend
      onPlay={handlePlay}
      onLoadedMetadata={(e) => {
        const dur = e.target.duration;
        setDurationMap((prev) => ({
          ...prev,
          [activeIndex]: dur,
        }));
        setTrimMap((prev) => {
          if (prev[activeIndex]) return prev;
          return {
            ...prev,
            [activeIndex]: {
              start: 0,
              end: dur, // ✅ FULL VIDEO
            },
          };
        });
      }}
    />
    <div className="w-full px-4 mt-4">
     <div
        ref={trackRef}
        className="relative w-full h-8 bg-gray-800 rounded-lg overflow-hidden touch-none"
      >
  <div
    className="absolute top-0 h-full bg-green-500/40"
    style={{
      left: `${(currentTrim.start / duration) * 100}%`,
      width: `${((currentTrim.end - currentTrim.start) / duration) * 100}%`,
    }}
  />
  <div
    onMouseDown={() => setDragType("left")}
    onTouchStart={() => setDragType("left")}
    className="absolute top-0 w-3 h-full bg-white rounded shadow cursor-ew-resize z-30"
    style={{
      left: `${(currentTrim.start / duration) * 100}%`,
      transform: "translateX(-50%)",
    }}
  />
  <div
    onMouseDown={() => setDragType("right")}
    onTouchStart={() => setDragType("right")}
    className="absolute top-0 w-3 h-full bg-white rounded shadow cursor-ew-resize z-30"
    style={{
      left: `${(currentTrim.end / duration) * 100}%`,
      transform: "translateX(-50%)",
    }}
  />
  <div
    onMouseDown={() => setDragType("move")}
    onTouchStart={() => setDragType("move")}
    className="absolute top-0 h-full cursor-grab z-20 touch-none"
    style={{
      left: `${(currentTrim.start / duration) * 100}%`,
      width: `${((currentTrim.end - currentTrim.start) / duration) * 100}%`,
    }}
  />
</div>
    </div>
      <div className="text-center  text-xs text-white">
        {isTrimmed
          ? `${currentTrim.start.toFixed(1)}s — ${currentTrim.end.toFixed(1)}s`
          : "Full video"}
      </div>
    <button
      onClick={applyTrim}
      className={`mt-3 px-4 py-3 z-50 text-center -translate-y-2 rounded text-sm ${
        trimAppliedMap?.[activeIndex]
          ? "bg-green-700"
          : "bg-green-600"
      }`}
    > 
      {trimAppliedMap?.[activeIndex] ? "Applied ✓" : "Apply Trim"}
    </button>
  </div>
)}      </div>
     <div className="flex gap-2 px-3 py-2 bg-black/80">
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
      {i === activeIndex && (
        <Check className="absolute top-1 right-1 w-3 h-3 bg-green-800 text-white rounded-full" />
      )}
    </div>
  ))}
</div>
      <div className="p-3 bg-gray-900 flex items-center gap-2">
              <div className="relative flex-1">
                <textarea
                  rows={1}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-full px-4 py-3 no-scrollbar pr-10 text-sm text-black"
                  placeholder="Write a caption..."
                />
                <button
                  onClick={() => setShowEmoji((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7 text-black z-50">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
      </svg>
                </button>
                {showEmoji && (
                  <div className="absolute bottom-12 right-0 z-50">
                    <EmojiPicker onEmojiClick={addEmoji} />
                  </div>
                )}
              </div>
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