import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
LoaderCircle, Badge, CheckCircle, Megaphone, Handshake, X, } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
export default function SelectAdvertisementVisibility() {
const { id } = useParams();
const [loading, setLoading] = useState(true);
const [unlockLoading, setUnlockLoading] = useState(false);
const [openModal, setOpenModal] =
useState(false);
const [advertisement, setAdvertisement] = useState({});
const [selectedAudience, setSelectedAudience] = useState("");
const [requiredBadges, setRequiredBadges] = useState(0);
useEffect(() => {
fetchAdvertisement();
}, []);
const fetchAdvertisement = async () => {
try {
setLoading(true);
const response = await api.get(
`/api/advertisement/${id}` );
setAdvertisement(
response.data.advertisement
);
} catch (error) {
toast.error(
"Unable to fetch advertisement."
);
} finally {
setLoading(false);
}
};
const handleSelection = (
audience, badges
) => {
setSelectedAudience(audience);
setRequiredBadges(badges);
setOpenModal(true);
};
const unlockVisibility = async () => {
try {
setUnlockLoading(true);
const response = await api.post(
`/api/advertisement/unlock-visibility/${id}`, {
audience:
selectedAudience, }
);
toast.success(
response.data.message
);
setOpenModal(false);
fetchAdvertisement();
} catch (error) {
toast.error(
error?.response?.data
?.message || "Unable to unlock." );
} finally {
setUnlockLoading(false);
}
};
const Skeleton = () => {
return (
<div className="animate-pulse space-y-5">
<div className="h-80 rounded-xl bg-gray-200"></div>
<div className="h-8 rounded bg-gray-200"></div>
<div className="h-32 rounded bg-gray-200"></div>
</div>
);
};
if (loading) {
return (
<div className="max-w-5xl mx-auto p-5">
<Skeleton />
</div>
);
}
return (
<>
<div className="max-w-5xl mx-auto p-5">
<div className="bg-white shadow-xl rounded-3xl overflow-hidden">
{/* IMAGE */}
{advertisement.media_type ===
"image" && (
<img
src={`${import.meta.env.VITE_API_URL}/storage/${advertisement.media}`}
alt="" className="w-full h-96 object-cover" />
)}
{/* VIDEO */}
{advertisement.media_type ===
"video" && (
<video
controls
className="w-full h-96 object-cover" >
<source
src={`${import.meta.env.VITE_API_URL}/storage/${advertisement.media}`}
/>
</video>
)}
<div className="p-6 space-y-5">
<h1 className="text-4xl font-bold">
{
advertisement.title
}
</h1>
<div className="flex gap-3">
<span className="px-4 py-2 rounded-full bg-blue-100">
{
advertisement.type
}
</span>
<span className="px-4 py-2 rounded-full bg-green-100">
{
advertisement.status
}
</span>
</div>
<p className="text-gray-600 leading-8">
{
advertisement.description
}
</p>
{/* VISIBILITY */}
{!advertisement.visibility_unlocked && (
<>
<div className="bg-gray-50 rounded-3xl p-6">
<h2 className="font-bold text-2xl mb-5">
Select Visibility
</h2>
<div className="grid lg:grid-cols-2 gap-4">
<button
onClick={() =>
handleSelection(
"25",
50
)
}
className="rounded-2xl border p-6 hover:bg-blue-50" >
<h2 className="font-bold">
1/4
Users
</h2>
<p>
50
Badges
</p>
<p> visibility to users for 1 month</p>
</button>
<button
onClick={() =>
handleSelection(
"50", 100
)
}
className="rounded-2xl border p-6 hover:bg-blue-50" >
<h2 className="font-bold">
1/2
Users
</h2>
<p>
100
Badges
</p>
<p> visibility to users for 2 month</p>
</button>
<button
onClick={() =>
handleSelection(
"75", 200
)
}
className="rounded-2xl border p-6 hover:bg-blue-50" >
<h2 className="font-bold">
3/4
Users
</h2>
<p>
200
Badges
</p>
<p> visibility to users for 3 month</p>
</button>
<button
onClick={() =>
handleSelection(
"100", 300
)
}
className="rounded-2xl border p-6 hover:bg-blue-50" >
<h2 className="font-bold">
All
Users
</h2>
<p>
300
Badges
</p>
<p> visibility to users for 4 month</p>
</button>
</div>
</div>
</>
)}
{/* ALREADY UNLOCKED */}
{advertisement.visibility_unlocked && (
<div className="bg-green-50 rounded-3xl p-6">
<div className="flex items-center gap-3">
<CheckCircle
size={35}
/>
<div>
<h2 className="font-bold text-2xl">
Visibility
Unlocked
</h2>
<p>
Your
advertisement
is now
visible
to users. </p>
</div>
</div>
</div>
)}
</div>
</div>
</div>
{/* MODAL */}
{openModal && (
<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-5"><div className="bg-white rounded-3xl max-w-lg w-full p-6">
<div className="flex items-center justify-between">
<h1 className="font-bold text-2xl">
Unlock Visibility
</h1>
<button
onClick={() =>
setOpenModal(
false
)
}
>
<X />
</button>
</div>
<div className="mt-6 space-y-4">
<div className="flex items-center gap-3">
<Badge />
<h2 className="font-bold text-xl">
{
requiredBadges
}{" "}
Badges
</h2>
</div>
<p>
You are about to
spend{" "}
<b>
{
requiredBadges
}
</b>{" "}
badges to unlock
advertisement
visibility. </p>
<p>
This action cannot
be undone. </p>
<div className="flex gap-3 pt-4">
<button
onClick={() =>
setOpenModal(
false
)
}
className="w-full border rounded-xl p-4 font-bold" >
Cancel
</button>
<button
disabled={
unlockLoading
}
onClick={
unlockVisibility
}
className="w-full rounded-xl bg-blue-600 text-white p-4 font-bold" >
{unlockLoading ? (
<div className="flex items-center justify-center gap-2">
<LoaderCircle className="animate-spin" />
Unlocking
</div>
) : (
"Unlock with Badges" )}
</button>
</div>
</div>
</div>
</div>
)}
</>
);
}