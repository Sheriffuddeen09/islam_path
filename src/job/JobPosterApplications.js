import React, {
    useEffect,
    useState
} from "react";

import {
    BriefcaseBusiness,
    CalendarDays,
    Check,
    Clock,
    Download,
    Eye,
    MapPin,
    X,
    XCircle,
    Loader2,
    Mail,
    ExternalLink,
    Trash2,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../Api/axios";


export default function JobPosterApplications() {

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [page, setPage] =
        useState(1);

    const [pagination, setPagination] =
        useState(null);


    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [showProfileModal, setShowProfileModal] =
        useState(false);


    const [showInterviewModal, setShowInterviewModal] =
        useState(false);


    const [interviewDate, setInterviewDate] =
        useState("");

    const [interviewTime, setInterviewTime] =
        useState("");

    const [interviewNotes, setInterviewNotes] =
        useState("");


    const [actionLoading, setActionLoading] =
        useState(null);


    const [interviewLoading, setInterviewLoading] =
        useState(false);


    const fetchApplications = async (
        currentPage = 1
    ) => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/api/job-poster/applications?page=${currentPage}`
                );


            setApplications(
                response.data.applications.data || []
            );


            setPagination(
                response.data.applications
            );


        } catch (error) {

            console.error(
                "Applications error:",
                error
            );

            toast.error(
                "Unable to load applications."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchApplications(page);

    }, [page]);


    const openProfile = (application) => {

        setSelectedApplication(
            application
        );

        setShowProfileModal(true);

    };



    const openInterviewModal = (
        application
    ) => {

        setSelectedApplication(
            application
        );

        setInterviewDate("");

        setInterviewTime("");

        setInterviewNotes("");

        setShowInterviewModal(true);

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


    const [removingId, setRemovingId] = useState(null);

const removeApplication = async (applicationId) => {

    try {

        setRemovingId(applicationId);

        await api.delete(
            `/api/job-applications/${applicationId}/remove`
        );

        /*
        |--------------------------------------------------------------------------
        | Remove from current React list
        |--------------------------------------------------------------------------
        */

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

    const acceptApplication = async (e) => {

        e.preventDefault();

        if (!selectedApplication) {
            return;
        }


        try {

            setInterviewLoading(true);


            const response =
                await api.post(
                    `/api/job-poster/applications/${selectedApplication.id}/accept`,
                    {
                        interview_date:
                            interviewDate,

                        interview_time:
                            interviewTime,

                        notes:
                            interviewNotes
                    }
                );


            toast.success(
                response.data.message ||
                "Application accepted successfully."
            );


            setShowInterviewModal(false);

            setSelectedApplication(null);


            await fetchApplications(page);


        } catch (error) {

            console.error(
                "Accept application error:",
                error
            );


            if (
                error.response?.data?.errors
            ) {

                Object.values(
                    error.response.data.errors
                )
                .flat()
                .forEach(message => {

                    toast.error(message);

                });

            } else {

                toast.error(
                    error.response?.data?.message ||
                    "Unable to accept application."
                );

            }

        } finally {

            setInterviewLoading(false);

        }
    };


    const declineApplication = async (
        application
    ) => {

        if (
            !window.confirm(
                "Are you sure you want to decline this application?"
            )
        ) {
            return;
        }


        try {

            setActionLoading(
                `decline-${application.id}`
            );


            const response =
                await api.post(
                    `/api/job-poster/applications/${application.id}/decline`
                );


            toast.success(
                response.data.message ||
                "Application declined."
            );


            await fetchApplications(page);


        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to decline application."
            );

        } finally {

            setActionLoading(null);

        }
    };


    const withdrawApplication = async (
        application
    ) => {

        if (
            !window.confirm(
                "Are you sure you want to withdraw this application?"
            )
        ) {
            return;
        }


        try {

            setActionLoading(
                `withdraw-${application.id}`
            );


            const response =
                await api.post(
                    `/api/job-poster/applications/${application.id}/withdraw`
                );


            toast.success(
                response.data.message ||
                "Application withdrawn."
            );


            await fetchApplications(page);


        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to withdraw application."
            );

        } finally {

            setActionLoading(null);

        }
    };



    const getStatus = (
        status
    ) => {

        switch (status) {

            case "accepted":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-green-100
                            text-green-700
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                        "
                    >
                        <Check size={14} />

                        Accepted
                    </span>
                );


            case "rejected":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-red-100
                            text-red-700
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                        "
                    >
                        <XCircle size={14} />

                        Declined
                    </span>
                );


            case "withdrawn":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-gray-100
                            text-gray-700
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                        "
                    >
                        Withdrawn
                    </span>
                );


            default:

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-yellow-100
                            text-yellow-700
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                        "
                    >
                        Pending
                    </span>
                );

        }

    };



    const jobProfile = selectedApplication?.user?.job_profile;

    const cvUrl = jobProfile?.cv
        ? `http://localhost:8000/storage/${jobProfile.cv}`
        : null;

    const skills = Array.isArray(jobProfile?.skills)
        ? jobProfile.skills
        : [];


        


    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    py-8
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                    "
                >

                    <div
                        className="
                            h-10
                            w-64
                            rounded-xl
                            bg-gray-200
                            animate-pulse
                            mb-8
                        "
                    />

                    <div
                        className="
                            grid
                            gap-2
                        "
                    >

                        {[1, 2, 3].map(
                            item => (

                                <div
                                    key={item}
                                    className="
                                        bg-white
                                        border
                                        rounded-3xl
                                        p-6
                                        animate-pulse
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            gap-4
                                        "
                                    >

                                        <div
                                            className="
                                                w-16
                                                h-16
                                                rounded-2xl
                                                bg-gray-200
                                            "
                                        />

                                        <div
                                            className="
                                                flex-1
                                            "
                                        >

                                            <div
                                                className="
                                                    h-5
                                                    bg-gray-200
                                                    rounded
                                                    w-1/3
                                                    mb-3
                                                "
                                            />

                                            <div
                                                className="
                                                    h-4
                                                    bg-gray-200
                                                    rounded
                                                    w-1/4
                                                "
                                            />

                                        </div>

                                    </div>

                                    <div
                                        className="
                                            mt-6
                                            h-20
                                            bg-gray-200
                                            rounded-2xl
                                        "
                                    />

                                </div>

                            )
                        )}

                    </div>

                </div>

            </div>

        );
    }


    return (

        <div
            className="
                min-h-screen
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                py-8
            "
        >

            <div
                className="
                    max-w-7xl
                    mx-auto
                "
            >

                {/* HEADER */}

                <div
                    className="
                        mb-8
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                    "
                >

                    <div>

                        <h1
                            className="
                                text-xl
                                sm:text-2xl
                                font-bold
                            "
                        >

                            Job Applications

                        </h1>

                        <p
                            className="
                                mt-1
                            "
                        >

                            Manage applicants for your
                            posted jobs.

                        </p>

                    </div>


                    <div
                        className="
                            bg-white
                            border
                            rounded-2xl
                            px-5
                            py-3
                            text-sm
                            text-gray-600
                        "
                    >

                        <strong
                            className="
                                text-gray-900
                            "
                        >

                            {pagination?.total || 0}

                        </strong>

                        {" "}Applications

                    </div>

                </div>


                {/* APPLICATIONS */}

                {applications.length === 0 ? (

                    <div
                        className="
                            border
                            rounded-3xl
                            sm:p-12 p-6
                            text-center
                        "
                    >

                        <BriefcaseBusiness
                            size={45}
                            className="
                                mx-auto
                            "
                        />

                        <h2
                            className="
                                text-xl
                                font-bold
                                mt-4
                            "
                        >

                            No applications yet

                        </h2>

                        <p
                            className="
                                mt-2
                            "
                        >

                            Applications from job seekers
                            will appear here.

                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            space-y-5
                        "
                    >

                        {applications.map(
                            application => {

                                const applicant =
                                    application.user;

                                const job =
                                    application.job;

                                const post =
                                    application.job_post;


                                return (

                                    <div
                                        key={
                                            application.id
                                        }
                                        className="
                                            border
                                            rounded-3xl
                                            shadow-sm
                                            hover:shadow-md
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                p-3
                                                sm:p-6
                                            "
                                        >

                                            {/* TOP */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    lg:flex-row
                                                    lg:items-start
                                                    lg:justify-between
                                                    gap-5
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        gap-4
                                                    "
                                                >

                                                    {/* AVATAR */}

                                                    <div
                                                        className="
                                                            w-14
                                                            h-14
                                                            rounded-2xl
                                                            bg-blue-100
                                                            text-blue-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                            font-bold
                                                            text-lg
                                                            shrink-0
                                                        "
                                                    >

                                                        {applicant?.first_name
                                                            ?.charAt(0)
                                                            || "U"}

                                                    </div>


                                                    <div>

                                                        <div
                                                            className="
                                                                flex
                                                                flex-wrap
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            <h2
                                                                className="
                                                                    text-lg
                                                                    font-bold
                                                                "
                                                            >

                                                                {
                                                                    applicant?.first_name
                                                                }

                                                                {" "}

                                                                {
                                                                    applicant?.last_name
                                                                }

                                                            </h2>

                                                            {
                                                                getStatus(
                                                                    application.status
                                                                )
                                                            }

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
                                                                py-1.5
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


                                                        <p
                                                            className="
                                                                text-sm
                                                                mt-1
                                                            "
                                                        >

                                                            {
                                                                applicant?.email
                                                            }

                                                        </p>


                                                        <p
                                                            className="
                                                                text-sm
                                                                text-blue-600
                                                                font-medium
                                                                mt-2
                                                            "
                                                        >

                                                            Applied for:

                                                            {" "}

                                                            {
                                                                post?.title
                                                            }

                                                        </p>

                                                    </div>

                                                    
                                                </div>


                                                {/* JOB */}

                                                <div
                                                    className="
                                                        sm:border border-blue-600
                                                        rounded-2xl
                                                        p-4
                                                        min-w-0
                                                        lg:max-w-sm
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >

                                                        <BriefcaseBusiness
                                                            size={17}
                                                        />

                                                        <span
                                                            className="
                                                                font-semibold
                                                            "
                                                        >

                                                            {
                                                                post?.title
                                                            }

                                                        </span>

                                                    </div>


                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            gap-4
                                                            text-sm
                                                            mt-3
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1
                                                            "
                                                        >

                                                            <MapPin
                                                                size={15}
                                                            />

                                                            {
                                                                post?.location
                                                                
                                                            }

                                                        </span>


                                                        <span>

                                                            {
                                                               currencySymbol( post?.currency)
                                                            }

                                                            {" "}

                                                            {
                                                                Number(
                                                                    post?.payment || 0
                                                                ).toLocaleString()
                                                            }

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* INFORMATION */}

                                            

                                            {/* ACTIONS */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    sm:flex-row
                                                    gap-3
                                                    mt-3
                                                    pt-2
                                                "
                                            >

                                                <button
                                                    onClick={() =>
                                                        openProfile(
                                                            application
                                                        )
                                                    }
                                                    className="
                                                        flex-1
                                                        border
                                                        rounded-xl
                                                        py-3
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        font-semibold
                                                        hover:bg-gray-900
                                                        transition
                                                    "
                                                >

                                                    <Eye
                                                        size={18}
                                                    />

                                                    View Details

                                                </button>


                                                {application.status ===
                                                    "pending" && (

                                                    <>

                                                        <button
                                                            onClick={() =>
                                                                openInterviewModal(
                                                                    application
                                                                )
                                                            }
                                                            className="
                                                                flex-1
                                                                bg-green-600
                                                                hover:bg-green-700
                                                                text-white
                                                                rounded-xl
                                                                py-3
                                                                flex
                                                                items-center
                                                                justify-center
                                                                gap-2
                                                                font-semibold
                                                                transition
                                                            "
                                                        >

                                                            <Check
                                                                size={18}
                                                            />

                                                            Accept

                                                        </button>


                                                        <button
                                                            disabled={
                                                                actionLoading ===
                                                                `decline-${application.id}`
                                                            }
                                                            onClick={() =>
                                                                declineApplication(
                                                                    application
                                                                )
                                                            }
                                                            className="
                                                                flex-1
                                                                bg-red-50
                                                                hover:bg-red-100
                                                                text-red-600
                                                                rounded-xl
                                                                py-3
                                                                flex
                                                                items-center
                                                                justify-center
                                                                gap-2
                                                                font-semibold
                                                            "
                                                        >

                                                            {actionLoading ===
                                                                `decline-${application.id}` ? (

                                                                <Loader2
                                                                    size={18}
                                                                    className="
                                                                        animate-spin
                                                                    "
                                                                />

                                                            ) : (

                                                                <X
                                                                    size={18}
                                                                />

                                                            )}

                                                            Decline

                                                        </button>

                                                    </>

                                                )}


                                                {application.status ===
                                                    "accepted" && (

                                                    <button
                                                        disabled={
                                                            actionLoading ===
                                                            `withdraw-${application.id}`
                                                        }
                                                        onClick={() =>
                                                            withdrawApplication(
                                                                application
                                                            )
                                                        }
                                                        className="
                                                            flex-1
                                                            border
                                                            border-orange-200
                                                            bg-orange-50
                                                            hover:bg-orange-100
                                                            text-orange-600
                                                            rounded-xl
                                                            py-3
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            font-semibold
                                                        "
                                                    >

                                                        {actionLoading ===
                                                            `withdraw-${application.id}` ? (

                                                            <Loader2
                                                                size={18}
                                                                className="
                                                                    animate-spin
                                                                "
                                                            />

                                                        ) : (

                                                            <XCircle
                                                                size={18}
                                                            />

                                                        )}

                                                        Withdraw

                                                    </button>

                                                )}

                                            </div>


                                            {/* INTERVIEW */}

                                            {application.interview && (

                                                <div
                                                    className="
                                                        mt-5
                                                        rounded-2xl
                                                        bg-green-50
                                                        border
                                                        border-green-100
                                                        p-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            flex-col
                                                            sm:flex-row
                                                            sm:items-center
                                                            sm:justify-between
                                                            gap-3
                                                        "
                                                    >

                                                        <div>

                                                            <p
                                                                className="
                                                                    font-bold
                                                                    text-green-800
                                                                "
                                                            >

                                                                Interview Scheduled

                                                            </p>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-green-700
                                                                    mt-1
                                                                "
                                                            >

                                                                {
                                                                    new Date(
                                                                        application.interview.interview_date
                                                                    ).toLocaleDateString()
                                                                }

                                                                {" • "}

                                                                {
                                                                    application.interview.interview_time
                                                                }

                                                            </p>

                                                        </div>


                                                        <a
                                                            href={
                                                                application.interview.meeting_link
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="
                                                                bg-green-600
                                                                hover:bg-green-700
                                                                text-white
                                                                px-4
                                                                py-2.5
                                                                rounded-xl
                                                                font-semibold
                                                                text-sm
                                                                inline-flex
                                                                items-center
                                                                justify-center
                                                                gap-2
                                                            "
                                                        >

                                                            Join Interview

                                                            <ExternalLink
                                                                size={15}
                                                            />

                                                        </a>

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}


                {/* PAGINATION */}

                {pagination &&
                    pagination.last_page > 1 && (

                    <div
                        className="
                            flex
                            justify-center
                            gap-2
                            mt-8
                        "
                    >

                        {Array.from(
                            {
                                length:
                                    pagination.last_page
                            },
                            (_, index) =>
                                index + 1
                        ).map(
                            number => (

                                <button
                                    key={number}
                                    onClick={() =>
                                        setPage(number)
                                    }
                                    className={`
                                        w-10
                                        h-10
                                        rounded-xl
                                        font-semibold
                                        ${
                                            page === number
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border hover:bg-gray-50"
                                        }
                                    `}
                                >

                                    {number}

                                </button>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* =====================================================
                PROFILE MODAL
            ====================================================== */}

            {showProfileModal &&
                selectedApplication && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        bg-black/50
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-3
                        sm:p-6
                    "
                    onClick={() =>
                        setShowProfileModal(false)
                    }
                >

                    <div
                        className="
                            bg-[var(--bg-color)]
                            text-[var(--text-color)]
                            rounded-3xl
                            w-full
                            max-w-3xl
                            max-h-[90vh]
                            overflow-y-auto
                            shadow-2xl
                            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                        "
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <div
                            className="
                                sticky
                                top-0
                                z-10
                                border-b
                                px-5
                                sm:px-7
                                py-5
                                flex
                                items-center
                                bg-gray-700
                                text-white
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                    "
                                >

                                    Applicant Details

                                </h2>

                                <p
                                    className="
                                        text-sm
                                    "
                                >

                                    Full application and profile

                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    setShowProfileModal(false)
                                }
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-gray-100
                                    hover:bg-gray-200
                                    text-black
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <div
                            className="
                                p-5
                                sm:p-7
                                space-y-6
                            "
                        >

                            {/* USER */}

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-4 border
                                    border-blue-600
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <div
                                    className="
                                        w-16
                                        h-16
                                        rounded-2xl
                                        bg-blue-600
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        font-bold
                                        text-xl
                                    "
                                >

                                    {
                                        selectedApplication.user?.first_name
                                            ?.charAt(0)
                                            || "U"
                                    }

                                </div>


                                <div>

                                    <h3
                                        className="
                                            text-lg
                                            font-bold
                                        "
                                    >

                                        {
                                            selectedApplication.user?.first_name
                                        }

                                        {" "}

                                        {
                                            selectedApplication.user?.last_name
                                        }

                                    </h3>


                                    <p
                                        className="text-sm"
                                    >

                                        {
                                            selectedApplication.user?.email
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* PROFILE */}

                            <section>

                                <h3
                                    className="
                                        font-bold
                                        text-lg
                                        mb-3
                                    "
                                >

                                    Job Profile

                                </h3>


                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                      {cvUrl ? (

                                    <a
                                        href={cvUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="
                                            w-full
                                            bg-gray-900
                                            hover:bg-gray-800
                                            text-white
                                            rounded-xl
                                            py-3
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            font-semibold
                                        "
                                    >

                                        <Download
                                            size={18}
                                        />

                                        View / Download CV

                                    </a>

                            ) : (

                                <span className="">
                                    Not provided
                                </span>

                            )}

                                <Detail
                                    label="Profile Type"
                                    value={jobProfile?.type || "Not provided"}
                                />

                                <Detail
                                    label="Location"
                                    value={jobProfile?.location || "Not provided"}
                                />

                                <Detail
                                    label="Address"
                                    value={jobProfile?.address || "Not provided"}
                                />

                                
                                {/* Skills */}

                                <div
                                    className="
                                        rounded-xl
                                        border border-blue-600
                                        bg-[var(--bg-color)] text-[var(--text-color)]
                                        p-4
                                        min-w-0
                                    "
                                >

                                    <p className="text-xs font-semibold uppercase mb-2">
                                        Skills
                                    </p>

                                    {skills.length > 0 ? (

                                        <div className="flex flex-wrap gap-2">

                                            {skills.map((skill, index) => (

                                                <span
                                                    key={`${skill}-${index}`}
                                                    className="
                                                        px-3
                                                        py-1.5
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-blue-700
                                                        text-sm
                                                        font-medium
                                                        break-words
                                                        max-w-full
                                                    "
                                                >
                                                    {skill}
                                                </span>

                                            ))}

                                        </div>

                                    ) : (

                                        <span className="">
                                            Not provided
                                        </span>

                                    )}

                                </div>


                                {/* Portfolio */}

                                <div
                                    className="
                                        rounded-xl
                                        border border-blue-600
                                        bg-[var(--bg-color)]
                                        p-4
                                        min-w-0 text-[var(--text-color)]
                                    "
                                >

                                    <p className="text-xs font-semibold uppercase mb-2">
                                        Portfolio
                                    </p>

                                    {jobProfile?.portfolio ? (

                                        <a
                                            href={jobProfile.portfolio}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                text-blue-600
                                                hover:text-blue-700
                                                font-medium
                                                break-all
                                                block
                                            "
                                        >
                                            View Portfolio
                                        </a>

                                    ) : (

                                        <span className="">
                                            Not provided
                                        </span>

                                    )}

                                </div>


                                {/* Certification */}

                                <div
                                    className="
                                        rounded-xl
                                        border border-blue-600
                                        bg-[var(--bg-color)] text-[var(--text-color)]
                                        p-4
                                        min-w-0
                                    "
                                >

                                    <p className="text-xs font-semibold text-[var(--text-color)] uppercase mb-2">
                                        Certification
                                    </p>

                                    {jobProfile?.certification ? (

                                        <a
                                            href={jobProfile.certification}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                text-blue-600
                                                hover:text-blue-700
                                                font-medium
                                                break-all
                                                block
                                            "
                                        >
                                            View Certification
                                        </a>

                                    ) : (

                                        <span className="text-[var(--text-color)]">
                                            Not provided
                                        </span>

                                    )}

                                </div>


                                {/* Qualification */}

                                <div
                                    className="
                                        rounded-xl
                                        border border-blue-600
                                        bg-[var(--bg-color)] text-[var(--text-color)]
                                        p-4
                                        min-w-0
                                        sm:col-span-2
                                    "
                                >

                                    <p className="text-xs font-semibold uppercase mb-2">
                                        Qualification
                                    </p>

                                    <p
                                        className="
                                            whitespace-pre-wrap
                                            break-words
                                            overflow-wrap-anywhere
                                            leading-relaxed
                                        "
                                    >
                                        {jobProfile?.qualifications || "Not provided"}
                                    </p>

                                </div>

                            </div>

                            </section>


                            {/* APPLICATION */}

                            <section>

                                <h3
                                    className="
                                        font-bold
                                        text-lg
                                        mb-3
                                    "
                                >

                                    Application

                                </h3>


                                <div
                                    className="
                                        space-y-4
                                    "
                                >

                                    <Detail
                                        label="Qualification"
                                        value={
                                            selectedApplication.qualification
                                        }
                                    />

                                    <Detail
                                        label="Experience"
                                        value={
                                            selectedApplication.experience
                                        }
                                    />

                                    <Detail
                                        label="Years of Experience"
                                        value={
                                            selectedApplication.year_experience
                                        }
                                    />

                                    <Detail
                                        label="Expected Payment"
                                        value={
                                            selectedApplication.payment
                                                ? `${selectedApplication.currency || ""} ${Number(selectedApplication.payment).toLocaleString()}`
                                                : null
                                        }
                                    />

                                    <div>

                                        <p
                                            className="
                                                text-xs
                                                mb-1 text-[var(--text-color)]
                                            "
                                        >

                                            Additional Message

                                        </p>

                                        <div
                                            className="
                                                rounded-2xl
                                                p-4
                                                border border-blue-600
                                                bg-[var(--bg-color)] text-[var(--text-color)]
                                                whitespace-pre-line
                                            "
                                        >

                                            {
                                                selectedApplication.additional_text
                                                ||
                                                "No additional message."
                                            }

                                        </div>

                                    </div>

                                </div>

                            </section>


                            {/* CV */}

                          

                        </div>

                    </div>

                </div>

            )}


            {showInterviewModal &&
                selectedApplication && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[110]
                        bg-black/50
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-3
                        sm:p-6
                    "
                    onClick={() =>
                        setShowInterviewModal(false)
                    }
                >

                    <form
                        onSubmit={acceptApplication}
                        onClick={e =>
                            e.stopPropagation()
                        }
                        className="
                            bg-[var(bg-color)]
                            text-[var(text-color)]
                            rounded-3xl
                            w-full
                            max-w-lg
                            shadow-2xl
                            max-h-[90vh]
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                bg-green-600
                                text-white
                                p-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                        "
                                    >

                                        Accept Application

                                    </h2>

                                    <p
                                        className="
                                            text-green-100
                                            text-sm
                                            mt-1
                                        "
                                    >

                                        Schedule the applicant's
                                        interview.

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowInterviewModal(
                                            false
                                        )
                                    }
                                    className="
                                        w-9
                                        h-9
                                        rounded-xl
                                        bg-white/10
                                        hover:bg-white/20
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <X size={18} />

                                </button>

                            </div>

                        </div>


                        <div
                            className="
                                p-6
                                space-y-5
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    border border-blue-600
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                    "
                                >

                                    Applicant

                                </p>

                                <p
                                    className="
                                        font-bold
                                        mt-1
                                    "
                                >

                                    {
                                        selectedApplication.user?.first_name
                                    }

                                    {" "}

                                    {
                                        selectedApplication.user?.last_name
                                    }

                                </p>

                            </div>


                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-semibold
                                        mb-2
                                    "
                                >

                                    <CalendarDays
                                        size={16}
                                        className="
                                            inline
                                            mr-2
                                        "
                                    />

                                    Interview Date

                                </label>

                                <input
                                    type="date"
                                    value={
                                        interviewDate
                                    }
                                    min={
                                        new Date()
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                    onChange={e =>
                                        setInterviewDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        px-4
                                        py-3
                                        outline-none
                                        focus:ring-2
                                        focus:ring-green-500 text-black
                                    "
                                />

                            </div>


                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-semibold
                                        mb-2
                                    "
                                >

                                    <Clock
                                        size={16}
                                        className="
                                            inline
                                            mr-2
                                        "
                                    />

                                    Interview Time

                                </label>

                                <input
                                    type="time"
                                    value={
                                        interviewTime
                                    }
                                    onChange={e =>
                                        setInterviewTime(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        px-4
                                        py-3
                                        outline-none
                                        focus:ring-2 text-black
                                        focus:ring-green-500
                                    "
                                />

                            </div>


                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-semibold
                                        mb-2
                                    "
                                >

                                    Interview Notes

                                    <span
                                        className="
                                            font-normal
                                            ml-1
                                        "
                                    >

                                        (optional)

                                    </span>

                                </label>

                                <textarea
                                    value={
                                        interviewNotes
                                    }
                                    onChange={e =>
                                        setInterviewNotes(
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="
                                        Add interview instructions,
                                        meeting information or notes
                                    "
                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        px-4
                                        py-3
                                        outline-none
                                        resize-none
                                        focus:ring-2
                                        focus:ring-green-500 text-black
                                    "
                                />

                            </div>


                            <div
                                className="
                                    border border-blue-500
                                    border
                                    border-blue-100
                                    rounded-2xl
                                    p-4
                                    text-sm
                                "
                            >

                                <Mail
                                    size={18}
                                    className="
                                        inline
                                        mr-2
                                    "
                                />

                                An interview link will be
                                automatically generated and
                                emailed to the applicant.

                            </div>


                            <button
                                type="submit"
                                disabled={
                                    interviewLoading
                                }
                                className="
                                    w-full
                                    bg-green-600
                                    hover:bg-green-700
                                    disabled:opacity-60
                                    text-white
                                    rounded-xl
                                    py-3.5
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                {interviewLoading ? (

                                    <>
                                        <Loader2
                                            size={19}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Accepting

                                    </>

                                ) : (

                                    <>
                                        <Check
                                            size={19}
                                        />

                                        Accept & Schedule
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>

    );
}



const Detail = ({ label, value }) => {

    return (

        <div
            className="
                rounded-xl
                border border-blue-600
                bg-[var(--bg-color)]
                p-4
                min-w-0
                overflow-hidden
                scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
            "
        >

            <p className="
                text-xs
                font-semibold
                text-[var(--text-color)]
                uppercase
                mb-2
            ">
                {label}
            </p>

            <p
                className="
                    text-[var(--text-color)]
                    font-medium
                    break-words
                    overflow-wrap-anywhere
                    whitespace-pre-wrap
                "
            >
                {value || "Not provided"}
            </p>

        </div>

    );

};