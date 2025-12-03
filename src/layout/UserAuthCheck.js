import { useEffect, useState } from "react";
import api from "../Api/axios";

const useAuthCheck = () => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Make sure to include credentials (cookies)
        const res = await api.get("/api/user-status", {
          withCredentials: true,
        });

        if (res.data.logged_in) {
          setIsLoggedin(true);
          setUser(res.data.user);
        } else {
          setIsLoggedin(false);
          setUser(null);
        }
      } catch (err) {
        setIsLoggedin(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  return { isLoggedin, user, loading };
};

export default useAuthCheck;
