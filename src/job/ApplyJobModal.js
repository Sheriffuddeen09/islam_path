import React, {
    useEffect,
    useState
} from "react";

import {
    X,
    Upload,
    FileText,
    GraduationCap,
    BriefcaseBusiness,
    Clock3,
    CreditCard,
    Send,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

import api from "../Api/axios";

export default function ApplyJobModal({
    job,
    isOpen,
    onClose,
    onSuccess
}) {

    const [applying, setApplying] = useState(false);

    const [loadingStatus, setLoadingStatus] = useState(false);

    const [applied, setApplied] = useState(false);

    const [applicationError, setApplicationError] =
        useState("");

    const [applicationSuccess, setApplicationSuccess] =
        useState("");

    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({

        cv: null,

        additional_text: "",

        qualification: "",

        experience: "",

        year_experience: "",

        payment: ""

    });


    /*
    |--------------------------------------------------------------------------
    | Check Application Status
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!isOpen || !job?.id) {
            return;
        }

        const checkApplicationStatus = async () => {

            try {

                setLoadingStatus(true);

                const response = await api.get(
                    `/api/jobs/${job.id}/application-status`
                );

                setApplied(
                    response.data.applied
                );

            } catch (error) {

                console.error(
                    "Application status error:",
                    error
                );

            } finally {

                setLoadingStatus(false);

            }

        };

        checkApplicationStatus();

    }, [isOpen, job?.id]);


    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    const resetForm = () => {

        setForm({

            cv: null,

            additional_text: "",

            qualification: "",

            experience: "",

            year_experience: "",

            payment: ""

        });

        setErrors({});

        setApplicationError("");

        setApplicationSuccess("");

    };


    /*
    |--------------------------------------------------------------------------
    | Close
    |--------------------------------------------------------------------------
    */

    const handleClose = () => {

        if (applying) {
            return;
        }

        resetForm();

        onClose();

    };


    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

        setErrors((previous) => ({

            ...previous,

            [name]: ""

        }));

    };


    /*
    |--------------------------------------------------------------------------
    | CV
    |--------------------------------------------------------------------------
    */

    const handleCvChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];

        if (!allowedTypes.includes(file.type)) {

            setApplicationError(
                "Please upload a PDF, DOC, or DOCX file."
            );

            e.target.value = "";

            return;

        }

        if (file.size > 5 * 1024 * 1024) {

            setApplicationError(
                "Your CV must not exceed 5MB."
            );

            e.target.value = "";

            return;

        }

        setApplicationError("");

        setForm((previous) => ({

            ...previous,

            cv: file

        }));

    };


    /*
    |--------------------------------------------------------------------------
    | Client Validation
    |--------------------------------------------------------------------------
    */

    const validate = () => {

        const newErrors = {};


        if (
            job?.enable_qualification &&
            !form.qualification.trim()
        ) {

            newErrors.qualification =
                "Qualification is required.";

        }


        if (
            job?.enable_experience &&
            !form.experience.trim()
        ) {

            newErrors.experience =
                "Experience is required.";

        }


        if (
            job?.enable_year_experience &&
            (
                form.year_experience === "" ||
                form.year_experience === null
            )
        ) {

            newErrors.year_experience =
                "Years of experience is required.";

        }


        if (
            job?.payment_required &&
            (
                form.payment === "" ||
                form.payment === null
            )
        ) {

            newErrors.payment =
                "Payment is required.";

        }


        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };


    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setApplicationError("");

        setApplicationSuccess("");

        // if (!validate()) {
        //     return;
        // }

        try {

            setApplying(true);

            const formData = new FormData();


            if (form.cv) {

                formData.append(
                    "cv",
                    form.cv
                );

            }


            formData.append(
                "additional_text",
                form.additional_text
            );


            if (job.enable_qualification) {

                formData.append(
                    "qualification",
                    form.qualification
                );

            }


            if (job.enable_experience) {

                formData.append(
                    "experience",
                    form.experience
                );

            }


            if (job.enable_year_experience) {

                formData.append(
                    "year_experience",
                    form.year_experience
                );

            }


            if (job.payment_required) {

                formData.append(
                    "payment",
                    form.payment
                );

            }


            const response = await api.post(

                `/api/jobs/${job.id}/apply`,

                formData,

                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }

            );


            setApplied(true);

            setApplicationSuccess(
                response.data.message ||
                "Your application has been submitted successfully."
            );


            if (onSuccess) {

                onSuccess(
                    response.data
                );

            }


        } catch (error) {

            console.error(
                "Apply error:",
                error
            );


            if (
                error.response?.status === 422
            ) {

                const backendErrors =
                    error.response?.data?.errors || {};

                setErrors(
                    backendErrors
                );

                setApplicationError(
                    error.response?.data?.message ||
                    "Please correct the errors and try again."
                );

            } else {

                setApplicationError(
                    error.response?.data?.message ||
                    "Unable to submit your application."
                );

            }

        } finally {

            setApplying(false);

        }

    };


    if (!isOpen) {
        return null;
    }


    return (

        <div
            className="
                fixed
                inset-0
                z-[100]
                bg-black/60
                backdrop-blur-sm
                flex
                items-center
                justify-center
                p-3
                sm:p-6
            "
            onClick={handleClose}
        >

            <div
                className="
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    w-full
                    max-w-2xl
                    max-h-[94vh]
                    rounded-3xl
                    shadow-2xl
                    overflow-hidden
                    flex
                    flex-col
                    scrollbar 
                    scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                "
                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                {/* HEADER */}

                <div
                    className="
                        px-5
                        sm:px-7
                        py-5
                        border-b
                        flex
                        items-center
                        justify-between
                        shrink-0
                    "
                >

                    <div className="min-w-0">

                        <h2
                            className="
                                text-xl
                                sm:text-2xl
                                font-bold
                            "
                        >

                            Apply for this Job

                        </h2>

                        <p
                            className="
                                text-sm
                                mt-1
                                truncate
                            "
                        >

                            {job?.title}

                        </p>

                    </div>


                    <button

                        type="button"

                        disabled={applying}

                        onClick={handleClose}

                        className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            transition
                            shrink-0
                        "
                    >

                        <X size={21} />

                    </button>

                </div>


                {/* CONTENT */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        overflow-y-auto
                        p-5
                        sm:p-7
                        space-y-6
                        scrollbar 
                        scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                    "
                >

                    {/* JOB INFO */}

                    <div
                        className="
                            border
                            border-blue-100
                            rounded-2xl
                            p-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <BriefcaseBusiness
                                    size={21}
                                />

                            </div>


                            <div className="min-w-0">

                                <h3
                                    className="
                                        font-semibold
                                        truncate
                                    "
                                >

                                    {job?.title}

                                </h3>

                                <p
                                    className="
                                        text-sm
                                        truncate
                                    "
                                >

                                    {
                                        job?.user?.job_profile
                                            ?.company_name ||
                                        `${job?.user?.first_name || ""} ${job?.user?.last_name || ""}`
                                    }

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ALREADY APPLIED */}

                    {
                        applied && (

                            <div
                                className="
                                    bg-green-50
                                    border
                                    border-green-200
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        gap-3
                                    "
                                >

                                    <CheckCircle2
                                        className="
                                            text-green-600
                                            shrink-0
                                        "
                                        size={23}
                                    />

                                    <div>

                                        <h3
                                            className="
                                                font-semibold
                                                text-green-800
                                            "
                                        >

                                            Already Applied

                                        </h3>

                                        <p
                                            className="
                                                text-sm
                                                text-green-700
                                                mt-1
                                            "
                                        >

                                            You have already submitted
                                            an application for this job.

                                        </p>

                                    </div>

                                </div>

                            </div>

                        )
                    }


                    {/* SUCCESS */}

                    {
                        applicationSuccess && (

                            <div
                                className="
                                    bg-green-50
                                    border
                                    border-green-200
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        gap-3
                                    "
                                >

                                    <CheckCircle2
                                        size={22}
                                        className="
                                            text-green-600
                                            shrink-0
                                        "
                                    />

                                    <div>

                                        <p
                                            className="
                                                font-semibold
                                                text-green-800
                                            "
                                        >

                                            Application Submitted

                                        </p>

                                        <p
                                            className="
                                                text-sm
                                                text-green-700
                                                mt-1
                                            "
                                        >

                                            {applicationSuccess}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        )
                    }


                    {/* ERROR */}

                    {
                        applicationError && (

                            <div
                                className="
                                    bg-red-50
                                    border
                                    border-red-200
                                    rounded-xl
                                    p-4
                                    text-red-700
                                    text-sm
                                    flex
                                    gap-3
                                "
                            >

                                <AlertCircle
                                    size={20}
                                    className="shrink-0"
                                />

                                <span>

                                    {applicationError}

                                </span>

                            </div>

                        )
                    }


                    {/* FORM */}

                    {
                        !applied &&
                        !applicationSuccess && (

                            <>

                                {/* CV */}

                                <div>

                                    <label
                                        className="
                                            block
                                            font-semibold
                                            mb-2
                                        "
                                    >

                                        CV / Resume

                                        <span
                                            className="
                                                ml-2
                                                font-normal
                                            "
                                        >

                                            Optional

                                        </span>

                                    </label>


                                    <label
                                        className="
                                            border-2
                                            border-dashed
                                            border-gray-200
                                            hover:border-blue-400
                                            rounded-2xl
                                            p-5
                                            flex
                                            items-center
                                            gap-4
                                            cursor-pointer
                                            transition
                                        "
                                    >

                                        <div
                                            className="
                                                w-12
                                                h-12
                                                rounded-xl
                                                bg-blue-50
                                                text-blue-600
                                                flex
                                                items-center
                                                justify-center
                                                shrink-0
                                            "
                                        >

                                            {
                                                form.cv
                                                    ? (
                                                        <FileText
                                                            size={21}
                                                        />
                                                    )
                                                    : (
                                                        <Upload
                                                            size={21}
                                                        />
                                                    )
                                            }

                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            {
                                                form.cv ? (

                                                    <>

                                                        <p
                                                            className="
                                                                font-semibold
                                                                truncate
                                                            "
                                                        >

                                                            {
                                                                form.cv.name
                                                            }

                                                        </p>

                                                        <p
                                                            className="
                                                                text-sm
                                                            "
                                                        >

                                                            {
                                                                (
                                                                    form.cv.size /
                                                                    1024 /
                                                                    1024
                                                                ).toFixed(2)
                                                            }

                                                            {" "}MB

                                                        </p>

                                                    </>

                                                ) : (

                                                    <>

                                                        <p
                                                            className="
                                                                font-semibold text-sm
                                                            "
                                                        >

                                                            Upload your CV

                                                        </p>

                                                        <p
                                                            className="
                                                                text-xs
                                                            "
                                                        >

                                                            PDF, DOC or DOCX ·
                                                            Maximum 5MB

                                                        </p>

                                                    </>

                                                )
                                            }

                                        </div>


                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleCvChange}
                                            className="hidden"
                                        />

                                    </label>

                                </div>


                                {/* QUALIFICATION */}

                                {
                                    job?.enable_qualification && (

                                        <div>

                                            <label
                                                className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                "
                                            >

                                                Qualification

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>

                                            </label>


                                            <div className="relative">

                                                <GraduationCap
                                                    size={19}
                                                    className="
                                                        absolute
                                                        left-4
                                                        top-4
                                                    "
                                                />

                                                <input
                                                    type="text"
                                                    name="qualification"
                                                    value={
                                                        form.qualification
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="e.g. B.Sc. Computer Science"
                                                    className={`
                                                        w-full text-black
                                                        border
                                                        rounded-xl
                                                        pl-11
                                                        pr-4
                                                        py-3
                                                        outline-none
                                                        focus:ring-2
                                                        ${
                                                            errors.qualification
                                                                ? "border-red-400 focus:ring-red-200"
                                                                : "focus:ring-blue-500"
                                                        }
                                                    `}
                                                />

                                            </div>


                                            {
                                                errors.qualification && (

                                                    <p
                                                        className="
                                                            text-red-600
                                                            text-xs
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            Array.isArray(
                                                                errors.qualification
                                                            )
                                                                ? errors.qualification[0]
                                                                : errors.qualification
                                                        }

                                                    </p>

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {/* EXPERIENCE */}

                                {
                                    job?.enable_experience && (

                                        <div>

                                            <label
                                                className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                "
                                            >

                                                Experience

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>

                                            </label>


                                            <textarea
                                                name="experience"
                                                value={
                                                    form.experience
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows={4}
                                                placeholder="Describe your relevant experience..."
                                                className={`
                                                    w-full
                                                    border
                                                    rounded-xl
                                                    px-4
                                                    py-3
                                                    outline-none
                                                    resize-none
                                                    ${
                                                        errors.experience
                                                            ? "border-red-400"
                                                            : ""
                                                    }
                                                    focus:ring-2
                                                    focus:ring-blue-500
                                                `}
                                            />


                                            {
                                                errors.experience && (

                                                    <p
                                                        className="
                                                            text-red-600
                                                            text-xs
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            Array.isArray(
                                                                errors.experience
                                                            )
                                                                ? errors.experience[0]
                                                                : errors.experience
                                                        }

                                                    </p>

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {/* YEARS */}

                                {
                                    job?.enable_year_experience && (

                                        <div>

                                            <label
                                                className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                "
                                            >

                                                Years of Experience

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>

                                            </label>


                                            <div className="relative">

                                                <Clock3
                                                    size={19}
                                                    className="
                                                        absolute
                                                        left-4
                                                        top-4
                                                    "
                                                />

                                                <input
                                                    type="text"
                                                    name="year_experience"
                                                    min="0"
                                                    max="100"
                                                    step="0.5"
                                                    value={
                                                        form.year_experience
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="e.g. 3"
                                                    className={`
                                                        w-full text-black
                                                        border
                                                        rounded-xl
                                                        pl-11
                                                        pr-4
                                                        py-3
                                                        outline-none
                                                        focus:ring-2
                                                        ${
                                                            errors.year_experience
                                                                ? "border-red-400"
                                                                : ""
                                                        }
                                                    `}
                                                />

                                            </div>


                                            {
                                                errors.year_experience && (

                                                    <p
                                                        className="
                                                            text-red-600
                                                            text-xs
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            Array.isArray(
                                                                errors.year_experience
                                                            )
                                                                ? errors.year_experience[0]
                                                                : errors.year_experience
                                                        }

                                                    </p>

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {/* PAYMENT */}

                                {
                                    job?.payment_required && (

                                        <div>

                                            <label
                                                className="
                                                    block
                                                    font-semibold
                                                    mb-2
                                                "
                                            >

                                                Expected Payment

                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>

                                            </label>


                                            <div className="relative">

                                                <CreditCard
                                                    size={19}
                                                    className="
                                                        absolute
                                                        left-4
                                                        top-4
                                                        text-black
                                                    "
                                                />

                                                <input
                                                    type="text"
                                                    name="payment"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        form.payment
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={
                                                        `Enter amount in ${job?.currency || "your currency"}`
                                                    }
                                                    className={`
                                                        w-full text-black
                                                        border
                                                        rounded-xl
                                                        pl-11
                                                        pr-4
                                                        py-3
                                                        outline-none
                                                        focus:ring-2
                                                        ${
                                                            errors.payment
                                                                ? "border-red-400"
                                                                : ""
                                                        }
                                                    `}
                                                />

                                            </div>


                                            <p
                                                className="
                                                    text-xs
                                                    mt-2
                                                "
                                            >

                                                Currency:{" "}
                                                {job?.currency || "Not specified"}

                                            </p>


                                            {
                                                errors.payment && (

                                                    <p
                                                        className="
                                                            text-red-600
                                                            text-xs
                                                            mt-1
                                                        "
                                                    >

                                                        {
                                                            Array.isArray(
                                                                errors.payment
                                                            )
                                                                ? errors.payment[0]
                                                                : errors.payment
                                                        }

                                                    </p>

                                                )
                                            }

                                        </div>

                                    )
                                }


                                {/* ADDITIONAL TEXT */}

                                <div>

                                    <label
                                        className="
                                            block
                                            font-semibold
                                            mb-2
                                        "
                                    >

                                        Additional Message

                                        <span
                                            className="
                                                ml-2
                                                font-normal
                                            "
                                        >

                                            Optional

                                        </span>

                                    </label>


                                    <textarea
                                        name="additional_text"
                                        value={
                                            form.additional_text
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows={5}
                                        placeholder="Tell the employer anything else you would like them to know"
                                        className="
                                            text-black
                                            w-full
                                            border
                                            rounded-xl
                                            px-4
                                            py-3
                                            outline-none
                                            resize-none
                                            focus:ring-2
                                            focus:ring-blue-500
                                        "
                                    />

                                </div>


                                {/* ACTIONS */}

                                <div
                                    className="
                                        flex
                                        flex-col-reverse
                                        sm:flex-row
                                        gap-3
                                        sm:justify-end
                                        pt-2
                                    "
                                >

                                    <button
                                        type="button"
                                        disabled={applying}
                                        onClick={handleClose}
                                        className="
                                            border
                                            rounded-xl
                                            px-6
                                            py-3
                                            font-semibold
                                            hover:bg-gray-50
                                            transition
                                        "
                                    >

                                        Cancel

                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            applying ||
                                            loadingStatus
                                        }
                                        className="
                                            bg-blue-600
                                            hover:bg-blue-700
                                            disabled:bg-blue-400
                                            text-white
                                            rounded-xl
                                            px-7
                                            py-3
                                            font-semibold
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            transition
                                        "
                                    >

                                        {
                                            applying ? (

                                                <>

                                                    <span
                                                        className="
                                                            w-5
                                                            h-5
                                                            border-2
                                                            border-white/40
                                                            border-t-white
                                                            rounded-full
                                                            animate-spin
                                                        "
                                                    />

                                                    Submitting

                                                </>

                                            ) : (

                                                <>

                                                    <Send size={18} />

                                                    Submit Application

                                                </>

                                            )
                                        }

                                    </button>

                                </div>

                            </>

                        )
                    }


                    {/* SUCCESS CLOSE */}

                    {
                        applicationSuccess && (

                            <button
                                type="button"
                                onClick={handleClose}
                                className="
                                    w-full
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-semibold
                                    transition
                                "
                            >

                                Done

                            </button>

                        )
                    }

                </form>

            </div>

        </div>

    );

}