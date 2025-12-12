import { Route, Routes, useNavigate } from "react-router-dom";

import LoginPage from "./Form/LoginPage";
import RegisterPage from "./Form/Register";
import HomePage from './pages/Home'
import NotFound from "./layout/Notfound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ForgotPassword from "./Form/ForgetPassword";
import ResetPassword from "./Form/ResetPassword";
import TeacherOnboarding from "./Form/TeacherOnboarding";
import AdminChoice from "./Form/AdminChoice";
import GetMentor from "./pages/GetMentor";
import TeacherDashboardLayout from "./teacherdashboard/TeacherDashboard";
import {  useState } from "react";
import StudentDashboardLayout from "./studentdashboard/StudentDashboard";
import ProtectedRoute from "./ProtectedRoute";
import RouteChangeWrapper from "./route/RouteChangeWrapper";
import VideoPlayerId from "./pages/video/VideoPlayerId";
import { useAuth } from "./layout/AuthProvider"; // Example auth hook
import VideoPageApi from "./pages/video/VideoPageApi";

   
function App() {

    const [choice, setChoice] = useState(""); 
    const [selected, setSelected] = useState("");  
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { authUser } = useAuth();

    const [videos, setVideos] = useState([]);

    // 🔥 This function receives the new video from AdminVideoForm
    const handleVideoCreated = (newVideo) => {
      setVideos((prev) => [newVideo, ...prev]); // Update UI instantly
    };

  
  return (
    <div className="">
      <RouteChangeWrapper>
      <Routes>

      {/* Home Page*/}
      <Route path="/" element={
          <HomePage />
      } />

      <Route path="/get-mentor" element={
          <GetMentor />
      } />

       <Route
          path="/video"
          element={
            <ProtectedRoute authUser={authUser}>
              <VideoPageApi />
            </ProtectedRoute>
          }
        />

      <Route
          path="/video/:id"
          element={
            <ProtectedRoute authUser={authUser}>
              <VideoPlayerId />
            </ProtectedRoute>
          }
        />


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

      <Route path="/admin/teacher-form" element={
          <TeacherOnboarding />
      } />

      <Route path="/admin/choose-choice" element={
          <AdminChoice setChoice={setChoice} choice={choice} isLoading={isLoading} setIsLoading={setIsLoading}
          currentUser={currentUser} setCurrentUser={setCurrentUser} selected={selected} setSelected={setSelected}/>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <TeacherDashboardLayout choice={choice} onCreated={handleVideoCreated} />
        </ProtectedRoute>
      } />

      <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboardLayout />
            </ProtectedRoute>
          }
      />


       <Route path="*" element={<NotFound />} />

      </Routes>
        <ToastContainer />
      </RouteChangeWrapper>
    </div>
  );
}

export default App;
