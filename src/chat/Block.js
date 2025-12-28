import { Unlock, UserX } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../Api/axios";

export default function BlockButton({ activeChat, authUser, chatPartner, setActiveChat, setChats }) {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!activeChat) return;
    setLoading(true);
    try {
      await api.post(`/api/chats/${activeChat.id}/block`);

      const newBlockInfo = {
        blocked: true,
        blocker_id: authUser.id,
        blocked_id: chatPartner.id,
      };

      setChats(prev =>
        prev.map(c =>
          c.id === activeChat.id ? { ...c, block_info: newBlockInfo } : c
        )
      );

      setActiveChat(prev => ({ ...prev, block_info: newBlockInfo }));

      toast.success("User blocked successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to block user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!activeChat) return;
    setLoading(true);
    try {
      await api.delete(`/api/chats/${activeChat.id}/unblock`);

      setChats(prev =>
        prev.map(c =>
          c.id === activeChat.id ? { ...c, block_info: null } : c
        )
      );

      setActiveChat(prev => ({ ...prev, block_info: null }));

      toast.success("User unblocked successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to unblock user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Block button (only if not blocked) */}
      {!activeChat?.block_info?.blocked && (
          <div className="relative group inline-block">

        <button
          className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
         
        >
          <UserX className="w-4 h-4" />
          </button>
          <button 
           onClick={handleBlock}
          disabled={loading}
           className="absolute top-5 z-50 right-0 text-black bg-white opacity-0 
            group-hover:opacity-100 group-hover:translate-y-2 transform transition-all
             duration-500 invisible group-hover:visible p-2 rounded-lg shadow-md">
          {
            loading 
            ? 
                <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="text-blue-900"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
            :
          "Block"
          }

        </button>
        </div>
      )}

      {/* Unblock button (only if current user blocked the other) */}
      {activeChat?.block_info?.blocked &&
        activeChat.block_info.blocker_id === authUser.id && (
          <div className="relative group inline-block">

          <button
            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
           
          >
            <Unlock className="w-4 h-4" />
          </button>
            <button
             onClick={handleUnblock}
            disabled={loading}
             className="absolute top-5 z-50 right-0 text-black bg-white opacity-0 
            group-hover:opacity-100 group-hover:translate-y-2 transform transition-all
             duration-500 invisible group-hover:visible p-2 rounded-lg shadow-md">
            
            {
            loading 
            ? 
                <svg
      className="animate-spin h-5 w-5 text-blue-900 mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
            :
            "Unblock"
  }
          </button>
          </div>
        )}
        <Toaster position="top-10" className="flex justify-center items-center mx-auto" />
        
    </div>
  );
}
