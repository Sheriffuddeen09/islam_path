import {Home, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import dua_success from "./image/dua_success.png";
import success from "./image/path_islam.png";
import dua from "./image/dua.png";
import knowledge from "./image/dua_beneficial.png";
import ImageSlider from "./ImageSlider";
import api from "../Api/axios";
import logos from './image/favicon.png'
import TextSlider from "./TextSlider";
import Notification from "./Notification";



const texts = [
    {
      id: 1,
      title: "O Allah benefit me with what you taught me, and teach me that which will benefit me, and grant me knowledge which will benefit me",
    },
    {
      id: 2,
      title: "O Allah, I ask you for beneficiary knowledge, goodly provision and acceptable deeds",
    },
    {
      id: 3,
      title: "My Lord, truly I am in need of whatever good you bestow upon me",
    },
    {
      id: 4,
      title: "My Lord, Increase me in Knowledge",
    }
  ]


export default function LoginPage() {

 const [menuOpen, setMenuOpen] = useState(false);

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate()

  const [notify, setNotify] = useState({ message: "", type: "" });

const showNotification = (msg) => {
  setNotify({ message: msg, type: "error" });

  // Clear after 5 seconds
  setTimeout(() => {
    setNotify({ message: "", type: "" });
  }, 5000);
};

// Clear error for a field
const clearError = (field) => {
  setErrors(prev => ({ ...prev, [field]: '' }));
}

const loginUser = async () => { 
  setLoading(true);

  // Local validation
  if (!email) {
    showNotification("Email is required");
    return;
  }
  if (!email.includes("@")) {
    showNotification("Enter a valid email address");
    return;
  }
  if (!password) {
    showNotification("Password is required");
    return;
  }
  if (password.length < 6) {
    showNotification("Password must be at least 6 characters");
    return;
  }

  try {
    await api.get("/sanctum/csrf-cookie");
    const res = await api.post("/api/login", { email, password, remember_me: remember });

    localStorage.setItem("token", res.data.token);
    
    // No success notification, just redirect
    navigate(res.data.redirect);

  } catch (err) {
    const res = err.response;

    // Validation error from backend
    if (res?.status === 422 && res.data?.errors) {
      const firstError = Object.values(res.data.errors)[0][0];
      showNotification(firstError);
      return;
    }

    // Server error
    if (res?.status === 500 && res.data?.message) {
      showNotification(res.data.message);
      return;
    }

    // Unknown error
    showNotification("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navigation */}
      <header className="flex justify-between items-center shadow-md py-4 px-4 md:px-16 lg:px-24 border-b relative">
      {/* Left - Homepage */}
      <Link
        to="/"
        className="hidden md:flex items-center gap-2 text-black border border-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition"
      >
        ← Homepage
      </Link>

      {/* Center Logo */}
       <p className="font-bold text-black text-[15px] font-serif flex items-center gap-3">
        <Link to={'/'}>
              <img src={logos} alt='logo' width={30} height={30}/>
              </Link> Islam Path Of Knowledge
      </p>

      {/* Right - About Us (desktop) */}
      <Link
        to="/about"
        className="hidden md:block bg-blue-900 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition"
      >
        About Us →
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-black"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} className="hidden" /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-64  space-y-6 text-center">
            <X size={28} className="text-black" onClick={() => setMenuOpen(!menuOpen)} />
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block text-gray-700 font-semibold  border border-blue-600 px-4 py-2 rounded-full hover:bg-gray-100 transition"
            >
              ← Homepage
            </Link>
            <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className="block bg-blue-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            >
              About Us →
            </Link>
          </div>
        </div>
      )}
    </header>

      {/* Main Content - Login + Image */}

       <div className=" text lg:hidden block pb-3 mt-5 md:translate-y-40 -md:mb-60 mx-auto w-80 md:w-[600px] md:px-8 shadow-2xl rounded-2xl">
                <TextSlider texts={texts} />
              </div>

      <div className="flex flex-1 flex-col items-center lg:flex-row">
        {/* Left Section - Form */}
<div className="flex flex-1 flex-col justify-center items-center p-6">
        <div className="lg:w-full md:w-[600px] w-80 p-6 border border-blue-200 shadow-xl rounded-lg">

         
              <h2 className="text-2xl font-bold text-center text-black mb-6">
                
              </h2>

              {/* Email */}
              <div className="mb-6 relative">
                <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-blue-500 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border bg-white outline-0 focus:bg-white border-blue-200 text-black px-4 py-3 rounded"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                />
                
              </div>

              {/* Password */}
              <div className="mb-6 relative">
                <label className="absolute -top-3 left-3 bg-white px-1 text-sm text-blue-500 font-bold">
                  Password
                </label>
                <input
                  className="w-full border bg-white outline-0 border-blue-200 text-black px-4 py-3 rounded"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");}}
                />
                <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-4 text-gray-500"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 104.5 4.5M9.75 14.25l4.5-4.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          )}
        </button>
              {errors.email && (
                        <p className="text-red-600 text-xs mt-2">{errors.email}</p>
                      )}
              </div>

              {/* Remember Me */}
              <div className="flex justify-between pt-2 items-center text-xs mt-2">
              <label className="flex items-center text-sm gap-2 mb-6 text-black">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>
              <Link to={'/forget-password'} className="text-blue-500 -translate-y-3 font-semibold hover:text-blue-700">
                Forgot Password?
              </Link>
              </div>

              {/* NEXT */}
              <button
                onClick={loginUser}
                className="w-full bg-blue-700 text-white py-3 mx-auto rounded hover:bg-blue-800 hover:scale-105"
              >
                 {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white mx-auto"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : ( "Login") 
  }
              </button>

               <div className="flex items-center my-5 gap-4">
              <div className="flex-1 h-px bg-gray-300 h-0.5"></div>
              <p className="text-sm text-gray-500">OR CONTINUE WITH</p>
              <div className="flex-1 h-px bg-gray-300 h-0.5"></div>
            </div>

            <p className="text-center text-xs text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-900 text-xs font-semibold">
                Create Account
              </Link>
            </p>
            <Notification
  message={notify.message}
  type={notify.type}
  onClose={() => setNotify({ message: "", type: "" })}
/>

    </div>
    </div>

        {/* Right Section - Image */}
        <div className="flex-1 hidden bg-blue-500 rounded-tl-2xl shadow-2xl rounded-bl-2xl lg:flex">
          <ImageSlider images={[success,knowledge, dua, dua_success]} />
        </div>
      </div>
    </div>
  );
}
