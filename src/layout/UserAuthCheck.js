import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../Api/axios";

const useLoadData = (setUser) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");

        const userRes = await api.get("/api/user-status", {
          withCredentials: true,
        });

        const user =
          userRes.data.status === "logged_in" ? userRes.data.user : null;

        setUser(user);

        // Only redirect if route is protected
        const protectedRoutes = [
          "/student/dashboard",
          "/admin/dashboard",
          
        ];

        if (!user && protectedRoutes.includes(location.pathname)) {
          navigate("/login");
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };

    loadData();
  }, [location.pathname, navigate, setUser]);
};

export default useLoadData;
