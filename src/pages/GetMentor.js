import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useAuth } from "../layout/AuthProvider";

import MentorCard from "./MentorCard";

export default function GetMentor({teachers, setTeachers, requestStatus, setRequestStatus}) {
  const { user } = useAuth();
  const authReady = user !== null;

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [coursetitles, setCoursetitles] = useState([]);
  const [selectedCoursetitles, setSelectedCoursetitles] = useState("");



  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/api/teacher"); 
         const categoriesRes = await api.get("/api/coursetitles");
        setTeachers(res.data.teachers || []);
        setCoursetitles(categoriesRes.data || [])
      } catch (error) {
        console.error("Error fetching teachers:", error);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const sendLiveRequest = async (teacherId) => {
  await api.post("/api/live-class/request", { teacher_id: teacherId });

  setTeachers(prev =>
    prev.filter(t => t.id !== teacherId)
  );
};


useEffect(() => {
  const fetchRequestStatus = async () => {
    try {
      const res = await api.get("/api/live-class/my-requests");
      const statusObj = {};
      res.data.requests.forEach(r => {
        statusObj[r.teacher_id] = r.status;
      });
      setRequestStatus(statusObj);
    } catch (err) {
      console.error(err);
    }
  };

  fetchRequestStatus();
}, []);


  const handleRequest = async (teacherId) => {
  if (loadingId !== null) return;

  if (!authReady) return;

  if (user.role === "admin") {
    setNotification({ type: "error", text: "Admins cannot send requests" });
    return;
  }

  setLoadingId(teacherId);

  try {
    await sendLiveRequest(teacherId);

    setRequestStatus((prev) => ({
      ...prev,
      [teacherId]: "pending",
    }));

    setNotification({ type: "success", text: "Request sent" });
  } catch (err) {
    setNotification({
      type: "error",
      text: err.response?.data?.message || "Request failed",
    });
  } finally {
    setLoadingId(null); // ✅ THIS FIXES THE STUCK LOADING
  }
};


  useEffect(() => {
  if (!notification) return;

  const timer = setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [notification]);


const filteredCourse = teachers
  // 1️⃣ Filter by course (if selected)
  .filter(t =>
    selectedCoursetitles
      ? Number(t.coursetitle_id) === Number(selectedCoursetitles)
      : true
  )
  // 2️⃣ Remove pending & accepted
  .filter(t =>
    requestStatus[t.id] !== "pending" &&
    requestStatus[t.id] !== "accepted"
  );



  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  return (
    <>
    
   
      <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-800">
        {/* Sidebar */}
        <aside
          className={`fixed hidden md:block top-[85px] left-2 rounded-xl h-full lg:w-64 md:w-44 md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-5">FILTER TEACHER COURSE</h3>
          <ul className="space-y-4 mb-">
            <li
              onClick={() => setSelectedCoursetitles(null)}
              style={{
                  margin: 5
                }}
              className={`cursor-pointer p-2 text-sm rounded-lg mb-5 ${
                !selectedCoursetitles
                  ? "bg-blue-500 text-white hover:bg-gray-100 hover:text-black font-semibold"
                  : "hover:bg-gray-200 bg-transparent text-black font-semibold"
              }`}
            >
              All Teacher
            </li>

            {coursetitles.map((course) => (
              <li
                key={course.id}
                onClick={() => setSelectedCoursetitles(course.id)} style={{
                  margin: 5
                }}
                className={`cursor-pointer px-2 py-2 -my-3 space-y-0 rounded-lg capitalize ${
                  selectedCoursetitles === course.id ? "bg-blue-500 text-white" : "hover:text-gray-500 hover:bg-blue-100 text-black font-semibold"
                }`}
              >
                {course.name}
              </li>
            ))}
          </ul>
        </aside>

<div className="md:hidden block">
        <ul className="flex space-x-1 w-full py-2 px-2 -mb-16 mt-24 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
  <li
    onClick={() => setSelectedCoursetitles(null)}
    className={`cursor-pointer whitespace-nowrap px-4 py-1 font-semibold w-24 h-10 mx-auto flex flex-col items-center justify-center  rounded-lg ${
      !selectedCoursetitles
        ? "bg-blue-500 text-white"
        : "bg-gray-200 bg-transparent"
    }`}
  >
    All Teacher 
  </li>

  {coursetitles.map((course) => (
    <li
      key={course.id}
      onClick={() => setSelectedCoursetitles(course.id)}
      className={`cursor-pointer whitespace-nowrap mx-auto flex flex-col items-center justify-center px-4 py-1 font-semibold h-10  rounded-lg ${
        selectedCoursetitles === course.id
          ? "bg-blue-500 text-white font-semibold"
          : "hover:text-gray-500  bg-gray-100 text-black font-semibold"
      }`}
    >
      {course.name}
    </li>
  ))}
</ul>
</div>
        {/* Main Content */}
        <div className="flex-1 transition-all p-4 mt-20 lg:ml-64 md:ml-40 flex flex-col items-center">
          {loading ? (
            // Skeleton loader lg:ml
            <div className="space-y-4 w-full max-w-md">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-300 rounded" />
                  <div className="h-2 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-10 bg-gray-300 rounded" />
                  <div className="h-3 bg-gray-300 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredCourse.length > 0 ? (
            <>
              {/* Video List */}
              <ul className="grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3  
  justify-items-center items-center
  gap-3  w-full">
                {filteredCourse.map((t) => (
            
                  <li key={t.id}>

                  {/* Admin Details */}

                {/* Video Thumbnail */}
                <div>
                 <MentorCard t={t} selectedTeacher={selectedTeacher} handleRequest={handleRequest}
                 loadingId={loadingId} notification={notification} filteredCourse={filteredCourse}
                 setRequestStatus={setRequestStatus} requestStatus={requestStatus} setSelectedTeacher={setSelectedTeacher}
                 />
                </div>
              </li>

                ))}
              </ul>
              {/* --- LIKE • COMMENT • SHARE BAR --- */}
      
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-6">No Teacher Course available</p>
          )}
        </div>
  </div>
  </>
  );
}

