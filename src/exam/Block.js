import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AssignmentBlocked() {
  const navigate = useNavigate();
    
      // Redirect after 3 seconds
      useEffect(() => {
        const timer = setTimeout(() => {
          navigate("/student/dashboard");
        }, 6000);
    
        return () => clearTimeout(timer);
      }, [navigate]);
  
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-14 h-14 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-red-600">
          Examination Blocked
        </h1>
        <p className="mt-3 text-gray-600">
          Sorry, this Examination link has been blocked.
          <br />
          Please contact your teacher to unblock it or reshare another link.
        </p>
        <div className="mt-6">
        <button
        onClick={() => navigate("/student/dashboard")}
        className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
        Go to Dashboard
        </button>
    </div>
      </div>
    </div>
  );
}
