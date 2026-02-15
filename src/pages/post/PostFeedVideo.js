import { useEffect, useState } from "react";
import api from "../../Api/axios";
import PostCardVideo from "./PostCardVideo";

export default function PostFeedVideo({posts, setPosts, image, postComments, setPostComments, newComment, setNewComment,
  showEmoji, setShowEmoji, emojiList, setEmojiList,messageOpen, setMessageOpen, chats, setChats,
  loading, setLoading, setImage, setShowUsersPopup, showUsersPopup}) {

    const [feedLoading, setFeedLoading] = useState(false)
  const fetchPosts = async () => {
  setFeedLoading(true);
  try {
    const res = await api.get("/api/posts-get");

    const onlyVideoPosts = res.data.posts.filter(p =>
      p.media?.some(m => m.type === "video")
    );

    setPosts(onlyVideoPosts);
  } catch (err) {
    console.error(err);
  } finally {
    setFeedLoading(false);
  }
};

useEffect(() => {
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

        {/* Sidebar */}
        <aside
          className={`fixed hidden sm:block top-[80px] left-2 rounded-xl h-full w-80 mx-auto text-center md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-2">FILTER VIDEO</h3>
          <ul className="space-y-4 mb-">
            <li>
              All
            </li>
          </ul>
        </aside>
    
    
      {
        posts.length === 0 && (
          <p className="text-black lg:ml-96 translate-y-40 sm:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-xl font-bold ">
            No Video Available
          </p>
         )
      }
    
    <div className="flex-1 transition-all mx-auto p-4 mt-20 gap-3 flex flex-col items-center">
      {posts.map(post => (
        <PostCardVideo key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}/>
      ))}
      </div>
     

      <div className="md:block lg:hidden hidden">
      <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
      {posts.map(post => (
        <PostCardVideo key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
        />
      ))}
      </div>
      </div>
      
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col lg:flex-row  items-end  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* Sidebar */}
        <aside
          className={`fixed hidden sm:block top-[80px] left-2 rounded-xl h-full w-80 mx-auto text-center md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-2">FILTER VIDEO</h3>
          <ul className="space-y-4 mb-">
            <li>
              All
            </li>
          </ul>
        </aside>
    
    
      {
        posts.length === 0 && (
          <p className="text-black lg:ml-96 translate-y-40 sm:translate-y-0 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-xl font-bold ">
            No Video Available
          </p>
         )
      }
     

      <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
      {posts.map(post => (
        <PostCardVideo key={post.id} post={post} setPosts={setPosts} 
        image={image} setImage={setImage}  showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        postComments={postComments} setPostComments={setPostComments} loading={loading} setLoading={setLoading}
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
