import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../../layout/Header";

export default function VideoSidebar({
  videos = [],
  admin,
  categories = [],
  selectedCategory,
  setSelectedCategory,
  loading = false // pass loading prop or handle state here
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <ul className="space-y-4 mb-6">
            <li
              onClick={() => setSelectedCategory(null)}
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
                onClick={() => setSelectedCategory(cat.id)}
                className={`cursor-pointer p-2 rounded-lg capitalize ${
                  selectedCategory === cat.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <div className="flex-1 transition-all p-4 flex flex-col items-center">
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
              {/* Admin Info */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_nLCu85ayoTKwYw6alnvrockq5QBT2ZWR2g&s"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-bold text-black">
                    {admin?.first_name} {admin?.last_name}
                  </div>
                  <div className="text-xs text-black">{admin?.role}</div>
                </div>
              </div>

              {/* Video List */}
              <ul className="space-y-2 w-full max-w-md">
                {filteredVideos.map((v) => (
                  <li key={v.id} className="flex items-center gap-3">
                    <img
                      src={v.thumbnail_url || "/video-placeholder.png"}
                      className="w-14 h-10 object-cover rounded"
                    />
                    <Link to={`/videos/${v.id}`} className="text-sm">
                      {v.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-500 mt-6">No videos available</p>
          )}
        </div>
      </div>
    </div>
  );
}
