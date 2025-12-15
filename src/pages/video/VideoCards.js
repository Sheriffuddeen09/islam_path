// src/components/VideoCard.jsx
import { useState, useEffect } from "react";
import api from "../../Api/axios"; // your axios instance
import { Link, useNavigate } from "react-router-dom";
import { initEcho } from "../../echo"; // initEcho should create window.Echo once
import VideoOptions from "./VideoOption";
import { useAuth } from "../../layout/AuthProvider";

export default function VideoCards({ v, admin, currentUser }) {
  const [showMore, setShowMore] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // local reaction state (derived from API v)
  const [counts, setCounts] = useState(v.reaction_counts || {}); // { '❤️': 2, '👍': 1 }
  const [myReaction, setMyReaction] = useState(v.my_reaction || null);
  const [usersPreview, setUsersPreview] = useState([]); // optional small list
  const [showUsersPopup, setShowUsersPopup] = useState(false);
  const [comments, setComments] = useState([])

  const {user} = useAuth()
  const navigate = useNavigate();
  const reactionList = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

  // Keep component in sync with server via websockets (optional)
  useEffect(() => {
    // initialize echo (no-op if already initialized)
    try {
      const Echo = initEcho();
      const channel = Echo.channel(`video.${v.id}`);
      channel.listen("ReactionUpdated", (payload) => {
        // payload.counts is expected as object, payload.users as array
        if (payload.counts) setCounts(payload.counts);
        if (payload.users) setUsersPreview(payload.users.slice(0, 6));
        // optionally update myReaction if payload contains it (server might send it)
      });

      return () => {
        channel.stopListening("ReactionUpdated");
        Echo.leaveChannel(`video.${v.id}`);
      };
    } catch (err) {
      // Echo may not be configured — that's fine, feature is optional
      // console.warn("Echo not initialized:", err);
    }
  }, [v.id]);

  // Helper: total likes
  const totalLikes = (counts) =>
  Object.values(counts).reduce((s, n) => s + Number(n || 0), 0);

  // Toggle reaction: if same emoji => unlike, else set/update
  const toggleReaction = async (emoji) => {
    if (!currentUser) {
      // show login prompt or redirect to login
      alert("Please log in to react.");
      return;
    }

    try {
      // If user currently has same emoji, call DELETE (unlike)
      if (myReaction === emoji) {
  // ✅ optimistic: remove my reaction
  setMyReaction(null);

  // ✅ update counts
  setCounts((prev) => {
    const copy = { ...prev };
    copy[emoji] = (Number(copy[emoji] || 0) - 1);
    if (copy[emoji] <= 0) delete copy[emoji];
    return copy;
  });

  // ✅ IMPORTANT: remove user name immediately
  setUsersPreview((prev) =>
    prev.filter((u) => u.id !== currentUser.id)
  );

  // ✅ server call
  await api.delete(`/api/videos/${v.id}/reaction`);
  return;
}

      // Otherwise POST to set/change reaction
      // optimistic update: decrement old reaction count, increment new
      setCounts((prev) => {
        const copy = { ...prev };
        if (myReaction) {
          copy[myReaction] = (Number(copy[myReaction] || 1) - 1);
          if (copy[myReaction] <= 0) delete copy[myReaction];
        }
        copy[emoji] = (Number(copy[emoji] || 0) + 1);
        return copy;
      });
      setMyReaction(emoji);

      // send to server
      const res = await api.post(`/api/videos/${v.id}/reaction`, { emoji });

      // server returns canonical counts & users — use them if present
      if (res?.data?.counts) setCounts(res.data.counts);
      if (res?.data?.users) setUsersPreview(res.data.users.slice(0, 6));
      if (res?.data?.my_reaction) setMyReaction(res.data.my_reaction);
    } catch (err) {
      console.error("Reaction error", err);
      // on error, you might re-fetch current state or roll back; simple approach: reload page data
      // For now, rollback optimistic: fetch fresh counts
      try {
        const fresh = await api.get(`/api/videos/${v.id}/reactions`);
        setCounts(fresh.data.counts || {});
        setUsersPreview(fresh.data.users?.slice(0,6) || []);
        setMyReaction(fresh.data.my_reaction || null);
      } catch (err2) { /* ignore */ }
    } finally {
      setShowReactions(false);
    }
  };

  // Clicking the Like button: quick toggle (use myReaction or default 👍)
  const onLikeClick = () => {
    const emoji = myReaction || "👍";
    toggleReaction(emoji);
  };

  useEffect(() => {
  if (v.reacted_users) {
    setUsersPreview(v.reacted_users.slice(0, 6));
  }
}, [v.reacted_users]);


  // Render
  const text = v.description || "";
  const shortText = text.length > 100 ? text.substring(0, 100) + "..." : text;

  return (

  <div className="bg-white rounded-xl overflow-hidden">
    {/* Thumbnail */}
     <Link
          to={`/video/${v.id}`}
          className="text-blue-600 hover:underline text-xs"
        >
    <div
      className="relative aspect-video bg-black cursor-pointer"
      onClick={() => navigate(`/video/${v.id}`)}
    >
      <video
        src={v.video_url}
        className="w-full h-full object-cover"
        muted
      />

      {/* Play icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/60 rounded-full p-">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24" 
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
</Link>
    {/* Content */}
    <div className="p-4">
      {/* Title */}
      <Link style={{
        textDecoration: 'none'
      }}
        to={`/video/${v.id}`}
        className="font-semibold text-sm line-clamp-2 hover:underline"
      >
        <div className="flex items-center justify-between gap-3 mb-1">
               <Link to={`/profile/${user.id}`}> <div className="flex items-center justify-start gap-3 mb-1">

                    <span className="text-white w-8 h-8 flex flex-col justify-center items-center text-xl font-bold  rounded-full bg-blue-800 ">
                 {admin?.first_name?.charAt(0)?.toUpperCase() || "A"} </span>
                  
                  <div className="text-xs">
                    <div className="font-bold text-[12px] text-black">
                    {admin?.first_name} {admin?.last_name}
                  </div>
                  <div className="text-[9px] text-black">{admin?.role}</div>
                  </div>
                  
                  </div>
              </Link>
                </div> 
      </Link>

      {/* Meta */}
      <div className="flex justify-between items-center ">
       <div className="text-xs text-gray-500 flex gap-2">
        <span>{v.views_count || 0} views</span>
        <span>•</span>
        <span>{v.time_ago}</span>
      </div>

        <div className="flex gap-1 items-center">
          <span className="text-xs">Like</span>
        <span>•</span>
       <div className=" text-xs text-gray-600">
        {usersPreview.length > 0 && (
          <>
            <span
              className="font-semibold text-xs cursor-pointer hover:underline"
              onClick={() => setShowUsersPopup(true)}
            >
              {usersPreview[0].id === currentUser?.id
                ? "You"
                : usersPreview[0].name}
            </span>

            {usersPreview.length > 1 && (
              <span className="ml-1 text-xs text-gray-500 cursor-pointer">
                and {usersPreview.length - 1} others
              </span>
            )}
          </>
        )}
        {Object.keys(counts).map((emoji) => (
          <span key={emoji} className="text-xs -mr-2">{emoji}</span>
        ))}
        <span className="text-xs ml-3">{totalLikes(counts)}</span>
      </div>
        
      </div>

      </div>

      {/* Description */}
      <p className="text-xs text-gray-700 mt-2">
        {showMore ? text : shortText}
        {text.length > 100 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMore(!showMore);
            }}
            className="text-blue-600 ml-1"
          >
            {showMore ? "Read less" : "Read more"}
          </button>
        )}
      </p>

      {/* Stats */}
      <div className="flex items-center border-t justify-between mt-4 -mb-2 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex justify-between text-gray-600">
        {/* like with hover picker */}
        <div className="relative group hover:text-blue-800  inline-block" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          {showReactions && (
            <div className="absolute -top-14 left-0 opacity-0 group-hover:opacity-100 invisible group-hover:visible group-hover:translate-y-2 transform transition-all duration-500 bg-white shadow-lg rounded-full px-3 py-2 flex gap-2 z-20">
              {reactionList.map((emoji) => (
                <span key={emoji} onClick={() => toggleReaction(emoji)}
                      className="text-2xl hover:scale-125 transition cursor-pointer">
                  {emoji}
                </span>
              ))}
            </div>
          )}

          <button onClick={onLikeClick}
                  className={`flex items-center gap-2 ${myReaction ? 'bg-blue-600 font-bold text-white rounded-full p-1 ' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                </svg>
          </button>
        </div>
        </div>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg> {v.comments_count}
          </span>
        </div>

       <VideoOptions video={v} />
      </div>
    </div>

    {showUsersPopup && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg w-80 p-4">
      <h3 className="font-semibold mb-3">Likes</h3>

      {usersPreview.map(u => (
        <div key={u.id} className="flex justify-between text-sm py-1">
          <span>
            {u.id === currentUser?.id ? "You" : u.name}
          </span>
          <span className="text-gray-500">{u.role}</span>
        </div>
      ))}

      <button
        className="mt-4 w-full text-sm text-blue-600"
        onClick={() => setShowUsersPopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

  </div>
);


}