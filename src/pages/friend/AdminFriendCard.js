import { Link } from "react-router-dom";
import api from "../../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../layout/AuthProvider";



export default function AdminFriendCard({loadingId, requestStatus, setLoadingId, admin, setAdmins, setRequestStatus}) {
 
 const { user } = useAuth();
  const authReady = user !== null;

  const sendLiveRequest = async (adminId) => {
  return api.post("/api/admin-friend/request", {
    admin_id: adminId,
  });
};

  
  
    const handleRequest = async (adminId) => {
  if (loadingId !== null) return;
  if (!authReady) return;

  setLoadingId(adminId);

  try {
    await sendLiveRequest(adminId);

    setRequestStatus(prev => ({
      ...prev,
      [adminId]: "pending",
    }));

    toast.success("Request sent");

    // 🔥 Remove from list immediately
    setAdmins(prev => prev.filter(s => s.id !== adminId));

  } catch (err) {
    toast.error(err.response?.data?.message);
  } finally {
    setLoadingId(null);
  }
};


  const removeTemporarily = async (id) => {
  try {
    await api.delete(`/api/requests/remove-temporary/${id}`);

    // remove instantly from UI
    setAdmins(prev =>
      prev.filter(admin => admin.id !== id)
    );

    toast.success("Removed Successfully")

  } catch (err) {
    console.error(err);
  }
};



  return (
    <>
    <div className="p-x4"> 
   
   <Toaster position="top-right" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative ">
        <div
    key={admin.id}
    className="bg-white rounded-lg w-64 sm:w-60 h-72 overflow-hidden shadow-xl border border-gray-300 group px-4 py-2 transform transition duration-300 flex flex-col mx-auto justify-center relative"
  > 
      <Link to={`/profile/${admin.id}`}>

        <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 text-center flex items-center mx-auto justify-center text-[102px] font-bold text-gray-600">
         <p> 
          {admin.first_name?.[0]} 
         </p>
        </div>

          <h3 className="font-semibold text-xs mb-1 text-black text-center">
            {admin.role}
          </h3>
        {(admin.first_name || admin.last_name) && (
          <h3 className="font-semibold text-lg mb-1 text-black text-center">
            {admin.first_name} {admin.last_name} 
          </h3>
        )}
       </Link>



          <button
  onClick={() => handleRequest(admin.id)}
  disabled={loadingId === admin.id}
  className="text-white"
>
  {loadingId === admin.id ? (
    <p className="bg-gray-500 rounded-lg px-4 text-xs py-3 flex justify-center mx-auto items-center ">
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
  ) : (
    <>
          {requestStatus[admin.id] === "declined" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Add Friend
            </p>
          )}
           {requestStatus[admin.id] === "pending" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Pending
            </p>
          )}

          {requestStatus[admin.id] === "accepted" && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Accepted
            </p>
          )}

          {!requestStatus[admin.id] && (
            <p className="bg-blue-700 rounded-lg px-4 hover:scale-105  mt-3 text-sm py-3 hover:bg-blue-800">
              Add Friend
            </p>
          )}
        </>
      )}
    </button>

        </div>
        <button
            onClick={(e) => {
              e.stopPropagation();
              removeTemporarily(admin.id);
            }}

      >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8 absolute right-10 sm:right-16 top-8 p-1  bg-gray-400 rounded-full">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
              </button>
       
    </div>
    </div>
    </>

  );
}
