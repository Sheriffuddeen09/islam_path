import { useEffect, useState } from "react";
import api from "../Api/axios";
import { Mail, Phone, MapPin, Calendar, Eye, EyeOff, User, UserX2, Download, Settings, BookOpen, TrafficCone, LogOut } from "lucide-react";


export default function Setting({handleEdit}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [openVisibility, setOpenVisibility] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [notification, setNotification] = useState({
  show: false,
  type: "", // "success" | "error"
  message: "",
});
  const [teacher, setTeacher] = useState(null)


  const [error, setError] = useState("");

  const [openDelete, setOpenDelete] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)


  const handleDeleteAccount = async () => {

    setLoadingDelete(true)

    try{
      await api.delete('/api/delete-account')

      localStorage.removeItem("token")

      window.location.href = "/login"
    }
    catch(err){
      console.error(err)
    }
    finally{
      setLoadingDelete(false)
    }
  }


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/teacher-single");

        if (!res.data.status) {
          setError(res.data.message);
        } else {
          setTeacher(res.data.teacher);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Teacher profile not completed");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

const handleOpenVisibility = () =>{

  setOpenVisibility(!openVisibility)
}

const handleOpenProfile = () =>{

  setOpenProfile(!openProfile)
}




const showNotification = (type, message) => {
  setNotification({ show: true, type, message });

  setTimeout(() => {
    setNotification({ show: false, type: "", message: "" });
  }, 3000);
};


const fetchProfile = async () => {
  try {
    const res = await api.get("/api/profile");
    setProfile(res.data);
    setVisibility(res.data.visibility || {
        dob: false,
        location: false,
        email: false,
        gender: false,
        phone: false
      });

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {

    fetchProfile();
  }, []);

  const handleToggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const saveVisibility = async () => {
  setLoading(true);
  try {
    await api.put("/api/profile/visibility", { visibility });

    setEditVisibility(false);
    showNotification("success", "Profile visibility updated 👁️");
  } catch (err) {
    showNotification(
      "error",
      err.response?.data?.message || "Failed to update visibility ❌"
    );
  } finally {
    setLoading(false);
  }
};


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
  setLoading(true);
  try {
    await api.put("/api/profile", editForm);

    await fetchProfile(); // ✅ THIS FIXES IT
    setShowEditModal(false);

    showNotification("success", "Profile updated successfully ✅");
  } catch (err) {
    showNotification(
      "error",
      err.response?.data?.message || "Failed to update profile ❌"
    );
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
  if (profile) {
    setEditForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      dob: profile.dob || "",
      gender: profile.gender || "",
    });
  }
}, [profile]);

