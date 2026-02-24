import { useState } from "react";
import api from "../../Api/axios";
import Notification from "../../Form/Notification";
import { useAuth } from "../../layout/AuthProvider";

export function Repost({ post, setPosts }) {
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [showModal, setShowModal] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);

  const {user} = useAuth()

  console.log('user', user)

  const showNotification = (msg, type = "error") => {
    setNotify({ message: msg, type });

    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };

  const handleRepost = async () => {
  if (loading) return;

  setLoading(true);

  try {
    const res = await api.post(`/api/posts/${post.id}/repost`, {
      visibility: visibility,
    });

    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, shares_count: p.shares_count + 1 }
          : p
      )
    );

    showNotification("Reposted successfully ✅", "success");
    setShowModal(false);

  } catch (err) {
    console.error(err);

    const message =
      err.response?.data?.message || "Something went wrong";

    showNotification(message, "error");

  } finally {
    setLoading(false);
  }
};
  return (
    <div>

      <button
      onClick={() => setShowModal(true)}
      disabled={loading}
      className={`flex items-center font-semibold gap-1 mx-4 transition
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:text-gray-600"}
      `}
    >
      Repost
    </button>
      
      
      <Notification
        message={notify.message}
        type={notify.type}
        onClose={() => setNotify({ message: "", type: "" })}
      />

    {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
      <h2 className="text-lg font-semibold mb-4">
        Who can see your post?
      </h2>

      <div className="space-y-3">

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="public"
            checked={visibility === "public"}
            onChange={() => setVisibility("public")}
          />
          <div>
            <p className="font-medium">Public</p>

          </div>
        </label>
         <p className="text-xs text-start text-gray-500">
              Everyone can see this post
          </p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            value="friends"
            checked={visibility === "friends"}
            onChange={() => setVisibility("friends")}
          />
          <div>
            <p className="font-medium">Friends</p>
           
          </div>
        </label>

         <p className="text-xs text-start text-gray-500">
              Only accepted friends
            </p>

      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setShowModal(false)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleRepost}
          className="px-3 py-2 bg-green-600 hover:bg-green-600 text-white rounded"
        >
         {loading ? <svg
      className="animate-spin h-5 w-5 text-white"
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
    </svg> : "Repost"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
