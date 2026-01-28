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
    if (!completedCrop || !imgRef.current) return;

    const blob = await canvasPreview(imgRef.current, completedCrop);

    if (!blob) return;

    // preview
    const preview = URL.createObjectURL(blob);
    setPreviewUrl(preview);

    // send to parent
    onCropDone(blob);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* CROPPER */}
      <div className="flex items-center justify-center w-full">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          keepSelection
        >
          <img
            ref={imgRef}
            src={url}
            alt="Crop"
            onLoad={onImageLoad}
            className="sm:h-96 h-60 max-w-[80vw] object-contain"
          />
        </ReactCrop>
      </div>

      {/* ACTION BUTTON */}
      <div className="inline-flex items-center gap-3 justify-center mt-4">
      <button
        onClick={handleFinishCrop}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
      >
        {isLast ? "Crop" : "Crop & Next"}
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
