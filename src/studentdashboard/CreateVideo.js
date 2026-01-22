import { useEffect, useState } from "react";
import api from "../Api/axios";
import Notification from "../Form/Notification";

/**
 * CreateVideoSection
 * - Shows guidance about permissible Islamic content
 * - "Create Video" button opens modal
 * - Form requires users to confirm content is permissible in Islam before submit
 */
export default function CreateVideoSection({onCreated}) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isPermissible, setIsPermissible] = useState(false);
  const [error, setError] = useState("");
  const [thumb,setThumb]=useState(null);
  const [loading,setLoading]=useState(false);
 const [categories, setCategories] = useState([]);
  const [notify, setNotify] = useState({ message: "", type: "" });
  
  const showNotification = (msg) => {
    setNotify({ message: msg, type: "error" });
  
    // Clear after 5 seconds
    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };
  


 



  const resetForm = () => {
    setDesc(''); 
    setVideoFile(null); 
    setThumb(null);
    setIsPermissible(false);
    setError("");
  };


  const handleSubmit = async (e) => {
  e.preventDefault();

  // VALIDATIONS
  if (!videoFile) return showNotification("Please choose a video file to upload.", "error");
  if (!isPermissible)
    return showNotification("You must confirm this content is permissible in Islam.", "error");

  const fd = new FormData();
  fd.append("description", desc);
  fd.append("video", videoFile);
  fd.append("is_permissible", isPermissible ? 1 : 0);
  if (thumb) fd.append("thumbnail", thumb);

  try {
    setLoading(true);

    const res = await api.post("/api/videos", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // SUCCESS NOTIFICATION
    showNotification("Video uploaded successfully!", "success");

    // Callback for parent component
    onCreated && onCreated(res.data.video);

    await new Promise((r) => setTimeout(r, 1000));

    // Close modal
    setOpen(false);
    resetForm();

  } catch (err) {
    console.error(err);

    // SERVER ERROR MESSAGE
    const msg =
      err.response?.data?.message ||
      "Video upload failed. Please try again.";

    showNotification(msg, "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl lg:ml-[346px] max-w-3xl mx-auto mt-10">
      <h2 className="sm:text-3xl text-xl text-center font-bold mb-4 text-gray-800">
        Create Islamic Video Content
      </h2>

      <p className="text-gray-600 leading-relaxed mb-4">
        Share your knowledge with the world by creating inspiring Islamic videos.
        Whether you are creating Hadith explanations, Qur’an tafsir, Islamic
        reminders, Seerah narrations, or stories of the prophets, our video
        creation tool allows you to structure your content beautifully. Click
        the button below to begin creating your video and choose from multiple
        Islamic categories such as Hadith, Qur’an, Tafsir, Seerah of the
        Prophet ﷺ, Islamic rulings, daily reminders, dua, dhikr, and more.
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
        Create Video
      </button>

      {/* POPUP MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white p-6 rounded-xl w-full max-w-[720px] shadow-xl
                  max-h-[90vh] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 whitespace-nowrap">
            <h3 className="sm:text-2xl text-sm text-center font-bold mt-4 mb-10 text-gray-800">
              Create New Islamic Video
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Give viewers a concise idea of your video's content..."
                  className="w-full p-3 border border-blue-300 rounded-lg bg-white"
                  rows={4}
                />
              </div>

              <div>
              
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Video File
                </label>
                <div className="flex flex-row items-center justify-between gap-6">
              <div>
                <input
                  type="file"
                  accept="video/*"
                  id="videoupload"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                    htmlFor="videoupload"
                    className="files w-40 my-5 text-center mb-5 font-bold mb-10 text-white px-4 py-2 rounded
                     cursor-pointer hover:bg-blue-700 transition"
                >
                    Upload Video
                </label>
                </div>
                <div>
                {videoFile && (
                <div className="rounded sm:text-sm text-xs whitespace text-gray-700">
                {videoFile.name} ({(videoFile.size / 1024).toFixed(2)} KB)
                </div>
            )}
            </div>
            </div>
                <p className="text-xs text-gray-500 mt-4">
                  Tip: For best results, upload MP4 (H.264) under 500MB.
                </p>
              </div>

              {/* Mandatory Permissible Confirmation */}
              <div className="flex items-start gap-2">
                <input
                  id="permissible"
                  type="checkbox"
                  checked={isPermissible}
                  onChange={(e) => setIsPermissible(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="permissible" className="text-xs block sm:hidden text-gray-700 w-40">
                  I confirm this content is{" "}
                  <strong>permissible according to <br /> Islamic guidelines</strong> (no
                  music, no private footage,  <br /> authentic religious
                  sourcing for Hadith/Fiqh, and <br /> respectful presentation).
                </label>
                <label htmlFor="permissible" className="text-xs  sm:block hidden text-gray-700 w-40">
                  I confirm this content is{" "}
                  <strong>permissible according to Islamic guidelines</strong> (no
                  music, no private footage,  authentic religious <br />
                  sourcing for Hadith/Fiqh, and respectful presentation).
                </label>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3">
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
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
    </svg> : "Post Video"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="py-3 px-4 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* small footer text */}
            <p className="text-xs text-gray-400 hidden sm:block mt-3">
              By submitting you agree to our community guidelines. The management may
              review or remove any content that conflicts with <br /> the platform's
              standards.
            </p>
            <p className="text-xs block sm:hidden text-gray-400 mt-3">
              By submitting you agree to our community guidelines. <br /> The management may
              review or remove any content <br /> that conflicts with the platform's
              standards.
            </p>
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