const [visibleProfile, setVisibleProfile] = useState(1)
  
    const handleVisibleProfile = (id) => {
      setVisibleProfile(id)
    }



  if (loading) return <Loader />;

  
  const profileCotent = (
    <div className="lg:ml-64">
      
      <div className="grid grid-cols-2  md:grid-cols-2 sm:gap-4 gap-2 mt-8">
      <button onClick={handleOpenVisibility} className="bg-white hover:bg-gray-50 rounded-xl cursor-pointer shadow p-5 flex items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
       <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <Settings />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">visibility Setting</p>
        </div>
      </div>
      </button>

      {/* 2 */}

       <button
          onClick={() => setShowEditModal(true)} className="bg-white hover:bg-gray-50 rounded-xl cursor-pointer shadow p-5 flex items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
       <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <UserX2 />
        </div>
        <div>
        <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">Profile Setting</p>
        </div>
      </div>
      </button>

      {/* 3 */}
      <button
          onClick={() => setOpenDelete(true)} className="bg-white hover:bg-gray-50 rounded-xl cursor-pointer shadow p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <LogOut />
         </div>
        <div>
         <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">Close Account</p>
        </div>
      </div>
      </button>  
            {/* 5 */}


        <button
          onClick={() => setShowEditModal(true)} className="bg-white hover:bg-gray-50 rounded-xl cursor-pointer shadow p-5 flex items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <TrafficCone />
         </div>
        <div>
         <p className="text-lg font-semibold text-gray-900 whitespace-nowrap">Privacy</p>
        </div>
      </div>
      </button>  

           
     
      </div>
    {
      openVisibility && (
         <div className=" gap-4 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          
        <div className="max-w-5xl bg-white  z-50 mt-0 mx-auto px-4 py-4">
     

     
         <div className="flex justify-between items-center gap-4  bg-opacity-50 flex items-center justify-center z-50">
        <button
          onClick={() => setEditVisibility(!editVisibility)} title="profile visibility"
          className="px-2 py-1 bg-gray-100 text-black rounded hover:bg-gray-500"
        >
          {editVisibility ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            :
            <button className="inline-flex p-1 gap-2 text-sm font-bold items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Visibility
            </button>
            }
        </button>
         <button
          onClick={handleOpenVisibility}
          title="Edit"
           className="px-2 py-1 bg-gray-100 text-black rounded hover:bg-gray-500"
        >
         
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button> 
      </div>
      

      {/* Profile Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ProfileCard
          icon={<Calendar />}
          label="Date of Birth"
          value={visibility.dob ? profile.dob : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("dob")}
          isVisible={visibility.dob}
        />
        
        <ProfileCard
          icon={<MapPin />}
          label="Location"
          value={visibility.location ? profile.location : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("location")}
          isVisible={visibility.location}
        />
        <ProfileCard
          icon={<Mail />}
          label="Email"
          value={visibility.email ? profile.email : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("email")}
          isVisible={visibility.email}
        />
        <ProfileCard
          icon={<Phone />}
          label="Phone"
          value={visibility.phone ? profile.phone : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("phone")}
          isVisible={visibility.phone}
        />
        
        <ProfileCard
          icon={<User />}
          label="Gender"
          value={visibility.gender ? profile.gender : "Hidden"}
          editable={editVisibility}
          onToggle={() => handleToggleVisibility("gender")}
          isVisible={visibility.gender}
        />
       
      </div> 

      {editVisibility && (
        <div className="mt-6 flex justify-end">
          <button onClick={saveVisibility} className="px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
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
    </svg>
  ) : 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
    }

          </button>
        </div>
      )}

  

        </div>
        </div>
      )
    }


    </div>
  )


  const content = (
  

      
    <div>
       {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="flex flex-col gap-4">
             <input
                type="text"
                name="first_name"
                value={editForm.first_name}
                onChange={handleFormChange}
                className="border p-2 rounded w-full"
                placeholder="First Name"
                />

              <input
                type="text"
                name="last_name"
                value={editForm.last_name}
                onChange={handleFormChange}
                placeholder="Last Name"
                className="border p-2 rounded w-full"
              />
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleFormChange}
                placeholder="Email"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={handleFormChange}
                placeholder="Phone"
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                name="location"
                value={editForm.location}
                onChange={handleFormChange}
                placeholder="Location"
                className="border p-2 rounded w-full"
              />
              <input
                type="date"
                name="dob"
                value={editForm.dob}
                onChange={handleFormChange}
                placeholder="Date of Birth"
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-2 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>

              </button>
              <button
                onClick={saveProfile}
                className="px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
              {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
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
    </svg>
  ) : 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
    }


              </button>
            </div>
          </div>
        </div>
      )}
    
   </div>
  );

   
  return(
    <div>
      <h1 className="text-2xl text-black lg:ml-64 font-bold border-b-2 px-2 py-3 border-blue-400">Settings</h1>
        {profileCotent}
        {content}
        {
          openDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center
            z-50">
              <div className="bg-white mx-auto p-6 rounded-lg w-80 sm:w-96">
              <h2 className="font-bold text-xl text-center mb-3">
                ⚠️ Delete Account
              </h2>
              <p className="text-sm font-semibold text-center text-gray-800 mb-8">
                This Action cannot be undone, you will lost your account profile and could 
                not be able to restore. are you sure, you want to 
                close your Account.
              </p>
              <div className="flex justify-around items-center">
              <button onClick={() => setOpenDelete(false)}
                className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                Cancel
              </button>

              <button onClick={handleDeleteAccount}
              disabled={loadingDelete}
              className="bg-red-800 text-white px-4 py-2 rounded"
              >
                {
              loadingDelete ? <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
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
    </svg> : "Delete Account"
              }
              </button>
              </div>
              </div>
            </div>
          )
        }
        {notification.show && (
  <div
    className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white transition-all
      ${
        notification.type === "success"
          ? "bg-green-600"
          : "bg-red-600"
      }
    `}
  >
    {notification.message}
  </div>
)}

    </div>
  )


}

function ProfileCard({ icon, label, value, editable, onToggle, isVisible }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-semibold text-gray-800">{value}</p>
        </div>
      </div>
      {editable && (
        <button onClick={onToggle}>
          {isVisible ? <Eye className="text-green-500" /> : <EyeOff className="text-red-500" />}
        </button>
      )}
    </div>
  );
}


function Loader() {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
    
}
