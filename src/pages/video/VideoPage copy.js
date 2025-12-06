import { Link } from "react-router-dom";

export default function VideoSidebar({
  videos = [],
  admin,
  categories = [],
  selectedCategory,
  setSelectedCategory
}) {

  const filteredVideos = selectedCategory
    ? videos.filter(v => v.category?.id === selectedCategory)
    : videos;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">

      {/* Sidebar */}
      <aside className="w-80 p-4 border-r bg-white h-screen sticky top-0 overflow-y-auto">

        <h4 className="font-semibold mb-3">Categories</h4>
        <ul className="space-y-2 mb-6">

          <li
            onClick={() => setSelectedCategory(null)}
            className={`cursor-pointer p-2 rounded-lg
              ${!selectedCategory ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
          >
            All Videos
          </li>

          {categories.map(cat => (
            <li
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`cursor-pointer p-2 rounded-lg capitalize
                ${selectedCategory === cat.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
            >
              {cat.name}
            </li>
          ))}
        </ul>

      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-blue-100 transition-all p-4">

        {/* Admin Info */}
        <div className="flex items-center gap-3 mb-6">
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
        <h4 className="font-semibold mb-2">Videos</h4>
        <ul className="space-y-2">
          {filteredVideos.length > 0 ? (
            filteredVideos.map(v => (
              <li key={v.id} className="flex items-center gap-3">
                <img
                  src={v.thumbnail_url || "/video-placeholder.png"}
                  className="w-14 h-10 object-cover rounded"
                />
                <Link to={`/videos/${v.id}`} className="text-sm">
                  {v.title}
                </Link>
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500">No videos available</p>
          )}
        </ul>

      </div>

    </div>
  );
}
