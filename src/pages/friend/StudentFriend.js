import { useEffect, useState } from "react";
import api from "../../Api/axios";
import StudentFriendCard from "./StudentFriendCard";
import toast, { Toaster } from "react-hot-toast";
import SidebarLeft from "./SidebarLeft";
import { useNavigate } from "react-router-dom";

export default function StudentFriend({students, setStudents, setIncomingRequests, incomingRequests}) {
 
  const [requestStatus, setRequestStatus] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [visibleMyRequests, setVisibleMyRequests] = useState(2);
  const [visibleIncomingRequests, setVisibleIncomingRequests] = useState(2);
  const [showSeeLess, setShowSeeLess] = useState(false);
  const [showIncomingSeeLess, setShowIncomingSeeLess] = useState(false);


  const navigate = useNavigate()


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

  if (loadingAction) return;

  setLoadingAction({ id, action });

  try{

  await api.post(`/api/student-friend/respond/${id}`, { action });

  // remove instantly from UI
  setIncomingRequests(prev =>
    prev.filter(r => r.id !== id)
  );

  toast.success(`Request ${action}`);
  }

  catch (err) {
      console.error("Failed to respond", err);
      toast.error("Something went wrong!");
    } finally {
      setLoadingAction(null);
    }
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


useEffect(() => {
  setShowSeeLess(false);
  setVisibleMyRequests(2);
}, [myRequests.length]);

useEffect(() => {
  setShowIncomingSeeLess(false);
  setVisibleIncomingRequests(2);
}, [incomingRequests.length]);

if (loading) {
  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-color)]">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:block mt-20 lg:w-72 p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 rounded-lg"
              />
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-4 mt-20">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow"
              >
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200" />

                    {/* Text */}
                    <div className="space-y-3">
                      <div className="h-5 w-40 bg-gray-200 rounded" />
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <div className="h-10 sm:w-24 w-20 bg-gray-200 rounded" />
                    <div className="h-10 sm:w-24 w-20 bg-gray-200 rounded" />
                    <div className="h-10 sm:w-28 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}

  const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }; 


const myRequestList = (
  <div className="w-full space-y-3 mt-2">
    {myRequests
      .slice(0, visibleMyRequests)
      .map(req => (
        <div
          key={req.id}
          className="flex items-center mb-10 justify-between flex-wrap bg-white p-4 rounded-lg shadow border border-green-300"
        >
          {/* Left Side
          
          */}
          <div className="flex items-center gap-3">
            <div className={`sm:w-32 sm:h-32 w-24 h-24 rounded-full flex items-center 
            justify-center text-[80px] font-bold text-white ${getColor(req.student?.first_name)}`}>
              {getInitial(req.student?.first_name)}
            </div>
            <div>
              <p className="font-semibold text-black">
                {req.student?.first_name}{" "}
                {req.student?.last_name}
              </p>

              <p className="text-sm mt-2 font-bold bg-gray-800 p-1 text-white rounded px-3 py-1 inline-block">
                Pending request
              </p>
            </div>
          </div>

          {/* Right Side */}
          <button
            onClick={() =>
              navigate(
                `/profile/${req.student?.id}`
              )
            }
            className="
              px-4
              py-2
              bg-blue-600
              hover:bg-blue-700
              text-white
              rounded-lg
              font-medium
              transition
            "
          >
            View Profile
          </button>
        </div>
      ))}

    
    {myRequests.length > 2 && (
  <button
    onClick={() => {
      if (!showSeeLess) {
        const next = visibleMyRequests + 2;

        if (next >= myRequests.length) {
          setVisibleMyRequests(myRequests.length);
          setShowSeeLess(true);
        } else {
          setVisibleMyRequests(next);
        }
      } else {
        setVisibleMyRequests(2);
        setShowSeeLess(false);
      }
    }}
    className="w-32 float-right mt-3 mb-10 py-2 text-blue-700 hover:text-blue-800 rounded font-bold text-sm"
  >
    {showSeeLess ? "See less" : "See more"}
  </button>
)}
   
  </div>
);


