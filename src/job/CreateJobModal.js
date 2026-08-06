import { useEffect, useState } from "react";
import {
    X,
    Briefcase,
    PlusCircle,
    FileText,
    Building2,
    ClipboardList,
    MapPin,
    DollarSign,
    Calendar,
    Users,
    Award,
    CheckCircle2,
    Wallet,
    ToggleLeft,
    ToggleRight,
    Search,
    XCircle,
    Sparkles,
    Clock,
    Building,
    Laptop
} from "lucide-react";
import api from "../Api/axios";


export default function CreateJobModal({

    open,
    onClose,
    onCreated

}) {

    const [loadingCategories, setLoadingCategories] = useState(false);

    const [categories, setCategories] = useState([]);

    const [errors, setErrors] = useState({});

    const [skills,setSkills]=useState([]);

    const [loadingSkills,setLoadingSkills]=useState(false);

    const [skillSearch,setSkillSearch]=useState("");

    const [showSkillDropdown,setShowSkillDropdown]=useState(false);
    const [saving, setSaving] = useState(false);

    const [success, setSuccess] = useState("");


            const jobTypes = [
            {
                value: "remote",
                title: "Remote",
                icon: Laptop,
                description: "Employees work remotely"
            },
            {
                value: "on-site",
                title: "On-site",
                icon: Building,
                description: "Employees work from your office"
            },
            {
                value: "part-time",
                title: "Part Time",
                icon: Clock,
                description: "Flexible working hours"
            }
        ];

        const currencies = [
            "NGN",
            "USD",
            "EUR",
        ];


    const [form, setForm] = useState({

        job_category_id: "",
        new_category: "",
        title: "",
        description: "",
        about_us: "",
        what_you_do: "",
        location: "",
        job_type: "remote",

        currency: "NGN",

        payment: "",

        employee_needed: 1,

        additional_compensation: "",

        enable_qualification: false,

        qualification: "",


        enable_experience: false,

        experience: "",

        enable_year_experience: false,

        year_experience: "",

        payment_required: false,

        expire_date: ""

    });



// validate

    useEffect(()=>{

        if(!open) return;

        fetchCategories();

        fetchSkills();

    },[open]);



const fetchSkills = async()=>{

    try{

        setLoadingSkills(true);

        const res = await api.get("/api/job-skills");

        setSkills(res.data.skills);

    }

    catch(error){

        console.log(error);

    }

    finally{

        setLoadingSkills(false);

    }

};

const filteredSkills = (skills || []).filter(skill => {

    const selected = (form.skills || []).includes(skill.id);

    const match = skill.name
        .toLowerCase()
        .includes(skillSearch.toLowerCase());

    return !selected && match;

});

const addSkill = (skill) => {

    setForm(prev => ({

        ...prev,

        skills: [
            ...(prev.skills || []),
            skill.id
        ]

    }));

    setSkillSearch("");

};

const removeSkill = (id) => {

    setForm(prev => ({

        ...prev,

        skills: (prev.skills || []).filter(
            skill => skill !== id
        )

    }));

};

const resetForm = () => {

    setErrors({});

    setSuccess("");

    setSkillSearch("");

    setShowSkillDropdown(false);

    setForm({

        job_category_id: "",

        new_category: "",

        title: "",

        description: "",

        about_us: "",

        what_you_do: "",

        location: "",

        job_type: "remote",

        currency: "NGN",

        payment: "",

        employee_needed: 1,

        additional_compensation: "",

        enable_qualification: false,

        qualification: "",

        enable_experience: false,

        experience: "",

        enable_year_experience: false,

        year_experience: "",

        payment_required: false,

        expire_date: "",


    });

};


const validate = () => {

    const validationErrors = {};

    if (!form.job_category_id) {
        validationErrors.job_category_id = "Select a category.";
    }

    if (
        form.job_category_id === "other" &&
        !(form.new_category || "").trim()
    ) {
        validationErrors.new_category = "Enter a new category.";
    }

    if (!(form.title || "").trim()) {
        validationErrors.title = "Job title is required.";
    }

    if (!(form.description || "").trim()) {
        validationErrors.description = "Description is required.";
    }

    if (!(form.about_us || "").trim()) {
        validationErrors.about_us = "About us is required.";
    }

    if (!(form.what_you_do || "").trim()) {
        validationErrors.what_you_do = "Responsibilities are required.";
    }

    if (
        form.job_type !== "remote" &&
        !(form.location || "").trim()
    ) {
        validationErrors.location = "Location is required.";
    }

    if (!form.expire_date) {
        validationErrors.expire_date = "Expire date is required.";
    }

    setErrors(validationErrors);

    const isValid = Object.keys(validationErrors).length === 0;

    console.log("Validation Errors:", validationErrors);
    console.log("Validation Result:", isValid);

    return isValid;
};


const handleSubmit = async (e) => {

    e.preventDefault();

    //  console.log("Step 1");
    // console.log("Current Form:", form);


    // if (!validate()) {
    //     console.log("Validation failed");
    //     return;
    // }

    // console.log("Step 2");

    

    try {

        setSaving(true);

        setErrors({});

        console.log("FORM STATE", form);

        const data = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            console.log(key, value);
            data.append(key, value ?? "");
        });

        const res = await api.post(
            "/api/jobs",
            data
        );

        setSuccess(res.data.message);

        // if (onCreated) {
        //     onCreated(res.data.job);
        // }

        resetForm();

        setTimeout(() => {
            onClose();
        }, 1500);

    } catch (error) {

        if (error.response?.status === 422) {

            setErrors(error.response.data.errors);

        }

    } finally {

        setSaving(false);

    }

};

