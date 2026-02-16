import { useEffect, useState } from "react";
import PostProfileCardId from "./PostProfileCardId";
import api from "../../Api/axios";
import { useParams } from "react-router-dom";

export default function MyPostsIdStudent({chats, image, setImage, postComments, setPostComments, 
        loading, setLoading, showUsersPopup, setShowUsersPopup, editContent, selectedPost,
        showDeleteModal, showEditModal, setEditContent, setSelectedPost, setShowDeleteModal, setShowEditModal,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList}) {

    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [postLoading, setPostLoading] = useState(false)

    const {id} = useParams()
    const fetchProfile = async () => {
      setPostLoading(true)
      try {
        const res = await api.get(`/api/users/${id}/posts-single`);

        if (!res.data.status) {
          setError(res.data.message);
        } else {
          setPosts(res.data.posts.map(post => ({
            ...post, 
            media: (post.media || []).filter(m => m && m.url)
            }))
            );
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Teacher profile not completed");
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setPostLoading(false);
      }
    };
  useEffect(() => {

    fetchProfile();
  }, []);


  
  if (postLoading)
    return (
      <div className="flex items-center mt-5 justify-center">
        <div className="animate-spin rounded-full h-6 w-6 my-6 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
    
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
    {
      posts.length === 0 &&(
        <p className="my-8 text-center text-black font-bold text-sm sm:text-xl">
          No Feed Post to Display
        </p>
      )
    }
<div className="p-3 mb-3 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
      {posts.map(post => (
        <div key={post.id} className="p-3 mb-3">
          <PostProfileCardId
            key={post.id}
            post={post}
            editable={true}
            chats={chats}
            image={image} setImage={setImage}
            postComments={postComments} setPostComments={setPostComments} loading={loading} 
            setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
            newComment={newComment} setNewComment={setNewComment}
            showEmoji={showEmoji} setShowEmoji={setShowEmoji}
            emojiList={emojiList} setEmojiList={setEmojiList} setPosts={setPosts}
            editContent={editContent} setEditContent={setEditContent}
            showDeleteModal={showDeleteModal} setShowDeleteModal={setShowDeleteModal}
            showEditModal={showEditModal} setShowEditModal={setShowEditModal}
            selectedPost={selectedPost} setSelectedPost={setSelectedPost} 
            setPostLoading={setPostLoading}
            fetchProfile={fetchProfile}
        />
        </div>
      ))}
    </div>
    </>
  );
}
