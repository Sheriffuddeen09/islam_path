import React, { useMemo, useState } from "react";
import api from "../../Api/axios";
import DeleteModal from "../DeleteModal";
import EditModal from "../EditModal";
import ClearChatModal from "../ClearModal";
import { ForwardModal } from "../ForwardMessage";

export default function MenuComponent({
  msg,
  authUser,
  setMessages,
  setActiveMenuId,
  setReplyingTo,
  setSelectedMessages,
  setSelectedMsg,
  setActiveChat,
  setForwardMessage,
  togglePin,
  onSearch,
  setUiState,
  uiState,
  searchMode,
  searchQuery,
  setSearchMode,
  setSearchQuery, chats, selectedMessages, forwardMessage, activeChat, setForwardMode

}) {
  const [showMore, setShowMore] = useState(false);

  const [copied, setCopied] = useState(false);

  const isMine = Number(msg.sender_id) === Number(authUser?.id);

   const [openDelete, setOpenDelete] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [clearMessage, setClearMessage] = useState(false);
    const [reportMessage, setReportMessage] = useState(false);
    
  
    const [toast, setToast] = useState(false)
    
    
      
          const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
      };


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
    const handleCopy = async (message) => {
    await navigator.clipboard.writeText(message.message || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
    // ================= DELETE =================
    const handleDeletePop = (message) => {
    setSelectedMsg(message); // optional
    setActiveMenuId(null);
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
  
    const clearSelection = () => {
    setSelectedMessages([]);
    setSelectedMsg(null);
  };

  // ================= ACTIONS =================
  const getActions = (message) => {
    if (!message) return [];

    return [
      {
        label: "Reply",
        show: true,
        onClick: (m) => {
          setReplyingTo(m);
          clearSelection();
          setUiState(prev => ({ ...prev, openMenu: false }));
        },
      },

      {
        label: copied ? "Copied ✓" : "Copy",
        show: message.type === "text",
        onClick: (m) => {
          handleCopy(m);
          clearSelection();
        },
      },

      {
        label: "Edit",
        show:
            message.type === "text" &&
            isMine &&
            msg.status !== "read",
        onClick: (m) => {
            setEditingMessage(m);
            clearSelection();
        },
        },

      {
        label: "Delete",
        show: true,
        onClick: (m) => {
          handleDeletePop(m);
          clearSelection();
        },
      },

      {
        label: "Forward",
        show: true,
        onClick: (m) => {
          setForwardMessage(true);
          setSelectedMessages([m.id]);
          clearSelection();
        },
      },

      {
        label: "Search",
        show: message.type === "text",
        onClick: (m) => {
          onSearch?.(m.message);
          clearSelection();
        },
      },

      {
        label: message.is_pinned ? "Unpin" : "Pin",
        show: true,
        onClick: (m) => {
          togglePin(m);
          clearSelection();
        },
      },
    ].filter(a => a.show);
  };

  const actions = useMemo(
    () => getActions(msg),
    [msg, copied, isMine]
  );

  const mainActions = actions.slice(0, 5);
  const moreActions = actions.slice(5);

  return (
    <>
<div className="fixed w-full top-20">
    {searchMode && (
  <div className="flex items-center gap-2 p-2 ">

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

</div>


      {uiState?.openMenu &&
        uiState?.mode === "menu" &&
        uiState?.message?.id === msg.id && (
          <div
            className="fixed inset-0 z-[9999]"
            onClick={() =>
              setUiState({
                openMenu: false,
                mode: null,
                message: null,
                showMore: false,
              })
            }
          >
            <div
              className="absolute top-10 right-3 w-52 bg-white rounded-lg py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MAIN */}
              <div className="py-1">
                {mainActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      console.log("🔥 ACTION:", action.label, msg.id);

                      action.onClick(msg);

                      setUiState({
                        openMenu: false,
                        mode: null,
                        message: null,
                        showMore: false,
                      });
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* MORE */}
              {moreActions.length > 0 && (
                <>
                  <div className="border-t" />

                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    More {showMore ? "▲" : "▼"}
                  </button>

                  {showMore && (
                    <div className="border-t bg-gray-50">
                      {moreActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            action.onClick(msg);

                            setUiState({
                              openMenu: false,
                              mode: null,
                              message: null,
                              showMore: false,
                            });
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {openDelete && (
                <DeleteModal
                  message={msg}
                  onClose={() => setOpenDelete(false)}
                  setMessages={setMessages}
                  currentUserId={authUser.id}
                />
              )}
        
              {editingMessage && (
                <EditModal
                  currentUserId={authUser.id}
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
        
    </>
  );
}