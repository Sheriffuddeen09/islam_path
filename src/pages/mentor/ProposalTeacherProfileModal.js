import { toast } from "react-toastify";
import api from "../../Api/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ProposalTeacherProfileModal({

    teacher,
    setSelectedTeacher,
    setRequests,
    actionLoading,
    setActionLoading,
    rejectLoading, setRejectLoading,
    setActiveChat, setMessages, togglePopup, setChats
}) {

    const [loadingMessageId, setLoadingMessageId] = useState(null);
    
    const getColor = (name = "") => {

        const colors = [
            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-cyan-500",
        ];

        return colors[name.length % colors.length];

    };

    const getInitial = (name = "") => {

        return name.charAt(0).toUpperCase();

    };

    const acceptRequest = async () => {

        if (actionLoading) return;

        setActionLoading(teacher.id);

        try {

            const res = await api.patch(
                `/api/teacher-request/${teacher.id}/accept`
            );

            toast.success(res.data.message);

            setRequests(prev =>
                prev.map(item =>
                    item.id === teacher.id
                        ? {
                              ...item,
                              status: "accepted",
                          }
                        : item
                )
            );

            setSelectedTeacher(prev => ({
                ...prev,
                status: "accepted",
            }));

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to accept request."
            );

        } finally {

            setActionLoading(null);

        }

    };

    const rejectRequest = async () => {

        if (rejectLoading) return;

        setRejectLoading(teacher.id);

        try {

            const res = await api.patch(
                `/api/teacher-request/${teacher.id}/decline`
            );

            toast.success(res.data.message);

            setRequests(prev =>
                prev.map(item =>
                    item.id === teacher.id
                        ? {
                              ...item,
                              status: "declined",
                          }
                        : item
                )
            );

            setSelectedTeacher(prev => ({
                ...prev,
                status: "declined",
            }));

        } catch (err) {

            toast.error(
                err.response?.data?.message ||
                "Unable to decline request."
            );

        } finally {

            setRejectLoading(null);

        }

    };

    const removeCancelledRequest = async () => {

    try {

        setActionLoading(teacher.id);

        await api.delete(
            `/api/student/teacher-request/${teacher.id}`
        );

        toast.success("Request removed.");

        setRequests(prev =>
            prev.filter(item => item.id !== teacher.id)
        );

        setSelectedTeacher(null);

    } catch (err) {

        toast.error(
            err.response?.data?.message ||
            "Unable to remove request."
        );

    } finally {

        setActionLoading(null);

    }
};

   

    const handleMessageTeacher = async () => {

    try {

        setLoadingMessageId(teacher.id);

        try {

            // 1. Open existing chat
            const { data } = await api.get(
                `/api/chat/user/${teacher.teacher_id}`
            );

            togglePopup();
            setActiveChat(data.chat);
            setMessages(data.messages);
            setSelectedTeacher(null);


        } catch (err) {

            // Chat doesn't exist yet
            if (err.response?.status === 404) {

                // 2. Create chat
                const { data } = await api.post(
                    `/api/student/request/${teacher.id}/message`
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
                setSelectedTeacher(null);
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

    const cvUrl = teacher.teacher_form?.cv
                ? `http://localhost:8000/storage/${teacher.teacher_form.cv}`
                : null;


    const t = teacher.teacher_form;

    const normalizeArray = (value) => {
        if (Array.isArray(value)) return value;

        if (typeof value === "string" && value.trim() !== "") {
            try {
                const parsed = JSON.parse(value);

                return Array.isArray(parsed)
                    ? parsed
                    : [value];

            } catch {

                return [value];

            }
        }

        return [];
    };

    const specs = normalizeArray(t?.specialization);

    const isOther =
        t?.coursetitle_name?.toLowerCase() === "other";

    const displayTitle = isOther
        ? "Other"
        : t?.coursetitle_name;


    return (

        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">

            <div className="bg-white text-black rounded-2xl w-full max-w-3xl max-h-[90vh]
             overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">

                <div className="p-8">

                    {/* Header */}

                    <div className="flex flex-col md:flex-row gap-3 items-start">

                         {teacher.teacher_form?.logo_url ? (

                                <img
                                    src={teacher.teacher_form.logo_url}
                                    alt="Teacher Logo"
                                    className="
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        object-cover
                                        shadow-lg
                                    "
                                />

                            ) : (

                                <div
                                    className={`
                                        w-24
                                        h-24
                                        md:w-28
                                        md:h-28
                                        rounded-full
                                        border-4
                                        border-black
                                        flex
                                        items-center
                                        justify-center
                                        text-4xl
                                        text-white
                                        font-bold
                                        ${getColor(teacher.teacher.first_name)}
                                    `}
                                >

                                    {getInitial(teacher.teacher.first_name)}

                                </div>

                            )}

                        <div className="flex-1">

                            <h2 className="text-3xl font-bold">

                                {teacher.teacher.first_name}{" "}
                                {teacher.teacher.last_name}

                            </h2>

                             <p className="font-bold mt-2 text-sm">
                                Teacher Payment 
                                <span className="mx-2 text-black">•</span>
                                {teacher.teacher_form.currency}{" "}
                                {teacher.teacher_form.course_payment}

                            </p>

                            <div className="inline-flex flex-wrap items-center mt-2 gap-2 text-black text-lg 
                            font-semibold">

                            {displayTitle && (

                                <span className="font-semibold">

                                    📚 {displayTitle}

                                </span>

                            )}

                            {isOther &&
                                specs.map((spec, index) => (

                                    <span
                                        key={index}
                                        className="font-semibold"
                                    >

                                        {spec}

                                    </span>

                                ))}
                            <span className="mx-1 text-black">•</span>

                            <p>

                               💼 {teacher.teacher_form.experience}

                            </p>

                           </div>
                            
                             <p className="font-bold mt-2 text-sm">
                                Location
                                <span className="mx-2 text-black">•</span>
                                {teacher.teacher.location}

                            </p>

                            <p className="font-bold mt-2 text-sm capitalize">
                                Gender
                                <span className="mx-2 text-black">•</span>
                                {teacher.teacher.gender}

                            </p>
                        </div>

                         {cvUrl && (

                        <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                mt-4
                                px-4
                                py-3
                                rounded-lg
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                text-sm
                                font-semibold
                            "
                        >

                            📄 View CV

                        </a>

                    )}



                    </div>

                    

                    <div className="mt-5">

                        <div>

                            <h3 className="font-bold  mb-3">

                                Qualification

                            </h3>

                            <p className="text-sm">

                                {teacher.teacher_form.qualification}

                            </p>

                        </div>

                      
                    </div>

                    {/* About */}

                    <div className="mt-4">

                        <h3 className="font-bold text-lg">

                            About Teacher

                        </h3>

                        <p className="text-black text-sm mt-3">

                            {teacher.teacher_form.compliment}

                        </p>

                    </div>

                    {/* Buttons */}

                    <div className="mt-5">

                        {teacher.status === "pending" && (

                            <div className="flex gap-4">

                                <button
                                    onClick={acceptRequest}
                                    disabled={actionLoading === teacher.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-sm text-white rounded-xl py-3 font-bold"
                                >

                                    {actionLoading === teacher.id
                                        ? <p className='inline-flex gap-1 items-center'> 
                                            <Loader2 className="animate-spin text-white" /> 
                                            Accepting</p>
                                        : "Accept"}

                                </button>

                                <button
                                    onClick={rejectRequest}
                                    disabled={rejectLoading === teacher.id}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-sm text-white rounded-xl py-3 font-bold"
                                >

                                    {rejectLoading === teacher.id
                                       ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Rejecting</p>
                                        : "Reject"}

                                </button>

                            </div>

                        )}

                        {teacher.status === "accepted" && (

                            <button
                                onClick={handleMessageTeacher}
                                disabled={loadingMessageId === teacher.id}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold"
                            >
                                {loadingMessageId === teacher.id
                                    ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Loading</p>
                                    : "Message Teacher"}
                            </button>

                        )}

                        {teacher.status === "declined" && (

                            <div className="bg-red-100 text-red-700 mb-3 text-sm rounded-xl p-4 text-center font-semibold">

                                You rejected this request.

                            </div>

                        )}

                        { teacher.status === "declined" && (

                                <div className="space-y-4">

                                    <button
                                        onClick={removeCancelledRequest}
                                        disabled={actionLoading === teacher.id}
                                        className="w-full bg-red-600 hover:bg-red-700 text-sm text-white rounded-xl py-3 font-bold"
                                    >

                                        {actionLoading === teacher.id
                                            ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Rejecting</p>
                                            : "Remove Request"}

                                    </button>

                                </div>

                            )}


                            {teacher.status === "cancelled" && (

                                <div className="space-y-4">

                                    <div className="bg-gray-100 text-gray-700 text-sm rounded-xl p-4 text-center font-semibold">

                                        This teacher cancelled the request.

                                    </div>

                                    <button
                                        onClick={removeCancelledRequest}
                                        disabled={actionLoading === teacher.id}
                                        className="w-full bg-red-600 hover:bg-red-700 text-sm text-white rounded-xl py-3 font-bold"
                                    >

                                        {actionLoading === teacher.id
                                            ? <p className='inline-flex gap-1 items-center'> 
                                        <Loader2 className="animate-spin text-white" /> 
                                        Rejecting</p>
                                            : "Remove Request"}

                                    </button>

                                </div>

                            )}

                    </div>

                </div>

                {/* Close */}

                <button
                    onClick={() =>
                        setSelectedTeacher(null)
                    }
                    className="absolute top-5 right-5 bg-white rounded-full shadow w-10 h-10 hover:bg-gray-100"
                >

                    ✕

                </button>

            </div>

        </div>

    );

}