
import { useEffect, useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import DeleteModal from "../chatcomponent/DeleteModal";
import EditModal from "../chatcomponent/EditModal";
import { ReportModal } from "../chatcomponent/ReportModal";
import api from "../../Api/axios";
import { ForwardModalLargeScreen } from "../chatcomponent/ForwardModalLargeScreen";


export default function MessageComponent({
  showMenu,
  showMore,
  setShowMore,
  togglePin,
  msg,
  setMessages,
  activeChat,
  selectedMessages,
  openChat,
  setSelectedMessages,
  chats, setChats, setActiveChat,
  searchMode, searchQuery, setSearchMode, forwardMessage, messages,loadingChats, 
  setSearchQuery, setForwardMessage, menuPosition, activeMenuId, setActiveMenuId, setMenuPosition
}) {
  const { user } = useAuth();
  const isMine = msg.sender_id === user.id;
  const [toast, setToast] = useState(false)

  const [loading, setLoading] = useState(false);

  
      const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ================= STATES =================
  const [copied, setCopied] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [reportMessage, setReportMessage] = useState(false);
  


const [groups, setGroups] = useState([]);
const [loadingGroups, setLoadingGroups] = useState(true);

useEffect(() => {
  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);

      const res = await api.get("/api/groups");

      setGroups(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingGroups(false);
    }
  };

  fetchGroups();
}, []);

  const forwardMessages = async (
  messageIds,
  receiverTargets
) => {
  try {
    setLoading(true);

    const targetsArray = Array.isArray(receiverTargets)
      ? receiverTargets
      : [];

    const payload = {
      message_ids: messageIds,

      targets: targetsArray.map((t) => {

        // already object
        if (typeof t === "object") {
          return {
            id: Number(t.id),
            type: t.type || t.__type || "user",
          };
        }

        // string user-1
        const [type, id] = String(t).split("-");

        return {
          id: Number(id),
          type,
        };
      }),
    };

    console.log("FORWARD PAYLOAD:", payload);

    const res = await api.post(
      "/api/messages/forward-multiple",
      payload
    );

    console.log("FORWARD RESPONSE:", res.data);

    // 🔥 USE BACKEND CHAT ID
    const chatId = res.data?.chat_id;
    const newMessages = res.data?.messages || [];

    if (chatId) {

      // 🔥 get latest chats
      const chatsRes = await api.get("/api/chats");

      const allChats = chatsRes.data || [];

      // 🔥 instantly update sidebar
      setChats(allChats);

      // 🔥 find forwarded chat
      const targetChat = allChats.find(
        (c) => Number(c.id) === Number(chatId)
      );

      if (targetChat) {

  // 🔥 immediately switch chat
  setActiveChat(targetChat);

  // 🔥 ALWAYS replace when opening another chat
  if (
    Number(activeChat?.id) !== Number(targetChat.id)
  ) {

    setMessages(newMessages);

  } else {

    // 🔥 same chat → merge
    setMessages((prev) => {

      const existingIds = new Set(
        prev.map((m) => m.id)
      );

      return [
        ...prev,
        ...newMessages.filter(
          (m) => !existingIds.has(m.id)
        ),
      ];
    });
  }

  // 🔥 cache instantly
  setMessages((prev) => ({
    ...prev,
    [targetChat.id]: newMessages,
  }));

  // 🔥 open without clearing messages
  openChat(targetChat);
}


}

    // 🔥 close modal instantly
    setForwardMessage({
      open: false,
      messages: [],
    });

    setSelectedMessages([]);

    setToast("Messages forwarded");

  } catch (err) {

    console.error(
      err.response?.data || err
    );

    setToast("Failed to forward messages");

  } finally {

    setLoading(false);
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

  const status = (msg.status || "").toLowerCase().trim();
  

  const actions = [

  {
    label: copied ? "Copied ✓" : "Copy",
    show: msg.type === "text", // ✅ only text
    onClick: () => {handleCopy(); setActiveMenuId(null)},
  },

  {
    label: "Download Image",
    show: msg.type === "image" && !isMine,
    onClick: () => {handleDownload(); setActiveMenuId(null)},
  },
  {
    label: "Download Video",
    show: msg.type === "video" && !isMine,
    onClick: () => {handleDownload(); setActiveMenuId(null)},
  },
  {
    label: "Download Audio",
    show: (msg.type === "audio") && !isMine,
    onClick: () => {handleDownload(); setActiveMenuId(null)},
  },
  {
    label: "Download Document",
    show: msg.type === "file" && !isMine,
    onClick: () => {handleDownload(); setActiveMenuId(null)},
  },

  {
  label: "Edit",
  show:
  isMine &&
  status !== "read" &&
  (
    msg.type === "text" ||
    (
      ["image", "video"].includes(msg.type) &&
      msg.message
    )
  ),
  onClick: (m) => {
    setEditingMessage(m);
    setActiveMenuId(null)
  },
},
  {
    label: "Delete",
    show: true,
    onClick: () => {handleDeletePop(); setActiveMenuId(null)},
  },

  {
    label: "Forward",
    show: true,
    onClick: (m) => {
  const safeMsg = m || msg;

  let messagesToForward = [];

  if (selectedMessages.length > 0) {
    messagesToForward = messages.filter(x =>
      selectedMessages.includes(x.id)
    );
  } else if (safeMsg) {
    messagesToForward = [safeMsg];
  }

  setForwardMessage({
    open: true,
    messages: messagesToForward.filter(Boolean)
  });

  setSelectedMessages([])
}
  },
  {
    label: msg.is_pinned ? "Unpin" : "Pin",
    show: true,
    onClick: () => {togglePin(msg); setActiveMenuId(null)},
  },
  
  {
    label: "Report",
    show: !isMine,
    onClick: () => setReportMessage(true),
  },

].filter(a => a.show);



  const mainActions = actions.slice(0, 5);
  const moreActions = actions.slice(5);


  return (
  <>
 <div className="fixed w-[600px] top-20 lg:block hidden">
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

<div>
</div>

   

</div>

    <div className="lg:block hidden">

    {showMenu && menuPosition && activeMenuId === msg.id && (
      <div
        className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/50 text-[var(--text-color)] backdrop-blur-md flex items-center justify-center p-4"
        onClick={() => {
          setActiveMenuId(null);
          setMenuPosition(null);
          setShowMore(false);
        }}
      >
        {/* MENU CARD */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-xs sm:max-w-sm
            bg-[var(--bg-color)]
            border border-white/30
            shadow-2xl
            rounded-2xl
            text-[var(--text-color)]
            overflow-hidden
          "
        >
          {/* CLOSE */}
          <div className="flex justify-end p-2">
            <button
              onClick={() => {
                setActiveMenuId(null);
                setMenuPosition(null);
                setShowMore(false);
              }}
              className="hover:text-gray-200 text-[var(--text-color)]"
            >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>

            </button>
          </div>

          {/* MAIN ACTIONS */}
          <div className="flex flex-col">
            {mainActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick(msg);
                  setActiveMenuId(null);
                }}
                className="px-4 py-3 text-left text-sm hover:bg-[var(--bg-color)]/5 transition"
              >
                {action.label}
              </button>
            ))}

            {/* MORE */}
            {moreActions.length > 0 && (
              <button
                onClick={() => setShowMore(true)}
                className="px-4 py-3 text-left text-sm text-blue-500 hover:bg-[var(--bg-color)]/5"
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
                    action.onClick(msg);
                    setActiveMenuId(null);
                    setShowMore(false);
                  }}
                  className="px-4 py-3 text-left text-sm hover:bg-[var(--bg-color)]/5"
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
          chatId={activeChat}
        />
      )}

     
     {forwardMessage.open && (
        <div >

                      <ForwardModalLargeScreen
                        messages={forwardMessage.messages}
                        users={chats}
                        onSend={(selectedUserIds) => {
                          forwardMessages(
                            forwardMessage.messages.map(m => m.id),
                            selectedUserIds
                          );
                        }}
                        onClose={() => {
                          setForwardMessage({
                            open: false,
                            messages: []
                          });
                          setSelectedMessages([]);
                        }}
                        loading={loading}
                        groups={groups}
                        loadingChats={loadingChats}
                        loadingGroups={loadingGroups}
                      />
            </div>
        )}

      {reportMessage && (
        <ReportModal
          activeChat={activeChat}
          onClose={() => setReportMessage(false)}
        />
      )}

  </>
);
}