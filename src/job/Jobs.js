import React, {
    useEffect,
    useState
} from "react";

import JobCard from "./JobCard";
import api from "../Api/axios";
import { Search, X } from "lucide-react";


export default function Jobs(){



const [jobs, setJobs] = useState([]);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);

const [search, setSearch] = useState("");
const [selectedCategory, setSelectedCategory] = useState(null);

const [showCategoryModal, setShowCategoryModal] = useState(false);

const fetchCategories = async () => {

    try {

        const res = await api.get("/api/job-categories");

        setCategories(res.data.categories);

    } catch (err) {

        console.log(err);

    }

};
const fetchJobs = async (category = "", keyword = "") => {

    setLoading(true);

    try {

        const res = await api.get("/api/jobs", {

            params: {

                category,

                search: keyword

            }

        });

        setJobs(res.data.jobs.data);

    }

    finally {

        setLoading(false);

    }

};

useEffect(() => {

    fetchCategories();

    fetchJobs();

}, []);


const handleSearch = () => {

    fetchJobs("", search);

};

const handleKeyDown = (e) => {

    if (e.key === "Enter") {

        handleSearch();

    }

};


const selectCategory = (id) => {

    setSelectedCategory(id);

    fetchJobs(id);

};



if (loading) {

    return (

        <div
            className="
                mx-auto
                pt-16
                sm:pt-24
                sm:px-3
                px-2
                pb-8
            "
        >

            <div className="grid lg:grid-cols-4 lg:gap-8 gap-2">

                {/* ================= Sidebar Skeleton ================= */}

                <div
                    className="
                        hidden lg:block
                        bg-white
                        rounded-3xl
                        border
                        border-gray-200
                        shadow-sm
                        p-5
                        h-fit 
                    "
                >

                    <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse mb-6"></div>

                    {/* Search */}

                    <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>

                    {/* Categories */}

                    <div className="mt-6 space-y-3">

                        {
                            Array.from({ length: 10 }).map((_, index) => (

                                <div
                                    key={index}
                                    className="
                                        h-12
                                        bg-gray-100
                                        rounded-xl
                                        animate-pulse
                                    "
                                />

                            ))
                        }

                    </div>

                </div>

                {/* ================= Job Skeleton ================= */}

                <div className="lg:col-span-3 w-full">

                    <div className="flex justify-between items-center sm:mb-8 mb-3">

                        <div className="h-9 w-56 bg-gray-200 rounded-lg animate-pulse"></div>

                        <div className="h-6 w-28 bg-gray-200 rounded-lg animate-pulse"></div>

                    </div>

                    <div className="space-y-4">

                        {
                            Array.from({ length: 3 }).map((_, index) => (

                                <div
                                    key={index}
                                    className="
                                        bg-white
                                        border
                                        rounded-3xl
                                        p-2
                                        shadow-sm
                                    "
                                >

                                    {/* Company */}

                                    <div className="flex items-center sm:gap-4 gap-1">

                                        <div className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse"></div>

                                        <div className="flex-1">

                                            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>

                                            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>

                                        </div>

                                    </div>

                                    {/* Job Title */}

                                    <div className="mt-3">

                                        <div className="h-6 w-72 bg-gray-200 rounded animate-pulse"></div>

                                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse mt-4"></div>

                                        <div className="h-4 w-4/5 bg-gray-100 rounded animate-pulse mt-2"></div>

                                    </div>

                                    {/* Location & Type */}

                                    <div className="flex justify-between mt-3">

                                        <div className="h-5 w-36 bg-gray-100 rounded animate-pulse"></div>

                                        <div className="h-5 w-28 bg-gray-100 rounded animate-pulse"></div>

                                    </div>

                                    {/* Salary & Posted */}

                                    <div className="flex justify-between mt-3">

                                        <div className="h-10 w-40 rounded-full bg-green-100 animate-pulse"></div>

                                        <div className="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>

                                    </div>

                                </div>

                            ))
                        }

                    </div>

                </div>

            </div>

        </div>

    );

}





