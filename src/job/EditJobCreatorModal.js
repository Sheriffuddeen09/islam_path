
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import JobCreatorForm from "./JobCreatorForm";
import api from "../Api/axios";
export default function EditJobCreatorModal({
 show,
 onClose,
 profile,
 refresh,
}) {
 const [loading, setLoading] = useState(false);
 const [companyName, setCompanyName] = useState("");
 const [companyType, setCompanyType] = useState("");
 const [organisationSize, setOrganisationSize] = useState("");
 const [location, setLocation] = useState("");
 const [logo, setLogo] = useState(null);
 useEffect(() => {
 if (!profile) return;
 setCompanyName(profile.company_name || "");
 setCompanyType(profile.company_type || "");
 setOrganisationSize(profile.organisation_size || "");
 setLocation(profile.company_location || "");
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
 },
 }
 );
 toast.success("Profile updated successfully.");
 refresh();
 onClose();
 } catch (err) {
 toast.error("Unable to update profile.");
 } finally {
 setLoading(false);
 }
 };
 return (
 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
 {/* Header */}
 <div className="flex items-center justify-between border-b px-6 py-5">
 <div>
 <h2 className="text-2xl font-bold">
 Edit Company Profile
 </h2>
 <p className="text-gray-500">
 Update your company information.
 </p>
 </div>
 <button
 onClick={onClose}
 className="hover:bg-gray-100 rounded-full p-2"
 >
 <X size={22}/>
 </button>
 </div>
 {/* Body */}
 <div className="p-6">
 <JobCreatorForm
 loading={loading}
 editMode={true}
 companyName={companyName}
 setCompanyName={setCompanyName}
 companyType={companyType}
 setCompanyType={setCompanyType}
 organisationSize={organisationSize}
 setOrganisationSize={setOrganisationSize}
 location={location}
 setLocation={setLocation}
 logo={logo}
 setLogo={setLogo}
 onBack={onClose}
 onSubmit={handleUpdate}
 />
 </div>
 </div>
 </div>
 );
}