import { useEffect, useState } from "react";
import api from "../../Api/axios";
import toast from "react-hot-toast";
import SubmitTeacherReview from "./SubmitTeacherReview";

export default function AcceptedTeacher(){

    const [teachers,setTeachers] = useState([]);
    const [loading,setLoading] = useState(false);
    const [selectedTeacher,setSelectedTeacher] = useState(null);
    const [rating,setRating] = useState(0);
    const [review,setReview] = useState("");


    useEffect(()=>{

    fetchTeachers();

},[]);

const fetchTeachers = async ()=>{

    try{
        setLoading(true);


        const res = await api.get(
            "/api/student/accepted-teachers"
        );

        setTeachers(res.data.teachers);

    }catch{

        toast.error("Unable to load teachers.");

    }finally{

        setLoading(false);

    }

};



    return(
        <div className="max-w-6xl mx-auto lg:ml-72 text-black">

<h2 className="text-xl border-b-2 border-blue-900 pb-2 font-bold mb-8 text-[var(--text-color)]">

Rate Your Teachers

</h2>

{
loading ?

<div
            className="
            grid
            grid-cols-1
            gap-2"
        >

            {[...Array(4)].map((_,i)=>(

                <div
                    key={i}
                    className="
                    bg-white
                    rounded-2xl
                    border
                    p-5
                    animate-pulse"
                >

                    <div className="flex flex-col flex-1 gap-1">

                            <div className="h-6 w-full rounded bg-gray-300"/>

                            <div className="h-4 w-1/2 rounded bg-gray-200"/>

                            <div className="h-4 w-2/3 rounded bg-gray-200"/>

                            <div className="h-4 w-full mt-1 rounded bg-gray-200"/>

                            <div className="h-4 w-4/5 mt-1 rounded bg-gray-200"/>

                  </div>

                </div>

            ))}

        </div>

:

teachers.length===0 ?

<div className="bg-white rounded-xl shadow p-10 text-center" >

No accepted teachers yet.

</div>

:
<div className="grid grid-cols-1 gap-2">

  {teachers.map((teacher) => {
    
    return (

    <div
      key={`${teacher.type}-${teacher.teacher_id}`}
      className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition duration-300 overflow-hidden"
    >

      <div className="p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">


          <div className="flex items-center gap-5">

            {teacher.logo ? (

              <img
                src={teacher.logo}
                alt=""
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
              />

            ) : (

              <div className="w-24 h-24 rounded-full bg-blue-700 text-white flex items-center justify-center text-4xl font-bold">

                {teacher.first_name.charAt(0)}

              </div>

            )}

            <div>

              <h2 className="text-2xl font-bold text-gray-900">

                {teacher.first_name} {teacher.last_name}

              </h2>

              <p className="text-gray-500 mt-1">

                Professional Arabic Teacher

              </p>

              <div className="flex flex-wrap gap-2 mt-3">

                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">

                  📖 {teacher.coursetitle_name}

                </span>

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">

                  🎓 {teacher.experience}

                </span>

              </div>

            </div>

          </div>


          <div className="flex flex-col gap-3 md:items-end">

            <div className="flex gap-5 text-gray-600 text-sm">

              <span className="flex items-center gap-2">

                📍 {teacher.location}

              </span>

              <span className="flex items-center gap-2 capitalize">

                👤 {teacher.gender}

              </span>

            </div>

            {teacher.review ? (

              <div className="text-right">

                <div className="flex justify-end items-center gap-1 text-yellow-500 text-xl">

                  {"★".repeat(teacher.review.rating)}

                  <span className="text-gray-300">

                    {"★".repeat(5 - teacher.review.rating)}

                  </span>

                </div>

                <span className="text-green-600 font-semibold text-sm">

                  Review Submitted

                </span>

              </div>

            ) : (

              <button
                onClick={() => {
                  setSelectedTeacher(teacher);
                }}
                className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow"
              >

                ⭐ Leave Review

              </button>

            )}

          </div>

        </div>


        {teacher.review && (

          <div className="mt-6 border-t pt-5">

            <h4 className="font-semibold text-gray-800 mb-3">

              Your Review

            </h4>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-gray-700 leading-7">

                "{teacher.review.review}"

              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  )})}

</div>
}

{
  selectedTeacher && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3">

      <SubmitTeacherReview
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        onSuccess={() => {
          setSelectedTeacher(null);   // Close the modal
          fetchTeachers();            // Refresh the teacher list
        }}
        rating={rating}
        review={review}
        setRating={setRating}
        setReview={setReview}
      />

    </div>
  )
}
</div>
    )
}

