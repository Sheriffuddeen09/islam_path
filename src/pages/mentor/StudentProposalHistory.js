import { useEffect, useState } from "react";
import api from "../../Api/axios";
import { Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentProposalHistory() {

    const [historys, setHistorys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [showEdit,setShowEdit] = useState(false);
    const [saving,setSaving] = useState(false);
    const [title,setTitle]=useState("");
    const [subject,setSubject]=useState("");
    const [price,setPrice]=useState("");
    const [currency,setCurrency]=useState("");
    const [teacherType,setTeacherType]=useState("");
    const [teachingMode,setTeachingMode]=useState("");
    const [location,setLocation]=useState("");
    const [qualification,setQualification]=useState("");
    const [hours,setHours]=useState("");
    const [fromTime,setFromTime]=useState("");
    const [toTime,setToTime]=useState("");
    const [description,setDescription]=useState("");
    const [expiresIn,setExpiresIn]=useState("7_days");
    
    const [deleteModal, setDeleteModal] = useState(null);
    const [editLoading, setEditLoading] = useState(null);
    const [editProposal, setEditProposal] = useState(null);

    useEffect(() => {

    if (!editProposal) return;

    setTitle(editProposal.title ?? "");
    setSubject(editProposal.subject ?? "");
    setPrice(editProposal.price ?? "");
    setCurrency(editProposal.currency ?? "");
    setTeacherType(editProposal.teacher_type ?? "");
    setTeachingMode(editProposal.teaching_mode ?? "");
    setLocation(editProposal.preferred_location ?? "");
    setQualification(editProposal.qualification ?? "");
    setHours(editProposal.teaching_hours ?? "");
    setFromTime(editProposal.from_time ?? "");
    setToTime(editProposal.to_time ?? "");
    setDescription(editProposal.description ?? "");

}, [editProposal]);



    useEffect(() => {

        fetchHistory();

    }, []);

    const fetchHistory = async () => {

        try {

            const res = await api.get(
                "/api/student/proposals"
            );

            setHistorys(res.data);

        }

        catch(err){

            console.log(err);

        }

        finally{

            setLoading(false);

        }

    };

    

const deleteHistory = async (id) => {

    if (actionLoading) return;

    setActionLoading(id);

    try {

        await api.delete(
            `/api/student/proposals/${id}`
        );

        setHistorys(prev =>
            prev.filter(item => item.id !== id)
        );

        setDeleteModal(null)

    } catch (err) {

        console.log(err);

    } finally {

        setActionLoading(null);

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

    const handleEdit = async (id) => {
    if (editLoading !== null) return;

    setEditLoading(id);

    try {
        const res = await api.get(`/api/student/proposals/${id}`);

        setEditProposal(res.data); 
        setShowEdit(true);

    } catch (err) {
        toast.error("Unable to fetch proposal.");
    } finally {
        setEditLoading(null);
    }
};


    const updateProposal = async()=>{

    try{
        setSaving(true);
        const res = await api.put(
            `/api/student/proposals/${editProposal.id}`,
            {
                title,
                subject,
                price,
                currency,
                teacher_type:teacherType,
                teaching_mode:teachingMode,
                preferred_location:location,
                qualification,
                teaching_hours:hours,
                from_time:fromTime,
                to_time:toTime,
                description,
                expires_in:expiresIn
            }
        );

        toast.success(res.data.message);

        setHistorys(prev=>

            prev.map(item=>

                item.id===editProposal.id

                ? res.data.proposal

                : item

            )

        );

        setShowEdit(false);

    }

    catch(err){

        toast.error(

            err.response?.data?.message ||

            "Update failed."

        );

    }

    finally{

        setSaving(false);

    }

};

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
            {historys.length===0 &&(

                <div className="col-span-full">

                    <div className="bg-[var(--bg-color)] text-[var(--text-color)] border-2 border rounded-xl shadow p-10 text-center">

                        <h2 className="text-xl font-bold">

                            No History

                        </h2>

                        <p className="mt-2">

                            You haven't sent any proposal request yet.

                        </p>

                    </div>

                </div>

            )}

            {historys.map(proposal=>(
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
        text-black
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
                    ${getColor(proposal.title)}`}
                >
                    {getInitial(proposal.title)}
                </div>

            </div>

            {/* Content */}

            <div className="flex-1"  onClick={() => setSelectedProposal(proposal)}>

                {/* Title & Subject */}

                <h2 className="font-bold text-xl text-gray-800">

                    {proposal.title}

                    <span className="mx-2 text-black">•</span>

                    <span className="text-blue-600">

                        {proposal.subject}

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

                        👨‍🏫 {proposal.teacher_type} 

                    </span>

                    {proposal.teaching_mode !== "online" && (
                    <div>
                        <span>Prefer: </span>
                        <span>

                            📍 {proposal.preferred_location}

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

                    💰 {currencySymbol(proposal.currency)}

                        {proposal.price}

                    </span>

                    <span>

                        ⏰ {proposal.teaching_hours} hrs

                    </span>

                    <span>

                        🕒 {proposal.from_time}

                        {" - "}

                        {proposal.to_time}

                    </span>

                </div>

                     
                {/* Description */}

               

            </div>


                    <div>
                    <button
                        onClick={() => handleEdit(proposal.id)}
                        disabled={editLoading === proposal.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-3 rounded"
                    >
                        {editLoading === proposal.id ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading
                            </span>
                        ) : (
                            "Edit"
                        )}
                    </button>
                    <button
                        onClick={() => setDeleteModal(proposal.id)}
                        disabled={actionLoading === proposal.id}
                        className="px-3 ml-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl py-3 font-semibold"
                    >
                       Delete History
                    </button>
                    </div>
           
                </div>

                <p className="mt-4 text-black text-sm font-semibold" 
                onClick={() => setSelectedProposal(proposal)}>

                {proposal.description.length > 200

                        ? proposal.description.substring(0,200)+"..."

                        : proposal.description}
                </p>
            </div>
        </div>
 
            ))}

            {deleteModal && (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

        <div className="bg-white rounded-xl text-center shadow-lg w-[90%] max-w-md p-6">

                <h2 className="text-xl font-bold text-black">
                    Delete Proposal History
                </h2>

            {/* Body */}
            <div className="p-6">
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <p className="text-center text-gray-700 leading-7">
                    Are you sure you want to permanently delete this proposal
                    history?
                </p>

                <p className="text-center text-red-600 font-semibold mt-4">
                    This action cannot be undone and may affect all related
                    fetched records linked to this proposal.
                </p>
            </div>


            <div className="flex justify-end gap-3 mt-6">

                <button
                    onClick={() => setDeleteModal(null)}
                    className="px-5 py-2 rounded-lg text-black bg-gray-200 hover:bg-gray-300"
                >
                    Cancel
                </button>

                <button
                    onClick={() => deleteHistory(deleteModal)}
                    disabled={actionLoading === deleteModal}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                    {actionLoading === deleteModal ? (
                        <span className="inline-flex items-center gap-2">
                            <Loader2 className="animate-spin w-4 h-4" />
                            Deleting
                        </span>
                    ) : (
                        "Delete"
                    )}
                </button>

            </div>

        </div>

    </div>
)}

            {showEdit && editProposal && (

<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

<div className="bg-white text-black rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

{/* Header */}

<div className="flex items-center justify-between border-b px-6 py-5">

<div>

<h2 className="text-2xl font-bold text-gray-900">
Edit Proposal
</h2>

<p className="text-gray-500 text-sm mt-1">
Update your proposal information.
</p>

</div>

<button
onClick={()=>setShowEdit(false)}
className="text-gray-500 hover:text-red-600 text-3xl"
>
×
</button>

</div>

{/* Body */}

<div className="p-6 grid md:grid-cols-2 gap-5">

{/* Title */}

<div className="md:col-span-2">

<label className="font-semibold">
Title
</label>

<input

value={title}

onChange={(e)=>setTitle(e.target.value)}

className="w-full border rounded-xl p-3 mt-2 focus:ring-2 focus:ring-blue-500 outline-none"

/>

</div>

{/* Subject */}

<div>

<label className="font-semibold">
Subject
</label>

<input

value={subject}

onChange={(e)=>setSubject(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

{/* Price */}

<div>

<label className="font-semibold">
Price
</label>

<input

type="text"

value={price}

onChange={(e)=>setPrice(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

{/* Currency */}

<div>

<label className="font-semibold">
Currency
</label>

<select

value={currency}

onChange={(e)=>setCurrency(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="$">$</option>

<option value="₦">₦</option>

<option value="£">£</option>

</select>

</div>

{/* Teacher */}

<div>

<label className="font-semibold">
Preferred Teacher
</label>

<select

value={teacherType}

onChange={(e)=>setTeacherType(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="male">Male</option>

<option value="female">Female</option>

<option value="any">Any</option>

</select>

</div>

{/* Teaching */}

<div>

<label className="font-semibold">
Teaching Mode
</label>

<select

value={teachingMode}

onChange={(e)=>setTeachingMode(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="online">
Online
</option>

<option value="physical">
Physical
</option>

</select>

</div>

{/* Location */}

{teachingMode==="physical" && (

<div>

<label className="font-semibold">
Location
</label>

<input

value={location}

onChange={(e)=>setLocation(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

)}

{/* Qualification */}

<div>

<label className="font-semibold">
Qualification
</label>

<input

value={qualification}

onChange={(e)=>setQualification(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

{/* Hours */}

<div>

<label className="font-semibold">
Teaching Hours
</label>

<input

type="text"

value={hours}

onChange={(e)=>setHours(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

{/* Time */}

<div>

<label className="font-semibold">
Start Time
</label>

<input

type="time"

value={fromTime}

onChange={(e)=>setFromTime(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

<div>

<label className="font-semibold">
End Time
</label>

<input

type="time"

value={toTime}

onChange={(e)=>setToTime(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

{/* Expiry */}

<div className="md:col-span-2">

<label className="font-semibold">
Proposal Expiry
</label>

<select

value={expiresIn}

onChange={(e)=>setExpiresIn(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

>

<option value="20_minutes">
20 Minutes
</option>

<option value="7_days">
7 Days
</option>

<option value="14_days">
14 Days
</option>

<option value="30_days">
30 Days
</option>

<option value="60_days">
60 Days
</option>

</select>

<p className="text-xs text-red-500 mt-2">
Changing this will reset the proposal expiry from the current time.
</p>

</div>

{/* Description */}

<div className="md:col-span-2">

<label className="font-semibold">
Description
</label>

<textarea

rows={6}

value={description}

onChange={(e)=>setDescription(e.target.value)}

className="w-full border rounded-xl p-3 mt-2 resize-none"

/>

</div>

</div>

{/* Footer */}

<div className="border-t px-6 py-5 flex justify-end gap-3">

<button

onClick={()=>setShowEdit(false)}

className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300"

>

Cancel

</button>

<button

onClick={updateProposal}

disabled={saving}

className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"

>

{saving ? 
<p className='inline-flex gap-1 items-center'> 
<Loader2 className="animate-spin text-white" /> 
Updating</p> : "Update Proposal"}

</button>

</div>

</div>

</div>

)}

            {selectedProposal && (

        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

            <div className="bg-white text-black w-full max-w-3xl rounded-xl p-6 max-h-[90vh] 
            overflow-y-auto scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin">

                <div className="flex items-center gap-4 mt-6">

                     <div
                            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#111827] shadow-sm flex items-center justify-center text-white text-5xl sm:text-7xl font-bold ${getColor(
                            selectedProposal?.title
                            )}`}
                        >
                            {getInitial(selectedProposal?.title)}
                        </div>
                    <div>

                        <div className="inline-flex items-center mt-2 font-bold text-xl">

                        <h2 className="">{selectedProposal.title} </h2> {" • "} <p className=""> {selectedProposal.subject} </p>

                        </div>
                        

                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">

                    <div>

                        <strong>Budget</strong>

                        <p>

                    💰 {currencySymbol(selectedProposal.currency)}
                            {" "}
                            {selectedProposal.price}

                        </p>

                    </div>

                    <div>

                        <strong>Teacher</strong>

                        <p className="capitalise">

                            {selectedProposal.teacher_type}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Mode</strong>

                        <p>

                            {selectedProposal.teaching_mode}

                        </p>

                    </div>



                        {selectedProposal.teaching_mode !== "online" && (
                    <div>
                        <strong>Preferred Location</strong>

                        <span>

                            📍 {selectedProposal.preferred_location}

                        </span>
                    </div>

                    )}


                    <div>

                        <strong>Qualification</strong>

                        <p>

                            {selectedProposal.qualification}

                        </p>

                    </div>

                    <div>

                        <strong>Teaching Hours</strong>

                        <p>

                            {selectedProposal.teaching_hours} Hours

                        </p>

                    </div>

                    <div>

                        <strong>From - To</strong>
                    <div className="flex items-center gap-2 text-black text-sm">

                        <span>🕒</span>

                        <span>

                            {selectedProposal.from_time} - {selectedProposal.to_time}

                        </span>

                    </div>
                    </div>

                </div>

                <div className="mt-6" >

                    <h3 className="font-bold mb-2">

                        Description

                    </h3>

                    <p className="text-sm">

                        {selectedProposal.description}

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