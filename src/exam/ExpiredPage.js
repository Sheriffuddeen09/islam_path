import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function ExpiredPage() {

  const navigate = useNavigate();
  
    // Redirect after 3 seconds
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate("/student/dashboard");
      }, 6000);
  
      return () => clearTimeout(timer);
    }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-14 h-14 text-red-500" />
        </div>

        <h1 className="text-xl font-semibold text-gray-800">
          Examination Expired
        </h1>

        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
          Sorry, your Examination link has expired.
          <br />
          Please contact your teacher to reset or assign a new one.
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
