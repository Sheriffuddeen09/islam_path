import { useEffect, useState } from "react";
import {
    User,
    Pencil,
    Eye,
} from "lucide-react";

import api from "../Api/axios";

import EditJobFinderModal from "./EditJobFinderModal";
import JobFinderProfileModal from "./JobFinderProfileModal";


export default function JobFinderProfile() {

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [showEdit, setShowEdit] =
        useState(false);

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
                border
                mt-16
                p-6
                "
            >

                <div
                    className="
                    flex
                    flex-col
                    lg:flex-row
                    items-center
                    justify-between
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


                        <div>

                            <h1
                                className="
                                text-2xl
                                font-bold
                                "
                            >
                                Assalamu Alaykum,
                            </h1>


                            <h2
                                className="
                                text-xl
                                font-semibold
                                "
                            >
                                {profile?.full_name}
                            </h2>


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

                            <Pencil size={18} />

                            Edit Profile

                        </button>

                    </div>

                </div>

            </div>


            <JobFinderProfileModal

                show={showProfile}
                profile={profile}
                onClose={() =>
                    setShowProfile(false)
                }

            />


            <EditJobFinderModal

                show={showEdit}
                profile={profile}
                refresh={fetchProfile}
                onClose={() =>
                    setShowEdit(false)
                }

            />

        </div>

    );

}