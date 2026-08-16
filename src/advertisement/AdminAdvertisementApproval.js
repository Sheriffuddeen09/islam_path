import React, { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
CheckCircle, XCircle, LoaderCircle, ExternalLink, } from "lucide-react";
export default function AdminAdvertisementApproval() {
const [loading, setLoading] = useState(true);
const [advertisements, setAdvertisements] = useState([]);
const [approveLoading, setApproveLoading] = useState(null);
const [declineLoading, setDeclineLoading] = useState(null);
useEffect(() => {
fetchAdvertisements();
}, []);
const fetchAdvertisements = async () => {
try {
setLoading(true);
const response = await api.get(
"/api/admin/advertisement/pending" );
setAdvertisements(
response.data.advertisements
);
} catch (error) {
toast.error("Unable to fetch advertisements.");
} finally {
setLoading(false);
}
};


const handleApprove = async (id) => {
try {
setApproveLoading(id);
const response = await api.post(
`/api/advertisement/approve/${id}` );
toast.success(response.data.message);
fetchAdvertisements();
} catch (error) {
toast.error(
error?.response?.data?.message || "Unable to approve advertisement." );
} finally {
setApproveLoading(null);
}
};


const handleDecline = async (id) => {
try {
setDeclineLoading(id);
const response = await api.post(
`/api/advertisement/decline/${id}`
);
toast.success(response.data.message);
fetchAdvertisements();
} catch (error) {
toast.error(
error?.response?.data?.message || "Unable to decline advertisement." );
} finally {
setDeclineLoading(null);
}
};
const Skeleton = () => {
return (
<div className="rounded-2xl shadow-md px-5 sm:pt-20 pt-14 animate-pulse">
<div className="h-56 bg-gray-200 rounded-xl"></div>
<div className="h-6 mt-4 rounded bg-gray-200"></div>
<div className="h-20 mt-4 rounded bg-gray-200"></div>
<div className="h-12 mt-4 rounded bg-gray-200"></div>
<div className="grid grid-cols-2 gap-3 mt-5">
<div className="h-12 rounded bg-gray-200"></div>
<div className="h-12 rounded bg-gray-200"></div>
</div>
</div>
);
};
if (loading) {
return (
<div className="grid lg:grid-cols-2 gap-5 p-5">
{[1, 2, 3, 4].map((item) => (
<Skeleton key={item} />
))}
</div>
);
}
return (
<div className="sm:px-5 sm:pb-10 px-2 pb-8 pt-20">
<h1 className="sm:text-3xl text-xl font-bold mb-6">
Pending Advertisements
</h1>
{advertisements.length === 0 ? (
<div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-2xl p-10 text-center shadow-md">
No Pending Advertisements. </div>
) : (
<div className="grid lg:grid-cols-2 gap-5">
{advertisements.map((advertisement) => (
<div
key={advertisement.id}
className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl shadow-md overflow-hidden" >
{/* IMAGE */}
{advertisement.media_type ===
"image" && (
<img
src={`http://localhost:8000/storage/${advertisement.media}`}
alt="" className="w-full h-72 object-cover" />
)}
{/* VIDEO */}
{advertisement.media_type ===
"video" && (
<video
controls
className="w-full h-72 object-cover" >
<source
src={`http://localhost:8000/storage/${advertisement.media}`}
/>
</video>
)}
<div className="p-5 space-y-4">
<h1 className="font-bold text-2xl">
{
advertisement.title
}
</h1>
<div className="flex gap-2">
<span className="bg-blue-500 px-3 py-1 rounded-full text-sm">
{
advertisement.type
}
</span>
<span className="bg-yellow-500 px-3 py-1 rounded-full text-sm">
{
advertisement.status
}

{
advertisement.id
}
</span>
</div>
<p className="">
{
advertisement.description
}
</p>
{/* LINK */}
{advertisement.link && (
<a
href={
advertisement.link
}
target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600" >
<ExternalLink
size={
18
}
/>
Visit
Link
</a>
)}
{/* USER */}
<div className="border-blue-500 border rounded-xl p-4">
<p>
<b>User:</b>{" "}
{
advertisement
.user
?.first_name
} {
advertisement
.user
?.last_name
}
</p>
<p>
<b>Email:</b>{" "}
{
advertisement
.user
?.email
}
</p>
</div>

{/* BUTTONS */}
<div className="grid grid-cols-2 gap-3">
{/* APPROVE */}
<button
onClick={() =>
handleApprove(
advertisement.id
)
}
disabled={
approveLoading ===
advertisement.id ||
declineLoading ===
advertisement.id
}
className="bg-green-600 text-white rounded-xl p-4 font-bold" >
{approveLoading ===
advertisement.id ? (
<div className="flex items-center justify-center gap-2">
<LoaderCircle className="animate-spin" />
Approving</div>
) : (
<div className="flex items-center justify-center gap-2">
<CheckCircle />
Approve
</div>
)}
</button>
{/* DECLINE */}
<button
onClick={() =>
handleDecline(
advertisement.id
)
}
disabled={
approveLoading ===
advertisement.id ||
declineLoading ===
advertisement.id
}
className="bg-red-600 text-white rounded-xl p-4 font-bold" >
{declineLoading ===
advertisement.id ? (
<div className="flex items-center justify-center gap-2">
<LoaderCircle className="animate-spin" />
Declining</div>
) : (
<div className="flex items-center justify-center gap-2">
<XCircle />
Decline
</div>
)}
</button>
</div>
</div>
</div>
))}
</div>
)}
</div>
);
}