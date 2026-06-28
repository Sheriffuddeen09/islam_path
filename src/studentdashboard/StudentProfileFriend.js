import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../layout/AuthProvider";

export default function StudentProfileFriend({setMessages, setActiveChat, togglePopup}) {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);
  const [btnLoading, setBtnLoading] = useState(false)
  const [loadingMessageId, setLoadingMessageId] = useState(null);

  useEffect(() => {
    if (!profileId) return;

    const fetchAccepted = async () => {
      try {
        const res = await api.get(`/api/student/profile/accepted/${profileId}`);
        // Each student object now includes a 'status' field
        setAcceptedStudents(res.data.acceptedStudents || []);
        setIsOwner(res.data.isOwner);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccepted();
  }, [profileId]);

  const sendFriendRequest = async (studentId) => {   // ✅ FIX 3
      setBtnLoading(true);
      try {
        await api.post("/api/student-friend/request", {
          student_id: studentId,
        });
        setAcceptedStudents([...acceptedStudents]);
        toast.success("Friend request sent");
      } catch (err) {
        toast.error(err.response?.data?.message || "Request failed");
      } finally {
        setBtnLoading(false);
      }
    };

  if (loading) return <Loader />


  const showMore = () =>
    setVisibleCount(prev => Math.min(prev + 4, acceptedStudents.length));
  const showLess = () => setVisibleCount(4);




  return (
    <div className="max-w-5xl mx-auto">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2  py-2 px-4">
        <h3 className="text-lg text-[var(--text-color)] font-semibold border-b-2 border-blue-400 w-full pb-2">
          Friend's ({acceptedStudents.length})
        </h3>
      </div>

      {/* GRID */}
      <div className="grid  rounded-lg  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-3 gap-3 md:gap-3 lg:gap-30 items-center justify-items-center">
        {acceptedStudents.slice(0, visibleCount).map(student => {
          const status = student.status ?? 'none'; 
          const isOwnerUser = user?.id === student.id;


          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border-2  border-blue-500 sm:w-60 w-40 h-40 sm:h-full mx-auto px-3 shadow py-3 sm:py-6 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {/* Avatar */}
              <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-[55px] font-bold">
                {student.first_name?.[0]}
              </div>

              {/* Name */}
             <p className="mt-1 font-semibold text-gray-800">
                {isOwnerUser ? "You" : `${student.first_name} ${student.last_name?.[0]}`}
              </p>

                    {isOwnerUser ? (
                      <button
                        disabled
                        className="mt-1 px-4 py-3 text-sm rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      >
                        None
                      </button>
                    ) : status === "accepted" ? (
                      <button
                        onClick={async () => {
                          try {
                            setLoadingMessageId(student.id);
  
                            const { data } = await api.get(
                              `/api/chat/user/${student.id}`
                            );
  
                            setActiveChat(data.chat);
                            setMessages(data.messages);
  
                            togglePopup();
                          } catch (err) {
                            toast.error("Failed to open chat");
                            console.error(err);
                          } finally {
                            setLoadingMessageId(null);
                          }
                        }}
                        disabled={loadingMessageId === student.id}
                        className="mt-1 px-4 py-3 text-sm rounded-lg bg-blue-800 hover:bg-blue-700 text-white"
                      >
                        {loadingMessageId === student.id ? (
                          <span
                            className="
                              animate-spin
                              h-4
                              w-4
                              border-2
                              border-white
                              border-t-transparent
                              rounded-full
                              inline-flex
                            "
                          />
                        ) : (
                          "💬 Message"
                        )}
                      </button>
                    ) : status === "pending" ? (
                      <button
                        disabled
                        className="mt-3 w-full bg-gray-400 text-white text-sm py-2 rounded-lg cursor-not-allowed"
                      >
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => sendFriendRequest(student.id)}
                        className="text-white whitespace-nowrap bg-blue-800 mt-2 px-5 py-2 rounded"
                      >
                        {btnLoading ? (
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                        ) : (
                          "➕ Add Friend"
                        )}
                      </button>
                    )}
  
            </div>
          );
        })}
      </div>

      {/* SEE MORE / LESS */}
      <div className="flex justify-center mt-6">
        {visibleCount < acceptedStudents.length ? (
          <button
            onClick={showMore}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-semibold"
          >
            See more
          </button>
        ) : acceptedStudents.length > 4 ? (
          <button
            onClick={showLess}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-semibold"
          >
            Show less
          </button>
        ) : null}
      </div>
    </div>
  );
}


function Loader() {
  return (
    <div className="animate-pulse w-full">

      <div className="w-full px-4 flex flex-row justify-center mx-auto gap-2">
        
        <div className="bg-gray-500 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

         <div className="bg-gray-500 border sm:block hidden border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

         <div className="bg-gray-500 border lg:block hidden border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}