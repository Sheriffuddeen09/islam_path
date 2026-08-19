import React, { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { canvasPreview } from "./mediaHelper";

export default function ImageCrop({
  url,
  onCropDone,
  selectedIndex, setSelectedIndex, croppedImages, setCurrentIndex
}) {
  const imgRef = useRef(null);

  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);

  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } =
      e.currentTarget;

    setCompletedCrop({
      unit: "px",
      x: 0,
      y: 0,
      width: naturalWidth,
      height: naturalHeight,
    });
  };

  const handleDone = async () => {
    if (!imgRef.current) return;

    let cropToUse = completedCrop;

    // No crop selected = use the entire image
    if (
      !cropToUse ||
      !cropToUse.width ||
      !cropToUse.height
    ) {
      cropToUse = {
        unit: "px",
        x: 0,
        y: 0,
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      };
    }

    const blob = await canvasPreview(
      imgRef.current,
      cropToUse
    );

    if (!blob) return;

    onCropDone(blob);
  };

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        w-full
        h-full
        min-h-0
      "
    >

      {/* CROP IMAGE */}
      <div
        className="
          flex
          items-center
          justify-center
          w-full
          flex-1
          min-h-0
          overflow-hidden
        "
      >

        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) =>
            setCompletedCrop(c)
          }
          keepSelection
        >

          <img
            ref={imgRef}
            src={url}
            alt={`Crop Image ${selectedIndex + 1}`}
            onLoad={onImageLoad}
            className="
              block
              max-w-full
              max-h-[40vh]
              sm:max-h-[50vh]
              w-auto
              h-auto
              object-contain flex items-center justify-center
            "
          />

        </ReactCrop>

      </div>


      {/* DONE */}
      <div
  className="
    shrink-0
    mt-3
    flex
    items-center
    justify-center
    gap-4
  "
>
  <h3 className="font-semibold text-sm">
    {croppedImages[selectedIndex]
      ? `Crop ${selectedIndex + 1} Done`
      : `Crop Image ${selectedIndex + 1}`}
  </h3>

  {croppedImages[selectedIndex] ? (
    <>
      {/* CROP AGAIN */}
      <button
        type="button"
        onClick={() => {
          // Keep the same image active for cropping
          setSelectedIndex(selectedIndex);
        }}
        className="
          bg-blue-600
          hover:bg-blue-700
          text-white
          w-9
          h-9
          rounded-lg
          flex
          items-center
          justify-center
          font-semibold
          transition rotate-90
        "
        title="Crop again"
      >
        ✂
      </button>

      {/* DONE */}
      <button
        type="button"
        onClick={() => {
          setCurrentIndex(selectedIndex);
          setSelectedIndex(null);
        }}
        className="
          bg-green-600
          hover:bg-green-700
          text-white
          w-9
          h-9
          rounded-lg
          flex
          items-center
          justify-center
          font-semibold
          transition
        "
        title="Done"
      >
        ✓
      </button>
    </>
  ) : (
    /* FIRST CROP */
    <button
      type="button"
      onClick={handleDone}
      className="
        bg-green-600
        hover:bg-green-700
        text-white
        w-9
        h-9
        rounded-lg
        flex
        items-center
        justify-center
        font-semibold
        transition
      "
      title="Crop image"
    >
      ✂
    </button>
  )}
</div>
    </div>
  );
}