// CommunityMessages.jsx

import CommunityInput
from "./CommunityInput";

export default function CommunityMessages({

  activeCommunity,
  messages,
  setMessages

}) {

  if (!activeCommunity) {

    return (

      <div className="flex-1 flex items-center justify-center bg-[#0b141a] text-gray-500 text-xl">

        Select Community

      </div>
    );
  }

  return (

    <div className="flex-1 flex flex-col bg-[#0b141a]">

      {/* HEADER */}
      <div className="h-16 border-b border-gray-700 flex items-center px-5">

        <div className="flex items-center gap-3">

          <img
            src={
              activeCommunity.community_image
            }
            className="w-10 h-10 rounded-full"
          />

          <div>

            <h2 className="text-white font-semibold">

              {
                activeCommunity.community_name
              }

            </h2>

            <p className="text-xs text-gray-400">

              Community

            </p>

          </div>

        </div>

      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map(msg => (

          <div
            key={msg.id}
            className="max-w-[70%] bg-[#202c33] text-white rounded-2xl px-4 py-3"
          >

            <p className="text-sm font-semibold text-green-400 mb-1">

              {msg.sender?.name}

            </p>

            <p>
              {msg.message}
            </p>

          </div>

        ))}

      </div>

      {/* INPUT */}
      <CommunityInput
        activeCommunity={
          activeCommunity
        }
        setMessages={setMessages}
      />

    </div>
  );
}