import { useEffect, useState } from "react";
import api from "../../Api/axios";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";

export default function ProposalModal({

    proposal,
    onClose,
    setProposals, badges, setBadges
}) {

    const [loadingId, setLoadingId] = useState(null);
    const [loadingUnlock, setLoadingUnlock] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [adsWatched, setAdsWatched] = useState(0);
    




    const sendRequest = async (proposalId) => {

    if(loadingId!==null) return;
    setLoadingId(proposalId);
    try{
        const res = await api.post(
            `/api/teacher-request/${proposalId}`
        );
        setBadges({
            total:res.data.balance
        });

        toast.success(res.data.message);
        setProposals(prev =>
            prev.filter(item => item.id !== proposalId)
        );
    }
    catch(err){
        if(err.response?.status===403){
            setShowUnlockModal(true);
        }
        else{
            toast.error(
                err.response?.data?.message ||
                "Unable to send request.");
        }
    }
    finally{
        setLoadingId(null);
    }

    };


    const handleWatchAd = async () => {
    if(adsWatched>=6) return;
    try{
        const res = await api.post(
            "/api/watch-ad"
        );
        setBadges({
            total:res.data.total
        });
        setAdsWatched(prev=>prev+1);
    }
    catch(err){
        console.log(err);
    }
    };


    const handleUnlock = async (proposalId) => {
    
    if(badges.total<20) return;
    setLoadingUnlock(true);
    try{

        await sendRequest(
            proposalId
        );
        onClose()
        setShowUnlockModal(false);
    }
    finally{
        setLoadingUnlock(false);
    }

    };

    const isProposalSent =
    proposal.request?.status === "pending" ||
    proposal.request?.status === "accepted";

    const currencySymbol = (currency) => {

    switch(currency){

        case "NGN":
            return "₦";

        case "USD":
            return "$";

        case "EUR":
            return "€";

        default:
            return currency;
    }

}

    const colors = [
        "bg-orange-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-pink-500",
        ];
    
        const getColor = (name = "") => {
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
        };
    
        const getInitial = (name) => {
        if (!name) return "?";
        return name.charAt(0).toUpperCase();
        };


        
    return (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">

            <div className="bg-white w-full text-black max-w-3xl rounded-xl p-6 max-h-[90vh] 
            overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">

                <div className="flex items-center gap-4 mt-6">

                     <div
                            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#111827] shadow-sm flex items-center justify-center text-white text-5xl sm:text-7xl font-bold ${getColor(
                            proposal.student.first_name
                            )}`}
                        >
                            {getInitial(proposal.student.first_name)}
                        </div>
                    <div>

                        <h3 className="font-bold text-2xl">

                            {proposal.student.first_name}
                            {" "}
                            {proposal.student.last_name}

                        </h3>
                        <h3 className="font-bold text-sm mt-2">

                            {proposal.student.location}
                        </h3>
                        <div className="inline-flex items-center mt-2 font-bold text-xl">

                        <h2 className="">{proposal.title} </h2> <span className="mx-2"> • </span> <p className=""> {proposal.subject} </p>

                        </div>
                        

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                    <div>

                        <strong>Budget</strong>

                        <p>

                    💰 {currencySymbol(proposal.currency)}
                            {" "}
                            {proposal.price}

                        </p>

                    </div>

                    <div>

                        <strong>Teacher</strong>

                        <p className="capitalise">

                            {proposal.teacher_type}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Mode</strong>

                        <p>

                            {proposal.teaching_mode}

                        </p>

                    </div>



                        {proposal.teaching_mode !== "online" && (
                    <div>
                        <strong>Preferred Location</strong>

                        <span>

                            📍 {proposal.preferred_location}

                        </span>
                    </div>

                    )}


                    <div>

                        <strong>Qualification</strong>

                        <p>

                            {proposal.qualification}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Hours</strong>

                        <p>

                            {proposal.teaching_hours} Hours

                        </p>

                    </div>

                    <div>

                        <strong>From - To</strong>
                    <div className="flex items-center gap-2 text-black text-sm">

                        <span>🕒</span>

                        <span>

                            {proposal.from_time} - {proposal.to_time}

                        </span>

                    </div>
                    </div>

                </div>

                <div className="mt-6">

                    <h3 className="font-bold mb-2">

                        Description

                    </h3>

                    <p className="text-sm">

                        {proposal.description}

                    </p>

                </div>

                <div className="flex justify-end mt-8 gap-3">

                    <button

                        onClick={onClose}

                        className="px-3 font-bold py-3 bg-gray-300 rounded-lg text-sm "

                    >

                        Close

                    </button>
                {isProposalSent ? (
                <button
                    disabled
                    className="w-52 py-3 rounded-full font-bold bg-green-600 text-white cursor-not-allowed"
                >
                    ✓ Proposal Sent
                </button>
                ) : (
                    <button
                   
                    onClick={() => setShowUnlockModal(true)}

                    className="rounded-xl py-3 px-4 font-semibold text-white bg-blue-600
                    hover:bg-blue-700 disabled:bg-gray-400 ">

                    Send Proposal
                    </button>
            )}
                </div>
            </div>

            {showUnlockModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white text-black rounded-lg p-5 w-80 text-center relative">
                  <div className="inline-flex items-end gap-2">
                  <Lock />
                  <h2 className="font-bold text-sm ">Unlock Student Proposal</h2>
                  </div>
                <hr />
                  <button
                    disabled={adsWatched >= 6}
                    onClick={handleWatchAd}
                    className={`w-44 text-xs py-1 mb-12 border-b-2 mt-10 flex justify-center text-center  rounded-lg  text-white ${
                      adsWatched >= 6 ? "bg-gray-300" : "bg-blue-600 text-white"
                    }`}
                  >
                    Watch Ad (+5 badges) ({adsWatched}/6)
                  </button>
                  <div className="flex flex-col mb-10 gap-2">
                    <Lock className="lock  p-1 w-8 h-8 mx-auto border-2 border-black rounded-full"/>
                  <p className="font-bold text-lg ">Badges Required <b>20</b> 🏅</p>
                  </div>
                  <button
                    disabled={badges.total < 20 || loadingUnlock}
                    onClick={() => handleUnlock(proposal.id)}
                    className={`w-52  py-3 rounded-full font-bold  text-white ${
                      badges.total >= 20 ? "bg-red-600" : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loadingUnlock ? 
                    <p className="inline-flex gap-2 items-center">
                      <span className="animate-spin h-4 w-4 border-2 mx-auto border-white border-t-transparent rounded-full"></span>
                      Sending Proposal
                    </p>
                    : "Unlock"}
                  </button>
            
                  {badges.total < 20 && (
                    <p className="text-sm text-red-500 mt-2 text-xs font-semibold ">
                      Your badge is low. Watch ads or pass exam to earn badges.
                    </p>
                  )}
            
                  <button
                    onClick={() => setShowUnlockModal(false)}
                    className="mt-3 top-0 right-2 absolute rounded-full"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
                        w-10  h-10 cursor-pointer">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                  </button>
                  <div className="inline-flex mt-4 gap-2 items-center">
                  <p className="font-bold text-sm">Balance: <b>{badges.total}</b> 🏅</p>
                  </div>
                </div>
              </div>
            )}
        </div>
    );

}