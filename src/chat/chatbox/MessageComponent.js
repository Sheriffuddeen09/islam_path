
import { useEffect, useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import ClearChatModal from "../ClearModal";
import { ReportModal } from "../ReportModal";
import api from "../../Api/axios";
import { ForwardModal } from "../ForwardMessage";

export default function MessageComponent({
  showMenu,
  showMore,
  setShowMore,
  togglePin,
  msg,
  setMessages,
  onSearch, // 🔥 trigger global search
  activeChat,
  selectedMessages,
  setActiveChat,
  setSelectedMessages,
  chats,
  forwardMessage, 
  setForwardMessage,
  setShowMenuId, searchMode, searchQuery, setSearchMode,
  setSearchQuery, setReplyingTo, setForwardMode, menuPosition, activeMenuId, setActiveMenuId, setMenuPosition
}) {
  const { user } = useAuth();
  const isMine = msg.sender_id === user.id;
  const [toast, setToast] = useState(false)


  
      const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ================= STATES =================
  const [copied, setCopied] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [clearMessage, setClearMessage] = useState(false);
  const [reportMessage, setReportMessage] = useState(false);
  

  const forwardMessages = async (messageIds, receiverIds) => {
    try {
      const res = await api.post("/api/messages/forward-multiple", {
        message_ids: messageIds,
        receiver_ids: receiverIds,
      });
  
      setToast("Messages forwarded");
  
      const chats = res.data.chats; // full chat objects
  
      // Open the first forwarded chat
      if (chats.length > 0) {
        setActiveChat(chats[0]);       // sets chat header correctly
        setMessages(chats[0].messages); // show latest messages including forwarded
      }
  
      setSelectedMessages([]);
      setForwardMessage(false);
    } catch (err) {
      console.error(err.response?.data || err);
      setToast("Failed to forward messages");
    }
  };


  // ================= COPY =================
  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.message || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ================= DELETE =================
  const handleDeletePop = () => {
    setActiveMenuId(null)
    setOpenDelete(true);
  };


  const handleDownload  = async (type, message) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/messages/download/${type}/${message.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    const extMap = {
      video: "mp4",
      image: "jpg",
      audio: "mp3",
      document: "pdf",
    };

    link.download = `${message.id}.${extMap[type]}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast(`${type} downloading...`, "success");
  } catch (err) {
    console.error(err);
    showToast(`Failed to download ${type}`, "error");
  }
};

  // ================= ACTIONS =================
  const actions = [
  { 
    label: "Reply", 
    show: true, 
    onClick: () => {
      setReplyingTo(msg); 
      setActiveMenuId(null)
    }
  },

  {
    label: copied ? "Copied ✓" : "Copy",
    show: msg.type === "text", // ✅ only text
    onClick: handleCopy,
  },

  {
    label: "Download Image",
    show: msg.type === "image" && !isMine,
    onClick: handleDownload,
  },
  {
    label: "Download Video",
    show: msg.type === "video" && !isMine,
    onClick: handleDownload,
  },
  {
    label: "Download Audio",
    show: (msg.type === "audio") && !isMine,
    onClick: handleDownload,
  },
  {
    label: "Download Document",
    show: msg.type === "file" && !isMine,
    onClick: handleDownload,
  },

  {
    label: "Edit",
    show: msg.type === "text" && isMine,
    onClick: () => {
      setEditingMessage(msg);
      setActiveMenuId(null)
    },
  },
  {
    label: "Delete",
    show: true,
    onClick: handleDeletePop,
  },
  {
    label: "Clear Message",
    show: isMine,
    onClick: () => setClearMessage(true),
  },

  {
    label: "Forward",
    show: true,
    onClick: () => {
      setForwardMode(true);
      setSelectedMessages([msg]);
      setActiveMenuId(null)
    }
  },
  {
    label: "Search",
    show: msg.type === "text", // ✅ only text searchable
    onClick: () => {
      onSearch?.(msg.message);
      setActiveMenuId(null)
    },
  },
  {
    label: msg.is_pinned ? "Unpin" : "Pin",
    show: true,
    onClick: () => togglePin(msg),
  },

  // =========================
  // ❌ ONLY RECEIVER MESSAGE
  // =========================

  {
    label: "Report",
    show: !isMine,
    onClick: () => setReportMessage(true),
  },

].filter(a => a.show);



  const mainActions = actions.slice(0, 5);
  const moreActions = actions.slice(5);

  // ================= POSITION =================


 

  return (
  <>
   {searchMode && (
  <div className="flex items-center gap-2 p-2 border-b">

    <button onClick={() => {
      setSearchMode(false);
      setSearchQuery("");
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>

    </button>

    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search..."
      className="flex-1 px-3 py-2 border rounded-lg shadow"
    />

  </div>
)}

<div className="sm:hidden block">


   {showMenu && menuPosition && activeMenuId === msg.id && (
  <div
    className="fixed inset-0 z-[9999] overflow-y-auto p-3 no-scrollbar "
    onClick={() => {
      setActiveMenuId(null);
      setMenuPosition(null);
      setShowMore(false);
    }}
  >
    {/* POSITION WRAPPER */}
    <div
      className="absolute"
      style={{
        top: menuPosition.y + 0,
        right: menuPosition.isMine
          ? menuPosition.x - 250
          : '',
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* ================= MENU BOX ================= */}
      <div
        className="
          bg-white text-black shadow-xl rounded-xl w-48 py-3
          max-h-[60vh]
          overflow-y-auto
          flex flex-col no-scrollbar
        "
      >

        {/* CLOSE */}
        <button
          className="sticky top-0 bg-white z-10 text-right px-2 py-1"
          onClick={() => {
            setActiveMenuId(null);
            setMenuPosition(null);
            setShowMore(false);
          }}
        >
          ✕
        </button>

        {/* MAIN ACTIONS  */}
        {mainActions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onClick();
              setActiveMenuId(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
          >
            {action.label}
          </button>
        ))}

        {/* MORE BUTTON */}
        {moreActions.length > 0 && (
          <button
            onClick={() => setShowMore(true)}
            className="w-full text-left px-3 py-2 text-blue-500 hover:bg-gray-100 text-sm"
          >
            More
          </button>
        )}

        {/* MORE ACTIONS */}
        {showMore &&
          moreActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick();
                setActiveMenuId(null);
                setShowMore(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {action.label}
            </button>
          ))}

      </div>
    </div>
  </div>
)}

</div>

<div className="sm:block hidden">


   {showMenu && menuPosition && activeMenuId === msg.id && (
  <div
    className="fixed inset-0 z-[9999] overflow-y-auto p-3 no-scrollbar "
    onClick={() => {
      setActiveMenuId(null);
      setMenuPosition(null);
      setShowMore(false);
    }}
  >
    {/* POSITION WRAPPER */}
    <div
      className="absolute"
      style={{
        top: menuPosition.y + 0,
        right: menuPosition.isMine
          ? menuPosition.x - 500
          : '',
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* ================= MENU BOX ================= */}
      <div
        className="
          bg-white text-black shadow-xl rounded-xl w-48 py-3
          max-h-[60vh]
          overflow-y-auto
          flex flex-col no-scrollbar
        "
      >

        {/* CLOSE */}
        <button
          className="sticky top-0 bg-white z-10 text-right px-2 py-1"
          onClick={() => {
            setActiveMenuId(null);
            setMenuPosition(null);
            setShowMore(false);
          }}
        >
          ✕
        </button>

        {/* MAIN ACTIONS  */}
        {mainActions.map((action, i) => (
          <button
            key={i}
            onClick={() => {
              action.onClick();
              setActiveMenuId(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
          >
            {action.label}
          </button>
        ))}

        {/* MORE BUTTON */}
        {moreActions.length > 0 && (
          <button
            onClick={() => setShowMore(true)}
            className="w-full text-left px-3 py-2 text-blue-500 hover:bg-gray-100 text-sm"
          >
            More
          </button>
        )}

        {/* MORE ACTIONS */}
        {showMore &&
          moreActions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                action.onClick();
                setActiveMenuId(null);
                setShowMore(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {action.label}
            </button>
          ))}

      </div>
    </div>
  </div>
)}

</div>

    {/* ================= MODALS ================= */}
    
      {openDelete && (
        <DeleteModal
          message={msg}
          onClose={() => setOpenDelete(false)}
          setMessages={setMessages}
          currentUserId={user.id}
        />
      )}

      {editingMessage && (
        <EditModal
          currentUserId={user.id}
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onMessageUpdate={(updated) => {
            setMessages(prev =>
              prev.map(m => (m.id === updated.id ? updated : m))
            );
          }}
        />
      )}

      {clearMessage && (
        <ClearChatModal
          chatId={activeChat}
          onClose={() => setClearMessage(false)}
          onCleared={() => setMessages([])}
        />
      )}

      {forwardMessage && (
        <ForwardModal
          messages={selectedMessages}
          users={chats}
          onSend={(selectedUserIds) => {
            forwardMessages(selectedMessages.map(m => m.id), selectedUserIds);
          }}
          onClose={() => {
            setForwardMessage(false);
            setForwardMode(false);
            setSelectedMessages([]);
          }}
        />)}

      {reportMessage && (
        <ReportModal
          activeChat={activeChat}
          onClose={() => setReportMessage(false)}
        />
      )}
      {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}
  </>
);
}