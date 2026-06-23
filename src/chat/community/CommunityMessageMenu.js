import api from "../../Api/axios";

export default function CommunityMessageMenu({
  open,
  isMobile,
  anchorPosition,
  selectedMessage,
  setSelectedMessage,
  onClose,
  onCopy,
  openForward,
  setShowMessageMenu,
  setActionType,
  setActionMessage,
  setShowActionModal,
  isAdmin,
  setMessages,
}) {

  if (!open || !selectedMessage) {
    return null;
  }

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

  
const handleDownloadMessage =
  async (message) => {

    try {
      const token = localStorage.getItem("token");

      const response =
        await fetch(
          `http://localhost:8000/api/community/messages/download/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        throw new Error(
          "Download failed"
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        message.type === "video"
          ? "video.mp4"
          : "image.jpg";

      document.body.appendChild(a);

      a.click();

      a.remove();

      window.URL.revokeObjectURL(
        url
      );

    } catch (err) {

      console.log(err);

    }
};

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="
          fixed
          inset-0
          z-[9998]
          lg:bg-black/20
          lg:backdrop-blur-sm
          flex
          justify-center
          items-center"
      >

        {/* MENU */}
        <div
          onClick={(e) =>
            e.stopPropagation()
          }
          className={`
            z-[9999]
            overflow-hidden
            animate-in
            fade-in
            zoom-in-95
            duration-150
            bg-[var(--bg-color)]
            text-[var(--text-color)]
            border
            border-white/10
            shadow-2xl
            flex
            flex-col

            ${
              isMobile
                ? `
                  absolute
                  rounded-2xl
                  min-w-[240px]
                `
                : `
                  relative
                  w-[280px]
                  rounded-3xl
                `
            }
          `}
          style={
            isMobile
              ? {
                  top:
                    anchorPosition?.y || 0,

                  left:
                    anchorPosition?.x || 0,
                }
              : {}
          }
        >

          {/* HEADER */}
          <div
            className="
              px-4
              py-3

              border-b
              border-white/10

              flex
              items-center
              justify-between
            "
          >

            <button
              onClick={onClose}
              className="
                p-2
                rounded-full
                hover:bg-white/10
                transition 
                float-right
              "
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

          </div>

          {/* BODY */}
          <div className="p-2 flex flex-col gap-1">

            {/* COPY */}
            <MenuButton
              label="Copy"
              onClick={() => {

                onCopy();
                setSelectedMessage(null)
                onClose();
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
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 0 1 3.75 20.625V9.375c0-.621.504-1.125 1.125-1.125H8.25m7.5-4.5h3.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-9.75A1.125 1.125 0 0 1 8.25 14.625V4.875c0-.621.504-1.125 1.125-1.125h6.375Z"
                  />
                </svg>
              }
            />

            {/* Download */}

            {/* DOWNLOAD */}
      {(
        selectedMessage?.type === "image" ||
        selectedMessage?.type === "video"
      ) && (
        <MenuButton
          label="Download"
          onClick={ () => { 
            setSelectedMessage(null)
            handleDownloadMessage(); onClose();}}
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
                d="M12 16.5v-9m0 9-3-3m3 3 3-3M3.75 15v3a2.25 2.25 0 0 0 2.25 2.25h12A2.25 2.25 0 0 0 20.25 18v-3"
              />
            </svg>
          }
        />
      )}

            <MenuButton
              label="Forward"
              onClick={() => {
                setShowMessageMenu(false);
                openForward(selectedMessage);
                onClose();
                setSelectedMessage(null)
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
           
            {/*OWNER ACTIONS*/}
            {isAdmin && (
              <>
              {/* Pin  */}
              <MenuButton
              onClick={() => {
                handlePin(selectedMessage);
                setSelectedMessage(null)
                setShowMessageMenu(false);
              }}
              label={
                selectedMessage?.is_pinned
                  ? "Unpin"
                  : "Pin"
              }
              icon={
                selectedMessage?.is_pinned ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5"
                  >
                    <path d="M12 2a1 1 0 0 1 1 1v6.586l3.707 3.707A1 1 0 0 1 16 15H8a1 1 0 0 1-.707-1.707L11 9.586V3a1 1 0 0 1 1-1Z" />
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

                {/* EDIT */}
                {selectedMessage?.replied_to === null && 

                <MenuButton
                  label="Edit"
                  onClick={() => {

                    setActionType("edit");
                    setSelectedMessage(null)
                    setActionMessage(
                      selectedMessage
                    );

                    setShowMessageMenu(false);

                    setTimeout(() => {

                      setShowActionModal(true);

                    }, 50);
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
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                      />
                    </svg>
                  }
                />
                }

                {/* CLEAR */}
                <MenuButton
                  label="Clear"
                  onClick={() => {

                    setActionType("clear");
                    setSelectedMessage(null)

                    setActionMessage(
                      selectedMessage
                    );

                    setShowMessageMenu(false);

                    setTimeout(() => {

                      setShowActionModal(true);

                    }, 50);
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
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  }
                />

                {/* DELETE */}
                <MenuButton
                  danger
                  label="Delete"
                  onClick={() => {
                    setActionType("delete");
                    setSelectedMessage(null)
                    setActionMessage(
                      selectedMessage
                    );
                    setShowMessageMenu(false);
                    setTimeout(() => {
                      setShowActionModal(true);
                    }, 50);
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
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0V4.5A2.25 2.25 0 0 0 13.5 2.25h-3A2.25 2.25 0 0 0 8.25 4.5v1.29"
                      />
                    </svg>
                  }
                />

              </>
            )}

          </div>

        </div>
      </div>
    </>
  );
}

// 

function MenuButton({
  label,
  onClick,
  icon,
  danger = false,
}) {

  return (
    <button
      onClick={onClick}
      className={`
        w-full

        flex
        items-center
        justify-between

        px-4
        py-3

        rounded-2xl

        transition-all
        duration-200

        hover:bg-white/10

        ${
          danger
            ? "text-red-500"
            : "text-[var(--text-color)]"
        }
      `}
    >

      <div className="flex items-center gap-3">

        {icon}

        <span className="font-medium text-sm">
          {label}
        </span>

      </div>

    </button>
  );
}