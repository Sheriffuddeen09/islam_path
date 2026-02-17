import PostFeed from "../post/PostFeed";


export default function HomePage({posts, setPosts, image, setImage, postComments,
   setPostComments, loading, setLoading, setShowUsersPopup, showUsersPopup, emojiList, setEmojiList, 
    showEmoji, setShowEmoji, newComment, setNewComment, messageOpen, setMessageOpen, chats, setChats
  }) {


  return (
    <div>
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
      setChats={setChats} />
    </div>
  )
}