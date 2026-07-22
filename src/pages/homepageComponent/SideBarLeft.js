import { useEffect, useState } from "react";
import { linkList } from "./LinkData";
import JobProfileModal from "../../job/JobProfileModal";
import api from "../../Api/axios";

export default function SidebarLeft() {

  const [showMoreMale, setShowMoreMale] = useState(false);
  const [show, setShow] = useState(false)

  const links = linkList.filter(item => item.link === "link");

  const visibleMales = showMoreMale ? links : links.slice(0, 10);

  const [jobProfile, setJobProfile] = useState(null);

useEffect(() => {
    fetchJobProfile();
}, []);

  const fetchJobProfile = async () => {
      try {
          const res = await api.get("/api/job-profile");
          setJobProfile(res.data);
      } catch (error) {
          setJobProfile(null);
      }
  };
  
  return (
    <>
    <aside className="fixed hidden sm:block top-[75px] left-2 
      h-[85vh] w-80 bg-white shadow-md p-4 z-40
      overflow-y-auto overflow-x-hidden
      scrollbar-thin scrollbar-thumb-gray-400">
        <p className="text-2xl text-center font-bold border-b-2 pb-2 text mb-2">Knowledge Practice</p>
        <button
    onClick={() => {
        if (!jobProfile) {
            setShow(true);
        } else if (jobProfile.type === "creator") {
        } else {
        }
    }}
>
    {!jobProfile
        ? "Post / Find Halal Job"
        : jobProfile.type === "creator"
        ? "Post Job"
        : "Find Job"}
</button>
      <div className="mb-6">
        <ul className="space-y-">
          {visibleMales.map(item => (
            <li key={item.id}
                className="flex items-center gap-3 p-2 lg 
                hover:bg-gray-100 transition cursor-pointer">

              <div className={`w-8 h-8 flex items-center justify-center
                  rounded-full ${item.background} text-white text-lg font-semibold`}>
                    
                {item.image}
              </div>
            <div className="flex flex-col ">
                <span className="text-sm text-gray-700">
                {item.name}
                </span>
               <span className="text-xs text-gray-700">
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
