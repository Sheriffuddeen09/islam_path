
import api from "../Api/axios";
import { useEffect, useState } from "react";
import StudentDashboard from "./Dashboard";
import StudentRequest from "./StudentRequest";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function StudentDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE
  

  const [visible, setVisible] = useState(1)
  
    const handleVisible = (id) => {
      setVisible(id)
    }


  const menu = [
    { id: 7, label: "Teacher Request" },
    { id: 8, label: "Live Class" },
    { id: 9, label: "View Assignment" },
    { id: 10, label: "View Quiz" },
    { id: 11, label: "Ranks" },
    { id: 11, label: "Profile" },
  ];

 



  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">

      {/* ---------------- MOBILE MENU BUTTON ---------------- */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* ---------------------- SIDEBAR ---------------------- */}
      {/* Desktop: always visible. Mobile: slide-in */}
    <aside
  className={`fixed top-0 left-0 h-full lg:w-64 md:w-96 md:py-10 lg:py-0 w-72 bg-white shadow-lg py-3 sm:px-2 px-4 z-40
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    overflow-y-auto overflow-x-hidden
    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
>
        {/* CLOSE BUTTON (Mobile Only) */}
        <button
          className="lg:hidden absolute top-4 right-4 text-xl"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>

        <div className="text-xl whitespace-nowrap font-bold flex items-center gap-2 mb-8 sm:mt-6 mt-12">
          <span className="text-purple-600">Islam Path</span>
          <span>Of Knowledge</span>
        </div>

        <h3 className="text-xs text-blue-800 font-bold mb-2">GENERAL</h3>
        <ul className="space-y-2">
          <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer ${visible
             === 1 ? "bg-blue-600 text-white" : "bg-transparent"}`}>
            Dashboard
          </li>
          <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer `}>
            <Link to="/">
            Home Page
          </Link>
          </li>
          <li onClick={() => handleVisible(2)} className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer ${visible
             === 2 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Message
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer ${visible
             === 3 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Friends
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer ${visible
             === 4 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Create Video
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-200 hover:text-gray-600 text-sm font-semibold cursor-pointer ${visible
             === 5 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Profile
          </li>
        </ul>
      {/* Actual Menu */}
      <div className= "">
        <h3 className="text-xs text-blue-800 font-bold mt-6 mb-2">SET SECTION</h3>

        <ul className="space-y-2 mb-10">
          {menu.map(item => (
            <li
              key={item.id}
              onClick={() => setVisible(item.id)}
              className={`p-2 rounded-lg text-sm cursor-pointer font-semibold cursor-pointer 
                hover:bg-gray-200 hover:text-gray-600 
                ${visible === item.id ? "bg-blue-600 text-white" : "bg-transparent"}
              `}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      </aside>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <section className="flex-1 p-6 transition-all">
        <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
        <StudentDashboard />
        </div>
        <div className={`${visible === 2 ? 'block' : 'hidden'}`}>
        <StudentRequest />
        </div>
            
      </section>
    </div>
  );
}

