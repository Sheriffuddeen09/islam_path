import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Api/axios";

export default function ProtectRoute({ allowedRoles = [], children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        await api.get('/sanctum/csrf-cookie');

        const res = await api.get("/api/user-status", { withCredentials: true });

        if (res.data.status === "logged_in") {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );;

  // Redirect if not logged in
  if (!user) return <Navigate to="/login" replace />;

  // Redirect if role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
