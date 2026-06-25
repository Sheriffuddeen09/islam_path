import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import toast, { Toaster } from "react-hot-toast";



export default function AdminAdded({togglePopup, setActiveChat, setMessages }) {
  const { id } = useParams();               // ✅ FIX 1

  const [status, setStatus] = useState("none");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [admin, setAdmin] = useState(null)

  // 🔹 Fetch admin profile + friend status
  useEffect(() => {
  api.get(`/api/admin/profile/${id}`)
    .then(res => {
      setAdmin(res.data.admin);
      setStatus(res.data.status || "none"); // ✅ FIX HERE
    })
    .catch(() => toast.error("Failed to load profile"))
    .finally(() => setLoading(false));
}, [id]);




  // 🔹 Send friend request
  const sendFriendRequest = async () => {   // ✅ FIX 3
    setBtnLoading(true);
    try {
      await api.post("/api/admin-friend/request", {
        admin_id: admin.id,
      });

      setStatus("pending");
      toast.success("Friend request sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const openChat = async (chat) => {
      if (!chat?.id) return;

      console.log("OPEN CHAT RECEIVED", chat);

      setActiveChat(chat); // now has `other`

      const res = await api.get(
        `/api/chats/${chat.id}/messages`
      );

      setMessages(res.data.messages || []);
    };

  if (loading) {
    return <p  className="bg-green-800 px-5 py-2 rounded">
      <p className=" rounded-lg text-xs flex items-center gap-2">
      <span className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></span>
    </p></p>;
  }

  if (!admin) {
    return <p className="text-center mt-10">admin not found</p>;
  }

  return (
    <div>
   <Toaster position="top-right" />

      {/* Action Button */}
      {status === "accepted" && (
      <button
        onClick={async () => {
          try {
            // 1. open popup first
            togglePopup();

            // 2. create or get chat
            const res = await api.post(
              "/api/chat/create",
              {
                user_id: admin.id,
              }
            );

            const chat = res.data.chat;

            // 3. open chat
            await openChat(chat);

          } catch (err) {
            toast.error("Failed to open chat");
            console.error(err);
          }
        }}
        className="mt-1 px-4 bg-blue-800 hover:bg-purple-700 text-white text-sm py-3 rounded-lg"
      >
        💬 Message
      </button>
    )}

      {status === "pending" && (
        <button disabled className="bg-gray-500 px-5 py-2 rounded">
          ⏳ Pending
        </button>
      )}

      {status === "none" && (
        <button onClick={sendFriendRequest} className="bg-green-800 px-5 py-2 rounded">
          {
            btnLoading ?
             <p className=" rounded-lg text-xs flex items-center gap-2">
      <span className="animate-spin h-6 w-6 my-10 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
          :
          "➕ Add Friend"
        }
        </button>
      )}

    </div>
  );
}
