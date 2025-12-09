import { createContext, useState, useEffect,} from "react";
import api from "../Api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";

 const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    api.get("/api/me")
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedin, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);