import { useRef, useState } from "react";
import api from "../Api/axios";
import Navbar from "../layout/Header";
import { useNavigate } from "react-router-dom";

export default function TeacherOnboarding() {
  const [courseTitle, setCourseTitle] = useState("");
  const [payment, setPayment] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState("");
  const [compliment, setCompliment] = useState("");
  const [logo, setLogo] = useState(null);
  const [cv, setCv] = useState(null);
  const textareaRef = useRef(null);


  const router = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value;
    setCompliment(value);

    // Auto-expand
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = textarea.scrollHeight + "px"; // set to scrollHeight
  };
  const handleFileChangeLogo = (e) => {
    setLogo(e.target.files[0]);
  };

    const handleFileChangeCv = (e) => {
    setCv(e.target.files[0]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append("admin_id", 1);
    form.append("course_title", courseTitle);
    form.append("course_payment", payment);
    form.append("currency", currency);
    form.append("compliment", compliment);
    if (logo) form.append("logo", logo);
    if (cv) form.append("cv", cv);

    try {
    const res = await api.post(
      "/api/admin/teacher/save",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // Show success message
    alert(res.data.message || "Teacher details saved successfully!");

    // Redirect to dashboard
    router("/dashboard");
  } catch (err) {
    // Handle validation or other errors
    if (err.response && err.response.data && err.response.data.errors) {
      // Laravel validation errors
      const messages = Object.values(err.response.data.errors)
        .flat()
        .join("\n");
      alert(messages);
    } else {
      alert(err.response?.data?.message || "Something went wrong!");
    }
  } finally {
    setLoading(false);
  }
  };

  const content = (
    <form onSubmit={handleSubmit} className="py-4 sm:px-8 px-5 sm:w-[500px] w-80  mx-auto border border-blue-600 rounded-2xl my-5">
      <h1 className="sm:text-2xl font-bold mb-4 text-black text-lg text-center">Become an Arabic Teacher</h1>

      <input type="text" placeholder="Course Title"
        onChange={(e) => setCourseTitle(e.target.value)}
        className="w-full p-2 border border-blue-600 rounded-lg outline-0 text-black mb-3"
      />

      <div className="flex items-center mb-3 gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="border border-blue-600 rounded-lg outline-0 text-black px-2 py-2  rounded"
        >
          <option value=""></option>
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
      ref={textareaRef}
      value={compliment}
      placeholder="Compliment"
      onChange={handleChange}
      className="w-full p-2 border mb-3 border-blue-600 rounded-lg outline-0 text-black resize-none overflow-hidden"
      rows={4} // default rows
    />

      <label className="text-black mb-5 font-bold pb-5">Academy Logo</label>
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

    {/* Cv */}

    <label className="text-black my-5 font-bold pb-5">Cv Optional</label>
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
  );

  return (
    <div>
      <Navbar />
      {content}
      </div>
  )
}
