
import React, { useState } from "react";
import {
X, Image, LoaderCircle, Megaphone, Handshake, Link as LinkIcon, FileVideo, Info, } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
export default function CreateAdvertisementModal({
isOpen, onClose, }) {
const [loading, setLoading] = useState(false);
const [preview, setPreview] = useState("");
const [isVideo, setIsVideo] = useState(false);
const [formData, setFormData] = useState({
title: "", description: "", link: "", type: "advertisement", media: null, });
if (!isOpen) return null;

const handleChange = (e) => {
setFormData((prev) => ({
...prev, [e.target.name]: e.target.value, }));
};
const handleFile = (e) => {
const file = e.target.files[0];
if (!file) return;
const extension = file.name
.split(".")
.pop()
.toLowerCase();
setIsVideo(
["mp4", "mov", "avi", "webm"].includes(extension)
);

setPreview(URL.createObjectURL(file));
setFormData((prev) => ({
...prev, media: file, }));
};
const resetForm = () => {
setFormData({
title: "", description: "", link: "", type: "advertisement",
media: null, });
setPreview("");
setIsVideo(false);
};
const handleSubmit = async () => {
if (!formData.media) {
return toast.error(
"Please upload an image or video." );
}
try {
setLoading(true);
const data = new FormData();
data.append("title", formData.title);
data.append(
"description", formData.description
);
data.append("link", formData.link);
data.append("type", formData.type);
data.append("media", formData.media);
const response = await api.post(
"/api/advertisement/create", data, {
headers: {
"Content-Type": "multipart/form-data", }, }
);
toast.success(response.data.message);
resetForm();
if (onClose) {
onClose();
}
} catch (error) {
toast.error(
error?.response?.data?.message || "Something went wrong." );
} finally {
setLoading(false);
}
};
return (
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
<div className="bg-[var(--bg-color)] text-[var(--text-color)]  
w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto
scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">
{/* Header */}
<div className="p-5 border-b flex items-center justify-between">
<div>
<h1 className="font-bold text-2xl">
Advertisement /
Sponsorship
</h1>
<p className="text-sm">
Submit your
advertisement for
approval. </p>
</div>
<button
onClick={onClose}
className="hover:bg-gray-700 p-2 rounded-full" >
<X size={24} />
</button>
</div>
<div className="p-6 space-y-6">
{/* Upload */}
<label className="block cursor-pointer">
<div className="border-2 border-dashed rounded-2xl p-8 text-center hover:border
-blue-500 transition">
<div className="flex items-center justify-center gap-3 mb-3">
<Image size={28} />
<FileVideo size={28} />
</div>
<h2 className="font-bold text-lg">
Upload Image or
Video
</h2>
<p className="text-sm mt-2">
JPG, PNG, MP4, MOV and AVI are
supported. </p>
<p className="text-sm mt-2">
the video upload must not be more than 50mb. </p>
<input
type="file" hidden
accept="image/*,video/*" onChange={
handleFile
}
/>
</div>
</label>
{/* Preview */}
{preview && (
<div>
<h3 className="font-semibold mb-2">
Preview
</h3>
{isVideo ? (
<video
controls
className="w-48 h-48 rounded-2xl" >
<source
src={
preview
}
/>
</video>
) : (
<img
src={preview}
alt="preview" className="w-48  h-48 rounded-2xl"
/>
)}
</div>
)}
{/* Title */}
<div>
<label className="font-semibold">
Title
</label>
<input
type="text" name="title" value={
formData.title
}
onChange={
handleChange
}
placeholder="Advertisement Title" className="w-full border text-black rounded-xl p-4 mt-2 outline-none focus:ring-2 focus:ring-blue-500" />
</div>
{/* Description */}
<div>
<label className="font-semibold">
Description
</label>
<textarea
rows={5}
name="description" value={
formData.description
}
onChange={
handleChange
}
placeholder="Write your advertisement description." className="w-full border text-black rounded-xl p-4 mt-2 outline-none focus:ring-2 focus:ring-blue-500" />
</div>
{/* Link */}
<div>
<label className="font-semibold flex items-center gap-2">
<LinkIcon
size={18}
/>
Website Link
(Optional)
</label>
<input
type="url" name="link" value={
formData.link
}
onChange={
handleChange
}
placeholder="https://example.com" className="w-full border rounded-xl p-4 mt-2 
text-black outline-none focus:ring-2 focus:ring-blue-500" />
</div>
{/* Type */}
<div>
<h3 className="font-bold text-lg mb-4">
Select Type
</h3>
<div className="grid grid-cols-2 gap-4">
<button
type="button" onClick={() =>
setFormData(
(
prev
) => ({
...prev, type: "advertisement", })
)
}
className={`p-5 rounded-2xl border duration-300 ${
formData.type ===
"advertisement" ? "bg-blue-600 text-white"
: "bg-gray-700" }`}
>
<Megaphone className="mx-auto mb-2" />
<h3 className="font-bold">
Advertisement
</h3>
</button>
<button
type="button" onClick={() =>
setFormData(
(
prev
) => ({
...prev, type: "sponsorship", })
)
}
className={`p-5 rounded-2xl border duration-300 ${
formData.type ===
"sponsorship" ? "bg-green-600 text-white"
: "bg-gray-700" }`}
>
<Handshake className="mx-auto mb-2" />
<h3 className="font-bold">
Sponsorship
</h3>
</button>
</div>
</div>
{/* Information */}
<div className="rounded-2xl sm:p-5 p-2 border">
<div className="flex gap-3">
<Info
size={22}
className="mt-1" />
<div>
<h3 className="font-bold mb-3">
Important
Information
</h3>
<ul className="space-y-2 text-sm">
<li>
• Creating an
advertisement
is FREE. </li>
<li>
• Admin must
approve your
advertisement. </li>
<li>
• You will
receive an
email after
approval or
decline. </li>
<li>
• Visibility
can be
unlocked
after
approval. </li>
<li>
• 50 badges = 1/4 users. </li>
<li>
• 100 badges = 1/2 users. </li>
<li>
• 200 badges = 3/4 users. </li>
<li>
• 300 badges = All users. </li>
</ul>
</div>
</div>
</div>
{/* Buttons */}
<div className="flex gap-3">
<button
type="button" onClick={onClose}
className="w-full p-4 rounded-xl border font-bold" >
Cancel
</button>
<button
type="button" disabled={loading}
onClick={
handleSubmit
}
className="w-full p-4 rounded-xl font-bold bg-blue-600 text-white
disabled:opacity-60" >
{loading ? (
<div className="flex items-center justify-center gap-2">
<LoaderCircle className="animate-spin" />
Submitting</div>
) : (
"Submit" )}
</button>
</div>
</div>
</div>
</div>
);
}