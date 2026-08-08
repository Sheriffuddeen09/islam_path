import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../Api/axios";

import {
    ArrowLeft,
    Building2,
    MapPin,
    Briefcase,
    DollarSign,
    CalendarDays,
    Eye,
    Users,
    Clock3,
    Share2,
    Bookmark,
    CheckCircle2,
    X
} from "lucide-react";
import toast from "react-hot-toast";
import ApplyJobModal from "./ApplyJobModal";

export default function JobDetails() {

    const { id } = useParams();

    const [job, setJob] = useState(null);

    const [loading, setLoading] = useState(true);

    const [showShareModal, setShowShareModal] = useState(false);
    const [showApplyModal, setShowApplyModal] =
    useState(false);

    const [copied, setCopied] = useState(false);
    const jobLink = `${window.location.origin}/job-finder/${id}`;

    useEffect(() => {

        fetchJob();

    }, [id]);

    const copyLink = async () => {

    try {

        await navigator.clipboard.writeText(jobLink);

        setCopied(true);

        toast.success("Job link copied successfully.");

        setTimeout(() => {

            setCopied(false);

        }, 5000);

    } catch {

        toast.error("Unable to copy link.");

    }

};
const fetchJob = async () => {

    try {

        const res = await api.get(`/api/jobs/${id}`);

        setJob({

            ...res.data.job,

            related_jobs: res.data.related_jobs || []

        });

    } catch (error) {

        console.error(
            "Failed to fetch job:",
            error
        );

    } finally {

        setLoading(false);

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

    const timeAgo = (date) => {

        if (!date) return "";

        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        const intervals = [

            { label: "year", seconds: 31536000 },

            { label: "month", seconds: 2592000 },

            { label: "week", seconds: 604800 },

            { label: "day", seconds: 86400 },

            { label: "hour", seconds: 3600 },

            { label: "minute", seconds: 60 }

        ];

        for (const interval of intervals) {

            const count = Math.floor(seconds / interval.seconds);

            if (count >= 1) {

                return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;

            }

        }

        return "Just now";

    };

    if (loading) {

        return (

            <div className="max-w-7xl mx-auto pt-24 px-3">

                <div className="animate-pulse bg-gray-200 rounded-3xl h-56"></div>

                <div className="grid lg:grid-cols-3 gap-2 mt-6">

                    <div className="lg:col-span-2">

                        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse"></div>

                    </div>

                    <div>

                        <div className="h-96 bg-gray-100 rounded-3xl animate-pulse"></div>

                    </div>

                </div>

            </div>

        );

    }

    if (!job) {

        return (

            <div className="text-center py-24">
                Job not found.
            </div>

        );

    }

    const profile = job.user?.job_profile;

    const logo = profile?.company_logo
        ? `http://localhost:8000/storage/${profile.company_logo}`
        : null;

    return (

        <div className="max-w-7xl mx-auto pt-20 pb-10 px-3">

            <Link
                to="/jobs"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
            >

                <ArrowLeft size={18} />

                Back to Jobs

            </Link>

            <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm overflow-hidden">

                <div className="p-8">

                    <div className="flex flex-col lg:flex-row justify-between gap-8">

                        <div className="flex gap-5">

                            {

                                 logo ?

                                    <img

                                        src={logo}

                                        alt={profile?.company_name}

                                        className="w-28 h-28 rounded-3xl border object-cover"

                                    />

                                    :

                                    <div className="w-28 h-28 rounded-3xl bg-blue-100 flex items-center justify-center">

                                        <Building2 size={40} className="text-blue-600" />

                                    </div>

                            }

                            <div>

                                <div className="flex flex-wrap items-center gap-3">

                                    <h1 className="sm:text-3xl text-xl font-bold">

                                        {job.title}

                                    </h1>

                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">

                                        <CheckCircle2 size={15} />

                                        Approved

                                    </span>

                                </div>
                            <div className='hidden sm:block'>
                                <h2 className="text-xl font-semibold mt-3">

                                    {profile?.company_name}

                                </h2>

                                <p className="mt-1">

                                    {profile?.company_type}

                                </p>

                                <div className="flex flex-wrap gap-6 mt-5">

                                    <div className="flex items-center gap-2">

                                        <MapPin size={18} />

                                        {job.location}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <Briefcase size={18} />

                                        {job.job_type}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <DollarSign size={18} />

                                        {currencySymbol(job.currency)} {Number(job.payment).toLocaleString()}

                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-6 mt-4 text-sm">

                                    <div className="flex items-center gap-2">

                                        <Clock3 size={16} />

                                        Posted {timeAgo(job.approved_at)}

                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Users size={16} />
                                        {job.application_count} Applications
                                    </div>

                                </div>
                                </div>
                            </div>
                            

                        </div>

                            <div className='sm:hidden block'>
                                <h2 className="text-xl font-semibold">

                                    {profile?.company_name}

                                </h2>

                                <p className="mt-1">

                                    {profile?.company_type}

                                </p>

                                <div className="flex flex-wrap gap-6 mt-5">

                                    <div className="flex items-center gap-2">

                                        <MapPin size={18} />

                                        {job.location}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <Briefcase size={18} />

                                        {job.job_type}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <DollarSign size={18} />

                                        {currencySymbol(job.currency)} {Number(job.payment).toLocaleString()}

                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-6 mt-4 text-sm">

                                    <div className="flex items-center gap-2">

                                        <Clock3 size={16} />

                                        Posted {timeAgo(job.approved_at)}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <Users size={16} />

                                        {job.application_count} Applications

                                    </div>

                                </div>
                                </div>
                            
                        <div className="flex flex-col gap-3 lg:w-56">

                            <button
                            onClick={() => setShowApplyModal(true)}
                            className="
                                w-full
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            Apply Now
                        </button>

                            <button
                                onClick={() => setShowShareModal(true)}
                                className="
                                    border
                                    rounded-xl
                                    py-3
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    hover:bg-gray-900
                                    transition
                                "
                            >

                                <Share2 size={18} />

                                Share Job

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            {/* Continue Here */}

           <div className="grid lg:grid-cols-3 gap-6 mt-8">

    {/* ================= LEFT ================= */}

    <div className="lg:col-span-2 space-y-6">

        {/* Job Overview */}

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

            <h2 className="text-2xl font-bold mb-6">

                Job Overview

            </h2>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                <div className="rounded-2xl border-blue-500 border p-5">

                    <div className="flex items-center gap-3 text-blue-600">

                        <DollarSign size={22} />

                        <span className="font-semibold">

                            Salary

                        </span>

                    </div>

                    <h3 className="font-bold text-sm mt-3">

                        {currencySymbol(job.currency)} {Number(job.payment).toLocaleString()}

                    </h3>

                </div>

                <div className="rounded-2xl border-blue-500 border p-5">

                    <div className="flex items-center gap-3 text-blue-600">

                        <Briefcase size={22} />

                        <span className="font-semibold">

                            Job Type

                        </span>

                    </div>

                    <h3 className="font-bold text-sm mt-3 capitalize">

                        {job.job_type}

                    </h3>

                </div>

                <div className="rounded-2xl border-blue-500 border p-5">

                    <div className="flex items-center gap-3 text-blue-600">

                        <MapPin size={22} />

                        <span className="font-semibold">

                            Location

                        </span>

                    </div>

                    <h3 className="font-bold text-sm mt-3">

                        {job.location}

                    </h3>

                </div>

                <div className="rounded-2xl border-blue-500 border p-5">

                    <div className="flex items-center gap-3 text-blue-600">

                        <Users size={22} />

                        <span className="font-semibold">

                            Employees Needed

                        </span>

                    </div>

                    <h3 className="font-bold text-sm mt-3">

                        {job.employee_needed}

                    </h3>

                </div>

               <div className="rounded-2xl border-blue-500 border p-5">

            <div className="flex items-center gap-3 text-blue-600">

                <Users size={22} />

                <span className="font-semibold">

                   Applicants

                </span>

            </div>

    <h3 className="text-sm font-bold mt-3">

        {job.application_count}

    </h3>

    <p className="text-sm mt-2">

        {job.application_count === 1
            ? "1 person has applied"
            : `${job.application_count} people have applied`}

    </p>

</div>
                <div className="rounded-2xl border-blue-500 border p-5">

                    <div className="flex items-center gap-3 text-blue-600">

                        <CalendarDays size={22} />

                        <span className="font-semibold">

                            Expiry

                        </span>

                    </div>

                    <h3 className="font-bold text-sm mt-3">

                        {new Date(job.expire_date).toLocaleDateString()}

                    </h3>

                </div>

            </div>

        </div>

        {/* About Job */}

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

            <h2 className="sm:text-2xl text-xl font-bold mb-5">

                About This Job

            </h2>

            <div className="leading-8 whitespace-pre-line">

                {job.description}

            </div>

        </div>

        {/* About Company */}

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

            <h2 className="sm:text-2xl text-xl font-bold mb-5">

                About Company

            </h2>

            <div className="leading-8 whitespace-pre-line">

                {job.about_us}

            </div>

        </div>

        {/* Responsibilities */}

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

            <h2 className="sm:text-2xl text-xl font-bold mb-5">

                What You'll Do

            </h2>

            <div className="leading-8 whitespace-pre-line">

                {job.what_you_do}

            </div>

        </div>

        {/* Qualification */}

        {

            job.qualification &&

            <div className="rounded-3xl border shadow-sm p-6">

                <h2 className="sm:text-2xl text-xl font-bold mb-5">

                    Qualification

                </h2>

                <div className="leading-8 whitespace-pre-line">

                    {job.qualification}

                </div>

            </div>

        }

        {/* Experience */}

        {

            job.experience &&

            <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

                <h2 className="sm:text-2xl text-xl font-bold mb-5">

                    Experience

                </h2>

                <div className="leading-8 whitespace-pre-line">

                    {job.experience}

                </div>

            </div>

        }

        {/* Additional Compensation */}

        {

            job.additional_compensation &&

            <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6">

                <h2 className="sm:text-2xl text-xl font-bold mb-5">

                    Additional Compensation

                </h2>

                <span className="inline-flex bg-green-100 text-green-700 px-5 py-3 rounded-full font-semibold">

                    {job.additional_compensation}

                </span>

            </div>

        }

    </div>

    <div className="space-y-6">

        <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl border shadow-sm p-6 sticky top-24">

            <h2 className="sm:text-2xl text-xl text-center font-bold mb-6">

                Company Profile

            </h2>

            <div className="flex flex-col items-center">

                {

                    logo ?

                        <img
                            src={logo}
                            className="w-24 h-24 rounded-2xl border object-cover"
                            alt=""
                        />

                        :

                        <div className="w-24 h-24 rounded-2xl bg-blue-100 flex items-center justify-center">

                            <Building2
                                size={38}
                                className="text-blue-600"
                            />

                        </div>

                }

                <h3 className="font-bold text-xl mt-5">

                    {profile?.company_name}

                </h3>

                <p className="">

                    {profile?.company_type}

                </p>

            </div>

            <div className="mt-8 space-y-5">

                <div className="flex justify-between">

                    <span className="">

                        Address

                    </span>

                    <span className="font-medium text-right">

                        {profile?.company_address}

                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="">

                        Country

                    </span>

                    <span className="font-medium">

                        {profile?.company_location}

                    </span>

                </div>

                <div className="flex justify-between">

                    <span className="">

                        Size

                    </span>

                    <span className="font-medium">

                        {profile?.organisation_size}

                    </span>

                </div>

            </div>

        </div>

    </div>

</div>


<div className="bg-[var(--bg-color)] text-[var(--text-color)] mt-5 rounded-3xl border shadow-sm p-6">

    <h2 className="text-xl font-bold">

        Apply for this Job

    </h2>

    <p className=" mt-2">

        Submit your application before the closing date.

    </p>

    <div className="mt-6 space-y-4">

        <div className="flex justify-between">

            <span className="">

                Applications

            </span>

            <span className="font-semibold">

                {job.application_count}

            </span>

        </div>

        <div className="flex justify-between">

            <span className="">

                Posted

            </span>

            <span className="font-semibold">

                {timeAgo(job.approved_at)}

            </span>

        </div>

        <div className="flex justify-between">

            <span className="">

                Expires

            </span>

            <span className="font-semibold">

                {new Date(job.expire_date).toLocaleDateString()}

            </span>

        </div>

    </div>

    <button
    onClick={() => setShowApplyModal(true)}
    className="
        w-full
        bg-blue-600
        hover:bg-blue-700
        text-white
        py-3
        rounded-xl
        font-semibold
        transition
    "
    >
        Apply Now
    </button>

</div>


{/* ================= RELATED JOBS ================= */}

<div className="bg-[var(--bg-color)] text-[var(--text-color)] mt-5 p-2">

    <h2 className="text-xl font-bold mb-5">

        Related Jobs

    </h2>

    {

        job.related_jobs?.length > 0 ? (

            <div className="space-y-4">

                {

                    job.related_jobs.map((related) => (

                        <Link
                            key={related.id}
                            to={`/jobs/${related.id}`}
                            className="
                                block
                                rounded-2xl
                                border
                                p-4
                                hover:border-blue-500
                                transition
                            "
                        >
                                     {

                                 logo ?

                                    <img

                                        src={logo}

                                        alt={profile?.company_name}

                                        className="w-28 h-28 rounded-3xl border object-cover"

                                    />

                                    :

                                    <div className="w-28 h-28 rounded-3xl bg-blue-100 flex items-center justify-center">

                                        <Building2 size={40} className="text-blue-600" />

                                    </div>

                            }

                            <h3 className="font-semibold mt-2">

                                {related.title}

                            </h3>

                            <p className="text-sm  mt-1">

                                {related.user?.job_profile?.company_name}

                            </p>

                            <p className="mt-2 text-sm line-clamp-2">

                                {related.description}

                            </p>

                            <div className="flex items-center gap-4 mt-3 text-sm ">

                               <div className="flex items-center gap-2">
                               
                                    <Briefcase size={18} />

                                    {related.job_type}

                                </div>
                            
                                <span className="bg-green-600 rounded-lg py-2 px-4">

                                    {currencySymbol(related.currency)} {Number(related.payment).toLocaleString()}

                                </span>

                            </div>

                        </Link>

                    ))

                }

            </div>

        ) : (

            <div className="text-center  py-8">

                No related jobs found.

            </div>

        )

    }

</div>


{
showShareModal && (

<div
className="
fixed
inset-0
z-50
bg-black/50
flex
items-center
justify-center
p-4
"
>

<div
className="
bg-[var(--bg-color)] text-[var(--text-color)]
rounded-3xl
w-full
max-w-lg
shadow-2xl
overflow-hidden
"
>

<div
className="
flex
justify-between
items-center
border-b
px-6
py-5
"
>

<h2
className="
text-xl
font-bold
"
>

Share Job

</h2>

<button

onClick={() => setShowShareModal(false)}

className="
text-3xl
leading-none
"

>

<X />

</button>

</div>

<div className="p-6">

<p className="mb-4">

Copy this link to share the job.

</p>

<div
className="
border
rounded-xl
bg-gray-50
p-4
break-all
text-black
text-sm
"
>

{jobLink}

</div>

<div className="flex justify-end items-center gap-4 mt-6">

<button

    onClick={copyLink}

    disabled={copied}

    className={`
        rounded-xl
        py-3
        px-3
        font-semibold
        transition
        ${
            copied
                ? "bg-green-600 text-white cursor-default"
                : "bg-blue-600 hover:bg-blue-700 text-white"
        }
    `}

>

    {copied ? "Copied" : "Copy Link"}

</button>


</div>

</div>

</div>

</div>

)
}

<ApplyJobModal

    job={job}

    isOpen={showApplyModal}

    onClose={() => setShowApplyModal(false)}

    onSuccess={(data) => {

        setJob((previous) => ({

            ...previous,

            application_count:
                data.application_count

        }));

    }}

/>
        </div>

    );

}