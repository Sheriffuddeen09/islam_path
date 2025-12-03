import { Route, Routes } from "react-router-dom";

import LoginPage from "./Form/LoginPage";
import RegisterPage from "./Form/Register";
import HomePage from './pages/Home'
import NotFound from "./layout/Notfound";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import ForgotPassword from "./Form/ForgetPassword";
import ResetPassword from "./Form/ResetPassword";
import TeacherOnboarding from "./Form/TeacherOnboarding";
import AdminChoice from "./Form/AdminChoice";
import GetMentor from "./pages/GetMentor";
import CheckLogin from "./Form/CheckLogin";
import TeacherDashboardLayout from "./teacherdashboard/TeacherDashboard";

   
function App() {

  
  return (
    <div className="">
      <Routes>

        {/* register */}
      <Route path="/register" element={
        
        <RegisterPage />
       
      } />

      {/* login */}
      <Route path="/login" element={
        <LoginPage />
    } />

      {/* Home Page*/}
      <Route path="/" element={
          <HomePage />
      } />

      {/* Forget Password */}
      <Route path="/forget-password" element={
          <ForgotPassword />
      } />

      {/* Forget Password */}
      <Route path="/reset-password" element={
          <ResetPassword />
      } />

      <Route path="/teacher-form" element={
          <TeacherOnboarding />
      } />

      <Route path="/terms-form" element={
          <AdminChoice />
      } />

      <Route path="/get-mentor" element={
          <GetMentor />
      } />

      <Route path="/user-status" element={
          <CheckLogin />
      } />

      <Route path="/dashboard" element={
          <TeacherDashboardLayout />
      } />

       <Route path="*" element={<NotFound />} />

      </Routes>
        <ToastContainer />
    </div>
  );
}

export default App;
