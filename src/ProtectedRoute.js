import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./Api/axios";

export default function ProtectedRoute({
  allowedRoles,
  children,
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);

  // Loading progress animation
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }

        return Math.min(prev + 2, 95);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");

        const response = await api.get(
          "/api/user-status",
          {
            withCredentials: true,
          }
        );

        console.log(
          "PROTECTED ROUTE USER STATUS:",
          response.data
        );

        if (
          mounted &&
          response.data?.status === "logged_in" &&
          response.data?.user
        ) {
          setUser(response.data.user);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "PROTECTED ROUTE AUTH ERROR:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setProgress(100);

          // Small delay so the line can visibly complete
          setTimeout(() => {
            if (mounted) {
              setLoading(false);
            }
          }, 250);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)]  px-4">
      <div className="w-60">

         <div className="flex items-center mb-3 justify-center">
            <span
              className="text-4xl font-bold"
              style={{
                fontFamily: "'Great Vibes', cursive",
              }}
            >
              Al-Islam
            </span>
          </div>

        <div className="relative h-2 w-full overflow-hidden rounded-sm bg-blue-100">
          <div
            className="h-full bg-blue-700 transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
       
      </div>
    </div>
  );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  let roles = [];

  if (Array.isArray(allowedRoles)) {
    roles = allowedRoles;
  } else if (
    typeof allowedRoles === "string" &&
    allowedRoles.trim() !== ""
  ) {
    roles = [allowedRoles];
  }

  console.log(
    "PROTECTED ROUTE:",
    {
      allowedRoles,
      roles,
      userRole: user?.role,
    }
  );
 
  if (
    roles.length > 0 &&
    !roles.includes(user?.role)
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}