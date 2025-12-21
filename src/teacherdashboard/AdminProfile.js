import { useEffect, useState } from "react";
import api from "../Api/axios";
import { Mail, Phone, MapPin, Calendar, Eye, EyeOff, User2, User } from "lucide-react";
import VideoList from "./VideoList";
import StudentPerformance from "./StudentPerformance";
import TeacherFormEdit from "./TeacherFormEdit";
import GetMentorProfile from "./GetMentorProfile";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeacherEditModal, setShowTeacherEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [notification, setNotification] = useState({
  show: false,
  type: "", // "success" | "error"
  message: "",
});

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

  const profile_content = (
    <div className="sm:max-w-5xl w-full lg:ml-64 mt-4 border-blue-200 mx-auto border-t-2  sm:px-4">
    <div className="text-white p-4 mb-0 flex md:gap-3 gap-2 md:w-full w-80 px-2 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  ">
      
          <button onClick={() => {handleVisibleProfile(1);}} className={`py-3 md:px-6 px-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer ${visibleProfile
             === 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-white text-black hover:bg-gray-300 hover:text-gray-800"
          }`}>Teacher Profile</button>
          <button onClick={() => {handleVisibleProfile(2);}} className={`py-3 md:px-6 px-2 whitespace-nowrap rounded-lg text-sm font-semibold cursor-pointer ${visibleProfile
             === 2 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-white text-black hover:bg-gray-300 hover:text-gray-800"
          }`}>Video</button>
          <button onClick={() => {handleVisibleProfile(3);}} className={`py-3 md:px-6 px-2 whitespace-nowrap rounded-lg  text-sm font-semibold cursor-pointer ${visibleProfile
             === 3 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-white text-black hover:bg-gray-300 hover:text-gray-800 "
          }`}>Student Performance</button>
        </div>
        
        <div className={`${visibleProfile === 1 ? 'block' : 'hidden'}`}>
          <GetMentorProfile />
          </div>
          <div className={`${visibleProfile === 2 ? 'block' : 'hidden'}`}>
          <VideoList />
          </div>
          <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
          <StudentPerformance  />
        </div>
        </div>
  )
  const content = (
    <div className="max-w-5xl lg:ml-64 mt-0 mx-auto sm:px-4 py-0">
     

      {/* Profile Header */}
      <div className="bg-gray-900 rounded-2xl py-4 shadow sm:p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        
        <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-black">
          {profile?.first_name?.[0]}
          {profile?.last_name?.[0]}
        </div>

            
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl md:text-3xl text-white font-bold">{profile.first_name} • {profile.last_name}</h2>
          <p className="text-sm text-gray-500">{profile.role}</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
            {visibility.email && (
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
            )}
            {visibility.phone && (
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>
            )}
          </div>
        </div>
         <div className="flex justify-between items-center gap-4">
        <button
          onClick={() => setEditVisibility(!editVisibility)} title=""
          className="px-2 py-1 bg-gray-900 text-white flex flex-col items-center rounded hover:bg-gray-700"
        >
          {editVisibility ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            : 
            <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <span className="text-[8px]">Visibility</span>
            </>
            }
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="px-2 py-1 bg-gray-900 text-white flex flex-col items-center rounded hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
            <span className="text-[8px]">Profile</span>

        </button>

                <button
          onClick={() => setShowTeacherEditModal(true)}
           className="px-2 py-1 bg-gray-900 text-white flex flex-col items-center rounded hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-10.94 10.94a3.75 3.75 0 1 0 5.304 5.303l7.693-7.693a.75.75 0 0 1 1.06 1.06l-7.693 7.693a5.25 5.25 0 1 1-7.424-7.424l10.939-10.94a3.75 3.75 0 1 1 5.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 0 1 5.91 15.66l7.81-7.81a.75.75 0 0 1 1.061 1.06l-7.81 7.81a.75.75 0 0 0 1.054 1.068L18.97 6.84a2.25 2.25 0 0 0 0-3.182Z" clip-rule="evenodd" />
</svg>

            <span className="text-[8px]">Teacher</span>
        </button>

      </div>
      
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
                className="px-2 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
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

      {showTeacherEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <TeacherFormEdit setShowTeacherEditModal={setShowTeacherEditModal} />
        </div>
      )}
    </div>
  );

   
  return(
    <div>
        {content}
        {profile_content}

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
