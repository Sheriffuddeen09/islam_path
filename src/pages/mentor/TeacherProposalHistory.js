import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherProposalHistory({setActiveChat, setMessages, togglePopup, setChats}) {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [loadingMessageId, setLoadingMessageId] = useState(null);



    
    useEffect(() => {

        fetchHistory();

    }, []);

    const fetchHistory = async () => {

        try {

            const res = await api.get(
                "/api/teacher-request-history"
            );

            setHistory(res.data);

        }

        catch(err){

            console.log(err);

        }

        finally{

            setLoading(false);

        }

    };

    const cancelRequest = async (id) => {

    if (actionLoading) return;

    setActionLoading(id);

    try {

        await api.patch(
            `/api/teacher-request/${id}/cancel`
        );

        setHistory(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                          ...item,
                          status: "cancelled",
                      }
                    : item
            )
        );

    } catch (err) {

        console.log(err);

    } finally {

        setActionLoading(null);

    }

};

const deleteHistory = async (id) => {

    if (actionLoading) return;

    setActionLoading(id);

    try {

        await api.delete(
            `/api/teacher-request/${id}`
        );

        setHistory(prev =>
            prev.filter(item => item.id !== id)
        );

    } catch (err) {

        console.log(err);

    } finally {

        setActionLoading(null);

    }

};

