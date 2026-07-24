import { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../Api/axios";


export default function EditJob() {


    const {id} = useParams();

    const navigate = useNavigate();


    const [loading,setLoading] = useState(true);

    const [submitLoading,setSubmitLoading] = useState(false);

    const [categories,setCategories] = useState([]);


    const [formData,setFormData] = useState({

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



    const handleChange = (e)=>{

        setFormData({

            ...formData,
            [e.target.name]:e.target.value

        });

    };



    const fetchCategories = async()=>{


        try{


            const res = await api.get(
                "/api/job-categories"
            );


            setCategories(
                res.data
            );


        }
        catch(error){

            toast.error(
                "Unable to fetch categories."
            );

        }


    };



    const fetchJob = async()=>{


        try{


            const res = await api.get(

                `/api/jobs/${id}`

            );


            setFormData({

                title:res.data.title,
                job_category_id:res.data.job_category_id,
                job_type:res.data.job_type,
                location:res.data.location || "",
                payment:res.data.payment,
                currency:res.data.currency,
                expire_date:res.data.expire_date,
                objective:res.data.objective,
                description:res.data.description

            });


        }
        catch(error){

            toast.error(
                "Unable to fetch job."
            );

        }
        finally{

            setLoading(false);

        }


    };



    useEffect(()=>{


        fetchCategories();

        fetchJob();


    },[]);




    const handleSubmit = async(e)=>{


        e.preventDefault();


        setSubmitLoading(true);


        try{


            await api.put(

                `/api/jobs/${id}`,
                formData

            );


            toast.success(
                "Job updated successfully."
            );


            navigate(
                "/applicate/jobs"
            );


        }
        catch(error){

            toast.error(

                error.response?.data?.message ||

                "Unable to update job."

            );

        }
        finally{

            setSubmitLoading(false);

        }


    };




    if(loading){

        return(

            <div className="p-10">

                Loading.....

            </div>

        );

    }




    return(

        <div
        className="max-w-5xl
        mx-auto
        p-5"
        >


            <h1
            className="text-3xl
            font-bold
            mb-8"
            >

                Edit Job

            </h1>




            <form
            onSubmit={handleSubmit}
            className="space-y-5"
            >


                <input

                type="text"

                name="title"

                value={formData.title}

                onChange={handleChange}

                placeholder="Job Title"

                className="w-full
                border
                rounded-lg
                p-3"

                />




                <select

                name="job_category_id"

                value={formData.job_category_id}

                onChange={handleChange}

                className="w-full
                border
                rounded-lg
                p-3"

                >


                    <option value="">

                        Select Category

                    </option>


                    {

                        categories.map((category)=>(


                            <option
                            key={category.id}
                            value={category.id}
                            >

                                {category.name}

                            </option>

                        ))

                    }


                </select>




                <select

                name="job_type"

                value={formData.job_type}

                onChange={handleChange}

                className="w-full
                border
                rounded-lg
                p-3"

                >


                    <option value="">

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

                        type="text"

                        name="location"

                        value={formData.location}

                        onChange={handleChange}

                        placeholder="Location"

                        className="w-full
                        border
                        rounded-lg
                        p-3"

                        />

                    )

                }





                <div
                className="grid
                md:grid-cols-2
                gap-5"
                >


                    <input

                    type="number"

                    name="payment"

                    value={formData.payment}

                    onChange={handleChange}

                    placeholder="Payment"

                    className="border
                    rounded-lg
                    p-3"

                    />




                    <select

                    name="currency"

                    value={formData.currency}

                    onChange={handleChange}

                    className="border
                    rounded-lg
                    p-3"

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


                        <option value="CAD">

                            CAD

                        </option>


                        <option value="AUD">

                            AUD

                        </option>


                    </select>



                </div>





                <input

                type="date"

                name="expire_date"

                value={formData.expire_date}

                onChange={handleChange}

                className="w-full
                border
                rounded-lg
                p-3"

                />






                <textarea

                rows={5}

                name="objective"

                value={formData.objective}

                onChange={handleChange}

                placeholder="Job Objective"

                className="w-full
                border
                rounded-lg
                p-3"

                />






                <textarea

                rows={8}

                name="description"

                value={formData.description}

                onChange={handleChange}

                placeholder="Job Description"

                className="w-full
                border
                rounded-lg
                p-3"

                />






                <button

                type="submit"

                disabled={submitLoading}

                className="bg-blue-600
                text-white
                px-8
                py-3
                rounded-lg
                hover:bg-blue-700"

                >

                    {

                        submitLoading ?

                        "Updating....."

                        :

                        "Update Job"

                    }

                </button>



            </form>



        </div>

    );


}