import StudentRequest from "./StudentRequest";
import { Link } from "react-router-dom";
import StudentProfilePage from "./StudentProfile";
import { useEffect, useState } from "react";
import api from "../Api/axios";
import AssignmentLibrary from "../assignment/AssignmentLibrary";
import AssignmentResults from "../assignment/AssignmentResults";
import ExamResults from "../exam/ExamResults";
import ExamLibrary from "../exam/ExamLibrary";
import Setting from "./Setting";
import CreatePost from "../pages/post/CreatePost";
import PostLibrary from "../pages/post/PostLibrary";
import Order from "../pages/sales/order/Order";
import SaveOrder from "../pages/sales/order/SaveOrder";
import { useAuth } from "../layout/AuthProvider";
import { LayoutDashboard, Home, Library, PlusSquare, Settings,  Users, FileText, ClipboardList, CheckCircle,
  BarChart3, ShoppingCart, Bookmark } from "lucide-react";
import ChatPage from "../chat/chatbox/Chatpage";

export default function StudentDashboard ({ chats, image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList, handlePostCreated,
        togglePopup, savedCount, setSavedCount, setActiveChat, setMessages,
        setChats, activeChat, messagesMap, setMessagesMap, setUiMode, uiMode, showSettings, setShowSettings}){

 const [sidebarOpen, setSidebarOpen] = useState(false); // MOBILE SIDEBAR STATE
      
   const [visible, setVisible] = useState(1)
        
   const [pendingRequests, setPendingRequests] = useState(0);


   const { user } = useAuth();
  
    
    
    
      useEffect(() => {
        api.get("/api/notifications/requests").then(res => {
          setPendingRequests(res.data.pending_requests);
        });
      }, []);


          const handleVisible = (id) => {
            setVisible(id)
          }
      
          const handleOpenModel = () =>{
            setSidebarOpen(!sidebarOpen)
            console.log('click button')
          }
      
        const fetchSavedCount = async () => {
          try {
            const res = await api.get(`/api/saved-products/count/${user?.id}`);
            setSavedCount(res.data.count);
          } catch (err) {
            console.log(err);
          }
        };

        useEffect(() => {
          if (user?.id) fetchSavedCount();
        }, [user]);
      
        const menu = [
            {
              id: 5,
              label: "Teacher Request",
              icon: Users,
              showBadge: true,
            },
            {
              id: 6,
              label: "View Continue Assignment",
              icon: ClipboardList,
            },
            {
              id: 7,
              label: "View Continue Examination",
              icon: FileText,
            },
            {
              id: 8,
              label: "View Assignment Result",
              icon: CheckCircle,
            },
            {
              id: 9,
              label: "View Examination Result",
              icon: BarChart3,
            },
            {
              id: 10,
              label: "Product Order",
              icon: ShoppingCart,
              ordershow: true,
            },
            {
              id: 11,
              label: "Saved Order",
              icon: Bookmark,
              showcount: true,
            },
          ];
      
      const handleMenuClick = async (item) => {
        if (item.label === "Saved Order") {
          try {
            await api.post(`/saved-products/clear/${user.id}`);
            setSavedCount(0); // update UI after backend success
          } catch (err) {
            console.error(err);
          }
        }
        };

  return (
<>

        <ChatPage
          chats={chats}
          setChats={setChats}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          messagesMap={messagesMap}
          setMessagesMap={setMessagesMap}
          setUiMode={setUiMode}
          uiMode={uiMode}
          togglePopup={togglePopup}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          setMessages={setMessages}
        
        />

    <div className="flex min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] ">
      <aside
      className={`fixed top-0 left-0 lg:block hidden h-full lg:w-64 md:w-80 md:py-10 lg:py-0 w-72 bg-[var(--bg-color)] shadow-lg py-3 md:px-8 lg:px-2 px-4 z-40
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        overflow-y-auto overflow-x-hidden
        scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin`}
    >
               {/* CLOSE BUTTON (Mobile Only) */}
       
       
               <div className="text-lg whitespace-nowrap font-bold flex items-center gap-2 mb-8 sm:mt-6 mt-12">
                 <span className="text-purple-900">Islam Path</span>
                 <span>Of Knowledge</span>
               </div>
       
               <h3 className="text-xs text-purple-900 font-bold mb-2">GENERAL</h3>
               <ul className="space-y-2">

              {/* DASHBOARD */}
              <li
                onClick={() => handleVisible(1)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  visible === 1
                    ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </li>

              {/* HOME */}
              <Link to="/">
                <li className="flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 hover:text-gray-100">
                  <Home size={18} />
                  Home Page
                </li>
              </Link>

              {/* LIBRARY */}
              <li
                onClick={() => handleVisible(2)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  visible === 2
                    ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                }`}
              >
                <Library size={18} />
                Library
              </li>

              {/* CREATE POST */}
              <li
                onClick={() => handleVisible(3)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  visible === 3
                    ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                }`}
              >
                <PlusSquare size={18} />
                Create Post
              </li>

              {/* SETTINGS */}
              <li
                onClick={() => handleVisible(4)}
                className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                  visible === 4
                    ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                }`}
              >
                <Settings size={18} />
                Setting
              </li>

            </ul>
             {/* Actual Menu */}
             <div className= "">
               <h3 className="text-xs text-purple-900 font-bold mt-6 mb-2">SET SECTION</h3>
                    
                  <ul className="space-y-2 mb-10">
                {menu.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => {
                      setVisible(item.id);
                      handleMenuClick(item);
                    }}
                    className={`flex items-center gap-2 p-2 relative rounded-lg text-sm font-semibold cursor-pointer 
                      ${
                        visible === item.id
                          ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                      }
                    `}
                  >
                    {/* ICON */}
                    {item.icon && <item.icon size={18} />}

                    {/* LABEL */}
                    {item.label}

                    {/* BADGE */}
                    {item.showBadge && pendingRequests > 0 && (
                      <span className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {pendingRequests}
                      </span>
                    )}

                    {item.showcount && savedCount > 0 && (
                      <span
                        onClick={() => handleMenuClick(item)}
                        className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                      >
                        {savedCount}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

             </div>
       
             </aside>

              {/* Mobile View */}
                 
      <button
        className={`lg:hidden fixed top-10 right-4 z-50 bg-[var(--bg-color)] text-[var(--text-color)] p-2 rounded-lg shadow ${sidebarOpen ? 'hidden' : 'block'}`}
        onClick={handleOpenModel}
      >
        ☰
      </button>

      {/* ---------------------- SIDEBAR ---------------------- */}
      {/* Desktop: always visible. Mobile: slide-in */}
                  <aside
                className={`fixed top-0 lg:hidden left-0 h-full lg:w-64 md:w-80 md:py-10 lg:py-0 w-72 bg-[var(--bg-color)] text-[var(--text-color)] shadow-lg py-3 md:px-8 lg:px-2 px-4 z-40
                  transform transition-transform duration-300
                  ${sidebarOpen ? " block" : "hidden"}
                  lg:translate-x-0
                  overflow-y-auto overflow-x-hidden
                  scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin`}
              >
                      {/* CLOSE BUTTON (Mobile Only) */}
                      <button
                        className="lg:hidden absolute top-7 right-2 text-xl"
                        onClick={handleOpenModel}
                      >
                        ✕
                      </button>

                      <div className="text-lg whitespace-nowrap font-bold flex items-center gap-2 mb-8 sm:mt-6 mt-4">
                        <span className="text-purple-900">Islam Path</span>
                        <span>Of Knowledge</span>
                      </div>

                      <h3 className="text-xs text-purple-900 font-bold mb-2">GENERAL</h3>
                      <ul className="space-y-2">

                    {/* DASHBOARD */}
                    <li
                      onClick={() => {handleVisible(1); handleOpenModel()}}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                        visible === 1
                          ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </li>

                    {/* HOME */}
                    <Link to="/">
                      <li className="flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 hover:text-gray-100">
                        <Home size={18} />
                        Home Page
                      </li>
                    </Link>

                    {/* LIBRARY */}
                    <li
                      onClick={() => {handleVisible(2); handleOpenModel()}}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                        visible === 2
                          ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                      }`}
                    >
                      <Library size={18} />
                      Library
                    </li>

                    {/* CREATE POST */}
                    <li
                      onClick={() => {handleVisible(3); handleOpenModel()}}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                        visible === 3
                          ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                      }`}
                    >
                      <PlusSquare size={18} />
                      Create Post
                    </li>

                    {/* SETTINGS */}
                    <li
                      onClick={() => {handleVisible(4); handleOpenModel()}}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm font-semibold cursor-pointer ${
                        visible === 4
                          ? "bg-gray-500 text-white"
                : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                      }`}
                    >
                      <Settings size={18} />
                      Setting
                    </li>

                  </ul> {/* Actual Menu */}
                       <div className= "">
                         <h3 className="text-xs text-purple-900 font-bold mt-6 mb-2">SET SECTION</h3>
                 
                         <ul className="space-y-2 mb-10">
                        {menu.map((item) => (
                          <li
                            key={item.id}
                            onClick={() => {
                              setVisible(item.id);
                              handleMenuClick(item);
                              handleOpenModel()
                            }}
                            className={`flex items-center gap-2 p-2 relative rounded-lg text-sm font-semibold cursor-pointer 
                              ${
                                visible === item.id
                                  ? "bg-gray-500 text-white"
                                  : "bg-transparent hover:bg-gray-500 hover:text-gray-100"
                              }
                            `}
                          >
                            {/* ICON */}
                            {item.icon && <item.icon size={18} />}

                            {/* LABEL */}
                            {item.label}

                            {/* BADGE */}
                            {item.showBadge && pendingRequests > 0 && (
                              <span className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {pendingRequests}
                              </span>
                            )}

                            {item.showcount && savedCount > 0 && (
                              <span
                                onClick={() => handleMenuClick(item)}
                                className="absolute top-2 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                              >
                                {savedCount}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                       </div>
                 
                       </aside>
                
               
                       {/* ---------------------- MAIN CONTENT ---------------------- */}
                       <section className="flex-1 sm:p-6 p-2 transition-all">
                        
                        <div className={`${visible === 1 ? 'block' : 'hidden'}`}>
                         <StudentProfilePage togglePopup={togglePopup} setActiveChat={setActiveChat}
                         chats={chats} setMessages={setMessages}
                        image={image} setImage={setImage}
                        postComments={postComments} setPostComments={setPostComments} loading={loading} 
                        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
                        newComment={newComment} setNewComment={setNewComment}
                        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
                        emojiList={emojiList} setEmojiList={setEmojiList}/>
                         </div>
                         <div className={`${visible === 2 ? 'block' : 'hidden'}`}>
                         <PostLibrary />
                         </div>
                          <div className={`${visible === 3 ? 'block' : 'hidden'}`}>
                          <CreatePost handlePostCreated={handlePostCreated} />
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
                         <div className={`${visible === 10 ? 'block' : 'hidden'}`}>
                         <Order chats={chats} setActiveChat={setActiveChat} setMessages={setMessages}  />
                         </div> 
                         <div className={`${visible === 11 ? 'block' : 'hidden'}`}>
                         <SaveOrder  />
                         </div> 
                       </section>
       
    </div>
    </>
  )
}