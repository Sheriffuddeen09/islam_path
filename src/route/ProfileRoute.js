



import { useParams } from "react-router-dom";
import { useAuth } from "../layout/AuthProvider";
import ProfileId from "./ProfileId";

export default function ProfileRouter({handleMessageOpen, requestStatus, chats,
  image, setImage, postComments, setPostComments, loading, setLoading, showUsersPopup, setShowUsersPopup,
  newComment, setNewComment, showEmoji, setShowEmoji, emojiList, setEmojiList, openChat, togglePopup,
  setActiveChat, setMessages, jobProfile, setJobProfile, fetchJobProfile, show, setShow, showAdvertisement,
  setShowAdvertisement, showJobCreate, setShowJobCreate, user, commentsByPost, setCommentsByPost, reelUsers,
  openUserReels, sending, setSending, closeViewer, nextReel, previousReel, selectedReel, selectedUser, markReelViewed,
  open, setOpen, openReport, setOpenReport, showImagePicker, setShowImagePicker, messageOpenShare,
  setMessageOpenShare, shares, setShares, setMyReels, setReelUsers, selectedReelIndex, selectedUserIndex, setMediaIndex,
  mediaIndex, setProgress, progress, setMessage, message, setReaction, reaction, setShowOptions, showOptions,
  video, setVideo
}) {

  
  const { id } = useParams();

  
  return (
    <div>
      <ProfileId profileId={id} handleMessageOpen={handleMessageOpen} requests={requestStatus}
       chats={chats} setMessages={setMessages} setActiveChat={setActiveChat}
      image={image} setImage={setImage} video={video} setVideo={setVideo} openChat={openChat} togglePopup={togglePopup}
      postComments={postComments} setPostComments={setPostComments} loading={loading} 
      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment} commentsByPost={commentsByPost}
      setCommentsByPost={setCommentsByPost}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      jobProfile={jobProfile}
      setJobProfile={setJobProfile}
      fetchJobProfile={fetchJobProfile}
      show={show}
      setShow={setShow} user={user}
      showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
      showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
      reelUsers={reelUsers} openUserReels={openUserReels}
      sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
      previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
      markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
      setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
      messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
      setShares={setShares} setMyReels={setMyReels}
        setReelUsers={setReelUsers}
        selectedReelIndex={selectedReelIndex}
        selectedUserIndex={selectedUserIndex}
        setMediaIndex={setMediaIndex}
        mediaIndex={mediaIndex}
        setProgress={setProgress}
        progress={progress}
        setMessage={setMessage}
        message={message}
        setReaction={setReaction}
        reaction={reaction}
        setShowOptions={setShowOptions}
        showOptions={showOptions}
      />
    </div>
  )
}
