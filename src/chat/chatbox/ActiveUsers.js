import { useState, useEffect, useMemo } from "react";
import { Copy,  Shield, Flag, User, UserCircle, MessageCircle, MessageCircleHeart, Search } from "lucide-react";
import { ChatSkeleton } from "./ChatSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import UserStatus from "../online/OnlineStatuesDot";
import { Link } from "react-router-dom";
import BlockButton from "../Block";
import { ReportModal } from "../ReportModal";
import api from "../../Api/axios";

import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export default function ActiveUsers({
  activeChat,
  loadingChats, // 👈 NEW PROP
  setActiveChat,
  setChats,
  chats,
  openChat, 
  setMessages,
  onBack
}) {

  const [copiedField, setCopiedField] = useState(null);
  const [animate, setAnimate] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [disappearTime, setDisappearTime] = useState("off");


  const user = activeChat?.other_user || {};
  const {user: authUser} = useAuth()

  const chatId = activeChat?.id;

  useEffect(() => {
  socket.on("message-deleted", (data) => {
    setMessages(prev =>
      prev.filter(msg => msg.id !== data.messageId)
    );
  });

  return () => socket.disconnect();
}, []);

  // 🔥 animation trigger when chat changes
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [activeChat]);

  const copyToClipboard = (value, field) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  

