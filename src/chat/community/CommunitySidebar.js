// CommunitySidebar.jsx

import {
  X
} from "lucide-react";

export default function CommunitySidebar({

  communities,
  activeCommunity,
  setActiveCommunity,
  onClose,

}) {

  return (

    <div className="w-[340px] border-r border-gray-700 bg-[#111b21] flex flex-col">

      {/* HEADER */}
      <div className="h-16 px-4 border-b border-gray-700 flex items-center justify-between">

        <h2 className="text-white font-bold text-xl">

          Communities

        </h2>

        <button
          onClick={onClose}
          className="text-white"
        >

          <X size={24} />

        </button>

      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto">

        {communities.map(
          community => (

          <button
            key={community.id}
            onClick={() =>
              setActiveCommunity(
                community
              )
            }
            className={`w-full p-4 flex gap-3 hover:bg-[#202c33] transition ${
              activeCommunity?.id ===
              community.id
                ? "bg-[#202c33]"
                : ""
            }`}
          >

            <img
              src={
                community.community_image
              }
              className="w-14 h-14 rounded-full object-cover"
            />

            <div className="text-left">

              <h2 className="text-white font-semibold">

                {
                  community.community_name
                }

              </h2>

              <p className="text-sm text-gray-400 line-clamp-1">

                {
                  community.community_description
                }

              </p>

            </div>

          </button>
        ))}

      </div>

    </div>
  );
}