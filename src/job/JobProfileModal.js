import { useState } from "react";
import { X, Briefcase, User, ChevronRight, ChevronLeft } from "lucide-react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import JobFinderForm from "./JobFinderForm";
import JobCreatorForm from "./JobCreatorForm";
export default function JobProfileModal({
 show,
 onClose, fetchJobProfile
}) {


 const [step, setStep] = useState(1);
 const [profileType, setProfileType] = useState("");

 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const onSubmit = async (formData) => {
   try {
   setLoading(true);
   setErrors({});
   await api.post(
   "/api/job-profile",
   formData,
   {
   headers: {
   "Content-Type": "multipart/form-data",
   },
   }
   );
   toast.success("Profile created successfully.");
    await fetchJobProfile();
    
   onClose();
  
   } catch (error) {
   if (error.response?.status === 422) {
   setErrors(error.response.data.errors);
   toast.error("Please correct the highlighted fields.");
   } else {
   toast.error("Something went wrong.");
   }
   } finally {
   setLoading(false);
   }
  };


 if (!show) return null;
 return (
 <div
    className="
    fixed inset-0
    bg-black/60
    backdrop-blur-sm
    z-50
    flex
    justify-center
    items-center
    p-4
    "
>
 <div
    className="
    bg-white
    rounded-3xl
    shadow-2xl
    w-full
    max-w-4xl
    max-h-[90vh]
    overflow-y-auto
    scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
    relative
    "
>
    <button
 onClick={onClose}
 className="rounded-full p-2 hover:bg-gray-100 transition absolute right-4 top-2"
 >
 <X size={24} />
 </button>
 {/* Header */}
 <div className="flex justify-between items-center px-8 py-5 border-b">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-gray-800">
 Create Job Profile
 </h2>
 <p className="text-gray-500 text-sm mt-1">
 Choose how you want to use the Jobs platform.
 </p>
 </div>
 
 </div>
 {/* Progress */}
 <div className="px-8 pt-6">
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
 step >= 1
 ? "bg-blue-600 text-white"
 : "bg-gray-200"
 }`}>
 1
 </div>
 <div className="flex-1 h-1 bg-gray-200 rounded">
 <div
 className={`h-full bg-blue-600 rounded transition-all duration-300 ${
 step === 1
 ? "w-0"
 : "w-full"
 }`}
 />
 </div>
 <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
 step >= 2
 ? "bg-blue-600 text-white"
 : "bg-gray-200"
 }`}>
 2
 </div>
 </div>
 </div>
 {/* Body */}
 <div className="p-8">
 {step === 1 && (
 <>
 <h3 className="text-xl font-semibold text-center">
 Select Your Profile
 </h3>
 <p className="text-center text-gray-500 mt-2">
 You can create either a company profile or a personal job seeker profile.
 </p>
 <div className="grid md:grid-cols-2 gap-8 mt-4">
 {/* Job Creator */}
 <div
 onClick={() => setProfileType("creator")}
 className={`cursor-pointer rounded-2xl border-2 p-8 transition-all hover:shadow-xl
${
 profileType === "creator"
 ? "border-blue-600 bg-blue-50"
 : "border-gray-200"
 }`}
 >
 <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justifycenter mx-auto">
 <Briefcase
 size={30}
 className="text-blue-600 mx-auto"
 />
 </div>
 <h4 className="text-xl font-bold mt-6">
 Job Creator
 </h4>
 <p className="text-gray-500 mt-3">
 Create a company profile and post jobs to
 hire talented candidates.
 </p>
 <ul className="mt-6 space-y-2 text-sm">
 <li>✔ Post unlimited jobs</li>
 <li>✔ Manage applicants</li>
 <li>✔ Company branding</li>
 <li>✔ Shortlist candidates</li>
 </ul>
 </div>
 {/* Job Finder */}
 <div
 onClick={() => setProfileType("finder")}
 className={`cursor-pointer rounded-2xl border-2 p-8 transition-all hover:shadow-xl
${
 profileType === "finder"
 ? "border-green-600 bg-green-50"
 : "border-gray-200"
 }`}
 >
 <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justifycenter">
 <User
 size={30}
 className="text-green-600 mx-auto"
 />
 </div>
 <h4 className="text-xl font-bold mt-6">
 Job Finder
 </h4>
 <p className="text-gray-500 mt-3">
 Build your professional profile and
 apply for jobs.
 </p>
 <ul className="mt-6 space-y-2 text-sm">
 <li>✔ Upload CV</li>
 <li>✔ Showcase portfolio</li>
 <li>✔ Add skills</li>
 <li>✔ Receive job offers</li>
 </ul>
 </div>
 </div>
 <div className="flex justify-end mt-10">
 <button
 disabled={!profileType}
 onClick={() => setStep(2)}
 className={`flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold
transition ${
 profileType
 ? "bg-blue-600 hover:bg-blue-700"
 : "bg-gray-400 cursor-not-allowed"
 }`}
 >
 Continue
 <ChevronRight size={20} />
 </button>
 </div>
 </>
 )}
 {step === 2 && (

<div>

    <div className="flex justify-start mb-5">
 <button
 onClick={() => setStep(1)}
 className={`flex items-center gap-2 px-7 py-3 rounded-xl text-black font-semibold
transition border hover:bg-gray-100`}
 >
 <ChevronLeft size={20} />
 Back
 </button>
 </div>

    {profileType === "creator" && (

        <>

            <h2 className="sm:text-3xl text-xl font-bold text-center mb-2">

                Create Job Creator Profile

            </h2>
            <JobCreatorForm
                onSubmit={onSubmit}
                loading={loading}
            />

        </>

    )}

    {profileType === "finder" && (

        <>

            <h2 className="sm:text-3xl mb-2 text-xl font-bold text-center">

                Create Job Finder Profile

            </h2>

            <JobFinderForm
                onSubmit={onSubmit}
                loading={loading}
            />

        </>

    )}

</div>

)}
 </div>
 </div>
 </div>
 );
}