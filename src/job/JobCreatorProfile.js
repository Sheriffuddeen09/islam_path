import { useEffect, useState } from "react";
import {
    Building2,
    MapPin,
    Users,
    Pencil,
    Eye,
} from "lucide-react";

import api from "../Api/axios";
import EditJobCreatorModal from "./EditJobCreatorModal";
import JobCreatorProfileModal from "./JobCreatorProfileModal";

export default function JobCreatorProfile() {

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);
    const [showProfile, setShowProfile] =
        useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);


    const fetchProfile = async () => {

        try {

            const res = await api.get(
                "/api/job-profile"
            );

            setProfile(res.data);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const logo = profile?.company_logo
        ? `http://localhost:8000/storage/${profile.company_logo}` : null;



    if (loading) {

        return (
            <div className="grid md:grid-cols-2 gap-2 pt-24 sm:px-4 px-2">

    {[...Array(6)].map((_, index) => (

        <div
            key={index}
            className="
            bg-white
            border
            rounded-2xl
            p-6
            shadow-md
            animate-pulse
            "
        >

            <div className="h-6 w-10 bg-gray-200 rounded mb-4" />

            <div className="h-5 w-40 bg-gray-200 rounded mb-3" />

            <div className="h-4 w-full bg-gray-200 rounded mb-2" />

            <div className="h-4 w-3/4 bg-gray-200 rounded" />

        </div>

    ))}

</div>
        );

    }


    return (

        <div className="max-w-7xl mx-auto p-6">

            <div
                className="
                bg-white text-black
                rounded-3xl
                shadow-xl
                p-6
                border
                mt-16
                "
            >

                <div
                    className="
                    flex
                    flex-col
                    lg:flex-row
                    justify-between
                    items-center
                    gap-5
                    "
                >

                    {/* Left */}

                    <div
                        className="
                        flex
                        items-center
                        gap-5
                        "
                    >

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
                            bg-white
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
                            "
                        >

                            {profile?.company_name?.charAt(0)}

                        </div>

                    )}


                        <div>

                            <h1
                                className="
                                sm:text-2xl text-sm
                                font-bold
                                "
                            >
                                Assalamu
                                Alaykum,
                            </h1>

                            <h2
                                className="
                                sm:text-xl text-sm
                                font-semibold
                                "
                            >
                                {
                                    profile?.company_name
                                }
                            </h2>

                            <p
                                className="
                                text-gray-500 text-sm
                                "
                            >
                                {
                                    profile?.company_type
                                }
                            </p>

                            <span
                                className="
                                inline-block
                                mt-2
                                bg-green-100
                                text-green-700
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                "
                            >
                                 Job {profile?.type}
                            </span>

                        </div>

                    </div>


                    {/* Right */}

                    <div
                        className="
                        flex
                        gap-3
                        "
                    >

                        <button
                            onClick={() =>
                                setShowProfile(
                                    true
                                )
                            }
                            className="
                            bg-green-600
                            text-white
                            px-5
                            py-3
                            rounded-xl
                            flex
                            items-center
                            gap-2
                            "
                        >

                            <Eye size={18} />

                            View Profile

                        </button>


                        <button
                            onClick={() =>
                                setShowEdit(
                                    true
                                )
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

                            <Pencil
                                size={18}
                            />

                            Edit Profile

                        </button>

                    </div>

                </div>

            </div>


            <JobCreatorProfileModal

                show={showProfile}
                profile={profile}
                onClose={() =>
                    setShowProfile(false)
                }

            />


            <EditJobCreatorModal

                show={showEdit}
                profile={profile}
                onClose={() =>
                    setShowEdit(false)
                }
                refresh={fetchProfile}

            />

        </div>

    );

}