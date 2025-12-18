import { useState, useEffect } from "react";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import logo from "../layout/image/favicon.png";
import { useAuth } from "../layout/AuthProvider";
import { Link } from "react-router-dom";
import NavbarChat from "./Header";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [isMobile, setIsMobile] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [startLive, setStartLive] = useState(false);

  const {user} = useAuth()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      const savedChat = localStorage.getItem("activeChat");
      if (savedChat) setActiveChat(JSON.parse(savedChat));
    }
  }, [isMobile]);

  useEffect(() => {
    if (activeChat && !isMobile) {
      localStorage.setItem("activeChat", JSON.stringify(activeChat));
    }
  }, [activeChat, isMobile]);

  const chatPartner =
  activeChat && user
    ? activeChat.teacher?.id === user.id
      ? activeChat.student
      : activeChat.student?.id === user.id
      ? activeChat.teacher
      : activeChat.teacher || activeChat.student
    : null;




  const content = (
    <div className="relative sm:h-[555px] h-screen overflow-y-hidden">
      {/* Container */}
      <div className="flex h-full relative overflow-hidden">

        {/* Chat List */}
        <div
          className={`
            flex flex-col 0 bg-white border-r md:flex md:w-[350px] 
            absolute md:relative top-0 left-0 h-full
            transition-transform duration-300 ease-in-out
            ${activeChat && isMobile ? "-translate-x-full" : "translate-x-0"}
            w-full md:w-[350px] lg:w-96
          `}
        >
          <ChatList activeChat={activeChat} setActiveChat={setActiveChat} />
        </div>

        {/* Chat Window */}
       <div
          className={`
            flex flex-col absolute md:relative top-0 left-0 h-full no-scrollbar
            transition-transform duration-300 ease-in-out
            ${activeChat ? "translate-x-0" : "translate-x-full md:translate-x-0"}
            w-full
          `}
        >
          {activeChat ? (
            <div className="flex flex-col mt-0 h-full w-full no-scrollbar">
              <div className=" px-2 border-b flex justify-between items-center  gap-2 no-scrollbar">
                <div className="inline-flex  items-center gap-2 py-3 sm:mx-4 mx-2 no-scrollbar">
                <button
                  className="text-blue-600 font-semibold sm:hidden"
                  onClick={() => setActiveChat(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>

                </button>
                {user && chatPartner &&  (
                <Link to={`/profile/${user.id}`} className="inline-flex items-center gap-2">
                 <div className="w-12 h-12 rounded-full bg-blue-900 text-white text-xl flex items-center justify-center font-bold">
                  {chatPartner?.first_name?.[0] || "?"}
                </div>

                
                <span className="font-semibold truncate text-black">
                  {chatPartner?.first_name} {chatPartner?.last_name}
                </span>
                </Link>
              )}

                </div>
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 text-black font-bold cursor-pointer hover:text-blue-600 sm:mx-4 mx-2"
                  onClick={() => setShowGuide(true)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>


              </div>

              <ChatWindow activeChat={activeChat} chat={activeChat} setShowGuide={setShowGuide} setStartLive={setStartLive} startLive={startLive} showGuide={showGuide} />
            </div>
          ) : (  
            <div className="flex flex-col items-center justify-center bg-gray-900 w-full text-white h-full text-center p-6">
              <div className="flex justify-center mb-6">
                <img src={logo} alt="Platform Logo" className="h-14 w-auto animate-logo-spin-flip" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                Welcome to Live Class Chat
              </h2>

              <p className="text-white max-w-md">
                Select a conversation from the list to start chatting.
                <br />
                Messages, live class discussions, and updates will appear here.
              </p>

              <div className="mt-6 text-sm text-white">
                💬 Stay connected • 📚 Learn together • 🔔 Get instant updates
              </div>
            </div>
          )}
        </div>  
      </div>
    </div>
  );

 return (
  <div className="h-screen flex flex-col">
    
    {/* NAVBAR */}
    {(!isMobile || !activeChat) && <NavbarChat />}

    {/* CHAT CONTENT */}
    <div className="flex-1 overflow-hidden">
      {content}
    </div>

  </div>
);

}
