import { Route, Routes, Outlet } from "react-router-dom";
import LoginPage from "./Form/LoginPage";
import RegisterPage from "./Form/Register";
import HomePage from './pages/homepageComponent/Home'
import NotFound from "./layout/Notfound";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Form/ForgetPassword";
import ResetPassword from "./Form/ResetPassword";
import TeacherOnboarding from "./Form/TeacherOnboarding";
import AdminChoice from "./Form/AdminChoice";
import GetMentor from "./pages/mentor/GetMentor";
import TeacherDashboardLayout from "./teacherdashboard/TeacherDashboard";
import {  useEffect, useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import ProtectRoute from "./route/ProtectRouter";
import ReportList from "./report/ReportList";
import ReportChat from "./chat/ReportChat";
import StudentAssignment from "./assignment/StudentAssignment";
import StudentExam from "./exam/StudentExam";
import StudentDashboard from "./studentdashboard/StudentDashboard";
import ExpiredPage from "./assignment/ExpiredPage";
import AssignmentBlock from "./assignment/Block";
import ExamBlock from "./exam/Block";
import ProfileRouter from "./route/ProfileRoute";
import StudentAssignmentResult from "./assignment/StudentAssignmentResult";
import StudentExamResult from "./exam/StudentExamResult";
import Navbar from "./layout/Header";
import PostImagePageId from "./pages/post/PostImagePageId";
import PostFeedVideo from "./pages/post/PostFeedVideo";
import PostVideoPageId from "./pages/post/PostVideoPageId";
import PostTextPageId from "./pages/post/PostTextPageId";
import QuranGrid from "./pages/homepageComponent/QuranGrid";
import Friend from "./pages/friend/Friend";
import PostId from "./pages/post/PostId";
import api from "./Api/axios";
import Notifications from "./pages/notification/Notifications";
import ChatReportUser from "./report/ChatReportUser";
import PostReportUser from "./report/PostReportUser";
import CommentReportUser from "./report/CommentReportUser";
import ProductPage from "./pages/sales/Product";
import SingleProduct from "./pages/sales/SingleProduct";

   
function App() {

    const [choice, setChoice] = useState(""); 
    const [selected, setSelected] = useState("");  
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [admins, setAdmins] = useState([])
    const [incomingRequests, setIncomingRequests] = useState([]);

    const [user, setUser] = useState(null);

    const [videos, setVideos] = useState([]);
    const [posts, setPosts] = useState([]);

    const [requestStatus, setRequestStatus] = useState({});

    // Chat
    const [chats, setChats] = useState([]);
    const [messageOpen, setMessageOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);

    // Post 

      const [image, setImage] = useState(null);
      const [postComments, setPostComments] = useState([])
      const [loading, setLoading] = useState(false)
      const [showUsersPopup, setShowUsersPopup] = useState(false);
      const [newComment, setNewComment] = useState('');
      const [showEmoji, setShowEmoji] = useState(false);
      const [emojiList, setEmojiList] = useState(['❤️','👍','😂','😮','😢','🔥']);
      const [post, setPost] = useState(null);

      const [friendCount, setFriendCount] = useState(0);
      const [homeCount, setHomeCount] = useState(0);
      const [videoCount, setVideoCount] = useState(0);
      const [unreadCount, setUnreadCount] = useState(0);
      const [unreadNotification, setUnreadNotification] = useState(0);


      // Product

        const [products, setProducts] = useState([]);
      
      

           // ================= FETCH FUNCTIONS =================
      const fetchPostCounts = async () => {
        const res = await api.get("/api/post-count");
        setHomeCount(res.data.home_count);
        setVideoCount(res.data.video_count);
      };

      const fetchFriendCount = async () => {
        const res = await api.get("/api/friend-request-count");
        setFriendCount(res.data.count);
      };

      const fetchUnreadCount = async () => {
        const res = await api.get("/api/messages/unread-count");
        setUnreadCount(res.data.message);
      };

      const fetchUnreadNotification = async () => {
        const res = await api.get('/api/unread-notifications-count');
        setUnreadNotification(res.data.notification);
      };

      // CLEAR ON PAGE LOAD

      const handleFriendClick = async () => {
        if (friendCount > 0) {
          await api.post("/api/friend-request-clear");
          setFriendCount(0);
        }
      };

      const handleHomeClick = async () => {
        if (homeCount > 0) {
          await api.post("/api/clear-home-posts");
          setHomeCount(0);
        }
      };

      const handleVideoClick = async () => {
          
          if (videoCount > 0) {
           await api.post("/api/clear-video-posts");
          setVideoCount(0);
        }
        };

        const handleNotification = async () => {
          
          if (unreadNotification > 0) {
           await api.post("/api/unread-notifications-clear");
          setUnreadNotification(0);
        }
        };

        const handleMessageClick = async () => {
          await api.post("/api/messages/clear-unread");
          setUnreadCount(0);
        };

      // FETCH + POLLING
      useEffect(() => {
        fetchPostCounts();
        fetchUnreadCount();
        fetchFriendCount();
        fetchUnreadNotification()

        const interval = setInterval(() => {
          fetchUnreadCount();
          fetchFriendCount();
        }, 8000);

        return () => clearInterval(interval);
      }, []);


    const handleMessageOpen = (studentId) => {
      if (!studentId) return; // ✅ block
      setActiveChat(studentId);
      setMessageOpen(true);
    };


   const handleMessageOpenHeader = async () => {
      setActiveChat(null);
      setMessageOpen(true);

      try {
        await api.post("/api/messages/clear-unread");
      } catch (error) {
        console.log("Failed to mark messages as read");
      }
    };


    // 🔥 This function receives the new video from AdminVideoForm
    const handleVideoCreated = (newVideo) => {
      setVideos((prev) => [newVideo, ...prev]); // Update UI instantly
    };

    const handlePostCreated = (newPost) => {
      setPosts((prev) => [newPost, ...prev]); // Update UI instantly
    };

  
  return (
    <div className="">

      <Routes>
    <Route element={<LayoutWithHeader
          handleMessageOpen={handleMessageOpen}
          messageOpen={messageOpen}
          activeChat={activeChat}
          chats={chats}
          setChats={setChats}
          setActiveChat={setActiveChat}
          setMessageOpen={setMessageOpen} 
          handleMessageOpenHeader={handleMessageOpenHeader}
          unreadCount={unreadCount} setUnreadCount={setUnreadCount}
          friendCount={friendCount} setFriendCount={setFriendCount}
          homeCount={homeCount} setHomeCount={setHomeCount}
          videoCount={videoCount} setVideoCount={setVideoCount}
          fetchUnreadCount={fetchUnreadCount}
          handleFriendClick={handleFriendClick}
          handleHomeClick={handleHomeClick}
          handleVideoClick={handleVideoClick}
          handleMessageClick={handleMessageClick}
          handleNotification={handleNotification}
          unreadNotification={unreadNotification}
          setUnreadNotification={setUnreadNotification}
          />}>

      
      <Route path="/post//" element={<PostId 
        image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loading={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
      />} />

      {/* Video */}

       <Route path="/post/video" element={
        <PostFeedVideo posts={posts} setPosts={setPosts} image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loading={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        
         />   
      } />

      <Route path="/get-mentor" element={
          <GetMentor teachers={teachers} setTeachers={setTeachers} setRequestStatus={setRequestStatus}
          requestStatus={requestStatus} />
      } />

      <Route path="/quran" element={
          <QuranGrid />
      } />

      <Route path="/notifications" element={
          <Notifications handleMessageOpen={handleMessageOpen} />
      } />

      <Route path="/chat/report/:chatId" element={<ChatReportUser />} />

      <Route path="/post/report/:postId" element={<PostReportUser />} />

      <Route path="/comment/report/:commentId" element={<CommentReportUser />} />

      <Route path="/report-list" element={
          <ReportList />
      } />

      <Route path="/report-chat" element={
          <ReportChat />
      } />

      <Route path="/online-sale" element={
          <ProductPage products={products} setProducts={setProducts} />
      } />

      <Route path="/product/:id" element={
          <SingleProduct products={products} setProducts={setProducts} />
      } />


      <Route path="/friend" element={
          <Friend students={students} setStudents={setStudents} admins={admins} setAdmins={setAdmins}
          incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
           />
      } />


      {/* profile  */}
      <Route path="/profile//" element={<ProfileRouter 
      requestStatus={requestStatus} handleMessageOpen={handleMessageOpen}
      chats={chats} 
      image={image} setImage={setImage}
      postComments={postComments} setPostComments={setPostComments} loading={loading} 
      setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
      newComment={newComment} setNewComment={setNewComment}
      showEmoji={showEmoji} setShowEmoji={setShowEmoji}
      emojiList={emojiList} setEmojiList={setEmojiList}
      />}
       />


        <Route path="/student/assignment/result/:resultId" element={<StudentAssignmentResult />} />
        <Route path="/student/exams/result/:resultId" element={<StudentExamResult />} />

      
{/* /student/assignment/result/ */}


      {/* register */}
      <Route path="/register" element={
        
        <RegisterPage />
       
      } />

      {/* login */}
      <Route path="/login" element={
        <LoginPage />
      } />

      {/* Forget Password */}
      <Route path="/forget-password" element={
          <ForgotPassword />
      } />

      {/* Forget Password */}
      <Route path="/reset-password" element={
          <ResetPassword />
      } />


      {/* Student Assignment */}

      <Route
          path="/student/assignment/:token"
          element={<StudentAssignment />}
        />

        <Route
          path="/student/exams/:token"
          element={<StudentExam />}
        />

        <Route
          path="/expire"
          element={<ExpiredPage />}
        />

         <Route
          path="/block"
          element={<AssignmentBlock />}
        />

        <Route
          path="/block"
          element={<ExamBlock />}
        />

      <Route 
          path="/admin/teacher-form" 
          element={<TeacherOnboarding onProfileCompleted={setUser} />} 
        />

      <Route path="/admin/choose-choice" element={
          <AdminChoice setChoice={setChoice} choice={choice} isLoading={isLoading} setIsLoading={setIsLoading}
          currentUser={currentUser} setCurrentUser={setCurrentUser} selected={selected} setSelected={setSelected}/>
      } />
    </Route>
    <Route element={<LayoutWithOutHeader />}>
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <TeacherDashboardLayout onCreated={handleVideoCreated} handlePostCreated={handlePostCreated} user={user} setUser={setUser}
          teachers={teachers} setTeachers={setTeachers} chats={chats} 
          image={image} setImage={setImage}
          postComments={postComments} setPostComments={setPostComments} loading={loading} 
          setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
          newComment={newComment} setNewComment={setNewComment}
          showEmoji={showEmoji} setShowEmoji={setShowEmoji}
          emojiList={emojiList} setEmojiList={setEmojiList}
          />
        </ProtectedRoute>
      } />

      <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard onCreated={handleVideoCreated} handlePostCreated={handlePostCreated} user={user} setUser={setUser}
              chats={chats} 
              image={image} setImage={setImage}
              postComments={postComments} setPostComments={setPostComments} loading={loading} 
              setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
              newComment={newComment} setNewComment={setNewComment}
              showEmoji={showEmoji} setShowEmoji={setShowEmoji}
              emojiList={emojiList} setEmojiList={setEmojiList}
               />
            </ProtectedRoute>
          }
      />
      <Route path="/post/image//" element={<PostImagePageId image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats}
        />} />

        <Route path="/post/video//" element={<PostVideoPageId image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats}

        />} />

         <Route path="/post/text//" element={<PostTextPageId image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loadingComment={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        post={post} setPost={setPost} postId={post?.id}
        chats={chats}

        />} />


          {/* Home Post Page*/}
      <Route path="/" element={
      <HomePage posts={posts} setPosts={setPosts} image={image} setImage={setImage}
        postComments={postComments} setPostComments={setPostComments} loading={loading} 
        setLoading={setLoading} showUsersPopup={showUsersPopup} setShowUsersPopup={setShowUsersPopup}
        newComment={newComment} setNewComment={setNewComment}
        showEmoji={showEmoji} setShowEmoji={setShowEmoji}
        emojiList={emojiList} setEmojiList={setEmojiList}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        handleMessageOpen={handleMessageOpen} 
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        handleMessageOpenHeader={handleMessageOpenHeader}
        unreadCount={unreadCount} setUnreadCount={setUnreadCount}
        friendCount={friendCount} setFriendCount={setFriendCount}
        homeCount={homeCount} setHomeCount={setHomeCount}
        videoCount={videoCount} setVideoCount={setVideoCount}
        fetchUnreadCount={fetchUnreadCount}
        handleFriendClick={handleFriendClick}
        handleHomeClick={handleHomeClick}
        handleVideoClick={handleVideoClick}
        handleMessageClick={handleMessageClick}
        handleNotification={handleNotification}
        unreadNotification={unreadNotification}
        setUnreadNotification={setUnreadNotification}
        
         />   
      } />

        </Route>

    
       <Route path="*" element={<NotFound />} />

      </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { zIndex: 9999 },
          }}
        />
    </div>
  );
}

