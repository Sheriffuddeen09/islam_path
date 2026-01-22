import StudentRequest from "./StudentRequest";
import { Link } from "react-router-dom";
import StudentProfilePage from "./StudentProfile";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import AssignmentLibrary from "../assignment/AssignmentLibrary";
import AssignmentResults from "../assignment/AssignmentResults";
import ExamResults from "../exam/ExamResults";
import ExamLibrary from "../exam/ExamLibrary";
import CreateVideoSection from "./CreateVideo";
import LibraryPage from "../pages/video/LibraryVideo";
import Setting from "./Setting";

export default function StudentDashboard ({onCreated}){

 const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE
      
   const [visible, setVisible] = useState(1)
        
   const [pendingRequests, setPendingRequests] = useState(0);
    
  
    
    
      useEffect(() => {
        api.get("/api/notifications/requests").then(res => {
          setPendingRequests(res.data.pending_requests);
        });
      }, []);


      // useEffect(() => {
      //   api.get("/api/friend-notifications/requests").then(res => {
      //     setPendingRequests(res.data.pending_requests);
      //   });
      // }, []);


          const handleVisible = (id) => {
            setVisible(id)
          }
      
           const handleSidebarOpen = () => {
            setSidebarOpen(!sidebarOpen)
          }
      
      
        const menu = [
        { id: 5, label: "Teacher Request", showBadge: true },
        { id: 6, label: "View Continue Assignment" },
        { id: 7, label: "View Continue Examination" },
        { id: 8, label: "View Assignment Result" },
        { id: 9, label: "View Examination Result" },
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
                   Library
                 </li>
                 <li onClick={() => handleVisible(3)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 3 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                 }`}>
                   Create Post
                 </li>
                 <li onClick={() => handleVisible(4)} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                    === 4 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                 }`}>
                   Setting
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
                           <li onClick={() => {handleVisible(1);  handleSidebarOpen()}} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 1 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"}`}>
                             Dashboard
                           </li>
                           <Link to="/">
                           <li  className={`p-2 rounded-lg hover:bg-gray-200 mt-2 hover:text-gray-600 text-sm font-semibold cursor-pointer `}>
                             Home Page
                           </li>
                           </Link>
                           <li onClick={() => {handleVisible(2);  handleSidebarOpen()}} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 2 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                           }`}>
                             Library
                           </li>
                            <li onClick={() => {handleVisible(3);  handleSidebarOpen()}} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 3 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                           }`}>
                             Create Post
                           </li>
                           <li onClick={() => {handleVisible(4);  handleSidebarOpen()}} className={`p-2 rounded-lg text-sm font-semibold cursor-pointer ${visible
                              === 4 ? "bg-gray-900 text-white hover:text-gray-100" : "bg-transparent hover:bg-gray-900 hover:text-gray-200"
                           }`}>
                             Setting
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
                             </li>
                           ))}
                         </ul>
                       </div>
                 
                       </aside>
                 
               
                       {/* ---------------------- MAIN CONTENT ---------------------- */}
                       <section className="flex-1 p-6 transition-all">
                        
                        <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
                         <StudentProfilePage />
                         </div>
                         <div className={`${visible === 2 ? 'block' : 'hidden'}`}>
                         <LibraryPage />
                         </div>
                          <div className={`${visible === 3 ? 'block' : 'hidden'}`}>
                          <CreateVideoSection onCreated={onCreated} />
                          </div>
                         <div className={`${visible === 4 ? 'block' : 'hidden'}`}>
                         <Setting />
                         </div>
                         <div className={`${visible === 5 ? 'block' : 'hidden'}`}>
                         <StudentRequest handleVisible={handleVisible} />
                         </div>
                         <div className={`${visible === 6 ? 'block' : 'hidden'}`}>
                         <AssignmentLibrary  />
                         </div> 
                          <div className={`${visible === 7 ? 'block' : 'hidden'}`}>
                         <ExamLibrary  />
                         </div> 
                         <div className={`${visible === 8 ? 'block' : 'hidden'}`}>
                         <AssignmentResults  />
                         </div> 
                         <div className={`${visible === 9 ? 'block' : 'hidden'}`}>
                         <ExamResults  />
                         </div> 
                       </section>
       
    </div>
  )
}