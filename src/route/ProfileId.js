import api from "../Api/axios";
import { Mail, Phone, Eye, EyeOff } from "lucide-react";

import { useEffect, useState } from "react";
import AdminAdded from "../pages/friend/AdminAdded";
import AdminProfileFriend from "../teacherdashboard/AdminProfileFriend";
import GetMentorProfileId from "../teacherdashboard/GetMentorProfileId";
import { useAuth } from "../layout/AuthProvider";
import PerformanceId from "../studentdashboard/PerformanceId";
import StudentProfileFriend from "../studentdashboard/StudentProfileFriend";
import StudentAdded from "../pages/friend/StudentAdded";
import MyImagesIdAdmin from "../teacherdashboard/mediaProfileId/ImageProfileId";
import MyVideosIdAdmin from "../teacherdashboard/mediaProfileId/VideoProfileId";
import MyPostsIdAdmin from "../teacherdashboard/mediaProfileId/PostProfileId";
import MyPostsIdStudent from "../studentdashboard/mediaProfileId/PostProfileId";
import MyVideosIdStudent from "../studentdashboard/mediaProfileId/VideoProfileId";
import MyImagesIdStudent from "../studentdashboard/mediaProfileId/ImageProfileId";
import BioDataProfile from "./BiodataProfile";




