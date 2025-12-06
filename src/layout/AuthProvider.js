import { createContext, useState, useEffect } from "react";
import api from "../Api/axios";
import { useLocation, useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
  const loadData = async () => {

    try {
      await api.get("/sanctum/csrf-cookie");

      const userRes = await api.get("/api/user-status", { withCredentials: true });

      const currentUser =
        userRes.data.status === "logged_in" ? userRes.data.user : null;

      setUser(currentUser);
      const protectedRoutes = [
        "/student/dashboard"
      ];

      if (!currentUser && protectedRoutes.includes(location.pathname)) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

  loadData();
}, [location.pathname]);

  const isLoggedin = user !== null;

  return (
    <AuthContext.Provider value={{ isLoggedin, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
