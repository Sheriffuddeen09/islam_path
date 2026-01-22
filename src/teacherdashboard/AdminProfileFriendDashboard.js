import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../layout/AuthProvider";
import { Loader } from "lucide-react";

export default function AdminProfileFriendDashboard() {

  const navigate = useNavigate();
  const { user } = useAuth();

  const [acceptedAdmins, setAcceptedAdmins] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [btnLoading, setBtnLoading] = useState(false)

  useEffect(() => {
  

    const fetchAccepted = async () => {
      try {
        const res = await api.get(`/api/admin/me`);
        // Each admin object now includes a 'status' field
        setAcceptedAdmins(res.data.acceptedAdmins || []);
        setIsOwner(res.data.isOwner);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccepted();
  }, []);

  const sendFriendRequest = async (adminId) => {   // ✅ FIX 3
      setBtnLoading(true);
      try {
        await api.post("/api/admin-friend/request", {
          admin_id: adminId,
        });
        setAcceptedAdmins([...acceptedAdmins]);
        toast.success("Friend request sent");
      } catch (err) {
        toast.error(err.response?.data?.message || "Request failed");
      } finally {
        setBtnLoading(false);
      }
    };

  if (loading) return (
      <div className="flex items-center justify-center mt-10">
        <div className="animate-spin rounded-full h-6 w-6 my-10 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  if (!acceptedAdmins.length) {
    return (
      <p className="text-gray-500 text-center mt-6">
       
      </p>
    );
  }

  const showMore = () =>
    setVisibleCount(prev => Math.min(prev + 4, acceptedAdmins.length));
  const showLess = () => setVisibleCount(4);

  return (
    <div className="mt-6 max-w-5xl lg:ml-64 mx-auto">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg text-black font-semibold">
          Admins ({acceptedAdmins.length})
        </h3>
      </div>

      {/* GRID */}
      <div className="grid  rounded-lg  grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-3 gap-3 md:gap-3 lg:gap-30 items-center justify-items-center">
        {acceptedAdmins.slice(0, visibleCount).map(admin => {
          const status = admin.status ?? 'none'; // ✅ use the status from backend
          const isOwnerUser = user?.id === admin.id;

          return (
            <div
              key={admin.id}
              className="bg-white rounded-xl border-2  border-blue-500 sm:w-52 w-40 h-40 sm:h-full mx-auto px-3 shadow py-3 sm:py-6 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {/* Avatar */}
               <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-[55px] font-bold">
                {admin.first_name?.[0]}
              </div>

              {/* Name */}
             <p className="mt-2 font-semibold text-gray-800">
                {isOwnerUser ? "You" : `${admin.first_name} ${admin.last_name?.[0]}`}
              </p>

              {/* BUTTON */}
              {isOwner || status === "accepted" ? (
                <button
                  onClick={() => navigate(`/chats/${admin.id}`)}
                  className="mt-1 px-4 bg-blue-800 whitespace-nowrap hover:bg-purple-700 text-white text-sm py-3 rounded-lg"
                >
                  💬 Message
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
        {visibleCount < acceptedAdmins.length ? (
          <button
            onClick={showMore}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-semibold"
          >
            See more
          </button>
        ) : acceptedAdmins.length > 4 ? (
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
