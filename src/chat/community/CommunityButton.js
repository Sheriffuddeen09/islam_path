 

import { MessageCircleDashed } from "lucide-react";
import {
  useState
} from "react";

export default function CommunityButton({
  onOpenChannel, 
  hasUnreadCommunity, isScrolling
}) {

  const [open, setOpen] =
    useState(false);


  

  return (

    <div
      className={`relative transition-all duration-300`}
    >

      {/* FLOAT BUTTON */}
      <button
        onClick={() =>
        {onOpenChannel();}
        }
          className={` absolute bottom-10 right-3 w-12 h-12 rounded-full bg-[#00a884] 
          shadow-2xl flex items-center justify-center text-white 
          ${
          isScrolling
          ? "opacity-0 invisible pointer-events-none"
          : "opacity-100 visible"
          } `}
      >
        <div
        className="relative">
        <MessageCircleDashed size={35} />

          {hasUnreadCommunity && (
              <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 rounded-full bg-red-600 rounded-full animate-pulse" />
              </div>
          )}
        </div>

      </button>

    </div>
  );
}