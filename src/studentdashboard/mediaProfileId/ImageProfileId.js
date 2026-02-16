import { useEffect, useState } from "react";
import api from "../../Api/axios";
import ImageGridProfileId from "./ImageGridProfileId";
import { useParams } from "react-router-dom";

export default function MyImagesIdStudent({chats, editContent, selectedPost,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal,}) {
  const [posts, setPosts] = useState([]);
  const [imageLoading, setImageLoading] = useState(false)
  const {id} = useParams()
     
  
  const fetchImages = async () => {
        setImageLoading(true)
        try {
          const res = await api.get(`/api/users/${id}/posts-single`);

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

  useEffect(() =>{
    fetchImages();
  }, []);


  if(imageLoading){
   return <div className="flex items-center mt-5 justify-center">
    <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-blue-500 border-solid"></div>
  </div>
  }

  return( 
    <>
    {
      posts.length === 0 &&(
        <p className="my-8 text-center text-black font-bold text-sm sm:text-xl">
          No Photo to Display
        </p>
      )
    }
  <div className="grid sm:grid-cols-1 grid-cols-1 gap-4">


    {
    posts.map(post => (
    <div key={post.id}>
      {post.media.some(m => m.type === "image") && (
        <ImageGridProfileId
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
</>

)
}
