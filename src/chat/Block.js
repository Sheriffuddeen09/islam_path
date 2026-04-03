import { Loader2, Unlock, UserX } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import api from "../Api/axios";

export default function BlockButton({ activeChat, authUser, chatPartner, setActiveChat, setChats }) {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
  console.log("clicked block");

  if (!activeChat || !chatPartner) {
    console.warn("Blocked by guard clause");
    return;
  }

  setLoading(true);
  try {
    const res = await api.post(`/api/chats/${activeChat.id}/block`);

    const newBlockInfo = res.data.block_info;

    setChats(prev =>
      prev.map(c =>
        c.id === activeChat.id ? { ...c, block_info: newBlockInfo } : c
      )
    );

    setActiveChat(prev => ({
      ...prev,
      block_info: newBlockInfo,
    }));

    toast.success("User blocked successfully");
  } catch (err) {
    console.error(err.response?.data || err.message);
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
          <div className="">

        <button 
          onClick={handleBlock}
          disabled={loading}
          className="px-3 py-2 inline-flex gap-2 items-center text-sm font-bold text-green-800 rounded hover:text-green-700 text-sm"
         
        >
          {
            loading 
            ? 
            <p className="inline-flex gap-2 items-center text-sm font-bold text-green-800 rounded hover:text-green-700">
               <Loader2 /> Blocking
            </p>

            :
          "Block"
          }

        </button>
        </div>
      )}

      {/* Unblock button (only if current user blocked the other) */}
      {activeChat?.block_info?.blocked &&
        activeChat.block_info.blocker_id === authUser.id && (
          <div className="">

          <button
             onClick={handleUnblock}
            disabled={loading}
            className="px-3 py-2 inline-flex gap-2 items-center text-sm font-bold text-green-800 rounded hover:text-green-700"
          >
            {
            loading 
            ? 
                 <p className="inline-flex gap-2 items-center text-sm font-bold text-green-800 rounded hover:text-green-700">
                <Loader2 /> Unblocking
            </p>
            :
            "Unblock"
  }
          </button>
          </div>
        )}
        {/* <Toaster position="top-right" className="flex justify-center items-center mx-auto" />
         */}
    </div>
  );
}
