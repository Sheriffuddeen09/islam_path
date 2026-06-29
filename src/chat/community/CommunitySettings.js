// CommunitySettings.jsx

import { useState } from "react";
import CommunityActions from "./CommunityActions";
import MembersList from "./MembersList";

export default function CommunitySettings({
  activeCommunity,
  authUser,
  onBack,
  setActiveCommunity,
  setCommunityMessages,
  community, 
  setExploreCommunities,
  setCommunities,
  communities,
  chats, activeChat,
  setMessages, uiMode
}) {


    const [showAvatarPreview, setShowAvatarPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [expandedMessages, setExpandedMessages] = useState({});
    

   const colors = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500"
  ];

  const getColor = (name = "") => {
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }; 
  
  const role = activeCommunity?.my_role;


  const isAdmin =
    role === "admin" ||
    role === "owner";

        const isExpanded =
      expandedMessages[activeCommunity.id];

    const messageText =
      activeCommunity.community_description || "";

    const shouldTrim =
      messageText.length > 250;

    const displayText =
      shouldTrim && !isExpanded
        ? messageText.slice(0, 250) + " "
        : messageText;

  if (!activeCommunity) {

    return null;
  }

  return (

    <div className="h-full max-h-full overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent
    scrollbar-thin flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">

      {/* HEADER */}
      <div className="h-16 shadow-md flex items-center gap-3 px-4">

        {/* MOBILE BACK */}
        <button
          onClick={onBack}
          className={`${uiMode !== "full" ? "block" : "hidden"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
{/*   */}
        <h2 className="font-bold">
          Channel Settings
        </h2>

      </div>

      <div className="p-4">

        <div className="flex flex-col items-center">

          {activeCommunity.community_image ? (

            <img
              src={`
                http://127.0.0.1:8000/storage/${activeCommunity.community_image}
              `}
              className="w-24 h-24 rounded-full object-cover cursor-pointer"

               onClick={() => {
                setPreviewData({
                  image: activeCommunity.community_image,
                  name: activeCommunity.community_name,
                });
                setShowAvatarPreview(true);
              }}
            />

          ) : (

           <>
            <div
              className={`
                w-24
                cursor-pointer
                h-24
                rounded-full
                flex
                items-center
                justify-center
                font-bold
                text-4xl
                text-white
                shrink-0
                ${getColor(
                  community.community_name
                )}
              `}
              onClick={() => {
                setPreviewData({
                  image: activeCommunity.community_image,
                  name: activeCommunity.community_name,
                });
                setShowAvatarPreview(true);
              }}
            >
              {getInitial(
                community?.community_name
              )}
            </div>
            
           </>

          )}

          <h2 className="mt-2 text-xl font-bold">

            {
              activeCommunity.community_name
            }

          </h2>

          <p className="text-sm text-center mb-2 mt-1">

            {displayText}

            {shouldTrim && (
                    <button
                      onClick={() =>
                        setExpandedMessages((prev) => ({
                          ...prev,
                          [activeCommunity.id]:
                            !prev[activeCommunity.id],
                        }))
                      }
                      className="
                        text-green-400
                        text-xs
                        font-semibold
                        hover:underline
                      "
                    >
                      {isExpanded
                        ? ""
                        : "See more"}
                    </button>
                  )}
          </p>

        </div>

        {/* MEMBERS */}
        <MembersList activeCommunity={activeCommunity} currentUser={authUser} />
        <div className={`lg:block hidden border-t pt-3 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent
            ${uiMode !== "full" ? "overflow-y-auto h-32" : ""}`}>
        <CommunityActions isAdmin={isAdmin} onBack={onBack}
          community={community}
          setCommunities={setCommunities}
          setExploreCommunities={setExploreCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          setCommunityMessages={setCommunityMessages}
          communities={communities} chats={chats} 
          activeChat={activeChat}
          authUser={authUser}
          setMessages={setMessages}
          />
          </div>

          <div className={`lg:hidden block border-t pt-3 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-transparent
            ${uiMode !== "full" ? "md:h-full h-60" : ""}`}>
        <CommunityActions isAdmin={isAdmin} onBack={onBack}
          community={community}
          setCommunities={setCommunities}
          setExploreCommunities={setExploreCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          setCommunityMessages={setCommunityMessages}
          communities={communities} chats={chats} 
          activeChat={activeChat}
          authUser={authUser}
          setMessages={setMessages}
          />
          </div>
      </div>

    {showAvatarPreview && (
  <div
    className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center"
    onClick={() => setShowAvatarPreview(false)}
  >
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {previewData?.image ? (
        <img
          src={previewData.image}
          alt={previewData.name}
          className="w-72 h-64 sm:w-80 sm:h-80 object-cover rounded-xl shadow-2xl"
        />
      ) : (
        <div
          className={`w-64 h-72 sm:w-80 sm:h-80 flex items-center justify-center font-bold rounded-full text-white text-[180px] ${getColor(
            previewData?.name
          )}`}
        >
          {getInitial(previewData?.name)}
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
}