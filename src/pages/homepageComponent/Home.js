import SingleHeader from "../../layout/SingleHeader";
import PostFeed from "../post/PostFeed";


export default function HomePage({posts, setPosts, image, setImage, postComments,
   setPostComments, loading, setLoading, setShowUsersPopup, showUsersPopup, emojiList, setEmojiList, 
    showEmoji, setShowEmoji, newComment, setNewComment, messageOpen, setMessageOpen, chats, setChats,
    handleMessageOpen, activeChat, handleMessageOpenHeader, setActiveChat, setUnreadCount, unreadCount,
    friendCount, setFriendCount, homeCount, setHomeCount, videoCount, setVideoCount, fetchUnreadCount,
    handleFriendClick, handleVideoClick, handleHomeClick
  }) {


  return (
    <div>
      <SingleHeader handleMessageOpen={handleMessageOpen} messageOpen={messageOpen} unreadCount={unreadCount} 
      setUnreadCount={setUnreadCount} friendCount={friendCount} setFriendCount={setFriendCount}
      homeCount={homeCount} setHomeCount={setHomeCount}
      videoCount={videoCount} setVideoCount={setVideoCount}
      fetchUnreadCount={fetchUnreadCount}
      handleFriendClick={handleFriendClick}
      handleHomeClick={handleHomeClick}
      handleVideoClick={handleVideoClick}
      setMessageOpen={setMessageOpen} activeChat={activeChat} setActiveChat={setActiveChat}
      chats={chats} setChats={setChats} handleMessageOpenHeader={handleMessageOpenHeader} />
      <PostFeed posts={posts} setPosts={setPosts} 
      image={image} setImage={setImage} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      postComments={postComments} setPostComments={setPostComments} 
      loading={loading} setLoading={setLoading}
      messageOpen={messageOpen}
      setMessageOpen={setMessageOpen}
      chats={chats}
      setChats={setChats}
       />
    </div>
  )
}