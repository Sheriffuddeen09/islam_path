import { useRef, useState, useEffect } from "react";
import api from "../Api/axios";
import { Home, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import dua_success from "./image/dua_success.png";
import success from "./image/path_islam.png";
import dua from "./image/dua.png";
import knowledge from "./image/dua_beneficial.png";
import ImageSlider from "./ImageSlider";
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

export default function RegisterPage() {
 
  const [menuOpen, setMenuOpen] = useState(false)
  const [ steps, setSteps] = useState(1)

   // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [role, setRole] = useState('');

  // Step 2
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [location, setLocation] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [locationCountryCode, setLocationCountryCode] = useState('');

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpBoxes, setOtpBoxes] = useState(['','','','','','']);
  const inputsRef = useRef([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 4
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const navigate = useNavigate()

  const [notify, setNotify] = useState({ message: "", type: "" });

const showNotification = (msg) => {
  setNotify({ message: msg, type: "error" });

  // Clear after 5 seconds
  setTimeout(() => {
    setNotify({ message: "", type: "" });
  }, 5000);
};

useEffect(() => {
  const msg = sessionStorage.getItem("notify_message");

  if (msg) {
    setNotify({ message: msg, type: "error" });

    // Clear after 5 seconds
    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);

    sessionStorage.removeItem("notify_message");
  }
}, []);

  const validateError = () => {
    const newErrors = {};

    if (!firstName) newErrors.firstName = "First name is required";
    if (!lastName) newErrors.lastName = "Last name is required";
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!gender) newErrors.gender = "gender is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;

  }

 const handleNext = async () => {
  // Run local validation first
  if (!validateError()) return;

  setLoading(true);
  setErrors({});
  try {
    // Example API call to check something before next step
    const res = await api.post("/api/check", {
      firstName,
      lastName,
      dob,
      gender,
    });

    // If API responds without error, move to next step
  setSteps(2);

  } catch (err) {
    console.log("FULL ERROR:", err);
    console.log("SERVER RESPONSE:", err.response?.data);

    let msg = "Something went wrong";

    if (err.response) {
      const serverMsg = err.response.data.message || "";

      // Detect SQLSTATE or connection errors
      if (
        serverMsg.includes("SQLSTATE") ||
        serverMsg.toLowerCase().includes("connection") ||
        serverMsg.toLowerCase().includes("refused")
      ) {
        msg = "Server down, please try later";
      } else {
        msg = serverMsg || msg;
      }
    } else if (err.request) {
      msg = "Server not reachable, please try later";
    }

    setErrors({ general: msg });
}
 finally {
    setLoading(false);
  }
};

const autoSentOtp = async () =>{

  try{
    const response = await api.post("/api/send-otp", {email})
    setOtpSent(true)
  }
  catch(err){
    setErrors({errors: "Failed to send OTP. Try again."})
    return false;
  }
  
}

// The route api/check could not be found

  const handleNextRole = () =>{
    const newErrors = {}
    if (!role) newErrors.role = "role checked is required"

    if (Object.keys(newErrors).length > 0){
      return setErrors(newErrors)
    }

  setSteps(3)
    
  }

 const handleNextPassword = () => {
  const newErrors = {}

  // Check if fields are empty
  if (!password) newErrors.password = "Password is required";
  if (!passwordConfirm) newErrors.passwordConfirm = "Confirm password is required";

  // Strong password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (password && !strongPassword.test(password)) {
    newErrors.password = "least 8, include upper & lower case, num, and special character";
  }

  // Passwords match check
  if (password && passwordConfirm && password !== passwordConfirm) {
    newErrors.passwordConfirm = "Passwords do not match";
  }

  if (Object.keys(newErrors).length > 0) {
    return setErrors(newErrors);
  }

  // Clear errors and proceed
  setErrors({});
  setSteps(6);
};

