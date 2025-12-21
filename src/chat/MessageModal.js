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
    <div>

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


        { canEdit &&
            <MenuItem label="Edit" onClick={() => {
              setOpen(false);
              setEditingMessage(message)}} />
        }


          <MenuItem label="Delete" onClick={handleDeletePop} />
        </div>
      

     

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