const options = [
  { label: "Off", value: "off", seconds: 0  },
  { label: "1 Minute", value: "1m", seconds: 60 },
  { label: "1 Hour", value: "1h", seconds: 3600 },
  { label: "1 Day", value: "1d", seconds: 86400 },
  { label: "7 Days", value: "7d", seconds: 604800 },
];


   const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }; 

  const filteredSearch = useMemo(() => {
  if (!searchTerm) return chats;

  return chats.filter(chat => {
    const name =
      `${chat.other_user?.first_name || ""} ${chat.other_user?.last_name || ""}`.toLowerCase();

    return name.includes(searchTerm.toLowerCase());
  });
}, [searchTerm, chats]);

  // 🔥 LOADING STATE
  if (loadingChats) {
  return (
    <div className="h-full bg-white transition-all duration-300">
      <ChatSkeleton type="info" />
    </div>
  );
}

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a chat to view info
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col bg-white transition-all duration-500 ease-in-out ${
        animate ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
      }`}
    >

      {/* HEADER */}
      <div className="flex flex-row justify-between px-3 py-4 items-center border-b ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
          stroke="currentColor" class="size-6 cursor-pointer text-black lg:hidden" onClick={onBack}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>

         <div className="font-bold flex items-center gap-2 text-black text-xl ">
          <UserCircle size={24} /> User's Info
        </div>
      </div>
     

      {/* PROFILE */}
      <div className="flex flex-col items-center p-4 border-b bg-white transition-all duration-300">

        <div
                className={`w-24 h-24 rounded-full bg-gray-300 mb-3 shadow-md hover:scale-105 transition rounded-full text-white flex items-center justify-center font-bold text-[60px] shadow-sm ${getColor(
                  user?.first_name
                )}`}
              >
                {getInitial(user?.first_name)}
              </div>

        <h2 className="font-semibold text-lg font-bold inline-flex gap-2 items-center text-black font-bold">
          {user.first_name || "User"} {user.last_name || ""}
        </h2>

        

        {user.email && (
          <div className="flex justify-between items-center group text-black text-sm">
            <div className="flex items-center gap-2">
              <span>{user.email}</span>
              <Copy
                size={14}
                className="cursor-pointer opacity-50 group-hover:opacity-100 transition"
                onClick={() => copyToClipboard(user.email, "email")}
              />
            </div>
          </div>
        )}
      </div>
          {/* Disappearing Message */}

      {/* ACTIONS */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 pb-2 space-y-0 text-black font-semibold border-b-2">

        <Link to={`/profile/${user.id}`}>
        <ActionButton icon={<UserCircle size={24} />} label="View Profile" />
        </Link>
        
      <div className="relative flex flex-col px-6 pt-3 border-b pb-2">

        {/* BUTTON */}
        <button  className="font-semibold text-black inline-flex gap-2 items-center"
        onClick={() => setShowDropdown(!showDropdown)}>
          <MessageCircle size={20} />
          Disappear Message
        </button>

        {/* STATUS TEXT (UNDER BUTTON) */}
        <div className="text-xs text-gray-800 mt-1 ml-7">
          {options.find(o => o.value === disappearTime)?.label || "Off"}
        </div>
    </div>
        
        
        <ActionButton icon={<MessageCircleHeart size={20} />} label="Create Group Chat" />

        <ActionButton icon={<Shield size={20} />} label="Verify Two-Step" />

        {
            !activeChat?.block_info?.blocked ? 
        <ActionButton
          icon={<Shield size={20} />}
          label="Block User"
          onClick={() => setShowBlockModal(true)}
        />
        :
        <ActionButton
          icon={<Shield size={20} />}
          label="Unblock User"
          onClick={() => setShowBlockModal(true)}
        />
}

        <ActionButton
          icon={<Flag size={20} />}
          label="Report User"
          onClick={() => setShowReportModal(true)}
        />

        <ActionButton
        icon={<Search size={20} />}
        label="Search"
        onClick={() => setShowSearchModal(true)}
      />

      </div>

      {/* COPY FEEDBACK */}
      {copiedField && (
        <div className="text-center bg-green-600 p-2 text-white text-sm rounded animate-fadeIn">
          Copied {copiedField} ✔
        </div>
      )}

      {showBlockModal && (
  <ModalOverlay onClose={() => setShowBlockModal(false)}>

    <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-lg animate-scaleIn">

      <h2 className="text-lg font-semibold mb-2 text-black p-2 text-center">
        Block User's {user.first_name}
      </h2>

      <p className="text-sm text-gray-500 mb-5">
        {
            !activeChat?.block_info?.blocked ? 
            <span>
              This person won't be able to message or call you, and
              They will know you have block them. 
            </span>
            : <span>
                Are you sure you want to  unblock this user?
            </span>
          } 
      </p>

      <div className="flex justify-end gap-3">

        <button
          onClick={() => setShowBlockModal(false)}
          className="px-4 py-2 font-bold text-sm hover:text-green-700 rounded-lg text-green-800 transition"
        >
          Cancel
        </button>

        {/* ✅ YOUR REAL LOGIC */}
        <BlockButton
          activeChat={activeChat}
          authUser={authUser}
          chatPartner={user}
          setActiveChat={setActiveChat}
          setChats={setChats}
        />

      </div>

    </div>

  </ModalOverlay>
)}

{showDropdown && (
  <ModalOverlay onClose={() => setShowDropdown(false)}>

    <div className="bg-white w-72 text-black text-sm p-6 rounded-xl shadow-lg animate-scaleIn">

    {options.map(opt => (
      <div
        key={opt.value}
        onClick={async () => {
          setDisappearTime(opt.value);
          setShowDropdown(false);

          await api.post(`/api/chat/${chatId}/disappearing`, {
            time: opt.seconds,
            label: opt.value,
            enabled: opt.value !== "off",
          });
        }}
        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        {opt.label}
      </div>
    ))}

  </div>
 
  </ModalOverlay>
)}

{showReportModal && (
  <ModalOverlay onClose={() => setShowReportModal(false)}>

    <ReportModal
      chat={activeChat}
      onClose={() => setShowReportModal(false)}
    />

  </ModalOverlay>
)}

{showSearchModal && (
  <ModalOverlay onClose={() => setShowSearchModal(false)}>

    <div className="bg-white w-full flex-1 h-full text-black rounded-xl shadow-lg animate-scaleIn">

      {/* HEADER */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg">Search Chat</h2>
        <button onClick={() => setShowSearchModal(false)}>✕</button>
      </div>

      {/* INPUT */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* RESULT LIST */}
      <div className="max-h-80 overflow-y-auto">

        {filteredSearch.length === 0 ? (
          <p className="text-center text-gray-400 p-5">
            No users found
          </p>
        ) : (
          filteredSearch.map(chat => {
            const user = chat.other_user;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  setShowSearchModal(false);
                  openChat(chat); // 🔥 OPEN CHAT
                }}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition"
              >

                {/* AVATAR */}
                <div
                  className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold ${getColor(
                    user?.first_name
                  )}`}
                >
                  {getInitial(user?.first_name)}
                </div>

                {/* NAME */}
                <div>
                  <p className="font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                </div>

              </div>
            );
          })
        )}

      </div>

    </div>

  </ModalOverlay>
)}
    </div>
  );
}

/* 🔥 REUSABLE BUTTON */
function ActionButton({ icon, label, onClick, danger, warning }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full py-3 px-6 border-b hover:border-b-0 transition-all duration-200 transform active:scale-95
        ${
          danger
            ? "text-red-600 hover:bg-red-100"
            : warning
            ? "text-yellow-600 hover:bg-yellow-100"
            : "hover:bg-gray-100"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
      />

      {/* CONTENT */}
      <div className="relative z-10">
        {children}
      </div>

    </div>
  );
}