import { useState } from "react";
import { BellOff, Delete, EyeOff, Link2, LogOut, Search, Shield, Trash, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../Api/axios";
import AddCommunityMemberModal from "./AddCommunityMemberModal";
import RemoveCommunityMemberModal from "./RemoveCommunityMemberModal";
import CommunitySearch from "./CommunitySearch";
import ClearCommunityModal from "./ClearCommunityModal";
import DeleteCommunityModal from "./DeleteCommunityModal";
import AdminDeleteCommunityModal from "./AdminDeleteCommunityModal";
import InviteViaLinkModal from "./InviteViaLinkModal";
import { ReportCommunityModal } from "./ReportCommunityModal";

export default function CommunityActions({
  community,
  setCommunities,
  setExploreCommunities,
  activeCommunity,
  setActiveCommunity,
  setCommunityMessages,
  isAdmin,
  authUser,
  setMessages
}) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const [unfollowLoading, setUnfollowLoading] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showCommunitySearchModal, setShowCommunitySearchModal] = useState(false);
  const [communityClearMessage, setCommunityClearMessage] = useState(false);
  const [communityDeleteMessage, setCommunityDeleteMessage] = useState(false);
  const [adminCommunityDeleteMessage, setAdminCommunityDeleteMessage] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReportCommunityModal, setShowReportCommunityModal] = useState(false);


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

const members = activeCommunity?.members || [];

  

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

        
        <MenuButton
            label= "Search"
            icon= {Search}
            onClick= {() => {
              setShowCommunitySearchModal(true);
            }}
      />
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
        !isAdmin &&
      <MenuButton
            label= "Report Channel"
            icon= {UserCircle}
            onClick= {() => {
              setShowReportCommunityModal(true);
            }}
      />
      }

  
      {
        isAdmin &&
      <MenuButton
            label= "Invite Via Link"
            icon= {Link2}
            onClick= {() => {
              setShowInviteModal(true);
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

      {
        isAdmin &&
      <MenuButton
            label= "Clear Channel Message"
            icon= {Delete}
            onClick= {() => {
              setCommunityClearMessage(true);
            }}
      />
      }

      {
        !isAdmin &&
      <MenuButton
            label= "Delete Channel"
            icon= {Trash}
            onClick= {() => {
              setCommunityDeleteMessage(true);
            }}
      />
      }

      {
        isAdmin &&
      <MenuButton
            label= "Delete Channel"
            icon= {Trash}
            onClick= {() => {
              setAdminCommunityDeleteMessage(true);
            }}
      />
      }

      {/* MODAL */}
      {showLeaveModal && selectedCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white text-center p-6">

            <h2 className="text-lg text-black font-semibold">
              Unfollow Channel?
            </h2>

            <p className="mt-2 text-sm text-gray-800">
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
      showAddModal &&(
      <AddCommunityMemberModal 
       communityId={activeCommunity.id}
       onClose={() =>setShowAddModal(false)}
       setActiveCommunity={setActiveCommunity}
      />)
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

    {showCommunitySearchModal && (
          <CommunitySearch
            members={members}
            getColor={getColor}
            getInitial={getInitial}
            showCommunitySearchModal={showCommunitySearchModal} 
            setShowCommunitySearchModal={setShowCommunitySearchModal}
    
          />
    
    )}

     {showReportCommunityModal && (
      
          <ReportCommunityModal
            community={activeCommunity}
            onClose={() => setShowReportCommunityModal(false)}
          />
      
      )}
    
    {communityClearMessage && (
            <ClearCommunityModal
              communityId={activeCommunity?.id}
              onClose={() => setCommunityClearMessage(false)}
              onCleared={() => setMessages([])}
            />
          )}
   

        
        
        {communityDeleteMessage && (
                  <DeleteCommunityModal
                    community={activeCommunity}
                    onClose={() => setCommunityDeleteMessage(false)}
                    setCommunities={setCommunities}
                    setActiveCommunity={setActiveCommunity}
                  />
              )}

              
              {showInviteModal && (
                      <InviteViaLinkModal
                        community={activeCommunity}
                        onClose={() => setShowInviteModal(false)}
                      />
                    )}
              

        {adminCommunityDeleteMessage && (
                  <AdminDeleteCommunityModal
                    activeCommunity={activeCommunity}
                    onClose={() => setAdminCommunityDeleteMessage(false)}
                    setCommunities={setCommunities}
                    setActiveCommunity={setActiveCommunity}
                  />
              )}

       

    </>
  );

  
}

function MenuButton({
  label,
  onClick,
  icon: Icon,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between
        px-4 py-3 rounded-xl
        gap- lg:px-4 md:px-10
        transition-all duration-200
        hover:bg-gray-500 hover:text-white
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon size={25} />}
        <span className="font-medium text-[16px">{label}</span>
      </div>
    </button>
  );
}

