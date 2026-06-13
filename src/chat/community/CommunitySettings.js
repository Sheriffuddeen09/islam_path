// CommunitySettings.jsx

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
  chats, activeChat
}) {


  const role = activeCommunity?.my_role;


  const isAdmin =
    role === "admin" ||
    role === "owner";


  if (!activeCommunity) {

    return null;
  }

  return (

    <div className="w-full h-full">

      {/* HEADER */}
      <div className="h-16 shadow-md flex items-center gap-3 px-4">

        {/* MOBILE BACK */}
        <button
          onClick={onBack}
          className="md:hidden"
        >

          ←

        </button>

        <h2 className="font-bold">

          Community Settings

        </h2>

      </div>

      <div className="p-4">

        <div className="flex flex-col items-center">

          {activeCommunity.community_image ? (

            <img
              src={`
                http://127.0.0.1:8000/storage/${activeCommunity.community_image}
              `}
              className="w-24 h-24 rounded-full object-cover"
            />

          ) : (

            <div className="w-24 h-24 rounded-full bg-gray-700" />

          )}

          <h2 className="mt-3 text-xl font-bold">

            {
              activeCommunity.community_name
            }

          </h2>

          <p className="text-gray-400 text-sm text-center mt-2">

            {
              activeCommunity.community_description
            }

          </p>

        </div>

        {/* MEMBERS */}
        <MembersList activeCommunity={activeCommunity} currentUser={authUser} />

        <CommunityActions isAdmin={isAdmin} 
          community={community}
          setCommunities={setCommunities}
          setExploreCommunities={setExploreCommunities}
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
          setCommunityMessages={setCommunityMessages}
          communities={communities} chats={chats} 
          activeChat={activeChat}
          authUser={authUser}
          />
      </div>

    </div>
  );
}