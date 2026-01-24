import api from "../Api/axios";
import { Mail, Phone, MapPin, Calendar, Eye, EyeOff, User } from "lucide-react";

import { useEffect, useState } from "react";
import AdminAdded from "../pages/friend/AdminAdded";
import VideoList from "../teacherdashboard/VideoList";
import AdminProfileFriend from "../teacherdashboard/AdminProfileFriend";
import GetMentorProfileId from "../teacherdashboard/GetMentorProfileId";
import { useAuth } from "../layout/AuthProvider";
import PerformanceId from "../studentdashboard/PerformanceId";
import StudentRequest from "../studentdashboard/StudentRequest";
import Performance from "../studentdashboard/Performance";
import StudentProfileFriend from "../studentdashboard/StudentProfileFriend";
import StudentAdded from "../pages/friend/StudentAdded";



export default function ProfileId({handleMessageOpen, profileId, requests}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState({});

  const { user: authUser } = useAuth();
  const fetchProfile = async () => {
  if (!profileId) return;

  try {
    const res = await api.get(`/api/profile/${profileId}`);
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

}, [profileId]);



  const handleToggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

const [visibleProfile, setVisibleProfile] = useState(1)
  
    const handleVisibleProfile = (id) => {
      setVisibleProfile(id)
    }


    const showStudentFriend = () => {
  if (!authUser || !profile) return false;

  return (
    authUser.role === "student" &&
    profile.role === "student" &&
    authUser.id !== profile.id
  );
};

const showAdminFriend = () => {
  if (!authUser || !profile) return false;

  return (
    authUser.role === "admin" &&
    profile.role === "admin" &&
    authUser.id !== profile.id
  );
};


const isAdminTeacher = profile?.admin_choice === "arabic_teacher";


const requestsArray = Array.isArray(requests) ? requests : [];


const requestWithTeacher = requestsArray.find(
  r =>
    r.teacher_id === profile?.id ||
    r.student_id === profile?.id
);

const requestStatus = requestWithTeacher?.status ?? null;


const canSeeContactInfo = () => {
  if (!authUser || !profile) return false;

  // Admin sees everything
  if (authUser.role === "admin") return true;

  // If profile is NOT admin teacher → show
  if (!isAdminTeacher) return true;

  // Student viewing admin teacher
  if (authUser.role === "student" && isAdminTeacher) {
    return requests === "accepted";
  }

  return false;
};



  if (loading) return <Loader />;

  if (!profile) return <p>Profile not found</p>;



 
  const profile_content = (
    <div className="max-w-5xl px-2 mx-auto">
      {
            profile.role === "admin" && (
              <>
    <div className="text-white flex sm:w-full w-full  overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  mt-7 border-blue-200 border-b-2 mb-5  px-2 py-2 flex flex-row gap-2 no-scrollbar">
     
          <button onClick={() => {handleVisibleProfile(1);}} className={`py-2 px-6 rounded-lg text-sm whitespace-nowrap font-semibold cursor-pointer ${visibleProfile
                      === 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                   }`}>All Post</button>
                   <button onClick={() => {handleVisibleProfile(2);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                      === 2 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                   }`}>Video</button>
                   <button onClick={() => {handleVisibleProfile(3);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                      === 3 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                   }`}>Teacher Profile</button>
                 </div>
                 
                 <div className={`${visibleProfile === 1 ? 'block' : 'hidden'}`}>
                 All Post Loading
                   </div>
                   <div className={`${visibleProfile === 2 ? 'block' : 'hidden'}`}>
                     <VideoList />
                     </div>
                   <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                     <GetMentorProfileId />
                 </div>
                </>
                    )
                    }
                 {
                  
                    profile.role === "student" && (
                      <>
                       <div className="text-white flex sm:w-full w-full px-2 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  mt-7 border-blue-200 border-b-2 mb-5  px-2 py-2 flex flex-row gap-2 no-scrollbar">  
                                <button onClick={() => {handleVisibleProfile(1);}} className={`whitespace-nowrap py-2 px-6 rounded-lg text-sm font-semibold cursor-pointer ${visibleProfile
                                   === 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                                }`}>All Post</button>
                                 <button onClick={() => {handleVisibleProfile(2);}} className={`whitespace-nowrap py-2 px-6 rounded-lg text-sm font-semibold cursor-pointer ${visibleProfile
                                   === 2 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                                }`}>Video</button>
                                <button onClick={() => {handleVisibleProfile(3);}} className={`whitespace-nowrap py-2 px-6 rounded-lg  text-sm font-semibold cursor-pointer ${visibleProfile
                                   === 3 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                                }`}>Student Performance</button>
                              </div>
                              
                              <div className={`${visibleProfile === 1 ? 'block' : 'hidden'}`}>
                                <Performance />
                                </div>
                                <div className={`${visibleProfile === 2 ? 'block' : 'hidden'}`}>
                                <StudentRequest  />
                              </div>
                               <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                                <PerformanceId  />
                              </div>
                      </>
                    )
                  
                 }
                 </div>
  )
  const content = (
    <div className="max-w-5xl 0 mx-auto px-4 py-0">
     

      {/* Profile Header */}
      <div className="bg-gray-900 sm:p-14 translate-y-24 mb-28 rounded-2xl shadow p-6  flex flex-col md:flex-row gap-6 items-center">
        
         <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-[80px] font-bold">
          {profile.first_name?.[0]}
        </div>

            
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{profile.first_name} • {profile.last_name}</h2>
          <p className="text-sm my-1 text-white font-semibold capitalize">{profile.role} • {profile.role === 'admin' &&( 'Teacher')}</p>
          <p className="text-sm my-1 text-white font-semibold">PROFILE ID: {profileId}</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
            {canSeeContactInfo() && (
              <span className="flex text-white items-center gap-1">
                <Mail className="w-4 h-4" /> {profile.email}
              </span>
            )}

            {canSeeContactInfo() &&  (
              <span className="flex text-white items-center gap-1">
                <Phone className="w-4 h-4" /> {profile.phone}
              </span>
            )}
          </div>

        </div>
        
{showStudentFriend() && (
  <StudentAdded handleMessageOpen={handleMessageOpen} />
)}

{showAdminFriend() && (
  <AdminAdded handleMessageOpen={handleMessageOpen} />
)}

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
          onToggle={() => handleToggleVisibility("email")}
          isVisible={visibility.location}
        />

        <ProfileCard
          icon={<Phone />}
          label="Phone"
          value={visibility.phone ? profile.phone : "Hidden"}
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
    </div>
  );

   
  return(
    <div>
        
        {content}
         {
            authUser.role === "student" &&
          (
            <StudentProfileFriend handleMessageOpen={handleMessageOpen} />
          )
        }
        {
          
            authUser.role === "admin" &&
            (
            <AdminProfileFriend handleMessageOpen={handleMessageOpen} />
          )
        }
        
        {profile_content}

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
