import api from "../../Api/axios";
import imagePost from '../post/image/image.jpg'
import "rc-slider/assets/index.css";
import ImageCrop from "./util/ImageCrop";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CreateReelModal from "./CreateReelModal";


export default function CreateReel({handlePostCreated, setCreateReel}) {
  const [text, setText] = useState("");

  const [images, setImages] = useState([]);          // original files
  const [croppedImages, setCroppedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoTrim, setVideoTrim] = useState({
    start: 0,
    end: 0,
  });
  const [trimApplied, setTrimApplied] = useState(false);
  const [dragType, setDragType] = useState(null);
  const videoRef = useRef(null);
  const trackRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [visibility, setVisibility] = useState("public");

  const [selected,setSelected] = useState(null); 


  const applyTrim = () => {

  if (!video) {
    toast.error(
      "Please select a video first."
    );
    return;
  }

  if (!videoDuration) {
    toast.error(
      "Video duration is not ready yet."
    );
    return;
  }

  if (
    videoTrim.start < 0 ||
    videoTrim.end > videoDuration ||
    videoTrim.end <= videoTrim.start
  ) {
    toast.error(
      "Please select a valid video range."
    );
    return;
  }

  setTrimApplied(true);

  toast.success(
    "Video trim applied."
  );
};

  const handleVideoUpload = (file) => {
  if (!file) return;

  if (video) {
    toast.error(
      "You can only upload one video per post."
    );
    return;
  }

  const maxSize =
    50 * 1024 * 1024; // 50MB

  if (file.size > maxSize) {
    toast.error(
      "Video must not exceed 50MB."
    );
    return;
  }

  setVideo(file);

  const previewUrl =
    URL.createObjectURL(file);

  setVideoPreview(previewUrl);

  setVideoDuration(0);

  setVideoTrim({
    start: 0,
    end: 0,
  });

  setTrimApplied(false);

  setShowTrimModal(true);
  setSelected(null);
};

useEffect(() => {
  return () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
  };
}, [videoPreview]);

const handleCropDone = (blob) => {
  const file = new File(
    [blob],
    `image-${selectedIndex}.jpg`,
    {
      type: "image/jpeg",
    }
  );

  setCroppedImages((prev) => {
    const updated = [...prev];

    updated[selectedIndex] = file;

    return updated;
  });

};


const handleVideoLoadedMetadata = (e) => {
  const duration =
    e.currentTarget.duration;

  if (!duration || !isFinite(duration)) {
    toast.error(
      "Unable to read video duration."
    );
    return;
  }

  setVideoDuration(duration);

  setVideoTrim({
    start: 0,
    end: duration,
  });

  setTrimApplied(false);
};


const handleDrag = (clientX, rect) => {
  if (!dragType || !videoDuration) {
    return;
  }

  const percent = Math.min(
    Math.max(
      (clientX - rect.left) /
        rect.width,
      0
    ),
    1
  );

  const time =
    percent * videoDuration;

  setVideoTrim((current) => {

    let start = current.start;
    let end = current.end;

    if (dragType === "left") {
      start = Math.min(
        time,
        end - 0.5
      );
    }

    if (dragType === "right") {
      end = Math.max(
        time,
        start + 0.5
      );
    }

    if (dragType === "move") {

      const length =
        end - start;

      start = Math.max(
        0,
        time - length / 2
      );

      end =
        start + length;

      if (end > videoDuration) {

        end = videoDuration;

        start =
          videoDuration - length;
      }
    }

    if (videoRef.current) {
      videoRef.current.currentTime =
        start;
    }

    return {
      start,
      end,
    };
  });
  setTrimApplied(false);
};

useEffect(() => {

  const handleMouseMove = (e) => {

    if (
      !dragType ||
      !trackRef.current
    ) {
      return;
    }

    const rect =
      trackRef.current.getBoundingClientRect();

    handleDrag(
      e.clientX,
      rect
    );
  };


  const handleTouchMove = (e) => {

    if (
      !dragType ||
      !trackRef.current
    ) {
      return;
    }

    const rect =
      trackRef.current.getBoundingClientRect();

    handleDrag(
      e.touches[0].clientX,
      rect
    );
  };


  const stopDragging = () => {
    setDragType(null);
  };


  window.addEventListener(
    "mousemove",
    handleMouseMove
  );

  window.addEventListener(
    "mouseup",
    stopDragging
  );

  window.addEventListener(
    "touchmove",
    handleTouchMove
  );

  window.addEventListener(
    "touchend",
    stopDragging
  );


  return () => {

    window.removeEventListener(
      "mousemove",
      handleMouseMove
    );

    window.removeEventListener(
      "mouseup",
      stopDragging
    );

    window.removeEventListener(
      "touchmove",
      handleTouchMove
    );

    window.removeEventListener(
      "touchend",
      stopDragging
    );

  };

}, [dragType, videoDuration]);


