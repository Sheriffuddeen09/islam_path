import { useEffect, useRef, useState } from "react";
import api from "../Api/axios";

import { useNavigate } from "react-router-dom";
import Notification from "../notification/Notification";
import { Loader2 } from "lucide-react";

export default function TeacherOnboarding({onProfileCompleted, onClose, setNotification}) {
  const [specialization, setSpecialization] = useState("");
  const [payment, setPayment] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState("");
  const [compliment, setCompliment] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [logo, setLogo] = useState(null);
  const [cv, setCv] = useState(null);
  const [coursetitles, setCoursetitles]  = useState([])
  const [coursetitle_id, setCoursetitleId]  = useState('')
  

  const router = useNavigate();

  const complimentRef = useRef(null);
const qualificationRef = useRef(null);

const autoGrow = (ref) => {
  if (!ref.current) return;
  ref.current.style.height = "auto";
  ref.current.style.height = ref.current.scrollHeight + "px";
};


  const handleFileChangeLogo = (e) => {
    setLogo(e.target.files[0]);
  };

    const handleFileChangeCv = (e) => {
    setCv(e.target.files[0]);
  };

  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {

    const fetchCoursetitles = async () => {

      try {

        setLoadingCourses(true);

        const res = await api.get("/api/coursetitles");

        setCoursetitles(res.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoadingCourses(false);
      }
    };

    fetchCoursetitles();

  }, []);

  const selectedCourse = coursetitles.find(
    (c) => String(c.id) === String(coursetitle_id)
  );
  const isOtherCourse = selectedCourse?.name?.toLowerCase() === "other";


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!coursetitle_id) {
    setNotification({
      message: "Please select a course.",
      type: "error"
    });

    setLoading(false);
    return;
  }

  if (isOtherCourse && !specialization.trim()) {

    setNotification({
      message: "Please specify your Teaching Course.",
      type: "error"
    });

    setLoading(false);
    return;
  }

  const form = new FormData();

  form.append("coursetitle_id", coursetitle_id);
  form.append("specialization", specialization);
  form.append("course_payment", payment);
  form.append("currency", currency);
  form.append("compliment", compliment);
  form.append("experience", experience);
  form.append("qualification", qualification);

  if (logo) form.append("logo", logo);
  if (cv) form.append("cv", cv);

  try {

    const res = await api.post(
      "/api/admin/teacher/save",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ✅ Update dashboard instantly
    if (onProfileCompleted) {

      onProfileCompleted(prev => ({
        ...prev,
        teacher_profile_completed: true,
      }));
    }

    setNotification({
      message: res.data.message || "Saved successfully!",
      type: "success"
    });

    // ✅ CLOSE MODAL HERE
    onClose();

    // ✅ Redirect
    setTimeout(() => {
      router("/admin/dashboard");
    }, 1000);

  } catch (err) {

    const messages = err.response?.data?.errors
      ? Object.values(err.response.data.errors)
          .flat()
          .join("\n")
      : err.response?.data?.message ||
        "Something went wrong!";

    setNotification({
      message: messages,
      type: "error"
    });

  } finally {
    setLoading(false);
  }
};



  const content = (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-md flex items-center justify-center p-2 ">
      <div
        className={`relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl overflow-y-auto bg-[var(--bg-color)] 
        max-h-[65vh] sm:max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 p-3 my-2`}>

          <button onClick={onClose}
          className="absolute right-2 top-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
            class="size-12  text-[var(--text-color)] text-xs px-2 py-2 font-bold rounded-full
             hover:text-gray-700 hover:bg-gray-100 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            
          </button>
    <form onSubmit={handleSubmit} className="">
      <h1 className="sm:text-2xl font-bold mb-4  text-[var(--text-color)]  text-lg text-center">Become an Arabic Teacher</h1>

      {loadingCourses ? (

        // ✅ SKELETON
        <div className="w-full h-[52px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center px-4">

          <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />

          <div className="h-3 w-40 bg-gray-300 dark:bg-gray-600 rounded" />

        </div>

      ) : (

        // ✅ SELECT
        <select
          value={coursetitle_id}
          onChange={(e) => {

            setCoursetitleId(e.target.value);

            setSpecialization("");

          }}

          className="
            w-full
            p-3
            rounded-xl
            border
            border-blue-300
            dark:border-gray-700
            outline-none
            focus:ring-2
            focus:ring-blue-500
            transition
            cursor-pointer
          "
        >

          <option value="">
            Select Course
          </option>

          {coursetitles.map((c) => (

            <option
              key={c.id}
              value={c.id}
            >
              {c.name}
            </option>

          ))}

        </select>
      )}


      <input
        type="text"
        placeholder="Other Course (Specify)"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        disabled={!isOtherCourse}
        className={`w-full p-2 mt-3 rounded-lg outline-0 mb-4 border 
          ${isOtherCourse ? "border-blue-600 bg-[var(--bg-color)] text-[var(--text-color)] " : "border-gray-300 bg-[var(--bg-color)] text-[var(--text-color)]  cursor-not-allowed"}
        `}
      />


      <input value={experience} type="text" placeholder="Course Title Optional"
        onChange={(e) => setExperience(e.target.value)}
        className="w-full p-2 border border-blue-600 rounded-lg outline-0 text-black mb-1"
      />
      <p className="text-xs text-[var(--text-color)]  mb-4"> wish to take more than one course</p>

      <div className="flex items-center mb-3 gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border border-blue-600 rounded-lg outline-0 text-black px-2 py-2  rounded"
        >
          <option value="">Cur</option>
          <option value="$">USD ($)</option>
          <option value="₦">NGN (₦)</option>
          <option value="€">EUR (€)</option>
        </select>

        <input
          type="number"
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          placeholder="Enter price"
          className="border border-blue-600 rounded-lg outline-0 text-black px-3  py-2 rounded w-full"
        />
      </div>

      <textarea
        ref={complimentRef}
        value={compliment}
        placeholder="Compliment"
        onChange={(e) => {
          setCompliment(e.target.value);
          autoGrow(complimentRef);
        }}
        className="w-full p-2 border mb-3 border-blue-600 rounded-lg outline-0 text-black resize-none overflow-hidden"
      />


      <label className="text-[var(--text-color)]  mb-5 font-bold pb-5">Academy Logo</label>
     <div className="flex items-center my-5 gap-4">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        id="logoUpload"
        onChange={handleFileChangeLogo}
        className="hidden"
      />
      {/* Custom Upload Button */}
      <label
        htmlFor="logoUpload"
        className="files w-40 text-center font-bold text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
      >
        Upload Logo
      </label>

      {/* Preview Icon */}
      {logo && (
        <div className="w-16 h-16 flex items-center justify-center border rounded overflow-hidden">
          <img
            src={URL.createObjectURL(logo)}
            alt="Logo Preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>


      {/* Qualification */}

       <textarea
      ref={qualificationRef}
      value={qualification}
      placeholder="Qualification"
      onChange={(e) => {
        setQualification(e.target.value);
        autoGrow(qualificationRef);
      }}
      className="w-full p-2 border mb-3 border-blue-600 rounded-lg outline-0 text-black resize-none overflow-hidden"
    />

    {/* Cv */}

    <label className="text-[var(--text-color)]  my-5 font-bold pb-5">Cv Optional</label>
     <div className="flex items-center mt-5 gap-4">
      {/* Hidden File Input */}
       <input
        type="file"
        accept=".pdf,.doc,.docx,.txt" // Allow document files
        id="cvUpload"
        onChange={handleFileChangeCv}
        className="hidden"
      />

      {/* Custom Upload Button */}
      <label
        htmlFor="cvUpload"
        className="files w-40 text-center mb-5 font-bold mb-10 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
      >
        Upload Cv
      </label>

      {/* Preview Icon */}
      {cv && (
        <div className="border p-2 rounded sm:text-sm text-xs whitespace text-gray-700">
          {cv.name} ({(cv.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>

   <div className="flex justify-end">
      <button className="px-6 py-3 bg-green-600 text-white flex justify-end rounded-lg">
        {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>
  )}

            </button>
      </div>

    </form>
    </div>
    </div>
  );

  return (
    <div>
      
      <div className="pt-24 pb-8">
      {content}
      </div>
     
      </div>
  )
}
