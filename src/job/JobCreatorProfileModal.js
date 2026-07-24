import {
    Building2,
    MapPin,
    Users,
    X,
    MapPinned,
} from "lucide-react";


export default function JobCreatorProfileModal({

    show,
    profile,
    onClose,

}) {

    if (!show) return null;


    const logo = profile?.company_logo
        ? `http://localhost:8000/storage/${profile.company_logo}`
        : null;



    return (

        <div
            className="
            fixed
            inset-0
            z-40
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            "
        >

            <div
                className="
                bg-[var(--bg-color)] text-[var(--text-color)]
                rounded-3xl
                max-w-4xl
                w-full
                max-h-[90vh]
                overflow-y-auto
                shadow-xl scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                py-8
                "
            >

                {/* Header */}

                <div
                    className="
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    relative
                    "
                >

                    <button
                        onClick={onClose}
                        className="
                        absolute
                        top-5
                        right-5
                        rounded-full
                        p-2
                        "
                    >

                        <X size={22} />

                    </button>

                </div>


                <div
                    className="
                    px-8
                    pb-8
                    mt-6
                    
                    "
                >

                    {/* Logo */}
                <div className="flex gap-3 flex-wrap">
                    {logo ? (

                        <img
                            src={logo}
                            alt="Company Logo"
                            className="
                            w-32
                            h-32
                            rounded-full
                            border-4
                            border-white
                            object-cover
                            bg-white z-50
                            "
                        />

                    ) : (

                        <div
                            className="
                            w-32
                            h-32
                            rounded-full
                            border-4
                            border-white
                            bg-blue-600
                            text-white
                            flex
                            items-center
                            justify-center
                            text-5xl
                            font-bold
                            z-50
                            "
                        >

                            {profile?.company_name?.charAt(0)}

                        </div>

                    )}


                    {/* Company Name */}

                    <div
                        className="
                        flex
                        justify-between
                        items-center
                        mt-6
                        "
                    >

                        <div>

                            <h1
                                className="
                                sm:text-3xl text-xl
                                font-bold
                                "
                            >

                                {profile?.company_name}

                            </h1>


                            <p
                                className="
                                text-sm
                                capitalize
                                "
                            >

                                {profile?.company_type}

                            </p>

                        </div>
                    </div>
                    </div>



                    {/* Information */}

                    <div
                        className="
                        grid
                        md:grid-cols-2
                        gap-6
                        mt-10
                        "
                    >

                        {/* Company Type */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <Building2 />

                            <h3
                                className="
                                font-semibold
                                mt-3
                                "
                            >
                                Company Type
                            </h3>

                            <p className="capitalize">

                                {profile?.company_type || "N/A"}

                            </p>

                        </div>


                        {/* Workers */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <Users />

                            <h3
                                className="
                                font-semibold
                                mt-3
                                "
                            >
                                Workers
                            </h3>

                            <p>

                                {profile?.organisation_size || "N/A"}

                            </p>

                        </div>


                        {/* Company Location */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <MapPin />

                            <h3
                                className="
                                font-semibold
                                mt-3
                                "
                            >
                                Company Location
                            </h3>

                            <p>

                                {profile?.company_location || "N/A"}

                            </p>

                        </div>



                        {/* Company Address */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <MapPinned />

                            <h3
                                className="
                                font-semibold
                                mt-3
                                "
                            >
                                Company Address
                            </h3>

                            <p>

                                {profile?.company_address || "N/A"}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}