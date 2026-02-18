import Notification from "../../Form/Notification";
import api from "../../Api/axios";
import imagePost from './image/image.jpg'
import videoPost from './image/video.png'
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ImageCrop from "./util/ImageCrop";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useEffect, useRef, useState } from "react";


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

  const ffmpegRef = useRef(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);



  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [visibility, setVisibility] = useState("public");


  const showNotification = (msg) => {
    setNotify({ message: msg, type: "error" });

      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };


  // VIDEO SELECT



const loadFFmpeg = async () => {
  if (ffmpegRef.current?.isLoaded()) return;

  ffmpegRef.current = createFFmpeg({
    log: true,
    corePath:
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  });

  if (!ffmpegRef.current.isLoaded()) {
    await ffmpegRef.current.load();
  }

  setFfmpegReady(true);
};

// when i open this https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js it does not open but say{Couldn't find the requested file /dist/ffmpeg-core.js in @ffmpeg/core.}
// when i open this it open https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.min.js

useEffect(() => {
  if (videoPreview) {
    loadFFmpeg();
  }
}, [videoPreview]);

  
  const applyVideoTrim = async () => {
  const ffmpeg = ffmpegRef.current;

  ffmpeg.FS("writeFile", "input.mp4", await fetchFile(video));

  await ffmpeg.run(
    "-ss", `${videoStart}`,
    "-to", `${videoEnd}`,
    "-i", "input.mp4",
    "-c", "copy",
    "output.mp4"
  );

  const data = ffmpeg.FS("readFile", "output.mp4");

  const blob = new Blob([data.buffer], { type: "video/mp4" });
  const trimmedFile = new File([blob], "trimmed.mp4", { type: "video/mp4" });

  setVideo(trimmedFile);
  setVideoPreview(URL.createObjectURL(blob)); 
};


  const handleVideo = (file) => {
  setVideo(file);
  setVideoPreview(URL.createObjectURL(file));
  setShowTrimModal(true);
  setCroppedImages([]);
};


const handleTrimAndClose = async () => {
  await applyVideoTrim();
  setShowTrimModal(false); // only close modal
};



  const handleSelectImages = (files) => {
  setImages(Array.from(files));
  setCroppedImages([]);
  setCurrentIndex(0);
  setShowCrop(true);
};


  // SUBMIT POST


  const submitPost = async () => {

  const images = croppedImages || [];

  if (!text && images.length === 0 && !video) return;

  if (images.length > 0 && video) {
    showNotification("You can upload images OR a video, not both.", "error");
    return;
  }

  const formData = new FormData();

  formData.append("visibility", visibility); // 👈 ADD THIS

  if (text) formData.append("content", text);

  if (croppedImages?.length) {
    croppedImages.forEach(file => {
      formData.append("images[]", file);
    });
  }

  if (video) {
    formData.append("video", video);
  }

  setLoading(true);

  try {
    const res = await api.post("/api/posts", formData);

    handlePostCreated?.(res.data.post);

    setShowVisibilityModal(false); // 👈 CLOSE MODAL
    setText("");
    setCroppedImages([]);
    setVideo(null);

    showNotification("Uploaded successfully!", "success");

  } catch (err) {
    showNotification(err.response?.data?.message || "Upload failed.");
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
        className="w-full h-20 sm:h-32 border-2 p-3 rounded resize-none"
      />

      {/* MEDIA INPUTS */}
      <p className="py-2 border-b-2 border-blue-500 font-bold text-sm text-black mt-4">Select Media Upload</p>
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
             className="flex flex-col items-center gap-1"
        >
            <img src={imagePost} alt="image-image" className="w-20 cursor-pointer hover:scale-105" />
            <label className="text-sm text-black font-bold">Image</label>
        </label>
        </div>
        <div>
          {/* disabled={croppedImages.length > 0} */}
        <input type="file" id="videoUpload" accept="video/*" 
        className="hidden" onChange={e => handleVideo(e.target.files[0])} />
         <label
            htmlFor="videoUpload"
            className="flex flex-col items-center gap-1"
        >
        <img src={videoPost} alt="image-image" className="w-24 rounded-full h-20 cursor-pointer hover:scale-105" />
        <label className="text-sm text-black font-bold">Video</label>
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
              className="rounded-lg h-48 w-full"
            />
          ))}
      </div>


      {/* VIDEO PREVIEW + TRIM */}
     {videoPreview && (
      <div className="mt-4">
        <video
          src={videoPreview}
          controls
          className="w-full max-h-40 rounded"
        />
      </div>
    )}


      {/* UPLOAD PROGRESS */}
      {progress > 0 && (
        <div className="w-full bg-gray-200 h-2 mt-3 rounded">
          <div className="bg-blue-600 h-2 rounded" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* POST BUTTON */}
      <div className="flex flex-row items-center justify-between mt-6">
   
     <button
      onClick={() => setShowVisibilityModal(true)}
      disabled={loading}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
    >
      Next
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


    
        {showTrimModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded w-[90%] max-w-3xl sm:h-[80%] h-full flex flex-col 
    justify-center items-center relative">

       <button
        onClick={() => setShowTrimModal(false)}
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
         disabled={!ffmpegReady}
        onClick={handleTrimAndClose}
        className={`mt-4 px-4 py-2 rounded text-white ${
          ffmpegReady ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {ffmpegReady ? "Apply Trim" : "Loading video engine…"}
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

{showVisibilityModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

    <div className="bg-white w-96 rounded-xl p-6 shadow-xl">

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
            <p className="text-xs text-gray-500">
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
            <p className="text-xs text-gray-500">
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
        onClick={() => setShowVisibilityModal(false)}
        className="mt-3 w-full bg-gray-300 py-2 rounded-lg"
      >
        Cancel
      </button>

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
