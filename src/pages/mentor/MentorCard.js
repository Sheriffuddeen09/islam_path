import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { Lock } from "lucide-react";


export default function MentorCard({filteredCourse, loadingId, requestStatus, sendLiveRequest, setLoadingId, setNotification
  , selectedTeacher, setSelectedTeacher, t, notification, setRequestStatus, user, authReady,
  averageRating, reviewCount, reviewLoading, teacherReviews }) {
 

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [loadingUnlock, setLoadingUnlock] = useState(false);

  
 const [badges, setBadges] = useState({
  total: 0,
});



    const getColor = (name = "") => {

        const colors = [
            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-cyan-500",
        ];

        return colors[name.length % colors.length];

    };

    const getInitial = (name = "") => {

        return name.charAt(0).toUpperCase();

    };


useEffect(() => {
  api.get("/api/user/badges")
    .then(res => {
      setBadges(res.data);
    })
    .catch(() => {
      setBadges({ total: 0});
    });
}, []);

 const src = `${`http://localhost:8000`}/storage/${t.logo}`;

    const isOther = t.coursetitle_name?.toLowerCase() === "other";
    const displayTitle = isOther ? "Other" : t.coursetitle_name;
    const complimentText = Array.isArray(t.compliment)
    ? t.compliment.join(" ")
    : typeof t.compliment === "string"
    ? t.compliment
    : "";

    const normalizeArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === "string" && value.trim() !== "") return [value];
      return [];
    };

    const specs = normalizeArray(t.specialization);
    const experience = normalizeArray(t.experience);


    
    
const handleUnlock = async (teacherId) => {

  if (loadingId !== null) return;
    
  if (!authReady) return;
  setLoadingId(teacherId);

  if (user.role === "admin") {
    setNotification({ type: "error", text: "Admins cannot send requests" });
    return;
  }

  if (badges.total < 20) return;

  setLoadingUnlock(true);
  try {
   const res = await sendLiveRequest(teacherId);
   setRequestStatus((prev) => ({
    ...prev,
    [teacherId]: "pending",
  }));
    setBadges({ total: res.data.total }); // ✅ updated from backend
    setShowUnlockModal(false);
  setNotification({ type: "success", text: "Request sent" });
      } catch (err) {
        setNotification({
          type: "error",
          text: err.response?.data?.message || "Request failed",
        });
      } finally {
        setLoadingId(null); // ✅ THIS FIXES THE STUCK LOADING
    setLoadingUnlock(false);
  }
};