const isTrimmed =
  videoDuration > 0 &&
  (
    videoTrim.start > 0 ||
    videoTrim.end < videoDuration
  );


  const handleTimeUpdate = () => {

  if (!videoRef.current) {
    return;
  }

  const video =
    videoRef.current;

  if (
    video.currentTime >=
    videoTrim.end
  ) {
    video.currentTime =
      videoTrim.start;
  }

  if (
    video.currentTime <
    videoTrim.start
  ) {
    video.currentTime =
      videoTrim.start;
  }
};


const handlePlay = () => {

  if (!videoRef.current) {
    return;
  }

  const video =
    videoRef.current;

  if (
    video.currentTime <
      videoTrim.start ||
    video.currentTime >=
      videoTrim.end
  ) {
    video.currentTime =
      videoTrim.start;
  }

  video.play();
};

const removeVideo = () => {

  if (videoPreview) {
    URL.revokeObjectURL(
      videoPreview
    );
  }

  setVideo(null);
  setVideoPreview(null);

  setVideoDuration(0);

  setVideoTrim({
    start: 0,
    end: 0,
  });

  setTrimApplied(false);

  setShowTrimModal(false);
};

  const handleSelectImage = (index) => {
    setSelectedIndex(index);
  };

const handleSelectImages = (files) => {
  const selectedFiles = Array.from(files);

  if (!selectedFiles.length) {
    toast.error("Please select at least one image.", "error");
    return;
  }

  setImages(selectedFiles);
  setCroppedImages([]);

  setCurrentIndex(0);

  setSelectedIndex(null);

  setSelected(null);
  setShowCrop(true);

};