const handleMessageTeacher = async ( requestId,
    studentId) => {

    try {

        setLoadingMessageId(requestId);

        try {

            // 1. Open existing chat
            const { data } = await api.get(
                `/api/chat/user/${studentId}`
            );

            setActiveChat(data.chat);
            togglePopup();
            setMessages(data.messages);

        } catch (err) {

            // Chat doesn't exist yet
            if (err.response?.status === 404) {

                // 2. Create chat
                const { data } = await api.post(
                    `/api/student/request/${requestId}/message`
                );

                setChats(prev => {
                    const exists = prev.some(
                        chat => chat.id === data.chat.id
                    );

                    if (exists) return prev;

                    return [data.chat, ...prev];
                });

                // 3. Load messages of the newly created chat
                const msgRes = await api.get(
                    `/api/chats/${data.chat.id}/messages`
                );

                setActiveChat(data.chat);
                setMessages(msgRes.data.messages || []);
                togglePopup();

            } else {

                throw err;

            }

        }

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to open chat."
        );

    } finally {

        setLoadingMessageId(null);

    }

};

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

    if(loading){

        return(

            <div className="grid grid-cols-1 gap-1 p-2 lg:ml-64">

                {[...Array(4)].map((_,i)=>(

                    <div
                        key={i}
                        className="bg-white rounded-2xl border p-6 animate-pulse"
                    >

                        <div className="flex gap-5">

                            <div className="w-24 h-24 rounded-full bg-gray-200"/>

                            <div className="flex-1 space-y-3">

                                <div className="h-5 bg-gray-200 rounded"/>

                                <div className="h-4 bg-gray-200 rounded w-2/3"/>

                                <div className="h-4 bg-gray-200 rounded"/>

                                <div className="h-4 bg-gray-200 rounded w-3/4"/>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        );

    }

    return(

        <div className="lg:ml-64">
            <h1 className="w-full text-[var(--text-color)] border-b-2 border-blue-500 mb-6 pb-2 text-2xl font-bold ">History Proposal</h1>
            {history.length===0 &&(

                <div className="col-span-full">

                    <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl shadow p-10 text-center">

                        <h2 className="text-xl font-bold">

                            No History

                        </h2>

                        <p className="mt-2">

                            You haven't sent any proposal request yet.

                        </p>

                    </div>

                </div>

            )}

            {history.map(proposal=>{

            const isDeletedByStudent = proposal.proposal?.student_deleted;            
            
            return(


             <div
   
    className="
        
        bg-white
        rounded-2xl
        border
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        hover:scale-[1.01]
        transition-all
        duration-300
        cursor-pointer
        overflow-hidden
        px-2
        mt-3
    "
>
    <div className="p-5">

        <div className="
            flex
            flex-col
            md:flex-row
            gap-5
        ">

            {/* Avatar */}

            <div className="flex justify-start md:block"  onClick={() => setSelectedProposal(proposal)}>

                <div
                    className={`w-24 h-24 md:w-28 md:h-28 rounded-full
                    flex items-center justify-center
                    text-4xl
                    font-bold
                    text-white
                    border-4 border-black
                    shadow-lg
                    ${getColor(proposal.student.first_name)}`}
                >
                    {getInitial(proposal.student.first_name)}
                </div>

            </div>

            {/* Content */}

            <div className="flex-1"  onClick={() => setSelectedProposal(proposal)}>

                {/* Title & Subject */}

                <h2 className="font-bold text-xl text-gray-800">

                    {proposal.proposal.title}

                    <span className="mx-2 text-black">•</span>

                    <span className="text-blue-600">

                        {proposal.proposal.subject}

                    </span>

                </h2>

                {/* Type & Location */}

                <div className="
                    flex
                    flex-wrap
                    gap-3
                    mt-2
                    text-sm
                    text-black
                    capitalize
                    font-semibold
                ">

                    
                     <span>
                            
                        📍 {proposal.student.location}

                    </span>

                    <span>

                        👨‍🏫 {proposal.proposal.teacher_type} 

                    </span>

                    {proposal.proposal.teaching_mode !== "online" && (
                    <div>
                        <span>Prefer: </span>
                        <span>

                            📍 {proposal.proposal.preferred_location}

                        </span>
                    </div>
                    )}

                </div>

                {/* Price */}

                <div
                    className="
                        flex
                        flex-wrap
                        gap-5
                        mt-3
                        text-sm
                        font-medium
                    "
                >

                    <span>

                    💰 {currencySymbol(proposal.proposal.currency)}

                        {proposal.proposal.price}

                    </span>

                    <span>

                        ⏰ {proposal.proposal.teaching_hours} hrs

                    </span>

                    <span>

                        🕒 {proposal.proposal.from_time}

                        {" - "}

                        {proposal.proposal.to_time}

                    </span>

                </div>

                     
                {/* Description */}

               

            </div>

            <div>

    {isDeletedByStudent ? (
        <>
            <span className="bg-red-100 text-red-700 px-3 py-3 rounded-xl font-semibold">
                Proposal Deleted by Student
            </span>

            <button
                onClick={() => deleteHistory(proposal.id)}
                disabled={actionLoading === proposal.id}
                className="px-3 ml-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold"
            >
                {actionLoading === proposal.id
                    ? <p className='inline-flex gap-1 items-center'> 
                        <Loader2 className="animate-spin text-white" /> 
                        Deleting History</p>
                    : "Delete History"}
            </button>
        </>
    ) : (
        <>
            {proposal.status === "pending" && (
                <>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-3 rounded-xl">
                        Pending
                    </span>

                    <button
                        onClick={() => cancelRequest(proposal.id)}
                        disabled={actionLoading === proposal.id}
                        className="px-3 bg-red-600 ml-2 hover:bg-red-700 text-sm text-white rounded-xl py-3 font-semibold"
                    >
                        {actionLoading === proposal.id
                            ? <p className='inline-flex gap-1 items-center'> 
                        <Loader2 className="animate-spin text-white" /> 
                        Cancelling Request</p>
                            : "Cancel Request"}
                    </button>
                </>
            )}

            {proposal.status === "accepted" && (
                <div className="flex gap-3">
                    <button
                        onClick={() =>
                            handleMessageTeacher(
                                proposal.id,
                                proposal.student.id
                            )
                        }
                        disabled={loadingMessageId === proposal.id}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 rounded-xl py-3 font-bold"
                    >
                        {loadingMessageId === proposal.id ? (
                            <p className="inline-flex gap-1 items-center">
                                <Loader2 className="animate-spin text-white" />
                                Loading
                            </p>
                        ) : (
                            "Message Student"
                        )}
                    </button>

                    <button
                        onClick={() => deleteHistory(proposal.id)}
                        disabled={actionLoading === proposal.id}
                        className="bg-gray-200 hover:bg-gray-300 rounded-xl px-5"
                    >
                        {actionLoading === proposal.id
                            ? <p className='inline-flex gap-1 items-center'> 
                                <Loader2 className="animate-spin text-white" /> 
                                Deleting</p>
                            : "Delete"}
                    </button>
                </div>
            )}

            {proposal.status === "declined" && (
                <>
                    <span className="bg-red-100 text-red-700 px-3 py-3 rounded-xl">
                                Declined
                            </span>

                            <button
                                onClick={() => deleteHistory(proposal.id)}
                                disabled={actionLoading === proposal.id}
                                className="px-3 bg-gray-700 ml-2 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold"
                            >
                                {actionLoading === proposal.id
                                    ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Deleting History</p>
                                    : "Delete History"}
                            </button>
                        </>
                    )}

                    {proposal.status === "cancelled" && (
                        <>
                            <span className="bg-gray-100 text-gray-700 px-3 py-3 rounded-xl">
                                Cancelled
                            </span>

                            <button
                                onClick={() => deleteHistory(proposal.id)}
                                disabled={actionLoading === proposal.id}
                                className="px-3 ml-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold"
                            >
                                {actionLoading === proposal.id
                                    ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Deleting History</p>
                                    : "Delete History"}
                            </button>
                        </>
                    )}
                </>
            )}

        </div>

                </div>

                <p className="mt-4 text-black text-sm font-semibold" 
                onClick={() => setSelectedProposal(proposal)}>

                {proposal.proposal.description.length > 200

                        ? proposal.proposal.description.substring(0,200)+"..."

                        : proposal.proposal.description}
                </p>
            </div>
        </div>
 
            )})}

            {selectedProposal && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl rounded-xl p-6 max-h-[90vh] 
            overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">

                <div className="flex items-center gap-4 mt-6">

                     <div
                            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#111827] shadow-sm flex items-center justify-center text-white text-5xl sm:text-7xl font-bold ${getColor(
                            selectedProposal.student.first_name
                            )}`}
                        >
                            {getInitial(selectedProposal.student.first_name)}
                        </div>
                    <div>

                        <h3 className="font-bold text-2xl">

                            {selectedProposal.student.first_name}
                            {" "}
                            {selectedProposal.student.last_name}

                        </h3>
                        <h3 className="font-bold text-sm mt-2">

                            {selectedProposal.student.location}
                        </h3>
                        <div className="inline-flex items-center mt-2 font-bold text-xl">

                        <h2 className="">{selectedProposal.proposal.title} </h2> {" • "} <p className=""> {selectedProposal.proposal.subject} </p>

                        </div>
                        

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                    <div>

                        <strong>Budget</strong>

                        <p>

                    💰 {currencySymbol(selectedProposal.proposal.currency)}
                            {" "}
                            {selectedProposal.proposal.price}

                        </p>

                    </div>

                    <div>

                        <strong>Teacher</strong>

                        <p className="capitalise">

                            {selectedProposal.proposal.teacher_type}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Mode</strong>

                        <p>

                            {selectedProposal.proposal.teaching_mode}

                        </p>

                    </div>



                        {selectedProposal.proposal.teaching_mode !== "online" && (
                    <div>
                        <strong>Preferred Location</strong>

                        <span>

                            📍 {selectedProposal.proposal.preferred_location}

                        </span>
                    </div>

                    )}


                    <div>

                        <strong>Qualification</strong>

                        <p>

                            {selectedProposal.proposal.qualification}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Hours</strong>

                        <p>

                            {selectedProposal.proposal.teaching_hours} Hours

                        </p>

                    </div>

                    <div>

                        <strong>From - To</strong>
                    <div className="flex items-center gap-2 text-black text-sm">

                        <span>🕒</span>

                        <span>

                            {selectedProposal.proposal.from_time} - {selectedProposal.proposal.to_time}

                        </span>

                    </div>
                    </div>

                </div>

                <div className="mt-6" >

                    <h3 className="font-bold mb-2">

                        Description

                    </h3>

                    <p className="text-sm">

                        {selectedProposal.proposal.description}

                    </p>

                </div>
            
                <button
                onClick={()=>setSelectedProposal(null)}
                className="px-3 font-bold py-3 float-right mt-3 bg-gray-300 rounded-lg text-sm ">
                Close

                </button>
        </div>
        </div>

        )}
        </div>

    );

}