import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logos from './image/favicon.png'
import {Bell, BookOpen, BookTemplateIcon, Briefcase,
    Search,
    PlusCircle,
    ClipboardList, EggFried, Home, LayoutDashboard, MessageCircleIcon, PlaySquare, User2, Workflow, 
    ChevronDown,
    X,
    AlertCircle} from "lucide-react";
import { useAuth } from './AuthProvider';
import { linkList, islamicApps } from '../pages/homepageComponent/LinkDataHeader';
import SearchUser from './SearchUser';
import ChatPage from '../chat/chatbox/Chatpage';
import CreateAdvertisementModal from '../advertisement/CreateAdvertisementModal';
import CreateJobModal from '../job/CreateJobModal';

function Navbar({messageOpen, activeChat, setActiveChat,
  chats, setChats, handleMessageOpenHeader, unreadCount,  friendCount, homeCount, videoCount,
  handleFriendClick, handleHomeClick, handleVideoClick, handleMessageClick,
  handleNotification, unreadNotification, messagesMap, setMessagesMap, setUiMode, uiMode, togglePopup,
  showSettings, setShowSettings, setMessages, incomingCall, setIncomingCall, callMode, setCallMode,
          showAdvertisement, setShowAdvertisement, showJobCreate, setShowJobCreate,
  meetingData, setMeetingData, setShow, jobProfile, }) {

      const [menu, setMenu] = useState(false)
      const [dashboardToggle, setDashboardToggle] = useState(false)
      const homepage = useLocation().pathname
      
      const { isLoggedin, user } = useAuth()
      const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false);
      const navigate = useNavigate()


  const [showChannelView, setShowChannelView] = useState(false);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const [seeMoreApps, setSeeMoreApps] = useState(false);
  const authUser = useAuth()
    
    
    const filteredLinks = linkList.filter((item) => {
    if (item.role && item.role !== authUser?.role) {
        return false;
    }

    return true;
});

     
      
      

   
    const dashboardLink =
    user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";



    const check = (
      <div>
         {/* • */}
      {isLoggedin && user ? (
        <div className='relative'>
        <Link
          to={dashboardLink}
          className="bg-gray-800 text-2xl font-bold text-white px-2 w-10 h-10 py-2 rounded-full  hover:bg-gray-900"
        >
          {user?.first_name[0]}{user?.last_name[0]}
          
        </Link>
       
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-green-700 w-28 text-white px-5 py-2 text-sm font-bold rounded-full flex justify-center items-center gap-2 hover:bg-green-800"
        >
          <User2 className="w-4 h-4" />
          Login
        </Link>
      )}
    </div>
    );

    const checkMobile = (
      <div>
         {/* • */}
      {isLoggedin && user ? (
        <div className='flex flex-row bg-gray-900 h-24 md:h-32 justify-between items-center p-3 rounded-lg'>
          <div className='inline-flex gap-2 md:gap-4 items-start'>
          <Link
            to={dashboardLink}
            className="bg-gray-800 text-4xl uppercase font-bold text-white px-2 w-16 h-16 py-2 rounded-full  hover:bg-gray-900"
          >
            {user?.first_name[0]}{user?.last_name[0]}
            
          </Link>
          <div>

          <p className='text-white text-xl font-bold uppercase whitespace-wrap'>{user?.first_name} • {user?.last_name}</p>
         <Link to={dashboardLink} className='inline-flex items-center md:mt-1 hover:bg-gray-200 mt-2 rounded gap-1
          font-bold text-sm md:text-xl'>
              <LayoutDashboard width={18}/>  Dashboard
          </Link>
          </div>
          </div>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-green-700 w-28 text-white px-5 py-2 text-sm font-bold rounded-full flex justify-center items-center gap-2 hover:bg-green-800"
        >
          <User2 className="w-4 h-4" />
          Login
        </Link>
      )}
    </div>
    );

   


    const handlemenu = () => {
      setMenu(!menu)
  }

    return (
      <>
        <header className="z-50 bg-white  fixed w-full z-10 border-b- shadow px-1 sm:py-2 py-0.5 sm:mb-6 mb- ">
          

          <nav className='flex flex-row justify-between items-center lg:mx-7'>
                     <div className='hidden sm:block'>
                        <div className='inline-flex items-center gap-6'>
                          <Link to={'/'}>
                          <img className='hidden sm:block' src={logos} alt='logo' width={45} height={45}/>
                          </Link>
          
                          <div className="lg:block hidden">
                          <SearchUser  />
                        </div>
                        </div>
                        </div>
                      <div className=''> 
                        <div className='sm:gap-6 gap-4 font-bold inline-flex '> 
                        
                          <Link
                          to="/"
                          onClick={handleHomeClick}
                          className={`${
                            homepage === "/" && !messageOpen
                              ? "text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }
                          sm:text-[13px] text-[8px]
                          rounded lg:p-2 px-1 py-2
                          flex flex-col items-center gap-1 relative`}
                        >
                          <Home />
          
                          {homeCount > 0 && (
                            <span className="absolute top-5 right-1 bg-red-500 text-white
                            text-[10px] px-1.5 rounded-full">
                              {homeCount > 15 ? "15+" : homeCount}
                            </span>
                          )}
          
                          Home
                        </Link>
                          {/* Friend */}
                          <Link
                          to="/friend"
                          onClick={handleFriendClick}
                          className={`${
                            homepage === "/friend" && !messageOpen
                              ? "text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }
                          sm:text-[13px] text-[8px]
                          rounded lg:p-2 px-1 py-2
                          flex flex-col items-center gap-1 relative`}
                        >
                          <EggFried />
          
                          {friendCount > 0 && (
                            <span className="absolute top-5 right-1 bg-red-500
                            text-white text-[10px] px-1.5 rounded-full">
                              {friendCount}
                            </span>
                          )}
          
                          Friend
                        </Link>
                          {/* Message */}
                           

                           <button
                            onClick={() => {handleMessageOpenHeader(); handleMessageClick(); togglePopup()}}
                            className={`${
                              messageOpen
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            } sm:text-[13px] text-[8px]
                            rounded lg:p-2 px-1 py-2
                            flex flex-col items-center gap-1 relative block sm:hidden`}
                          >
                            <MessageCircleIcon />
          
                            {/* ✅ Notification badge */}
                            {unreadCount > 0 && (
                              <span className="absolute top-5 right-1 bg-red-500 text-white 
                              text-[10px] px-1.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
          
                            Message
                          </button>


                          {/* Video */}
                         <Link
                          to="/post/video"
                          onClick={handleVideoClick}
                          className={`${
                            homepage === "/post/video" && !messageOpen
                              ? "text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }
                          sm:text-[13px] text-[8px]
                          rounded lg:p-2 px-1 py-2
                          flex flex-col items-center gap-1 relative`}
                        >
                          <PlaySquare />
          
                          {videoCount > 0 && (
                            <span className="absolute top-4 right-2 bg-red-500 text-white
                            text-[10px] px-1.5 rounded-full">
                              {videoCount > 15 ? "15+" : videoCount}
                            </span>
                          )}
          
                          Reel Video
                        </Link>
          
                         
                         
          
                             {/* Notification */}
                          <Link to={'/notifications'} 
                          onClick={handleNotification}
                          className={`${
                            homepage === "/notifications" && !messageOpen
                              ? "text-blue-600"
                              : "text-gray-600 hover:text-gray-800"
                          }
                          sm:text-[13px] text-[8px]
                          rounded lg:p-2 px-1 py-2
                          flex flex-col items-center gap-1 relative`}> 
                            
                            <Bell />
                             {unreadNotification > 0 && (
                            <span className="absolute top-4 right-6 bg-red-500 text-white
                            text-[10px] px-1.5 rounded-full">
                              {unreadNotification}
                            </span>
                          )}
                            Notification
                          </Link>
          

                            <Link to={'/online-sale'} className={`${homepage === '/online-sale' & !messageOpen ? 'text-blue-600 hover:text-b-500' : 'text-gray-600 hover:text-gray-800'} sm:text-[13px] text-[8px]  rounded lg:p-2 px-1 py-2 
                            transition-all  duration-500 whitespace-nowrap ease-in-out cursor-pointer about flex-col flex items-center gap-1`}> 
                            
                            <BookTemplateIcon />
                             Market 
                          </Link>
                         
                      </div>
                    </div>
                      
          <div className=''>
                    <div className='flex gap-3 flex-row items-center font-bold'>
                        <div className=' sm:block hidden'>
                         <button
                            onClick={() => {handleMessageOpenHeader(); handleMessageClick(); togglePopup()}}
                            className={`${
                              messageOpen
                                ? "text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            } sm:text-[13px] text-[8px]
                            rounded lg:p-2 px-1 py-2
                            flex flex-col items-center gap-1 relative`}
                          >
                            <MessageCircleIcon />
          
                            {/* ✅ Notification badge */}
                            {unreadCount > 0 && (
                              <span className="absolute top-5 right-1 bg-red-500 text-white 
                              text-[10px] px-1.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
          
                            Message
                          </button>
                     </div>
                            
                            <div className='hidden lg:block'>
                             {jobProfile?.type &&
              jobProfile && (
                  <Link
                      to={
                          jobProfile?.type === "creator"
                              ? "/applicate/job-create"
                              : "/applicate/job-finder"
                      }
                      className={`${
                          homepage ===
                              (jobProfile?.type === "creator"
                                  ? "/applicate/job-create"
                                  : "/applicate/job-finder") &&
                          !messageOpen
                              ? "text-blue-600 hover:text-blue-500"
                              : "text-gray-600 hover:text-gray-800"
                      } sm:text-[13px] text-[8px] rounded lg:p-2 px-1 py-2 
                      transition-all duration-500 whitespace-nowrap ease-in-out cursor-pointer about flex flex-col items-center gap-1`}
                  >
                      {jobProfile?.type === "creator" ? (
                          <ClipboardList size={22} />
                      ) : (
                          <Workflow size={22} />
                      )}
          
                      Application
                  </Link>
                  )}
          
                  {!jobProfile?.type &&
               (
                  <button
                      onClick={() => setShowProfileRequiredModal(true)}
                      className={`${
                          homepage === showProfileRequiredModal &&
                          !messageOpen
                              ? "text-blue-600 hover:text-blue-500"
                              : "text-gray-600 hover:text-gray-800"
                      } sm:text-[13px] text-[8px] rounded lg:p-2 px-1 py-2 
                      transition-all duration-500 whitespace-nowrap ease-in-out cursor-pointer about flex flex-col items-center gap-1`}
                  >
                      {jobProfile?.type === "creator" ? (
                          <ClipboardList size={22} />
                      ) : (
                          <Workflow size={22} />
                      )}
          
                      Application
                  </button>
                  )}
          
                  </div>
          
                  
                        <div className="lg:block hidden">
                            {check}
                        </div>
          
                          
                            <button
                                onClick={handlemenu}
                                className="lg:hidden flex items-center justify-center text-black 
                                p-0.5 rounded-full"
                              >
                            <div
                            className="
                              bg-gray-800
                              md:w-12 md:h-12 w-9 h-9
                              rounded-full
                              flex items-center justify-center
                              text-white
                              md:text-2xl text-xl
                              font-bold
                              uppercase
                              hover:bg-gray-900
                            "
                          >
                            {user?.first_name?.[0]}
                            {user?.last_name?.[0]}
                          </div>
                          </button>
                    </div>                
                    </div>                
                    </nav>
          
                      {/* Mobile Menu */}
                      <div  className={`z-40 transition-all duration-3000 ease-in-out fixed top-0 left-0 w-full h-full bg-[var(--bg-color)] ${menu ? "blocked" :"hide"}`}> 
          
                      <section className='z-50 text-[var(--text-color)] gap-2 flex-col transition-all duration-2000 scrollb scroll-p-0 scroll-smooth scrollbar scrollbar-thumb-blue-300 
                       scrollbar-thin scrollbar-track-white ease-in-out flex bg-[var(--bg-color)] w-full h-full fixed left-0 p-4 h-full text-start '>
                       
                        <div className='flex px-2 flex-row py-3 justify-between items-center mb-2'>
                            <button className='text-[var(--text-color)] text-2xl inline-flex items-center gap-2 font-bold' onClick={handlemenu}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                              </svg>
                              Menu
                            </button>
                            {/* { menu &&
                            <SearchUser />
                            } */}
                        </div>
                        
                        {checkMobile}
          
                          <div
              className="
                  grid
                  grid-cols-2
                  gap-3
                  p-3
                  mt-2
                  h-[400px]
                  md:h-full
                  md:text-xl text-sm 
                  overflow-y-auto
              "
          >
 
          
              <div
                  onClick={() => {
          
                      if (!jobProfile) {
                          setShow(true);
                      } else if (jobProfile.type === "creator") {
                        setShowJobCreate(true);
                        setMenu(false)
                        return
                      } else {
                          navigate("/job-finder");
                      }
          
                  }}
                  className="
                      shadow-md
                      border
                      rounded-lg
                      p-3
                      cursor-pointer
                      hover:shadow-lg
                      transition-all
                      flex
                      flex-col
                      items-center
                      text-center
                  "
              >
          
                  <div
                      className="
                          w-10
                          h-10
                          rounded-full
                          flex
                          items-center
                          justify-center
                      "
                  >
                      {!jobProfile ? (
                          <Briefcase size={22} />
                      ) : jobProfile.type === "creator" ? (
                          <PlusCircle size={22} />
                      ) : (
                          <Search size={22} />
                      )}
                  </div>
          
                  <p className="mt-2 text-sm font-semibold">
                      {!jobProfile
                          ? "Post / Find Halal Job"
                          : jobProfile.type === "creator"
                          ? "Post Job"
                          : "Find Job"}
                  </p>
          
              </div>
          
              {/* ================= Application Card ================= */}
          
              {jobProfile && (
          
                  <Link
                      to={
                          jobProfile.type === "creator"
                              ? "/applicate/job-create"
                              : "/applicate/job-finder"
                      }
                      className="
                          shadow-md
                          border
                          rounded-lg
                          p-3
                          hover:shadow-lg
                          transition-all
                          flex
                          flex-col
                          items-center
                          text-center
                      "
                  >
          
                      <div
                          className="
                              w-10
                              h-10
                              rounded-full
                              flex
                              items-center
                              justify-center
                          "
                      >
                          {jobProfile.type === "creator"
                              ? <ClipboardList size={22} />
                              : <Workflow size={22} />}
                      </div>
          
                      <p className="mt-2 text-sm font-semibold">
                          Application Job
                      </p>
          
                  </Link>
          
              )}
          
              {/* ================= Other Cards ================= */}
          
              {filteredLinks.map((list) => {
          
              if (list.id === 7) {
          
                  return (
          
                      <div
                          key={list.id}
                          onClick={() =>
                              setShowAppDownload(!showAppDownload)
                          }
                          className="
                              shadow-md
                              border
                              rounded-lg
                              p-3
                              hover:shadow-lg
                              transition-all
                              cursor-pointer
                              flex
                              flex-col
                              items-center
                              text-center
                          "
                      >
          
                          <div
                              className="
                                  w-10
                                  h-10
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                              "
                          >
                              {list.icon}
                          </div>
          
                          <p className="mt-2 text-sm font-semibold">
                              {list.name}
                          </p>
          
                          <ChevronDown
                              size={18}
                              className={`mt-2 transition-transform ${
                                  showAppDownload ? "rotate-180" : ""
                              }`}
                          />
          
                      </div>
          
                  );
          
              }
          
              return (
          
                  <div
                      key={list.id}
                      className="
                          shadow-md
                          border
                          rounded-lg
                          p-3
                          hover:shadow-lg
                          transition-all
                      "
                  >
          
                      <button
                          onClick={() => {
          
                              if (list.toggle) {
                                  setShowAdvertisement(true);
                                  setMenu(false)
                                  return;
                              }
          
                              navigate(list.link);
          
                          }}
                          className="
                              w-full
                              flex
                              flex-col
                              items-center
                              text-center
                          "
                      >
          
                          <div
                              className="
                                  w-10
                                  h-10
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                              "
                          >
                              {list.icon}
                          </div>
          
                          <p className="mt-2 text-sm font-semibold">
                              {list.name}
                          </p>
          
                      </button>
          
                  </div>
          
              );
          
          })}
          </div>
          
                      {showAppDownload && (
          
          <div
              className="
                  border
                  rounded-xl
                  shadow-lg
                  p-4
                  bg-[var(--bg-color)]
                  border-green-400
                  scrollb scroll-p-0 scroll-smooth scrollbar scrollbar-thumb-blue-300 
                       scrollbar-thin scrollbar-track-white ease-in-out overflow-y-auto
              "
          >
          
              <div className="flex items-center justify-between mb-4">
          
                  <h2 className="font-bold text-lg">
                       Applications
                  </h2>
          
                  <button
                      onClick={() =>
                          setShowAppDownload(false)
                      }
                  >
                      <X size={18} />
                  </button>
          
              </div>
          
              <div
                  className="
                      grid
                      grid-cols-2
                      md:grid-cols-2
                      gap-3
                  "
              >
          
                  {(seeMoreApps
                      ? islamicApps
                      : islamicApps.slice(0, 6)
                  ).map((app) => (
          
                      <button
                          key={app.id}
                          className="
                              border
                              rounded-lg
                              p-4
                              hover:bg-gray-700
                              flex
                              flex-col
                              items-center
                              justify-center
                          "
                      >
          
                          <div className="text-3xl">
                              {app.icon}
                          </div>
          
                          <span className="mt-2 text-sm font-semibold">
                              {app.name}
                          </span>
          
                      </button>
          
                  ))}
          
              </div>
          
              <div className="flex justify-center mt-5">
          
                  <button
                      onClick={() =>
                          setSeeMoreApps(!seeMoreApps)
                      }
                      className="
                          px-5
                          py-2
                          rounded-full
                          bg-blue-600
                          text-white
                      "
                  >
                      {seeMoreApps
                          ? "See Less"
                          : "See More"}
                  </button>
          
              </div>
          
          </div>
          
          )}          
          
                  </section>
                  </div>
                  </header>
          
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
                                  setCallMode={setCallMode}
                                  callMode={callMode}
                                  setIncomingCall={setIncomingCall}
                                  incomingCall={incomingCall}
                                  setMeetingData={setMeetingData}
                                  meetingData={meetingData}
                                  
                                
                                />

                                  {
                                              showAdvertisement && (
                                                  <div>
                                                  <CreateAdvertisementModal
                                                  onClose={() => setShowAdvertisement(false)}
                                                  isOpen={showAdvertisement}
                                                  />      
                                                  </div>
                                              )
                                            }
                    
                 <CreateJobModal
                            open={showJobCreate}
                            onClose={() => setShowJobCreate(false)}
                        />
          
                  {showProfileRequiredModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6">
          
                      <div className="flex justify-center">
                          <AlertCircle
                              size={55}
                              className="text-red-500"
                          />
                      </div>
          
                      <h2 className="text-xl font-bold text-center mt-4">
                          Profile Required
                      </h2>
          
                      <p className="text-gray-600 text-center mt-3">
                          You have not created a Job Profile yet.
                          Please create your profile before accessing job applications.
                      </p>
          
                      <div className="flex justify-center gap-3 mt-6">
          
                          <button
                              onClick={() =>
                                  setShowProfileRequiredModal(false)
                              }
                              className="px-5 py-2 rounded-lg border"
                          >
                              Cancel
                          </button>
          
                          <button
                              onClick={() => {
                                  setShowProfileRequiredModal(false);
                                  setShow(true); // Opens your Create Job Profile modal
                              }}
                              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                          >
                              Create Profile
                          </button>
          
                      </div>
          
                  </div>
              </div>
          )}
                  </>
              )
          
          }
          
          export default Navbar