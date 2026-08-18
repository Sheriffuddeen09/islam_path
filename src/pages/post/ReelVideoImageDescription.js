import { useState } from "react";
import { X } from "lucide-react";
export default function ReelVideoImageDescription({ closeModal }) {
const [video, setVideo] = useState(null);
const [image, setImage] = useState(null);
const [description, setDescription] = useState("");
return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"><div className="bg-white rounded-xl w-full max-w-2xl p-5 max-h-[95vh] overflow-y- auto">
<div className="bg-[var(--bg-color)] text-[var(--text-color)]  sm:p-5 p-2 flex items-center justify-between mb-5">
<h2 className="sm:text-2xl text-xl font-bold">
Create Reel
</h2>
<button onClick={closeModal}>
<X />
</button>
</div>
{/* Upload Video */}
<div className="mb-5">
<label className="font-semibold block mb-2">
Upload Video
</label>
<input
type="file" accept="video/*" className="w-full border rounded-lg p-3" onChange={(e) => setVideo(e.target.files[0])}
/>
{video && (
<video
controls
className="mt-3 rounded-lg w-full" src={URL.createObjectURL(video)}
/>
)}
</div>
{/* Upload Image */}
<div className="mb-5">
<label className="font-semibold block mb-2">
Upload Thumbnail Image
</label>
<input
type="file" accept="image/*" className="w-full border rounded-lg p-3" onChange={(e) => setImage(e.target.files[0])}
/>
{image && (
<img
src={URL.createObjectURL(image)}
alt="" className="rounded-lg mt-3 w-full object-cover max-h-80" />
)}
</div>
{/* Description */}
<div>
<label className="font-semibold block mb-2">
Description
</label>
<textarea
rows={5}
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder="Write something..." className="w-full border rounded-lg p-4 outline-none resize-none" />
</div>
<button
className="w-full mt-6 bg-blue-600 text-white rounded-lg p-4" >
Create Reel
</button>
</div>
</div>
);
}

