import { useState } from "react";
import api from "../Api/axios";
import { useNavigate } from "react-router-dom";
import TextSlider from "./TextSlider";
import Navbar from "../layout/Header";
import ImageSlider from "./ImageSlider";
import dua_success from "./image/dua_success.png";
import success from "./image/path_islam.png";
import dua from "./image/dua.png";
import knowledge from "./image/dua_beneficial.png";

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


export default function ResetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const email = urlParams.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = (value) => {
  setPassword(value);

  // Password strength rules
  if (value.length < 8) {
    setPasswordError("Password must be at least 8 characters");
  } else {
    setPasswordError("");
  }

  // Check if confirm password already typed
  if (confirm && value !== confirm) {
    setConfirmError("Passwords do not match");
  } else {
    setConfirmError("");
  }
};

const handleConfirmChange = (value) => {
  setConfirm(value);

  if (value !== password) {
    setConfirmError("Passwords do not match");
  } else {
    setConfirmError("");
  }
};

const isDisabled =
  !password ||
  !confirm ||
  passwordError ||
  confirmError;


  const handleReset = async (e) => {

    setIsLoading(true);
    e.preventDefault();

    try {
      const res = await api.post("/api/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirm
      });
      
      setMsg(res.data.message);

      // Redirect to login after short delay (e.g., 2s)
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      setMsg("Password reset failed");
    }
    finally{
        setIsLoading(false);
    }
  };

  const content = (
    <div className="flex flex-1 flex-col justify-center mt-6 items-center md:flex-row">
      
      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        <div className="lg:w-full md:w-[600px] w-80  p-6 border border-blue-200 shadow-xl rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-black text-center my-5">Reset Password</h2>

      <form onSubmit={handleReset}>
        <div className="relative mb-3 outline-none rounded border-blue-300 border">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          className="border p-2 w-full text-black"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
            <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500"
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
        </div>
        {passwordError && (
          <p className="text-red-500 text-sm mb-2">{passwordError}</p>
        )}
        
        <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="border p-2 w-full text-black rounded border-blue-300 border"
          value={confirm}
          onChange={(e) => handleConfirmChange(e.target.value)}
        />
        
            <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-3 text-gray-500"
        >
            {showConfirmPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 104.5 4.5M9.75 14.25l4.5-4.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          )}
        </button>
        </div>
        {confirmError && (
          <p className="text-red-500 text-sm mb-2">{confirmError}</p>
        )}
        <button
  disabled={isDisabled || isLoading}
  className={`bg-green-600 w-40 float-right text-white my-5 px-4 py-2 rounded ${
    isDisabled ? "opacity-70 cursor-not-allowed" : "hover:bg-green-800"
  }`}
>
  {isLoading ? (
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
  ) : (
    "Reset Password"
  )}
</button>

      </form>

      {msg && <p className="mt-4">{msg}</p>}
    </div>
    </div>
    <div className="flex-1 hidden bg-blue-500 rounded-tl-2xl shadow-2xl rounded-bl-2xl lg:flex">
        <ImageSlider images={[success, knowledge, dua, dua_success]} />
      </div>
  </div>
  );

   return (
    <div>
      <Navbar />
      <div className=" text lg:hidden block pb-3 mt-5 -md:mb-20 mx-auto w-80 md:w-[600px] md:px-8 shadow-2xl rounded-2xl">
          <TextSlider texts={texts} />
        </div>
      {content}
    </div>
  );

}