const handleWatchAd = async () => {
  if (adsWatched >= 6) return;

  try {
    const res = await api.post("/api/student/watch-ad");

    // backend should return new total
    setBadges({ total: res.data.total });
    setAdsWatched(prev => prev + 1);
  } catch (e) {
    console.error(e);
  }
};



  return (
    <>
    <div className="p-x4"> 
      {filteredCourse.length === 0 && (
  <p className="text-sm text-gray-500 mt-6 text-center">
    No Teacher Course available
  </p>
)}

  {/* GRID */}

    <div className=" relative ">
   
         
        <div
    key={t.id}
    className={`bg-white rounded-lg w-64 md:w-60 h-64 overflow-hidden shadow-xl border border-gray-300 group px-4 py-2 transform hover:scale-105 transition duration-300 
    flex flex-col mx-auto justify-center relative 
    ${requestStatus[t.id] === "pending" || requestStatus[t.id] === "accepted" ? "hidden" : "block"}`}
      >

         {t.logo ? (

                                <img
                                    src={t.logo}
                                    alt="Teacher Logo"
                                    className="
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        object-cover
                                        shadow-lg
                                        mx-auto
                                    "
                                />

                            ) : (

                                <div
                                    className={`
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        flex
                                        items-center
                                        justify-center
                                        text-4xl
                                        text-white
                                        mx-auto
                                        font-bold
                                        ${getColor(t.first_name)}
                                    `}
                                >

                                    {getInitial(t.first_name)}

                                </div>

                            )}

        {(t.first_name || t.last_name) && (
          <h3 className="font-semibold sm:text-lg text-sm mb-1 text-black text-center">
            {t.first_name} {t.last_name?.[0]} &bull; {t.currency} {t.course_payment}
          </h3>
        )}

        {/* Course Title */}
        <div className="inline-flex  mx-auto items-center gap-1">
        {displayTitle && (
          <p className="text-center font-bold text-black  text-xs">
            📚 {displayTitle}
          </p>
        )}

        {/* Specializations */}
        {isOther && specs.length > 0 && (
          <ul className="text-center font-bold text-black text-xs">
            {specs.map((spec, idx) => (
              <li key={idx}>• ( {spec} ) </li>
            ))}
          </ul>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <p className="text-center font-bold text-black text-xs">
            🧑‍🏫 {experience.join(", ")}
          </p>
        )}

        </div>

    
         {complimentText && (
            <p className="text-gray-900 mx-auto px-1 font-semibold text-[12px] mb-2 text-center">
              {complimentText.length > 95
                ? `${complimentText.substring(0, 95)}`
                : complimentText}

              {complimentText.length > 95 && (
                <span
                  oonClick={() => setSelectedTeacher(t)}
                  className="text-blue-600 cursor-pointer z-50 hover:text-blue-800 ml-1"
                >
                  read more
                </span>
              )}
            </p>
          )}

             <div className="absolute bg-black bg-opacity-100 flex flex-col h-16 bottom-0 w-full right-0 pb-2 justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
      <div className="flex flex-row gap-1 items-center mx-auto justify-center my-3">
      <div>
           <button
        onClick={() => setShowUnlockModal(true)}
        className="text-white w-32 whitespace-nowrap bg-green-600 rounded-lg px-4 text-xs py-3 hover:bg-green-500">
        Send Request
    </button>
        
      </div>
      <div>
         
    <button
             onClick={() => setSelectedTeacher(t)}
            className="bg-blue-600 cursor-pointer text-white w-24 font-bold text-xs px-2 py-3 rounded-lg text-center hover:bg-blue-700 cursor-pointer"
          >
           View Details
          </button>



        </div>
        </div>
        </div>
        </div>
        </div>


  {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6  overflow-y-auto overflow-x-hidden
    scrollbar-thin scrollbar-thumb-gray-400 h-full scrollbar-track-gray-100  my-6 max-w-4xl w-full relative">
            <button
              onClick={() => setSelectedTeacher(null)}
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

            </button>

            <h1 className="text-2xl text-center py-3 font-bold mb-3 text-black">
              Teacher Details
            </h1>
             {selectedTeacher.logo ? (

                                <img
                                    src={selectedTeacher.logo}
                                    alt="Teacher Logo"
                                    className="
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        object-cover
                                        shadow-lg
                                    "
                                />

                            ) : (

                                <div
                                    className={`
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        flex
                                        items-center
                                        justify-center
                                        text-4xl
                                        text-white
                                        font-bold
                                        ${getColor(selectedTeacher.first_name)}
                                    `}
                                >

                                    {getInitial(selectedTeacher.first_name)}

                                </div>

                            )}

            <div className="flex justify-between flex-wrap items-center mt-5">
            <p className="text-gray-900 text-xl sm:text-4xl font-bold mb-2">
              {selectedTeacher.first_name || "N/A"} {selectedTeacher.last_name || "N/A"}
            </p>
            <div className="flex items-center gap-2 mb-5">

            <div className="text-yellow-500 text-xl">

                {"★".repeat(Math.round(averageRating))}
                <span className="text-gray-300">
                    {"★".repeat(5 - Math.round(averageRating))}
                </span>

            </div>

            <span className="font-semibold">

                {averageRating}

            </span>

            <span className="text-gray-500">

                ({reviewCount} Reviews)

            </span>

        </div>
            
            <div className="flex items-center gap-3">
              <div>
              {selectedTeacher.cv ? (
                <a
                  href={selectedTeacher.cv}
                  target="_blank"
                  className="bg-blue-600 cursor-pointer text-white w-24 font-bold text-sm px-2 py-3 rounded-lg hover:bg-blue-700"
                >
                  View CV
                </a>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-black w-20 font-bold text-sm px-2 py-3 rounded-lg cursor-not-allowed"
                >
                  No CV
                </button>
              )}
              </div>
              <div>
             <button
        onClick={() => setShowUnlockModal(true)}
        className="text-white w-32 whitespace-nowrap bg-green-600 rounded-lg px-4 text-xs py-3 hover:bg-green-500">
        Send Request
    </button>


          </div>
          </div>
        </div>


            <p className="text-gray-900 text-[16px] font-semibold mb-2">
             Subject <span>•</span>  {selectedTeacher.coursetitle_name}  {selectedTeacher.specialization} <span>•</span> {selectedTeacher.experience}
            </p>

            <p className="text-gray-900 text-[16px] font-semibold mb-4">
              Payment Required <span>•</span>  {selectedTeacher.currency} {selectedTeacher.course_payment}
            </p>

            <p className="text-gray-900 text-[16px] font-semibold mb-4">
              Location <span>•</span> {selectedTeacher.location}
            </p>

            <p className="text-gray-900 text-[16px] font-semibold mb-4">
              Gender <span>•</span> {selectedTeacher.gender}
            </p>
            
            <p className="text-lg mb-2 text-black border-b pb-2 border-blue-600">
              <strong>Qualification: </strong>
            </p>
             <p className="text-gray-900 mb-4 text-[16px] font-semibold mt-2">              
               {selectedTeacher.qualification || "N/A"}
            </p>


            <p className="text-lg mb-2 border-b text-black pb-2 border-blue-600">
              <strong>Compliment:</strong> 
            </p>
            <p className="text-gray-900 mb-4 text-[16px] font-semibold mt-2">              
               {selectedTeacher.compliment || "N/A"}
            </p>

            <div className="mt-10">

    <h2 className="text-2xl font-bold border-b pb-3">

        Student Reviews

    </h2>

    {reviewLoading ? (

        <div className="py-10 text-center">

            Loading reviews...

        </div>

    ) : teacherReviews.length === 0 ? (

        <div className="text-center py-10">

            <div className="text-6xl">

                ⭐

            </div>

            <p className="font-bold mt-4">

                No reviews yet

            </p>

        </div>

    ) : (

        <div className="space-y-5 mt-6">

            {teacherReviews.map((review) => (

                <div
                    key={review.id}
                    className="border rounded-xl p-5 shadow-sm"
                >

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">

                            {review.avatar}

                        </div>

                        <div>

                            <p className="font-bold">

                                {review.first_name} {review.last_name}

                            </p>

                            <div className="text-yellow-500">

                                {"★".repeat(review.rating)}

                                <span className="text-gray-300">

                                    {"★".repeat(5 - review.rating)}

                                </span>

                            </div>

                        </div>

                        <span className="ml-auto text-sm text-gray-500">

                            {review.created_at}

                        </span>

                    </div>

                    {review.review && (

                        <p className="mt-4 text-black text-sm">

                            {review.review}

                        </p>

                    )}

                </div>

            ))}

        </div>

    )}

</div>
          </div>
        </div>
      )}


      
{showUnlockModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-5 w-80 text-center relative text-black">
      <div className="inline-flex items-end gap-2">
      <Lock />
      <h2 className="font-bold text-lg   ">Unlock Teacher</h2>
      </div>
    <hr />
      <button
        disabled={adsWatched >= 6}
        onClick={handleWatchAd}
        className={`w-44 text-xs py-1 mb-12 border-b-2 mt-10 flex justify-center text-center  rounded-lg  text-white ${
          adsWatched >= 6 ? "bg-gray-300" : "bg-blue-600 text-white"
        }`}
      >
        Watch Ad (+5 badges) ({adsWatched}/6)
      </button>
      <div className="flex flex-col mb-10 gap-2">
        <Lock className="lock  p-1 w-8 h-8 mx-auto border-2 border-black rounded-full"/>
      <p className="font-bold text-lg ">Badges Required <b>20</b> 🏅</p>
      </div>
      <button
        disabled={badges.total < 20 || loadingUnlock}
        onClick={() => handleUnlock(t.id)}
        className={`w-52  py-3 rounded-full font-bold  text-white ${
          badges.total >= 20 ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {loadingUnlock ? 
        <p className="flex items-center gap-2">
          <span className="animate-spin h-6 w-6 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
        </p>
        : "Unlock"}
      </button>

      {badges.total < 20 && (
        <p className="text-sm text-red-500 mt-2 text-xs font-semibold ">
          Your badge is low. Watch ads or pass exam to earn badges.
        </p>
      )}

      <button
        onClick={() => setShowUnlockModal(false)}
        className="mt-3 top-0 right-2 absolute rounded-full"
      >
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
      </button>
      <div className="inline-flex mt-4 gap-2 items-center">
      <p className="font-bold text-sm">Balance: <b>{badges.total}</b> 🏅</p>
      </div>
    </div>
  </div>
)}

      {notification && (
        <div className={`fixed top-4 right-4 rounded px-4 py-2 text-white z-50
          ${notification.type === "success" ? "bg-green-600 cursor-pointer" : "bg-red-600 cursor-pointer"}`}>
          {notification.text}
        </div>
      )}

      
    </div>
    </>

  );
}
