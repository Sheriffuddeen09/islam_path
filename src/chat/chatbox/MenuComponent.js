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
  messages, setShowReactions, loadingChats, setActiveChat, handleSendMeeting, messagesCacheRef, 
  setMessagesMap
}) {
  const [showMore, setShowMore] = useState(false);

  const [copied, setCopied] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const isMine = Number(msg.sender_id) === Number(authUser?.id);

   const [openDelete, setOpenDelete] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
   const [showPinDuration, setShowPinDuration] = useState(false);
const [pinningMessage, setPinningMessage] = useState(null);

  const [loading, setLoading] = useState(false);



  
    const [toast, setToast] = useState(false)
    
    const [groups, setGroups] = useState([]);
const [loadingGroups, setLoadingGroups] = useState(true);

const openPinDuration = (message) => {
  if (message.is_pinned) {
    togglePin(message);
    return;
  }

  setPinningMessage(message);
  setShowPinDuration(true);
};

const confirmPin = async (days) => {
    if (!pinningMessage || pinLoading) return;

    setPinLoading(true);

    try {
        await api.put("/api/messages/pin", {
            message_id: pinningMessage.id,
            days,
        });

        setMessages((prev) =>
            prev.map((m) =>
                Number(m.id) === Number(pinningMessage.id)
                    ? {
                          ...m,
                          is_pinned: true,
                          pin_expires_at: new Date(
                              Date.now() +
                                  days * 24 * 60 * 60 * 1000
                          ).toISOString(),
                      }
                    : m
            )
        );

        setShowPinDuration(false);
        setPinningMessage(null);
    } catch (err) {
        console.error("Pin error:", err);
    } finally {
        setPinLoading(false);
    }
};

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
        if (typeof t === "object" && t !== null) {
          return {
            id: Number(t.id),
            type: t.type || t.__type || "user",
          };
        }

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

    console.log("FORWARD SUCCESS:", res.data);

    const chatId = res.data?.chat_id;

    if (!chatId) {
      throw new Error("No chat_id returned");
    }

    const chatsRes = await api.get("/api/chats");

    const allChats = Array.isArray(chatsRes.data)
      ? chatsRes.data
      : [];

    setChats(allChats);

    const targetChat = allChats.find(
      (chat) => Number(chat.id) === Number(chatId)
    );

    if (!targetChat) {
      throw new Error("Target chat not found");
    }

    delete messagesCacheRef.current[chatId];

    setMessagesMap((prev) => {
      const updated = { ...prev };

      delete updated[chatId];

      return updated;
    });
 
    setForwardMessage({
      open: false,
      messages: [],
    });

    setSelectedMessages([]);
 
    await openChat(
      targetChat,
      true,
      true
    );

    setToast("Messages forwarded");

  } catch (err) {
    console.error(
      "FORWARD ERROR:",
      err.response?.data || err
    );

    setToast("Failed to forward messages");

  } finally {
    setLoading(false);
  }
};


  
    const handleDeletePop = (message) => {
    setSelectedMsg(message); 
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

  const handleCopyText = async (message) => {
  try {
    const text = message?.message || "";

    if (!text.trim()) {
      toast.error("No text to copy", "error");
      return;
    }

    await navigator.clipboard.writeText(text);

    toast.success("Text copied", "success");
  } catch (err) {
    toast.error("Failed to copy", "error");
  }
};

const handleCopyLink = async (message) => {
  try {
    let url = null;

    if (message?.file_url) {
      url = message.file_url;
    } else if (message?.file) {
      url = message.file.startsWith("http")
        ? message.file
        : `http://localhost:8000/storage/${message.file}`;
    }

    if (!url) {
      toast.error("No file link found", "error");
      return;
    }

    await navigator.clipboard.writeText(url);

    toast.success("Link copied", "success");
  } catch (err) {
    toast.error("Failed to copy link", "error");
  }
};

  // ================= ACTIONS =================
  const getActions = (message) => {
    if (!message) return [];

    return [
      {
        label: copied ? "Copied ✓" : "Copy Text",
        show:
          !!message.message,
        onClick: (m) => {
          handleCopyText(m);
          clearSelection();
        },
      },
      {
        label: "Copy Link",
        show: [
          "image",
          "video",
          "audio",
          "file",
        ].includes(message.type),
        onClick: (m) => {
          handleCopyLink(m);
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
  show: isMine,
  onClick: (m) => {
    openPinDuration(m);
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
              className="absolute top-10 right-3 w-52 bg-black/80 text-white backdrop-blur-md font-bold rounded-lg py-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MAIN */}
              <div className="py-1">
                {mainActions.map((action, i) => (
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
                    className="w-full text-left px-4 py-3 text-sm  text-white font-bold"
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
                    className="w-full text-left px-4 py-3 text-white font-bold"
                  >
                    More {showMore ? "▲" : "▼"}
                  </button>

                  {showMore && (
                    <div className="border-t">
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
                          className="w-full text-left px-4 py-3 text-sm text-white font-bold"
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
                          handleSendMeeting={handleSendMeeting}
                        />
              </div>
          )}

         {showPinDuration && (
    <div
        className={`
            fixed
            inset-0
            z-[100]
            bg-black/50
            flex
            items-center
            justify-center
            p-4
            ${pinLoading ? "cursor-not-allowed" : ""}
        `}
        onMouseDown={(e) => {
            if (pinLoading) {
                e.preventDefault();
                e.stopPropagation();
            }
        }}
        onClick={(e) => {
            if (pinLoading) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }

            // Optional: allow backdrop click to close
            if (e.target === e.currentTarget) {
                setShowPinDuration(false);
                setPinningMessage(null);
            }
        }}
    >
        <div
            className={`
                w-full
                max-w-sm
                rounded-xl
                p-5
                shadow-xl
                ${pinLoading
                    ? "pointer-events-none select-none"
                    : ""}
            `}
            style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">
                    Pin message
                </h2>

                <button
                    type="button"
                    disabled={pinLoading}
                    onClick={() => {
                        if (pinLoading) return;

                        setShowPinDuration(false);
                        setPinningMessage(null);
                    }}
                    className="
                        text-lg
                        px-1
                        rounded
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                    "
                >
                    ✕
                </button>
            </div>

            <p className="text-sm opacity-70 mb-4">
                How long should this message stay pinned?
            </p>

            <div className="space-y-2">
                {[7, 14, 30].map((days) => (
                    <button
                        key={days}
                        type="button"
                        disabled={pinLoading}
                        onClick={() => {
                            if (pinLoading) return;

                            confirmPin(days);
                        }}
                        className="
                            w-full
                            px-4
                            py-3
                            rounded-lg
                            border
                            text-left
                            hover:bg-black/5
                            dark:hover:bg-white/5
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                        style={{
                            borderColor: "var(--text-color)",
                        }}
                    >
                        <div className="font-medium">
                            {days} days
                        </div>

                        <div className="text-xs opacity-60">
                            Expires after {days} days
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
)}
    </>
  );
}