export default App;

function LayoutWithHeader({
  handleMessageOpen,
  messageOpen,
  activeChat,
  setActiveChat,
  setMessageOpen,
  chats, 
  setChats,
  handleMessageOpenHeader,
  unreadCount,
  setUnreadCount,
  friendCount,
  setFriendCount,
  homeCount,
  setHomeCount,
  videoCount, setVideoCount,
  fetchUnreadCount,
  handleFriendClick,
  handleHomeClick,
  handleVideoClick,
  handleMessageClick,
  handleNotification,
  unreadNotification,
  setUnreadNotification
}) {
  return (
    <div>
      <Navbar
        handleMessageOpen={handleMessageOpen}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        messageOpen={messageOpen}
        setMessageOpen={setMessageOpen}
        chats={chats}
        setChats={setChats}
        handleMessageOpenHeader={handleMessageOpenHeader}
        unreadCount={unreadCount} setUnreadCount={setUnreadCount}
        friendCount={friendCount} setFriendCount={setFriendCount}
        homeCount={homeCount} setHomeCount={setHomeCount}
        videoCount={videoCount} setVideoCount={setVideoCount}
        fetchUnreadCount={fetchUnreadCount}
        handleFriendClick={handleFriendClick}
        handleHomeClick={handleHomeClick}
        handleVideoClick={handleVideoClick}
        handleMessageClick={handleMessageClick}
        handleNotification={handleNotification}
        unreadNotification={unreadNotification}
        setUnreadNotification={setUnreadNotification}
      />

      {/* 🔥 THIS IS REQUIRED */}
      <Outlet />
    </div>
  );
}


function LayoutWithOutHeader() {

  return (
    <div>
        <Outlet />
    </div>
  )
}