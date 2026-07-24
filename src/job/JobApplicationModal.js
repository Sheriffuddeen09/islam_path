import {useState} from "react";
import api from "../../Api/axios";
import {toast} from "react-toastify";


export default function JobApplicationModal({

job,
setShowModal

}){


const [message,setMessage]=
useState("");

const [loading,setLoading]=
useState(false);



const handleSubmit=async(e)=>{

e.preventDefault();


setLoading(true);


try{


await api.post(

`/api/jobs/${job.id}/apply`,
{

message

}

);


toast.success(
"Application submitted."
);


setShowModal(false);


}
catch(error){

toast.error(

error.response?.data?.message ||

"Unable to submit."

);

}
finally{

setLoading(false);

}


};



return(

<div
className="fixed
inset-0
bg-black/50
flex
items-center
justify-center
z-50"
>

<div
className="bg-white
rounded-xl
p-5
w-full
max-w-xl"
>


<h2
className="font-bold
text-xl
mb-5"
>

Apply For

{" "}

{job.title}

</h2>



<form
onSubmit={handleSubmit}
>


<textarea

required
rows={6}
value={message}
onChange={(e)=>

setMessage(
e.target.value
)

}

placeholder="
Tell the employer
about yourself."

className="
w-full
border
rounded-lg
p-3
resize-none"


/>



<div
className="flex
gap-3
mt-5"
>


<button

type="submit"

disabled={loading}

className="bg-blue-600
text-white
px-4
py-2
rounded-lg"

>

{

loading ?

"Submitting..."

:

"Apply"

}

</button>



<button

type="button"

onClick={()=>

setShowModal(false)

}

className="bg-red-600
text-white
px-4
py-2
rounded-lg"

>

Close

</button>


</div>


</form>


</div>

</div>


);


}