import React, {
    useEffect,
    useState
} from "react";

import JobCard from "./JobCard";
import api from "../Api/axios";


export default function Jobs(){


const [jobs,setJobs] = useState([]);

const [loading,setLoading] = useState(true);



useEffect(()=>{


api.get("/api/jobs")
.then(res=>{

setJobs(res.data.jobs.data);

})
.finally(()=>{

setLoading(false);

});


},[]);





if(loading)
{

return (

<div className="
grid
md:grid-cols-3
gap-6
p-6
">

{
[1,2,3].map(i=>(

<div
key={i}
className="
h-80
bg-gray-100
animate-pulse
rounded-3xl
"
/>

))
}

</div>

)

}





return (

<div
className="
max-w-7xl
mx-auto
p-6
"
>


<h1
className="
text-3xl
font-bold
mb-8
"
>

Available Jobs

</h1>



<div
className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-6
"
>


{
jobs.map(job=>(

<JobCard

key={job.id}

job={job}

/>

))
}


</div>


</div>


)


}