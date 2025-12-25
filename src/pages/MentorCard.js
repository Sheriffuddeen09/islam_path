
export default function MentorCard({loadingId, requestStatus, handleRequest, selectedTeacher, setSelectedTeacher, t, notification}) {
 

    const isOther = t.coursetitle_name?.toLowerCase() === "other";
    const displayTitle = isOther ? "Other" : t.coursetitle_name;

  return (
    <>
    <div className="p-x4"> 
  {/* GRID */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative ">
        <div
    key={t.id}
    className="bg-white rounded-lg w-64 h-72 overflow-hidden shadow-xl border border-gray-300 group px-4 py-2 transform hover:scale-105 transition duration-300 flex flex-col mx-auto justify-center relative"
  >
          <img
            src={t.logo || "/default-avatar.png"}
            alt="Logo"
            className="w-24 h-24 object-cover rounded-full mb-3 mx-auto"
          />

        {(t.first_name || t.last_name) && (
          <h3 className="font-semibold text-lg mb-1 text-black text-center">
            {t.first_name} {t.last_name} &bull; {t.currency} {t.course_payment}
          </h3>
        )}

        {/* Course Title */}
        <div className="inline-flex  mx-auto items-center gap-1">
        {displayTitle && (
          <p className="text-center font-bold text-blue-600  text-xs">
            📚 {displayTitle}
          </p>
        )}

        {/* Specializations (only show if course is Other) */}
        {isOther && t.specialization?.length > 0 && (
          <ul className="text-center font-bold text-blue-600 text-xs">
            {t.specialization.map((spec, idx) => (
              <li key={idx}>• {spec}</li>
            ))}
          </ul>
        )}

        {/* Experience */}
        {t.experience?.length > 0 && (
          <p className="text-center font-bold text-black text-xs">
            🧑‍🏫 Experience: {t.experience.join(", ")}
          </p>
        )}
        </div>





        {/* Payment */}
        {t.course_payment && (
          <p className="font-medium text-black text-center mb-2">
           
          </p>
        )}

         {t.compliment && (
              <p className="text-gray-700 mx-auto font-normal text-black text-[11px] mb-2 text-center">
                {t.compliment.length > 50
                  ? `${t.compliment.substring(0, 20)}... `
                  : t.compliment}
                {t.compliment.length > 50 && (
                  <span
                    onClick={() => setSelectedTeacher({ compliment: t.compliment, qualification: t.qualification, first_name: t.first_name })}
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                  >
                    read more
                  </span>
                )}
              </p>
            )}
             <div className="absolute bg-black bg-opacity-100 flex flex-col h-44 bottom-0 w-full right-0 pb-2 justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
      <div className="flex flex-row gap-3 items-center mx-auto justify-center my-4">
      <div>
        {t.cv ? (
          <a
            href={t.cv}
            target="_blank"
            className="bg-blue-600 cursor-pointer text-white w-24 font-bold text-xs px-2 py-3 rounded-lg text-center hover:bg-blue-700 cursor-pointer"
          >
            View CV
          </a>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-black w-20 font-bold text-xs px-2 py-3 rounded-lg  text-center cursor-not-allowed"
          >
            No CV
          </button>
        )}
      </div>
      <div>
          <button
  onClick={() => handleRequest(t.id)}
  disabled={loadingId === t.id}
  className="text-white"
>
  {loadingId === t.id ? (
    <p className="bg-gray-500 rounded-lg px-4 text-xs py-3 flex items-center ">
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
  ) : (
    <>
      {requestStatus[t.id] === "pending" && (
        <p className="bg-blue-600 rounded-lg px-4 text-xs py-3 hover:bg-blue-500">
          Request Pending
        </p>
      )}

      {requestStatus[t.id] === "accepted" && (
        <p className="bg-gray-100 rounded-lg px-4 text-gray-600 text-xs py-3 hover:bg-gray-200">
          Request Accepted
        </p>
      )}

          {requestStatus[t.id] === "declined" && (
            <p className="bg-red-600 rounded-lg px-4 text-xs py-3 hover:bg-red-500">
              Request Resend
            </p>
          )}

          {!requestStatus[t.id] && (
            <p className="bg-green-600 rounded-lg px-4 text-xs py-3 hover:bg-green-500">
              Request Live Class
            </p>
          )}
        </>
      )}
    </button>

        </div>
        </div>
        {t.compliment && (
              <p className="text-gray-700 mx-auto font-normal text-white text-[11px] px-3 mb-2 text-center">
                {t.compliment.length > 50
                  ? `${t.compliment.substring(0, 50)}... `
                  : t.compliment}
                {t.compliment.length > 50 && (
                  <span
                     onClick={() => setSelectedTeacher(t)}
                    className="text-blue-300 cursor-pointer text-xs hover:text-blue-500"
                  >
                    read more
                  </span>
                )}
              </p>
            )}
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
            <div className="flex justify-between items-center my-5">
            <p className="text-gray-700 font-bold mb-2">
              {selectedTeacher.first_name || "N/A"} {selectedTeacher.last_name || "N/A"}
            </p>
            
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
  onClick={() => handleRequest(selectedTeacher.id)}
  disabled={loadingId === selectedTeacher.id}
  className="text-white"
>
  {loadingId === selectedTeacher.id ? (
    <p className="bg-gray-500 rounded-lg px-4 text-xs py-3 flex items-center gap-2">
      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
    </p>
  ) : (
    <>
      {requestStatus[selectedTeacher.id] === "pending" && (
        <p className="bg-blue-600 rounded-lg px-4 text-xs py-3 whitespace-nowrap hover:bg-blue-500">
          Request Pending
        </p>
      )}

      {requestStatus[selectedTeacher.id] === "accepted" && (
        <p className="bg-gray-100 rounded-lg px-4 text-gray-600 text-xs py-3 hover:bg-gray-200 whitespace-nowrap">
          Request Accepted
        </p>
      )}

      {requestStatus[selectedTeacher.id] === "declined" && (
        <p className="bg-red-600 rounded-lg px-4 text-xs py-3 whitespace-nowrap hover:bg-red-500">
          Request Resend
        </p>
      )}

      {!requestStatus[selectedTeacher.id] && (
        <p className="bg-green-600 rounded-lg px-4 text-xs whitespace-nowrap py-3 hover:bg-green-500">
          Request Live Class
        </p>
      )}
    </>
  )}
</button>



          </div>
          </div>
        </div>


            <p className="text-gray-700 mb-4">
              <span>•</span> {selectedTeacher.coursetitle_name} {selectedTeacher.experience} <span>•</span> {selectedTeacher.currency} {selectedTeacher.course_payment}
            </p>

            <p className="text-gray-700 mb-4">
              <span>•</span> {selectedTeacher.location || "N/A"}
            </p>

            <p className="text-gray-700 mb-4">
              <span>•</span> {selectedTeacher.gender || "N/A"}
            </p>

             <p className="text-gray-700 mb-4">
              <strong>Qualification:</strong> {selectedTeacher.qualification || "N/A"}
            </p>


            <p className="text-gray-700">
              <strong>Compliment:</strong> {selectedTeacher.compliment}
            </p>
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
