import {useState,useEffect} from "react";
import api from "../../Api/axios";
import {toast} from "react-toastify";


export default function CreateJob(){


const [categories,setCategories]
=useState([]);


const [loading,setLoading]
=useState(false);


const [formData,setFormData]
=useState({

title:"",
job_category_id:"",
job_type:"",
location:"",
payment:"",
currency:"NGN",
expire_date:"",
objective:"",
description:""

});



const handleChange=(e)=>{

setFormData({

...formData,
[e.target.name]:e.target.value

});

};



const fetchCategories=async()=>{


const res=await api.get(
"/api/job-categories"
);


setCategories(
res.data
);


};



useEffect(()=>{

fetchCategories();

},[]);



const handleSubmit=async(e)=>{

e.preventDefault();


setLoading(true);


try{


await api.post(

"/api/jobs",
formData

);


toast.success(
"Job created successfully."
);


}
catch(error){

toast.error(

error.response?.data?.message

);


}
finally{

setLoading(false);

}


};




return(

<form
onSubmit={handleSubmit}
className="space-y-4"
>


<input

name="title"
placeholder="Job title"
value={formData.title}
onChange={handleChange}
className="w-full border p-3 rounded-lg"

/>



<select

name="job_category_id"

value={formData.job_category_id}

onChange={handleChange}

className="w-full border p-3"

>

<option>

Select Category

</option>


{

categories.map((item)=>(

<option
value={item.id}
key={item.id}
>

{item.name}

</option>

))

}


</select>



<select

name="currency"

value={formData.currency}

onChange={handleChange}

>

<option value="NGN">

NGN

</option>

<option value="USD">

USD

</option>

<option value="GBP">

GBP

</option>

<option value="EUR">

EUR

</option>

</select>



<input

type="number"

name="payment"

value={formData.payment}

onChange={handleChange}

placeholder="Amount"

/>



<input

type="date"

name="expire_date"

value={formData.expire_date}

onChange={handleChange}

/>



<select

name="job_type"

value={formData.job_type}

onChange={handleChange}

>

<option>

Select Type

</option>

<option value="remote">

Remote

</option>

<option value="onsite">

Onsite

</option>

</select>



{

formData.job_type === "onsite" && (

<input

name="location"

placeholder="Location"

value={formData.location}

onChange={handleChange}

/>

)

}



<textarea

name="objective"

placeholder="Objective"

value={formData.objective}

onChange={handleChange}

/>



<textarea

name="description"

placeholder="Description"

value={formData.description}

onChange={handleChange}

/>



<button

disabled={loading}

className="bg-blue-600
text-white
px-5
py-2
rounded-lg"

>

{

loading ?

"Creating..."

:

"Create Job"

}

</button>


</form>


);


}