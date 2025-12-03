
import api from "../Api/axios";
import { useState } from "react";
import DashboardLayout from "./Dashboard";
import StudentRequest from "./StudentRequest";

export default function TeacherDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE

  

  const [visible, setVisible] = useState(1)
  
    const handleVisible = (id) => {
      setVisible(id)
    }



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
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg py-3 px-2 z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
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
          <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 1 ? "bg-blue-600 text-white" : "bg-transparent"}`}>
            Dashboard
          </li>
         
          <li onClick={() => handleVisible(2)} className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 2 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Student Request
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 3 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Message
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 4 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Live Class
          </li>
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 5 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>
            Create Video
          </li>
        </ul>

        <h3 className="text-xs text-blue-800 font-bold mt-6 mb-2">SET SECTION</h3>
        <ul className="space-y-2 mb-10">
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 6 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>Student Assignment </li>
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 7 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>Student Quiz</li>
          <li className={`p-2 rounded-lg hover:bg-gray-100 text-sm font-semibold cursor-pointer ${visible
             === 8 ? "bg-blue-600 text-white" : "bg-transparent"
          }`}>Profile</li>
          
        </ul>
      </aside>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <section className="flex-1 p-6 transition-all">
        <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
        <DashboardLayout />
        </div>
        <div className={`${visible === 2 ? 'block' : 'hidden'}`}>
        <StudentRequest />
        </div>
            
      </section>
    </div>
  );
}

