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

const logo = job.user?.job_profile?.company_logo
    ? `http://localhost:8000/storage/${job.user?.job_profile?.company_logo}`
    : null;

    const timeAgo = (date) => {

    if (!date) return "";

    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {

        const count = Math.floor(seconds / interval.seconds);

        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }

    }

    return "Just now";
};

return (

<Link
    to={`/job-finder/${job.id}`}
    className="block"
>

<div
    className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        rounded-3xl
        border
        border-gray-200
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        overflow-hidden
        cursor-pointer
    "
>

    <div className="p-6">

        {/* Company */}

        <div className="flex items-center gap-4">

            {
                logo ?

                <img
                    src={logo}
                    alt={job.user?.job_profile?.company_name}
                    className="w-16 h-16 rounded-2xl object-cover border"
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
                        text-3xl
                        font-bold
                        text-blue-700
                    "
                >
                    {job.user?.job_profile?.company_name?.charAt(0)  || "C"}
                </div>
            }

            <div>

                <h3 className="font-bold text-lg">

                    {job.user?.job_profile?.company_name}

                </h3>

                <p className="text-sm">

                    {job.user?.job_profile?.company_type}

                </p>

            </div>

        </div>


        {/* Job Title */}

        <div className="mt-3">

            <h2 className="text-xl font-bold">

                {job.title}

            </h2>

            <p className="mt-2 text-sm line-clamp-2">

                {job.description}

            </p>

        </div>


        {/* Location + Type */}

        <div className="mt-3 flex items-center text-sm justify-between gap-4">

            <div className="flex items-center gap-2">

                <MapPin size={18} />

                <span>{job.location}</span>

            </div>

            <div className="flex items-center gap-2">

                <Briefcase size={18} />

                <span className="capitalize">{job.job_type}</span>

            </div>

        </div>


        {/* Salary + Posted */}

        <div className="mt-3 text-sm flex items-center justify-between">

            <div
                className="
                    bg-green-100
                    text-green-700
                    px-4
                    py-2
                    rounded-full
                    font-semibold
                    text-sm
                "
            >

                {currencySymbol(job.currency)} {Number(job.payment).toLocaleString()}

            </div>

            <div className="flex items-center gap-2 text-sm">

                <CalendarDays size={17} />

                <span>

                    Posted {timeAgo(job.approved_at)}

                </span>

            </div>

        </div>
    </div>

</div>

</Link>

);


}