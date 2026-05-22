import React, { useMemo, useEffect, useState } from "react";
import api from "../../Api/axios";
import DeleteModal from "../chatcomponent/DeleteModal";
import EditModal from "../chatcomponent/EditModal";
import { ForwardModal } from "../chatcomponent/ForwardModal";

export default function MenuComponent({
  msg,
  authUser,
  setMessages,
  setActiveMenuId,
  setSelectedMessages,
  setSelectedMsg,
  openChat,
  setForwardMessage,
  togglePin,
  onSearch,
  setUiState,
  uiState,
  searchMode,
  searchQuery,
  setSearchMode, setChats,
  setSearchQuery, chats, selectedMessages, activeChat, forwardMessage, messagesEndRef, 
  messages, setShowReactions, loadingChats, setActiveChat
}) {
  const [showMore, setShowMore] = useState(false);

  const [copied, setCopied] = useState(false);

  const isMine = Number(msg.sender_id) === Number(authUser?.id);

   const [openDelete, setOpenDelete] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
   

  const [loading, setLoading] = useState(false);



  
    const [toast, setToast] = useState(false)
    
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


    useEffect(() => {
  if (uiState?.openMenu) {
    setShowReactions(null);
  }
}, [uiState?.openMenu]);
    
      
          const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
      };



useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);



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
        isMine &&
        msg.status !== "read" &&
        (
          msg.type === "text" ||
          (
            ["image", "video"].includes(msg.type) &&
            msg.message
          )
        ),
        onClick: (m) => {
            setEditingMessage(m);
            clearSelection();
        },
        },
        {
            label: "Download Image",
            show: message.type === "image" && !isMine,
            onClick: (m) => {handleDownload(m); setActiveMenuId(null)},
          },
          {
            label: "Download Video",
            show: message.type === "video" && !isMine,
            onClick: (m) => {handleDownload(m); setActiveMenuId(null)},
          },
          {
            label: "Download Audio",
            show: (message.type === "audio") && !isMine,
            onClick: (m) => {handleDownload(m); setActiveMenuId(null)},
          },
          {
            label: "Download Document",
            show: message.type === "file" && !isMine,
            onClick: (m) => {handleDownload(m); setActiveMenuId(null)},
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
        let messagesToForward = [];

        if (selectedMessages.length > 0) {
          // ✅ MULTI SELECT
          messagesToForward = messages.filter(msg =>
            selectedMessages.includes(msg.id)
          );
        } else {
          // ✅ SINGLE MESSAGE (menu click)
          messagesToForward = [m];
        }

        console.log("FORWARD DATA:", messagesToForward);

        setForwardMessage({
          open: true,
          messages: messagesToForward
        });
      }
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
<div className="fixed w-full top-20 lg:hidden block">
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
              className="absolute top-10 right-3 w-52 bg-black text-white backdrop-blur-md font-bold rounded-lg py-2"
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
                    className="w-full text-left px-4 py-3 text-sm bg-[var(--bg-color)]/50 text-[var(--text-color)] backdrop-blur-md font-bold"
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
                    className="w-full text-left px-4 py-3 text-sm bg-[var(--bg-color)]/50 text-[var(--text-color)] backdrop-blur-md font-bold"
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
                          className="w-full text-left px-4 py-3 text-sm bg-[var(--bg-color)]/50 text-[var(--text-color)] backdrop-blur-md font-bold"
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
                  chatId={activeChat}
                />
              )}
        
             
        
              {forwardMessage.open && (
          <div className="fixed inset-0 flex justify-center block lg:hidden items-center overflow-y-auto z-50">
                        <ForwardModal
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

    </>
  );
}