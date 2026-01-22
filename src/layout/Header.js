import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logos from './image/favicon.png'
import { CreativeCommons, Globe, LibraryIcon, MessageCircle, Search, User, User2, User2Icon, Video } from "lucide-react";
import { useAuth } from './AuthProvider';
import LiveClass from '../chat/LiveClass';
import api from '../Api/axios';

function Navbar() {

      const [menu, setMenu] = useState(false)
      const [browse, setBrowse] = useState(false)
      const [members, setMember] = useState(false)
      const [content, setContent] = useState(false)
      const [messageOpen, setMessageOpen] = useState(false)
      const homepage = useLocation().pathname
      
   const { isLoggedin, user } = useAuth()

   const [unreadCount, setUnreadCount] = useState(0);
     
         
    const fetchUnreadCount = async () => {
      const res = await api.get("/api/messages/unread-count");
      setUnreadCount(res.data.unread_senders);
    };

    useEffect(() => {
      fetchUnreadCount();
    }, []);

    const handleMessageOpen = () =>{
    
        setMessageOpen(!messageOpen)
      }

    const dashboardLink =
  user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";




    const check = (
      <div>
         
      {isLoggedin && user ? (
        <Link
          to={dashboardLink}
          className="bg-gray-800 w-28 font-bold text-white px-5 py-2 text-sm rounded-full flex items-center justify-center hover:bg-gray-900"
        >
          Dashboard
        </Link>
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
        <header className="z-50 bg-white  fixed w-full z-10 border-b- shadow px-3 py-4 sm:p-3 mb-10 ">
            <nav className='flex flex-row justify-between items-center lg:mx-7'>
              <div className='inline-flex items-center gap-2'>
                <Link to={'/'}>
              <img src={logos} alt='logo' width={60} height={50}/>
              </Link>
            </div>
            <div className='hidden md:hidden lg:block'> 
            <div className='lg:gap-5 gap-2 font-bold inline-flex '> 
              
                <Link to={'/browse'} className={`${homepage === '/browse' ? 'text-blue-400 ' : 'text-gray-600'} relative group hover:text-blue-800  inline-block text-gray-600 text-[16px]  rounded-xl lg:p-2 p-1 
                  transition-all duration-500 ease-in-out cursor-pointer about hover:bg-blue-100 rounded-lg `}> Browse
                  <div className='w-96 shadow-md absolute -left-24 z-50 top-10 rounded-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500
                bg-gray-50 text-black '>
                  <div className='py-6 px-4 gap-3 grid grid-cols-3 mx-auto text-start '>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} px-3 py-1 text-xs hover:text-blue-800 hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105`}>All</Link>
                     <Link to={'/marriage'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg '>Marriage</Link>
                    <Link to={'/hadith'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Hadith</Link>
                    <Link to={'/translation'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'> Tafseer</Link>
                    <Link to={'/tawheed'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Tawheed</Link>
                    <Link to={'/mufrad'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs whitespace-nowrap rounded-lg'>Al-Mufrad</Link>
                    <Link to={'/sofr'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Sofr</Link>
                    <Link to={'/naw'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Nahw</Link>
                    <Link to={'/tajweed'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Tajweed</Link>
                    <Link to={'/quran'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Quran</Link>
                    <Link to={'/patient'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Patient Quote</Link>
                    <Link to={'/dua'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Dua</Link>
                    <Link to={'/fiqh'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Fiqh</Link>
                    <Link to={'/others'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Others</Link>
                    </div>
                </div>
                </Link>
                {/*  */}
              

                <Link to={'/members'} className={`${homepage === '/members' ? 'text-blue-400' : 'text-gray-600'} relative group inline-block hover:text-blue-800 text-black members text-gray-600 text-[16px] 
                 rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer`}>Members
                <div className='w-48 shadow-md absolute -left-4 top-10 z-50 rounded-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-2 transform transition-all duration-500
                bg-gray-50 text-black '>
                  <div className='py-6 px-4 gap-3 grid grid-cols-1 text-sm mx-auto text-start '>
                    <Link to={'/add_student'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1  text-xs rounded-lg hover:scale-105'>Add Student</Link>
                    <Link to={'/get-mentor'} className='hover:text-gray-700 hover:bg-gray-200 px-3 py-1 text-xs rounded-lg hover:scale-105'>Get a Arabic Mentor</Link>
                    
                    </div>
                  </div>
                </Link>
                <Link to={'/create'} className={`${homepage === '/create' ? 'text-blue-400' : 'text-gray-600'} text-gray-600 text-[16px] hover:text-blue-800 rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer create`}>Create
                </Link>
                <button onClick={handleMessageOpen} className={`${messageOpen ? 'text-blue-400' : 'text-gray-600'} text-black
                 text-gray-600 text-[16px] hover:text-blue-800 rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer logistic`}>Message
                
                </button>
                <Link to={'/video'} className={`${homepage === '/message' ? 'text-blue-400' : 'text-gray-600'} text-black
                 text-gray-600 text-[16px] hover:text-blue-800 rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer logistic`}>Video
                
                </Link>
                <Link to={'/content'} className={` ${homepage === '/content' ? 'text-blue-400' : 'text-gray-600'} relative group inline-block text-black text-gray-600 text-[16px] 
                hover:text-blue-800 rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer tech `}>Content 
                  <div className='w-48 shadow-md absolute left-0 z-50 rounded-lg opacity-0 invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-2 transform transition-all duration-500
                bg-gray-50 text-black '>
                  <div className='py-6 px-4 gap-3 grid text-sm grid-cols-1 mx-auto text-start '>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Add Student</Link>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Get a Arabic Mentor</Link>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Get a Course Mentor</Link>
                    </div>
                    </div>
                </Link>
      
            </div>
            </div>
            <div className='hidden md:block lg:hidden'> 
              {/* Search Ipad Mini */}
           <div className='relative'>
            <input placeholder='Search' className='border px-7 focus:border-gray-300 outline-none text-black border-gray-400  h-9 w-60 rounded-lg' />
            <Search className="absolute left-1 top-2 w-5 h-5 text-gray-400" />
            </div>
            </div>

            <div className='flex gap-5 flex-row items-center'>
            <div className='relative lg:block md:hidden block'>
            <input placeholder='Search' className='border px-7 focus:border-gray-300 outline-none text-black border-gray-400  h-9 w-44 rounded-lg' />
            <Search className="absolute left-1 top-2 w-5 h-5 text-gray-400" />
            </div>
      

        <div className='hidden md:block'>
            <Link to={'/library'} className={`${homepage === '/library' ? 'text-blue-400' : 'text-gray-600'} text-black inline-flex text-gray-600 hover:text-blue-800 font-bold rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer tech`}><LibraryIcon /> Library
            </Link>
            </div>
            <div className="md:block hidden">

          {check}

      </div>

                           <button
            onClick={handlemenu}
            className="lg:hidden flex text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-8 h-8 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

            </div>

                          
            </nav>
            <div  className={`z-50 transition-all duration-3000 ease-in-out fixed top-0 left-0 w-full h-full bg-menu ${menu ? "blocked" :"hide"}`}> 

            <section className='z-50 text-black gap-2 flex-col transition-all duration-2000 scrollb scroll-p-0 scroll-smooth scrollbar scrollbar-thumb-blue-300  scrollbar-thin scrollbar-track-white ease-in-out flex bg-white w-80 h-full md:w-11/12 fixed left-0 p-4 text-black h-full text-start '>
            <div className='z-50 flex-row justify-between flex items-center mt-4 mb-5 gap-2'>
            <Link to={'/'}>
            <img src={logos} alt='logo' width={40} height={40}/>
            </Link>
            <button className='text-black text-2xl' onClick={handlemenu}>
            ✕
          </button>
          </div>

              
               
        <div className='font-bold py-6 md:px-6 flex flex-col '> 
                <div className='inline-flex gap-4 items-center' >
                  <Globe /> 
                <Link to={'/browse'} className={`${homepage === '/browse' ? 'text-blue-400' : 'text-gray-600'} text-black text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 
                transition-all duration-500 ease-in-out cursor-pointer py-2 tech `}>Browse</Link>
                <button onClick={() => setBrowse(!browse)} className='text-3xl'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={`size-5 ${browse ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>

</button>
                </div>
                  <div className={`w-64 shadow-md  text-black ${browse ? "blocked" :"hide"}`}>
                  <div className='py-6 px-1 grid grid-cols-2 mx-auto text-start '>
                    <Link to={'/all'} className={`${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>All</Link>
                     <Link to={'/marriage'} className={`${homepage === '/marriage' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Marriage</Link>
                    <Link to={'/hadith'} className={`${homepage === '/hadith' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Hadith</Link>
                    <Link to={'/translation'} className={`${homepage === '/translation' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}> Translation</Link>
                    <Link to={'/transliteration'} className={`${homepage === '/transliteration' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Transliteration</Link>
                    <Link to={'/tawheed'} className={`${homepage === '/tawheed' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Tawheed</Link>
                    <Link to={'/mufrad'} className={`${homepage === '/mufrad' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Adab-mufrad</Link>
                    <Link to={'/sofr'} className={`${homepage === '/sofr' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Sofr</Link>
                    <Link to={'/nahw'} className={`${homepage === '/nahw' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Nahw</Link>
                    <Link to={'/tajweed'} className={`${homepage === '/tajweed' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Tajweed</Link>
                    <Link to={'/quran'} className={`${homepage === '/quran' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Quran</Link>
                    <Link to={'/patient'} className={`${homepage === '/patient' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Patient Quote</Link>
                    <Link to={'/dua'} className={`${homepage === '/dua' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Dua</Link>
                    <Link to={'/fiqh'} className={`${homepage === '/fiqh' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Fiqh</Link>
                    <Link to={'/others'} className={`${homepage === '/others' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800 py-1 px-2`}>Others</Link>
                    </div>
                </div>
                {/*  */}
              

                <div className='font-bold py-6 md:px-6 flex flex-col '> 
                <div className='inline-flex gap-4 items-center' >
                  <User2 /> 
                <Link to={'/members'} className={`${homepage === '/members' ? 'text-blue-400' : 'text-gray-600'} text-black text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 
                transition-all duration-500 ease-in-out cursor-pointer pb-2 tech`}>Members</Link>
                <button onClick={() => setMember(!members)} className='text-3xl relative'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={`size-5 ${browse ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                 {
                 unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )
              }
                </button>
                </div>
                  <div className={`w-44 shadow-md  text-black ${members ? "blocked" :"hide"}`}>
                  <div className='py-6 px-4 gap-3 grid grid-cols-1 text-sm mx-auto text-start '>
                   <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Add Student</Link>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Get a Arabic Mentor</Link>
                    <Link to={'/all'} className={` ${homepage === '/all' ? 'text-blue-400' : 'text-gray-600'} hover:text-blue-800`}>Get a Course Mentor</Link>
                    </div>
                  </div>
                </div>
                <Link to={'/create'} className={`${homepage === '/create' ? 'text-blue-400' : 'text-gray-600'} text-black inline-flex text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer pb-2`}><CreativeCommons />Create
                </Link>
                
                <Link to={'/message'} className={`${homepage === '/message' ? 'text-blue-400' : 'text-gray-600'} text-black inline-flex text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer pt-5 pb-2`}><MessageCircle />Message
                
                </Link>
                <Link to={'/video'} className={`${homepage === '/message' ? 'text-blue-400' : 'text-gray-600'} text-black inline-flex text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer pt-5 pb-2`}><Video />Video
                
                </Link>
                <div className='font-bold py-6 md:px-6 flex flex-col '> 
                <div className='inline-flex gap-4 items-center' >
                  <User2 /> 
                <Link to={'/content'} className={`${homepage === '/content' ? 'text-blue-400' : 'text-gray-600'} text-black text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 
                transition-all duration-500 ease-in-out cursor-pointer pb-2 tech`}>Content</Link>
                <button onClick={() => setContent(!content)} className='text-3xl'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={`size-5 ${browse ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}>
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                </button>
                </div>
                  <div className={`w-48 shadow-md flex py-6 ${content ? "blocked" :"hide"}`}>
                  <div className={`flex p-2 flex-col text-black`}>
                    <Link to={'/all'} className='hover:text-blue-800 p-1'>Add Student</Link>
                    <Link to={'/all'} className='hover:text-blue-800 p-1'>Get a Arabic Mentor</Link>
                    <Link to={'/all'} className='hover:text-blue-800 p-1'>Get a Course Mentor</Link>
                    </div>
                    </div>
                </div>
                
              <div className='md:hidden block'>
            <Link to={'/library'} className={`${homepage === '/library' ? 'text-blue-400' : 'text-gray-600'} text-black inline-flex text-gray-600 hover:text-blue-800 gap-3 font-bold rounded-xl lg:p-2 p-1 transition-all duration-500 ease-in-out cursor-pointer`}><LibraryIcon /> Library
            </Link>
            </div>
            </div>
      <div className="block md:hidden">
  <div className="flex justify-start">

    {/* USER IS LOGGED IN */}
     {check}
  </div>
</div>

        </section>
        </div>
        </header>

        <div className={`${messageOpen ? 'block' : 'hidden'}`}>
          <LiveClass  fetchUnreadCount={fetchUnreadCount} handleMessageOpen={handleMessageOpen} />
          </div>
        
        </>
    )

}

export default Navbar