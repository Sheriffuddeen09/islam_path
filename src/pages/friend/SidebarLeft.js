import { useState } from "react";
import { linkList } from "../homepageComponent/LinkData";
import JobProfileModal from "../../job/JobProfileModal";
import { Briefcase, CheckCircle2, PlusCircle, Search } from "lucide-react";

export default function SidebarLeft({jobProfile, fetchJobProfile, show, setShow, setShowSuccessModal, showSuccessModal }) {

  const [showMoreMale, setShowMoreMale] = useState(false);

  const links = linkList.filter(item => item.link === "link");

  const visibleMales = showMoreMale ? links : links.slice(0, 10);

  const isPendingProfile =
    !jobProfile 

const isApprovedProfile =
    jobProfile
    
  return (
    <>
    <aside className="fixed hidden lg:block top-[80px] left-
      h-full w-[265px] border  bg-[var(--bg-color)] shadow-md p-4 z-40 rounded-lg flex-1
      overflow-y-auto overflow-x-hidden text-[var(--text-color)]
      scrollbar-thin scrollbar-thumb-gray-400">
      <div className="mb-6">
        <ul>
          {visibleMales.map((item) => (

              item.id === 3

              ?

                       <li
                             key={item.id}
                             onClick={() => {
             
                                 // Null, Pending or Declined
                                 if (isPendingProfile) {
             
                                     setShow(true);
             
                                 }
             
                                 // Approved Job Creator
                                 else if (
                                     isApprovedProfile &&
                                     jobProfile?.type === "creator"
                                 ) {
             
                                 }
             
                                 // Approved Job Finder
                                 else if (
                                     isApprovedProfile &&
                                     jobProfile?.type === "finder"
                                 ) {
             
                                 }
             
                             }}
                             className="
                             flex items-center
                             gap-3
                             p-2
                             hover:bg-gray-100
                             transition
                             cursor-pointer
                             "
                         >
             
                             <div
                                 className="
                                 w-8 h-8
                                 flex
                                 items-center
                                 justify-center
                                 rounded-full
                                 text-[var(--text-color)]
                                 text-lg
                                 font-semibold
                                 "
                             >
             
                                 {isPendingProfile ? (
             
                                     <Briefcase size={22} />
             
                                 ) : jobProfile?.type === "creator" ? (
             
                                     <PlusCircle size={22} />
             
                                 ) : (
             
                                     <Search size={22} />
             
                                 )}
             
                             </div>
             
             
                             <div className="flex flex-col">
             
                                 <span
                                     className="
                                     text-sm
                                     text-gray-700
                                     "
                                 >
             
                                     {isPendingProfile
                                         ? "Post / Find Halal Job"
                                         : jobProfile?.type === "creator"
                                         ? "Post Job"
                                         : "Find Job"}
             
                                 </span>
             
                             </div>
             
                         </li>
              :

              <li
                  key={item.id}
                  className="
                  flex
                  items-center
                  gap-3
                  p-2
                  hover:bg-gray-100
                  transition
                  cursor-pointer
                  "
              >

                  <div
                      className={`
                      w-8 h-8
                      flex
                      items-center
                      justify-center
                      rounded-full
                      ${item.background}
                      text-white
                      text-lg
                      font-semibold
                      `}
                  >
                      {item.icon}
                  </div>


                  <div className="flex flex-col">

                      <span
                          className="
                          text-sm
                          text-gray-700
                          "
                      >
                          {item.name}
                      </span>

                      <span
                          className="
                          text-xs
                          text-gray-700
                          "
                      >
                          {item.gender}
                      </span>

                  </div>

              </li>

          ))}
      </ul>
        {links.length > 10 && (
          <button
            onClick={() => setShowMoreMale(!showMoreMale)}
            className="text-xs text-blue-600 mt-2 hover:underline"
          >
            {showMoreMale ? "See Less" : "See More"}
          </button>
        )}
      </div>
    </aside>
     <JobProfileModal
          onClose={() => setShow(false)}
          show={show}
          fetchJobProfile={fetchJobProfile}
          showSuccessModal={showSuccessModal} 
          setShowSuccessModal={setShowSuccessModal}
          />

               
           {showSuccessModal && (
              <div
                  className="
                  fixed inset-0 z-50
                  flex items-center justify-center
                  bg-black/50
                  p-4
                  "
              >
                  <div
                      className="
                      bg-white
                      rounded-3xl
                      shadow-2xl
                      max-w-lg
                      w-full
                      p-8
                      text-center
                      "
                  >
                      <div
                          className="
                          w-20 h-20
                          rounded-full
                          bg-green-100
                          mx-auto
                          flex items-center
                          justify-center
                          mb-5
                          "
                      >
                          <CheckCircle2
                              size={50}
                              className="text-green-600"
                          />
                      </div>
          
                      <h2
                          className="
                          text-2xl
                          font-bold
                          mb-3
                          "
                      >
                          Thank You!
                      </h2>
          
                      <p
                          className="
                          text-gray-600
                          leading-7
                          "
                      >
                          Your Job Profile has been
                          submitted successfully.
                      </p>
          
                      <p
                          className="
                          text-gray-600
                          leading-7
                          mt-3
                          "
                      >
                          Please wait for platform
                          approval before you can
                          continue to post jobs or
                          search for jobs on our
                          platform.
                      </p>
          
                      <div
                          className="
                          mt-6
                          rounded-2xl
                          bg-blue-50
                          border
                          border-blue-200
                          p-4
                          text-sm
                          text-gray-700
                          "
                      >
                          Your profile is currently
                          under review. You will gain
                          access to job-related
                          features once it has been
                          approved.
                      </div>
          
                      <button
                          onClick={() =>
                              setShowSuccessModal(
                                  false
                              )
                          }
                          className="
                          mt-8
                          bg-blue-600
                          text-white
                          px-8
                          py-3
                          rounded-xl
                          hover:bg-blue-700
                          transition-all
                          "
                      >
                          Continue
                      </button>
                  </div>
              </div>
          )}
          </>
  );
}
