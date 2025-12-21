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
  const [currentIndex, setCurrentIndex] = useState(0);

  const {user: currentUser} = useAuth();



  const filteredVideos = selectedCategory
    ? videos.filter((v) => v.category?.id === selectedCategory)
    : videos;

  return (
    <div>
      <Navbar />
      <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* Sidebar */}
        <aside
          className={`fixed hidden lg:block top-[85px] left-2 rounded-xl h-full w-64 md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

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

<div className="lg:hidden block">
        <ul className="flex space-x-4 w-full px-2 -mb-16 mt-28 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
  <li
    onClick={() => setSelectedCategory(null)}
    className={`cursor-pointer whitespace-nowrap px-4 py-1 font-semibold w-24 h-10 mx-auto flex flex-col items-center justify-center  rounded-lg ${
      !selectedCategory
        ? "bg-blue-500 text-white"
        : "bg-gray-200 bg-transparent"
    }`}
  >
    All Videos
  </li>

  {categories.map((cat) => (
    <li
      key={cat.id}
      onClick={() => setSelectedCategory(cat.id)}
      className={`cursor-pointer whitespace-nowrap mx-auto flex flex-col items-center justify-center px-4 py-1 font-semibold h-10  rounded-lg ${
        selectedCategory === cat.id
          ? "bg-blue-500 text-white"
          : "hover:text-gray-500  bg-gray-100 text-black font-semibold"
      }`}
    >
      {cat.name}
    </li>
  ))}
</ul>
</div>
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
              <ul className="grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3  
  justify-items-center items-center
  gap-3  w-full">
                {filteredVideos.map((v) => (
            
                  <li key={v.id} className="border rounded-xl mb-3 shadow-sm">

                  {/* Admin Details */}

                {/* Video Thumbnail */}
                <div>
                 <VideoCards v={v} currentIndex = {currentIndex} setCurrentIndex = {setCurrentIndex} 
                 currentUser={currentUser} admin={admin}
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
