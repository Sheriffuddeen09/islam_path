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
const [declineReason, setDeclineReason] = useState({});
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
`/api/advertisement/decline/${id}`, {
decline_reason:
declineReason[id] || "Advertisement was declined.", }
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
<div className="bg-white rounded-2xl shadow-md p-5 animate-pulse">
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
<div className="p-5">
<h1 className="text-3xl font-bold mb-6">
Pending Advertisements
</h1>
{advertisements.length === 0 ? (
<div className="bg-white rounded-2xl p-10 text-center shadow-md">
No Pending Advertisements. </div>
) : (
<div className="grid lg:grid-cols-2 gap-5">
{advertisements.map((advertisement) => (
<div
key={advertisement.id}
className="bg-white rounded-3xl shadow-md overflow-hidden" >
{/* IMAGE */}
{advertisement.media_type ===
"image" && (
<img
src={`${import.meta.env.VITE_API_URL}/storage/${advertisement.media}`}
alt="" className="w-full h-72 object-cover" />
)}
{/* VIDEO */}
{advertisement.media_type ===
"video" && (
<video
controls
className="w-full h-72 object-cover" >
<source
src={`${import.meta.env.VITE_API_URL}/storage/${advertisement.media}`}
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
<span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
{
advertisement.type
}
</span>
<span className="bg-yellow-100 px-3 py-1 rounded-full text-sm">
{
advertisement.status
}
</span>
</div>
<p className="text-gray-600">
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
<div className="bg-gray-50 rounded-xl p-4">
<p>
<b>User:</b>{" "}
{
advertisement
.user
?.name
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
{/* DECLINE REASON */}
<textarea
rows={4}
placeholder="Reason for declining (Optional)" className="w-full rounded-xl border p-4 outline-none" value={
declineReason[
advertisement
.id
] || "" }
onChange={(
e
) =>
setDeclineReason(
(
prev
) => ({
...prev, [
advertisement
.id
]:
e
.target
.value, })
)
}
/>
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
Approving... </div>
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
Declining... </div>
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