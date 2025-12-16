import { useState } from "react";
import api from "../Api/axios"; // adjust your import

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post(
        "/api/logout",
        {},
        { withCredentials: true }
      );
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false); // reset if error occurs
    }
  };

  return (
    <button
      onClick={handleLogout}
      title="Logout"
      className="p-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
      disabled={isLoggingOut} // disable button while logging out
    >
      {isLoggingOut ? (
        <svg
          className="animate-spin h-5 w-5 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
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
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          title="Logout"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
          />
        </svg>
      )}
      {isLoggingOut && <span className="text-xs text-blue-600 font-bold">Logging out...</span>}
    </button>
  );
}
