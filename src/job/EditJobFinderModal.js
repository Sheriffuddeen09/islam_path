
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../Api/axios";
import JobFinderForm from "./JobFinderForm";
export default function EditJobFinderModal({
 show,
 onClose,
 profile,
 refresh,
}) {
 const [loading, setLoading] = useState(false);
 const [fullName, setFullName] = useState("");
 const [qualification, setQualification] = useState("");
 const [portfolio, setPortfolio] = useState("");
 const [certification, setCertification] = useState("");
 const [skills, setSkills] = useState([]);
 const [cv, setCv] = useState(null);
 useEffect(() => {
 if (!profile) return;
 setFullName(profile.full_name || "");
 setQualification(profile.qualifications || "");
 setPortfolio(profile.portfolio || "");
 setCertification(profile.certification || "");
 if (profile.skills) {
 if (Array.isArray(profile.skills)) {
 setSkills(profile.skills);
 } else {
 try {
 setSkills(JSON.parse(profile.skills));
 } catch {
 setSkills([]);
 }
 }
 }
 }, [profile]);
 if (!show) return null;
 const handleUpdate = async (formData) => {
 try {
 setLoading(true);
 await api.post(
 `/api/job-profile/${profile.id}`,
 formData,
 {
 headers: {
 "Content-Type": "multipart/form-data",
 }
 }
 );
 toast.success("Profile updated successfully.");
 refresh();
 onClose();
 } catch (err) {
 if (err.response?.status === 422) {
 toast.error("Please check your inputs.");
 } else {
 toast.error("Unable to update profile.");
 }
 } finally {
 setLoading(false);
 }
 };
 return (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p4">
 <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-yauto">
 {/* Header */}
 <div className="flex justify-between items-center border-b px-6 py-5">
 <div>
 <h2 className="text-2xl font-bold">
 Edit Job Finder Profile
 </h2>
 <p className="text-gray-500">
 Update your professional profile.
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 rounded-full hover:bg-gray-100"
 >
 <X size={22} />
 </button>
 </div>
 {/* Body */}
 <div className="p-6">
 <JobFinderForm
 editMode={true}
 loading={loading}
 profile={profile}
 fullName={fullName}
 setFullName={setFullName}
 qualification={qualification}
 setQualification={setQualification}
 portfolio={portfolio}
 setPortfolio={setPortfolio}
 certification={certification}
 setCertification={setCertification}
 skills={skills}
 setSkills={setSkills}
 cv={cv}
 setCv={setCv}
 onBack={onClose}
 onSubmit={handleUpdate}
 />
 </div>
 </div>
 </div>
 );
}