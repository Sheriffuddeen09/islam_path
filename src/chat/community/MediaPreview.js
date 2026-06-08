import  { useState } from "react";
import ReadMoreCaption from "./ReadMoreCaption";
import toast from "react-hot-toast";
import CommunityMediaReaction from "./CommunityMediaReaction";
import DeleteMessageModal from "./DeleteMessageModal";
import api from "../../Api/axios";

export default function MediaPreview({
  showPreview,
  setShowPreview,
  previewMessage,
  authUser,
  isAdmin,
  onReport,
  react,
  msg,
  activeCommunity,
  reactionMsg, setReactionMsg, 
  setMessages, openForward, setSelectedMessage, selectedMessage
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [showDeleteModal,
  setShowDeleteModal] =
  useState(false);



  if (!showPreview || !previewMessage) return null;


   const handlePin = async (msg) => {
     try {
       if (msg.is_pinned) {
         await api.delete("/api/community/messages/pin", {
           data: { message_id: msg.id },
         });
       } else {
         await api.put("/api/community/messages/pin", {
           message_id: msg.id,
         });
       }
   
       setMessages(prev =>
         prev.map(m =>
           m.id === msg.id
             ? {
                 ...m,
                 is_pinned: !m.is_pinned,
               }
             : m
         )
       );
   
       setSelectedMessage(prev =>
         prev?.id === msg.id
           ? {
               ...prev,
               is_pinned: !prev.is_pinned,
             }
           : prev
       );
   
     } catch (err) {
       console.error(err);
     }
   };


const handleDownloadMessage = async (message) => {
  console.log("Downloading:", message);

  const toastId = toast.loading(
    `Downloading ${
      message.file_name || "file"
    }...`
  );

  try {
    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8000/api/community/messages/download/${message.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "Status:",
      response.status
    );

    if (!response.ok) {
      const text =
        await response.text();

      console.log(
        "Server error:",
        text
      );

      throw new Error(
        text || "Download failed"
      );
    }

    const blob =
      await response.blob();

    const downloadUrl =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = downloadUrl;

    a.download =
      message.file_name ||
      `file-${message.id}`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    window.URL.revokeObjectURL(
      downloadUrl
    );

    toast.success(
      "Download completed",
      {
        id: toastId,
      }
    );
  } catch (err) {
    console.error(
      "Download error:",
      err
    );

    toast.error(
      err.message ||
        "Failed to download file",
      {
        id: toastId,
      }
    );
  }
};

const handleCopyLink = async (msg) => {
  try {
    let file = null;

    if (msg?.files?.length) {
      file = msg.files[0]?.file_url;
    } else if (msg?.file) {
      file = getImage(msg.file);
    }

    if (!file) {
      toast.error(
        "No media link found",
        "error"
      );
      return;
    }

    await navigator.clipboard.writeText(
      file
    );

    toast.success(
      "Media link copied",
      "success"
    );
  } catch (err) {
    console.error(err);

    toast.error(
      "Failed to copy link",
      "error"
    );
  }
};

const handleCopyText = async (msg) => {
  try {

    let text = "";

    if (
      msg?.approvals?.length > 0
    ) {
      const latestApproval =
        msg.approvals[
          msg.approvals.length - 1
        ];

      text =
        latestApproval?.admin_response ||
        "";
    } else {
      text = msg?.message || "";
    }

    if (!text) {
      toast.error(
        "No text found",
        "error"
      );
      return;
    }

    await navigator.clipboard.writeText(
      text
    );

    toast.success(
      "Text copied",
      "success"
    );

  } catch (err) {
    console.error(err);

    toast.error(
      "Failed to copy text",
      "error"
    );
  }
};

  const getImage = (image) => {

    if (!image) return null;

    if (
      image.startsWith("http")
    ) {
      return image;
    }

    // ✅ storage image
    return `http://localhost:8000/storage/${image}`;
  };


  return (
   <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex flex-col">

  {/* HEADER */}
  <div className="h-16 px-4 flex items-center justify-between">

    <div className="flex items-center gap-3">

      <button
        onClick={() => setShowPreview(false)}
      >
         <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
      </button>

      <div>
        <div className="flex items-center gap-2">

           
            {activeCommunity.community_image && (
              <img
                src={getImage(
                  activeCommunity.community_image
                )}
                alt={
                  activeCommunity.community_name
                }
                className="
                  w-10
                  h-10
                  rounded-full
                  object-cover
                "
              />
            )}

            <div>
               <h3 className="font-bold block sm:hidden text-lg text-white">
                {activeCommunity.community_name?.length > 9
                  ? `${activeCommunity.community_name.slice(0, 9)}...`
                  : activeCommunity.community_name}
              </h3>

              <h3 className="font-bold sm:block hidden text-lg text-white">
                {activeCommunity.community_name}
              </h3>
            </div>

          </div>

        <div className="text-center text-[9px] text-white">
          {new Date(msg.created_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </div>

    </div>

    <div className="flex items-center gap-4">

      {/* DOWNLOAD */}
      <button
        onClick={() =>
          handleDownloadMessage(
            previewMessage
          )
        }
      >
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>

      </button>

      {/* MENU */}
      <div className="relative">

        <button
          onClick={() =>
            setMenuOpen(prev => !prev)
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>

        </button>

        {menuOpen && (
          <div
            className="
              absolute
              right-0
              top-full
              mt-2

              bg-[#111]
              rounded-xl

              w-40
              overflow-hidden

              shadow-xl

              animate-in
              slide-in-from-top-2
            "
          >
            <MenuItem
              label="Forward"
              onClick={() => {
                openForward(previewMessage);
                setMenuOpen(false);
                setShowPreview(false)
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              }
            />

              {(
              previewMessage?.type === "image" ||
              previewMessage?.type === "video"
            ) && (
              <MenuItem
                label="Copy Link"
                onClick={() => {
                  handleCopyLink(
                    previewMessage
                  );
                  setMenuOpen(false);
                }}
              />
            )}

            {(
              previewMessage?.message ||
              previewMessage?.approvals?.length
            ) && (
              <MenuItem
                label="Copy Text"
                onClick={() => {
                  handleCopyText(
                    previewMessage
                  );
                  setMenuOpen(false);
                }}
              />
            )}

            {isAdmin && (
              <>
                <MenuItem
          onClick={() =>{
            handlePin(previewMessage); setMenuOpen(false) }
            }
            label={
              previewMessage.is_pinned
                ? "Unpin"
                : "Pin"
            }
            icon={
              previewMessage.is_pinned ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="size-5"
                >
                  <path d="M12 2a1 1 0 0 1 1 1v6.586l3.707 3.707A1 1 0 0 1 16 15H8a1 1 0 0 1-.707-1.707L11 9.586V3a1 1 0 0 1 1-1Z" />
                  <path d="M12 15v7" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v6m0 0 3 3m-3-3-3 3m3-3v12"
                  />
                </svg>
              )
            }
          />

              </>
            )}
          </div>
        )}

      </div>

    </div>

  </div>

  {/* MEDIA */}
  <div
    className="
      flex-1
      flex
      items-center
      justify-center
      overflow-hidden
    "
  >

    {previewMessage.type ===
      "image" && (
      <img
        src={
          previewMessage.files?.[0]
            ?.file_url
        }
        className="
          max-h-full
          max-w-full
          object-contain
        "
      />
    )}

    {previewMessage.type ===
      "video" && (
      <video
        controls
        autoPlay
        className="
          max-h-full
          max-w-full
        "
      >
        <source
          src={
            previewMessage.files?.[0]
              ?.file_url
          }
        />
      </video>
    )}

  </div>

  {/* CAPTION */}
  {previewMessage.message && (
    <div
      className="
        px-5
        py-4
        mx-auto mt-4
        text-white
        w-full max-w-md
        bg-[#0c0c0c]
      "
    >

      <ReadMoreCaption
        text={
          previewMessage.message
        }
      />

    </div>
  )}

  {/* REACTIONS */}
  <div
    className="
      px-4
      pb-5

      flex
      items-center
      gap-3
    "
  >  
     {reactionMsg?.id === msg.id && (
    <div >
        <CommunityMediaReaction
        onReact={react}
        message={reactionMsg}
        isMine={
          reactionMsg &&
          reactionMsg.sender_id === authUser.id
        }
        setShowReactions={() => setReactionMsg(null)}
        />
    </div>
    )}

      <span>
        {msg.reactions?.length > 0 && (
              <div
                    className="
                      bg-[#1e1e1e]
                      rounded-full

                      px-4
                      py-2

                      flex
                      gap-2
                    "
                  >
                {Object.values(
                  msg.reactions.reduce(
                    (acc, r) => {
                      if (
                        !acc[r.emoji]
                      ) {
                        acc[r.emoji] = {
                          emoji: r.emoji,
                          count: 0,
                        };
                      }
                      acc[r.emoji]
                        .count++;
                      return acc;
                    },
                    {}
                  )
                ).map((r, i) => (
                  <span key={i}>
                    {r.emoji}
                    {r.count > 1 &&
                      ` ${r.count}`}
                  </span>
                ))}
              </div>
            )}
      </span>

    <button
       onClick={(e) => {
          e.stopPropagation();
          setReactionMsg(msg); // OPEN POPUP
      }}
      className="
        w-10
        h-10

        rounded-full

        bg-[#1e1e1e]
      "
    >
      😊
    </button>

  </div>

  <DeleteMessageModal
    open={showDeleteModal}
    message={selectedMessage}
    setMessages={setMessages}
    onClose={() => {
      setShowDeleteModal(false);
      setSelectedMessage(null);
    }}
  />
   
</div>
  );
}

/* ================= MENU ITEM ================= */
function MenuItem({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
        danger ? "text-red-400" : "text-white"
      }`}
    >
      {label}
    </button>
  );
}