return (

<div className="mx-auto px-2 py-8">


<div className="mx-auto px-2 pb-4 sm:pt-6 pt-2  w-full">

    {/* Mobile Search */}

    <div className="lg:hidden sm:mt-10 mt-6">

        <button
            onClick={() => setShowCategoryModal(true)}
            className="
                w-full
                flex
                flex-1
                items-center
                justify-between
                bg-white
                border
                rounded-2xl
                px-2
                py-3
                shadow-sm
            "
        >

            <span className="text-black">

                Search category

            </span>

            <Search />
        </button>

    </div>
</div>

<div className="grid lg:grid-cols-4 gap-6">

{/* Sidebar */}

<div
className="
hidden lg:block
mt-10
bg-[var-(--bg-color)]
text-[var-(--text-color)]
rounded-3xl
border
shadow-sm
p-5
h-fit
sticky
top-24
"
>

<h2
className="
text-xl
font-bold
mb-5
"
>

Categories

</h2>

<div className="relative">

<input

type="text"

value={search}

onChange={(e)=>setSearch(e.target.value)}

onKeyDown={handleKeyDown}

placeholder="Search category..."

className="
w-full
border
rounded-xl
pl-4
pr-12
py-3
outline-none
focus:ring-2
focus:ring-blue-500
"
/>

<button

onClick={handleSearch}

className="
absolute
right-2
top-2
bg-blue-600
text-white
px-3
py-1.5
rounded-lg
hover:bg-blue-700
"

>

Search

</button>

</div>

<div
className="
mt-6
lg:max-h-[430px]
overflow-y-auto
scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
"
>

<button

onClick={()=>{

setSelectedCategory(null);

fetchJobs();

}}

className={`
w-full
text-left
px-4
py-2.5
rounded-xl
transition

${
selectedCategory===null

?

"bg-blue-600 text-white"

:

"mb-1 mt-1 hover:bg-gray-700"

}
`}

>

All Categories

</button>

{

categories.map(category=>(

<button

key={category.id}

onClick={()=>selectCategory(category.id)}

className={`
w-full
text-left
px-4
py-2.5
rounded-xl
transition

${
selectedCategory===category.id

?

"bg-blue-600 text-white"

:

"mb-1 mt-1 hover:bg-gray-700"

}
`}

>

<div className="font-medium">

{category.name}

</div>

</button>

))

}

</div>

</div>

{/* Jobs */}

<div className="lg:col-span-3">

<div
className="
flex
justify-end
items-center lg:mt-6
mb-3 border-green-300 border-b pb-2 font-bold
"
>

<div
className="
"
>

{jobs.length} Jobs Avalaible

</div>

</div>

{

loading

?

<div className="space-y-6">

{

[1,2,3].map(i=>(

<div

key={i}

className="
h-64
rounded-3xl
animate-pulse
bg-gray-100
"
/>

))

}

</div>

:

<div className="space-y-6">

{

jobs.length>0

?

jobs.map(job=>(

<JobCard

key={job.id}

job={job}

/>

))

:

<div
className="
bg-white
rounded-3xl
border
p-10
text-center
text-gray-500
"
>

No jobs found.

</div>

}

</div>

}

</div>

</div>


{
showCategoryModal && (

<div
className="
fixed
inset-0
z-50
bg-black/40
flex
items-end
lg:hidden
"
>

<div
className="
bg-white
w-full
rounded-t-3xl
max-h-[80vh]
overflow-hidden
"
>

<div className="p-5 border-b">

<div className="flex justify-between items-center">

<h2 className="text-xl font-bold">

Categories

</h2>

<button

onClick={() => setShowCategoryModal(false)}

className="
text-2xl
text-black"
>

<X />

</button>

</div>

<div className="relative mt-4">

<input

value={search}

onChange={(e)=>setSearch(e.target.value)}

onKeyDown={handleKeyDown}

placeholder="Search category"

className="
w-full
border
rounded-xl
px-4
py-3
pr-12
outline-none
"

/>

<button

onClick={() => {

handleSearch();

setShowCategoryModal(false);

}}

className="
absolute
right-2
top-2
bg-blue-600
text-white
rounded-lg
px-3
py-1.5
"

>

Search

</button>

</div>

</div>

<div
className="
overflow-y-auto
max-h-[60vh]
p-5
space-y-2
scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
"
>

<button

onClick={() => {

setSelectedCategory(null);

fetchJobs();

setShowCategoryModal(false);

}}

className="
w-full
text-left
px-4
py-3
rounded-xl
bg-blue-600
text-white
"

>

All Categories

</button>

{

categories.map(category=>(

<button

key={category.id}

onClick={() => {

selectCategory(category.id);

setShowCategoryModal(false);

}}

className={`
w-full
text-left
px-4
py-3
rounded-xl
transition
text-black
${
selectedCategory===category.id

?

"bg-green-400 text-white"

:

"text-black"

}
`}

>

{category.name}

</button>

))

}

</div>

</div>

</div>

)
}
</div>

);

}