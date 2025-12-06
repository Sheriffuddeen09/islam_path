import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from '../layout/Header';
import api from "../Api/axios";

export default function GetMentor() {

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/api/teacher"); // returns { status: true, teachers: [...] }
        setTeachers(res.data.teachers || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );

  if (teachers.length === 0)
    return (
      <div className="text-center text-gray-600 text-xl py-10">
        No teacher available
      </div>
    );

    // Teacher

const content = ( <div className="p-x4"> <h2 className="texts text-2xl font-bold p-3 mb-6 text-center">
Get Your Arabic Teachers </h2>
  {/* GRID */}
  {teachers.length === 0 ? (
  <p className="text-center text-gray-600 text-xl font-semibold py-10">
    No teacher available
  </p>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {teachers.map((t) => (
  <div
    key={t.id}
    className="bg-white rounded-lg w-60 overflow-hidden shadow-2xl border border-gray-300 group p-4 transform hover:scale-105 transition duration-300 flex flex-col mx-auto justify-center relative"
  >
    {/* Teacher Logo */}
    <img
      src={t.logo || "/default-avatar.png"}
      alt="Logo"
      className="w-24 h-24 object-cover rounded-full mb-3 mx-auto"
    />

    {/* Name */}
  {/* Name + Payment */}
{(t.first_name || t.last_name) && (
  <h3 className="font-semibold text-lg mb-1 text-black text-center">
    {t.first_name} {t.last_name} &bull; {t.currency} {t.course_payment}
  </h3>
)}

{/* Course Title + Experience */}
{t.course_title && (
  <h3 className="font-semibold text-lg mb-1 text-black text-center">
    &bull; {t.course_title} &bull; {t.experience || "N/A"}
  </h3>
)}


        {/* Payment */}
        {t.course_payment && (
          <p className="font-medium text-black text-center mb-2">
           
          </p>
        )}
    {/* Compliment */}
    {t.compliment && (
              <p className="text-gray-700 mx-auto font-normal text-black text-[13px] mb-2 text-center">
                {t.compliment.length > 80
                  ? `${t.compliment.substring(0, 80)}... `
                  : t.compliment}
                {t.compliment.length > 80 && (
                  <span
                    onClick={() => setSelectedTeacher({ compliment: t.compliment, qualification: t.qualification })}
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                  >
                    read more
                  </span>
                )}
              </p>
            )}

    {/* CV and Get Now buttons */}
    <div className="absolute bg-black bg-opacity-100 flex flex-col h-44 bottom-0 w-full right-0 pb-2 justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
      <div className="flex flex-row gap-3 items-center mx-auto justify-center mb-4">
      <div>
        {t.cv ? (
          <a
            href={t.cv}
            target="_blank"
            className="bg-blue-600 text-white w-28 font-bold text-sm p-2 rounded-lg mt-auto text-center hover:bg-blue-700 cursor-pointer"
          >
            View CV
          </a>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white w-28 font-bold text-sm p-2 rounded-lg mt-auto text-center cursor-not-allowed"
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
      {t.compliment && (
              <p className="text-gray-700 mx-auto font-normal text-white text-sm mb-2 text-center">
                {t.compliment.length > 80
                  ? `${t.compliment.substring(0, 80)}... `
                  : t.compliment}
                {t.compliment.length > 80 && (
                  <span
                    onClick={() => setSelectedTeacher({ compliment: t.compliment, qualification: t.qualification })}
                    className="text-blue-300 cursor-pointer text-xs hover:text-blue-500"
                  >
                    read more
                  </span>
                )}
              </p>
            )}
    </div>
  </div>
))}

  </div>

)}

  {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              &times;
            </button>

            <h1 className="text-2xl text-center py-3 font-bold mb-3 text-black">
              Teacher Details
            </h1>

            <p className="text-gray-700 mb-4">
              <strong>Qualification:</strong> {selectedTeacher.qualification || "N/A"}
            </p>

            <p className="text-gray-700">
              <strong>Compliment:</strong> {selectedTeacher.compliment}
            </p>
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