// prev
    const fetchCategories = async () => {

        try {

            setLoadingCategories(true);

            const res = await api.get("/api/job-categories");

            setCategories(res.data.categories);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoadingCategories(false);

        }

    };




const ToggleCard = ({
    title,
    description,
    checked,
    onChange,
    icon: Icon
}) => {

    return (

        <div className="border rounded-2xl p-5 flex justify-between  items-center">

            <div className="flex gap-4 flex-wrap">

                <div className="bg-blue-50 rounded-xl p-3">

                    <Icon
                        className="text-blue-600"
                        size={24}
                    />

                </div>

                <div>

                    <h4 className="font-semibold">

                        {title}

                    </h4>

                    <p className="text-sm ">

                        {description}

                    </p>

                </div>

            </div>

            <button
                type="button"
                onClick={onChange}
            >
                {

                    checked ?

                        <ToggleRight
                            size={42}
                            className="text-green-600"
                        />

                        :

                        <ToggleLeft
                            size={42}
                            className=""
                        />

                }
            </button>

        </div>

    );

};




    const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setForm(prev => ({

        ...prev,

        [name]: type === "checkbox" ? checked : value

    }));

};


const characterCount = (value = "", max = 5000) => {

    const text = value || "";

    return (

        <div className="flex justify-end mt-1">

            <span
                className={`text-xs ${
                    text.length > max
                        ? "text-red-500"
                        : "text-gray-400"
                }`}
            >
                {text.length}/{max}
            </span>

        </div>

    );

};





    if (!open) return null;





    return (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center sm:p-4 p-2">

            {
                success &&

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">

                    <p className="text-green-700">

                        {success}

                    </p>

                </div>
            }

            <form

            onSubmit={handleSubmit}

            className="bg-[var(--bg-color)] text-[var(--text-color)]  
            w-full sm:max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto
            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin animate-fadeIn">

                {/* HEADER */}

                <div className="flex items-center justify-between sm:px-6 px-2 py-5 border-b">

                    <div className="flex items-center gap-3">

                        <div className="bg-blue-100 p-3 rounded-xl">

                            <Briefcase
                                className="text-blue-600"
                                size={24}
                            />

                        </div>

                        <div>

                            <h2 className="font-bold sm:text-2xl text-xl">

                                Create Job Post

                            </h2>

                            <p className="text-sm">

                                Fill in your job details.

                            </p>

                        </div>

                    </div>



                   <button

                        type="button"

                        disabled={saving}

                        onClick={onClose}

                    >

                        <X />

                    </button>
                </div>





                {/* BODY */}

                <div className="p-6 space-y-6">


                    {/* Category */}

                    <div>

                        <label className="font-semibold mb-2 block">

                            Job Category

                        </label>

                        {

                            loadingCategories ?

                                (

                                    <div className="animate-pulse">

                                        <div className="h-12 rounded-lg bg-gray-200"></div>

                                    </div>

                                )

                                :

                                (

                                    <select

                                        name="job_category_id"

                                        value={form.job_category_id}

                                        onChange={handleChange}

                                        className="w-full border text-black rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"

                                    >

                                        <option value="">

                                            Select Category

                                        </option>

                                        {

                                            categories.map(category => (

                                                <option

                                                    key={category.id}

                                                    value={category.id}

                                                >

                                                    {category.name}

                                                </option>

                                            ))

                                        }

                                        <option value="other">

                                            Other

                                        </option>

                                    </select>

                                )

                        }

                    </div>





                    {/* OTHER CATEGORY */}

                    {

                        form.job_category_id === "other"

                        &&

                        (

                            <div>

                                <label className="font-semibold mb-2 block">

                                    New Category

                                </label>

                                <div className="relative">

                                    <PlusCircle

                                        size={18}

                                        className="absolute text-black left-4 top-4"

                                    />

                                    <input

                                        type="text"

                                        name="new_category"

                                        value={form.new_category}

                                        onChange={handleChange}

                                        placeholder="Example: Robotics Engineering"

                                        className="pl-11 w-full border text-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500"

                                    />

                                </div>

                            </div>

                        )

                    }



                    <div className="grid lg:grid-cols-2 gap-6">

                        {/* Job Title */}

                        <div className="lg:col-span-2">

                            <label className="font-semibold mb-2 block">

                                Job Title

                            </label>

                            <div className="relative">

                                <Briefcase
                                    size={18}
                                    className="absolute text-black left-4 top-4 "
                                />

                                <input

                                    type="text"

                            name="title"

                            value={form.title}

                            onChange={handleChange}

                            placeholder="Laravel Backend Developer"

                            className={`

                                w-full

                                pl-11

                                pr-4

                                py-3

                                rounded-xl

                                border
                                text-black
                                focus:ring-2

                                focus:ring-blue-500


                                ${errors.title ? "border-red-500" : ""}

                            `}

                        />

                    </div>

                </div>



                <div>

                    <label className="font-semibold mb-2 block">

                        About Us

                    </label>

                    <div className="relative">

                        <Building2

                            size={18}

                            className="absolute text-black left-4 top-4 "

                        />

                        <textarea

                            rows={7}

                            name="about_us"

                            value={form.about_us}

                            onChange={handleChange}

                            placeholder="Tell applicants about your company"

                            className={`

                                w-full

                                pl-11

                                pr-4

                                py-3

                                rounded-xl

                                border

                                resize-none

                                focus:ring-2

                                focus:ring-blue-500
                                text-black

                                ${errors.about_us ? "border-red-500" : ""}

                            `}

                        />

                    </div>

                    {characterCount(form.about_us)}

                </div>


                    <div>

                        <label className="font-semibold mb-2 block">

                            Job Description

                        </label>

                        <div className="relative">

                            <FileText

                                size={18}

                                className="absolute text-black left-4 top-4 "

                            />

                            <textarea

                                rows={7}

                                name="description"

                                value={form.description}

                                onChange={handleChange}

                                placeholder="Describe the position"

                                className={`

                                    w-full

                                    pl-11

                                    pr-4

                                    py-3

                                    rounded-xl

                                    border

                                    resize-none

                                    focus:ring-2

                                    focus:ring-blue-500

                                    text-black

                                    ${errors.description ? "border-red-500" : ""}

                                `}

                            />

                        </div>

                        {characterCount(form.description)}

                    </div>



                    <div className="lg:col-span-2">

                        <label className="font-semibold mb-2 block">

                            What You Will Do

                        </label>

                        <div className="relative">

                            <ClipboardList

                                size={18}

                                className="absolute text-black left-4 top-4 "

                            />

                            <textarea

                                rows={8}

                                name="what_you_do"

                                value={form.what_you_do}

                                onChange={handleChange}

                                placeholder="• Build APIs

                                • Maintain Laravel backend

                                • Collaborate with frontend developers

                                • Write tests

                                • Review pull requests"

                                className={`

                                    w-full

                                    pl-11

                                    pr-4

                                    py-3

                                    rounded-xl

                                    border

                                    resize-none

                                    focus:ring-2

                                    focus:ring-blue-500
                                    text-black
                                    ${errors.what_you_do ? "border-red-500" : ""}

                                `}

                            />

                        </div>

                        {characterCount(form.what_you_do)}

                    </div>

                </div>                


                <div className="border rounded-2xl p-6 space-y-6">

                    <h3 className="text-xl font-bold">

                        Employment Details

                    </h3>

                    {/* Job Type */}

                    <div>

                        <label className="font-semibold mb-4 block">

                            Job Type

                        </label>

                        <div className="grid md:grid-cols-3 gap-4">

                            {jobTypes.map(type => {

                                const Icon = type.icon;

                                return (

                                    <div

                                        key={type.value}

                                        onClick={() =>
                                            setForm(prev => ({
                                                ...prev,
                                                job_type: type.value
                                            }))
                                        }

                                        className={`

                                        border

                                        rounded-xl

                                        p-5

                                        cursor-pointer

                                        transition

                                        hover:border-blue-500
                                        

                                        ${
                                            form.job_type === type.value
                                                ? "border-blue-600 bg-blue-50 text-black"
                                                : "text-[var-(--text-color)]"
                                        }

                                        `}

                                    >

                                        <Icon
                                            className="mb-3 text-blue-600"
                                            size={28}
                                        />

                                        <h4 className="font-semibold">

                                            {type.title}

                                        </h4>

                                        <p className="text-sm  mt-1">

                                            {type.description}

                                        </p>

                                    </div>

                                );

                            })}

                        </div>

                    </div>






                        <div className="grid lg:grid-cols-2 gap-6">

                            {/* Location */}

                            {

                                form.job_type !== "remote"

                                &&

                                <div>

                                    <label className="font-semibold mb-2 block">

                                        Job Location

                                    </label>

                                    <div className="relative">

                                        <MapPin

                                            size={18}

                                            className="absolute text-black left-4 top-4"

                                        />

                                        <input

                                            type="text"

                                            name="location"

                                            value={form.location}

                                            onChange={handleChange}

                                            placeholder="Lagos, Nigeria"

                                            className="w-full border text-black rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500"

                                        />

                                    </div>

                                </div>

                            }



                                    <div>

                                        <label className="font-semibold mb-2 block">

                                            Currency

                                        </label>

                                        <select

                                            name="currency"

                                            value={form.currency}

                                            onChange={handleChange}

                                            className="w-full border text-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500"

                                        >

                                            {

                                                currencies.map(currency => (

                                                    <option

                                                        key={currency}

                                                        value={currency}

                                                    >

                                                        {currency}

                                                    </option>

                                                ))

                                            }

                                        </select>

                                    </div>




                                <div>

                                    <label className="font-semibold mb-2 block">

                                        Salary

                                    </label>

                                    <div className="relative">

                                       
                                        <input

                                            type="text"

                                            name="payment"

                                            value={form.payment}

                                            onChange={handleChange}

                                            placeholder="250000"

                                            className="w-full border text-black rounded-xl py-3 pl-3 pr-3 focus:ring-2 focus:ring-blue-500"

                                        />

                                    </div>

                                </div>



                                <div>

                                    <label className="font-semibold mb-2 block">

                                        Employees Needed

                                    </label>

                                    <div className="relative">

                                        <Users

                                            size={18}

                                            className="absolute text-black left-4 top-4 "

                                        />

                                        <input

                                            type="text"

                                            min={1}

                                            name="employee_needed"

                                            value={form.employee_needed}

                                            onChange={handleChange}

                                            className="w-full text-black border text-black rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500"

                                        />

                                    </div>

                                </div>



                            <div>

                                <label className="font-semibold mb-2 block">

                                    Additional Compensation

                                </label>

                                <input

                                    type="text"

                                    name="additional_compensation"

                                    value={form.additional_compensation}

                                    onChange={handleChange}

                                    placeholder="Housing allowance, bonus, transport"

                                    className="w-full border text-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500"

                                />

                            </div>



                        <div>

                            <label className="font-semibold mb-2 block">

                               Job Expire Date

                            </label>

                            <div className="relative">

                                <Calendar

                                    size={18}

                                    className="absolute text-black left-4 top-4 "

                                />

                                <input

                                    type="date"

                                    name="expire_date"

                                    value={form.expire_date}

                                    onChange={handleChange}

                                    className="w-full border rounded-xl py-3 pl-11 
                                    text-black pr-4 focus:ring-2 focus:ring-blue-500"

                                />

                            </div>

                        </div>

                    </div>

                </div>

                    <div className="border rounded-2xl p-6 space-y-6">

                        <h3 className="text-xl font-bold">

                            Job Requirements

                        </h3>

                        {/* Qualification */}

                        <ToggleCard

                            icon={Award}

                            title="Qualification Required"

                            description="Enable qualification requirements."

                            checked={form.enable_qualification}

                           onChange={() =>
                                setForm(prev => ({
                                    ...prev,
                                    enable_qualification: !prev.enable_qualification
                                }))
                            }

                        />

                        {

                            form.enable_qualification &&

                            <textarea

                                rows={2}

                                name="qualification"

                                value={form.qualification}

                                onChange={handleChange}

                                placeholder="Bachelor Degree

                                    HND

                                    Professional Certification

                                    Islamic Studies"

                                className="w-full border text-black rounded-xl p-4 resize-none focus:ring-2 focus:ring-blue-500"

                            />

                        }

                            <ToggleCard

                                icon={Briefcase}

                                title="Experience Required"

                                description="Require previous experience."

                                checked={form.enable_experience}

                                onChange={() =>
                                    setForm(prev => ({
                                        ...prev,
                                        enable_experience: !prev.enable_experience
                                    }))
                                }

                            />



                            {

                                form.enable_experience &&

                                <textarea

                                    rows={2}

                                    name="experience"

                                    value={form.experience}

                                    onChange={handleChange}

                                    placeholder="Experience working with Laravel

                                    Experience teaching

                                    Customer service"

                                    className="w-full text-black border rounded-xl p-4 resize-none focus:ring-2 focus:ring-blue-500"

                                />

                            }








                                            {/* Years */}

                                            <ToggleCard

                                                icon={CheckCircle2}

                                                title="Specify Years of Experience"

                                                description="Require minimum years."

                                                checked={form.enable_year_experience}

                                               onChange={() =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    enable_year_experience: !prev.enable_year_experience
                                                }))
                                            }

                                            />



                                        {

                                            form.enable_year_experience &&

                                            <div className="max-w-sm">

                                                <label className="font-semibold mb-2 block">

                                                    Minimum Years

                                                </label>

                                                <input

                                                    type="text"

                                                    min={0}

                                                    name="year_experience"

                                                    value={form.year_experience}

                                                    onChange={handleChange}

                                                    className="w-full border text-black rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500"

                                                />

                                            </div>

                                        }


                                        <ToggleCard

                                            icon={Wallet}

                                            title="Payment Required"

                                            description="Show applicants that this position is paid."

                                            checked={form.payment_required}

                                            onChange={() =>
                                                setForm(prev => ({
                                                    ...prev,
                                                    payment_required:
                                                        !prev.payment_required
                                                }))
                                            }

                                        />

                                        {

                                            form.payment_required &&

                                            <div className="rounded-xl bg-green-50 border border-green-200 p-4">

                                                <p className="text-green-700">

                                                    Applicants will clearly see that this job offers financial compensation.

                                                </p>

                                            </div>

                                        }

                                    </div>

                            </div>





                {/* FOOTER */}

                <div className="border-t px-6 py-4 flex justify-end gap-3">

                    <button

                        onClick={onClose}

                        className="px-5 py-3 rounded-xl border"

                    >

                        Cancel

                    </button>



                   <button

                    type="submit"

                    disabled={saving}

                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60"

                >

                    {

                        saving

                        ?

                        <div className="flex items-center gap-2">

                            <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>

                            Creating

                        </div>

                        :

                        "Create Job"

                    }

                </button>

                </div>

            </form>

        </div>

    );

}