const handleContactNext = async () => {
  const newErrors = {};
  setLoading(true);

  if (!email) newErrors.email = "Email is required";
  if (!countryCode) newErrors.countryCode = "Country code is required";
  if (!location) newErrors.location = "Location is required";
  if (!phonenumber) newErrors.phonenumber = "Phone number is required";
  if (!locationCountryCode) newErrors.locationCountryCode = "Location country code is required";

  if (Object.keys(newErrors).length > 0) {
    return setErrors(newErrors);
  }

  try {
    
    const emailCheck = await api.post("/api/check-email", {
      email
    });

    if (emailCheck.data.exists) {
      setErrors({ email: "Email already exists. Please login." });
      return;
    }

    // 🔥 Step 2: Check phone
    const phoneCheck = await api.post("/api/check-phone", {
      phone: phonenumber
    });

    if (phoneCheck.data.exists) {
      setErrors({ phonenumber: "Phone number already exists." });
      return;
    }

    // 🔥 Proceed to OTP step
    const sent = autoSentOtp();
    if (sent) {
      setSteps(4);
    }

  } catch (err) {
    console.log(err);

    if (err.response?.data?.errors?.email) {
      setErrors({ email: err.response.data.errors.email[0] });
    }

    if (err.response?.data?.errors?.phone) {
      setErrors({ phonenumber: err.response.data.errors.phone[0] });
    }
  }
  finally{
    setLoading(false);
  }
};

  
  const verifyOtp = async () =>{

    const otp = otpBoxes.join('');
    if (otp.length !== 6){
      setErrors({ otp: 'Enter full 6-digit code' })
      return;
    }

    try {
    setLoading(true)
      await api.post('/api/verify-otp', {email, otp})
      setSteps(5);
    }
    catch(err){
      setErrors({ otp: "Invalid code. Try again." })
    }
    finally{
      setLoading(false)
    }

  }


