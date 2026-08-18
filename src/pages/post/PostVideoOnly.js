import { X } from "lucide-react";

export default function PostVideoOnly({closeModal, visibility, setVisibility, submitPost, loading, showVisibilityModal,
    setShowVisibilityModal}){
return(
<div className="fixed inset-0 flex items-center justify-center bg-black/60">
<div className="bg-[var(--bg-color)] text-[var(--text-color)]  sm:p-5 p-2 rounded-xl w-[95%] md:w-[600px]">
<div className="flex items-center justify-between mb-5">
<h2 className="sm:text-2xl text-xl font-bold">
Upoload Video
</h2>
<button onClick={closeModal}>
<X />
</button>
</div>
<input
type="file" accept="video/*" className="w-full border p-3 rounded-xl" />
<button
className=" w-full
mt-5
bg-blue-600
text-white
rounded-xl
p-3
">
Upload Video
</button>
</div>



{showVisibilityModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

    <div className="bg-[var(--bg-color)] text-[var(--text-color)] sm:w-96 w-full rounded-xl sm:p-6 p-2 shadow-xl">

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

</div>
)
}
