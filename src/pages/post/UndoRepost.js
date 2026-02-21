import { useState } from "react";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";

export default function UndoRepost ({post, setPosts}) {

    const [openUndo, setOpenUndo] = useState(false)
    const [loadingUndo, setLoadingUndo] = useState(false)


    const handleUndo = async () => {
    
        setLoadingUndo(true)
        try {
            await api.delete(`/api/posts/${post.original_post_id}/undo-repost`);
            
            // remove post from UI
            setOpenUndo(false)
            setPosts(prev => prev.filter(p => p.id !== post.id));
        } catch (err) {
            console.error(err);
        }
        finally{
            setLoadingUndo(false)
        }
    };

    return(
        <div className="relative inline-block text-left">
      <button
        onClick={() => setOpenUndo(!openUndo)}
        className="px-1 py-1 text-black rounded-full hover:text-gray-700 hover:bg-gray-100 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 rotate-90">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
  </svg>

      </button>

      {openUndo && (
        <div className="absolute top-6 right-0 mt-2 w-40 whitespace-nowrap bg-white border rounded shadow-lg z-50">
            <ul className="flex flex-col items-center justify-center py-3">
          
            <li>
            <button onClick={handleUndo}
                disabled={loadingUndo}
        className={`flex items-center text-black  font-semibold gap-1 mx-4 transition
          ${loadingUndo ? "opacity-50 cursor-not-allowed" : "hover:text-gray-800"}
        `}
      >
        
          
        

        {loadingUndo ? 
        <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2  border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            Undo Repost
        </div>
         : "Undo Repost"}
            </button>
        
            </li>
            </ul> 
            </div>
      )}

        </div>
    )
}