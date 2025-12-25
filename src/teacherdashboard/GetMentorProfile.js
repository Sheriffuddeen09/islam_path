import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useAuth } from "../layout/AuthProvider";
import Navbar from "../layout/Header";

export default function GetMentorProfile({teachers, setTeachers, handleEdit}) {
  const { user } = useAuth();
  const authReady = user !== null;

  const [requestStatus, setRequestStatus] = useState({});
  const [requestLoading, setRequestLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingId, setLoadingId] = useState(null);


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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

 return (
  <>
    <div className="md:px-4 py-10 w-full mx-auto">
      {teachers.length === 0 ? (
        <p className="text-center text-gray-500 text-xl font-medium py-6">
          No teacher available
        </p>
      ) : (
        <div className="lg:-translate-x-7">
          {teachers.map((t) => (
            <div
              key={t.id}
              className=" bg-gray-900 -mt-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden border"
            >
              {/* Avatar */}
              <div className="flex justify-between items-start sm:gap-10 gap-4 p-4">
                <div className="flex flex-wrap items-center sm:gap-10 gap-4">
                  <img
                    src={t.logo || "/default-avatar.png"}
                    alt="Teacher"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div>
                {t.course_payment && (
                  <p className="mt-3 text-lg text-white font-bold">
                    <span>Payment</span>
                    <br />
                    {t.currency} {t.course_payment}
                  </p>
                )}
                <div>
                <div className="flex gap-4 mt-3">
                  {/* CV */}
                  {t.cv ? (
                    <a
                      href={t.cv}
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
                    onClick={() => handleRequest(t.id)}
                    disabled={loadingId === t.id}
                    className="text-white"
                  >
                    {loadingId === t.id ? (
                      <div className="bg-gray-500 px-5 py-3 rounded-xl flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      </div>
                    ) : (
                      <>
                        {requestStatus[t.id] === "pending" && (
                          <span className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl text-xs font-semibold">
                            Pending
                          </span>
                        )}

                        {requestStatus[t.id] === "accepted" && (
                          <span className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-xs font-semibold">
                            Accepted
                          </span>
                        )}

                        {requestStatus[t.id] === "declined" && (
                          <span className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl text-xs font-semibold">
                            Resend
                          </span>
                        )}

                        {!requestStatus[t.id] && (
                          <span className="bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl text-xs font-semibold">
                            Request Class
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>
               

                </div>
                <button
                   onClick={() => handleEdit(t)}
                    className="px-2 py-1 bg-white text-black flex flex-col items-center rounded hover:bg-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
            <path fill-rule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clip-rule="evenodd" />
          </svg>

            <span className="text-[8px]">Teacher</span>
        </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">

                {t.coursetitle_name && t.experience && (
                  <div className="text-sm sm:text-lg inline-flex items-center gap-6 font-semibold text-white mt-1">
                    <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                    <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                    </svg>

                {t.coursetitle_name}</span> <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm1.5 1.5a.75.75 0 0 0-.75.75V16.5a.75.75 0 0 0 1.085.67L12 15.089l4.165 2.083a.75.75 0 0 0 1.085-.671V5.25a.75.75 0 0 0-.75-.75h-9Z" clip-rule="evenodd" />
                </svg>

                {t.experience}</span>
                </div>
                )}
        <br />

                <div className="text-sm sm:text-lg inline-flex mt-5 items-center gap-6 font-semibold text-white mt-1">
                <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                <path fill-rule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" />
                </svg>

                {t.location}</span> <span className="inline-flex gap-2 items-center"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>

                {t.gender}</span>
            </div>


                

                {t.qualification && (
                  <p className="mt-2 text-sm sm:text-[17px] text-white mt-4">
                <span className="inline-flex gap-2 mb-5 mt-5 items-center "> 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clip-rule="evenodd" />
                    </svg>
                    Qualification
                </span>
                <br />
                <span className="mt-2">
                {t.qualification}
                </span>
                
                  </p>
                )}

                {t.compliment && (
                  <p className="mt-6 text-sm sm:text-[17px] italic text-white">
                     <span className="inline-flex gap-2 mb-5 text-white"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6 text-white">
                    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-4.28 9.22a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06l-1.72-1.72h5.69a.75.75 0 0 0 0-1.5h-5.69l1.72-1.72a.75.75 0 0 0-1.06-1.06l-3 3Z" clip-rule="evenodd" />
                    </svg>
                    Compliment
                    </span>
                  <br />
                    <span>
                    {t.compliment}
                    </span>
                  </p>
                )}
              </div>

              {/* Hover Actions */}
              
            </div>
          ))}
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