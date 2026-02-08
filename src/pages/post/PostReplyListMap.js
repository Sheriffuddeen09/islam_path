import { useEffect, useState } from "react";
import ReplyImage from "./PostReplyImage";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";
import PostReplyCopyText from "./PostReplyCopyText";
import api from "../../Api/axios";
import { ReplyReportModal } from "./report/ReplyReportModal";
import Linkify from "linkify-react";



export default function PostReplyListMap({authUser, reply, timeAgo, editText, setEditText, onEdit,
                           onDelete, isDeleting, isEditing, replyTo, setReplyTo,setReplyText,
                           focusReplyInput }){
  
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [deletingReplyId, setDeletingReplyId] = useState(null);
  const [reactions, setReactions] = useState(reply.reactions || []); // ✅ array of { emoji, user }
  const [loadingEmoji, setLoadingEmoji] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const {user} = useAuth()
  const {currentUser} = useAuth()
    const [openReport, setOpenReport] = useState(false);
  
     const handleReport = () =>{
    setOpenReport(!openReport)
  }



  useEffect(() => {
    const arr = reactions && !Array.isArray(reactions)
      ? Object.entries(reactions).flatMap(([emoji, users]) =>
          Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
        )
      : reactions || [];
  
    const userReact = arr.find(r => r.user?.id === currentUser?.id)?.emoji || null;
    setSelectedReaction(userReact);
  }, [reactions, currentUser]);
  
  
   useEffect(() => {
    setReactions(reply.reactions || []);
  }, [reply.reactions]);
  
  
  const reactionArray = reactions && !Array.isArray(reactions)
    ? Object.entries(reactions).flatMap(([emoji, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji, user: u })) : []
      )
    : reactions || [];
  
    const uniqueEmojisr = [...new Set(reactionArray.map(r => r.emoji))];
  
  
  const userReaction = reactionArray.find(r => r.user?.id === currentUser?.id)?.emoji || null;
  
  const totalReaction = reactionArray.length;
  
  
    const toggleReaction = async (emoji) => {
    setLoadingEmoji(emoji); // 👈 only this emoji loads
    try {
      const res = await api.post(`/api/posts/${reply.id}/reaction`, { emoji });
  
      const apiReactions = res.data.reactions || {};
      const normalized = Object.entries(apiReactions).flatMap(([e, users]) =>
        Array.isArray(users) ? users.map(u => ({ emoji: e, user: u })) : []
      );
  
      setReactions(normalized);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEmoji(null); // 👈 stop loading
    }
  };
  
  useEffect(() => {
    const loadReactions = async () => {
      const res = await api.get(`/api/posts/${reply.id}/reactions`);
      setReactions(res.data.reactions || []);
    };
    loadReactions();
  }, [reply.id]);
  
  
  
  const isOwner = authUser?.user?.id === reply.user?.id;

  const handleReplyToReply = (reply) => {
  const name = `${reply.user.first_name} ${reply.user.last_name}`;
  setReplyTo({ id: reply.user.id, name });

  // Pre-fill input with mention
  setReplyText(`@${name} `);

  focusReplyInput();
};


  function renderWithMention(text) {
  if (!text) return null;

  const parts = text.split(/(@\{[^}]+\}|@\w+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      // Remove @{ } or @
      const clean = part.startsWith("@{")
        ? part.slice(2, -1)   // @{olawale love} -> olawale love
        : part.slice(1);      // @olawale -> olawale

      return (
        <button
          key={index}
          onClick={() => navigate(`/profile/${clean}`)}
          className="text-blue-400 font-semibold hover:underline"
        >
          {part}
        </button>
      );
    }

    return <span key={index}>{part}</span>;
  });
}


function RenderCommentText({ text }) {
  if (!text) return null;

  return (
    <Linkify
      options={{
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-blue-600 underline break-all"
      }}
    >
      {renderWithMention(text)}
    </Linkify>
  );
}


