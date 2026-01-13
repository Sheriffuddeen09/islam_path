import { useEffect, useState } from "react";
import api from "../../Api/axios";
import Navbar from "../../layout/Header";
import FriendCard from "./FriendCard";
import toast, { Toaster } from "react-hot-toast";

export default function StudentFriend({students, setStudents}) {
 
  const [requestStatus, setRequestStatus] = useState({});
  const [requests, setRequests] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);




  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get("/api/student-friend"); 
        setStudents(res.data.students || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);



const respond = async (id, action) => {
  await api.post(`/api/student-requests/${id}/respond`, { action });

  // remove instantly from UI
  setIncomingRequests(prev =>
    prev.filter(r => r.id !== id)
  );

  toast.success(`Request ${action}`);
};

useEffect(() => {
  api.get("/api/student-friend/all-requests")
    .then(res => {
      setIncomingRequests(res.data.requests || []);
    })
    .catch(() => setIncomingRequests([]));
}, []);


useEffect(() => {
  api.get("/api/student-friend/my-requests")
    .then(res => {
      setMyRequests(res.data.requests || []);
    })
    .catch(() => setMyRequests([]));
}, []);


if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

const myRequestList = (
  <div className="max-w-xl space-y-3">
    {myRequests.map(req => (
      <div
        key={req.id}
        className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
      >
        <div className="flex items-center gap-3">
          <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center mx-auto justify-center text-[102px] font-bold text-gray-600">
          {req.student?.first_name?.[0]}
        </div>
          <div>
            <p className="font-semibold">
              {req.student?.first_name} {req.student?.last_name}
            </p>
            <p className="text-sm font-bold bg-gray-800 p-1 text-black">
              Pending request
            </p>
          </div>
        </div>
      </div>
    ))}

  </div>

)
const requestList = (
  <div className="space-y-3 w-full max-w-xl">
    {incomingRequests.map(req => (
      <div
        key={req.id}
        className="flex items-center justify-between bg-white p-4 rounded shadow"
      >
        <div className="flex items-center gap-3">
           <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center mx-auto justify-center text-[102px] font-bold text-gray-600">
          {req.requester?.first_name?.[0]}
        </div>
          <div>
            <p className="font-semibold">
              {req.requester?.first_name} {req.requester?.last_name}
            </p>
            <p className="text-xs text-gray-500">sent you a request</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => respond(req.id, "accepted")}
            className="px-3 py-1 bg-green-600 hover:bg-green700 py-2 px-3 font-semibold text-sm text-white rounded"
          >
            Accept
          </button>

          <button
            onClick={() => respond(req.id, "declined")}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 py-2 px-3 font-semibold text-sm text-white rounded"
          >
            Decline
          </button>
        </div>
      </div>
    ))}

  </div>
);

  return (
    <>
    <Navbar />
   
   <Toaster position="top-right" />
      <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-800">
        {/* Sidebar */}
        <aside
          className={`fixed hidden md:block top-[85px] left-2 rounded-xl h-full lg:w-64 md:w-44 md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-5">FRIEND REQUEST</h3>
         
        
        </aside>

        {/* Main Content */}
        <div className="flex-1 transition-all p-4 mt-20 lg:ml-64 md:ml-40">
          {myRequests.length === 1 && (
            <p className="text-lg text-black font-bold text-start border-b p-2 "> Pending Friend </p>
          )}
          {incomingRequests.length === 1 && (
            <p className="text-lg text-black font-bold text-start border-b p-2 "> Friend Request </p>
          )}
            {requestList}
            {myRequestList}
         
            <>
             {students.length === 1 && (
            <p className="text-lg text-black font-bold text-start border-b p-2 "> Friend You May Know </p>
          )}
              {/* Video List */}
              <ul className="grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3  
  justify-items-center items-center
  gap-3  w-full">
                {students.map((student) => (
            
                  <li key={student.id}>

                  {/* Admin Details */}

                {/* Video Thumbnail */}
                <div>
                 <FriendCard student={student}
                 loadingId={loadingId} notification={notification} setLoadingId={setLoadingId}
                 setRequestStatus={setRequestStatus} requestStatus={requestStatus}
                 />
                </div>
              </li>

                ))}
              </ul>
              {/* --- LIKE • COMMENT • SHARE BAR --- */}
      
            </>
         
          {students.length === 0 && (
            <p className="text-sm text-gray-500 mt-6">No Friend Available</p>
          )}
        
        </div>
  </div>
  </>
  );
}

