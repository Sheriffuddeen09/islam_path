import { Link } from "react-router-dom";
import api from "../../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../layout/AuthProvider";



export default function StudentFriendCard({loadingId, requestStatus, setLoadingId, student, setStudents, 
                                           setRequestStatus, getInitial, getColor}) {
 
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
    toast.error(err.response?.data?.message);
  } finally {
    setLoadingId(null);
  }
};


  const removeTemporarily = async (studentId) => {
  try {
    await api.post(`/api/student-request/hide/${studentId}`);
    toast.success("Friend Remove");

    setStudents(prev => prev.filter(p => p.id !== studentId));
  } catch (err) {
    console.error(err);
  }
};

  



  return (
    <>
    <div className=""> 
   
   <Toaster position="top-right" />

    <div className="relative inline-flex flex-wrap">
        <div
    key={student.id}
    className="bg-white rounded-lg w-64 lg:w-56 md:w-60 h-72 overflow-hidden shadow-xl border border-gray-300 group px-4 py-2 transform transition duration-300 flex flex-col mx-auto justify-center relative"
  > 
      <Link to={`/profile/${student.id}`}>
        <div className={`sm:w-32 sm:h-32 w-24 h-24 rounded-full flex items-center 
        justify-center text-[80px] font-bold text-white mx-auto ${getColor(student.first_name)}`}>
          {getInitial(student.first_name)}
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

          {requestStatus[student.id] === "accepted" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Accepted
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
            onClick={(e) => {
              e.stopPropagation();
              removeTemporarily(student.id);
            }}

      >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 absolute right-4 
                 text-black sm:right-4 top-2 p-1  bg-gray-200 rounded-full">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
              </button>
       
    </div>
    </div>
    </>

  );
}
