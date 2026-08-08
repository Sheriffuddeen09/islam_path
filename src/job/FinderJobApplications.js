import React, {
    useEffect,
    useState,
} from "react";

import {
    Briefcase,
    CalendarDays,
    MapPin,
    Building2,
    Clock3,
    ChevronRight,
    FileText,
    RefreshCw,
    Search,
    AlertCircle,
    Loader2,
    Trash2,
} from "lucide-react";

import { Link } from "react-router-dom";

import api from "../Api/axios";
import toast from "react-hot-toast";


export default function FinderJobApplications() {

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [error, setError] = useState("");


    const fetchApplications = async (
        showLoader = true
    ) => {

        try {

            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");


            const response = await api.get(
                "/api/my-job-applications"
            );


            setApplications(
                response.data?.applications?.data || []
            );


        } catch (error) {

            console.error(
                "Applications error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load your applications."
            );


        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    useEffect(() => {

        fetchApplications();

    }, []);


        
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

    const getStatusClasses = (status) => {

        switch (status) {

            case "accepted":

                return `
                    bg-green-100
                    text-green-700
                    border-green-200
                `;

            case "rejected":

                return `
                    bg-red-100
                    text-red-700
                    border-red-200
                `;

            case "withdrawn":

                return `
                    bg-orange-100
                    text-orange-700
                    border-orange-200
                `;

            case "expired":

                return `
                    bg-gray-100
                    text-gray-600
                    border-gray-200
                `;

            case "deleted":

                return `
                    bg-red-50
                    text-red-600
                    border-red-200
                `;

            default:

                return `
                    bg-blue-100
                    text-blue-700
                    border-blue-200
                `;

        }

    };

    
        const [removingId, setRemovingId] = useState(null);
    
    const removeApplication = async (applicationId) => {
    
        try {
    
            setRemovingId(applicationId);
    
            await api.delete(
                `/api/job-applications/${applicationId}/remove`
            );
    
    
            setApplications((prev) =>
                prev.filter(
                    (application) =>
                        application.id !== applicationId
                )
            );
    
            toast.success(
                "Application removed successfully."
            );
    
        } catch (error) {
    
            console.error(
                "Remove application error:",
                error
            );
    
            toast.error(
                error.response?.data?.message ||
                "Unable to remove application."
            );
    
        } finally {
    
            setRemovingId(null);
    
        }
    };


    const getStatusIcon = (status) => {

        if (status === "accepted") {

            return "✓";

        }

        if (status === "rejected") {

            return "✕";

        }

        if (status === "withdrawn") {

            return "↩";

        }

        if (status === "expired") {

            return "⌛";

        }

        if (status === "deleted") {

            return "⚠";

        }

        return "•";

    };


    const formatDate = (date) => {

        if (!date) return "";

        return new Date(date).toLocaleDateString(
            undefined,
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );

    };


    const formatTimeAgo = (date) => {

        if (!date) return "";

        const now = new Date();

        const created = new Date(date);

        const seconds = Math.floor(
            (now - created) / 1000
        );

        if (seconds < 60) {

            return "Just now";

        }

        const minutes = Math.floor(
            seconds / 60
        );

        if (minutes < 60) {

            return `${minutes}m ago`;

        }

        const hours = Math.floor(
            minutes / 60
        );

        if (hours < 24) {

            return `${hours}h ago`;

        }

        const days = Math.floor(
            hours / 24
        );

        if (days < 30) {

            return `${days}d ago`;

        }

        return formatDate(date);

    };


    const filteredApplications =
        applications.filter((application) => {

            const job = application.job;

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                !searchValue ||
                job?.title
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job?.company?.name
                    ?.toLowerCase()
                    .includes(searchValue) ||
                job?.location
                    ?.toLowerCase()
                    .includes(searchValue);


            const matchesStatus =
                statusFilter === "all" ||
                application.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    if (loading) {

        return (

            <div className="
                max-w-7xl
                mx-auto
                pt-8
                pb-10
            ">

                <div className="
                    h-10
                    w-64
                    bg-gray-200
                    rounded-xl
                    animate-pulse
                    mb-8
                "/>

                <div className="
                    grid
                    gap-2
                ">

                    {[1, 2, 3, 4].map(
                        (item) => (

                            <div
                                key={item}
                                className="
                                    bg-gray-100
                                    rounded-3xl
                                    h-56
                                    animate-pulse
                                "
                            />

                        )
                    )}

                </div>

            </div>

        );

    }



    if (error) {

        return (

            <div className="
                sm:max-w-7xl
                w-full
                mx-auto
                pt-8
            ">

                <div className="
                    rounded-3xl
                    border
                    border-red-200
                    bg-red-50
                    sm:p-8 p-3
                    text-center
                ">

                    <AlertCircle
                        size={40}
                        className="
                            mx-auto
                            text-red-500
                            mb-4
                        "
                    />

                    <h2 className="
                        text-xl
                        font-bold
                        text-red-700
                    ">

                        Unable to load applications

                    </h2>

                    <p className="
                        text-red-600
                        mt-2
                    ">

                        {error}

                    </p>


                    <button
                        onClick={() =>
                            fetchApplications()
                        }
                        className="
                            mt-5
                            bg-red-600
                            hover:bg-red-700
                            text-white
                            px-5
                            py-3
                            rounded-xl
                            font-semibold
                        "
                    >

                        Try Again

                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="
            max-w-7xl
            mx-auto
            pt-10
            pb-10
            bg-[var(--bg-color)]
            text-[var(--text-color)]
        ">

            <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-5
                mb-8
                ">

                <div>

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-12
                            h-12
                            rounded-2xl
                            bg-blue-100
                            text-blue-600
                            flex
                            items-center
                            justify-center
                        ">

                            <Briefcase size={24}/>

                        </div>


                        <div>

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-bold
                            ">

                                My Applications

                            </h1>

                            <p className="
                                text-sm
                                mt-1
                            ">

                                Track all the jobs
                                you have applied for.

                            </p>

                        </div>

                    </div>

                </div>


                <button
                    onClick={() =>
                        fetchApplications(false)
                    }
                    disabled={refreshing}
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        border
                        px-4
                        py-2.5
                        rounded-xl
                        hover:sm:border border-green-600
                        transition
                    "
                >

                    <RefreshCw
                        size={17}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* SEARCH + FILTER */}

            <div className="
                border
                rounded-3xl
                p-4
                mb-7
                shadow-sm
            ">

                <div className="
                    flex
                    flex-col
                    lg:flex-row
                    gap-3
                ">


                    {/* SEARCH */}

                    <div className="
                        relative
                        flex-1
                    ">

                        <Search
                            size={19}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-gray-400
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="
                                Search your applications
                            "
                            className="
                                text-black
                                w-full
                                border
                                rounded-xl
                                pl-11
                                pr-4
                                py-3
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                            "
                        />

                    </div>


                    {/* STATUS */}

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="
                            border
                            rounded-xl
                            px-4
                            py-3
                            outline-none
                            text-black
                            min-w-[190px]
                        "
                    >

                        <option value="all">
                            All Applications
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="accepted">
                            Accepted
                        </option>

                        <option value="rejected">
                            Rejected
                        </option>

                        <option value="withdrawn">
                            Withdrawn
                        </option>

                        <option value="expired">
                            Expired
                        </option>

                        <option value="deleted">
                            Deleted
                        </option>

                    </select>

                </div>

            </div>


            {/* COUNT */}

            <div className="
                flex
                items-center
                justify-between
                mb-5
            ">

                <p className="
                    text-sm
                ">

                    Showing{" "}

                    <span className="
                        font-semibold
                    ">

                        {filteredApplications.length}

                    </span>

                    {" "}application
                    {filteredApplications.length !== 1
                        ? "s"
                        : ""}

                </p>

            </div>


            {/* APPLICATIONS */}

            {filteredApplications.length === 0 ? (

                <div className="
                    border
                    rounded-3xl
                    p-12
                    text-center
                ">

                    <div className="
                        w-16
                        h-16
                        rounded-2xl
                        bg-gray-100
                        flex
                        items-center
                        justify-center
                        mx-auto
                        mb-5
                    ">

                        <FileText
                            size={28}
                            className="text-gray-400"
                        />

                    </div>


                    <h2 className="
                        text-xl
                        font-bold
                    ">

                        No applications found

                    </h2>


                    <p className="
                        mt-2
                    ">

                        You haven't submitted
                        any applications matching
                        your search.

                    </p>

                </div>

            ) : (

                <div className="
                    grid
                    gap-5
                ">

                    {filteredApplications.map(
                        (application) => {

                            const job =
                                application.job;

                                const logo = job?.company?.logo
                                ? `http://localhost:8000/storage/${job?.company?.logo}`
                                : null;

                            return (

                                <div
                                    key={
                                        application.id
                                    }
                                    className="
                                        border
                                        rounded-2xl
                                        overflow-hidden
                                        shadow-sm
                                        hover:shadow-lg
                                        transition
                                    "
                                >

                                    {/* TOP */}

                                    <div className="
                                        p-3
                                        sm:p-6
                                    ">


                                        <div className="
                                            flex
                                            flex-col
                                            lg:flex-row
                                            lg:items-center
                                            gap-5
                                        ">


                                            {/* COMPANY */}

                                            <div className="
                                                flex
                                                items-center
                                                gap-4
                                                flex-1
                                                min-w-0
                                            ">

                                                <div className="
                                                    w-14
                                                    h-14
                                                    rounded-2xl
                                                    bg-blue-50
                                                    border
                                                    flex
                                                    items-center
                                                    justify-center
                                                    overflow-hidden
                                                    shrink-0
                                                ">

                                                    {logo ? (

                                                        <img
                                                            src={
                                                                logo
                                                            }
                                                            alt={
                                                                job?.company?.name
                                                            }
                                                            className="
                                                                w-full
                                                                h-full
                                                                object-cover
                                                            "
                                                        />

                                                    ) : (

                                                        <Building2
                                                            size={24}
                                                            className="
                                                                text-blue-600
                                                            "
                                                        />

                                                    )}

                                                </div>


                                                <div className="
                                                    min-w-0
                                                ">

                                                    <h2 className="
                                                        font-bold
                                                        text-lg
                                                        truncate
                                                    ">

                                                        {job?.title}

                                                    </h2>


                                                    <p className="
                                                        text-sm
                                                        truncate
                                                        mt-1
                                                    ">

                                                        {job?.company?.name}

                                                    </p>

                                                     <p className="
                                                        text-sm
                                                        truncate
                                                        mt-1
                                                    ">

                                                        {job?.company?.company_type}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* STATUS */}

                                            <div className={`
                                                inline-flex
                                                items-center
                                                gap-2
                                                px-3
                                                py-2
                                                rounded-full
                                                border
                                                text-sm
                                                font-semibold
                                                w-44
                                                ${getStatusClasses(
                                                    application.status
                                                )}
                                            `}>

                                                <span>
                                                    {getStatusIcon(
                                                        application.status
                                                    )}
                                                </span>

                                                {application.status_label}

                                                    
                                    </div>

                                            {[
                                                "accepted",
                                                "rejected",
                                                "reviewed",
                                            ].includes(application.status) && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeApplication(application.id)
                                                    }
                                                    disabled={removingId === application.id}
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        bg-red-100
                                                        text-red-700
                                                        px-3
                                                        py-2
                                                        text-xs
                                                        font-semibold
                                                    "
                                                >

                                                    {removingId === application.id ? (

                                                        <>
                                                            <Loader2
                                                                size={17}
                                                                className="animate-spin"
                                                            />
                                                            Removing
                                                        </>

                                                    ) : (

                                                        <>
                                                            <Trash2 size={17} />
                                                            Remove
                                                        </>

                                                    )}

                                                </button>

                                            )}
                                            
                                        </div>


                                        {/* DETAILS  */}

                                        {job && (

                                            <div className="
                                                mt-3
                                                grid
                                                grid-cols-2
                                                sm:grid-cols-2
                                                lg:grid-cols-4
                                                gap-1 sm:gap-3
                                            ">


                                                <div className="
                                                    rounded-2xl
                                                    sm:border border-green-600
                                                    p-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                    ">

                                                        <MapPin
                                                            size={16}
                                                        />

                                                        Location

                                                    </div>

                                                    <p className="
                                                        font-semibold
                                                        mt-2
                                                    ">

                                                        {job.location}

                                                    </p>

                                                </div>


                                                <div className="
                                                    rounded-2xl
                                                    sm:border border-green-600
                                                    p-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        
                                                        text-sm
                                                    ">

                                                        <Briefcase
                                                            size={16}
                                                        />

                                                        Job Type

                                                    </div>

                                                    <p className="
                                                        font-semibold
                                                        mt-2
                                                        capitalize
                                                    ">

                                                        {job.job_type}

                                                    </p>

                                                </div>


                                                <div className="
                                                    rounded-2xl
                                                    sm:border border-green-600
                                                    p-4
                                                ">

                                                    <div className="
                                                        text-sm 
                                                        font-medium
                                                    ">

                                                        Payment

                                                    </div>

                                                    <p className="
                                                        font-bold
                                                        bg-green-500 sm:bg-transparent py-2 px-4 rounded-lg
                                                        mt-2
                                                    ">

                                                        {currencySymbol(job.currency)}{" "}

                                                        {Number(
                                                            job.payment || 0
                                                        ).toLocaleString()}

                                                    </p>

                                                </div>


                                                <div className="
                                                    rounded-2xl
                                                    sm:border border-green-600
                                                    p-4
                                                ">

                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                    ">

                                                        <Clock3
                                                            size={16}
                                                        />

                                                        Applied

                                                    </div>

                                                    <p className="
                                                        font-semibold
                                                        mt-2
                                                    ">

                                                        {formatTimeAgo(
                                                            application.created_at
                                                        )}

                                                    </p>

                                                </div>

                                            </div>

                                        )}



                                        {!job && (

                                            <div className="
                                                mt-5
                                                rounded-2xl
                                                bg-red-50
                                                border
                                                border-red-100
                                                p-4
                                                text-red-700
                                            ">

                                                This job post has
                                                been deleted by
                                                the poster.

                                            </div>

                                        )}


                                        {/* FOOTER */}

                                        <div className="
                                            mt-5
                                            pt-5
                                            border-t
                                            flex
                                            flex-col
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                            gap-4
                                        ">


                                            <div className="
                                                flex
                                                items-center
                                                gap-2
                                                text-sm
                                            ">

                                                <CalendarDays
                                                    size={16}
                                                />

                                                Applied{" "}

                                                {formatDate(
                                                    application.created_at
                                                )}

                                            </div>


                                            {job && (
                                                <Link
                                                    to={`/job-finder/${job.id}`}
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        bg-blue-600
                                                        hover:bg-blue-700
                                                        text-white
                                                        px-5
                                                        py-3
                                                        rounded-xl
                                                        font-semibold
                                                        transition
                                                    "
                                                >

                                                    View Job

                                                    <ChevronRight
                                                        size={18}
                                                    />

                                                </Link>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}

        </div>

    );

}