const navigate = useNavigate()

    return(

        <div className="px-4 py-2">
    <div className="flex gap-2 items-start justify-end">
    <div className="bg-gray-50 sm:w-60 w-full relative group  px-4 py-2 rounded-lg ">
        <div className=" flex flex-row justify-between  items-start">
        <button onClick={() => navigate(`/profile/${user.id}`)}
         className="text-black font-bold">{reply?.user?.first_name} {reply?.user?.last_name}
        </button>
        
      <div className="absolute top-2 right-2">
            <div className="opacity-0 group-hover:opacity-100 transition">
              <div className="relative group/icon">
                
                {/* ICON */}
                <button className="text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                  </svg>
                </button>

                {/* MENU: only on ICON hover */}
                <div className="absolute right-0  bg-white border rounded shadow
                opacity-0 invisible
                group-hover/icon:visible group-hover/icon:opacity-100
                transition p-2 flex flex-col gap-2 z-50">

  {/* IMAGE CASE */}
  {reply.image ? (
    <>
      {isOwner ? (
        <div>

          
        <button onClick={() => setDeletingReplyId(reply.id)} className="whitespace-nowrap text-red-600 hover:text-red-500 inline-flex items-center gap-2 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-red-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Delete Comment
          </button>
          <PostReplyCopyText reply={reply} />
        </div>
          
      ) : (
        <>
          <button onClick={handleReplyToReply} className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                    </svg>
            Reply To
          </button>
          <button onClick={handleReport} className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>

        Report
        </button>
        </>
            )}
          </>
        ) : (
          /* TEXT CASE */
          <>
            {isOwner ? (
              <>
                <button
                  onClick={() => {
                    setEditingReplyId(reply.id);
                    setEditText(reply.body);
                  }}
                  className="whitespace-nowrap text-sm hover:text-gray-800 inline-flex items-center gap-2 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-blue-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Edit Comment
                    </button>

                <button
                  onClick={() => setDeletingReplyId(reply.id)}
                  className="whitespace-nowrap text-sm hover:text-gray-800 inline-flex items-center gap-2 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 hover:text-red-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Delete Comment
                  </button>

                <PostReplyCopyText reply={reply} />
              </>
            ) : (
              <>
                <PostReplyCopyText reply={reply} />
                <button onClick={handleReplyToReply} className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
                    </svg>
                  Reply To
                </button>
                <button onClick={handleReport}  className="whitespace-nowrap text-sm inline-flex hover:text-gray-800 items-center gap-2 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>

                Report</button>
              </>
            )}
          </>
        )}
      </div>

              </div>
            </div>
          </div>


  
        </div>
      
    <p className="text-black my-2 text-sm font-semibold">
          {reply.body && (
              <p className="text-sm text-black max-w-xs break-words">
                <RenderCommentText text={reply.body} />
              </p>
            )}
    </p>
        {/* ✅ Image preview */}
       {reply.image && <ReplyImage image={reply.image} />}

        {/* Time and Reaction */}

        <div className="inline-flex gap-3 items-center cursor-pointer">
          <span className="text-black text-xs">{timeAgo(reply.created_at)}</span>
          <div className="relative group/react inline-block">
          {uniqueEmojisr.length > 0
              && uniqueEmojisr.map(e => <span className="text-blue-600 text-sm" key={e}>{e}</span>)}
              <span className="text-sm text-blue-600">Like</span>
          {totalReaction > 0 && <span className="text-black ml-2 text-gray-700 text-sm font-semibold ">{totalReaction}</span>}

          {/* Hover reactions */}
          <div className="absolute bottom-2 left-0 mb-2 flex gap-2 p-2 bg-white border rounded shadow
              opacity-0 invisible
              group-hover/react:visible group-hover/react:opacity-100
              transform group-hover/react:-translate-y-2 transition-all duration-200 z-50">
              {['❤️','👍','😂','😮','😢','🔥'].map(e => (
              <button
            key={e}
            onClick={() => toggleReaction(e)}
            className="text-lg hover:scale-110 transition flex items-center justify-center"
            disabled={loadingEmoji !== null}
          >
            {loadingEmoji === e ? (
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              e
            )}
          </button>
            ))}
          </div>
          </div>
        </div>

    </div>
    <button onClick={() => navigate(`/profile/${user.id}`)} className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 ">
       {reply.user?.first_name?.charAt(0)?.toUpperCase() || "A"}</button>
    </div>


    {/* Reply Edit  */}

    {editingReplyId === reply.id && (

        <div className=" flex fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-200 p-6 bg-gray-50 rounded w-96 flex flex-col gap-4 relative">
              <h3 className="font-semibold text-lg text-center text-black">Edit Reply</h3>

              {/* Text Input reply.body */}
              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="border p-2 rounded-lg h-40 outline-none border
                 border-blue-700  w-full text-black p-4"
                placeholder="Edit your reply..."
              />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-2">
       <button
        onClick={async () => {
          try {
            await onEdit(reply.id, editText);
            setEditingReplyId(null);
          } catch (e) {
            // optional: toast error
          }
        }}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >

          {isEditing ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-white"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>

}
                  </button>
          
        <button
          onClick={() => {
            setEditingReplyId(false);}}
          className="px-3 py-1 bg-gray-400 text-white rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
        </button>
      </div>
    </div>
  </div>
     

      )}

     {/* Reply Delete */}

     {deletingReplyId === reply.id && (
      <>
            <div   className={`fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center z-50 `}>
              <div className="bg-gray-200 text-red-700 p-6 font-semibold text-center rounded w-80 flex flex-col gap-3">
                <span>Are you sure you want to delete this reply?</span>
                <div className="flex gap-3 justify-center">
                  <button
            onClick={async () => {
              try {
                await onDelete(reply.id);
                setDeletingReplyId(null);  // CLOSE MODAL
              } catch (e) {}
            }}
            className="px-3 py-1 bg-red-600 text-white rounded"
            >
                    {isDeleting ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25 text-white"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>
}
                  </button>
                  <button onClick={() => setDeletingReplyId(false)} className="px-3 py-1 bg-gray-400 text-white rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
</button>
                </div>
              </div>
            </div>
            </>
          )}

          <div className={`w-full h-full  fixed inset-0 bg-black bg-opacity-70 z-50 ${openReport ? 'block' : 'hidden'}`}>
              <ReplyReportModal reply={reply} onClose={handleReport} />
          </div>
    </div>
    )
}