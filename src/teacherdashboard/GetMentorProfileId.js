import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useAuth } from "../layout/AuthProvider";
import { useParams } from "react-router-dom";
import { Lock } from "lucide-react";

export default function GetMentorProfileId() {
  const { user } = useAuth();
  const authReady = user !== null;

  const [requestStatus, setRequestStatus] = useState({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [teacher, setTeacher] = useState(null);

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [loadingUnlock, setLoadingUnlock] = useState(false);

  
 const [badges, setBadges] = useState({
  total: 0,
});


useEffect(() => {
  api.get("/api/student/badges")
    .then(res => {
      setBadges(res.data);
    })
    .catch(() => {
      setBadges({ total: 0});
    });
}, []);


const [error, setError] = useState("");

  const {id} = useParams()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/api/teacher-single/${id}`);

        if (!res.data.status) {
          setError(res.data.message);
        } else {
          setTeacher(res.data.teacher);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Teacher profile not completed");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

 
 


   const sendLiveRequest = async (teacherId) => {
    return api.post("/api/live-class/request", {
      teacher_id: teacherId,
    });
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
    finally{
      setLoadingId(false)
    }
  };

  fetchRequestStatus();
}, []);


  const handleRequest = async (teacherId) => {

    if (loadingId) return;

  setLoadingId(teacherId);
    console.log("HANDLE REQUEST START", teacherId);

    if (!authReady) return;
    if (user.role === "admin") {
      setNotification({ type: "error", text: "Admins cannot send requests" });
      return;
    }

    setRequestLoading(true);

    try {
      await sendLiveRequest(teacherId);
      setNotification({ type: "success", text: "Request sent" });


      setRequestStatus(prev => ({
        ...prev,
        [teacherId]: "pending",
      }));

    } catch (err) {
      setNotification({
        type: "error",
        text: err.response?.data?.message || "Request failed",
      });
    } finally {
      setRequestLoading(false);
      setLoadingId(null);
    }
  };
  
const handleUnlock = async (teacherId) => {

  if (loadingId !== null) return;
    
  if (!authReady) return;
  setLoadingId(teacherId);

  if (user.role === "admin") {
    setNotification({ type: "error", text: "Admins cannot send requests" });
    return;
  }

  if (badges.total < 20) return;

  setLoadingUnlock(true);
  try {
   const res = await sendLiveRequest(teacherId);
   setRequestStatus((prev) => ({
    ...prev,
    [teacherId]: "pending",
  }));
    setBadges({ total: res.data.total }); // ✅ updated from backend
    setShowUnlockModal(false);
  setNotification({ type: "success", text: "Request sent" });
      } catch (err) {
        setNotification({
          type: "error",
          text: err.response?.data?.message || "Request failed",
        });
      } finally {
        setLoadingId(null); // ✅ THIS FIXES THE STUCK LOADING
    setLoadingUnlock(false);
  }
};



const handleWatchAd = async () => {
  if (adsWatched >= 6) return;

  try {
    const res = await api.post("/api/student/watch-ad");

    // backend should return new total
    setBadges({ total: res.data.total });
    setAdsWatched(prev => prev + 1);
  } catch (e) {
    console.error(e);
  }
};

  useEffect(() => {
  if (!notification) return;

  const timer = setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [notification]);


  if (loading)
    return (
      <div className="flex items-center mt-5 justify-center">
        <div className="animate-spin rounded-full h-6 w-6 my-10 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

     if (error) return <p className="text-red-600">{error}</p>;


 return (
  <>
    <div className="md:px-4 px-3 py-10 w-full mx-auto">
      {!teacher && (
        <p className="text-center text-gray-500 text-xl font-medium py-6">
          No teacher available
        </p>
      ) } 
        <div className="lg:-translate-x-7">
          
            <div
              key={teacher.id}
              className=" bg-gray-900 -mt-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden border"
            >
              {/* Avatar */}
              <div className="flex justify-between items-start sm:gap-10 gap-4 p-4">
                <div className="flex flex-wrap items-center sm:gap-10 gap-4">
                  {
                    teacher.logo &&(
                  
                  <img
                    src={teacher.logo || "/default-avatar.png"}
                    alt="Teacher"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
              )
                }
                <div>
                {teacher.course_payment && (
                  <p className="mt-3 text-lg text-white font-bold">
                    <span>Payment</span>
                    <br />
                    {teacher.currency} {teacher.course_payment}
                  </p>
                )}
                <div>
                <div className="flex gap-4 mt-3">
                  {/* CV */}
                  {teacher.cv ? (
                    <a
                      href={teacher.cv}
                      target="_blank"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3 rounded-xl transition"
                    >
                      View CV
                    </a>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white text-xs font-semibold px-5 py-3 rounded-xl cursor-not-allowed"
                    >
                      No CV
                    </button>
                  )}

                  {/* Request Button */}
                <button
                  onClick={() => setShowUnlockModal(true)}
                  className="text-white w-32 whitespace-nowrap bg-green-600 rounded-lg px-4 text-xs py-3 hover:bg-green-500">
                  Send Request
              </button>
                </div>
              </div>
              </div>
               

                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">

                {teacher.coursetitle_name && teacher.experience && (
                  <div className="text-sm sm:text-lg inline-flex items-center gap-6 font-semibold text-white mt-1">
                    <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                    </svg>

                {teacher.coursetitle_name}</span> <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm1.5 1.5a.75.75 0 0 0-.75.75V16.5a.75.75 0 0 0 1.085.67L12 15.089l4.165 2.083a.75.75 0 0 0 1.085-.671V5.25a.75.75 0 0 0-.75-.75h-9Z" clip-rule="evenodd" />
                </svg>

                {teacher.experience}</span>
                </div>
                )}
        <br />

                <div className="text-sm sm:text-lg inline-flex mt-5 items-center gap-6 font-semibold text-white mt-1">
                <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>

                {teacher.location}</span> <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>

                {teacher.gender}</span>
            </div>


                

                {teacher.qualification && (
                  <p className="mt-2 text-sm sm:text-[17px] text-white mt-4">
                <span className="inline-flex gap-2 mb-5 mt-5 items-center "> 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clip-rule="evenodd" />
                    </svg>
                    Qualification
                </span>
                <br />
                <span className="mt-2">
                {teacher.qualification}
                </span>
                
                  </p>
                )}

                {teacher.compliment && (
                  <p className="mt-6 text-sm sm:text-[17px] italic text-white">
                     <span className="inline-flex gap-2 mb-5 text-white"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 text-white">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clip-rule="evenodd" />
                    </svg>
                    Compliment
                    </span>
                  <br />
                    <span>
                    {teacher.compliment}
                    </span>
                  </p>
                )}
              </div>

              {/* Hover Actions */}
              
            </div>
         
        </div>

        {showUnlockModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-5 w-80 text-center relative">
      <div className="inline-flex items-end text-black gap-2">
      <Lock />
      <h2 className="font-bold text-lg  text-black ">Unlock Teacher</h2>
      </div>
    <hr />
      <button
        disabled={adsWatched >= 6}
        onClick={handleWatchAd}
        className={`w-44 text-xs py-1 mb-12 border-b-2 mt-10 flex justify-center text-center  rounded-lg  text-white ${
          adsWatched >= 6 ? "bg-gray-300" : "bg-blue-600 text-white"
        }`}
      >
        Watch Ad (+5 badges) ({adsWatched}/6)
      </button>
      <div className="flex text-black flex-col mb-10 gap-2">
        <Lock className="lock  p-1 w-8 h-8 mx-auto border-2 border-black rounded-full"/>
      <p className="font-bold text-lg ">Badges Required <b>20</b> 🏅</p>
      </div>
      <button
        disabled={badges.total < 20 || loadingUnlock}
        onClick={() => handleRequest(teacher.id)}
        className={`w-52  py-3 rounded-full font-bold z-50 text-white ${
          badges.total >= 20 ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loadingUnlock ? 
        <p className="flex items-center gap-2">
          <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
        </p>
        : "Unlock"}
      </button>

      {badges.total < 20 && (
        <p className="text-sm text-red-500 font-bold mt-2 text-xs ">
          Your badge is low. Watch ads or pass exam to earn badges.
        </p>
      )}

      <button
        onClick={() => setShowUnlockModal(false)}
        className="mt-3 top-0 right-2 absolute rounded-full"
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
      </button>
      <div className="inline-flex text-black mt-4 gap-2 items-center">
      <p className="font-bold text-sm">Balance: <b>{badges.total}</b> 🏅</p>
      </div>
    </div>
  </div>
)}

      {/* Toast */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl text-white shadow-lg transition
          ${
            notification.type === "success"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {notification.text}
        </div>
      )}
    </div>
  </>
);

}