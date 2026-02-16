import { useEffect, useState } from "react";
import api from "../../Api/axios";
import VideoCardProfile from "./VideoCardProfile";

export default function MyVideos({chats, editContent, selectedPost,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal,}) {
    const [videoLoading, setVideoLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");


useEffect(() => {
  const fetchVideos = async () => {
    try {
      setVideoLoading(true);
      const res = await api.get("/api/posts-single");

      const onlyVideos = res.data.posts.filter(p =>
        p.media?.some(m => m.type === "video")
      );

      setPosts(onlyVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setVideoLoading(false);
    }
  };

  fetchVideos();
}, []);


  const handleDelete = async (id) => {
    await api.delete(`/api/posts-single${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if (videoLoading){
    return <div className="flex items-center mt-5 justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500 border-solid"></div>
  </div>
  }

  return(
<>
    {
      posts.length === 0 &&(
        <p className="my-8 text-center text-black font-bold text-sm sm:text-xl">
          No Video to Display
        </p>
      )
    }
  <div className="grid lg:grid-cols-3 mdgrid-cols-2 pb-10 grid-cols-1 gap-4">
  {posts.flatMap(p =>
    (p.media || [])
      .filter(m => m.type === "video")
      .map(v => (
        <VideoCardProfile key={v.id} v={v} post={p} chats={chats}
        editContent={editContent} setEditContent={setEditContent}
        showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
        showEditModal={showEditModal} setShowEditModal={setShowEditModal}
        selectedPost={selectedPost} setSelectedPost={setSelectedPost}
        setPosts={setPosts}
        />
      ))
  )}
</div>
</>
)
}