const requestList = (
  <div className="space-y-3 w-full mt-2">
      {incomingRequests.slice(0, visibleIncomingRequests).map(req => (

      <div
        key={req.id}
        className="flex items-center mb-10 justify-between flex-wrap bg-white p-4 rounded-lg shadow border border-green-300"
      >
        <div 
         onClick={() =>
            navigate(
              `/profile/${req.requester?.id}`
            )
          }
        className="flex items-center gap-3 cursor-pointer">
          {/*  */}
           <div className={`sm:w-32 sm:h-32 w-24 h-24 rounded-full mb-4 flex 
           items-center mx-auto justify-center text-[80px] font-bold text-white ${getColor(req.requester?.first_name)}`}>
          {getInitial(req.requester?.first_name)}
        </div>
          <div>
            <p className="font-semibold text-lg text-black">
              {req.requester?.first_name} {req.requester?.last_name}
            </p>
            <p className="text-sm text-gray-500">sent you a request</p>
          </div>
        </div>

        <div className="flex gap-2 float-right">
          <button
            onClick={() => respond(req.id, "accepted")}
            disabled={
            loadingAction?.id === req.id &&
            loadingAction?.action === "accepted"
          }
            className="px-3 py-1 bg-green-600 hover:bg-green-700 py-2 px-3 font-semibold text-sm text-white rounded"
          >
            {loadingAction?.id === req.id &&
            loadingAction?.action === "accepted" ? (
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
            ) : (
              "Accept"
            )}
          </button>

          <button
            onClick={() => respond(req.id, "declined")}
             disabled={
            loadingAction?.id === req.id &&
            loadingAction?.action === "declined"
          }
            className="px-3 py-1 bg-red-600 hover:bg-red-700 py-2 px-3 font-semibold text-sm text-white rounded"
          >
            {loadingAction?.id === req.id &&
              loadingAction?.action === "declined" ? (
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
              ) : (
                "Decline"
              )}
          </button>
        </div>
      </div>
    ))}

     {incomingRequests.length > 2 && (
  <button
    onClick={() => {
      if (!showIncomingSeeLess) {
        const next = visibleIncomingRequests + 2;

        if (next >= incomingRequests.length) {
          setVisibleIncomingRequests(incomingRequests.length);
          setShowIncomingSeeLess(true);
        } else {
          setVisibleIncomingRequests(next);
        }
      } else {
        setVisibleIncomingRequests(2);
        setShowIncomingSeeLess(false);
      }
    }}
    className="w-32 float-right mt-3 py-2 text-blue-700 hover:text-blue-800 rounded font-semibold"
  >
    {showIncomingSeeLess ? "See less" : "See more"}
  </button>
)}


  </div>
);

  return (
    <>
    
   
   <Toaster position="top-right" />
          <div className="flex min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] ">

           <SidebarLeft />

        {/* Main Content */}
        <div className="flex-1 transition-all p-4 mt-20 lg:ml-72">
          {myRequests.length === 1 && (
            <p className="text-lg  font-bold text-start border-b p-2 "> Pending Friend </p>
          )}
          {incomingRequests.length === 1 && (
            <p className="text-lg  font-bold text-start border-b p-2 "> Friend Request </p>
          )}
            {requestList}
            {myRequestList}
         
            <>
             
            <p className="text-lg mb-4  font-bold text-start border-b-2 border-blue-800 pb-2 "> Friend You May Know </p>
              {/* Video List */}
              <ul className="grid 
                grid-cols-1 
                md:grid-cols-3
                lg:grid-cols-4  sm:gap-2 gap-2
                justify-items-center items-center
                w-full">
                {students.map((student) => (
            
                  <li key={student.id}>

                  {/* Admin Details */}

                {/* Video Thumbnail */}
                <div>
                 <StudentFriendCard student={student}
                 loadingId={loadingId} notification={notification} setLoadingId={setLoadingId}
                 setRequestStatus={setRequestStatus} requestStatus={requestStatus} setStudents={setStudents}
                 getColor={getColor} getInitial={getInitial}
                 />
                </div>
              </li>

                ))}
              </ul>
              {/* --- LIKE • COMMENT • SHARE BAR --- */}
      
            </>
         
          {students.length === 0 && (
            <p className="text-lg sm:text-xl text-center lg:ml-64 font-bold text-start p-2 ">No Friend Available</p>
          )}
        
        </div>
  </div>
  </>
  );
}

