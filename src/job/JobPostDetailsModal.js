import {
    X,
    Building2,
    User,
    MapPin,
    Briefcase,
    Wallet,
    Calendar,
    Users,
    Award,
    CheckCircle2,
    Loader2,
    Clock,
    FileText
} from "lucide-react";

export default function JobPostDetailsModal({

    job,
    onClose,
    onApprove,
    onDecline,
    approveLoading,
    declineLoading

}) {

    if (!job) return null;

    return (

        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="bg-[var(--bg-color)] text-[var(--text-color)] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] 
            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin overflow-y-auto">

                {/* Header */}

                <div className="sticky top-0 bg-[var(--bg-color)] text-[var(--text-color)] border-b px-8 py-6 flex justify-between items-start">

                    <div>

                        <h2 className="sm:text-3xl text-xl font-bold">

                            {job.title}

                        </h2>

                        <p className="mt-2">

                            Review Job Request

                        </p>

                    </div>

                    <button

                        onClick={onClose}
                        className="rounded-xl p-2"

                    >

                        <X size={26} />

                    </button>

                </div>

                {/* Body */}

                <div className="p-8 space-y-8">

                    {/* Overview */}

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                        <InfoCard
                            icon={<User size={20} />}
                            label="Posted By"
                            value={(job.user?.first_name) (job.user?.last_name)}
                        />

                        <InfoCard
                            icon={<Building2 size={20} />}
                            label="Category"
                            value={job.category?.name}
                        />

                        <InfoCard
                            icon={<MapPin size={20} />}
                            label="Location"
                            value={job.location}
                        />

                        <InfoCard
                            icon={<Briefcase size={20} />}
                            label="Job Type"
                            value={job.job_type}
                        />

                        <InfoCard
                            icon={<Wallet size={20} />}
                            label="Salary"
                            value={`${job.currency} ${Number(job.payment).toLocaleString()}`}
                        />

                        <InfoCard
                            icon={<Users size={20} />}
                            label="Employees Needed"
                            value={job.employee_needed}
                        />

                        <InfoCard
                            icon={<Calendar size={20} />}
                            label="Expire Date"
                            value={new Date(job.expire_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })}
                        />

                        <InfoCard
                            icon={<Clock size={20} />}
                            label="Status"
                            value={job.status}
                        />

                        <InfoCard
                            icon={<Wallet size={20} />}
                            label="Additional Compensation"
                            value={
                                job.additional_compensation ||
                                "None"
                            }
                        />

                    </div>

                    {/* About */}

                    <Section
                        title="About Company"
                        icon={<Building2 size={20} />}
                    >

                        {job.about_us}

                    </Section>

                    {/* Description */}

                    <Section
                        title="Job Description"
                        icon={<FileText size={20} />}
                    >

                        {job.description}

                    </Section>

                    {/* Responsibilities */}

                    <Section
                        title="Responsibilities"
                        icon={<CheckCircle2 size={20} />}
                    >

                        {job.what_you_do}

                    </Section>

                    {/* Qualification */}

                    {

                        job.enable_qualification && (

                            <Section
                                title="Qualification Required"
                                icon={<Award size={20} />}
                            >

                                {job.qualification}

                            </Section>

                        )

                    }

                    {/* Experience */}

                    {

                        job.enable_experience && (

                            <Section
                                title="Experience Required"
                                icon={<Briefcase size={20} />}
                            >

                                {job.experience}

                            </Section>

                        )

                    }

                    {/* Years */}

                    {

                        job.enable_year_experience && (

                            <Section
                                title="Minimum Years of Experience"
                                icon={<Clock size={20} />}
                            >

                                {job.year_experience} Years

                            </Section>

                        )

                    }

                </div>

                {/* Footer */}

                <div className="border-t p-6 flex justify-end gap-4">

                    <button

                        onClick={onClose}

                        className="px-6 py-3 rounded-xl border hover:bg-gray-700"

                    >

                        Close

                    </button>

                    <button

                        onClick={onDecline}

                        disabled={declineLoading}

                        className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"

                    >

                        {

                            declineLoading ?

                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                :

                                null

                        }

                        Decline

                    </button>

                    <button

                        onClick={onApprove}

                        disabled={approveLoading}

                        className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"

                    >

                        {

                            approveLoading ?

                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                :

                                null

                        }

                        Approve

                    </button>

                </div>

            </div>

        </div>

    );

}

function InfoCard({

    icon,
    label,
    value

}) {

    return (

        <div className="border rounded-2xl p-5 bg-[var(--bg-color)] text-[var(--text-color)]">

            <div className="flex items-center gap-3 text-blue-600">

                {icon}

                <span className="font-semibold">

                    {label}

                </span>

            </div>

            <p className="mt-3 text-[var(--text-color)] break-words">

                {value || "-"}

            </p>

        </div>

    );

}

function Section({

    title,
    icon,
    children

}) {

    return (

        <div className="border rounded-2xl sm:p-6 px-2 bg-[var(--bg-color)] text-[var(--text-color)]">

            <div className="flex items-center gap-3 mb-4">

                <div className="text-blue-600">

                    {icon}

                </div>

                <h3 className="text-xl font-semibold">

                    {title}

                </h3>

            </div>

            <div className="whitespace-pre-line text-[var(--text-color)] leading-7">

                {children}

            </div>

        </div>

    );

}