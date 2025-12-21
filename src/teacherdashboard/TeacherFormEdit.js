import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../Api/axios";
import ArrayInput from "./ArrayInput";

export default function TeacherFormEdit({setShowTeacherEditModal}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    coursetitle_id: "",
    qualification: [],
    experience: [],
    specialization: [],
    compliment: [],
    course_payment: "",
    currency: "NGN",
    logo: null,
    cv: null,
  });

  const [courseTitles, setCourseTitles] = useState([]);

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


  // 🔹 Fetch existing data
 useEffect(() => {
  const fetchForm = async () => {
    try {
      const res = await api.get("/api/teacher-form");

      const data =
        res.data?.data ||
        res.data?.teacherForm ||
        null;

      if (!data) {
        setLoading(false);
        return;
      }

      setForm((prev) => ({
        ...prev,
        ...data,
        qualification: data.qualification ?? [""],
        experience: data.experience ?? [""],
        specialization: data.specialization ?? [""],
        compliment: data.compliment ?? [""],
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchForm();
}, []);


  // 🔹 Submit
  const submitForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const fd = new FormData();

    Object.keys(form).forEach((key) => {
      if (Array.isArray(form[key])) {
        form[key].forEach((v, i) => fd.append(`${key}[${i}]`, v));
      } else if (form[key] !== null) {
        fd.append(key, form[key]);
      }
    });

    try {
      await api.post("/api/teacher-form?_method=PUT", fd);
      toast.success("Teacher profile updated successfully ✅");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        toast.error("Please fix the errors below");
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

const isOtherSelected = String(form.coursetitle_id) === String(otherCourseId);
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
      <svg onClick={() => setShowTeacherEditModal(false)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 absolute top-2 right-1 cursor-pointer">
  <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
</svg>

{/* COURSE TITLE */}
<div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300">
        <div>
       <label className="font-semibold text-sm block mb-1">
  Course Title
</label>

<select
  value={form.coursetitle_id ?? ""}
  onChange={(e) => {
    const selectedId = String(e.target.value);

    setForm((prev) => ({
      ...prev,
      coursetitle_id: selectedId,
      specialization:
        selectedId === String(otherCourseId)
          ? (Array.isArray(prev.specialization) && prev.specialization.length
              ? prev.specialization
              : [""])
          : [], // clear when not "Other"
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


        {errors.coursetitle_id && (
            <p className="text-xs text-red-600">{errors.coursetitle_id}</p>
        )}
        </div>

        {/* SPECIALIZATION */}
      {String(form.coursetitle_id) === String(otherCourseId) && (
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
      <div className=" grid grid-cols-2 ">

  {/* Logo Upload */}
  <div>
    <label className="text-black font-bold mb-2 block">Logo (Image)</label>
    <div className="flex items-center gap-4">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        id="logoUpload"
        onChange={(e) => setForm({ ...form, logo: e.target.files[0] })}
        className="hidden"
      />

      {/* Custom button */}
      <label
        htmlFor="logoUpload"
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
      >
        Upload Logo
      </label>

      {/* Preview */}
      {form.logo && (
        <img
          src={
            isFile(form.logo)
              ? URL.createObjectURL(form.logo)
              : form.logo // already a URL
          }
          alt="Teacher Logo"
          className="w-24 h-24 rounded object-cover"
        />
      )}

    </div>
  </div>

  {/* CV Upload */}
  <div>
    <label className="text-black font-bold mb-2 block">CV (Document)</label>
    <div className="flex items-center gap-4">
      {/* Hidden file input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        id="cvUpload"
        onChange={(e) => setForm({ ...form, cv: e.target.files[0] })}
        className="hidden"
      />

      {/* Custom button */}
      <label
        htmlFor="cvUpload"
        className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 transition"
      >
        Upload CV
      </label>

      {/* Preview */}
      {form.cv && (
  <a
    href={isFile(form.cv) ? URL.createObjectURL(form.cv) : form.cv}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 underline"
  >
    View CV
  </a>
)}

    </div>
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
    </form>
  );
}