// Function to handle sending OTP and starting cooldown
const resendOtp = async () => {
  try {
    const response = await api.post("/api/send-otp", { email });
    setOtpSent(true);

    // Start cooldown (e.g., 30 seconds)
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

  } catch (err) {
    setErrors({ errors: "Failed to send OTP. Try again." });
  }
};


  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpBoxes];
    updated[index] = value;
    setOtpBoxes(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

    const prevButton = () => setSteps((prev) => prev -1)
const clearError = (field) =>{

  setErrors(prev => ({...prev, [field]: ''}))

}

const handleRegister = async () => {
  setLoading(true);

  const payload = {
    first_name: firstName,
    last_name: lastName,
    dob,
    gender,
    phone: phonenumber,
    phone_country_code: countryCode,
    location,
    location_country_code: locationCountryCode,
    email,
    password,
    password_confirmation: passwordConfirm,
    privacy,
    role
  };

  try {
    const res = await api.post("/api/register", payload);

    // Redirect silently on success (no notification)
    navigate(res.data.redirect);

  } catch (err) {
    // Laravel validation errors
    if (err.response?.status === 422) {
      const validationErrors = err.response.data.errors;
      for (let field in validationErrors) {
        showNotification(validationErrors[field][0]);
        break; // show only first validation error
      }
    }
    // Laravel error message
    else if (err.response?.data?.message) {
      showNotification(err.response.data.message);
    }
    // fallback error
    else {
      showNotification("Something went wrong. Try again.");
    }
  } finally {
    setLoading(false);
  }
};

    return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navigation */}
     <header className="flex justify-between items-center shadow-md py-4 px-8 md:px-16 lg:px-24 border-b relative">
      {/* Left - Homepage */}
      <Link
        to="/"
        className="hidden md:flex items-center gap-2 text-black border border-blue-600 px-4 py-2 rounded-full text-sm hover:bg-blue-200 transition"
      >
        ← Homepage
      </Link>

      {/* Center Logo */}
      <p className="font-bold text-black text-sm sm:text-lg font-serif flex items-center gap-3">
        <Home /> Islam Path Of Knowledge
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

      {/* Main Content */}

      {/* <div className="wrapper flex flex-col items-center block sm:hidden">
  <p className="text-2xl welcome font-bold text-black mt-5 mb-2">Welcome to</p>
  <ul className="dynamic mt-1 mb-5">
    <ol><main>Islam Path of Knowledge</main></ol>
  </ul>
</div> */}

  <div className=" text lg:hidden block pb-3 mt-5 -md:mb-60 md:translate-y-28 mx-auto w-80 md:w-[600px] md:px-8 shadow-2xl rounded-2xl">
          <TextSlider texts={texts} />
        </div>
    <div className="flex flex-1 mt-4 flex-col lg:flex-row mb-10 justify-around items-center sm:p-6 gap-10">
        {/* Left Section - Form */}
        <div className=" flex justify-end float-left">
       
        </div>
         <div className="lg:w-5/12 md:w-[600px] w-80 mx-auto p-6 border border-1 border-blue-200 shadow-2xl rounded-lg">
         
          {
            steps === 1 && (
              <>
              <button
          className="px-4 py-2  -mb-5 text-white font-bold rounded opacity-60 "
          
        >
          <Link to={'/login'}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>
</Link>
        </button>

          <h2 className="text-2xl font-bold text-center sm:py-5 text-black mb-10">Tell us about yourself</h2>

          <div className="mt-6 sm:px-4">
            <div className="relative mb-7">
              <label className="text-black mb-8 absolute text-[13px] font-bold -top-3 left-2 bg-white text-blue-500">First Name</label>
              <input value={firstName} onChange={(e)=>{setFirstName(e.target.value); clearError("firstName")} }  className="w-full text-black border border-blue-200 rounded px-4 py-2"/>
              <div>
                {errors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
            </div>

             <div className="relative mt-7">
              <label className="text-black absolute text-[13px] font-bold -top-3 left-2 bg-white text-blue-500">Last Name</label>
              <input value={lastName} onChange={(e)=>{setLastName(e.target.value); clearError('lastName')} } className="w-full border text-black rounded px-4 py-3"/>
                <div>
                  {
                    errors && (
                      <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>
                    )
                  }
                </div>
            </div>
              <div className="sm:inline-flex gap-3 items-center">
             <div className="relative mt-7 sm:w-52 w-full">
              <label className="text-black z-50 absolute text-[13px] font-bold -top-3 left-2 bg-white text-blue-500">Date of Birth</label>
              <div className="relative w-full">
  <input
    type="date"
    value={dob}
    required
    onChange={(e) => {
      setDob(e.target.value);
      clearError("dob");
    }}
    className="hide-date-text w-full border text-black rounded px-4 py-3 cursor-pointer relative"
  />
</div>
            <div>
                  {
                    errors && (
                      <p className="text-red-600 text-xs mt-1">{errors.dob}</p>
                    )
                  }
                </div>
            </div>

             <div className="relative mt-7 sm:w-52 w-full">
              <label className="text-black absolute text-[13px] font-bold -top-3 left-2 bg-white text-blue-500">Gender</label>
              <select value={gender} onChange={(e)=>{setGender(e.target.value); clearError('gender')}} className="w-full border text-black rounded px-4 py-3">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div>
                  {
                    errors && (
                      <p className="text-red-600 text-xs mt-1">{errors.gender}</p>
                    )
                  }
                </div>
            </div>
            </div>
                <br />
                 {errors.general && (
              <div className="text-red-700 text-xs p-3 rounded mb-3">
                {errors.general}
              </div>
            )}

            <button  onClick={handleNext} className="px-4 py-2 bg-blue-700 mt-8 text-white rounded float-right hover:bg-blue-800  hover:scale-105">
            {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>
  )}

            </button>
          </div>
        </>
            )
          }
          {steps === 2 && (
  <>
   <button
          className="px-4 py-2  text-black rounded opacity-60 "
          onClick={prevButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

        </button>
    <h2 className="text-2xl font-bold text-center text-black">Choose Account Type</h2>

    <p className="text-center text-sm text-gray-700 mt-2">
      Select how you want to use the platform
    </p>

    <div className="mt-6 space-y-4">

      {/* Student */}
      <label
        className={`block border rounded-lg p-4 cursor-pointer transition ${
          role === "student"
            ? "border-blue-700 bg-blue-50"
            : "border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            value="student"
            checked={role === "student"}
            onChange={(e) => {
              setRole(e.target.value);
              clearError("role");
            }}
          />
          <span className="font-medium text-black">Student</span>
        </div>
        <p className="text-sm text-gray-600 ml-7">Learn and access all courses</p>
      </label>

      {/* Admin */}
      <label
        className={`block border rounded-lg p-4 cursor-pointer transition ${
          role === "admin"
            ? "border-blue-700 bg-blue-50"
            : "border-gray-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="radio"
            value="admin"
            checked={role === "admin"}
            onChange={(e) => {
              setRole(e.target.value);
              clearError("role");
            }}
          />
          <span className="font-medium text-black">Admin</span>
        </div>
        <p className="text-sm text-gray-600 ml-7">Create courses & manage platform</p>
      </label>

      {/* Error */}
      {errors.role && (
        <p className="text-red-600 text-sm font-semibold">{errors.role}</p>
      )}

      <div className="flex justify-end mt-6">

        <button
        onClick={handleNextRole}
          className="px-4 py-2 bg-blue-700 mt-8 text-white rounded flex justify-end items-end float-right hover:bg-blue-800  hover:scale-105"
        >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>

        </button>
      </div>
    </div>
  </>
)}

   {/* ------------------------ STEP 3 ------------------------ */}
      {steps === 3 && (
        <>
  <button
          className="px-4 py-2  text-black rounded opacity-60 "
          onClick={prevButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

        </button>
          <h2 className="text-2xl font-bold text-center text-black mb-7">What's your contact info?</h2>

          <div className="mt-6 space-y-4">

            {/* Email */}
           <div className="relative mt-7 sm:px-4 py-3">
              <label className="text-black absolute text-[13px] font-bold top-0 sm:left-6 left-2 bg-white text-blue-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e)=>{setEmail(e.target.value); clearError('email')}}
                className="w-full border text-black rounded px-4 py-3"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="relative mt-7 sm:px-4 py-3">
              <label className="text-black absolute text-[13px] font-bold -top-0 sm:left-6 left-2 bg-white text-blue-500">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e)=>{setCountryCode(e.target.value); clearError('countryCode')}}
                  className="border rounded px-4 py-3 w-36 text-black"
                >
                  <option value=""></option>
                  <option value="+234">🇳🇬 +234</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>

                <input
                  value={phonenumber}
                  onChange={(e)=>{setPhonenumber(e.target.value); clearError('phonenumber')}}
                  className="flex-1 border rounded px-4 py-3 text-black w-36 sm:w-full"
                  placeholder="Phone number"
                />
              </div>
              {errors.countryCode && <p className="text-red-600 text-xs mt-1">{errors.countryCode}</p>}
              {errors.phonenumber && <p className="text-red-600 text-xs mt-1">{errors.phonenumber}</p>}
            </div>

            {/* Location */}
            <div className="relative mt-7 sm:px-4 py-3">
              <label className="text-black absolute text-[13px] font-bold -top-0 sm:left-6 left-2 bg-white text-blue-500">Location</label>
              <div className="flex gap-2">
                <select
                  value={locationCountryCode}
                  onChange={(e)=>{setLocationCountryCode(e.target.value); clearError('locationCountryCode')}}
                  className="border rounded px-4 py-3 w-36 text-black"
                >
                  <option value=""></option>
                  <option value="+234">NG</option>
                  <option value="+1">US</option>
                </select>

                <input
                  value={location}
                  onChange={(e)=>{setLocation(e.target.value); clearError('location')}}
                  className="flex-1 border rounded px-4 py-3 text-black w-36 sm:w-full"
                  placeholder="City / State"
                />
              </div>
              {errors.locationCountryCode && <p className="text-red-600 text-xs mt-1">{errors.locationCountryCode}</p>}
              {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
            </div>

            <button
              onClick={handleContactNext}
             className="px-4 py-2 bg-blue-700 mt-8 text-white rounded flex justify-end items-end float-right hover:bg-blue-800  hover:scale-105"
        >
          
              {loading ?  <svg
      className="animate-spin h-5 w-5 text-white"
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
    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
</svg>  }
            </button>
          </div>
        </>
      )}

 {steps === 4 && (
        <>
        <button
          className="px-4 py-2  text-black rounded opacity-60 "
          onClick={prevButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

        </button>
          <h2 className="text-2xl font-bold text-black text-center">Verify your login</h2>
          <p className="text-gray-600 mt-2 text-center">Enter the 6-digit code sent to your email</p>

          <div className="mt-6 flex gap-3 mx-auto justify-center">
            {otpBoxes.map((val, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                value={val}
                maxLength={1}
                onChange={(e)=>{handleOtpChange(e.target.value, i); clearError('otp')}}
                onKeyDown={(e)=>handleOtpKeyDown(e, i)}
                className="sm:w-14 sm:h-14 w-10 h-10 text-center text-black border rounded text-xl"

              />
            ))}
          </div>
             <div className="mt-4 text-center">
      <button style={{
        backgroundColor: 'transparent',
      }}
        className={`px-4 py-2 rounded mx-auto ${resendTimer > 0 ? 'bg-transparent hover:bg-transparent text-gray-400 cursor-not-allowed' : 'bg-transparent text-blue-600 font-bold hover:bg-blue-700'}`}
        onClick={resendOtp}
        disabled={resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
      </button>
    </div>
          {errors.otp && <p className="text-red-600 sm:translate-x-8 translate-x-2 text-xs mt-2">{errors.otp}</p>}

          <button
            className="mt-6 px-4 py-2 bg-blue-700 float-right text-white rounded  hover:bg-blue-800  hover:scale-105"
            onClick={verifyOtp}
          >
            {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
    "Verify OTP"
  )}
          </button>
        </>
      )}

      {steps === 5 && (
  <>
    <button
      className="px-4 py-2 text-black rounded opacity-60"
      onClick={prevButton}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
      </svg>
    </button>

    <h2 className="text-2xl font-bold text-black text-center">Create a password</h2>

    <div className="mt-4 space-y-3">
      {/* Password field */}
      <div className="relative mt-7 sm:px-4 py-3">
        <label className="text-black absolute text-[13px] font-bold top-1 sm:left-6 left-2 bg-white text-blue-500">
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearError('password') }}
          className="w-full border rounded px-4 py-2 text-black"
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
        {errors.password && <p className="text-red-600 text-xs mt-2">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="relative mt-7 sm:px-4 py-3">
        <label className="text-black absolute text-[13px] font-bold top-1 sm:left-6 left-2 bg-white text-blue-500">
          Confirm password
        </label>
        <input
          type={showPasswordConfirm ? "text" : "password"}
          value={passwordConfirm}
          onChange={(e) => { setPasswordConfirm(e.target.value); clearError('passwordConfirm') }}
          className="w-full border rounded px-4 py-2 text-black"
        />
        <button
          type="button"
          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
          className="absolute right-3 top-4 text-gray-500"
        >
          {showPasswordConfirm ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.5 10.5a3 3 0 104.5 4.5M9.75 14.25l4.5-4.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zM12 9a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          )}
        </button>
        {errors.passwordConfirm && <p className="text-red-600 text-xs mt-1">{errors.passwordConfirm}</p>}
      </div>
    </div>

    <button
      onClick={handleNextPassword}
      className="px-4 py-2 bg-blue-700 mt-8 text-white rounded flex justify-end items-end float-right hover:bg-blue-800 hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </button>
  </>
)}



{steps === 6 && (
  <>
  <button
          className="px-4 py-2  text-black rounded opacity-60 "
          onClick={prevButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
</svg>

        </button>
    <h2 className="sm:text-2xl text-sm font-bold text-black text-center">⚠️ Terms and Conditions</h2>

    <div className="mt-4 space-y-3">

      {/* ⚠️ Privacy Agreement Added Here */}
      <div className="mt-6">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />

          <label htmlFor="agree" className="text-sm text-black leading-relaxed">
            I have read and agree to the{" "}
            <span className="font-semibold text-blue-800">Terms and Islamic Privacy Policy</span>,
            which ensures that this platform —
            <span className="font-semibold text-blue-900">Islam Path of Knowledge</span> — operates
            according to Islamic values and principles. By continuing, I acknowledge that:
            <ul className="list-disc ml-6 mt-2 text-gray-700">
              <li>All shared content must be respectful and within the bounds of Islamic teachings.</li>
              <li>Publishing or promoting haram, inappropriate, or misleading material is strictly prohibited.</li>
              <li>There must be no involvement in exam malpractice, dishonesty, or any unethical activity.</li>
              <li>Knowledge shared should benefit others sincerely for the sake of Allah.</li>
              <li>Privacy, modesty, and integrity of all users will be respected.</li>
            </ul>

            {errors.privacy && (
              <p className="text-red-800 mt-2 font-semibold text-xs">{errors.privacy}</p>
            )}
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleRegister}
          className="px-4 py-2 bg-green-600 text-white mt-4 rounded"
          disabled={loading}
        >
          {loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
    "Register"
  )}
        </button>

        <Notification
  message={notify.message}
  type={notify.type}
  onClose={() => setNotify({ message: "", type: "" })}
/>

      </div>
    </div>
  </>
)}

         </div>
        {/* Right Section - Image */}
        <div className="flex-1 hidden rounded-2xl lg:flex">
         <ImageSlider images={[success,knowledge, dua, dua_success]}  />
        </div>
      </div>
  
    </div>
  );
}
