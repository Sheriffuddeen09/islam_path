import { useState, useRef, useEffect } from "react";
import DeleteModal from './DeleteModal'
import EditModal from "./EditModal";
import ClearChatModal from "./ClearModal";
import toast, {Toaster} from "react-hot-toast";

export default function MessageBubblePop({ open, setOpen, message, user, authUser, currentUserId, isMe, setMessages, activeChat, chat }) {
  const [openDelete, setOpenDelete] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [clearMessage, setClearMessage] = useState(null);

  const ref = useRef();

 const canClear = message.sender_id === currentUserId
 const canEdit = message.sender_id === currentUserId &&
  message.type === "text"&&
  !message.seen_at; 


  const handleOpen = () =>{
    setOpen(!open)
  }
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


const handleMessageUpdate = (updatedMessage) => {
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === updatedMessage.id ? updatedMessage : msg
    )
  );
};


  return (
    <div className={`relative ${isMe ? "text-right" : "text-right"}`}>
      {/* MENU ICON */}
      <button
        onClick={handleOpen}
        className="bg-gray-800 p-1 rounded-full hover:bg-gray-900"
      >
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
  <path fill-rule="evenodd" d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clip-rule="evenodd" />
</svg>

      </button>

      {/* POPUP MENU */}
      {open && (
        <div
          ref={ref}
          className="fixed h-full w-full top-0 right-0  z-50 bg-black bg-opacity-70 flex mx-auto  flex-col justify-center items-center shadow rounded w-96 text-sm"
        >
       

        <div className="bg-white relative text-black px-2 py-6 flex flex-col justify-center font-semibold sm:w-96 w-72 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onClick={() => setOpen(!open)} class="size-8 absolute cursor-pointer p-1 hover:bg-gray-300 rounded-full right-4 top-0 text-black z-50">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
          

          {message.type === "text" && (
            <MenuItem
              label="Copy"
              onClick={() => {
                navigator.clipboard.writeText(message.message);
                toast.success("Text copied!"); 
                setOpen(false); 
              }}
            />
          )}
          { canClear &&
            <MenuItem label="Clear All Message" onClick={() => {
              setOpen(false);
              setClearMessage(true)}} />
        }

         {/* <button
        onClick={() => onForward(message)}
        className="absolute bottom-1 right-1 text-gray-400 hover:text-white"
      >
        forward
      </button> */}

        { canEdit &&
            <MenuItem label="Edit" onClick={() => {
              setOpen(false);
              setEditingMessage(message)}} />
        }


          <MenuItem label="Delete" onClick={handleDeletePop} />
          <MenuItem label="Block User"  />
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

        {editingMessage && (
        <EditModal
          currentUserId={authUser.id}
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onMessageUpdate={handleMessageUpdate}
        />
        )} 

         {clearMessage && (
        <ClearChatModal
          chatId={activeChat}
          chat={chat}
          onClose={() => setClearMessage(false)}
          onCleared={() => setMessages([])} // 👈 instantly clears UI
        />
      )}

      

      <Toaster position="top-right" />

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