const submitPost = async () => {

  const finalImages = images.map(
    (image, index) =>
      croppedImages[index] || image
  );


  if (
    !text &&
    finalImages.length === 0 &&
    !video
  ) {

    toast.error(
      "Please add some text, an image, or a video."
    );

    return;
  }


  if (
    finalImages.length > 0 &&
    video
  ) {

    toast.error(
      "You can upload images OR a video, not both."
    );

    return;
  }


  const formData =
    new FormData();


  formData.append(
    "visibility",
    visibility
  );


  if (text) {

    formData.append(
      "content",
      text
    );

  }


  finalImages.forEach((file) => {

    formData.append(
      "images[]",
      file
    );

  });


  if (video) {

    formData.append(
      "video",
      video
    );

    if (trimApplied) {

      formData.append(
        "trim_start",
        String(videoTrim.start)
      );

      formData.append(
        "trim_end",
        String(videoTrim.end)
      );

    }

  }


  setLoading(true);
  try {

    const res =
      await api.post(
        "/api/posts",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },

        }
      );


    handlePostCreated?.(
      res.data.post
    );


    toast.success(
      "Uploaded successfully!"
    );


    // RESET

    setText("");

    setImages([]);

    setCroppedImages([]);

    setSelectedIndex(null);


    if (videoPreview) {

      URL.revokeObjectURL(
        videoPreview
      );

    }

    setVideo(null);

    setVideoPreview(null);

    setVideoDuration(0);

    setVideoTrim({
      start: 0,
      end: 0,
    });

    setTrimApplied(false);

    setShowTrimModal(false);

    setShowVisibilityModal(false);

  } catch (err) {

    console.error(err);

    toast.error(
      err.response?.data?.message ||
      err.response?.data?.errors?.images?.[0] ||
      err.response?.data?.errors?.video?.[0] ||
      "Upload failed."
    );


  } finally {

    setLoading(false);

  }

};

  return (

    <div className="sm:px-6 px-2 lg:ml-64 max-w-3xl mx-auto">


      <CreateReelModal text={text} setText={setText} showVisibilityModal={showVisibilityModal} 
      setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
      handleSelectImages={handleSelectImages} imagePost={imagePost} video={video} images={images}
      visibility={visibility} setVisibility={setVisibility} handleVideoUpload={handleVideoUpload}
      selected={selected} setSelected={setSelected} setCreateReel={setCreateReel} />

      {showCrop && images.length > 0 && (
   <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">

    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        w-full
        h-full
        sm:w-[90vw]
        sm:h-[96vh]
        sm:max-w-5xl
        rounded-xl
        relative
        p-4
        flex
        flex-col flex items-center justify-center
        overflow-y-auto scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">

      <button
        onClick={() => setShowCrop(false)}
        className="absolute top-3 right-3 p-2 rounded-full"
      >
        ✕
      </button>
      <div className="border border-green-500 sm:h-96 w-80 sm:w-96 w-full flex 
      items-center justify-center rounded-xl py-2 px-4 mb-6">

  {selectedIndex !== null ? (
    <ImageCrop
      url={URL.createObjectURL(
        croppedImages[selectedIndex] ||
        images[selectedIndex]
      )}
      onCropDone={handleCropDone}
      selectedIndex={selectedIndex}
      setCurrentIndex={setCurrentIndex}
      croppedImages={croppedImages}
      setSelectedIndex={setSelectedIndex}
    />

  ) : (

    <div className="flex flex-col items-center justify-center h-full">

      <img
        src={URL.createObjectURL(
          croppedImages[currentIndex] ||
          images[currentIndex]
        )}
        alt={`Image ${currentIndex + 1}`}
        className="
          max-w-full
          max-h-[55vh]
          object-contain
          rounded-xl
        "
      />

      {/* CROP IMAGE BUTTON */}
      <button
        type="button"
        onClick={() => {
          setSelectedIndex(currentIndex);
        }}
        className="
          mt-2
          bg-green-600
          hover:bg-green-700
          text-white
          px-6
          py-2 text-sm
          rounded-lg
          font-semibold
          transition
        "
      >
        Crop Image
      </button>

    </div>

  )}

</div>


  <div className="flex flex-row border-b pb-2 overflow-y-auto flex items-center justify-center w-[90%] max-w-3xl
            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin gap-3 mb-6">

    {images.map((image, index) => {
      const isSelected = selectedIndex === index;
      const isCropped = !!croppedImages[index];

      return (
        <div
          key={index}
          onClick={() => handleSelectImage(index)}
          className={`
            relative cursor-pointer rounded-xl
            border-2 transition-all duration-200
            ${
              isSelected
                ? "border-green-500 ring-2 ring-green-200"
                : "border-gray-200 hover:border-green-400"
            }
          `}
        >
          <img
            src={URL.createObjectURL(
              croppedImages[index] || image
            )}
            alt={`Selected ${index + 1}`}
            className="w-20 h-10 sm:h-16 object-cover"
          />

          {/* SELECTED INDICATOR */}
          {isSelected && (
            <div className="absolute inset-0 bg-green-500/10 flex items-start justify-end p-1">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                ✓
              </span>
            </div>
          )}

          {/* CROPPED INDICATOR */}
          {isCropped && !isSelected && (
            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Cropped
            </div>
          )}
        </div>
      );
    })}

  </div>


  {/* CROP AREA */}
  

  {/* SUBMIT */}
  <div
        className="
          shrink-0
          flex
          justify-end
          absolute bottom-3 right-6
          pt-3
          
        "
      >

        <button
          type="button"
          onClick={() => {setShowVisibilityModal(true)}}
          disabled={images.length === 0}
          className="
            bg-green-600
            hover:bg-green-700
            disabled:bg-gray-400
            text-white
            px-8
            py-3
            rounded-lg
            font-semibold
          "
        >
          Submit
        </button>

      </div>
</div>
  </div>
)} 

{showTrimModal && video && (
  <div
    className="
      fixed
      inset-0
      z-40
      bg-black/70
      flex
      items-center
      justify-center
      p-4
    "
  >

    <div
      className="
        relative
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        w-full
        max-w-2xl
        max-h-[95vh]
        overflow-y-auto
        rounded-2xl
        shadow-2xl
        p-5
      "
    >

      {/* CLOSE */}

      <button
        type="button"
        onClick={() => {
          setShowTrimModal(false);
        }}
        className="
          absolute
          top-3
          right-3
          z-20
          w-9
          h-9
          rounded-full
          bg-gray-200
          text-black
          flex
          items-center
          justify-center
          hover:bg-gray-300
        "
      >
        ✕
      </button>


      {/* TITLE */}

      <div className="mb-4">

        <h2 className="text-xl font-bold">
          {trimApplied
            ? "Video Trimmed"
            : "Trim Video"}
        </h2>

        <p className="text-sm  mt-1">
          Drag the handles to select
          the part of the video you
          want to upload.
        </p>

      </div>


      {/* VIDEO */}

      <div
        className="
          w-full
          flex
          items-center
          justify-center
          bg-black
          rounded-xl
          overflow-hidden
        "
      >

        <video
          ref={videoRef}
          src={videoPreview}
          controls
          playsInline
          className="
            w-full
            max-h-[45vh]
            object-contain
          "
          onLoadedMetadata={
            handleVideoLoadedMetadata
          }
          onTimeUpdate={
            handleTimeUpdate
          }
          onPlay={
            handlePlay
          }
        />

      </div>


      {/* TRIM SECTION */}

      {videoDuration > 0 && (

        <div className="mt-5">

          {/* TRACK */}

          <div
            ref={trackRef}
            className="
              relative
              w-full
              h-10
              bg-gray-800
              rounded-xl
              overflow-hidden
              touch-none
              select-none
            "
          >

            {/* SELECTED RANGE */}

            <div
              className="
                absolute
                top-0
                h-full
                bg-green-500/40
                border-x-2
                border-green-500
              "
              style={{
                left:
                  `${
                    (
                      videoTrim.start /
                      videoDuration
                    ) * 100
                  }%`,

                width:
                  `${
                    (
                      (
                        videoTrim.end -
                        videoTrim.start
                      ) /
                      videoDuration
                    ) * 100
                  }%`,
              }}
            />


            {/* LEFT HANDLE */}

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setDragType("left");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setDragType("left");
              }}
              className="
                absolute
                top-0
                w-4
                h-full
                bg-white
                rounded-md
                shadow-lg
                cursor-ew-resize
                z-30
              "
              style={{
                left:
                  `${
                    (
                      videoTrim.start /
                      videoDuration
                    ) * 100
                  }%`,

                transform:
                  "translateX(-50%)",
              }}
            />


            {/* RIGHT HANDLE */}

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setDragType("right");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setDragType("right");
              }}
              className="
                absolute
                top-0
                w-4
                h-full
                bg-white
                rounded-md
                shadow-lg
                cursor-ew-resize
                z-30
              "
              style={{
                left:
                  `${
                    (
                      videoTrim.end /
                      videoDuration
                    ) * 100
                  }%`,

                transform:
                  "translateX(-50%)",
              }}
            />


            {/* MOVE SELECTED RANGE */}

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setDragType("move");
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                setDragType("move");
              }}
              className="
                absolute
                top-0
                h-full
                cursor-grab
                active:cursor-grabbing
                z-20
                touch-none
              "
              style={{
                left:
                  `${
                    (
                      videoTrim.start /
                      videoDuration
                    ) * 100
                  }%`,

                width:
                  `${
                    (
                      (
                        videoTrim.end -
                        videoTrim.start
                      ) /
                      videoDuration
                    ) * 100
                  }%`,
              }}
            />

          </div>


          {/* TIME */}

          <div
            className="
              text-center
              text-sm
              font-semibold
              mt-3
            "
          >

            {isTrimmed
              ? `${videoTrim.start.toFixed(1)}s — ${videoTrim.end.toFixed(1)}s`
              : "Full video"}

          </div>


          {/* BUTTONS */}

          <div
            className="
              flex
              items-center
              justify-between flex wrap
              gap-3
              mt-5
            "
          >

            {/* REMOVE */}

            <button
              type="button"
              onClick={removeVideo}
              className="
                sm:px-4 px-2 text-sm
                sm:py-2 py-1
                rounded-lg
                bg-red-500
                hover:bg-red-600
                text-white
                font-semibold
              "
            >
              Remove
            </button>


            <div className="flex gap-3">

              {/* APPLY */}

              <button
                type="button"
                onClick={applyTrim}
                className={`
                  sm:px-5 px-2 text-sm
                  sm:py-2 py-1
                  rounded-lg
                  text-white
                  font-semibold
                  transition

                  ${
                    trimApplied
                      ? "bg-green-700"
                      : "bg-green-600 hover:bg-green-700"
                  }
                `}
              >

                {trimApplied
                  ? "Trimmed ✓"
                  : "Apply Trim"}

              </button>


              {/* SUBMIT */}

               <button
          type="button"
          onClick={() => {setShowVisibilityModal(true); setShowTrimModal(false);}}
          disabled={video.length === 0}
          className="
            bg-green-600
            hover:bg-green-700
            disabled:bg-gray-400
            text-white
            sm:px-8 px-2 text-sm
            sm:py-3 py-1
            rounded-lg
            font-semibold
          "
        >
          Submit
        </button>

            </div>

          </div>

        </div>

      )}

    </div>

  </div>
)}


{showVisibilityModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-[var(--bg-color)] text-[var(--text-color)] sm:w-96 w-full rounded-xl p-6  shadow-xl">
      <h2 className="text-lg font-semibold mb-4">
        Who can see your post?
      </h2>

      <div className="space-y-3">

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="public"
            checked={visibility === "public"}
            onChange={() => setVisibility("public")}
          />
          <div>
            <p className="font-medium">Public</p>
            <p className="text-xs">
              Everyone can see this post
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="friends"
            checked={visibility === "friends"}
            onChange={() => setVisibility("friends")}
          />
          <div>
            <p className="font-medium">Friends</p>
            <p className="text-xs">
              Only accepted friends
            </p>
          </div>
        </label>

      </div>

      {/* Submit Button INSIDE modal */}
      <button
        onClick={submitPost}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
       
       {loading ? <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className=""
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className=""
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg> : "Post"}


      </button>

      <button
        onClick={() => setShowVisibilityModal(false)}
        className="mt-3 w-full bg-gray-600 py-2 rounded-lg"
      >
        Cancel
      </button>

    </div>
  </div>
)}

        </div>
  );
}