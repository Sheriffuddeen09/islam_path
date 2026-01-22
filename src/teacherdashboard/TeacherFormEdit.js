import { useEffect, useState } from "react";
import toast, {Toaster} from "react-hot-toast";
import api from "../Api/axios";
import ArrayInput from "./ArrayInput";

export default function TeacherFormEdit({ onClose, teacher, onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    coursetitle_id: "",
    qualification: [""],
    experience: [""],
    specialization: [""],
    compliment: [""],
    course_payment: "",
    currency: "NGN",
    logo: null,
    cv: null,
  });

  const [courseTitles, setCourseTitles] = useState([]);

  // 🔹 Fetch course titles
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/api/coursetitles");
        setCourseTitles(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  

  // 🔹 Initialize form from teacher prop
  useEffect(() => {
    if (!teacher) return;

    setForm({
      coursetitle_id: teacher.coursetitle_id || "",
      qualification: teacher.qualification?.length ? teacher.qualification : [""],
      experience: teacher.experience?.length ? teacher.experience : [""],
      specialization: teacher.specialization?.length ? teacher.specialization : [""],
      compliment: teacher.compliment?.length ? teacher.compliment : [""],
      course_payment: teacher.course_payment || "",
      currency: teacher.currency || "NGN",
      logo: null,
      cv: null,
    });

    setLoading(false);
  }, [teacher]);


  useEffect(() => {
  if (teacher) {
    setForm({
      coursetitle_id: teacher.coursetitle_id || "",
      qualification: teacher.qualification?.length ? teacher.qualification : [""],
      experience: teacher.experience?.length ? teacher.experience : [""],
      specialization: teacher.specialization?.length ? teacher.specialization : [""],
      compliment: teacher.compliment?.length ? teacher.compliment : [""],
      course_payment: teacher.course_payment || "",
      currency: teacher.currency || "NGN",
      logo: null,
      cv: null,
    });
  }
}, [teacher]);

  // 🔹 Submit
  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const fd = new FormData();

    Object.keys(form).forEach((key) => {
      const value = form[key];

      // Arrays
      if (Array.isArray(value)) {
        value.forEach((v, i) => fd.append(`${key}[${i}]`, v));
        return;
      }

      // Files
      if ((key === "logo" || key === "cv") && value instanceof File) {
        fd.append(key, value);
        return;
      }

      // Normal fields
      if (value !== null && value !== "" && key !== "logo" && key !== "cv") {
        fd.append(key, value);
      }
    });

    try {
      const res = await api.post("/api/teacher-form?_method=PUT", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Teacher profile updated successfully ✅");
      

      // 🔹 Call parent onUpdate to refresh teacher list
      if (onUpdate) {
        onUpdate({
          ...teacher,
          ...res.data.data, // updated fields returned from backend
        });
      }

      onClose();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Please fix the errors below, or choose your course title");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };


  const otherCourseId = courseTitles.find(
  (c) => c.name.toLowerCase() === "other"
)?.id;

const isFile = (val) => val instanceof File;
const autoGrow = (ref) => {
  if (!ref.current) return;
  ref.current.style.height = "auto";
  ref.current.style.height = ref.current.scrollHeight + "px";
};

  return (
    
    <form
      onSubmit={submitForm}
      className="bg-white p-6 rounded-xl relative shadow max-w-3xl w-full"
    >
      <svg onClick={onClose} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 absolute top-2 right-1 cursor-pointer">
  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
</svg>

{/* COURSE TITLE */}
<div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
        <div>
       <label className="font-semibold text-sm block mb-1">
  Course Title
</label>


 <select
  value={form.coursetitle_id === "" ? "" : Number(form.coursetitle_id)}
  onChange={(e) => {
    const selectedId = e.target.value === "" ? "" : Number(e.target.value);

    setForm((prev) => ({
      ...prev,
      coursetitle_id: selectedId,
      specialization:
        selectedId === otherCourseId
          ? prev.specialization.length
            ? prev.specialization
            : [""]
          : [], // clear ONLY when switching away from Other
    }));
  }}
  className="border rounded-lg px-3 py-2 w-full"
>
  <option value="">Select a course</option>
  {courseTitles.map((course) => (
    <option key={course.id} value={course.id}>
      {course.name}
    </option>
  ))}
</select>



        </div>

        {/* SPECIALIZATION */}
      {Number(form.coursetitle_id) === Number(otherCourseId) && (
  <ArrayInput
    label="Specialization"
    values={form.specialization}
    onChange={(vals) =>
      setForm((prev) => ({ ...prev, specialization: vals }))
    }
    placeholder="e.g. Advanced Tajweed"
  />
)}




    {/* EXPERIENCE */}
      <ArrayInput
        label="Course Title Optional "
        values={form.experience}
        onChange={(vals) =>
            setForm((prev) => ({ ...prev, experience: vals }))
        }
        placeholder=""
        error={errors["experience.0"]}
      />
      <ArrayInput
      label="Qualification"
      values={form.qualification}
      onChange={(vals) =>
        setForm((prev) => ({ ...prev, qualification: vals }))
      }
      autoGrow
      placeholder="e.g. BA Arabic Studies"
    />



      {/* COMPLIMENT */}
     <ArrayInput
      label="Compliment"
      values={form.compliment}
      onChange={(vals) =>
        setForm((prev) => ({ ...prev, compliment: vals }))
      }
      autoGrow
      placeholder="Write a short message to students..."
    />


      {/* PAYMENT */}
      <div className="mb-4">
        <label className="font-semibold text-sm block mb-1">
          Course Payment
        </label>
        <input
          type="number"
          value={form.course_payment}
          onChange={(e) =>
            setForm({ ...form, course_payment: e.target.value })
          }
          className="border rounded-lg px-3 py-2 w-full"
        />
        {errors.course_payment && (
          <p className="text-xs text-red-600">{errors.course_payment}</p>
        )}
      </div>

      {/* FILES */}
      
  <div className="grid grid-cols-2 gap-6">

  {/* LOGO */}
  <div>
    <label className="font-semibold text-sm block mb-2">Logo (Image)</label>

    <input
      type="file"
      accept="image/*"
      id="logoUpload"
      className="hidden"
      onChange={(e) =>
        setForm((prev) => ({ ...prev, logo: e.target.files[0] }))
      }
    />

    <label
      htmlFor="logoUpload"
      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded"
    >
      Upload Logo
    </label>

    {form.logo && (
      <img
        src={
          typeof form.logo === "string"
            ? form.logo
            : URL.createObjectURL(form.logo)
        }
        className="mt-3 w-20 h-20 object-cover rounded"
      />
    )}
  </div>

  {/* CV */}
  <div>
    <label className="font-semibold text-sm block mb-2">CV (PDF)</label>

    <input
      type="file"
      accept=".pdf,.doc,.docx"
      id="cvUpload"
      className="hidden"
      onChange={(e) =>
        setForm((prev) => ({ ...prev, cv: e.target.files[0] }))
      }
    />

    <label
      htmlFor="cvUpload"
      className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded"
    >
      Upload CV
    </label>

    {form.cv && (
      <p className="mt-3 text-sm text-gray-600">
        {typeof form.cv === "string"
          ? "Existing CV uploaded"
          : form.cv.name}
      </p>
    )}
  </div>



</div>

      {/* SUBMIT */}
      <button
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 disabled:opacity-50"
      >
        {saving ?  (
    <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
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
  ) : ( "Save Changes" )}
      </button>
      </div>

      <Toaster position="top-10" className="flex justify-center items-center mx-auto" />
    </form>
  );
}
