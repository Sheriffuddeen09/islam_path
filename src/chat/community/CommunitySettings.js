// CommunitySettings.jsx

export default function CommunitySettings({

  activeCommunity

}) {

  if (!activeCommunity) return null;

  return (

    <div className="w-[350px] border-l border-gray-700 bg-[#111b21] overflow-y-auto">

      <div className="p-6">

        <img
          src={
            activeCommunity.community_image
          }
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />

        <h2 className="text-center text-white text-2xl font-bold mt-5">

          {
            activeCommunity.community_name
          }

        </h2>

        <p className="text-center text-gray-400 mt-3">

          {
            activeCommunity.community_description
          }

        </p>

      </div>

    </div>
  );
}