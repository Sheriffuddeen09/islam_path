import { useState, useRef, useEffect } from "react";
import { ReportModal } from "./ReportModal";

export default function MessageBubblePop({ message, isMe, onAction }) {
  const [open, setOpen] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const ref = useRef();

  // Close menu on outside click
  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

 const handleReportPop = () => {
  setOpen(false);        // 👈 close menu
  setOpenReport(true);  // 👈 open report modal
};

const closeReport = () => {
  setOpenReport(false);
};

const handleDeletePop = () => {
  setOpen(false);        // 👈 close menu
  setOpenDelete(true);  // 👈 open report modal
};
const closeDelete = () => {
  setOpenDelete(false);
};



  return (
    <div className={`relative mb-3 ${isMe ? "text-right" : "text-right"}`}>
      {/* MENU ICON */}
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 text-gray-500 hover:text-black"
      >
        ⋮
      </button>

      {/* POPUP MENU */}
      {open && (
        <div
          ref={ref}
          className="fixed h-full w-full top-0 right-0  z-50 bg-black bg-opacity-70 flex mx-auto  flex-col justify-center items-center shadow rounded w-96 text-sm"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onClick={() => setOpen(!open)} class="size-6 fixed  right-14 text-black -translate-y-16  z-50">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>

        <div className="bg-white text-black font-semibold sm:w-96 w-72 p-2 rounded-lg">
          <MenuItem label="Reply" onClick={() => onAction("reply", message)} />
          {message.type === "text" && (
            <MenuItem label="Copy" onClick={() => navigator.clipboard.writeText(message.message)} />
          )}
          <MenuItem label="Edit" onClick={() => onAction("edit", message)} />
          <MenuItem label="Delete" onClick={() => onAction("delete", message)} />
          {!isMe && (
            <MenuItem label="Report" onClick={handleReportPop} />
          )}

          <MenuItem label="Block User" onClick={() => onAction("block", message.sender_id)} />
        </div>
        </div>
      )}

      {openReport && (
        <ReportModal
            message={message}
            onClose={closeReport}
        />
        )}

    </div>
  );
}

const MenuItem = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
  >
    {label}
  </button>
);
