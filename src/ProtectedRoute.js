import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./Api/axios";

export default function ProtectedRoute({
  allowedRoles,
  children,
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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
          setLoading(false);
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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
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

  /*
   * Only check the role if roles were supplied.
   */
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