import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../../layout/Header";
import VideoCards from "./VideoCards";
import { useAuth } from "../../layout/AuthProvider";


export default function VideoSidebar({
  videos = [],
  admin,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  loading = false // pass loading prop or handle state here
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [likes, setLikes] = useState({});
  const [shares, setShares] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const {user: currentUser} = useAuth();
 

const handleLike = (id) => {
  setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
};

const handleShare = (id) => {
  setShares((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  navigator.share
    ? navigator.share({ title: "Share Video", url: `/videos/${id}` })
    : alert("Sharing not supported on this device.");
};


  const filteredVideos = selectedCategory
    ? videos.filter((v) => v.category?.id === selectedCategory)
    : videos;

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        {/* Sidebar */}
        <aside
          className={`fixed top-20 left-0 h-full lg:w-80 md:w-96 md:py-10 lg:py-8 w-72 bg-white border border-t-0 border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >
          <button
            className="lg:hidden absolute top-4 right-4 text-xl"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>

          <h3 className="text-xs text-blue-800 font-bold mb-2">FILTER VIDEO</h3>
          <ul className="space-y-4 mb-">
            <li
              onClick={() => setSelectedCategory(null)}
              style={{
                  margin: 5
                }}
              className={`cursor-pointer p-2 text-sm rounded-lg ${
                !selectedCategory
                  ? "bg-blue-500 text-white hover:bg-gray-100 hover:text-black"
                  : "hover:bg-gray-200 bg-transparent text-black"
              }`}
            >
              All Videos
            </li>

            {categories.map((cat) => (
              <li
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)} style={{
                  margin: 5
                }}
                className={`cursor-pointer px-2 py-2 -my-3 space-y-0 rounded-lg capitalize ${
                  selectedCategory === cat.id ? "bg-blue-500 text-white" : "hover:text-gray-500 hover:bg-blue-100 text-black font-semibold"
                }`}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 transition-all p-4 mt-20 lg:ml-64 flex flex-col items-center">
          {loading ? (
            // Skeleton loader
            <div className="space-y-4 w-full max-w-md">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-300 rounded" />
                  <div className="h-2 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-14 h-10 bg-gray-300 rounded" />
                  <div className="h-3 bg-gray-300 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredVideos.length > 0 ? (
            <>
              {/* Video List */}
              <ul className="space-y-2 w-full max-w-md">
                {filteredVideos.map((v) => (
            
                  <li key={v.id} className="p-3 border rounded-lg mb-3 shadow-sm">

                  {/* Admin Details */}
                <div className="flex items-center justify-start gap-6 my-6 mt-2">
               <span className="text-white w-16 h-16 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 ">
                 {admin?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>
                  
                  <div className="text-xs">
                    <div className="font-bold text-[17px] text-black">
                    {admin?.first_name} {admin?.last_name}
                  </div>
                  <div className="text-[11px] text-black">{admin?.role}</div>
                  </div>
                </div>

                {/* Video Thumbnail */}
                <div>
                 <VideoCards v={v} currentIndex = {currentIndex} setCurrentIndex = {setCurrentIndex} 
                 handleShare={handleShare} shares={shares} 
                 currentUser={currentUser}
                 />
                </div>
              </li>

                ))}
              </ul>
              {/* --- LIKE • COMMENT • SHARE BAR --- */}
      
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-6">No videos available</p>
          )}
        </div>
      </div>
    </div>
  );
}
