// CommunityButton.jsx

import {
  Plus,
  Users,
  Megaphone
} from "lucide-react";

import {
  useState
} from "react";

export default function CommunityButton({
  onOpenChannel,
  setShowCommunityModal,
  hasUnreadCommunity
}) {

  const [open, setOpen] =
    useState(false);


  

  return (

    <div
      className={`relative transition-all duration-300`}
    >

      {/* MENU */}
      {open && (

        <div className=" absolute right-4 bottom-20 flex flex-col items-end gap-3 mb-4">

          {/* CHANNEL */}
          <button
            onClick={() => {

              setOpen(false);

              onOpenChannel();

            }}
            className="relative flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Megaphone size={17} />

            <span className="font-medium text-sm">
              Channel
            </span>
           {hasUnreadCommunity && (
              <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 rounded-full bg-red-600 rounded-full animate-pulse" />
              </div>
          )}

            
          </button>

          <button
            onClick={() => {

              setOpen(false);

              setShowCommunityModal(true);

            }}
            className="flex items-center gap-3 bg-[#202c33] text-white px-5 py-3 rounded-2xl shadow-xl"
          >

            <Users size={17} />

            <span className="font-medium text-sm">
              Create Channel
            </span>

          </button>

        </div>
      )}

      {/* FLOAT BUTTON */}
      <button
        onClick={() =>
          setOpen(prev => !prev)
        }
        className=" absolute bottom-10 right-3 w-12 h-12 rounded-full bg-[#00a884] shadow-2xl flex items-center justify-center text-white"
      >
        <div
        className="relative">
        <Plus size={35} />

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