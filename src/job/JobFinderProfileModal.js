import {
    User,
    Award,
    GraduationCap,
    Briefcase,
    X,
    Pencil,
    Book,
} from "lucide-react";


export default function
JobFinderProfileModal({

    show,
    profile,
    onClose,
    setShowEdit

}) {

    const cv = profile?.cv
    ? `http://localhost:8000/storage/${profile.cv}`
    : null;

    if (!show) return null;


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

                    {/* Avatar */}

                   <div className="flex gap-3 flex-wrap">
                        <div
                            className="
                            w-24
                            h-24
                            rounded-full
                            bg-green-600
                            text-white
                            flex
                            items-center
                            justify-center
                            text-4xl
                            font-bold
                            "
                        >

                            {profile?.full_name
                                ?.charAt(0)
                                ?.toUpperCase()}

                    </div>


                    <div className="mt-6">

                        <h1
                            className="
                            sm:text-3xl text-xl
                             font-bold
                            "
                        >
                            {profile?.full_name}
                        </h1>


                        <p className="text-sm mb-5">

                            Job Finder Profile

                        </p>
                    <button
                                                onClick={() =>{
                                                    onClose();
                                                    setShowEdit(
                                                        true
                                                    );}
                                                }
                                                className="
                                                bg-blue-600
                                                text-white
                                                px-5
                                                py-3
                                                rounded-xl
                                                flex
                                                items-center
                                                gap-2
                                                "
                                            >
                    
                                                <Pencil size={18} />
                    
                                                Edit Profile
                    
                                            </button>
                       

                    </div>
                    </div>

{/* */}

                    <div
                        className="
                        grid
                        md:grid-cols-2
                        gap-6
                        mt-10
                        "
                    >

                        {/* Qualification */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <Book />

                            <h3
                                className="
                                font-semibold
                                mt-3 text-sm mb-6
                                "
                            >
                                CV Preview
                            </h3>

                            {
                            cv && (

                                <a
                                    href={cv}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                    bg-blue-600
                                    mt-8
                                    cursor-pointer
                                    text-white
                                    font-bold
                                    text-sm
                                    px-3
                                    py-3
                                    rounded-lg
                                    hover:bg-blue-700 
                                    "
                                >
                                    View CV
                                </a>

                            )
                        }

                        </div>

                    
                        {/* Qualification */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <GraduationCap />

                            <h3
                                className="
                                font-semibold
                                mt-3 text-sm mb-2
                                "
                            >
                                Qualifications
                            </h3>

                            <p>
                                {
                                    profile?.qualifications
                                }
                            </p>

                        </div>


                        {/* Portfolio */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <Briefcase />

                            <h3
                                className="
                                font-semibold
                                mt-3 text-sm mb-2
                                "
                            >
                                Portfolio
                            </h3>


                            <a
                                href={
                                    profile?.portfolio
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="
                                text-blue-600
                                break-all text-sm
                                "
                            >

                                {
                                    profile?.portfolio
                                }

                            </a>

                        </div>



                        {/* Certification */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5 text-sm mb-2
                            "
                        >

                            <Award />

                            <h3
                                className="
                                font-semibold
                                mt-3 text-sm mb-2
                                "
                            >
                                Certifications
                            </h3>


                            <p>
                                {
                                    profile?.certification
                                }
                            </p>

                        </div>



                        {/* Skills */}

                        <div
                            className="
                            border
                            rounded-xl
                            p-5
                            "
                        >

                            <h3
                                className="
                                font-semibold text-sm mb-2
                                "
                            >
                                Skills
                            </h3>


                            <div
                                className="
                                flex
                                flex-wrap
                                gap-2
                                mt-4
                                "
                            >

                                {profile?.skills?.map(
                                    (skill) => (

                                        <span
                                            key={
                                                skill
                                            }
                                            className="
                                            bg-blue-100
                                            text-blue-700
                                            rounded-full
                                            px-4
                                            py-1 text-sm
                                            "
                                        >

                                            {skill}

                                        </span>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}