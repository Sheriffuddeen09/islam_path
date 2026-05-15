import api from "../Api/axios";
import { Mail, Phone } from "lucide-react";
import Performance from "./Performance";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentProfileFriendDashboard from "./StudentProfileFriendDashboard";
import LogoutButton from "../Form/LogOut";
import MyPosts from "./mediaprofile/PostProfile";
import MyVideos from "./mediaprofile/VideoProfile";
import MyImages from "./mediaprofile/ImageProfile";
import BiodataDashboard from "./BioDataDashboard";


export default function StudentProfilePage({handleMessageOpen,  image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList, chats}) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editVisibility, setEditVisibility] = useState(false);
  const [visibility, setVisibility] = useState({});
  const [isloading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [badges, setBadges] = useState({
  total: 0,
  assignment: 0,
  exam: 0,
});


useEffect(() => {
  api.get("/api/student/badges")
    .then(res => {
      setBadges(res.data);
    })
    .catch(() => {
      setBadges({ total: 0, assignment: 0, exam: 0 });
    });
}, []);

  useEffect(() => {
        const loadData = async () => {
          setIsLoading(true);
      
          try {
            await api.get("/sanctum/csrf-cookie");
      
            const userRes = await api.get("/api/user-status", { withCredentials: true });
      
            const currentUser =
              userRes.data.status === "logged_in" ? userRes.data.user : null;
      
            setUser(currentUser);
      
            const protectedRoutes = [
              "/student/dashboard"
            ];
      
            if (!currentUser && protectedRoutes.includes(location.pathname)) {
              navigate("/login");
            }
          } catch (err) {
            console.error(err);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        };
      
        loadData();
      }, [location.pathname]);
      
  

  const fetchProfile = async () => {
    setLoadingProfile(true);

  try {
    const res = await api.get(`/api/profile`);
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
},[]);



  const handleToggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

const [visibleProfile, setVisibleProfile] = useState(1)
  
    const handleVisibleProfile = (id) => {
      setVisibleProfile(id)
    }

  
const badge = (
          <div>
          <div className=" mt-0 gap-4">
        <div className=" py-4 rounded">
          <p className="text-lg text-white font-bold">🏅 <span className=" font-bold">{badges.total}</span> Badges </p>
          
        </div>
      </div>

    </div>
  )
  

  if (loadingProfile) return <Loader />;

  if (!profile) return <p>Profile not found</p>;

// svg
  const headerDashboard = (
    <div className="flex justify-end mb-4">
          <div className="flex items-center gap-1 sm:gap-4">
            <div className="inline-flex items-center gap-2">
              <p className="admin font-bold text-[14px] sm:text-[15px] whitespace-nowrap">Assalamu Alaykum</p>
              <span className="font-semibold capitalize text-xs sm:text-[15px] whitespace-nowrap">
                <b>{profile?.role || ""}</b>
              </span>
              <span className="font-semibold text-xs sm:text-[15px] whitespace-nowrap">
                <b>{profile?.first_name || "No user"}</b>
              </span>
            </div>

            <LogoutButton />
          </div>
        </div>
  )
  const profile_content = (
    <div className="max-w-5xl lg:ml-64 mx-auto">
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
                    <MyPosts chats={chats} 
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
                    <MyVideos chats={chats} 
                    editContent={editContent} setEditContent={setEditContent}
                    showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                    showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                    selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                    />
                    </div>
                    <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                    <MyImages chats={chats} 
                    editContent={editContent} setEditContent={setEditContent}
                    showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                    showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                    selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                    />
                    </div>
        <div className={`${visibleProfile === 4 ? 'block' : 'hidden'}`}>
            <Performance badges={badges} />
        </div>
        </div>
  )
  const content = (
    <div className="max-w-5xl lg:ml-64 0 mx-auto px-4 py-0">
     

      {/* Profile Header */}
      <div className="bg-gray-900 sm:p-14 rounded-2xl shadow p-6  flex flex-col md:flex-row gap-6 items-center">
        
        <div className="w-28 h-28 rounded-full bg-gray-600 text-white flex items-center justify-center text-[80px] font-bold">
          {profile.first_name?.[0]}
        </div>

            
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{profile.first_name} • {profile.last_name}</h2>
          <p className="text-sm my-1 text-white font-semibold capitalize">{profile.role}</p>
          <p className="text-sm my-1 text-white font-semibold">PROFILE {profile.id}</p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
            {visibility.email && (
              <span className="flex text-white items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
            )}
            {visibility.phone && (
              <span className="flex text-white items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>
            )}
          </div>
        </div>
        {badge}
      </div>

    </div>
  );

   
  return(
    <div>
        
        <Toaster position="top-right" />
        {headerDashboard}
        {content}
        <BiodataDashboard />
        <StudentProfileFriendDashboard  handleMessageOpen={handleMessageOpen} />
        {profile_content}

    </div>
  )
}


function Loader() {
  return (
    <div className="min-h-screen p-4 bg-gradient-to-br lg:ml-64 from-[#050816] via-[#0b1120] to-[#111827] animate-pulse">

      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-10 w-10 rounded-full bg-white/10" />
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white/10 border border-white/10 rounded-3xl overflow-hidden">

          {/* COVER */}
          <div className="h-32 bg-white/10" />

          <div className="p-6 relative">

            {/* AVATAR */}
            <div className="absolute -top-12 left-6">
              <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-[#0b1120]" />
            </div>

            {/* CONTENT */}
            <div className="pt-14 space-y-4">

              <div className="h-6 w-52 rounded bg-white/10" />

              <div className="h-4 w-full rounded bg-white/10" />

              <div className="h-4 w-3/4 rounded bg-white/10" />

              <div className="flex gap-3 mt-4">
                <div className="h-8 w-24 rounded-full bg-white/10" />
                <div className="h-8 w-24 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="bg-white/10 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDUCATION */}
        <div className="bg-white/10 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="space-y-4">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="bg-black/20 rounded-2xl p-4 border border-white/5"
              >
                <div className="h-5 w-52 rounded bg-white/10 mb-3" />

                <div className="h-4 w-40 rounded bg-white/10 mb-4" />

                <div className="h-7 w-20 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* CAREER */}
        <div className="bg-white/10 border border-white/10 rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10" />
            <div className="h-5 w-40 rounded bg-white/10" />
          </div>

          <div className="space-y-4">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="bg-black/20 rounded-2xl p-4 border border-white/5"
              >
                <div className="h-5 w-52 rounded bg-white/10 mb-3" />

                <div className="h-4 w-40 rounded bg-white/10 mb-4" />

                <div className="h-7 w-24 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}