export default function ProfileId({handleMessageOpen, profileId, chats,
        image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList, togglePopup, setActiveChat,
        setMessages
}) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [visibility, setVisibility] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  
   
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
    setLoadingProfile(false);
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



  if (loadingProfile) return <Loader  />

  if (!profile) return <p>Profile not found</p>;



 
  const profile_content = (
    <div className="max-w-5xl px-2 mx-auto">
      {
            profile.role === "admin" && (
              <>
    <div className="text-white flex sm:w-full w-80  overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  mt-7 border-blue-200 border-b-2 mb-5  px-2 py-2 flex flex-row gap-2 no-scrollbar">
     
          
                    <button onClick={() => {handleVisibleProfile(1);}} className={`py-2 px-6 rounded-lg text-sm whitespace-nowrap font-semibold cursor-pointer ${visibleProfile
                       === 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>All Post</button>
                    <button onClick={() => {handleVisibleProfile(2);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 2 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Video</button>
                    <button onClick={() => {handleVisibleProfile(3);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 3 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Photo</button>
                    {
                      authUser?.admin_choice === "arabic_teacher" &&
                    <button onClick={() => {handleVisibleProfile(4);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 4 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Teacher Profile</button>
                  }
                  </div>
                  
                  <div className={`${visibleProfile === 1 ? 'block' : 'hidden'}`}>
                      <MyPostsIdAdmin chats={chats} 
                      image={image} setImage={setImage}
                      postComments={postComments} setPostComments={setPostComments} loading={loading} 
                      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
                      newComment={newComment} setNewComment={setNewComment}
                      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
                      emojiList={emojiList} setEmojiList={setEmojiList}
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                    </div>
                    <div className={`${visibleProfile === 2 ? 'block' : 'hidden'}`}>
                      <MyVideosIdAdmin chats={chats} 
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                      </div>
                      <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                      <MyImagesIdAdmin chats={chats} 
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                      </div>
                    <div className={`${visibleProfile === 4 ? 'block' : 'hidden'}`}>
                      <GetMentorProfileId />
                  </div>
                </>
                    )
                    }
                 {
                  
                    profile.role === "student" && (
                      <>
                       <div className="text-white flex sm:w-full w-80 px-2 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100  mt-7 border-blue-200 border-b-2 mb-5  px-2 py-2 flex flex-row gap-2 no-scrollbar">  
                                 <button onClick={() => {handleVisibleProfile(1);}} className={`py-2 px-6 rounded-lg text-sm whitespace-nowrap font-semibold cursor-pointer ${visibleProfile
                       === 1 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>All Post</button>
                    <button onClick={() => {handleVisibleProfile(2);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 2 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Video</button>
                    <button onClick={() => {handleVisibleProfile(3);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 3 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Photo</button>
                    <button onClick={() => {handleVisibleProfile(4);}} className={`py-2 px-6 rounded-lg  text-sm font-semibold whitespace-nowrap cursor-pointer ${visibleProfile
                       === 4 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-gray-100" : "bg-gray-800 text-white hover:bg-gray-700 hover:text-gray-100 "
                    }`}>Student Performance</button>
                  </div>
                  
                  <div className={`${visibleProfile === 1 ? 'block' : 'hidden'}`}>
                      <MyPostsIdStudent chats={chats} 
                      image={image} setImage={setImage}
                      postComments={postComments} setPostComments={setPostComments} loading={loading} 
                      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
                      newComment={newComment} setNewComment={setNewComment}
                      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
                      emojiList={emojiList} setEmojiList={setEmojiList}
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                    </div>
                    <div className={`${visibleProfile === 2 ? 'block' : 'hidden'}`}>
                      <MyVideosIdStudent chats={chats} 
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                      </div>
                      <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                      <MyImagesIdStudent chats={chats} 
                      editContent={editContent} setEditContent={setEditContent}
                      showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                      showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                      selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                      />
                      </div>
                               <div className={`${visibleProfile === 4 ? 'block' : 'hidden'}`}>
                                <PerformanceId  />
                              </div>
                      </>
                    )
                  
                 }
                 </div>
  )
  const colors = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
];

const getColor = (name = "") => {
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitial = (name) => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

const content = (
  <div className="max-w-6xl mx-auto px-4 mt py-4">

    {/* PROFILE CARD */}
    <div className="relative overflow-hidden mt-16 rounded-3xl border border-white/10
     bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#1e293b] shadow-sm">

      {/* TOP BANNER */}
      <div className="h-36 sm:h-44 bg-gradient-to-r from-cyan-500 via-gray-600 to-purple-600" />

      {/* MAIN CONTENT */}
      <div className="relative px-5 sm:px-8 pb-8">

        <div className="-mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end gap-6">

          {/* AVATAR */}
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#111827] shadow-2xl flex items-center justify-center text-white text-5xl sm:text-7xl font-bold ${getColor(
              profile.first_name
            )}`}
          >
            {getInitial(profile.first_name)}
          </div>

          {/* USER DETAILS */}
          <div className="flex-1 text-center md:text-left md:pb-3">

            <h2 className="text-2xl sm:text-4xl font-bold text-white break-words">
              {profile.first_name}{" "}
              <span className="">
                {profile.last_name}
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-300 mt-2 capitalize font-medium">
              {profile.role}
            </p>

            <div className="inline-flex font-bold items-center mt-3 px-4 py-1 rounded-full bg-white/50 border border-white/10 text-xs sm:text-sm text-white">
              PROFILE ID: #{profile.id}
            </div>

            {/* CONTACT INFO */}
            <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3">

              {visibility.email && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-sm text-gray-200 backdrop-blur-xl">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="break-all">
                    {profile.email}
                  </span>
                </div>
              )}

              {visibility.phone && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-sm text-gray-200 backdrop-blur-xl">
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>
                    {profile.phone}
                  </span>
                </div>
              )}

            </div>
          </div>

               <div className="" />

                
        {showStudentFriend() && (
          <StudentAdded  togglePopup={togglePopup} setMessages={setMessages} setActiveChat={setActiveChat} />
        )}

        {showAdminFriend() && (
          <AdminAdded  togglePopup={togglePopup} setMessages={setMessages} setActiveChat={setActiveChat} />
        )}

      </div>

        </div>
      </div>

      {/* OVERLAY */}
     
      {/* Profile Details */}
     <BioDataProfile userId={authUser.id} handleToggleVisibility={handleToggleVisibility}
     profile={profile} visibility={visibility}
     />
    </div>
  );

   
  return(
    <div>
        
        {content}
         {
            authUser.role === "student" &&
          (
            <StudentProfileFriend togglePopup={togglePopup} setActiveChat={setActiveChat} setMessages={setMessages} />
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
    <div className="min-h-screen p-2 lg:ml-64 animate-pulse bg-gray-700 rounded-2xl">

      <div className="max-w-5xl mx-auto space-y-3">

        {/* HEADER */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 rounded bg-white/50" />
            <div className="h-10 w-10 rounded-full bg-white/50" />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white/60 border border-white/10 rounded-3xl overflow-hidden">

          {/* COVER */}
          <div className="h-32 bg-white/50" />

          <div className="p-6 relative">

            {/* AVATAR */}
            <div className="absolute -top-12 left-6">
              <div className="w-24 h-24 rounded-full bg-white/50 border-4 border-[#0b1120]" />
            </div>

            {/* CONTENT */}
            <div className="pt-8 space-y-4">

              <div className="h-6 w-52 rounded bg-white/50" />

              <div className="h-4 w-full rounded bg-white/50" />

              <div className="h-4 w-3/4 rounded bg-white/50" />

              <div className="flex gap-3 mt-4">
                <div className="h-8 w-24 rounded-full bg-white/50" />
                <div className="h-8 w-24 rounded-full bg-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white/50 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/50" />
            <div className="h-5 w-40 rounded bg-white/50" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/50" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/50" />
                  <div className="h-4 w-full rounded bg-white/50" />
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
}
