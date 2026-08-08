import { useEffect, useMemo, useRef, useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";

import {
    Search,
    RefreshCw,
    Loader2,
    Briefcase,
    Building2,
    MapPin,
    Wallet,
    Users,
    Calendar,
    Clock,
    Eye,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import JobPostDetailsModal from "./JobPostDetailsModal";

export default function PendingJobs() {


    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState("");

    const searchTimeout = useRef(null);

    const [page, setPage] = useState(1);

    const [lastPage, setLastPage] = useState(1);

    const [perPage] = useState(10);

    const [total, setTotal] = useState(0);


    const [selectedJob, setSelectedJob] = useState(null);

    const [showDetails, setShowDetails] = useState(false);

    const [approveLoading, setApproveLoading] = useState({});

    const [declineLoading, setDeclineLoading] = useState({});

    const totalLoaded = jobs.length;

    const totalPending = total;


    useEffect(() => {

        const timer = setTimeout(() => {

            setDebouncedSearch(search);

        }, 500);

        return () => clearTimeout(timer);

    }, [search]);


    const isEmpty = useMemo(() => {

        return !loading && jobs.length === 0;

    }, [loading, jobs]);

    const filteredJobs = useMemo(() => {

        return jobs;

    }, [jobs]);

    const fetchPendingJobs = async (
        currentPage = page,
        keyword = debouncedSearch,
        showLoader = true
    ) => {

        try {

            if (showLoader) {

                setLoading(true);

            }

            setError("");

            const res = await api.get(
                "/api/admin/jobs",
                {
                    params: {
                        page: currentPage,
                        per_page: perPage,
                        search: keyword
                    }
                }
            );

            const response = res.data.jobs;

            setJobs(response.data || []);

            setPage(response.current_page);

            setLastPage(response.last_page);

            setTotal(response.total);

        }

        catch (error) {

            console.log(error);

            const message =

                error.response?.data?.message ||

                "Unable to load pending jobs.";

            setError(message);

            toast.error(message);

        }

        finally {

            setLoading(false);

            setRefreshing(false);

        }

    };

    const refreshCurrentPage = async () => {

        setRefreshing(true);

        await fetchPendingJobs(
            page,
            debouncedSearch,
            false
        );

        toast.success("Jobs refreshed.");

    };

    useEffect(() => {

        fetchPendingJobs();

    }, []);


    useEffect(() => {

        if (searchTimeout.current) {

            clearTimeout(searchTimeout.current);

        }

        searchTimeout.current = setTimeout(() => {

            fetchPendingJobs(
                1,
                debouncedSearch
            );

        }, 500);

        return () => {

            if (searchTimeout.current) {

                clearTimeout(searchTimeout.current);

            }

        };

    }, [debouncedSearch]);


    useEffect(() => {

        fetchPendingJobs(
            page,
            debouncedSearch,
            false
        );

    }, [page]);

 
    const notifySuccess = (message) => {

        toast.success(message);

    };

    const notifyError = (message) => {

        toast.error(message);

    };


    
    const approveJob = async (jobId) => {

        try {

            setApproveLoading(prev => ({
                ...prev,
                [jobId]: true
            }));

            const res = await api.put(

                `/api/admin/jobs/${jobId}/approve`

            );

            notifySuccess(res.data.message);

            setJobs(prev =>
                prev.filter(job => job.id !== jobId)
            );

            setTotal(prev => Math.max(prev - 1, 0));

            if (jobs.length === 1 && page > 1) {

                setPage(prev => prev - 1);

            }

        }

        catch (error) {

            notifyError(

                error.response?.data?.message ||

                "Unable to approve job."

            );

        }

        finally {

            setApproveLoading(prev => ({
                ...prev,
                [jobId]: false
            }));

        }

    };

    

    const declineJob = async (jobId) => {

        try {

            setDeclineLoading(prev => ({
                ...prev,
                [jobId]: true
            }));

            const res = await api.put(

                `/api/admin/jobs/${jobId}/decline`

            );

            notifySuccess(res.data.message);

            setJobs(prev =>
                prev.filter(job => job.id !== jobId)
            );

            setTotal(prev => Math.max(prev - 1, 0));

            if (jobs.length === 1 && page > 1) {

                setPage(prev => prev - 1);

            }

        }

        catch (error) {

            notifyError(

                error.response?.data?.message ||

                "Unable to decline job."

            );

        }

        finally {

            setDeclineLoading(prev => ({
                ...prev,
                [jobId]: false
            }));

        }

    };

   

    const openJob = (job) => {

        setSelectedJob(job);

        setShowDetails(true);

    };

    

    const closeJob = () => {

        setSelectedJob(null);

        setShowDetails(false);

    };

    
    const previousPage = () => {

        if (page > 1) {

            setPage(prev => prev - 1);

        }

    };

    const nextPage = () => {

        if (page < lastPage) {

            setPage(prev => prev + 1);

        }

    };

    const goToPage = (pageNumber) => {

        if (

            pageNumber >= 1 &&

            pageNumber <= lastPage &&

            pageNumber !== page

        ) {

            setPage(pageNumber);

        }

    };

   

    const pageNumbers = useMemo(() => {

        const pages = [];

        let start = Math.max(page - 2, 1);

        let end = Math.min(start + 4, lastPage);

        if (end - start < 4) {

            start = Math.max(end - 4, 1);

        }

        for (let i = start; i <= end; i++) {

            pages.push(i);

        }

        return pages;

    }, [page, lastPage]);

   
    const SkeletonCard = () => (

        <div className="bg-white rounded-2xl shadow p-6">

            <Skeleton height={25} />

            <Skeleton
                height={18}
                className="mt-3"
            />

            <Skeleton
                height={18}
                className="mt-2"
            />

            <Skeleton
                height={18}
                className="mt-2"
            />

            <Skeleton
                height={90}
                className="mt-4"
            />

            <div className="grid grid-cols-3 gap-3 mt-6">

                <Skeleton height={42} />

                <Skeleton height={42} />

                <Skeleton height={42} />

            </div>

        </div>

    );

    return (

    <div className="min-h-screen bg-gray-100 text-[var(--text-color)] sm:p-6 p-3">

        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto">

            {/* Header */}

            <div className="bg-[var(--bg-color)] sm:mt-20 mt-14 rounded-2xl shadow-sm border border-gray-200 sm:p-6 p-3 mb-6">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div>

                        <h1 className="text-3xl font-bold">

                            Pending Job Approvals

                        </h1>

                        <p className=" mt-2">

                            Review and approve newly submitted job postings.

                        </p>

                    </div>

                    <button

                        type="button"

                        onClick={refreshCurrentPage}

                        disabled={refreshing}

                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 disabled:opacity-60"

                    >

                        {

                            refreshing ?

                                <Loader2
                                    size={20}
                                    className="animate-spin"
                                />

                                :

                                <RefreshCw size={20} />

                        }

                        Refresh

                    </button>

                </div>

            </div>

           
            {/* Search */}

            <div className="bg-[var(--bg-color)] rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">

                <div className="relative">

                    <Search
                        size={20}
                        className="absolute left-4 top-4"
                    />

                    <input

                        type="text"

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                        placeholder="Search by title, employer, category or location..."

                        className="w-full border text-black rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500"

                    />

                </div>

            </div>

            {

                error &&

                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">

                    <AlertCircle
                        className="text-red-600"
                        size={22}
                    />

                    <p className="text-red-700">

                        {error}

                    </p>

                </div>

            }

            {

                loading &&

                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    <SkeletonCard />

                    <SkeletonCard />

                    <SkeletonCard />

                    <SkeletonCard />

                    <SkeletonCard />

                    <SkeletonCard />

                </div>

            }

            {

                isEmpty &&

                <div className="bg-[var(--bg-color)] rounded-2xl shadow-sm border border-gray-200 py-20 text-center">

                    <Briefcase
                        size={70}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="text-2xl font-bold mt-5">

                        No Pending Jobs

                    </h2>

                    <p className=" mt-2">

                        There are currently no jobs awaiting approval.

                    </p>

                </div>

            }

{
    !loading &&
    !isEmpty && (

        <>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 sm:gap-6 gap-2 ">

                {filteredJobs.map((job) => (

                    <div
                        key={job.id}
                        className="bg-[var(--bg-color)] rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg 
                        transition-all duration-300 overflow-hidden"
                    >

                        <div className="border-b sm:p-6 p-3">

                            <div className="flex items-start justify-between flex-wrap">

                                <div>

                                    <h2 className="text-xl font-bold">

                                        {job.title}

                                    </h2>

                                    <p className=" mt-1">

                                        {job.user?.first_name} {job.user?.last_name}

                                    </p>

                                </div>

                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">

                                    Pending

                                </span>

                            </div>

                        </div>

                        <div className="p-6 space-y-4">

                            <div className="flex items-center gap-3">

                                <Building2
                                    size={18}
                                    className="text-blue-600"
                                />

                                <span>{job.category?.name}</span>

                            </div>
                            
                            {job.location && 
                            <div className="flex items-center gap-3">

                                <MapPin
                                    size={18}
                                    className="text-red-500"
                                />

                                <span>{job.location}</span>

                            </div> 
                            
                            }
                           

                            <div className="flex items-center gap-3">

                                <Briefcase
                                    size={18}
                                    className="text-green-600"
                                />

                                <span className="capitalize">

                                    {job.job_type}

                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <Wallet
                                    size={18}
                                    className="text-indigo-600"
                                />

                                <span>

                                    {job.currency}{" "}

                                    {Number(job.payment).toLocaleString()}

                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <Users
                                    size={18}
                                    className="text-purple-600"
                                />

                                <span>

                                    {job.employee_needed} Position(s)

                                </span>

                            </div>

                            <div className="flex items-center gap-3">

                                <Calendar
                                    size={18}
                                    className="text-orange-600"
                                />

                               <span>
                                    Expires {new Date(job.expire_date).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            <p className="text-sm line-clamp-3">

                                {job.description}

                            </p>

                            <div className="grid grid-cols-3 gap-3 pt-4 text-sm">

                                <button
                                    onClick={() => openJob(job)}
                                    className="flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-gray-700"
                                >

                                    <Eye size={18} />

                                    View

                                </button>

                                <button
                                    onClick={() => approveJob(job.id)}
                                    disabled={approveLoading[job.id]}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3 hover:bg-green-700 disabled:opacity-60"
                                >

                                    {

                                        approveLoading[job.id]

                                            ?

                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            :

                                            <CheckCircle2 size={18} />

                                    }

                                    Approve

                                </button>

                                <button
                                    onClick={() => declineJob(job.id)}
                                    disabled={declineLoading[job.id]}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white py-3 hover:bg-red-700 disabled:opacity-60"
                                >

                                    {

                                        declineLoading[job.id]

                                            ?

                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            :

                                            <XCircle size={18} />

                                    }

                                    Decline

                                </button>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-6">

                <div className="text-gray-600">

                    Showing

                    <span className="font-semibold mx-1">

                        {jobs.length}

                    </span>

                    of

                    <span className="font-semibold mx-1">

                        {total}

                    </span>

                    pending jobs

                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={previousPage}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-xl disabled:opacity-50"
                    >

                        Previous

                    </button>

                    {pageNumbers.map(number => (

                        <button
                            key={number}
                            onClick={() => goToPage(number)}
                            className={`w-10 h-10 rounded-xl font-semibold ${
                                page === number
                                    ? "bg-blue-600 text-white"
                                    : "border hover:bg-gray-100"
                            }`}
                        >

                            {number}

                        </button>

                    ))}

                    <button
                        onClick={nextPage}
                        disabled={page === lastPage}
                        className="px-4 py-2 border rounded-xl disabled:opacity-50"
                    >

                        Next

                    </button>

                </div>

            </div>

        </>

    )
}

{
    showDetails && (

        <JobPostDetailsModal
            job={selectedJob}
            onClose={closeJob}
            onApprove={() => approveJob(selectedJob.id)}
            onDecline={() => declineJob(selectedJob.id)}
            approveLoading={approveLoading[selectedJob?.id]}
            declineLoading={declineLoading[selectedJob?.id]}
        />

    )
}

        </div>

    </div>

);
}
                                        