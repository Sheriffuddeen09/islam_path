import { useParams } from "react-router-dom";
import { useAuth } from "../layout/AuthProvider";
import ProfileId from "./ProfileId";

export default function ProfileRouter({handleMessageOpen, requestStatus, chats,
  image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
        newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList
}) {
  const { id } = useParams();
  const { user } = useAuth();

  
  return (
    <div>
      <ProfileId profileId={id} handleMessageOpen={handleMessageOpen} requests={requestStatus}
       chats={chats} 
      image={image} setImage={setImage}
      postComments={postComments} setPostComments={setPostComments} loading={loading} 
      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      />
    </div>
  )
}
