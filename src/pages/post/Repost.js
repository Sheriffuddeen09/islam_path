import { useState } from "react";
import api from "../../Api/axios";
import Notification from "../../Form/Notification";

export function Repost({ post }) {
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const showNotification = (msg, type = "error") => {
    setNotify({ message: msg, type });

    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };

  const handleRepost = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await api.post(`/api/posts/${post.id}/repost`);

      showNotification("Reposted successfully!", "success");
    } catch (err) {
      showNotification("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleRepost}
        disabled={loading}
        className={`flex items-center font-semibold gap-1 mx-4 transition
          ${loading ? "opacity-50 cursor-not-allowed" : "hover:text-green-600"}
        `}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 
              3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865
              a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        )}

        {loading ? "Reposting..." : "Repost"}
      </button>

      <Notification
        message={notify.message}
        type={notify.type}
        onClose={() => setNotify({ message: "", type: "" })}
      />
    </div>
  );
}
