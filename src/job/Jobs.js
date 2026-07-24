import {useEffect,useState} from "react";
import api from "../../Api/axios";
import {toast} from "react-toastify";
import JobApplicationModal from "./JobApplicationModal";


export default function Jobs(){

const [jobs,setJobs]=useState([]);
const [loading,setLoading]=useState(true);
const [selectedJob,setSelectedJob]=useState(null);
const [showModal,setShowModal]=useState(false);


const fetchJobs=async()=>{

    try{

        const res=await api.get(
            "/api/jobs"
        );

        setJobs(res.data);

    }
    catch(error){

        toast.error(
            "Unable to fetch jobs."
        );

    }
    finally{

        setLoading(false);

    }

};



useEffect(()=>{

    fetchJobs();

},[]);



const handleApply=(job)=>{

    setSelectedJob(job);

    setShowModal(true);

};



if(loading){

    return(

        <div className="p-10">

            Loading.....

        </div>

    );

}


return(

<div className="p-5">

<h2
className="font-bold
text-2xl
mb-5"
>

Available Jobs

</h2>



<div
className="grid
lg:grid-cols-3
md:grid-cols-2
grid-cols-1
gap-5"
>


{

jobs.map((job)=>(

<div
key={job.id}
className="shadow-lg
border
rounded-xl
p-5"
>


<h2
className="font-bold
text-xl"
>

{job.title}

</h2>


<p>

{job.category.name}

</p>



<p>

{job.job_type}

</p>



<p>

₦{job.payment}

</p>


<p>

Expires:

{" "}

{new Date(
job.expire_date
).toLocaleDateString()}

</p>



<p
className="mt-3"
>

{job.objective}

</p>



<button

onClick={()=>handleApply(job)}

className="mt-5
bg-blue-600
text-white
px-4
py-2
rounded-lg"

>

Apply

</button>


</div>

))

}


</div>



{

showModal && (

<JobApplicationModal

job={selectedJob}
setShowModal={setShowModal}

/>

)

}



</div>

);


}