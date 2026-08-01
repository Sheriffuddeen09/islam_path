import { useState } from "react";
import { linkList, islamicApps } from "./LinkData";
import JobProfileModal from "../../job/JobProfileModal";
import { Briefcase, PlusCircle, Search, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../layout/AuthProvider";

export default function SidebarLeft({fetchJobProfile, show, setShow, jobProfile, showSuccessModal, setShowSuccessModal}) {

  const [showMoreMale, setShowMoreMale] = useState(false);

  const links = linkList.filter(item => item.link === "link");
  const [showChannelView, setShowChannelView] = useState(false);
    const [showAppDownload, setShowAppDownload] = useState(true);
    const [seeMoreApps, setSeeMoreApps] = useState(false);
    const navigate = useNavigate()
    const authUser = useAuth()
    
    
    const filteredLinks = linkList.filter((item) => {
    if (item.role && item.role !== authUser?.role) {
        return false;
    }

    return true;
});

  const visibleMales = showMoreMale ? links : links.slice(0, 10);

 
  const isPendingProfile =
    !jobProfile 
const isApprovedProfile =
    jobProfile
  
  return (
<>
<aside
className=" fixed hidden sm:block top-[75px] left-2
h-[90vh] w-72 bg-[var(--bg-color)] shadow-md p-4 z-40
overflow-y-auto overflow-x-hidden
bg-[var(--bg-color)] text-[var(--text-color)] scrollbar
scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
">
<div className="mb-6">
<ul>
{visibleMales.map((item) => (
item.id === 5 ? (
<li
key={item.id}
onClick={() => {
if (isPendingProfile) {
setShow(true);
}
else if (
isApprovedProfile &&
jobProfile?.type === "creator" ) {
}
else if (
isApprovedProfile &&
jobProfile?.type === "finder" ) {
}
}}
className=" flex items-center gap-3 p-2
hover:bg-gray-700 transition cursor-pointer
">
<div
className=" w-8 h-8 flex items-center justify-center
rounded-full text-[var(--text-color)]
text-lg font-semibold
">
{isPendingProfile ? (
<Briefcase size={22} />
) : jobProfile?.type === "creator" ? (
<PlusCircle size={22} />
) : (
<Search size={22} />
)}
</div>
<div className="flex flex-col">
<span className="text-sm text-gray-700">
{isPendingProfile
? "Post / Find Halal Job"
: jobProfile?.type === "creator" ? "Post Job"
: "Find Job"}
</span>
</div>
</li>
) : (
<li
key={item.id}
className=" flex items-center gap-3 p-2
hover:bg-gray-700 transition cursor-pointer
">
<div
className=" w-8 h-8 flex items-center justify-center
rounded-full text-[var(--text-color)]
text-lg font-semibold
">
{item.icon}
</div>
<div className="flex flex-col">
<span className="text-sm text-[var(--text-color)]">
{item.name}
</span>
<span className="text-xs text-[var(--text-color)]">
{item.gender}
</span>
</div>
</li>
)
))}
{filteredLinks.map((list) => (
    <ul key={list.id}>
        <li
            onClick={() => {
                if (list.toggle) {
                    setShowChannelView(true);
                    return;
                }

                if (list.appDownload) {
                    setShowAppDownload(!showAppDownload);
                    return;
                }

                navigate(list.link);
            }}
            className="
                flex items-center gap-3 p-2
                hover:bg-gray-700 transition
                cursor-pointer
            "
        >
            <div
                className="
                    w-8 h-8 flex items-center
                    justify-center rounded-full
                    text-[var(--text-color)]
                    text-lg font-semibold
                "
            >
                {list.icon}
            </div>

            <div className="flex flex-col flex-1">
                <span className="text-sm text-[var(--text-color)]">
                    {list.name}
                </span>
            </div>
        </li>

        {list.appDownload && showAppDownload && (
            <div className="ml-10 space-y-2">
                {(seeMoreApps
                    ? islamicApps
                    : islamicApps.slice(0, 7)
                ).map((app) => (
                    <button
                        key={app.id}
                        className="
                            w-full text-left
                            flex items-center gap-2
                            text-sm p-2 rounded-lg
                            text-[var(--text-color)]
                            hover:bg-gray-700
                        "
                    >
                        {app.icon}
                        <span>{app.name}</span>
                    </button>
                ))}

                <button
                    onClick={() =>
                        setSeeMoreApps(!seeMoreApps)
                    }
                    className="
                        text-sm font-semibold
                        text-blue-600 pb-2
                    "
                >
                    {seeMoreApps
                        ? "See Less"
                        : "See More"}
                </button>
            </div>
        )}
    </ul>
))}
</ul>
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
                      bg-green-700
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
