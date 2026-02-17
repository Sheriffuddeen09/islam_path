import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import api from "../../Api/axios";
import SideBarRIght from "../homepageComponent/SideBarRIght";
import SidebarLeft from "../homepageComponent/SideBarLeft";

export default function PostFeed({posts, setPosts, image, postComments, setPostComments, newComment, setNewComment,
  showEmoji, setShowEmoji, emojiList, setEmojiList, messageOpen, setMessageOpen, chats, setChats,
  loading, setLoading, setImage, setShowUsersPopup, showUsersPopup}) {

    const [feedLoading, setFeedLoading] = useState(false)
  useEffect(() => {
    const fetchPosts = async () => {
      setFeedLoading(true)
      try {
        const res = await api.get("/api/posts-get");
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setFeedLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (feedLoading) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  const largeScreen = (
    <div className="block md:hidden lg:block">
        <div className="flex flex-col lg:flex-row  items-center justify-center  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SideBarRIght */}
        <SidebarLeft />
    
    
      {
        posts.length === 0 && (
          <p className="text-black lg:ml-96 translate-y-40 sm:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-xl font-bold ">
            No Feed Post Available
          </p>
         )
      }
    
    <div className="flex-1 transition-all mx-auto p-4 mt-20 gap-3 flex flex-col items-center">
      {posts.map(post => (
        <PostCard key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        />
      ))}
      </div>
     
      
      <SideBarRIght />
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col lg:flex-row  items-end  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SideBarLeft */}
       
    <SidebarLeft />
    
      {
        posts.length === 0 && (
          <p className="text-black md:translate-y-60 md:ml-96 lg:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-xl font-bold ">
            No Feed Post Available
          </p>
         )
      }
     

      <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
      {posts.map(post => (
        <PostCard key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        />
      ))}
      </div>
      
    </div>
    </div>
  );

  return (
    <div>
      {largeScreen}
      {ipadScreen}  
    </div>
  )
}
