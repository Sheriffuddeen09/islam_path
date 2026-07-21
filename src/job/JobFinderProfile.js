
import { useEffect, useState } from "react";
import {
 User,
 Award,
 GraduationCap,
 Briefcase,
 Pencil
} from "lucide-react";
import api from "../../api/axios";
import EditJobFinderModal from "../../components/jobs/EditJobFinderModal";
export default function JobFinderProfile() {
 const [profile, setProfile] = useState(null);
 const [showEdit, setShowEdit] = useState(false);
 useEffect(() => {
 fetchProfile();
 }, []);
 const fetchProfile = async () => {
 const res = await api.get("/api/job-profile");
 setProfile(res.data);
 };
 if (!profile)
 return <div>Loading...</div>;
 return (
 <div className="max-w-5xl mx-auto p-6">
 <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
 <div className="h-48 bg-gradient-to-r from-green-500 to-blue-500"/>
 <div className="px-8 pb-8 -mt-16">
 <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4
border-white">
 <User size={55}/>
 </div>
 <div className="flex justify-between mt-6">
 <div>
 <h2 className="text-3xl font-bold">
 {profile.full_name}
 </h2>
 </div>
 <button
 onClick={() => setShowEdit(true)}
 className="bg-green-600 text-white rounded-xl px-6 py-3 flex items-center gap-2"
 >
 <Pencil size={18}/>
 Edit Profile
 </button>
 </div>
 <div className="grid md:grid-cols-2 gap-6 mt-8">
 <div className="border rounded-xl p-5">
 <GraduationCap/>
 <h4 className="font-semibold mt-3">
 Qualifications
 </h4>
 <p>
 {profile.qualifications}
 </p>
 </div>
 <div className="border rounded-xl p-5">
 <Briefcase/>
 <h4 className="font-semibold mt-3">
 Portfolio
 </h4>
 <a
 href={profile.portfolio}
 className="text-blue-600"
 >
 {profile.portfolio}
 </a>
 </div>
 <div className="border rounded-xl p-5">
 <Award/>
 <h4 className="font-semibold mt-3">
 Certifications
 </h4>
 <p>
 {profile.certification}
 </p>
 </div>
 <div className="border rounded-xl p-5">
 <h4 className="font-semibold">
 Skills
 </h4>
 <div className="flex flex-wrap gap-2 mt-4">
 {profile.skills.map((skill) => (
 <span
 key={skill}
 className="bg-blue-100 text-blue-700 rounded-full px-3 py-1"
 >
 {skill}
 </span>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 <EditJobFinderModal
 show={showEdit}
 profile={profile}
 refresh={fetchProfile}
 onClose={() => setShowEdit(false)}
 />
 </div>
 );
}