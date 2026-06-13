import { useState } from "react";
import { BellOff, EyeOff, LogOut, Shield, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../Api/axios";
import AddCommunityMemberModal from "./AddCommunityMemberModal";
import RemoveCommunityMemberModal from "./RemoveCommunityMemberModal";

export default function CommunityActions({
  community,
  setCommunities,
  setExploreCommunities,
  activeCommunity,
  setActiveCommunity,
  setCommunityMessages,
  isAdmin,
  authUser
}) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [unfollowLoading, setUnfollowLoading] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  

  const handleUnfollowCommunity =
  async (community) => {

    try {

      setUnfollowLoading(
        community.id
      );

      await api.post(
        `/api/communities/${community.id}/unfollow`
      );

      setCommunities(prev =>
        prev.filter(
          c => c.id !== community.id
        )
      );

      setExploreCommunities(prev => [

        {
          ...community,
          membership_status:
            "left",
        },

        ...prev,

      ]);

      if (
        activeCommunity?.id ===
        community.id
      ) {

        setActiveCommunity(
          null
        );

        setCommunityMessages(
          []
        );

      }

      setShowLeaveModal(
        false
      );

      setSelectedCommunity(
        null
      );

      toast.success(
        `You unfollowed ${community.community_name}.`
      );

    } catch (err) {

      console.error(
        "Failed to unfollow",
        err
      );

      toast.error(
        "Failed to unfollow community.",
        "error"
      );

    } finally {

      setUnfollowLoading(
        null
      );

    }

  };

  return (
    <>
      {/* MENU BUTTON */}

      {
        isAdmin &&
      <MenuButton
            label= "Add Member to Channel"
            icon= {UserCircle}
            onClick= {() => {
              setShowAddModal(true);
            }}
      />
      }

      {
        isAdmin &&
      <MenuButton
            label= "Remove Member in Channel"
            icon= {Shield}
            onClick= {() => {
              setShowRemoveModal(true);
            }}
      />
      }
{/*  */}
      {
        !isAdmin &&
      <MenuButton
            label= "Unfollow Channel"
            icon= {LogOut}
            onClick= {() => {
              setSelectedCommunity(community);
              setShowLeaveModal(true);
            }}
      />
      }

      {/* MODAL */}
      {showLeaveModal && selectedCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-white text-center p-6">

            <h2 className="text-lg text-black font-semibold">
              Unfollow Channel?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              You will stop receiving updates from{" "}
              <span className="font-semibold">
                {selectedCommunity.community_name}
              </span>.
              You can follow it again later from Explore.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              {/* CANCEL */}
              <button
                onClick={() => {
                  setShowLeaveModal(false);
                  setSelectedCommunity(null);
                }}
                className="px-4 py-2 rounded-lg text-black border border-gray-800"
              >
                Cancel
              </button>

              {/* CONFIRM */}
              <button
                onClick={() =>
                  handleUnfollowCommunity(selectedCommunity)
                }
                disabled={
                  unfollowLoading === selectedCommunity.id
                }
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
              >
                {unfollowLoading === selectedCommunity.id
                  ? "Leaving"
                  : "Leave Channel"}
              </button>

            </div>

          </div>
        </div>
      )}
    {
      showAddModal &&
      <AddCommunityMemberModal 
       communityId={activeCommunity.id}
       onClose={() =>setShowAddModal(false)}
       setActiveCommunity={setActiveCommunity}
      />
    }

    {
      showRemoveModal &&
      <RemoveCommunityMemberModal
      chat={activeCommunity}
       onClose={() =>setShowRemoveModal(false)}
      currentUserId={authUser.id}
      setActiveCommunity={setActiveCommunity}
      />
    }

    </>
  );

  
}

function MenuButton({
  label,
  onClick,
  icon: Icon,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-4 py-3 rounded-2xl
        transition-all duration-200
        hover:bg-white/10
        ${danger ? "text-red-500" : "text-[var(--text-color)]"}
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} />}
        <span className="font-medium text-sm">{label}</span>
      </div>
    </button>
  );
}