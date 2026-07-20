import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";

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
  const [teacherReviews, setTeacherReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

useEffect(() => {
  if (!selectedTeacher) return;

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);

      const res = await api.get("/api/teacher/reviews", {
        params: {
          teacher_id: selectedTeacher.id,
        },
      });

      setTeacherReviews(res.data.reviews || []);
      setAverageRating(res.data.average_rating || 0);
      setReviewCount(res.data.review_count || 0);
    } catch (err) {
      console.log(err);

      setTeacherReviews([]);
      setAverageRating(0);
      setReviewCount(0);
    } finally {
      setReviewLoading(false);
    }
  };

  fetchReviews();
}, [selectedTeacher]);


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


if (loading) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-color)]">

      {/* Sidebar */}
      <aside className="hidden lg:block lg:w-72 p-4 mt-20">
        <div className="animate-pulse space-y-4">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 rounded-lg"
            />
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg h-64 overflow-hidden shadow-xl border border-gray-300 p-4 animate-pulse relative"
            >
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4" />

              {/* Name */}
              <div className="h-4 w-40 bg-gray-200 rounded mx-auto mb-2" />

              {/* Course */}
              <div className="h-3 w-28 bg-gray-200 rounded mx-auto mb-2" />

              {/* Experience */}
              <div className="h-4 w-full bg-gray-200 rounded mx-auto mb-4" />

              {/* Description */}
              

              {/* Buttons */}
              <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-gray-200 flex justify-center items-center gap-2">
                <div className="h-9 w-28 bg-gray-200 rounded"></div>
                <div className="h-9 w-28 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}


  return (
    <>
    
   
      <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
        {/* Sidebar */}
        <aside
          className={`fixed hidden lg:block top-[85px] left-2 rounded-xl h-full lg:w-64 lg:py-4 
            bg-[var(--bg-color)] text-[var(--text-color)] border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-5">FILTER TEACHER COURSE</h3>
          <ul className="space-y-2 mb-">
            <li
              onClick={() => setSelectedCoursetitles(null)}
              style={{
                  margin: 2
                }}
              className={`cursor-pointer p-2 text-sm rounded-lg mb-5 ${
                !selectedCoursetitles
                  ? "bg-blue-500 hover:bg-gray-100 text-white hover:text-black font-semibold"
                  : "hover:bg-gray-200 bg-transparent font-semibold text-[var(--text-color)]"
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
                  selectedCoursetitles === course.id ? "bg-blue-500 text-white"
                  : "bg-gray-200 bg-transparent text-[var(--text-color)]"
                }`}
              >
                {course.name}
              </li>
            ))}
          </ul>
        </aside>

<div className="lg:hidden block">
        <ul className="flex space-x-1 w-80 md:w-[700px] py-2 px-2 -mb-16 mt-24 items-center mx-auto overflow-x-auto overflow-y-hidden 
        scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">
  <li
    onClick={() => setSelectedCoursetitles(null)}
    className={`cursor-pointer whitespace-nowrap px-4 py-1 font-semibold w-24 h-10 mx-auto flex flex-col items-center justify-center  rounded-lg ${
      !selectedCoursetitles
        ? "bg-blue-500 text-white"
        : "bg-gray-200 bg-transparent text-[var(--text-color)]"
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
          ? "bg-blue-500 text-white"
        : "bg-gray-200 bg-transparent text-[var(--text-color)]"
      }`}
    >
      {course.name}
    </li>
  ))}
</ul>
</div>
        {/* Main Content */}
        <div className="flex-1 transition-all p-4 lg:mt-20 mt-10 lg:ml-64 flex flex-col items-center">
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
              md:grid-cols-3 lg:grid-cols-4  
              space-x-3 space-y-0
              justify-items-center items-center
              w-full">
                {filteredCourse.map((t) => (
            
                  <li key={t.id}>

                  {/* Admin Details */}

                {/* Video Thumbnail */}
                <div>
                 <MentorCard t={t} selectedTeacher={selectedTeacher} 
                 loadingId={loadingId} notification={notification} filteredCourse={filteredCourse}
                 setRequestStatus={setRequestStatus} requestStatus={requestStatus} 
                 setSelectedTeacher={setSelectedTeacher} setLoadingId={setLoadingId} 
                 setNotification={setNotification} sendLiveRequest={sendLiveRequest}
                  user={user} authReady={authReady} teacherReviews={teacherReviews}
                  reviewCount={reviewCount} reviewLoading={reviewLoading}
                  averageRating={averageRating}
                 />
                </div>
              </li>

                ))}
              </ul>
              {/* --- LIKE • COMMENT • SHARE BAR --- */}
      
            </>
          ) : (
            <p className="text-sm text-[var(--text-color)] mt-6">No Teacher Course available</p>
          )}
        </div>
  </div>
  </>
  );
}

