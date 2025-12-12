import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../Api/axios";
import { useAuth } from "../../layout/AuthProvider";
import CommentsSidebar from "./CommentVideo";
import logo from '../../layout/image/favicon.png'

export default function VideoPlayerPage() {
  const { id } = useParams(); // Video ID from URL
  const navigate = useNavigate();
  const [reactionCounts, setReactionCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [usersPreview, setUsersPreview] = useState([]);
  const [showFull, setShowFull] = useState(false);
  const [comments, setComments] = useState([]);

 
  const { user: currentUser } = useAuth();

  const [showOverlay, setShowOverlay] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseMove = () => {
    setShowOverlay(true);

    // Clear previous timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Hide overlay after 5 seconds
    timeoutRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 5000);
  };

  const [videos, setVideos] = useState([]); // Full videos list
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notifyNext, setNotifyNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);



  // Fetch all videos
  useEffect(() => {
  async function fetchVideos() {
    try {
      const res = await api.get("/api/videos"); // your paginated endpoint
      const data = res.data.data; // <-- get the actual videos array

      if (!Array.isArray(data)) {
        console.error("Expected array of videos, got:", data);
        setVideos([]);
        setLoading(false);
        return;
      }

      setVideos(data);

      // Find current video index
      const index = data.findIndex((v) => v.id === parseInt(id));
      setCurrentIndex(index !== -1 ? index : 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
      setLoading(false);
    }
  }

  fetchVideos();
}, [id]);

useEffect(() => {
  if (!videos.length) return; // wait until videos are loaded
  const v = videos[currentIndex];
  if (!v) return;

  async function fetchReactions() {
    try {
      const res = await api.get(`/api/videos/${v.id}/reactions`);
      setReactionCounts(res.data.counts || {});
      setUsersPreview(res.data.users?.slice(0, 6) || []);
      setMyReaction(res.data.my_reaction || null);
    } catch (err) {
      console.error("Failed to fetch reactions", err);
    }
  }

  fetchReactions();
}, [videos, currentIndex]);



const toggleReaction = async (emoji) => {
  if (!currentUser) return alert("Please log in to react.");

  try {
    if (myReaction === emoji) {
      // Unlike
      setMyReaction(null);
      setReactionCounts((prev) => {
        const copy = { ...prev };
        copy[emoji] = (Number(copy[emoji] || 0) - 1);
        if (copy[emoji] <= 0) delete copy[emoji];
        return copy;
      });
      setUsersPreview((prev) => prev.filter(u => u.id !== currentUser.id));
      await api.delete(`/api/videos/${v.id}/reaction`);
      return;
    }

    // Like or change reaction
    setReactionCounts((prev) => {
      const copy = { ...prev };
      if (myReaction) {
        copy[myReaction] = (Number(copy[myReaction] || 1) - 1);
        if (copy[myReaction] <= 0) delete copy[myReaction];
      }
      copy[emoji] = (Number(copy[emoji] || 0) + 1);
      return copy;
    });
    setMyReaction(emoji);

    const res = await api.post(`/api/videos/${v.id}/reaction`, { emoji });
    if (res?.data?.counts) setReactionCounts(res.data.counts);
    if (res?.data?.users) setUsersPreview(res.data.users.slice(0, 6));
    if (res?.data?.my_reaction) setMyReaction(res.data.my_reaction);

  } catch (err) {
    console.error(err);
  }
};


  if (loading) return <p className="text-center py-10">Loading videos...</p>;
  if (!videos.length || currentIndex === -1)
    return <p className="text-center py-10">Video not found</p>;

  const v = videos[currentIndex];

   if (!v) return null;

  const words = v.description?.split(" ") || [];
  const isLong = words.length > 50;
  const shortDescription = isLong ? words.slice(0, 50).join(" ") + "..." : v.description;
  
  // Auto-next handler
  const handleVideoEnd = () => {
    if (currentIndex < videos.length - 1) {
      setNotifyNext(true);
      setTimeout(() => {
        setNotifyNext(false);
        handleNext();
      }, 2000); // 2-second notification before next video
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      navigate(`/video/${videos[nextIndex].id}`);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      navigate(`/video/${videos[prevIndex].id}`);
    }
  };


  return (
    <div className="">

      
      <div
      className="relative h-screen w-screen bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove} // <-- use mouse move instead
    >
      {/* Video */}
     <video
        src={v.video_url}
        className="h-full w-auto max-w-full  pointer-events-auto"
        controls
        autoPlay
        onEnded={handleVideoEnd}   // ✅ THIS WAS MISSING
      />
        {notifyNext && (
  <div className="absolute top-10 bg-black/70 text-white px-4 py-2 rounded z-50">
    Next video is loading...
  </div>
)}

  <div className="inline-flex items-center gap-6 absolute top-4 left-4">
          <Link to={'/'}>
              <img src={logo} alt='logo' className="bg-white rounded-full" width={50} height={50}/>
          </Link>
      <Link to={'/video'}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </Link>
      </div>
      {/* Video Description + Poster Name (overlay) */}
      <div
        className={`absolute bottom-16 sm:block left-1/2 -translate-x-40
                    bg-gray-900 w-80 bg-opacity-80 px-4 py-2 rounded text-white
                    transition-all duration-300
                    flex flex-col items-start space-y-1
                    ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >

      <div className="flex items-center my-6 gap-2 mt-2 ">
            <span className="text-white w-12 h-12 flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> {v.user?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>

        <div className="text-xs">
          <div className="font-bold text-[14px] text-white">
            {v.user?.first_name} {v.user?.last_name}
          </div>
          <div className="text-[11px] text-white">
            {v.user?.role || v.user?.admin?.role || "No role"}
          </div>
        </div>
      </div>

      <p className="text-xs -translate-y-5">
        {showFull || !isLong ? v.description : shortDescription}{" "}
        {isLong && (
          <span
            onClick={() => setShowFull(!showFull)}
            className="text-blue-300 cursor-pointer ml-1"
          >
            {showFull ? "show less" : "read more"}
          </span>
        )}
      </p>
    </div>

    {/* Mobile View  */}

    <div style={{
      backgroundColor: 'transparent'
    }}
        className={`absolute bottom-16 left-1/2 -translate-x-40 z-50 pointer-events-auto
                      w-80 sm:hidden px-4 py-2 rounded text-white
                    transition-all duration-300
                    flex flex-col items-start space-y-1
                  `}
      >

      <div className="flex items-center my-6 z-50 gap-2 mt-2 ">
      <span className="text-white w-12 h-12 mx-auto flex flex-col justify-center items-center text-4xl font-bold  rounded-full bg-blue-800 "> 
              {v.user?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>
        <div className="text-xs">
          <div className="font-bold text-[14px] text-black">
            {v.user?.first_name} {v.user?.last_name}
          </div>
          <div className="text-[11px] text-black">
            {v.user?.role || v.user?.admin?.role || "No role"}
          </div>
        </div>
      </div>

      <p className="text-xs -translate-y-5 text-black">
        {showFull || !isLong ? v.description : shortDescription}{" "}
        {isLong && (
          <span
            onClick={() => setShowFull(!showFull)}
            className="text-blue-300 cursor-pointer ml-1"
          >
            {showFull ? "show less" : "read more"}
          </span>
        )}
      </p>
    </div>

      {/* Next and Prev Button */}

      <div className="absolute top-1/2 sm:left-10 left-0 bg-transparent -translate-y-1/2 z-50 pointer-events-auto">
      <div className="flex flex-col justify-between mt-4">
        <button
          
          onClick={handleNext}
          style={{
          backgroundColor: "transparent"
          }}
          disabled={currentIndex === videos.length - 1}
          className="px-4 py-2 rounded disabled:opacity-50"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="bg-transparent size-14  sm:size-20 text-gray-800 sm:text-white">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>

        </button>
       <button
        onClick={handlePrev}
        disabled={currentIndex === 0}
        style={{
          backgroundColor: "transparent"
        }}
        className={`px-4 py-2 rounded transition-colors 
          ${currentIndex === 0 ? " disabled:opacity-50 cursor-not-allowed" : "text-white"}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="bg-transparent size-14  sm:size-20 text-gray-800 sm:text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      </div>
        </div>

        <div className="absolute flex flex-col items-center  top-1/2 left-1/2 translate-x-24 -translate-y-1/2 z-50 pointer-events-auto">
      <button onClick={() => toggleReaction('👍')} className="mt-2 px-3 py-1 text-white rounded inline-flex items-center gap-2">
        {myReaction === '👍' ? <p className="text-blue-600 font-bold">Like</p> : <p className="text-white font-bold">Like</p>  }
         {Object.keys(reactionCounts).map((emoji) => (
          <span key={emoji} className="text-xl -mr-2"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-blue-600 font-bold">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg></span>
        ))}
      </button>
      <div className="flex flex-col items-center gap-2 mt-">
       
        <span className="text-sm ml-3">
          {Object.values(reactionCounts).reduce((a,b)=>a+b,0)}
        </span>
      </div>

      <button
          onClick={() => setShowComments(!showComments)}
          className="mt-2 px-4 py-2 text-white rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
</svg>
        {v.comments_count}
        </button>
     </div>
      {/* Comments Sidebar */}
      {showComments &&
        <div
        className={`fixed bottom-0 right-0 w-full max-h-1/2 md:w-96 md:top-0 md:right-0 md:bottom-0 bg-white shadow-lg overflow-y-auto transition-transform duration-300 z-50
        ${showComments ? "translate-y-0" : "translate-y-full md:translate-y-0"}`}
      >
        <CommentsSidebar videoId={v.id} v={v} setShowComments={setShowComments} comments={comments} setComments={setComments} />
      </div>
      }
      
    </div>


    </div>
  );
}
