import SidebarLeft from "../homepageComponent/SideBarLeft";
import SidebarRight from "../homepageComponent/SidebarRight";
import NotificationPage from "./NotificationPage";

export default function Notifications({handleMessageOpen, jobProfile, setJobProfile, fetchJobProfile, show, setShow,
  showSuccessModal, setShowSuccessModal, showAdvertisement, setShowAdvertisement, showJobCreate, setShowJobCreate,
  handleVideoClick, videoCount
}) {


  const largeScreen = (
    <div className="block md:hidden lg:block">
        <div className="flex flex-col lg:flex-row  items-ce justify-center  mx-auto min-h-screen bg-[var(--bg-color)] 
        text-[var(--text-color)]">

        <SidebarLeft
            jobProfile={jobProfile}
            setJobProfile={setJobProfile}
            fetchJobProfile={fetchJobProfile}
            show={show}
            setShow={setShow}
            showSuccessModal={showSuccessModal} 
            setShowSuccessModal={setShowSuccessModal}
            showAdvertisement={showAdvertisement} setShowAdvertisement={setShowAdvertisement}
            showJobCreate={showJobCreate} setShowJobCreate={setShowJobCreate}
            handleVideoClick={handleVideoClick}
          videoCount={videoCount}

          />
    
    <div className="flex-1 transition-all mx-auto p-4 mt-20 gap-3 flex flex-col">
     <NotificationPage handleMessageOpen={handleMessageOpen} />
      </div>
     
      
      <SidebarRight />
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col lg:flex-row  items-start  mx-auto min-h-screen bg-[var(--bg-color)] 
        text-[var(--text-color)]">
        
       
     <SidebarRight />


      <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
      <NotificationPage handleMessageOpen={handleMessageOpen} />
      </div>
      
    </div>
    </div>
  );

  return (
    <div>
      {largeScreen}
      {ipadScreen}  
    </div>
  )
}
