

import { useEffect, useState } from "react";
import { Building2, MapPin, Users, Pencil } from "lucide-react";
import api from "../../api/axios";
import EditJobCreatorModal from "../../components/jobs/EditJobCreatorModal";
export default function JobCreatorProfile() {
 const [profile, setProfile] = useState(null);
 const [loading, setLoading] = useState(true);
 const [showEdit, setShowEdit] = useState(false);
 useEffect(() => {
 fetchProfile();
 }, []);
 const fetchProfile = async () => {
 const res = await api.get("/api/job-profile");
 setProfile(res.data);
 setLoading(false);
 };
 if (loading)
 return <div className="p-10">Loading...</div>;
 return (
 <div className="max-w-5xl mx-auto p-6">
 <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
 <div className="h-48 bg-gradient-to-r from-blue-600 to-cyan-500"/>
 <div className="px-8 pb-8 -mt-16">
 <img
 src={profile.company_logo}
 alt=""
 className="w-32 h-32 rounded-full border-4 border-white object-cover"
 />
 <div className="flex justify-between mt-6">
 <div>
 <h1 className="text-3xl font-bold">
 {profile.company_name}
 </h1>
 <p className="text-gray-500 mt-2">
 {profile.company_type}
 </p>
 </div>
 <button
 onClick={() => setShowEdit(true)}
 className="bg-blue-600 text-white rounded-xl px-6 py-3 flex items-center gap-2"
 >
 <Pencil size={18}/>
 Edit Profile
 </button>
 </div>
 <div className="grid md:grid-cols-2 gap-6 mt-10">
 <div className="border rounded-xl p-5">
 <Building2/>
 <h3 className="font-semibold mt-3">
 Company Type
 </h3>
 <p>
 {profile.company_type}
 </p>
 </div>
 <div className="border rounded-xl p-5">
 <Users/>
 <h3 className="font-semibold mt-3">
 Workers
 </h3>
 <p>
 {profile.organisation_size}
 </p>
 </div>
 <div className="border rounded-xl p-5">
 <MapPin/>
 <h3 className="font-semibold mt-3">
 Location
 </h3>
 <p>
 {profile.company_location}
 </p>
 </div>
 </div>
 </div>
 </div>
 <EditJobCreatorModal
 show={showEdit}
 profile={profile}
 onClose={() => setShowEdit(false)}
 refresh={fetchProfile}
 />
 </div>
 );
}