import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios"; // your axios instance

export default function CheckLogin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserStatus = async () => {
      try {
        // 1️⃣ Load CSRF cookie (required for Sanctum)
        await api.get("/sanctum/csrf-cookie");

        // 2️⃣ Fetch user status
        const res = await api.get("/api/user-status");

        console.log("User status response:", res.data);

        if (res.data.status === "logged_in") {
          setUser(res.data.user);
        } else {
          navigate("/login"); // redirect to login
        }
      } catch (error) {
        console.error("Error fetching user status:", error.response?.data || error);
        navigate("/login"); // force logout if session expired
      } finally {
        setLoading(false);
      }
    };

    loadUserStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.first_name}</h1>
      <p className="text-gray-700">Your role: {user?.role}</p>
      <p className="text-gray-700">Email: {user?.email}</p>
    </section>
  );
}
