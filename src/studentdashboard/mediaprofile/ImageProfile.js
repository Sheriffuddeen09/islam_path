import { useEffect, useState } from "react";
import api from "../../Api/axios";
import ImageGridProfile from "./ImageGridProfile";

export default function MyImages({chats, editContent, selectedPost,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal,}) {
  const [posts, setPosts] = useState([]);
  const [imageLoading, setImageLoading] = useState(false)
  

  useEffect(() => {
  const fetchImages = async () => {
    try {
      setImageLoading(true);
      const res = await api.get("/api/posts-single");

      const onlyImages = res.data.posts.filter(p =>
        p.media.some(m => m.type === "image")
      );
      setPosts(onlyImages);
    } catch (err) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  fetchImages();
}, []);

  const handleDelete = async (id) => {
    await api.delete(`/api/posts/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  if(imageLoading){
   return <div className="flex items-center mt-5 justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500 border-solid"></div>
  </div>
  }

  return( 
  <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
    {
    posts.map(post => (
    <div key={post.id}>
      {post.media.some(m => m.type === "image") && (
        <ImageGridProfile
          media={post.media.filter(m => m.type === "image")}
          post={post} setPosts={setPosts}
          chats={chats}
          editContent={editContent} setEditContent={setEditContent}
          showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
          showEditModal={showEditModal} setShowEditModal={setShowEditModal}
          selectedPost={selectedPost} setSelectedPost={setSelectedPost}
        />
      )}
     
    </div>
  ))
  }
</div>

)
}
