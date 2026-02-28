import SideBarRIght from "../homepageComponent/SideBarRIght";
import NotificationPage from "./NotificationPage";

export default function Notifications() {


  const largeScreen = (
    <div className="block md:hidden lg:block">
        <div className="flex flex-col lg:flex-row  items-center justify-  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SideBarRIght
        <SidebarLeft />
     */}
    
    <div className="flex-1 transition-all mx-auto p-4 mt-20 gap-3 flex flex-col items-center">
     <NotificationPage />
      </div>
     
      
      <SideBarRIght />
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col lg:flex-row  items-start  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SideBarLeft someone */}
       
     <SideBarRIght />


      <div className="flex-1 transition-all p-4 mt-20 gap-3 relative right-4 flex flex-col items-end">
      <NotificationPage />
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
