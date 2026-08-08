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
    FileText,
    MapPin,
    User,
    X,
    XCircle,
    GraduationCap,
    Banknote,
    Building2,
    Loader2,
    Mail,
    ExternalLink
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



    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    px-3
                    sm:px-6
                    lg:px-10
                    py-20
                    bg-gray-50
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
                            gap-5
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
                bg-gray-50
                px-3
                sm:px-6
                lg:px-10
                py-20
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
                                text-2xl
                                sm:text-3xl
                                font-bold
                                text-gray-900
                            "
                        >

                            Job Applications

                        </h1>

                        <p
                            className="
                                text-gray-500
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
                            bg-white
                            border
                            rounded-3xl
                            p-12
                            text-center
                        "
                    >

                        <BriefcaseBusiness
                            size={45}
                            className="
                                mx-auto
                                text-gray-300
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
                                text-gray-500
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

                                const profile =
                                    applicant?.job_profile;


                                return (

                                    <div
                                        key={
                                            application.id
                                        }
                                        className="
                                            bg-white
                                            border
                                            rounded-3xl
                                            shadow-sm
                                            hover:shadow-md
                                            transition
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                p-5
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
                                                                    text-gray-900
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

                                                        </div>


                                                        <p
                                                            className="
                                                                text-gray-500
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
                                                                job?.title
                                                            }

                                                        </p>

                                                    </div>

                                                </div>


                                                {/* JOB */}

                                                <div
                                                    className="
                                                        bg-gray-50
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
                                                            text-gray-700
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
                                                                job?.title
                                                            }

                                                        </span>

                                                    </div>


                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            gap-4
                                                            text-sm
                                                            text-gray-500
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
                                                                job?.location
                                                                || "Remote"
                                                            }

                                                        </span>


                                                        <span>

                                                            {
                                                                job?.currency
                                                            }

                                                            {" "}

                                                            {
                                                                Number(
                                                                    job?.payment || 0
                                                                ).toLocaleString()
                                                            }

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* INFORMATION */}

                                            <div
                                                className="
                                                    grid
                                                    grid-cols-1
                                                    sm:grid-cols-2
                                                    lg:grid-cols-4
                                                    gap-3
                                                    mt-6
                                                "
                                            >

                                                <div
                                                    className="
                                                        rounded-2xl
                                                        bg-gray-50
                                                        p-4
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-400
                                                        "
                                                    >

                                                        Qualification

                                                    </p>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            application.qualification
                                                            || "Not provided"
                                                        }

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-2xl
                                                        bg-gray-50
                                                        p-4
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-400
                                                        "
                                                    >

                                                        Experience

                                                    </p>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            application.experience
                                                            || "Not provided"
                                                        }

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-2xl
                                                        bg-gray-50
                                                        p-4
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-400
                                                        "
                                                    >

                                                        Years Experience

                                                    </p>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            application.year_experience
                                                            ?? "Not provided"
                                                        }

                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        rounded-2xl
                                                        bg-gray-50
                                                        p-4
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-gray-400
                                                        "
                                                    >

                                                        Applied

                                                    </p>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            new Date(
                                                                application.created_at
                                                            ).toLocaleDateString()
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            {/* ACTIONS */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    sm:flex-row
                                                    gap-3
                                                    mt-6
                                                    pt-5
                                                    border-t
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
                                                        hover:bg-gray-50
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
                            bg-white
                            rounded-3xl
                            w-full
                            max-w-3xl
                            max-h-[90vh]
                            overflow-y-auto
                            shadow-2xl
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
                                bg-white
                                border-b
                                px-5
                                sm:px-7
                                py-5
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

                                    Applicant Details

                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
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
                                    gap-4
                                    bg-blue-50
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
                                        className="
                                            text-sm
                                            text-gray-500
                                        "
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


                                <div
                                    className="
                                        grid
                                        sm:grid-cols-2
                                        gap-4
                                    "
                                >

                                    <Detail
                                        label="Profile Type"
                                        value={
                                            selectedApplication.user?.job_profile?.type
                                        }
                                    />

                                    <Detail
                                        label="Company"
                                        value={
                                            selectedApplication.user?.job_profile?.company_name
                                        }
                                    />

                                    <Detail
                                        label="Company Type"
                                        value={
                                            selectedApplication.user?.job_profile?.company_type
                                        }
                                    />

                                    <Detail
                                        label="Location"
                                        value={
                                            selectedApplication.user?.job_profile?.company_location
                                        }
                                    />

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
                                                text-gray-400
                                                mb-1
                                            "
                                        >

                                            Additional Message

                                        </p>

                                        <div
                                            className="
                                                bg-gray-50
                                                rounded-2xl
                                                p-4
                                                text-gray-700
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

                            {selectedApplication.cv && (

                                <a
                                    href={
                                        selectedApplication.cv
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                        w-full
                                        bg-gray-900
                                        hover:bg-black
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

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                INTERVIEW MODAL
            ====================================================== */}

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
                            bg-white
                            rounded-3xl
                            w-full
                            max-w-lg
                            shadow-2xl
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
                                    bg-gray-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-gray-400
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
                                        focus:ring-2
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
                                            text-gray-400
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
                                        meeting information or notes...
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
                                        focus:ring-green-500
                                    "
                                />

                            </div>


                            <div
                                className="
                                    bg-blue-50
                                    border
                                    border-blue-100
                                    rounded-2xl
                                    p-4
                                    text-sm
                                    text-blue-700
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

                                        Accepting...

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


/*
|--------------------------------------------------------------------------
| Detail component
|--------------------------------------------------------------------------
*/

function Detail({
    label,
    value
}) {

    return (

        <div
            className="
                rounded-2xl
                bg-gray-50
                p-4
            "
        >

            <p
                className="
                    text-xs
                    text-gray-400
                    mb-1
                "
            >

                {label}

            </p>

            <p
                className="
                    font-semibold
                    text-gray-800
                    break-words
                "
            >

                {value || "Not provided"}

            </p>

        </div>

    );
}