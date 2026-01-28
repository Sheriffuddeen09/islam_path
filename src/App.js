import { Route, Routes, useLocation, Outlet } from "react-router-dom";

import LoginPage from "./Form/LoginPage";
import RegisterPage from "./Form/Register";
import HomePage from './pages/Home'
import NotFound from "./layout/Notfound";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Form/ForgetPassword";
import ResetPassword from "./Form/ResetPassword";
import TeacherOnboarding from "./Form/TeacherOnboarding";
import AdminChoice from "./Form/AdminChoice";
import GetMentor from "./pages/GetMentor";
import TeacherDashboardLayout from "./teacherdashboard/TeacherDashboard";
import {  useState } from "react";
import ProtectedRoute from "./ProtectedRoute";
import VideoPlayerId from "./pages/video/VideoPlayerId";
import VideoPageApi from "./pages/video/VideoPageApi";
import ProtectRoute from "./route/ProtectRouter";
import ReportList from "./report/ReportList";
import ReportChat from "./chat/ReportChat";
import StudentAssignment from "./assignment/StudentAssignment";
import StudentExam from "./exam/StudentExam";
import StudentDashboard from "./studentdashboard/StudentDashboard";
import ExpiredPage from "./assignment/ExpiredPage";
import AssignmentBlock from "./assignment/Block";
import ExamBlock from "./exam/Block";
import StudentFriend from "./pages/friend/StudentFriend";
import AdminFriend from "./pages/friend/AdminFriend"
import ProfileRouter from "./route/ProfileRoute";
import StudentAssignmentResult from "./assignment/StudentAssignmentResult";
import StudentExamResult from "./exam/StudentExamResult";
import Navbar from "./layout/Header";
import AppImage from "./imagecrop/App";

   
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
    const [messageOpen, setMessageOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null);


    const handleMessageOpen = (studentId) => {
      setActiveChat(studentId);
      setMessageOpen(true); // always open, not toggle
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
          setActiveChat={setActiveChat}
          setMessageOpen={setMessageOpen}  />}>

      {/* Home Page*/}
      <Route path="/" element={
          // <HomePage posts={posts} setPosts={setPosts} />
          <AppImage />
      } />

      <Route path="/get-mentor" element={
          <GetMentor teachers={teachers} setTeachers={setTeachers} setRequestStatus={setRequestStatus}
          requestStatus={requestStatus} />
      } />

      <Route path="/report-list" element={
          <ReportList />
      } />

      <Route path="/report-chat" element={
          <ReportChat />
      } />


      <Route path="/student-friend" element={
          <StudentFriend students={students} setStudents={setStudents} 
          incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
           />
      } />

      <Route path="/admin-friend" element={
          <AdminFriend admins={admins} setAdmins={setAdmins} 
          incomingRequests={incomingRequests} setIncomingRequests={setIncomingRequests}
           />
      } />

       <Route
          path="/video"
          element={
            <ProtectRoute allowedRoles={['admin', 'user']}>
              <VideoPageApi setVideos={setVideos} videos={videos} />
            </ProtectRoute>
          }
        />

      <Route
          path="/video/:id"
          element={
            <ProtectRoute allowedRoles={['admin', 'user']}>
              <VideoPlayerId />
            </ProtectRoute>
          }
        />


      {/* profile */}
      <Route path="/profile/:id" element={<ProfileRouter 
      requestStatus={requestStatus} handleMessageOpen={handleMessageOpen}/>}
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
          teachers={teachers} setTeachers={setTeachers}  />
        </ProtectedRoute>
      } />

      <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard onCreated={handleVideoCreated} handlePostCreated={handlePostCreated} user={user} setUser={setUser}
               />
            </ProtectedRoute>
          }
      />
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
  setMessageOpen
}) {
  return (
    <div>
      <Navbar
        handleMessageOpen={handleMessageOpen}
        messageOpen={messageOpen}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        setMessageOpen={setMessageOpen}
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