import { useState, useEffect } from "react";
import api from "../Api/axios";
import dua_success from "./image/dua_success.png";
import success from "./image/path_islam.png";
import dua from "./image/dua.png";
import knowledge from "./image/dua_beneficial.png";
import ImageSlider from "./ImageSlider";
import Navbar from "../layout/Header";
import TextSlider from "./TextSlider";


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


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(""); // success, failed
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(30);

  // Timer countdown for resend
  useEffect(() => {
    let countdown;
    if (!canResend) {
      countdown = setInterval(() => {
        setTimer((t) => {
          if (t <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 30;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdown);
  }, [canResend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.post(
        "/api/forgot-password",
        { email }
      );

      setMsg("Reset link delivered to your email");
      setStatus("success");

      setTimeout(() => {
      setMsg("");
      setStatus("");
    }, 5000);

    setEmail("");
     
      setTimer(30);

    } catch (err) {
      setMsg("Failed to send reset link");
      setStatus("failed");
    } finally {
      setIsLoading(false);
    }
  };

//   const resendLink = async () => {
//    try {
//       const res = await api.post(
//         " /api/forgot-password",
//         { email }
//       );

//       setMsg("Reset link delivered to your email");
//       setStatus("success");

//       setTimeout(() => {
//       setMsg("");
//       setStatus("");
//     }, 5000);
    
//       setTimer(30);

//     } catch (err) {
//       setMsg("Failed to send reset link");
//       setStatus("failed");
//     } 
//   };

  const content = (
    <div className="flex flex-1 flex-col justify-center mt-6 items-center md:flex-row">
      
      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center items-center p-6">
        <div className="lg:w-full md:w-[600px] w-80  p-6 border border-blue-200 shadow-xl rounded-lg">

          <h2 className="text-xl text-black my-5 text-center font-bold mb-4">
            Forgot Password
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              required
              className="border border-blue-400 p-3 w-full mb-3 rounded focus:ring focus:ring-blue-300"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />

             {/* <div className="mt-4 text-center">
            <button
              disabled={!canResend}
              onClick={resendLink}
              className={` ${
                canResend
                  ? "text-blue-600 hover:underline"
                  : "text-gray-400 cursor-not-allowed"
              } font-semibold`}
            >
              {canResend ? "Resend Link" : `Resend in ${timer}s`}
            </button>
          </div> */}
    {msg && (
  <p
    className={`mt-4 font-semibold text-center ${
      status === "success" ? "text-green-600" : "text-red-600"
    }`}
  >
    {msg}
  </p>
)}

            <button
              disabled={isLoading}
              className="bg-blue-600 disabled:opacity-40 text-white hover:bg-blue-800 font-bold text-sm my-5 float-right px-4 py-3 rounded"
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
                "Send Reset Link"
              )}
            </button>

          </form>

        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 hidden bg-blue-500 rounded-tl-2xl shadow-2xl rounded-bl-2xl lg:flex">
        <ImageSlider images={[success, knowledge, dua, dua_success]} />
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className=" text lg:hidden block pb-3 mt-5 -md:mb-60 mx-auto w-80 md:w-[600px] md:px-8 shadow-2xl rounded-2xl">
          <TextSlider texts={texts} />
        </div>
      {content}
    </div>
  );
}
