import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    LoaderCircle,
    Badge,
    CheckCircle,
    X,
    Lock,
    MapPin,
    Globe2,
    Clock,
    CalendarDays,
    ShieldCheck
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../Api/axios";


export default function SelectAdvertisementVisibility() {

    const {
        id
    } = useParams();

    const navigate = useNavigate();


    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        unlockLoading,
        setUnlockLoading
    ] = useState(false);

    const [
        advertisement,
        setAdvertisement
    ] = useState(null);

    const [
        badges,
        setBadges
    ] = useState({
        total: 0
    });

    const [
        selectedAudience,
        setSelectedAudience
    ] = useState("");

    const [
        selectedAudienceLabel,
        setSelectedAudienceLabel
    ] = useState("");

    const [
        selectedOption,
        setSelectedOption
    ] = useState(null);

    const [
        openModal,
        setOpenModal
    ] = useState(false);

    const [
        successModal,
        setSuccessModal
    ] = useState(false);

    const [
        adsWatched,
        setAdsWatched
    ] = useState(0);


    const visibilityOptions = [

        {
            value: "25",

            title:
                "1/4 of Locations",

            shortTitle:
                "1/4 Locations",

            description:
                "Your advertisement will be visible beyond your own location to approximately one quarter of available locations.",

            badges: 50,

            months: 1,

            icon: MapPin
        },

        {
            value: "50",

            title:
                "1/2 of Locations",

            shortTitle:
                "1/2 Locations",

            description:
                "Your advertisement will be visible to approximately half of available locations.",

            badges: 100,

            months: 2,

            icon: MapPin
        },

        {
            value: "75",

            title:
                "3/4 of Locations",

            shortTitle:
                "3/4 Locations",

            description:
                "Your advertisement will be visible to approximately three quarters of available locations.",

            badges: 200,

            months: 3,

            icon: Globe2
        },

        {
            value: "100",

            title:
                "All Locations",

            shortTitle:
                "All Locations",

            description:
                "Your advertisement will be visible across all available locations.",

            badges: 300,

            months: 4,

            icon: Globe2
        }

    ];


    useEffect(() => {

        fetchAdvertisement();

        fetchBadges();

    }, [id]);


    const fetchAdvertisement = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    `/api/advertisement/${id}`
                );

            setAdvertisement(
                response.data.advertisement
            );

        } catch (error) {

            console.error(
                "ADVERTISEMENT FETCH ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to fetch advertisement."
            );

        } finally {

            setLoading(false);

        }

    };


    const fetchBadges = async () => {

        try {

            const response =
                await api.get(
                    "/api/user/badges"
                );

            setBadges({

                total:
                    Number(
                        response.data?.total || 0
                    )

            });

        } catch (error) {

            console.error(
                "BADGE FETCH ERROR:",
                error
            );

            setBadges({
                total: 0
            });

        }

    };


    const getVisibilityOption = (
        audience
    ) => {

        return visibilityOptions.find(
            option =>
                String(option.value) ===
                String(audience)
        );

    };


    const currentVisibility =
        advertisement
            ? getVisibilityOption(
                advertisement.audience
            )
            : null;


    const isVisibilityExpired = () => {

        if (
            !advertisement?.visibility_expires_at
        ) {

            return false;

        }

        return (
            new Date(
                advertisement.visibility_expires_at
            ).getTime()
            <
            Date.now()
        );

    };


    const visibilityExpired =
        isVisibilityExpired();


    const visibilityActive =
        Boolean(
            advertisement?.visibility_unlocked
        ) &&
        !visibilityExpired;

    const handleSelection = (
        option
    ) => {

        if (
            visibilityActive
        ) {

            toast.error(
                "Your advertisement visibility is still active."
            );

            return;

        }


        if (
            advertisement?.status !==
            "approved"
        ) {

            toast.error(
                "Advertisement must be approved first."
            );

            return;

        }


        setSelectedAudience(
            option.value
        );

        setSelectedAudienceLabel(
            option.title
        );

        setSelectedOption(
            option
        );

        setOpenModal(
            true
        );

    };


    const closeModal = () => {

        if (
            unlockLoading
        ) {

            return;

        }

        setOpenModal(false);

        setSelectedAudience("");

        setSelectedAudienceLabel("");

        setSelectedOption(null);

    };

    const unlockVisibility =
        async () => {

            if (
                !selectedAudience ||
                !selectedOption
            ) {

                toast.error(
                    "Please select a visibility option."
                );

                return;

            }

            if (
                badges.total <
                selectedOption.badges
            ) {

                toast.error(
                    `You need ${selectedOption.badges} badges.`
                );

                return;

            }


            try {

                setUnlockLoading(
                    true
                );


                const response =
                    await api.post(

                        `/api/advertisement/unlock-visibility/${id}`,

                        {
                            audience:
                                selectedAudience
                        }

                    );

                const updatedAdvertisement =
                    response.data.advertisement;


                setAdvertisement(
                    updatedAdvertisement
                );

                await fetchBadges();

                setOpenModal(
                    false
                );


                setSuccessModal(
                    true
                );


                setSelectedAudience("");

                setSelectedAudienceLabel("");

                setSelectedOption(null);


                toast.success(
                    response.data.message ||
                    "Advertisement visibility unlocked successfully."
                );


            } catch (error) {

                console.error(
                    "UNLOCK VISIBILITY ERROR:",
                    error
                );


                console.error(
                    "SERVER RESPONSE:",
                    error.response?.data
                );


                if (
                    error.response?.status ===
                    422
                ) {

                    const errors =
                        error.response?.data?.errors;


                    if (
                        errors
                    ) {

                        Object.values(
                            errors
                        )
                        .flat()
                        .forEach(
                            message =>
                                toast.error(
                                    message
                                )
                        );

                    } else {

                        toast.error(
                            "Please check your selection."
                        );

                    }

                } else {

                    toast.error(

                        error.response?.data?.message ||

                        "Unable to unlock advertisement visibility."

                    );

                }

            } finally {

                setUnlockLoading(
                    false
                );

            }

        };

    const handleWatchAd =
        async () => {

            if (
                adsWatched >= 6
            ) {

                return;

            }

            try {

                const response =
                    await api.post(
                        "/api/student/watch-ad"
                    );


                setBadges({

                    total:
                        Number(
                            response.data?.total ||
                            0
                        )

                });


                setAdsWatched(
                    previous =>
                        previous + 1
                );


                toast.success(
                    "+5 badges earned."
                );

            } catch (error) {

                console.error(
                    "WATCH AD ERROR:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "Unable to watch advertisement."
                );

            }

        };


    const formatDate = (
        date
    ) => {

        if (!date) {

            return "Not available";

        }

        return new Date(
            date
        ).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    };

    const formatDateTime = (
        date
    ) => {

        if (!date) {

            return "Not available";

        }

        return new Date(
            date
        ).toLocaleString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    const Skeleton = () => {

        return (

            <div className="animate-pulse space-y-5">

                <div className="h-80 rounded-3xl bg-gray-200" />

                <div className="h-10 rounded bg-gray-200" />

                <div className="h-32 rounded bg-gray-200" />

            </div>

        );

    };


    if (
        loading
    ) {

        return (

            <div className="
                max-w-7xl
                mx-auto
                px-5
                pt-24
                pb-10
            ">

                <Skeleton />

            </div>

        );

    }

    if (
        !advertisement
    ) {

        return (

            <div className="
                max-w-3xl
                mx-auto
                px-5
                pt-24
                text-center
            ">

                <div className="
                    rounded-3xl
                    border
                    p-10
                ">

                    <h1 className="
                        text-2xl
                        font-bold
                    ">

                        Advertisement Not Found

                    </h1>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/my-advertisements"
                            )
                        }
                        className="
                            mt-6
                            px-6
                            py-3
                            bg-blue-600
                            text-white
                            rounded-xl
                            font-semibold
                        "
                    >

                        Back to My Advertisements

                    </button>

                </div>

            </div>

        );

    }


    return (

        <>

            <div className="
                max-w-7xl
                mx-auto
                px-3
                sm:px-5
                pt-20
                sm:pt-24
                pb-12
            ">

                <div className="
                    mb-6
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                ">

                    <div>

                        <h1 className="
                            text-2xl
                            sm:text-3xl
                            font-bold
                        ">

                            Advertisement Visibility

                        </h1>

                        <p className="
                            mt-2
                        
                        ">

                            Select how widely you want your
                            advertisement to be displayed.

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/my-advertisements"
                            )
                        }
                        className="
                            border
                            rounded-xl
                            px-5
                            py-3
                            font-semibold
                            hover:bg-gray-100
                            dark:hover:bg-gray-800
                            transition
                        "
                    >

                        My Advertisements

                    </button>

                </div>

                <div className="
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    rounded-3xl
                    shadow-xl
                    overflow-hidden
                    border
                ">


                    {/* MEDIA */}

                    {advertisement.media_type ===
                        "image" && (

                        <img
                            src={`
                                http://localhost:8000/storage/
                                ${advertisement.media}
                            `}
                            alt={
                                advertisement.title
                            }
                            className="
                                w-full
                                h-72
                                sm:h-[450px]
                                object-cover
                            "
                        />

                    )}


                    {advertisement.media_type ===
                        "video" && (

                        <video
                            controls
                            className="
                                w-full
                                h-72
                                sm:h-[450px]
                                object-cover
                            "
                        >

                            <source
                                src={`
                                    http://localhost:8000/storage/
                                    ${advertisement.media}
                                `}
                            />

                        </video>

                    )}


                    {/* CONTENT */}

                    <div className="
                        p-5
                        sm:p-8
                    ">


                        <div className="
                            flex
                            flex-wrap
                            gap-3
                            mb-5
                        ">

                            <span className="
                                px-4
                                py-2
                                rounded-full
                                bg-blue-100
                                text-blue-700
                                text-sm
                                font-semibold
                            ">

                                {advertisement.type}

                            </span>


                            <span className="
                                px-4
                                py-2
                                rounded-full
                                bg-green-100
                                text-green-700
                                text-sm
                                font-semibold
                            ">

                                {advertisement.status}

                            </span>

                        </div>


                        <h2 className="
                            text-2xl
                            sm:text-4xl
                            font-bold
                        ">

                            {advertisement.title}

                        </h2>


                        <p className="
                            mt-4
                            leading-8
                        
                        ">

                            {
                                advertisement.description
                            }

                        </p>


                        {advertisement.visibility_unlocked && (

                            <div className={`
                                mt-7
                                rounded-2xl
                                border
                                p-5
                                ${
                                    visibilityActive
                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                        : "border-red-500 bg-red-50 dark:bg-red-950/20"
                                }
                            `}>


                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                    {visibilityActive ? (

                                        <CheckCircle
                                            className="
                                                text-green-600
                                            "
                                            size={24}
                                        />

                                    ) : (

                                        <Clock
                                            className="
                                                text-red-600
                                            "
                                            size={24}
                                        />

                                    )}


                                    <h3 className="
                                        font-bold
                                        text-lg
                                    ">

                                        {visibilityActive
                                            ? "Visibility Active"
                                            : "Visibility Expired"
                                        }

                                    </h3>

                                </div>


                                <div className="
                                    mt-5
                                    grid
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                    gap-4
                                ">


                                    <div className="
                                        rounded-xl
                                        border
                                        p-4
                                    ">

                                        <p className="
                                            text-xs
                                        
                                        ">

                                            Audience

                                        </p>

                                        <p className="
                                            font-bold
                                            mt-1
                                        ">

                                            {
                                                currentVisibility
                                                    ?.title ||
                                                `${advertisement.audience}%`
                                            }

                                        </p>

                                    </div>


                                    <div className="
                                        rounded-xl
                                        border
                                        p-4
                                    ">

                                        <p className="
                                            text-xs
                                        
                                        ">

                                            Badges Used

                                        </p>

                                        <p className="
                                            font-bold
                                            mt-1
                                        ">

                                            {
                                                advertisement.required_badges
                                            }

                                            {" "}🏅

                                        </p>

                                    </div>


                                    <div className="
                                        rounded-xl
                                        border
                                        p-4
                                    ">

                                        <p className="
                                            text-xs
                                        
                                        ">

                                            Started

                                        </p>

                                        <p className="
                                            font-bold
                                            mt-1
                                        ">

                                            {
                                                formatDate(
                                                    advertisement.visibility_started_at
                                                )
                                            }

                                        </p>

                                    </div>


                                    <div className="
                                        rounded-xl
                                        border
                                        p-4
                                    ">

                                        <p className="
                                            text-xs
                                        
                                        ">

                                            Expires

                                        </p>

                                        <p className={`
                                            font-bold
                                            mt-1
                                            ${
                                                visibilityExpired
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }
                                        `}>

                                            {
                                                formatDate(
                                                    advertisement.visibility_expires_at
                                                )
                                            }

                                        </p>

                                    </div>

                                </div>


                                {visibilityActive && (

                                    <div className="
                                        mt-5
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        text-green-700
                                    ">

                                        <ShieldCheck
                                            size={18}
                                        />

                                        <span>

                                            Your advertisement is
                                            currently visible at the
                                            selected visibility level.

                                        </span>

                                    </div>

                                )}

                            </div>

                        )}


                        {/* ==================================================
                            SELECT VISIBILITY
                        ================================================== */}

                        {(
                            !advertisement.visibility_unlocked ||
                            visibilityExpired
                        ) && (

                            <div className="
                                mt-8
                                border
                                border-blue-500
                                rounded-3xl
                                p-4
                                sm:p-7
                            ">


                                <div className="mb-7">

                                    <h2 className="
                                        text-2xl
                                        font-bold
                                    ">

                                        Select Visibility

                                    </h2>

                                    <p className="
                                        mt-2
                                    
                                    ">

                                        The badges will be deducted
                                        from your account when you
                                        confirm your selection.

                                    </p>

                                </div>


                                <div className="
                                    grid
                                    sm:grid-cols-2
                                    gap-5
                                ">

                                    {visibilityOptions.map(
                                        option => {

                                            const Icon =
                                                option.icon;

                                            const enoughBadges =
                                                badges.total >=
                                                option.badges;


                                            return (

                                                <button
                                                    key={
                                                        option.value
                                                    }
                                                    type="button"
                                                    disabled={
                                                        !enoughBadges ||
                                                        unlockLoading
                                                    }
                                                    onClick={() =>
                                                        handleSelection(
                                                            option
                                                        )
                                                    }
                                                    className={`
                                                        text-left
                                                        border
                                                        rounded-2xl
                                                        p-5
                                                        transition
                                                        ${
                                                            enoughBadges
                                                                ? "border-blue-500 hover:border-blue-700 hover:shadow-lg"
                                                                : "border-gray-30 cursor-not-allowed"
                                                        }
                                                    `}
                                                >

                                                    <div className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    ">

                                                        <div className="
                                                            w-12
                                                            h-12
                                                            rounded-xl
                                                            bg-blue-100
                                                            text-blue-600
                                                            flex
                                                            items-center
                                                            justify-center
                                                        ">

                                                            <Icon
                                                                size={24}
                                                            />

                                                        </div>


                                                        {!enoughBadges && (

                                                            <Lock
                                                                size={20}
                                                                className="
                                                                    text-red-500
                                                                "
                                                            />

                                                        )}

                                                    </div>


                                                    <h3 className="
                                                        mt-5
                                                        font-bold
                                                        text-xl
                                                    ">

                                                        {
                                                            option.title
                                                        }

                                                    </h3>


                                                    <p className="
                                                        mt-2
                                                        text-sm
                                                    
                                                        leading-6
                                                    ">

                                                        {
                                                            option.description
                                                        }

                                                    </p>


                                                    <div className="
                                                        mt-5
                                                        flex
                                                        flex-wrap
                                                        gap-2
                                                    ">

                                                        <span className="
                                                            rounded-full
                                                            bg-yellow-100
                                                            text-yellow-700
                                                            px-3
                                                            py-1
                                                            text-sm
                                                            font-bold
                                                        ">

                                                            {
                                                                option.badges
                                                            }

                                                            {" "}🏅

                                                        </span>


                                                        <span className="
                                                            rounded-full
                                                            bg-purple-100
                                                            text-purple-700
                                                            px-3
                                                            py-1
                                                            text-sm
                                                            font-bold
                                                        ">

                                                            {
                                                                option.months
                                                            }

                                                            {" "}

                                                            {
                                                                option.months ===
                                                                1
                                                                    ? "Month"
                                                                    : "Months"
                                                            }

                                                        </span>

                                                    </div>


                                                    {!enoughBadges && (

                                                        <p className="
                                                            mt-4
                                                            text-sm
                                                            text-red-500
                                                            font-semibold
                                                        ">

                                                            You need{" "}

                                                            {
                                                                option.badges -
                                                                badges.total
                                                            }

                                                            {" "}more badges.

                                                        </p>

                                                    )}

                                                </button>

                                            );

                                        }
                                    )}

                                </div>


                                {/* BADGE BALANCE */}

                                <div className="
                                    mt-7
                                    rounded-2xl
                                    bg-gray-100
                                    dark:bg-gray-800
                                    p-5
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
                                        gap-3
                                    ">

                                        <Badge
                                            size={26}
                                        />

                                        <div>

                                            <p className="
                                                text-sm
                                            
                                            ">

                                                Your Badge Balance

                                            </p>

                                            <p className="
                                                font-bold
                                                text-xl
                                            ">

                                                {
                                                    badges.total
                                                }

                                                {" "}🏅

                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        disabled={
                                            adsWatched >= 6
                                        }
                                        onClick={
                                            handleWatchAd
                                        }
                                        className={`
                                            px-5
                                            py-3
                                            rounded-xl
                                            font-semibold
                                            text-white
                                            ${
                                                adsWatched >= 6
                                                    ? "bg-gray-400"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                            }
                                        `}
                                    >

                                        Watch Ad +5 Badges

                                        {" "}

                                        ({adsWatched}/6)

                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {openModal && selectedOption && (

                <div className="
                    fixed
                    inset-0
                    z-50
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    p-4
                ">

                    <div className="
                        bg-[var(--bg-color)]
                        text-[var(--text-color)]
                        rounded-3xl
                        max-w-lg
                        w-full
                        p-6
                        sm:p-7
                        shadow-2xl
                    ">


                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <h2 className="
                                text-xl
                                sm:text-2xl
                                font-bold
                            ">

                                Confirm Visibility

                            </h2>


                            <button
                                type="button"
                                disabled={
                                    unlockLoading
                                }
                                onClick={
                                    closeModal
                                }
                                className="
                                    p-2
                                    rounded-full
                                    hover:bg-gray-200
                                    dark:hover:bg-gray-700
                                "
                            >

                                <X />

                            </button>

                        </div>


                        <div className="
                            mt-6
                            rounded-2xl
                            border
                            p-5
                        ">


                            <div className="
                                flex
                                items-center
                                gap-4
                            ">

                                <div className="
                                    w-14
                                    h-14
                                    rounded-xl
                                    bg-blue-100
                                    text-blue-600
                                    flex
                                    items-center
                                    justify-center
                                ">

                                    <Globe2 />

                                </div>


                                <div>

                                    <p className="
                                        text-sm
                                    
                                    ">

                                        Selected Visibility

                                    </p>

                                    <h3 className="
                                        font-bold
                                        text-lg
                                    ">

                                        {
                                            selectedAudienceLabel
                                        }

                                    </h3>

                                </div>

                            </div>


                            <div className="
                                mt-5
                                grid
                                grid-cols-2
                                gap-3
                            ">


                                <div className="
                                    rounded-xl
                                    bg-yellow-50
                                    p-4
                                    text-center
                                ">

                                    <p className="
                                        text-xs
                                        text-yellow-700
                                    ">

                                        Cost

                                    </p>

                                    <p className="
                                        font-bold
                                        text-xl
                                        text-yellow-700
                                    ">

                                        {
                                            selectedOption.badges
                                        }

                                        {" "}🏅

                                    </p>

                                </div>


                                <div className="
                                    rounded-xl
                                    bg-purple-50
                                    p-4
                                    text-center
                                ">

                                    <p className="
                                        text-xs
                                        text-purple-700
                                    ">

                                        Duration

                                    </p>

                                    <p className="
                                        font-bold
                                        text-xl
                                        text-purple-700
                                    ">

                                        {
                                            selectedOption.months
                                        }

                                        {" "}

                                        {
                                            selectedOption.months === 1
                                                ? "Month"
                                                : "Months"
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            bg-red-50
                            p-4
                            text-red-700
                        ">

                            <Lock
                                size={20}
                                className="shrink-0 mt-1"
                            />

                            <p className="
                                text-sm
                                leading-6
                            ">

                                <strong>
                                    Important:
                                </strong>

                                {" "}

                                {
                                    selectedOption.badges
                                }

                                {" "}badges will be deducted
                                from your account. This action
                                cannot be undone.

                            </p>

                        </div>


                        <div className="
                            mt-6
                            flex
                            gap-3
                        ">

                            <button
                                type="button"
                                disabled={
                                    unlockLoading
                                }
                                onClick={
                                    closeModal
                                }
                                className="
                                    w-full
                                    border
                                    rounded-xl
                                    py-3
                                    font-bold
                                "
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                disabled={
                                    unlockLoading ||
                                    badges.total <
                                    selectedOption.badges
                                }
                                onClick={
                                    unlockVisibility
                                }
                                className="
                                    w-full
                                    bg-blue-600
                                    hover:bg-blue-700
                                    disabled:bg-gray-400
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-bold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                {unlockLoading ? (

                                    <>

                                        <LoaderCircle
                                            size={20}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Unlocking...

                                    </>

                                ) : (

                                    "Unlock with Badges"

                                )}

                            </button>

                        </div>


                        {badges.total <
                            selectedOption.badges && (

                            <p className="
                                mt-4
                                text-center
                                text-sm
                                text-red-500
                                font-semibold
                            ">

                                You have{" "}
                                {
                                    badges.total
                                }{" "}
                                badges but need{" "}
                                {
                                    selectedOption.badges
                                }.

                            </p>

                        )}

                    </div>

                </div>

            )}

            {successModal && (

                <div className="
                    fixed
                    inset-0
                    z-[60]
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    p-4
                ">

                    <div className="
                        bg-[var(--bg-color)]
                        text-[var(--text-color)]
                        rounded-3xl
                        max-w-lg
                        w-full
                        p-7
                        shadow-2xl
                        text-center
                    ">


                        <div className="
                            flex
                            justify-center
                            mb-5
                        ">

                            <div className="
                                w-20
                                h-20
                                rounded-full
                                bg-green-100
                                flex
                                items-center
                                justify-center
                            ">

                                <CheckCircle
                                    size={50}
                                    className="
                                        text-green-600
                                    "
                                />

                            </div>

                        </div>


                        <h2 className="
                            text-2xl
                            sm:text-3xl
                            font-bold
                        ">

                            Visibility Unlocked!

                        </h2>


                        <p className="
                            mt-4
                            leading-7
                        
                        ">

                            Your advertisement visibility
                            has been successfully upgraded.

                        </p>


                        <div className="
                            mt-6
                            rounded-2xl
                            border
                            p-5
                            text-left
                        ">

                            <p className="
                                text-sm
                            
                            ">

                                Advertisement

                            </p>


                            <p className="
                                mt-1
                                font-bold
                            ">

                                {
                                    advertisement.title
                                }

                            </p>


                            <div className="
                                mt-4
                                space-y-3
                            ">

                                <div className="
                                    flex
                                    justify-between
                                    gap-3
                                ">

                                    <span>
                                        Visibility
                                    </span>

                                    <strong>

                                        {
                                            currentVisibility?.title ||
                                            `${advertisement.audience}%`
                                        }

                                    </strong>

                                </div>


                                <div className="
                                    flex
                                    justify-between
                                    gap-3
                                ">

                                    <span>
                                        Duration
                                    </span>

                                    <strong>

                                        {
                                            currentVisibility?.months ||
                                            "-"
                                        }

                                        {" "}

                                        {
                                            currentVisibility?.months === 1
                                                ? "Month"
                                                : "Months"
                                        }

                                    </strong>

                                </div>


                                <div className="
                                    flex
                                    justify-between
                                    gap-3
                                ">

                                    <span>
                                        Expires
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                advertisement.visibility_expires_at
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="
                            mt-7
                            flex
                            flex-col
                            sm:flex-row
                            gap-3
                        ">

                            <button
                                type="button"
                                onClick={() =>
                                    setSuccessModal(
                                        false
                                    )
                                }
                                className="
                                    w-full
                                    border
                                    rounded-xl
                                    py-3
                                    font-bold
                                "
                            >

                                Close

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/dashboard/my-advertisements"
                                    )
                                }
                                className="
                                    w-full
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-bold
                                "
                            >

                                My Advertisements

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>

    );

}