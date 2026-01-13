import { Link } from "react-router-dom";
import api from "../../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../layout/AuthProvider";



export default function MentorCard({loadingId, requestStatus, setLoadingId, student, setStudents, setRequestStatus}) {
 
 const { user } = useAuth();
  const authReady = user !== null;

  const sendLiveRequest = async (studentId) => {
  return api.post("/api/student-friend/request", {
    student_id: studentId,
  });
};

  
  
    const handleRequest = async (studentId) => {
  if (loadingId !== null) return;
  if (!authReady) return;

  setLoadingId(studentId);

  try {
    await sendLiveRequest(studentId);

    setRequestStatus(prev => ({
      ...prev,
      [studentId]: "pending",
    }));

    toast.success("Request sent");

    // 🔥 Remove from list immediately
    setStudents(prev => prev.filter(s => s.id !== studentId));

  } catch (err) {
    toast.error(err.response?.data?.message || "Request failed");
  } finally {
    setLoadingId(null);
  }
};


  const removeTemporarily = async (studentId) => {
  await api.delete(`/api/requests/remove-temporary/${studentId}`);

  // remove instantly from UI
  setStudents(prev =>
    prev.filter(r => r.student_id !== studentId)
  );
};


  return (
    <>
    <div className="p-x4"> 
   
   <Toaster position="top-right" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative ">
        <div
    key={student.id}
    className="bg-white rounded-lg w-64 sm:w-60 h-72 overflow-hidden shadow-xl border border-gray-300 group px-4 py-2 transform transition duration-300 flex flex-col mx-auto justify-center relative"
  > 
      <Link to={`/profile/${student.id}`}>

        <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 text-center flex items-center mx-auto justify-center text-[102px] font-bold text-gray-600">
         <p> 
          {student.first_name?.[0]} 
         </p>
        </div>

          <h3 className="font-semibold text-xs mb-1 text-black text-center">
            {student.role}
          </h3>
        {(student.first_name || student.last_name) && (
          <h3 className="font-semibold text-lg mb-1 text-black text-center">
            {student.first_name} {student.last_name} 
          </h3>
        )}
       </Link>



          <button
  onClick={() => handleRequest(student.id)}
  disabled={loadingId === student.id}
  className="text-white"
>
  {loadingId === student.id ? (
    <p className="bg-gray-500 rounded-lg px-4 text-xs py-3 flex justify-center mx-auto items-center ">
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
  ) : (
    <>
          {requestStatus[student.id] === "declined" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Add Friend
            </p>
          )}
           {requestStatus[student.id] === "pending" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Pending
            </p>
          )}

          {!requestStatus[student.id] && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Add Friend
            </p>
          )}
        </>
      )}
    </button>

        </div>
        <button
                onClick={() => removeTemporarily(student.student_id)}
      >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 absolute right-10 sm:right-16 top-8 p-1  bg-gray-400 rounded-full">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
              </button>
       
    </div>
    </div>
    </>

  );
}
