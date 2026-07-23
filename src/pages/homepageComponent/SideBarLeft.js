import { useEffect, useState } from "react";
import { linkList } from "./LinkData";
import JobProfileModal from "../../job/JobProfileModal";
import api from "../../Api/axios";
import { Briefcase, PlusCircle, Search } from "lucide-react";

export default function SidebarLeft({fetchJobProfile, show, setShow, jobProfile}) {

  const [showMoreMale, setShowMoreMale] = useState(false);

  const links = linkList.filter(item => item.link === "link");

  const visibleMales = showMoreMale ? links : links.slice(0, 10);

 
  const isPendingProfile =
    !jobProfile ||
    jobProfile?.status === "pending" ||
    jobProfile?.status === "declined";

const isApprovedProfile =
    jobProfile?.status === "approved";
  
  return (
    <>
    <aside className="fixed hidden sm:block top-[75px] left-2 
      h-[90vh] w-72 bg-white shadow-md p-4 z-40
      overflow-y-auto overflow-x-hidden
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
                      text-[var(--text-color)]
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
      />

    </>
  );
}
