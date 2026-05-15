import { Home, KeyRound, Loader2, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import dua_success from "./image/dua_success.png";
import success from "./image/path_islam.png";
import dua from "./image/dua.png";
import knowledge from "./image/dua_beneficial.png";
import ImageSlider from "./ImageSlider";
import api from "../Api/axios";
import logos from './image/favicon.png'
import TextSlider from "./TextSlider";
import Notification from "../notification/Notification";



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
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const navigate = useNavigate()

  const [notify, setNotify] = useState({ message: "", type: "" });

const showNotification = (message, type = "success") => {
    setNotify({ message, type });

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
    showNotification("Email is required", "error");
    setLoading(false);
    return;
  }

  if (!email.includes("@")) {
    showNotification("Enter a valid email address", "error");
    setLoading(false);
    return;
  }

  if (!password) {
    showNotification("Password is required", "error");
    setLoading(false);
    return;
  }

  if (password.length < 6) {
    showNotification(
      "Password must be at least 6 characters",
      "error"
    );

    setLoading(false);
    return;
  }

  try {

    await api.get("/sanctum/csrf-cookie");

    const res = await api.post(
      "/api/login",
      {
        email,
        password,
        remember_me: remember,
      }
    );

    // ✅ TWO STEP REQUIRED
    if (res.data.requires_two_step) {

      navigate("/verify-two-step", {
        state: {
          user_id: res.data.user_id,
        },
      });

      return;
    }

    // ✅ NORMAL LOGIN
    if (res.data.status) {

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate(res.data.redirect);

      return;
    }

  } catch (err) {

    const res = err.response;

    // Validation error
    if (
      res?.status === 422 &&
      res.data?.errors
    ) {

      const firstError =
        Object.values(
          res.data.errors
        )[0][0];

      showNotification(
        firstError,
        "error"
      );

      return;
    }

    // Server message
    if (res?.data?.message) {

      showNotification(
        res.data.message,
        "error"
      );

      return;
    }

    // Unknown
    showNotification(
      "Something went wrong. Please try again.",
      "error"
    );

  } finally {

    setLoading(false);
  }
};

const handlePasskeyLogin = async () => {
  try {
    setPasskeyLoading(true);

    const res = await api.post("/api/passkeys/login/options", {
      email,
    });

    const options = res.data;

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: Uint8Array.from(atob(options.challenge), c =>
          c.charCodeAt(0)
        ),

        allowCredentials: options.allowCredentials.map(c => ({
          id: Uint8Array.from(atob(c.id), c => c.charCodeAt(0)),
          type: "public-key",
        })),

        userVerification: "required",
      },
    });

    const rawId = btoa(
      String.fromCharCode(...new Uint8Array(credential.rawId))
    );

    const authData = {
      id: rawId,
    };
        

    const loginRes = await api.post(
      "/api/passkeys/login/verify",
      authData
    );

    localStorage.setItem("token", loginRes.data.token);

    navigate(loginRes.data.redirect);

  } catch (err) {
    console.log(err);
    showNotification("Passkey login failed");
  } finally {
    setPasskeyLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
      {/* Top Navigation */}
     <header className="flex justify-between items-center shadow-md py-4 px-8 md:px-16 lg:px-24 border-b relative">
      {/* Left - Homepage */}
      <Link
        to="/"
        className="hidden md:flex items-center font-bold gap-2 text-[var(--text-color)] border border-blue-600 px-4 py-2 rounded-full text-sm hover:bg-gray-400 transition"
      >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg> Homepage
      </Link>

      {/* Center Logo */}
      <p className="font-bold text-[var(--text-color)] text-sm sm:text-lg font-serif flex items-center gap-3">
        <Home /> Islam Path Of Knowledge
      </p>

      {/* Right - About Us (desktop) */}
      <Link
        to="/about"
        className="hidden md:flex text-sm font-bold items-center gap-2 bg-blue-900 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition"
      >
        About Us <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4 rotate-180"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden  text-[var(--text-color)]"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} className="hidden" /> : <Menu size={28} />}
      </button>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[var(--bg-color)]/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className=" rounded-xl shadow-lg p-6 w-64 bg-[var(--bg-color)]  space-y-6 text-center">
            <X size={28} className=" text-[var(--text-color)] cursor-pointer" onClick={() => setMenuOpen(!menuOpen)} />
             <Link
              to="/"
              className="flex items-center font-bold justify-center gap-2 text-[var(--text-color)] border border-blue-600 px-3 py-3 rounded-full text-sm hover:bg-gray-400 transition"
            >
              Homepage
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4 rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg> 
            </Link>
            <Link
              to="/about"
              className="flex text-sm justify-center font-bold items-center gap-2 bg-blue-900 text-white px-3 py-3 rounded-full text-sm hover:bg-blue-700 transition"
            >
              About Us <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-4 rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
            </Link>
          </div>
        </div>
      )}
    </header>


      {/* Main Content - Login + Image */}

       <div className=" lg:hidden block pb-3 sm:mt-5 md:translate-y-40 -md:mb-60 mx-auto w-80 md:w-[600px] md:px-8 shadow-2xl rounded-2xl">
                <TextSlider texts={texts} />
              </div>

      <div className="flex flex-1 flex-col items-center lg:flex-row">
        {/* Left Section - Form */}
<div className="flex flex-1 flex-col justify-center items-center p-6">
        <div className="lg:w-full md:w-[600px] w-80 p-6 border border-blue-200 shadow-xl rounded-lg">

         
              <h2 className="text-2xl font-bold text-center text-black mb-6">
                
              </h2>

              {/* Email */}
              <div className="mb-12 relative">
                <label className="absolute -top-3 left-3 bg-[var(--bg-color)] text-[var(--text-color)] px-1 text-sm  font-bold">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border-2 bg-[var(--bg-color)] text-[var(--text-color)] outline-0 focus:bg-[var(--bg-color)] text-[var(--text-color)] border-blue-200 px-4 py-3 rounded"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                />
                
              </div>

              {/* Password */}
              <div className="mb-6 relative">
                <label className="absolute -top-3 left-3 bg-[var(--bg-color)] text-[var(--text-color)] px-1 text-sm  font-bold">
                  Password
                </label>
                <input
                className="w-full border-2 bg-[var(--bg-color)] text-[var(--text-color)] outline-0 focus:bg-[var(--bg-color)] text-[var(--text-color)] border-blue-200 px-4 py-3 rounded"
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
              <label className="flex items-center text-sm gap-2 mb-6 text-[var(--text-color)]">
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

            <div className="flex items-center mt-5 mb-3 gap-4">
              <div className="flex-1 h-px bg-gray-300 h-0.5"></div>
              <p className="text-sm text-[var(--text-color)]">OR CONTINUE WITH</p>
              <div className="flex-1 h-px bg-gray-300 h-0.5"></div>
            </div>
            <button
                onClick={handlePasskeyLogin}
                disabled={passkeyLoading}
                className="text-sm mx-auto bg-[var(--bg-color)] 
                text-[var(--text-color)] font-bold flex justify-center mb-4 items-center gap-2 px-4 py-2 rounded-lg"
              >
                {passkeyLoading ? (
                  <>
                  <Loader2 className="animate-spin" size={18} />
                  Login Processing
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Login with Passkeys
                  </>
                )}
              </button>


            <p className="text-center text-xs text-[var(--text-color)]">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-500 text-xs font-semibold">
                Create Account
              </Link>
            </p>
            {notify.message && (
              <Notification
                message={notify.message}
                type={notify.type} // "success" = green, "error" = red
                onClose={() => setNotify({ message: "", type: "" })}
              />
            )}

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
