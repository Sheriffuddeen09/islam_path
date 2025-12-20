import { useState, useRef, useEffect } from "react";
import DeleteModal from './DeleteModal'
export default function MessageBubblePop({ message, user, isMe, setMessages, onAction }) {
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const ref = useRef();

  // Close menu on outside click
  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  

const handleDeletePop = () => {
  setOpen(false);        // 👈 close menu
  setOpenDelete(true);  // 👈 open report modal
};
const closeDelete = () => {
  setOpenDelete(false);
};


const handleEditPop = () => {
  setOpen(false);        // 👈 close menu
  setOpenEdit(true);  // 👈 open report modal
};
const closeEdit = () => {
  setOpenEdit(false);
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
       

        <div className="bg-white relative text-black px-2 h-52 flex flex-col justify-center font-semibold sm:w-96 w-72 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onClick={() => setOpen(!open)} class="size-8 absolute cursor-pointer p-1 hover:bg-gray-300 rounded-full right-4 top-3 text-black z-50">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
          <MenuItem label="Reply" onClick={() => onAction("reply", message)} />
          {message.type === "text" && (
            <MenuItem label="Copy" onClick={() => navigator.clipboard.writeText(message.message)} />
          )}
          <MenuItem label="Edit" onClick={handleEditPop} />
          <MenuItem label="Delete" onClick={handleDeletePop} />
          <MenuItem label="Block User" onClick={() => onAction("block", message.sender_id)} />
        </div>
        </div>
      )}

     

        {openDelete && (
        <DeleteModal
            message={message}
            onClose={closeDelete}
            setMessages={setMessages}
            currentUserId={user.id}
        />
        )} 

        {openEdit && (
        <DeleteModal
            message={message}
            onClose={closeEdit}
            setMessages={setMessages}
            currentUserId={user.id}
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
