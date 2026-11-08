import { useState } from "react";
import { X } from "lucide-react";
import videoPost from './image/video.png'
export default function PostImageVideoDescription({ closeModal, submitPost, loading, handleSelectImages,
    text, setText, video, imagePost, handleVideoUpload, images }) {


return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"><div
className="bg-[var(--bg-color)] border border-green-500 text-[var(--text-color)]  sm:p-5 p-2
rounded-xl
w-full
max-w-2xl
max-h-[95vh]
overflow-y-auto scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
" >
<div className="flex items-center justify-between mb-5">
<h2 className="sm:text-2xl text-xl font-bold">
Create Post
</h2>
<button onClick={closeModal}>
<X />
</button>
</div>
{/* Upload Image */}

{/* Description */}
<div>
<label className="font-semibold block mb-2">
Description
</label>
<textarea
value={text}
onChange={e => setText(e.target.value)}
placeholder="Write something" 
className=" w-full 
h-40 text-black
border scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
rounded-xl
p-4
outline-none
resize-none
"/>
</div>

<div className="flex flex-row flex-wrap mt-3 justify-center gap-3 sm:gap-10  items-center">
<div className="mb-2">
<label className="font-semibold block mb-2">
Upload Image
</label>
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
            <img src={imagePost} alt="image-image" 
            className="w-40 h-40 cursor-pointer rounded-lg hover:scale-105" />
        </label>
</div>
</div>

{/* Upload Video */}
<div className="mb-2">
    <label className="font-semibold block mb-2">
    Upload Video
    </label>
    <div>
    <input
            type="file"
            id="videoUpload"
            accept="video/*"
            className="hidden"
            disabled={images.length > 0 || !!video}
            onChange={(e) => {
                const file =
                e.target.files?.[0];

                handleVideoUpload(file);

                e.target.value = "";
            }}
            />

    <label
        htmlFor="videoUpload"
        className="flex flex-col items-center gap-1"
    >
        <img
        src={videoPost}
        alt="Video"
        className="w-40 h-40 cursor-pointer rounded-lg hover:scale-105"
        />
    </label>
    </div>
</div>
</div>
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
</div>

</div>
);
}