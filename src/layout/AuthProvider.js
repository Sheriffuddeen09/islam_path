import { createContext, useState, useEffect, useContext } from "react";
import api from "../Api/axios";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      setLoading(true);

      try {
        // 1️⃣ Sanctum CSRF
        await api.get("/sanctum/csrf-cookie");

        // 2️⃣ User status
        const res = await api.get("/api/user-status", {
          withCredentials: true,
        });

        if (!isMounted) return;

        const currentUser =
          res.data.status === "logged_in" ? res.data.user : null;

        setUser(currentUser);

        // 3️⃣ Protect routes
        const protectedRoutes = ["/student/dashboard"];

        if (!currentUser && protectedRoutes.includes(location.pathname)) {
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Auth bootstrap failed", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const isLoggedin = Boolean(user);

  // 🔄 Global loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
