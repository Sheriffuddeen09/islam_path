import { useState, useEffect, useMemo, act } from "react";
import { Copy,  Shield, Flag, User, UserCircle, MessageCircle, MessageCircleHeart, Search, Group, GroupIcon, Link2Icon, Settings } from "lucide-react";
import { ChatSkeleton } from "./ChatSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import BlockButton from "../Block";
import { ReportModal } from "../ReportModal";
import api from "../../Api/axios";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import CreateGroupModal from "./CreateGroupModal";
import GroupSearch from "./GroupSearch";
import AddMemberModal from "./AddMemberModal";
import RemoveMemberModal from "./RemoveMemberModal";
import GroupMembersManager from "./GroupMemberManager";
import GroupSettingsModal from "./GroupSetting";
import InviteViaLinkModal from "./InviteViaLinkModal";
import PendingMembersModal from "./PendingMember";
import { ReportGroupModal } from "./ReportGroupModal";

const socket = io("http://localhost:8000");

export default function ActiveUsers({
  activeChat,
  loadingChats, // 👈 NEW PROP
  setActiveChat,
  setChats,
  chats,
  openChat, 
  setMessages,
  onBack,
}) {

  const [copiedField, setCopiedField] = useState(null);
  const [animate, setAnimate] = useState(false);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportGroupModal, setShowReportGroupModal] = useState(false);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const [disappearTime, setDisappearTime] = useState("off");


  const navigate = useNavigate();
  const user = activeChat?.other_user || {};
  const {user: authUser} = useAuth()

  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]) 
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showGroupSearchModal, setShowGroupSearchModal] = useState(false);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false)
  const [showGroupMemberModal, setShowGroupMemberModal] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showPending, setShowPending] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const isAdmin = activeChat?.my_role === "admin";




 useEffect(() => {
  if (!isAdmin || !activeChat?.id) return;

  const fetchCount = async () => {
    try {
      const res = await api.get(
        `/api/groups/${activeChat.id}/pending-count`
      );

      setPendingCount(res.data.count);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCount();
}, [activeChat?.id, isAdmin]);



      useEffect(() => {
        fetchUsers();
      }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get("/api/users"); // 🔥 your endpoint
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    finally{
      setLoadingUsers(false)
    }
  };


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

  
  const generateInviteLink = async () => {
  try {
    const res = await api.get(`/api/groups/${chatId}/invite-link`);

    const link = res.data.invite_link;

    await navigator.clipboard.writeText(link);

    toast.success("Invite link copied!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate link");
  }
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

  const [showMembers, setShowMembers] = useState(false);

  


    const isGroup = activeChat?.type === "group";

    const members = activeChat?.members || [];

    const sortedMembers = [...members].sort((a, b) => {
      const aIsAdmin = a.pivot?.role === "admin";
      const bIsAdmin = b.pivot?.role === "admin";

      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
      return 0;
    });

    const visibleMembers = sortedMembers.slice(0, 2);
    const extraCount = members.length - 2;

  const displayName = isGroup
    ? activeChat?.group_name || activeChat?.name || "Unnamed Group"
    : `${activeChat?.other_user?.first_name || ""} ${activeChat?.other_user?.last_name || ""}`;

  const avatarName = isGroup
    ? displayName
    : activeChat?.other_user?.first_name;


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
      <div className="flex flex-row justify-between px-3 py-5 items-center border-b ">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" 
          stroke="currentColor" class="size-6 cursor-pointer text-black lg:hidden" onClick={onBack}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>

      {isGroup  ?  (
         <div className="font-bold flex items-center gap-2 text-black text-xl ">

          <Group size={30} /> Group's Info
        </div> 
      ) :  (
         <div className="font-bold flex items-center gap-2 text-black text-xl ">

          <UserCircle size={24} /> User's Info
        </div> 
      ) }
      </div>
     

      {/* PROFILE */}
      <div className="flex flex-col items-center p-4 border-b bg-white transition-all duration-300">

        <div
          className={`w-24 h-24 rounded-full mb-3 shadow-md hover:scale-105 transition flex items-center justify-center font-bold text-[60px] text-white ${getColor(
            avatarName
          )}`}
        >
          {isGroup && activeChat?.image_url ? (
            <img
              src={activeChat.image_url}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getInitial(avatarName)
          )}

      </div>

        <h2 className="font-semibold text-lg font-bold inline-flex gap-2 items-center text-black font-bold">
          {displayName}
        </h2>

         {isGroup && (
      <div className="flex items-center gap-2 mt-1 flex-wrap">

        {visibleMembers.map((member) => {
          const isMe = member.id === authUser?.id;
          const isAdmin = member.pivot?.role === "admin";

          return (
            <div key={member.id} className="inline-flex items-center gap-1">

              {/* AVATAR */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getColor(
                  member.first_name
                )}`}
              >
                {getInitial(member.first_name)}
              </div>

              {/* NAME */}
              <h2 className="text-sm font-semibold text-black">
                {isMe ? "You" : member.first_name}
              </h2>

              {/* ADMIN TAG */}
              {isAdmin && (
                <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1 rounded">
                  admin
                </span>
              )}
            </div>
          );
        })}

    {/* MORE BUTTON */}
    {extraCount > 0 && (
      <div
        onClick={() => setShowMembers(true)}
        className="text-xs bg-gray-200 px-2 py-0.5 rounded-full cursor-pointer"
      >
        +{extraCount}
      </div>
    )}
  </div>
)}

        {isGroup && (
            <p className="text-xs text-gray-500">
              {activeChat.members_count || activeChat.members?.length || 0} members
            </p>
          )}

          {isAdmin && pendingCount > 0 && (
            <button
              onClick={() => setShowPending(true)}
              className="text-blue-600 text-sm"
            >
              Pending Members ({pendingCount})
            </button>
          )}

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
      {
        !isGroup &&
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
        
        
        <ActionButton icon={<MessageCircleHeart size={20} />} 
         onClick={() => setShowModal(true)}
         label="New Group Chat" />

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
      }


      {
        isGroup &&
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 pb-2 space-y-0 text-black font-semibold border-b-2">

      <ActionButton
        icon={<Link2Icon size={24} />}
        label="Invite Via Link"
        onClick={() => setShowInviteModal(true)}
      />
        
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
        
        
        {/* ✅ EVERYONE */}
        

        {isAdmin && (
          <ActionButton
            icon={<Settings size={20} />}
            label="Update Group Setting"
            onClick={() => setShowSettings(true)}
          />
        )}

        <ActionButton
          icon={<MessageCircleHeart size={20} />}
          label="Add New Member"
          onClick={() => setShowAddModal(true)}
        />

         {isAdmin && (
          <ActionButton
            icon={<Shield size={20} />}
            label="Remove Member"
            onClick={() => setShowRemoveModal(true)}
          />
        )}

        {isAdmin && (
        <ActionButton
          icon={<GroupIcon size={20} />}
          label="Group Member Management"
          onClick={() => setShowGroupMemberModal(true)}
        />
        )}
      
        

        {!isAdmin && (  
        <ActionButton
          icon={<Flag size={20} />}
          label="Report Group"
          onClick={() => setShowReportGroupModal(true)}
        />
          )}

        <ActionButton
        icon={<Search size={20} />}
        label="Search"
        onClick={() => setShowGroupSearchModal(true)}
      />

      <ActionButton
        icon={<Search size={20} />}
        label="Exit Group"
        onClick={() => setShowSearchModal(true)}
      />

      <ActionButton
        icon={<Search size={20} />}
        label="Delete Group"
        onClick={() => setShowSearchModal(true)}
      />
      </div>
      }


      {/* COPY FEEDBACK */}
      {copiedField && (
        <div className="text-center bg-green-600 p-2 text-white text-sm rounded animate-fadeIn">
          Copied {copiedField} ✔
        </div>
      )}

    {showGroupMemberModal && (
      <GroupMembersManager
        chat={activeChat}
        members={members}
        allUsers={users}
        currentUserId={authUser.id}
        getColor={getColor}
        getInitial={getInitial}
        onClose={() => setShowGroupMemberModal(false)}
        setActiveChat={setActiveChat}
      />
    )}

    <PendingMembersModal
      chat={activeChat}
      isOpen={showPending}
      onClose={() => setShowPending(false)}
      authUser={authUser}
      pending={pending}
      setPending={setPending}
    />
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

      {showRemoveModal && (
        <RemoveMemberModal
          chat={activeChat}
          currentUserId={activeChat.id}
          onClose={() => setShowRemoveModal(false)}
        />
      )}


      {showAddModal && (
        <AddMemberModal
          chat={activeChat}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSettings && (
      <GroupSettingsModal
        chat={activeChat}
        setChat={setActiveChat}
        setShowModal={setShowSettings}
      />
    )}

    

      {/* 🔥 MODAL */}
      {showInviteModal && (
        <InviteViaLinkModal
          chat={activeChat}
          onClose={() => setShowInviteModal(false)}
        />
      )}

  {showMembers && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-80 max-h-[400px] overflow-y-auto">
      
      <h3 className="font-bold mb-3">Group Members</h3>

      {members.map((member) => (
        <div
          key={member.id}
          onClick={() => navigate(`/profile/${member.id}`)}
          className="flex items-center gap-3 py-2 border-b cursor-pointer hover:bg-gray-100 rounded px-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getColor(
              member.first_name
            )}`}>
            {getInitial(member.first_name)}
          </div>

          <span className="text-sm">
            {member.first_name} {member.last_name}
          </span>
          </div>
          ))}

        <button
          onClick={() => setShowMembers(false)}
        className="mt-4 w-full bg-gray-200 py-2 rounded">
        Close
        </button>
    </div>
  </div>
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


{showReportGroupModal && (
  <ModalOverlay onClose={() => setShowReportGroupModal(false)}>

    <ReportGroupModal
      chat={activeChat}
      onClose={() => setShowReportGroupModal(false)}
    />

  </ModalOverlay>
)}




{showModal && (
        <CreateGroupModal
          users={users}
          onClose={() => setShowModal(false)}
          loadingUsers={loadingUsers}
        />
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
   

{showGroupSearchModal && (
  <ModalOverlay onClose={() => setShowGroupSearchModal(false)}>
      <GroupSearch
        members={members}
        openChat={openChat}
        getColor={getColor}
        getInitial={getInitial}
        showMemberSearchModal={showGroupSearchModal} 
        setShowMemberSearchModal={setShowGroupSearchModal}

      />
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