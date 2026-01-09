import StudentRequest from "./StudentRequest";
import { Link } from "react-router-dom";
import StudentProfilePage from "./StudentProfile";
import LiveClass from "../teacherdashboard/LiveClass";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import DashboardStudent from "./DashbordStudent";
import AssignmentLibrary from "../assignment/AssignmentLibrary";
import AssignmentResults from "../assignment/AssignmentResults";
import ExamResults from "../exam/ExamResults";
import ExamLibrary from "../exam/ExamLibrary";

export default function StudentDashboard (){

 const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE
      
   const [visible, setVisible] = useState(1)
        
   const [pendingRequests, setPendingRequests] = useState(0);
    
  const [unreadCount, setUnreadCount] = useState(0);
  
      
          const fetchUnreadCount = async () => {
            const res = await api.get("/api/messages/unread-count");
            setUnreadCount(res.data.unread_senders);
          };
      
          useEffect(() => {
            fetchUnreadCount();
          }, []);
    
    
      useEffect(() => {
        api.get("/api/notifications/requests").then(res => {
          setPendingRequests(res.data.pending_requests);
        });
      }, []);
          const handleVisible = (id) => {
            setVisible(id)
          }
      
           const handleSidebarOpen = () => {
            setSidebarOpen(!sidebarOpen)
          }
      
      
        const menu = [
        { id: 7, label: "Teacher Request", showBadge: true },
        { id: 8, label: "Class Message", showBadges: true },
        { id: 9, label: "View Unfinish Assignment" },
        { id: 10, label: "View Unfinish Examination" },
        { id: 11, label: "View Assignment Result" },
        { id: 12, label: "View Examination Result" },
        { id: 13, label: "Ranks" },
      ];
      


  return (

    <div className="flex min-h-screen bg-gray-100 text-gray-800">
       
             {/* ---------------- MOBILE MENU BUTTON ---------------- */}
             <button
               className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
               onClick={handleSidebarOpen}
             >
               ☰
             </button>
       
             {/* ---------------------- SIDEBAR ---------------------- */}
             {/* Desktop: always visible. Mobile: slide-in */}
            <aside
         className={`fixed top-0 left-0 lg:block hidden h-full lg:w-64 md:w-80 md:py-10 lg:py-0 w-72 bg-white shadow-lg py-3 md:px-8 lg:px-2 px-4 z-40
           transform transition-transform duration-300
           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
           lg:translate-x-0
           overflow-y-auto overflow-x-hidden
           scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
       >
               {/* CLOSE BUTTON (Mobile Only) */}
               <button
                 className="lg:hidden absolute top-4 right-4 text-xl"
                 onClick={handleSidebarOpen}
               >
                 ✕
               </button>
       
       
               <div className="text-lg whitespace-nowrap font-bold flex items-center gap-2 mb-8 sm:mt-6 mt-12">
                 <span className="text-purple-600">Islam Path</span>
                 <span>Of Knowledge</span>
               </div>
       
               <h3 className="text-xs text-blue-800 font-bold mb-2">GENERAL</h3>
               <ul className="space-y-2">
                 <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 1 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"}`}>
                   Dashboard
                 </li>
                 <li className={`rounded-lg hover:bg-gray-900 text-sm font-semibold cursor-pointer `}>
                 <Link className="text-gray-700 hover:bg-gray-400 pt-2 hover:text-gray-200" to="/">
                 <li className={`p-2 rounded-lg text-sm font-semibold cursor-pointer `}>
                   Home Page
                 </li>
                 </Link>
                 </li>
                 <li onClick={() => handleVisible(2)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 2 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                 }`}>
                   Message
                 </li>
                 <li className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 3 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                 }`}>
                   Friends
                 </li>
                 <li className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 4 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                 }`}>
                   Create Video
                 </li>
                 <li onClick={() => handleVisible(5)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 5 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
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
                     onClick={() => {setVisible(item.id); handleSidebarOpen()}}
                     className={`p-2 relative rounded-lg text-sm cursor-pointer font-semibold cursor-pointer 
                       
                       ${visible === item.id ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"}
                     `}
                   >
                     {item.label}
                      {item.showBadge && pendingRequests > 0 && (
                       <span className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                         {pendingRequests}
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
       
             </aside>

              {/* Mobile View */}
                 
                       <button
                         className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
                         onClick={handleSidebarOpen}
                       >
                         ☰
                       </button>
                 
                       {/* ---------------------- SIDEBAR ---------------------- */}
                       {/* Desktop: always visible. Mobile: slide-in */}
                     <aside
                   className={`fixed top-0 lg:hidden left-0 h-full lg:w-64 md:w-80 md:py-10 lg:py-0 w-72 bg-white shadow-lg py-3 md:px-8 lg:px-2 px-4 z-40
                     transform transition-transform duration-300
                     ${sidebarOpen ? " block" : "hidden"}
                     lg:translate-x-0
                     overflow-y-auto overflow-x-hidden
                     scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
                 >
                         {/* CLOSE BUTTON (Mobile Only) */}
                         <button
                           className="lg:hidden absolute top-4 right-4 text-xl"
                           onClick={handleSidebarOpen}
                         >
                           ✕
                         </button>
                 
                         <div className="text-lg whitespace-nowrap font-bold flex items-center gap-2 mb-8 sm:mt-6 mt-12">
                           <span className="text-purple-600">Islam Path</span>
                           <span>Of Knowledge</span>
                         </div>
                 
                         <h3 className="text-xs text-blue-800 font-bold mb-2">GENERAL</h3>
                         <ul className="space-y-2">
                           <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 1 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"}`}>
                             Dashboard
                           </li>
                           <Link to="/">
                           <li onClick={ () => handleVisible(1)} className={`p-2 rounded-lg hover:bg-gray-200 mt-2 hover:text-gray-600 text-sm font-semibold cursor-pointer `}>
                             Home Page
                           </li>
                           </Link>
                           <li onClick={() => handleVisible(2)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 2 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                           }`}>
                             Message
                           </li>
                           <li className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 3 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                           }`}>
                             Friends
                           </li>
                           <li onClick={() => handleVisible(5)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 4 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
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
                               onClick={() => {setVisible(item.id); handleSidebarOpen()}}
                               className={`p-2 relative rounded-lg text-sm cursor-pointer font-semibold cursor-pointer 
                                 
                                 ${visible === item.id ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"}
                               `}
                             >
                               {item.label}
                                {item.showBadge && pendingRequests > 0 && (
                                 <span className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                   {pendingRequests}
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
                 
                       </aside>
                 
               
                       {/* ---------------------- MAIN CONTENT ---------------------- */}
                       <section className="flex-1 p-6 transition-all">
                         {/* <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
                         <StudentDashboard />
                         </div> */}
                         {/* */}
                         <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
                         <DashboardStudent />
                         </div>
                         <div className={`${visible === 5 ? 'block' : 'hidden'}`}>
                         <StudentProfilePage />
                         </div>
                         <div className={`${visible === 7 ? 'block' : 'hidden'}`}>
                         <StudentRequest />
                         </div>
                         <div className={`${visible === 8 ? 'block' : 'hidden'}`}>
                         <LiveClass fetchUnreadCount={fetchUnreadCount}  />
                         </div> 
                         <div className={`${visible === 9 ? 'block' : 'hidden'}`}>
                         <AssignmentLibrary  />
                         </div> 
                          <div className={`${visible === 10 ? 'block' : 'hidden'}`}>
                         <ExamLibrary  />
                         </div> 
                         <div className={`${visible === 11 ? 'block' : 'hidden'}`}>
                         <AssignmentResults  />
                         </div> 
                         <div className={`${visible === 12 ? 'block' : 'hidden'}`}>
                         <ExamResults  />
                         </div> 
                       </section>
       
    </div>
  )
}