import Notification from "../../Form/Notification";
import api from "../../Api/axios";
import imagePost from './image/image.jpg'
import videoPost from './image/video.png'
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ImageCrop from "./util/ImageCrop";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useRef, useState } from "react";


export default function CreatePost({handlePostCreated}) {
  const [text, setText] = useState("");

  const [images, setImages] = useState([]);          // original files
  const [croppedImages, setCroppedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCrop, setShowCrop] = useState(false);


  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoStart, setVideoStart] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnd, setVideoEnd] = useState(10);

  const ffmpegRef = useRef(
  createFFmpeg({
    log: true,
    corePath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
  })
);

  const [ffmpegReady, setFfmpegReady] = useState(false);


  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState({ message: "", type: "" });

  const showNotification = (msg) => {
    setNotify({ message: msg, type: "error" });

      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };


  // VIDEO SELECT
  const handleVideo = (file) => {
    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setImages(null);
    setCroppedImages(null);
  };


  const handleSelectImages = (files) => {
  setImages(Array.from(files));
  setCroppedImages([]);
  setCurrentIndex(0);
  setShowCrop(true);
};


const loadFFmpeg = async () => {
  if (ffmpegRef.current.isLoaded()) return;
  await ffmpegRef.current.load();
};



  // APPLY VIDEO TRIM
  const applyVideoTrim = async () => {
  const ffmpeg = ffmpegRef.current;

  await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video));

  await ffmpeg.run(
    "-ss", `${videoStart}`,
    "-to", `${videoEnd}`,
    "-i", "input.mp4",
    "-c", "copy",
    "output.mp4"
  );

  const data = ffmpeg.FS("readFile", "output.mp4");

  const trimmedBlob = new Blob([data.buffer], {
    type: "video/mp4",
  });

  const trimmedFile = new File(
    [trimmedBlob],
    "trimmed.mp4",
    { type: "video/mp4" }
  );

  setVideo(trimmedFile);
  setVideoPreview(URL.createObjectURL(trimmedBlob));
};

  // SUBMIT POST
  
  const submitPost = async () => {
  if (!text && croppedImages.length === 0 && !video) return;

  if (croppedImages.length > 0 && video) {
    showNotification("You can upload images OR a video, not both.", "error");
    return;
  }

  const formData = new FormData();

  if (text) formData.append("content", text);

  croppedImages.forEach((file, i) => {
    formData.append("images[]", file);
  });



  if (video) {
    formData.append("video", video);
  }

  setLoading(true);
  setProgress(0);

  console.log(croppedImages);
croppedImages.forEach(f => console.log(f instanceof File, f.type));


  try {
    const res = await api.post("/api/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

    handlePostCreated?.(res.data.post);

    showNotification("Uploaded successfully!", "success");

    // reset safely
    setText("");
    setCroppedImages([]);
    setVideo(null);
    setVideoPreview(null);
    setProgress(0);
    setOpen(null);
  } catch (err) {
    const msg =
      err.response?.data?.message ||
      "Upload failed. Please try again.";

    showNotification(msg, "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 bg-white shadow-lg rounded-xl lg:ml-[346px] max-w-3xl mx-auto mt-10">
      <h2 className="sm:text-3xl text-xl text-center font-bold mb-4 text-gray-800">
        Create Islamic Content
      </h2>

      <p className="text-gray-600 leading-relaxed mb-4">
        Share your knowledge with the world by creating inspiring Islamic Contents.
        Whether you are creating Hadith explanations, Qur’an tafsir, Islamic
        reminders, Seerah narrations, or stories of the prophets, our Content
        creation tool allows you to structure your content beautifully. Click
        the button below to begin creating your Content.
      </p>

      {/* New guidance about permissible content */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
        <h3 className="font-semibold text-gray-800 mb-2">Posting Guidelines</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-inside">
          <li>• Post content that is authentic, respectful, and rooted in sound sources.</li>
          <li>• For Hadith and Fiqh, cite reliable references (e.g., Sahih collections, recognized scholars).</li>
          <li>• Avoid content that promotes extremism, insults, or divides the community.</li>
          <li>• Do not post private footage, non-consensual recordings, or material that violates privacy.</li>
          <li>• Refrain from music, inappropriate imagery, or anything that contradicts Islamic decorum on this platform.</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Content that violates these rules may be removed or flagged for review.
        </p>
      </div>

      {/* Create Video Button */}
      <button
        onClick={() => setOpen(true)}
        className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all"
      >
        Create Post
      </button>

      {/* POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-white p-6 flex flex-col sm:p-12 rounded-xl w-full max-w-[720px] shadow-xl relative
                  max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 whitespace-nowrap">
           
      {/* TEXT */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full h-20 sm:h-32 border p-3 rounded resize-none"
      />

      {/* MEDIA INPUTS */}
      <p className="py-2 border-b-2 border-blue-500 font-bold text-sm text-black mt-4">Media Select</p>
      <div className="inline-flex gap-3 mt-3">
        <div>
        <input
          type="file"
          id="imageupload" 
          accept="image/*" 
          className="hidden"
          multiple
          disabled={!!video}
          onChange={(e) => handleSelectImages(e.target.files)}
        />
         <label
            htmlFor="imageupload"
            className=""
        >
            <img src={imagePost} alt="image-image" className="w-20 cursor-pointer hover:scale-105" />
        </label>
        </div>
        <div>
          {/* disabled={croppedImages.length > 0} */}
        <input type="file" id="videoUpload" accept="video/*" 
        className="hidden" onChange={e => handleVideo(e.target.files[0])} />
         <label
            htmlFor="videoUpload"
            className=""
        >
        <img src={videoPost} alt="image-image" className="w-24 rounded-full h-20 cursor-pointer hover:scale-105" />
        </label>
        </div>
      </div>

      {/* IMAGE PREVIEW */}

      <div className="grid grid-cols-3 bg-transparent gap-2 mt-4">
        {Array.isArray(croppedImages) &&
          croppedImages.map((img, i) => (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              className="rounded-lg"
            />
          ))}
      </div>



      {/* VIDEO PREVIEW + TRIM */}
     

      {/* UPLOAD PROGRESS */}
      {progress > 0 && (
        <div className="w-full bg-gray-200 h-2 mt-3 rounded">
          <div className="bg-blue-600 h-2 rounded" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* POST BUTTON */}
      <div className="flex flex-row items-center justify-between mt-6">
   
      <button
        onClick={submitPost}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg> : "Post"}
      </button>

        <button
       onClick={() => {
            setOpen(false);
            setImages(null);
            setVideo(null);
            setCroppedImages(null);
            setVideoPreview(null);
        }}
        className="mt-4 bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>

    </div>
    </div>
    </div>
     )}

    
    {videoPreview && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded w-[90%] max-w-3xl h-[80%] relative">

      <button
        onClick={() => setVideoPreview(null)}
        className="absolute top-3 right-3 bg-gray-200 p-2 rounded-full"
      >
        ✕
      </button>

      <video
        src={videoPreview}
        controls
        className="w-full max-h-80 rounded mt-8"
        onLoadedMetadata={(e) => {
          setVideoStart(0);
          setVideoEnd(e.target.duration);
          setVideoDuration(e.target.duration);
        }}
      />

      <Slider
        range
        min={0}
        max={videoDuration}
        step={0.1}
        value={[videoStart, videoEnd]}
        onChange={([s, e]) => {
          setVideoStart(s);
          setVideoEnd(e);
        }}
        className="mt-6"
      />

      <div className="flex justify-between text-sm mt-2">
        <span>{videoStart.toFixed(1)}s</span>
        <span>{videoEnd.toFixed(1)}s</span>
      </div>

      <button
        onClick={applyVideoTrim}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Apply Trim
      </button>

    </div>
  </div>
)}

    

      {/* IMAGE CROP MODAL */}
      {showCrop && images[currentIndex] && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
    <div className="bg-white sm:w-[90vw] sm:h-[96vh] flex flex-col justify-center items-center h-full w-full rounded relative p-4">

      <button
        onClick={() => setShowCrop(false)}
        className="absolute top-3 right-3 bg-gray-200 p-2 rounded-full"
      >
        ✕
      </button>

      <ImageCrop
        url={URL.createObjectURL(images[currentIndex])}
        isLast={currentIndex === images.length - 1}
        onCropDone={(blob) => {
          const file = new File(
            [blob],
            `image-${currentIndex}.jpg`,
            { type: "image/jpeg" }
          );

          setCroppedImages((prev) => [...prev, file]);

          if (currentIndex + 1 < images.length) {
            setCurrentIndex((i) => i + 1); // 👉 NEXT IMAGE
          } else {
            setShowCrop(false); // 👉 EXIT CROPPING
            setCurrentIndex(0);
          }
        }}
      />


    </div>
  </div>
)} 



          <Notification
            message={notify.message}
            type={notify.type}
            onClose={() => setNotify({ message: "", type: "" })}
          />
        </div>
  );
}
