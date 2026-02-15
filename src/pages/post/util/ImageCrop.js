import { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { canvasPreview } from "./mediaHelper";

export default function ImageCrop({ url, onCropDone, isLast }) {
  const imgRef = useRef(null);

  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onImageLoad = (e) => {
    setCompletedCrop({
      unit: "px",
      x: 0,
      y: 0,
      width: e.currentTarget.naturalWidth,
      height: e.currentTarget.naturalHeight,
    });
  };

  const handleFinishCrop = async () => {
  if (!imgRef.current) return;

  let cropToUse = completedCrop;

  // If user didn't crop, use full image
  if (!cropToUse || !cropToUse.width || !cropToUse.height) {
    cropToUse = {
      unit: "px",
      x: 0,
      y: 0,
      width: imgRef.current.naturalWidth,
      height: imgRef.current.naturalHeight,
    };
  }

  const blob = await canvasPreview(imgRef.current, cropToUse);
  if (!blob) return;

  const preview = URL.createObjectURL(blob);
  setPreviewUrl(preview);
  onCropDone(blob);
};


  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* CROPPER */}
      <div className="flex items-center justify-center w-full">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          keepSelection
        >
          <img
            ref={imgRef}
            src={url}
            alt="Crop"
            onLoad={onImageLoad}
            className="sm:h-96 h-60 max-w-[80vw] object-cover"
          />
        </ReactCrop>
      </div>

      {/* note */}
      <marquee behavior="scroll" direction="left" scrollamount="6" className="text-xs font-bold mt-4">
      👉 if you click on the Crop & Next without Cropping it will make the image have a black background, 
        to avoid it click the skip button.
      </marquee>
      {/* ACTION BUTTON */}
      <div className="inline-flex items-center gap-3 justify-center mt-4">
      <button
        onClick={handleFinishCrop}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
      >
        {isLast ? "Crop" : "Crop & Next"}
      </button>
      
      <button
        onClick={() => {
          // Send original file/blob without canvas
          fetch(url)
            .then(res => res.blob())
            .then(blob => onCropDone(blob));
        }}
        className="mt-4 bg-gray-500 text-white px-6 py-2 rounded"
      >
        Skip
      </button>
      {/* PREVIEW AFTER CROP absolute top-2 right-2 bg-white p-2 rounded shadow-lg*/}
      {previewUrl && (
        <div className="">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-32 rounded shadow"
          />
        </div>
      )}
      </div>
    </div>
  );
}
