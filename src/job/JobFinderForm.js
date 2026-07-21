
import { useRef, useState } from "react";
import {
 User,
 Upload,
 GraduationCap,
 Briefcase,
 Award,
 Plus,
 X
} from "lucide-react";
export default function JobFinderForm({
 onBack,
 onSubmit,
}) {
 const cvRef = useRef();
 const [fullName, setFullName] = useState("");
 const [qualification, setQualification] = useState("");
 const [portfolio, setPortfolio] = useState("");
 const [certification, setCertification] = useState("");
 const [cv, setCv] = useState(null);
 const [skill, setSkill] = useState("");
 const [skills, setSkills] = useState([]);
 const addSkill = () => {
 if (
 skill.trim() &&
 !skills.includes(skill.trim())
 ) {
 setSkills([
 ...skills,
 skill.trim()
 ]);
 setSkill("");
 }
 };
 const removeSkill = (index) => {
 setSkills(
 skills.filter((_, i) => i !== index)
 );
 };
 const handleCV = (e) => {
 const file = e.target.files[0];
 if (!file) return;
 setCv(file);
 };
 const submit = () => {
 const form = new FormData();
 form.append("type", "finder");
 form.append("full_name", fullName);
 form.append(
 "qualifications",
 qualification
 );
 form.append(
 "portfolio",
 portfolio
 );
 form.append(
 "certification",
 certification
 );
 if (cv) {
 form.append("cv", cv);
 }
 skills.forEach(skill => {
 form.append("skills[]", skill);
 });
 onSubmit(form);
 };
 
 return (
 <div className="space-y-7">
 <div>
 <h2 className="text-2xl font-bold">
 Job Finder Profile
 </h2>
 <p className="text-gray-500">
 Build your professional profile.
 </p>
 </div>
 {/* Name */}
 <div>
 <label className="font-semibold">
 Full Name
 </label>
 <div className="relative mt-2">
 <User
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <input
 className="border rounded-xl w-full pl-12 py-3"
 placeholder="John Doe"
 value={fullName}
 onChange={(e)=>
 setFullName(e.target.value)
 }
 />
 </div>
 </div>
 {/* CV */}
 <div>
 <label className="font-semibold">
 Upload CV
 </label>
 <div
 onClick={() =>
 cvRef.current.click()
 }
 className="mt-2 border-2 border-dashed rounded-2xl p-8 cursor-pointer hover:borderblue-600"
 >
 <div className="flex flex-col items-center">
 <Upload
 size={40}
 className="text-blue-600"
 />
 <p className="mt-4">
 {
 cv ?
 cv.name
 :
 "Click to upload your CV"
 }
 </p>
 </div>
 </div>
 <input
 hidden
 ref={cvRef}
 type="file"
 accept=".pdf,.doc,.docx"
 onChange={handleCV}
 />
 </div>
 {/* Qualification */}
 <div>
 <label className="font-semibold">
 Qualifications
 </label>
 <div className="relative mt-2">
 <GraduationCap
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <textarea
 rows={3}
 className="border rounded-xl w-full pl-12 py-3"
 placeholder="B.Sc Computer Science..."
 value={qualification}
 onChange={(e)=>
 setQualification(
 e.target.value
 )
 }
 />
 </div>
 </div>
 {/* Portfolio */}
 <div>
 <label className="font-semibold">
 Portfolio
 </label>
 <div className="relative mt-2">
 <Briefcase
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <input
 className="border rounded-xl w-full pl-12 py-3"
 placeholder="https://portfolio.com"
 value={portfolio}
 onChange={(e)=>
 setPortfolio(
 e.target.value
 )
 }
 />
 </div>
 </div>
 {/* Skills */}
 <div>
 <label className="font-semibold">
 Skills
 </label>
 <div className="flex gap-2 mt-2">
 <input
 className="border rounded-xl flex-1 px-4 py-3"
 placeholder="React"
 value={skill}
 onChange={(e)=>
 setSkill(
 e.target.value
 )
 }
 onKeyDown={(e)=>{
 if(e.key==="Enter"){
 e.preventDefault();
 addSkill();
 }
 }}
 />
 <button
 onClick={addSkill}
 className="bg-blue-600 text-white px-5 rounded-xl"
 >
 <Plus/>
 </button>
 </div>
 <div className="flex flex-wrap gap-2 mt-4">
 {
 skills.map((item,index)=>(
 <div
 key={index}
 className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2"
 >
 {item}
 <X
 size={16}
 className="cursor-pointer"
 onClick={()=>
 removeSkill(index)
 }
 />
 </div>
 ))
 }
 </div>
 </div>
 {/* Certifications */}
 <div>
 <label className="font-semibold">
 Certifications
 </label>
 <div className="relative mt-2">
 <Award
 className="absolute left-4 top-3.5 text-gray-400"
 />
 <textarea
 rows={3}
 className="border rounded-xl w-full pl-12 py-3"
 placeholder="AWS, Cisco..."
 value={certification}
 onChange={(e)=>
 setCertification(
 e.target.value
 )
 }
 />
 </div>
 </div>
 {/* Buttons */}
 <div className="flex justify-between">
 <button
 onClick={onBack}
 className="border px-6 py-3 rounded-xl"
 >
 Back
 </button>
 <button
 onClick={submit}
 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
 >
 Save Profile
 </button>
 </div>
 </div>
 );
}