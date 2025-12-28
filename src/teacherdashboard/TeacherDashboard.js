
import api from "../Api/axios";
import { useEffect, useState } from "react";
import DashboardLayout from "./Dashboard";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import CreateVideoSection from "./CreateVideo";
import ProfilePage from "./AdminProfile";
import TeacherLiveRequests from "./TeacherRequest";
import LiveClass from "./LiveClass";

export default function TeacherDashboardLayout({onCreated, user, setUser, teachers, setTeachers}) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE
  const [pendingRequests, setPendingRequests] = useState(0);
  const [savedChoice, setSavedChoice] = useState(null);

  const [pendingCount, setPendingCount] = useState(0);

  const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
      const res = await api.get("/api/messages/unread-count");
      setUnreadCount(res.data.unread_senders);
    };

    useEffect(() => {
      fetchUnreadCount();
    }, []);



  useEffect(() => {
    api.get("/api/user-status").then(res => {
      setSavedChoice(res.data.admin_choice);  // comes from database
    });
  }, []);


  useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/notifications/requests");
      console.log("Pending Requests from API:", res.data.pending_requests);
      setPendingRequests(res.data.pending_requests || 0);
    } catch (err) {
      console.error(err);
      setPendingRequests(0);
    }
  };
  fetchRequests();
}, []);

  

  const [visible, setVisible] = useState(1)
  
    const handleVisible = (id) => {
      setVisible(id)
    }

    const handleOpenModel = () =>{
      setSidebarOpen(!sidebarOpen)
    }


    const isLocked = !savedChoice;

  // Teacher savedChoice = Comment 1
 const isTeacher = savedChoice === "arabic_teacher";


  // Menu items for Comment 1
  const teacherMenu = [
    { id: 7, label: "Student Request", showBadge: true },
    { id: 8, label: "Class Message", showBadges: true },
    { id: 9, label: "Student Assignment" },
    { id: 10, label: "Student Quiz" },
  ];

  // Menu items for Comment 2
  const defaultMenu = [
    { id: 6, label: "Create Content" },
    { id: 7, label: "Order" },
    { id: 8, label: "Sale History" },
  ];

  // Choose which menu
  const menu = isTeacher ? teacherMenu : defaultMenu;



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
  className={`fixed top-0 left-0 h-full lg:w-64 md:w-80 md:py-10 lg:py-0 w-72 bg-white shadow-lg py-3 md:px-8 lg:px-2 px-4 z-40
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
          <li onClick={ () => {handleVisible(1); handleOpenModel()}} className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer ${visible
             === 1 ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100 " : "bg-transparent hover:bg-gray-200 hover:text-gray-600"}`}>
            Dashboard
          </li>
          <Link to="/">
          <li className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer `}>
            Home Page
          </li>
          </Link>
          <li onClick={() => {handleVisible(2); handleOpenModel()}} className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer ${visible
             === 2 ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100" : "bg-transparent hover:bg-gray-200 hover:text-gray-600"
          }`}>
            Message
          </li>
          <li className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer ${visible
             === 3 ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100" : "bg-transparent hover:bg-gray-200 hover:text-gray-600"
          }`}>
            Friends
          </li>
          <li onClick={() => {handleVisible(4); handleOpenModel()}} className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer ${visible
             === 4 ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100" : "bg-transparent hover:bg-gray-200 hover:text-gray-600"
          }`}>
            Create Video
          </li>
          <li onClick={() => {handleVisible(5); handleOpenModel()}} className={`p-2 rounded-lg  text-sm font-semibold cursor-pointer ${visible
             === 5 ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100" : "bg-transparent hover:bg-gray-200 hover:text-gray-600"
          }`}>
            Profile
          </li>
        </ul>

        <div className="relative">

      {/* 🔐 LOCKED OVERLAY */}
      {isLocked && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2 text-gray-700">
            <Lock className="w-6 h-6" />
            <span className="font-semibold text-sm">Choose Your Option First</span>
          </div>
        </div>
      )}

      {/* Actual Menu */}
      <div className={isLocked ? "opacity-40 pointer-events-none" : ""}>
        <h3 className="text-xs text-blue-800 font-bold mt-6 mb-2">SET SECTION</h3>

        <ul className="space-y-2 mb-10">
          {menu.map(item => (
            <li
              key={item.id}
              onClick={() => {setVisible(item.id); handleOpenModel()}}
              className={`p-2 relative rounded-lg text-sm font-semibold cursor-pointer 
                hover:bg-gray-200 hover:text-gray-600 
                ${visible === item.id ? "bg-blue-600 text-white hover:bg-blue-500 hover:text-gray-100" : "bg-transparent hover:bg-gray-200 hover:text-gray-600"}
              `}
            >
              {item.label}
              {item.showBadge && pendingCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}

              {
                item.showBadges && unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )
              }
            </li>
          ))}
        </ul>
      </div>

    </div>
      </aside>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <section className="flex-1 p-6 transition-all">
        <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
        <DashboardLayout user={user} setUser={setUser} />
        </div>
        {/* <div className={`${visible === 2 ? 'block' : 'hidden'}`}>
        <StudentRequest />
        </div> */}
        <div className={`${visible === 4 ? 'block' : 'hidden'}`}>
        <CreateVideoSection onCreated={onCreated} />
        </div>
        <div className={`${visible === 5 ? 'block' : 'hidden'}`}>
        <ProfilePage  teachers={teachers} setTeachers={setTeachers} />
        </div>

        <div className={`${visible === 7 ? 'block' : 'hidden'}`}>
        <TeacherLiveRequests pendingCount={pendingCount} setPendingCount={setPendingCount}  />
        </div>
        <div className={`${visible === 8 ? 'block' : 'hidden'}`}>
        <LiveClass fetchUnreadCount={fetchUnreadCount} />
        </div>
      </section>
    </div>
  );
}

