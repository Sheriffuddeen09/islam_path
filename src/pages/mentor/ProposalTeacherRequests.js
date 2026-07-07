import { useEffect, useState } from "react";
import api from "../../Api/axios";
import ProposalTeacherProfileModal from "./ProposalTeacherProfileModal";

export default function ProposalTeacherRequests({setActiveChat, setMessages, togglePopup, setChats}) {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [actionLoading, setActionLoading] = useState(null);
    const [rejectLoading, setRejectLoading] = useState(null);

    useEffect(() => {

        fetchRequests();

    }, []);

    const fetchRequests = async () => {
        

        try {
             setLoading(true);

            const res = await api.get(
                "/api/student/teacher-requests"
            );
            
            setRequests(res.data);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

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

    const getColor = (name="") => {

        const colors = [

            "bg-red-500",
            "bg-blue-500",
            "bg-green-500",
            "bg-purple-500",
            "bg-pink-500",
            "bg-orange-500",
            "bg-cyan-500"

        ];

        return colors[
            name.length % colors.length
        ];

    };

    const getInitial = (name="") => {

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

        <>

        <div className="lg:ml-64">
            <h1 className="w-full text-[var(--text-color)] 
            border-b-2 border-blue-500 mb-6 pb-2 text-2xl font-bold ">Student Proposal</h1>
            {requests.length===0 &&(

                <div className="col-span-full">

                    <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-2xl shadow p-10 text-center">

                        <h2 className="text-2xl font-bold">

                            No Teacher Requests

                        </h2>

                        <p className="mt-3">

                            No teacher has applied for your proposal yet.

                        </p>

                    </div>

                </div>

            )}

            {requests.map( request => { 
                const cvUrl = request.teacher_form?.cv
                ? `http://localhost:8000/storage/${request.teacher_form.cv}`
                : null;


                const t = request.teacher_form;

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
                

                <div

                    key={request.id}

                    

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
                    p-5
                    text-black
                    mt-3
                    "

                >

                    <div className="flex flex-col md:flex-row gap-5">

                        {/* Avatar */}

                        <div className="flex justify-start md:block"
                        onClick={()=>
                        setSelectedTeacher(request)
                    }>

                            {request.teacher_form?.logo_url ? (

                                <img
                                    src={request.teacher_form.logo_url}
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
                                        ${getColor(request.teacher.first_name)}
                                    `}
                                >

                                    {getInitial(request.teacher.first_name)}

                                </div>

                            )}

                        </div>
                        {/* Right */}

                        <div className="flex-1"
                        onClick={()=>
                        setSelectedTeacher(request)
                    }>

                        <div className="inline-flex items-center flex-wrap gap-2">
                            <span className="bg-green-200 rounded-lg text-gray-500
                            p-1 text-[8px] font-semibold">Applied for : </span>
                            <h2 className="font-bold text-xs text-gray-800">

                                {request.proposal.title}

                                <span className="mx-2 text-black">•</span>

                                <span className="text-blue-600">

                                    {request.proposal.subject}

                                </span>

                            </h2>
                            </div>

                            <br />

                            <div className="inline-flex items-center flex-wrap gap-2">
                            <span className="bg-blue-200 rounded-lg text-gray-500
                            p-1 text-[8px]"> Amount Budget </span>
                            <h2 className="font-bold text-sm text-gray-800">

                            {currencySymbol(request.proposal.currency)}
                                    {request.proposal.price}

                            </h2>
                            </div>
                            <br/>
                        <div className="inline-flex items-center flex-wrap text-xs mt-1 ">
                             <span>

                                ⏰ {request.proposal.teaching_hours} hrs

                            </span>

                            <span>

                                🕒 {request.proposal.from_time}

                                {" - "}

                                {request.proposal.to_time}

                            </span>
                            </div>

                            <h2 className="font-bold text-xl mt-3 sm:mt-0">

                                {request.teacher.first_name}

                                {" "}

                                {request.teacher.last_name}
                            </h2>

                           <div className="inline-flex flex-wrap items-center gap-2 text-black text-sm">

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
                            
                            <span className="mx-2 text-black">•</span>

                                 <span className="text-sm">

                                  💼 {request.teacher_form.experience}

                                </span>

                                
                                <span>

                                    💰

                                    {request.teacher_form.currency}

                                    {" "}

                                    {request.teacher_form.course_payment}

                                </span>

                            </div>

                        </div>

                    <div className=" mb-3">
                                                    
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
                                py-2
                                rounded-lg
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                text-sm
                                font-semibold
                                mb-3
                            "
                        >

                            📄 View CV

                        </a>

                    )}

                                {request.status==="pending"&&(

                                    <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg ml-2 text-sm">

                                        Pending

                                    </span>

                                )}

                                {request.status==="accepted"&&(

                                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg ml-2 text-sm">

                                        Accepted

                                    </span>

                                )}

                                {request.status==="declined"&&(

                                    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-lg ml-2 text-sm">

                                        Declined

                                    </span>

                                )}

                                 {request.status === "cancelled" && (
                                        <span className="bg-gray-100 text-gray-700 whitespace-nowrap px-4 py-2 rounded-lg mt-2 sm:ml-2 text-sm">
                                            Cancelled by Teacher
                                        </span>
                                    )}

                            </div>
                    </div>
                 <span className="text-sm font-semibold mt-2" onClick={()=>
                        setSelectedTeacher(request)
                    }>

                    🎓 {request.teacher_form.qualification.length > 200
                        ? request.teacher_form.qualification.slice(0, 200) + "..."
                        : request.teacher_form.qualification}

                </span>

                </div>

            )})}

        </div>

        {

            selectedTeacher&&(

                <ProposalTeacherProfileModal

                    teacher={selectedTeacher}
                    setRequests={setRequests}
                    setSelectedTeacher={setSelectedTeacher}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                    rejectLoading={rejectLoading}
                    setRejectLoading={setRejectLoading}
                    onClose={() => setSelectedTeacher(null)}
                    setActiveChat={setActiveChat} setMessages={setMessages} 
                    togglePopup={togglePopup}
                    setChats={setChats}

                />

            )

        }

        </>

    );

}