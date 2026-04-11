
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
  setShowMenu,
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
  setSearchQuery, setReplyingTo, setForwardMode
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

  // ================= CLOSE MENU =================
  useEffect(() => {
    const close = () => {
      setShowMenu(false);
      setShowMore(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // ================= COPY =================
  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.message || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ================= DELETE =================
  const handleDeletePop = () => {
    setShowMenu(false);
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
      setShowMenu(false);
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
    show: (msg.type === "audio" || msg.type === "voice") && !isMine,
    onClick: handleDownload,
  },
  {
    label: "Download Document",
    show: msg.type === "file" && !isMine,
    onClick: handleDownload,
  },

  {
    label: "Edit",
    show: isMine,
    onClick: () => {
      setEditingMessage(msg);
      setShowMenu(false);
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
      setShowMenuId(null);
    }
  },
  {
    label: "Search",
    show: msg.type === "text", // ✅ only text searchable
    onClick: () => {
      onSearch?.(msg.message);
      setShowMenu(false);
    },
  },
  {
    label: "Pin",
    show: true,
    onClick: togglePin,
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
  const positionClass = isMine
    ? "absolute bottom-12 right-0 origin-bottom-right"
    : "absolute bottom-12 left-0 origin-bottom-left";

  const morePositionClass = isMine
    ? "absolute bottom-12 right-52"
    : "absolute bottom-12 left-52";

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
      {showMenu && (
        <div
          className={`${positionClass} bg-white shadow-xl rounded-xl w-48 p-2 z-50 animate-slideUp relative`}
          onClick={(e) => e.stopPropagation()}
        >

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
           class="size-4 cursor-pointer  absolute right-2 top-2 " onClick={() => setShowMenu(null)}>
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
 
          {mainActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm rounded"
            >
              {action.label}
            </button>
          ))}

          {moreActions.length > 0 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full text-left px-3 py-2 text-blue-500 hover:bg-gray-100 text-sm"
            >
              More
            </button>
          )}
        </div>
      )}

      {/* ================= MORE MENU ================= */}
      {showMore && (
        <div
          className={`${morePositionClass} bg-white shadow-xl rounded-xl w-48 p-2 z-50 animate-slideUp`}
          onClick={(e) => e.stopPropagation()}
        >
          {moreActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm rounded"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

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