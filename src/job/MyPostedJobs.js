import React, {
    useEffect,
    useState
} from "react";

import {
    X,
    BriefcaseBusiness,
    MapPin,
    Banknote,
    Users,
    CalendarDays,
    Trash2,
    Loader2,
    AlertTriangle,
    Clock,
    Eye
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../Api/axios";


export default function MyPostedJobs({
    isOpen,
    onClose
}) {

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [deleteJob, setDeleteJob] = useState(null);



    const fetchMyPostedJobs = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/api/my-posted-jobs"
            );

            setJobs(
                response.data?.jobs?.data || []
            );

        } catch (error) {

            console.error(
                "Fetch posted jobs error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load your posted jobs."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        if (isOpen) {

            fetchMyPostedJobs();

        }

    }, [isOpen]);


    const handleDelete = async () => {

        if (!deleteJob) return;


        try {

            setDeletingId(deleteJob.id);


            await api.delete(
                `/api/my-posted-jobs/${deleteJob.id}`
            );


            setJobs(prev =>
                prev.filter(
                    job =>
                        job.id !== deleteJob.id
                )
            );


            toast.success(
                "Job deleted successfully."
            );


            setDeleteJob(null);

        } catch (error) {

            console.error(
                "Delete job error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete job."
            );

        } finally {

            setDeletingId(null);

        }

    };
    if (!isOpen) {

        return null;

    }


    const formatDate = (date) => {

        if (!date) return "N/A";

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    };


    const formatPayment = (job) => {

        if (
            job.payment === null ||
            job.payment === undefined
        ) {

            return "Negotiable";

        }

        return `${job.currency || ""} ${Number(
            job.payment
        ).toLocaleString()}`;

    };


    return (

        <>

            <div
                className="
                    fixed
                    inset-0
                    z-[100]
                    flex
                    items-center
                    justify-center
                    p-3
                    sm:p-6
                "
            >

                {/* Overlay */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-black/60
                    "
                    onClick={onClose}
                />


                {/* Modal */}

                <div
                    className="
                        relative
                        w-full
                        max-w-5xl
                        max-h-[90vh]
                        scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                        rounded-3xl
                        shadow-2xl
                        bg-[var(--bg-color)]
                        text-[var(--text-color)]
                        border
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-5
                            sm:px-7
                            py-5
                            border-b
                        "
                    >

                        <div className="flex items-center gap-3">

                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-2xl
                                    bg-blue-100
                                    text-blue-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <BriefcaseBusiness
                                    size={22}
                                />

                            </div>


                            <div>

                                <h2
                                    className="
                                        text-xl
                                        sm:text-2xl
                                        font-bold
                                    "
                                >

                                    My Posted Jobs

                                </h2>

                                <p
                                    className="
                                        text-sm
                                        
                                        mt-0.5
                                    "
                                >

                                    Manage the jobs you have posted

                                </p>

                            </div>

                        </div>


                        <button
                            onClick={onClose}
                            className="
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                hover:bg-gray-700
                                transition
                            "
                        >

                            <X size={21} />

                        </button>

                    </div>
                    <div
                        className="
                            overflow-y-auto
                            max-h-[calc(90vh-90px)]
                            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                            p-4
                            sm:p-6
                        "
                    >

                        {/* Loading */}

                        {loading && (

                            <div className="space-y-4">

                                {[1, 2, 3].map(
                                    item => (

                                        <div
                                            key={item}
                                            className="
                                                rounded-2xl
                                                border
                                                p-5
                                                animate-pulse
                                            "
                                        >

                                            <div
                                                className="
                                                    h-5
                                                    w-2/3
                                                    rounded
                                                    bg-gray-200
                                                "
                                            />

                                            <div
                                                className="
                                                    h-4
                                                    w-1/3
                                                    rounded
                                                    bg-gray-200
                                                    mt-4
                                                "
                                            />

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-2
                                                    sm:grid-cols-4
                                                    gap-3
                                                    mt-6
                                                "
                                            >

                                                {[1,2,3,4].map(
                                                    i => (

                                                        <div
                                                            key={i}
                                                            className="
                                                                h-12
                                                                rounded-xl
                                                                bg-gray-200
                                                            "
                                                        />

                                                    )
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                        {/* Empty */}

                        {!loading &&
                            jobs.length === 0 && (

                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            mx-auto
                                            w-16
                                            h-16
                                            rounded-2xl
                                            bg-gray-100
                                            flex
                                            items-center
                                            justify-center
                                            mb-5
                                        "
                                    >

                                        <BriefcaseBusiness
                                            size={28}
                                            className="opacity-40"
                                        />

                                    </div>


                                    <h3
                                        className="
                                            text-lg
                                            font-bold
                                        "
                                    >

                                        No Posted Jobs

                                    </h3>


                                    <p
                                        className="
                                            text-sm
                                            
                                            mt-2
                                        "
                                    >

                                        You haven't posted any jobs yet.

                                    </p>

                                </div>

                            )}


                        {/* Jobs */}

                        {!loading &&
                            jobs.length > 0 && (

                                <div className="space-y-4">

                                    {jobs.map(job => (

                                        <div
                                            key={job.id}
                                            className="
                                                rounded-2xl
                                                border
                                                p-4
                                                sm:p-5
                                                hover:shadow-md
                                                transition
                                            "
                                        >

                                            {/* Job heading */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    sm:flex-row
                                                    sm:items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >

                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <h3
                                                        className="
                                                            text-lg
                                                            sm:text-xl
                                                            font-bold
                                                            break-words
                                                        "
                                                    >

                                                        {job.title}

                                                    </h3>


                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            items-center
                                                            gap-2
                                                            mt-2
                                                        "
                                                    >

                                                        {job.category?.name && (

                                                            <span
                                                                className="
                                                                    px-3
                                                                    py-1
                                                                    rounded-full
                                                                    text-xs
                                                                    font-medium
                                                                    bg-blue-100
                                                                    text-blue-700
                                                                "
                                                            >

                                                                {job.category.name}

                                                            </span>

                                                        )}


                                                        <span
                                                            className="
                                                                px-3
                                                                py-1
                                                                rounded-full
                                                                text-xs
                                                                border
                                                            "
                                                        >

                                                            {job.job_type}

                                                        </span>

                                                    </div>

                                                </div>


                                                {/* Delete */}

                                                <button
                                                    onClick={() =>
                                                        setDeleteJob(job)
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        job.id
                                                    }
                                                    className="
                                                        shrink-0
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        px-4
                                                        py-2.5
                                                        rounded-xl
                                                        bg-red-50
                                                        text-red-600
                                                        hover:bg-red-100
                                                        transition
                                                        disabled:opacity-50
                                                    "
                                                >

                                                    {deletingId ===
                                                    job.id ? (

                                                        <Loader2
                                                            size={17}
                                                            className="
                                                                animate-spin
                                                            "
                                                        />

                                                    ) : (

                                                        <Trash2
                                                            size={17}
                                                        />

                                                    )}

                                                    <span>
                                                        Delete
                                                    </span>

                                                </button>

                                            </div>


                                            {/* Job information */}

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-1
                                                    sm:grid-cols-2
                                                    lg:grid-cols-4
                                                    gap-3
                                                    mt-5
                                                "
                                            >

                                                <div
                                                    className="
                                                        rounded-xl
                                                        bg-gray-50
                                                        dark:bg-gray-800/50
                                                        p-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            
                                                        "
                                                    >

                                                        <Banknote
                                                            size={16}
                                                        />

                                                        Payment

                                                    </div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                            break-words
                                                        "
                                                    >

                                                        {formatPayment(job)}

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-xl
                                                        bg-gray-50
                                                        dark:bg-gray-800/50
                                                        p-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            
                                                        "
                                                    >

                                                        <MapPin
                                                            size={16}
                                                        />

                                                        Location

                                                    </div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                            break-words
                                                        "
                                                    >

                                                        {job.location ||
                                                            "Not specified"}

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-xl
                                                        bg-gray-50
                                                        dark:bg-gray-800/50
                                                        p-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            
                                                        "
                                                    >

                                                        <Users
                                                            size={16}
                                                        />

                                                        Applicants

                                                    </div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {job.applications_count ??
                                                            job.application_count ??
                                                            0}

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-xl
                                                        bg-gray-50
                                                        dark:bg-gray-800/50
                                                        p-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            
                                                        "
                                                    >

                                                        <CalendarDays
                                                            size={16}
                                                        />

                                                        Expires

                                                    </div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {formatDate(
                                                            job.expire_date
                                                        )}

                                                    </p>

                                                </div>

                                            </div>


                                            {/* Footer */}

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-4
                                                    mt-4
                                                    pt-4
                                                    border-t
                                                    text-sm
                                                    
                                                "
                                            >

                                                <span
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                    "
                                                >

                                                    <Clock
                                                        size={15}
                                                    />

                                                    Posted{" "}

                                                    {formatDate(
                                                        job.created_at
                                                    )}

                                                </span>


                                                <span
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-1.5
                                                    "
                                                >

                                                    <Eye
                                                        size={15}
                                                    />

                                                    {job.views || 0} views

                                                </span>

                                            </div>

                                        </div>

                                    ))}

                                </div>

                            )}

                    </div>

                </div>

            </div>

            {deleteJob && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[120]
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            absolute
                            inset-0
                            bg-black/60
                        "
                    />


                    <div
                        className="
                            relative
                            w-full
                            max-w-md
                            rounded-3xl
                            p-6
                            shadow-2xl
                            bg-[var(--bg-color)]
                            text-[var(--text-color)]
                            border
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-2xl
                                bg-red-100
                                text-red-600
                                flex
                                items-center
                                justify-center
                                mb-5
                            "
                        >

                            <AlertTriangle
                                size={24}
                            />

                        </div>


                        <h3
                            className="
                                text-xl
                                font-bold
                            "
                        >

                            Delete this job?

                        </h3>


                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                            "
                        >

                            Are you sure you want to delete{" "}

                            <strong>
                                {deleteJob.title}
                            </strong>
                            ?

                            Applicants will still be able
                            to see their application history,
                            but the job will no longer be
                            available.

                        </p>


                        <div
                            className="
                                flex
                                gap-3
                                mt-7
                            "
                        >

                            <button
                                onClick={() =>
                                    setDeleteJob(null)
                                }
                                className="
                                    flex-1
                                    border
                                    rounded-xl
                                    py-3
                                    font-semibold
                                    hover:bg-gray-100
                                    dark:hover:bg-gray-800
                                    transition
                                "
                            >

                                Cancel

                            </button>


                            <button
                                onClick={handleDelete}
                                disabled={
                                    deletingId ===
                                    deleteJob.id
                                }
                                className="
                                    flex-1
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    transition
                                    disabled:
                                "
                            >

                                {deletingId ===
                                deleteJob.id ? (

                                    <>

                                        <Loader2
                                            size={18}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Deleting

                                    </>

                                ) : (

                                    <>

                                        <Trash2
                                            size={18}
                                        />

                                        Delete Job

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}