
import React, { useState, useEffect } from "react";
import api from "../Api/axios";
import AlertIcon from "./Icon";
import { useNavigate } from "react-router-dom";

export default function DashboardLayout() {
  const [isloading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

   const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
  const loadUserStatus = async () => {
    try {
      // 1️⃣ Load CSRF cookie (required for Sanctum)
      await api.get("/sanctum/csrf-cookie");

      // 2️⃣ Fetch user status
      const res = await api.get("/api/user-status");
      console.log("User status response:", res.data);

      if (res.data.status === "logged_in") {
        setUser(res.data.user); // store user info
      } else {
        // User not logged in, just clear user state or show message
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user status:", error.response?.data || error);
      setUser(null); // clear user on error
    } finally {
      setLoading(false);
    }
  };

  loadUserStatus();
}, []); // no navigate dependency

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/api/dashboard/notifications");
        setNotifications(res.data.notifications);
      } catch (err) {
        console.log(err.response.data);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
         <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
      </div>
    );
  }

  return (
    <div className="">

      <section className="flex-1 lg:ml-64 transition-all">

        <div className="flex justify-end mb-6">
         
          <div className="flex items-center gap-1 sm:gap-4">
            <div className="inline-flex items-center gap-2">
                <p className="font-bold text-[14px] whitespace-nowrap sm:text-[15px]">Assalamu Alaykum</p>
            
            <span className="font-semibold text-xs whitespace-nowrap sm:text-[15px]"> <b>{user?.role || <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>}
            </b>
            </span>
            <span className="font-semibold text-xs whitespace-nowrap sm:text-[15px]"> <b>{user?.first_name || "No user"}</b></span>
            </div>
    
        <button onClick={async () => {
              try {
                await api.post('/api/logout', {}, {
                  withCredentials: true
                });
                window.location.href = '/login';
              } catch (err) {
                console.error('Logout failed', err);
              }
            }} title="Logout" className="p-2 rounded-lg hover:bg-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" title='Logout' fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
        </svg>
        </button>
           <button  title="Privacy" className="p-2 rounded-lg hover:bg-gray-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
           </button>

          </div>
        </div>

        <div className="space-y-4">
      {notifications.map((n, idx) => (
        <div
          key={idx}
          className="flex flex-col lg:flex-row justify-between mb-5 items-start gap-2 lg:items-center p-4 bg-gradient-to-r from-red-100 via-red-50 to-red-100 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <p className="text-red-800 font-medium text-sm sm:text-base">{n.message}</p>
          {n.action_url && (
            <button
              onClick={() => navigate(n.action_url)}
              className="mt-2 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Select Choice
            </button>
          )}
        </div>
      ))}
    </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isloading ? (
            <>
              {[1,2,3,4].map((i)=>(
                <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-xl"></div>
              ))}
            </>
          ) : (
            <>
              <Card title="Video Post" value="152" color="bg-blue-100" icon={AlertIcon} />
              <Card title="Notification" value="$2,100" color="bg-orange-100" />
              <Card title="Reviews" value="28,441" color="bg-green-100" />
              <Card title="Rate" value="152 Unread" color="bg-purple-100" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4">
            {isloading ? (
              <SkeletonTable />
            ) : (
              <>
                <h2 className="font-bold text-lg mb-4">Student Analysis</h2>
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-sm">
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Bamboo Watch", price: "$65", img: "🟤" },
                      { name: "Black Watch", price: "$72", img: "⚫" },
                      { name: "Blue Band", price: "$79", img: "🔵" },
                    ].map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2">{item.img}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.price}</td>
                        <td className="p-2 text-blue-500 cursor-pointer">🔍</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Sales Overview */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            {isloading ? (
              <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
            ) : (
              <>
                <h2 className="font-bold text-lg mb-4">Sales Overview</h2>
                <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                  📈 Chart Placeholder
                </div>
              </>
            )}
          </div>

        </div>

      </section>
    </div>
  );
}

/* ---------------------- CARD ---------------------- */
function Card({ title, value, color, icon: Icon }) {
  return (
    <div className="p-5 rounded-xl shadow bg-white hover:scale-[1.02] transition cursor-pointer">
      <div className={`${color} w-10 h-10 rounded-lg mb-2`}>
        {Icon && <Icon className="w-8 h-8 text-gray-700" />}
      </div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

/* ---------------------- SKELETON TABLE ---------------------- */
function SkeletonTable() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 w-1/3 rounded mb-4"></div>
      {[1,2,3].map((i)=>(
        <div key={i} className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
