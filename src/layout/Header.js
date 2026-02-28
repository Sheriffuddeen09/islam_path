import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logos from './image/favicon.png'
import { Bell, Book, BookOpen, BookTemplateIcon, EggFried, Home, LayoutDashboard, MessageCircleIcon, PlaySquare, User2 } from "lucide-react";
import { useAuth } from './AuthProvider';
import LiveClass from '../chat/LiveClass';
import api from '../Api/axios';
import LogoutButton from '../Form/LogOut';
import { linkList } from '../pages/homepageComponent/LinkDataHeader';
import SearchUser from './SearchUser';

function Navbar({handleMessageOpen, messageOpen, setMessageOpen, activeChat, setActiveChat,
  chats, setChats, handleMessageOpenHeader, unreadCount,  friendCount, homeCount, 
  handleMessageClick, videoCount, fetchUnreadCount, handleFriendClick, handleHomeClick, handleVideoClick,
  handleNotification, unreadNotification
}) {

      const [menu, setMenu] = useState(false)
      const [dashboardToggle, setDashboardToggle] = useState(false)
      const homepage = useLocation().pathname
      
   const { isLoggedin, user } = useAuth()


    const dashboardLink =
  user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";


console.log('currentUser', user)

    const check = (
      <div>
         {/* • */}
      {isLoggedin && user ? (
        <div className='relative'>
        <Link
          to={dashboardLink}
          className="bg-gray-800 text-2xl font-bold text-white px-2 w-10 h-10 py-2 rounded-full  hover:bg-gray-900"
        >
          {user.first_name[0]}{user.last_name[0]}
          
        </Link>
        <button onClick={() => setDashboardToggle(!dashboardToggle)} className='bg-black flex mx-auto hover:bg-gray-900 text-center rounded-full absolute top-6 right-0'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class='size-4 p-0.5'>
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>

          </button>
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
        <div className='flex flex-row bg-gray-900 h-32 justify-between items-center p-3 rounded-lg'>
          <div className='inline-flex gap-2 items-center'>
          <Link
            to={dashboardLink}
            className="bg-gray-800 text-4xl uppercase font-bold text-white px-2 w-16 h-16 py-2 rounded-full  hover:bg-gray-900"
          >
            {user.first_name[0]}{user.last_name[0]}
            
          </Link>
          <p className='text-white text-xl font-bold uppercase whitespace-wrap'>{user.first_name} • {user.last_name}</p>
          </div>
          <button onClick={() => setDashboardToggle(!dashboardToggle)} className='bg-black z-10 hover:bg-gray-900 text-center rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class='size-6 text-white p-0.5'>
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>

          </button>
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
        <header className="z-50 bg-white  fixed w-full z-10 border-b- shadow px-2 sm:py-2 py-2 sm:mb-6 ">
        

          <nav className='flex flex-row justify-between items-center '>
              <div className='inline-flex items-center gap-2'>
                <Link to={'/'}>
                <img className='hidden sm:block' src={logos} alt='logo' width={45} height={45}/>
                </Link>
              </div>
            <div className=''> 
              <div className='sm:gap-6 gap-3 font-bold inline-flex '> 
              
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
                  onClick={() => {handleMessageOpenHeader(); handleMessageClick();}}
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
                    <span className="absolute top-5 right-3 bg-red-500 text-white 
                    text-[10px] px-1.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}

                  Message
                </button>
                {/* Get Mentor */}
                <Link to={'/get-mentor'} className={`${homepage === '/get-mentor' & !messageOpen ? 'text-blue-600 hover:text-b-500' : 'text-gray-600 hover:text-gray-800'} sm:text-[13px] text-[8px]  rounded lg:p-2 px-1 py-2 
                  transition-all duration-500 ease-in-out cursor-pointer about flex-col flex items-center gap-1`}> 
                  
                  <BookOpen />
                  Mentor
                </Link>

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
                  <span className="absolute top-5 right-1 bg-red-500 text-white
                  text-[10px] px-1.5 rounded-full">
                    {videoCount > 15 ? "15+" : videoCount}
                  </span>
                )}

                Video
              </Link>

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
                                 <span className="absolute top-4 right-2 bg-red-500 text-white
                                 text-[10px] px-1.5 rounded-full">
                                   {unreadNotification}
                                 </span>
                               )}
                                 Notification
                </Link>

                {/* Book */}
                <Link to={'/online-sale'} className={`${homepage === '/online-sale' & !messageOpen ? 'text-blue-600 hover:text-b-500' : 'text-gray-600 hover:text-gray-800'} sm:text-[13px] text-[8px]  rounded lg:p-2 px-1 py-2 
                  transition-all duration-500 whitespace-nowrap ease-in-out cursor-pointer about flex-col flex items-center gap-1`}> 
                  
                  <BookTemplateIcon />
                  Online Book
                </Link>
            </div>
          </div>
            

          <div className='flex gap-3 flex-row items-center'>
              <div className="md:block hidden">
                <SearchUser  />
              </div>
              <div className="md:block hidden">
                  {check}
              </div>
          </div>                   
          </nav>

            {/* Mobile Menu */}
            <div  className={`z-50 transition-all duration-3000 ease-in-out fixed top-0 left-0 w-full h-full bg-menu ${menu ? "blocked" :"hide"}`}> 

            <section className='z-50 text-black gap-2 flex-col transition-all duration-2000 scrollb scroll-p-0 scroll-smooth scrollbar scrollbar-thumb-blue-300  scrollbar-thin scrollbar-track-white ease-in-out flex bg-white w-full h-full md:w-11/12 fixed left-0 p-4 text-black h-full text-start '>
              <div className='flex px-2 flex-row py-3 justify-between items-center mb-4'>
                  <button className='text-black text-2xl inline-flex items-center gap-2 font-bold' onClick={handlemenu}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Menu
                  </button>
                  {
                    menu &&
                  <SearchUser />
                  }
              </div>
              
              {checkMobile}

                <div className='grid grid-cols-2 p-3 mt-5 overflow-y-auto h-[400px]  gap-2 '>
                  {
                   linkList.map(list =>(
                    <Link to={`${list.link}`}>
                    <div className='shadow-md p-3 whitespace-nowrap rounded-lg border font-bold text-sm'>
                      <button className={`w-10 h-10 text-2xl rounded-full text-white ${list.background}`}>
                        {list.image}
                      </button>
                      <p className='text-sm mt-1'>{list.name}</p>
                    </div>
                    </Link>
                   )) 
                  }
                </div>

        </section>
        </div>
        </header>

        <div className={`${messageOpen ? 'block' : 'hidden'}`}>
          <LiveClass  fetchUnreadCount={fetchUnreadCount} handleMessageOpen={handleMessageOpen} 
          setMessageOpen={setMessageOpen} chats={chats} setChats={setChats}
          activeChat={activeChat} setActiveChat={setActiveChat} messageOpen={messageOpen}/>
          </div>

          {
            dashboardToggle && (
            <div className="fixed sm:top-16 top-36 right-10 mt-2 w-40  bg-white border rounded shadow-lg z-50">
             <ul className="flex flex-col text-black items-center whitespace-nowrap  py-3">
              <Link to={dashboardLink} className='inline-flex items-center hover:bg-gray-200 p-2 rounded gap-1 font-bold text-sm'>
              <LayoutDashboard width={18}/>  Dashboard
              </Link>
              <LogoutButton />
             </ul> 
             </div>
            )
          }
        
        </>
    )

}

export default Navbar