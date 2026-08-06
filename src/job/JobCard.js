import React from "react";

import {
Link
}
from "react-router-dom";


import {
MapPin,
Briefcase,
DollarSign,
Eye,
CalendarDays
}
from "lucide-react";



export default function JobCard({
job
}){



const profile =
job.user?.jobProfile;



const formatDate=(date)=>{

if(!date)
return "";

return new Date(date)
.toLocaleDateString(
"en-GB",
{
day:"2-digit",
month:"short",
year:"numeric"
}
);

};




return (

<div
className="
bg-white
rounded-3xl
border
shadow-sm
hover:shadow-xl
transition
duration-300
overflow-hidden
"
>


<div
className="
p-6
"
>



{/* COMPANY HEADER */}

<div
className="
flex
items-center
gap-4
"
>



{
profile?.company_logo ?


<img

src={profile.company_logo}

alt="logo"

className="
w-16
h-16
rounded-2xl
object-cover
border
"

/>


:


<div
className="
w-16
h-16
rounded-2xl
bg-blue-100
flex
items-center
justify-center
text-blue-600
font-bold
"
>

{
profile?.company_name
?.charAt(0)
||
"C"
}

</div>

}



<div>


<h3
className="
font-bold
text-lg
text-gray-800
"
>

{
profile?.company_name
||
job.user?.name
}

</h3>


<p
className="
text-sm
text-gray-500
"
>

{
profile?.company_type
||
"Individual"
}

</p>


</div>


</div>







{/* JOB TITLE */}

<div
className="
mt-6
"
>


<h2
className="
text-xl
font-bold
text-gray-900
"
>

{job.title}

</h2>


<p
className="
text-gray-500
mt-2
line-clamp-2
"
>

{job.description}

</p>


</div>







{/* DETAILS */}

<div
className="
mt-6
space-y-3
text-gray-600
"
>


<div
className="
flex
items-center
gap-2
"
>

<MapPin size={18}/>

<span>

{job.location || "Remote"}

</span>

</div>




<div
className="
flex
items-center
gap-2
"
>

<Briefcase size={18}/>

<span>

{job.job_type}

</span>

</div>





<div
className="
flex
items-center
gap-2
"
>

<DollarSign size={18}/>

<span>

₦{Number(job.payment)
.toLocaleString()}

</span>


</div>



<div
className="
flex
items-center
gap-2
"
>

<CalendarDays size={18}/>

<span>

Posted {formatDate(job.created_at)}

</span>

</div>




<div
className="
flex
items-center
gap-2
"
>

<Eye size={18}/>

<span>

{job.views || 0} views

</span>


</div>



</div>







{/* BUTTON */}


<div
className="
mt-6
"
>


<Link

to={`/jobs/${job.id}`}

className="
block
text-center
bg-blue-600
text-white
py-3
rounded-xl
font-semibold
hover:bg-blue-700
transition
"

>


View Details


</Link>


</div>




</div>


</div>

)

}