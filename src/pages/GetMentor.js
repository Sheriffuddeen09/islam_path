import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from '../layout/Header';

export default function GetMentor() {
const [arabicTeachers, setArabicTeachers] = useState([]);
const [usersTeachers, setUsersTeachers] = useState([]);
const [loading, setLoading] = useState(true);
const [selectedCompliment, setSelectedCompliment] = useState(null);

const truncateLength = 0; // show full compliment

useEffect(() => {
const fetchData = async () => {
try {
const [arabicRes, usersRes] = await Promise.all([
axios.get(" /api/teachers"),
axios.get(" /api/teachers/users"),
]);

setArabicTeachers(arabicRes.data);
    setUsersTeachers(usersRes.data);
  } catch (error) {
    console.error("Error fetching teachers:", error);
  } finally {
    setLoading(false);
  }
};

fetchData();

}, []);

if (loading) return ( <div className="flex justify-center sm:my-60 my-32 items-center h-40"> <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div> </div>
);

// Merge both teacher arrays into a single normalized array
const mergedTeachers = [
  ...arabicTeachers.map(t => ({
    id: t.id,
    first_name: t.first_name || t.firstname || "",
    last_name: t.last_name || t.lastname || "",
    email: t.email || "",
    course_title: t.course_title || "Arabic Course",
    course_payment: t.course_payment || "N/A",
    currency: t.currency || "$",
    logo: t.logo || "/default-avatar.png",
    compliment: t.compliment || "No compliment",
    cv: t.cv || null
  })),
  ...usersTeachers.map(t => ({
    id: t.id,
    first_name: t.first_name || "",
    last_name: t.last_name || "",
    email: t.email || "",
    course_title: "Arabic Course",
    course_payment: "N/A",
    currency: "$",
    logo: t.logo || "/default-avatar.png",
    compliment: t.compliment || "No compliment",
    cv: t.cv || null
  }))
];

const content = ( <div className="p-x4"> <h2 className="texts text-2xl font-bold p-3 mb-6 text-center">
Get Your Arabic Teachers </h2>
  {/* GRID */}
  {mergedTeachers.length === 0 ? (
  <p className="text-center text-gray-600 text-xl font-semibold py-10">
    No teacher available
  </p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {mergedTeachers.map((t) => (
      <div
        key={t.id}
        className="bg-white rounded-lg w-60 overflow-hidden shadow-2xl border border-gray-300 group p-4 transform hover:scale-105 transition duration-300 flex flex-col mx-auto justify-center relative"
      >
        {/* Teacher Logo */}
        <img
          src={t.logo ? ` /storage/${t.logo}` : "/default-avatar.png"}
          alt="Logo"
          className="w-24 h-24 object-cover rounded-full mb-3 mx-auto"
        />

        {/* Name */}
        {(t.first_name || t.last_name) && (
          <h3 className="font-semibold text-lg mb-1 text-black text-center">
            {t.first_name} {t.last_name}
          </h3>
        )}

        {/* Course Title */}
        {t.course_title && (
          <h3 className="font-semibold text-lg mb-1 text-black text-center">
            {t.course_title}
          </h3>
        )}

        {/* Payment */}
        {t.course_payment && (
          <p className="font-medium text-black text-center mb-2">
            <span className="text-black">{t.currency}</span> {t.course_payment}
          </p>
        )}

        {/* Compliment */}
        {t.compliment && (
          <p className="text-gray-700 mx-auto font-bold text-sm mb-2 text-center">
            {t.compliment.length > truncateLength ? (
              <>
                {t.compliment.substring(0, truncateLength)}{" "}
                <span
                  onClick={() => setSelectedCompliment(t.compliment)}
                  className="text-blue-600 text-xs cursor-pointer text-center hover:text-blue-800"
                >
                  Compliment
                </span>
              </>
            ) : t.compliment}
          </p>
        )}

        {/* CV and Get Now buttons */}
        <div className="absolute bg-black bg-opacity-90 flex flex-row gap-3 items-end h-28 bottom-0 w-full right-0 pb-2 justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div>
            {t.cv ? (
              <a
                href={` /storage/${t.cv}`}
                target="_blank"
                className="bg-blue-600 text-white w-28 font-bold text-sm p-2 rounded-lg mt-auto text-center hover:bg-blue-700 cursor-pointer"
              >
                View Cv
              </a>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white w-24 font-bold text-sm p-2 rounded-lg mt-auto text-center cursor-not-allowed"
              >
                No CV
              </button>
            )}
          </div>
          <div>
            <button className="bg-green-600 text-white w-24 font-bold text-sm p-2 rounded-lg mt-auto text-center hover:bg-green-700 cursor-pointer">
              Get Now
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

)}

  {selectedCompliment && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={() => setSelectedCompliment(null)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          &times;
        </button>

        <h1 className="text-2xl text-center py-3 font-bold mb-3 text-black">
          Teacher Compliment
        </h1>

        <p className="text-gray-700">{selectedCompliment}</p>
      </div>
    </div>
  )}
</div>

);

return ( <div> 
  <Navbar />
{content} 


</div>
);
}
