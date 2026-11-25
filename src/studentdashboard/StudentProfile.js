import api from "../Api/axios";
import { Mail, Phone } from "lucide-react";
import Performance from "./Performance"; 
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StudentProfileFriendDashboard from "./StudentProfileFriendDashboard";
import LogoutButton from "../Form/LogOut";
import MyPosts from "./mediaprofile/PostProfile";
import MyVideos from "./mediaprofile/VideoProfile";
import MyImages from "./mediaprofile/ImageProfile";
import BiodataDashboard from "./BioDataDashboard";
import ProfileUpgradeModal from "../components/ProfileUpgradeModal";
import { useAuth } from "../layout/AuthProvider";
import { BadgeCheck, Copy } from "lucide-react";
import UpgradeBadge from "../components/UpgradeBadge";
import { toast } from "react-toastify";

export default function StudentProfilePage({togglePopup,  image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList, chats,  setMessages, setActiveChat,commentsByPost, setCommentsByPost,
      video, setVideo, showUpgradeModal, setShowUpgradeModal}) {
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

    const { authUser, setAuthUser } = useAuth();



useEffect(() => {
  api.get("/api/user/badges")
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
  

  if (loadingProfile) return <Loader  />

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
                    image={image} setImage={setImage} video={video} setVideo={setVideo}
                    postComments={postComments} setPostComments={setPostComments} loading={loading} 
                    setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
                    newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
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
                    emojiList={emojiList} setEmojiList={setEmojiList} setLoading={setLoading}
                    postComments={postComments} setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
                    showEmoji={showEmoji} setShowEmoji={setShowEmoji} newComment={newComment}
                    setNewComment={setNewComment} loading={loading}
                    user={user} image={image} setImage={setImage} video={video} setVideo={setVideo}
                    />
                    </div>
                    <div className={`${visibleProfile === 3 ? 'block' : 'hidden'}`}>
                    <MyImages chats={chats} 
                    editContent={editContent} setEditContent={setEditContent}
                    showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
                    showEditModal={showEditModal} setShowEditModal={setShowEditModal}
                    selectedPost={selectedPost} setSelectedPost={setSelectedPost}
                    emojiList={emojiList} setEmojiList={setEmojiList} setLoading={setLoading}
                    postComments={postComments} setPostComments={setPostComments} commentsByPost={commentsByPost}
                    setCommentsByPost={setCommentsByPost}
                    showEmoji={showEmoji} setShowEmoji={setShowEmoji} newComment={newComment}
                    setNewComment={setNewComment} loading={loading}
                    user={user} image={image} setImage={setImage} video={video} setVideo={setVideo}
                    />
                    </div>
        <div className={`${visibleProfile === 4 ? 'block' : 'hidden'}`}>
            <Performance badges={badges} />
        </div>
        </div>
  )
  
  
      
    const colors = [
        "bg-red-400",
        "bg-blue-400",
        "bg-green-400",
        "bg-purple-400",
        "bg-pink-400",
        "bg-yellow-400",
        "bg-orange-400",
        "bg-indigo-400",
        "bg-teal-400",
        "bg-cyan-400",
        "bg-emerald-400",
        "bg-lime-400",
        "bg-amber-400",
        "bg-rose-400",
        "bg-fuchsia-400",
        "bg-violet-400",
        "bg-sky-400",
        "bg-slate-400",
        "bg-gray-400",
        "bg-zinc-400",
        "bg-stone-400",
        "bg-neutral-400",
        "bg-red-500",
        "bg-blue-500",
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
  <div className="max-w-6xl lg:ml-64 mx-auto px-4 py-4">

    {/* PROFILE CARD */}
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#0f172a] to-[#1e293b] shadow-2xl">

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

            {/* NAME + UPGRADE BADGE */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">

              <h2 className="text-2xl sm:text-4xl font-bold text-white break-words">
                {profile.first_name}{" "}
                <span>
                  {profile.last_name}
                </span>
              </h2>

              {/* GREEN UPGRADE BADGE */}
              <UpgradeBadge
                upgrade={profile.upgrade}
                size={25}
              />

            </div>

            
            {/* PROFILE ID */}
            <div className='flex items-center gap-2 sm:gap-5 mt-2 '>
            <div className="inline-flex capitalize font-bold items-center  px-4 py-1.5 rounded-xl bg-white/50 border border-white/10 text-xs sm:text-sm text-white">
              {profile.role} ID: #{profile.id}
            </div>

            {/* UPGRADE PROFILE BUTTON */}
            <div className=" flex flex-wrap justify-center md:justify-start gap-3">

              <button
                onClick={() => setShowUpgradeModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg ${
                  profile.upgrade?.status === "approved"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                }`}
              >
                <BadgeCheck size={19} />

                {profile.upgrade?.status === "approved"
                  ? "Edit Upgrade Profile"
                  : "Upgrade Profile"}
              </button>

            </div>
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

            {/* UPGRADE PROFILE DETAILS */}
            {profile.upgrade?.status === "approved" && (
              <div className="mt-5">

                {/* AUTHOR */}
                             {profile?.upgrade?.subscription_url && (
                               <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
                                   <p className="text-sm font-bold text-green-700 mb-2">
                                       Author Profile Link
                                   </p>
               
                                   <div className="flex gap-2">
                                       <input
                                           value={profile.upgrade.subscription_url}
                                           readOnly
                                           className="min-w-0 flex-1 border rounded-lg p-2 text-sm bg-white"
                                       />
               
                                       <button
                                           type="button"
                                           onClick={async () => {
                                               try {
                                                   await navigator.clipboard.writeText(
                                                       profile.upgrade.subscription_url
                                                   );
                                                   toast.success("Link copied successfully.");
                                               } catch {
                                                   toast.error("Unable to copy link.");
                                               }
                                           }}
                                           className="bg-green-600 text-white px-4 rounded-lg"
                                       >
                                           <Copy size={18}/>
                                       </button>
                                   </div>
                               </div>
                           )}
                {/* MARKETER */}
                {profile.upgrade.profile_type === "marketer" && (
                  <div className="max-w-2xl">

                    <p className="text-green-400 font-semibold flex items-center gap-2 mb-2">
                      <BadgeCheck size={18} />
                      Open for Business
                    </p>

                    {profile.upgrade.business_description && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {profile.upgrade.business_description}
                      </div>
                    )}

                  </div>
                )}

                {/* QUESTION PAGE */}
                {profile.upgrade.profile_type === "question_page" && (
                  <div className="mt-2">

                    <p className="text-green-400 font-semibold flex items-center gap-2">
                      <BadgeCheck size={18} />
                      Question & Answer Page
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {(profile.upgrade.question_categories || []).map(
                        (category) => (
                          <span
                            key={category}
                            className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs capitalize"
                          >
                            {category.replaceAll("_", " ")}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* EXISTING BADGE */}
          {badge && (
            <div className="md:pb-3 flex justify-end -translate-y-4 sm:translate-y-0 -mb-4 sm:mb-0 md:justify-end">
              {badge}
            </div>
          )}

        </div>
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

    </div>

   

  </div>
);



  return(
    <div>
         
        {headerDashboard}
        {content}
        <BiodataDashboard profile={profile} visibility={visibility}
         handleToggleVisibility={handleToggleVisibility} editVisibility={editVisibility} />
        <StudentProfileFriendDashboard  togglePopup={togglePopup} setActiveChat={setActiveChat}
         setMessages={setMessages} />
        {profile_content}

      {showUpgradeModal && (
        <ProfileUpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          currentUser={authUser}
          onUpgradeSaved={(updatedUser) => {
            setAuthUser((prev) => ({
              ...prev,
              ...updatedUser,
            }));
          }}
        />
      )}
    </div>
  )
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
        <div className="bg-white/50 border border-white/10 rounded-3xl overflow-hidden">

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