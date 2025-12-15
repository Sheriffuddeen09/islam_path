import { useState } from "react";
import api from "../Api/axios";

export default function ReportForm({ video, handleReport  }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const videoId = video?.id || null;
  const reportedUserId = video?.user_id;

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await api.post("/api/reports", {
      video_id: videoId,
      reported_user_id: reportedUserId,
      category,
      description
    });

    setMessage(res.data.message);      // show success message
    setCategory("");
    setDescription("");

    // Automatically close form after 2 seconds
    setTimeout(() => {
      setMessage("");                   // clear message
      handleReport();                   // close popup
    }, 2000);

  } catch (err) {
    setMessage("Failed to submit report");

    // Optionally auto-clear error after 3s
    setTimeout(() => setMessage(""), 3000);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
<div className={``}>
  <div className="flex justify-center mx-auto items-center p-4 sm:p-6 lg:p-8">
    <form 
      onSubmit={handleSubmit} 
      className="w-full max-w-xl relative  bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Report a Video
      </h2>

    <button className="absolute top-0 right-5" onClick={handleReport}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-black ">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

    </button>
      <div className="flex flex-col">
        <label className="mb-2 font-medium text-gray-700">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 text-black rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          placeholder="Enter report category"
          required
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-2 font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-lg text-black p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none h-32 sm:h-40"
          placeholder="Describe the issue"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 flex flex-col justify-center items-center mx-auto hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5 hover:shadow-lg"
      >
       {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
        className="opacity-75 mx-auto"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : " Submit Report"
}
      </button>

      {message && (
        <p className="text-center text-green-600 font-medium mt-2">{message}</p>
      )}
    </form>
  </div>
  </div>
</>
);
}
