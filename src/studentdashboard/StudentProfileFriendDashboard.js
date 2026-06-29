import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../layout/AuthProvider";

export default function StudentProfileFriendDashboard({togglePopup, setActiveChat, setMessages}) {

  const navigate = useNavigate();
  const { user } = useAuth();



  const [acceptedStudents, setAcceptedStudents] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [btnLoading, setBtnLoading] = useState(false)
  const [loadingMessageId, setLoadingMessageId] = useState(null);
  const [showAllStudentsModal, setShowAllStudentsModal] = useState(false);

  useEffect(() => {
  

    const fetchAccepted = async () => {
      try {
        const res = await api.get(`/api/student/me`);
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
  }, []);

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

  if (loading) return (
      <div className="flex items-center justify-center mt-10">
      </div>
    );

  if (!acceptedStudents.length) {
    return (
      <p className="text-gray-500 text-center mt-6">
       
      </p>
    );
  }

  const showMore = () =>
    setVisibleCount(prev => Math.min(prev + 4, acceptedStudents.length));
  const showLess = () => setVisibleCount(4);

  return (
    <div className="mt-6 max-w-5xl lg:ml-64 mx-auto">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg text-[var(--text-color)] font-semibold">
          Friend's ({acceptedStudents.length})
        </h3>
      </div>

      {/* GRID */}
      <div className="grid  rounded-lg  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-3 gap-3 md:gap-3 lg:gap-30 items-center justify-items-center">
        {acceptedStudents.slice(0, 2).map(student => {
          const status = student.status ?? 'none'; // ✅ use the status from backend
          const isOwnerUser = user?.id === student.id;

          return (
            <div
              key={student.id}
              className="bg-white rounded-xl border-2  border-blue-500 sm:w-52 w-40 h-40 sm:h-full mx-auto px-3 shadow py-3 sm:py-6 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {/* Avatar */}
               <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-[55px] font-bold">
                {student.first_name?.[0]}
              </div>

              {/* Name */}
             <p className="mt-2 font-semibold text-gray-800">
                {isOwnerUser ? "You" : `${student.first_name} ${student.last_name?.[0]}`}
              </p>

              {/* BUTTON */}
              {isOwner || status === "accepted" ? (
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
                  disabled={isOwnerUser || loadingMessageId === student.id}
           className={`mt-1 px-4  text-sm py-3 rounded-lg ${isOwnerUser ? 'bg-gray-100 text-gray-500' : "bg-blue-800 hover:bg-blue-700 text-white"}`}
        >{ loadingMessageId === student.id ?
          <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />
          :
          "💬 Message"
          }
        </button>

              ) : status === "pending" ? (
                <button
                  disabled
                  className="mt-3 w-full bg-gray-400 text-white text-sm py-2 rounded-lg cursor-not-allowed"
                >
                  Pending
                </button>
              ) : (
                <button onClick={sendFriendRequest} className="bg-blue-800 mt-2 w-52 px-5 py-2 rounded">
                {
                  btnLoading ?
                  <p className=" rounded-lg text-xs flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          </p>
                :
                "➕ Add Friend"
              }
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
              onClick={() => setShowAllStudentsModal(true)}
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

      {showAllStudentsModal && (
  <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-xl font-bold">
            Friend's
          </h2>
          <p className="text-sm text-gray-500">
            {acceptedStudents.length} 
          </p>
        </div>

        <button
          onClick={() => setShowAllStudentsModal(false)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[75vh] p-5">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {acceptedStudents.map(student => {

            const status = student.status ?? "none";
            const isOwnerUser = user?.id === student.id;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border-2 border-blue-500 sm:w-60 w-40 h-40 sm:h-full mx-auto px-3 shadow py-3 sm:py-6 flex flex-col items-center text-center hover:shadow-lg transition"
              >

                {/* Avatar */}
                <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-[55px] font-bold">
                  {student.first_name?.[0]}
                </div>

                {/* Name */}
                <p className="mt-2 font-semibold text-gray-800">
                  {isOwnerUser
                    ? "You"
                    : `${student.first_name} ${student.last_name?.[0]}`}
                </p>

                {/* Button */}
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

                        setShowAllStudentsModal(false);
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
                        className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-flex"
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
      </div>

    </div>
  </div>
)}
    </div>
  );
}
