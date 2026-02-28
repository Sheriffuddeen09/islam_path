import SidebarRight from "../homepageComponent/SidebarRight";
import NotificationPage from "./NotificationPage";

export default function Notifications({handleMessageOpen}) {


  const largeScreen = (
    <div className="block md:hidden lg:block">
        <div className="flex flex-col lg:flex-row  items-ce justify-center  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SidebarRight
        <SidebarLeft />
     */}
    
    <div className="flex-1 transition-all mx-auto p-4 mt-20 gap-3 flex flex-col">
     <NotificationPage handleMessageOpen={handleMessageOpen} />
      </div>
     
      
      <SidebarRight />
    </div>
    </div>
  );

  const ipadScreen = (
          <div className="md:block lg:hidden hidden">
        <div className="flex flex-col lg:flex-row  items-start  mx-auto min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* SideBarLeft someone */}
       
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
