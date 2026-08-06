import React,
{
useEffect,
useState
}
from "react";

import {
useParams,
useNavigate
}
from "react-router-dom";


import axios from "axios";




export default function JobDetail(){


const {id}=useParams();

const navigate=useNavigate();


const [job,setJob]=useState(null);



useEffect(()=>{


axios.get(`/api/jobs/${id}`)
.then(res=>{

setJob(res.data.job);

});


},[id]);



return (

<>

</>

)

}