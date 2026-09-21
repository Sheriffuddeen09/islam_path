import SingleHeader from "../../layout/SingleHeader";
import PostFeed from "../post/PostFeed";


export default function HomePage({posts, setPosts, image, setImage, postComments,
   setPostComments, loading, setLoading, setShowUsersPopup, showUsersPopup, emojiList, setEmojiList, 
    showEmoji, setShowEmoji, newComment, setNewComment, messageOpen, setMessageOpen, chats, setChats,
    handleMessageOpen, activeChat, handleMessageOpenHeader, setActiveChat, setUnreadCount, unreadCount,
    friendCount, setFriendCount, homeCount, setHomeCount, videoCount, setVideoCount, fetchUnreadCount,
    handleFriendClick, handleVideoClick, handleHomeClick, handleMessageClick, handleNotification, unreadNotification,
    setUnreadNotification, messagesMap, setMessagesMap, setUiMode, uiMode, togglePopup, showSettings,
    setShowSettings, setMessages, callMode, setCallMode, incomingCall, setIncomingCall, meetingData, setMeetingData,
    fetchJobProfile, show, setShow, jobProfile, setJobProfile, showSuccessModal, setShowSuccessModal,
    setShowAdvertisement, showAdvertisement, showJobCreate, setShowJobCreate, handlePostCreated,
    handleReelCreated, reelUsers, setReelUsers, myReels, setMyReels, handleReelClick, reelCount,
    error, reelLoading, fetchMyReel, fetchReels, commentsByPost, setCommentsLoaded, openUserReels, setMessage, message,
    setSelectedReelIndex, selectedReelIndex, setSelectedUserIndex, selectedUserIndex, setProgress, progress, setMediaIndex,
    mediaIndex, setShowOptions, showOptions, setReaction, reaction, sending, setSending, closeViewer, nextReel, 
    previousReel, selectedReel, selectedUser, markReelViewed, open, setOpen, openReport, setOpenReport,
    showImagePicker, setShowImagePicker, messageOpenShare, setMessageOpenShare, shares, setShares
  }) {


  return (
    <div>
      <SingleHeader handleMessageOpen={handleMessageOpen} messageOpen={messageOpen} unreadCount={unreadCount} 
      setUnreadCount={setUnreadCount} friendCount={friendCount} setFriendCount={setFriendCount}
      homeCount={homeCount} setHomeCount={setHomeCount}
      videoCount={videoCount} setVideoCount={setVideoCount}
      fetchUnreadCount={fetchUnreadCount} handleMessageClick={handleMessageClick}
      handleFriendClick={handleFriendClick}
      handleHomeClick={handleHomeClick}
      handleVideoClick={handleVideoClick} handleNotification={handleNotification}
      unreadNotification={unreadNotification}
      setUnreadNotification={setUnreadNotification}
      setMessageOpen={setMessageOpen} activeChat={activeChat} setActiveChat={setActiveChat}
      chats={chats} setChats={setChats} handleMessageOpenHeader={handleMessageOpenHeader}
      messagesMap={messagesMap}
      setMessagesMap={setMessagesMap}
      setUiMode={setUiMode}
      uiMode={uiMode}
      togglePopup={togglePopup}
      showSettings={showSettings} 
      setShowSettings={setShowSettings} setMessages={setMessages}
      setCallMode={setCallMode}
      callMode={callMode}
      setIncomingCall={setIncomingCall}
      incomingCall={incomingCall}
      setMeetingData={setMeetingData}
      meetingData={meetingData}
      jobProfile={jobProfile}
      setJobProfile={setJobProfile}
      fetchJobProfile={fetchJobProfile}
      show={show}
      setShow={setShow}
      showSuccessModal={showSuccessModal} 
      setShowSuccessModal={setShowSuccessModal}
      showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
      showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
      handleReelClick={handleReelClick} reelCount={reelCount}
      reelUsers={reelUsers} openUserReels={openUserReels}
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares}
        setMyReels={setMyReels}
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


      <PostFeed posts={posts} setPosts={setPosts} 
      image={image} setImage={setImage} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      postComments={postComments} setPostComments={setPostComments} commentsByPost={commentsByPost}
      setCommentsLoaded={setCommentsLoaded}
      loading={loading} setLoading={setLoading}
      messageOpen={messageOpen}
      setMessageOpen={setMessageOpen}
      chats={chats}
      setChats={setChats}
      jobProfile={jobProfile}
      setJobProfile={setJobProfile}
      fetchJobProfile={fetchJobProfile}
      show={show}
      setShow={setShow} handlePostCreated={handlePostCreated}
      showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
      showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
      handleReelCreated={handleReelCreated}
      myReels={myReels}
      setMyReels={setMyReels}
      reelUsers={reelUsers}
      setReelUsers={setReelUsers}
      handleVideoClick={handleVideoClick}
      videoCount={videoCount}
      error={error}
      reelLoading={reelLoading}
      fetchReels={fetchReels}
      fetchMyReel={fetchMyReel}
      openUserReels={openUserReels}
        setSelectedReelIndex={setSelectedReelIndex}
        selectedReelIndex={selectedReelIndex}
        setSelectedUserIndex={setSelectedUserIndex}
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
        sending={sending} setSending={setSending} closeViewer={closeViewer} nextReel={nextReel} 
        previousReel={previousReel} selectedReel={selectedReel} selectedUser={selectedUser}
        markReelViewed={markReelViewed} open={open} setOpen={setOpen} openReport={openReport}
        setOpenReport={setOpenReport} showImagePicker={showImagePicker} setShowImagePicker={setShowImagePicker}
        messageOpenShare={messageOpenShare} setMessageOpenShare={setMessageOpenShare}  shares={shares}
        setShares={setShares}
       />
    </div>
  )
}