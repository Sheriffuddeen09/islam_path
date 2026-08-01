import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../Api/axios";
import EditJobFinderForm from "./EditJobFinderForm";

export default function EditJobFinderModal({

    show,
    onClose,
    refresh,

}) {

    const [loading, setLoading] =
        useState(false);

    const [fetching, setFetching] =
        useState(false);

    const [editProfile, setEditProfile] =
        useState(null);


    useEffect(() => {

        if (show) {

            fetchProfile();

        }

    }, [show]);


    const fetchProfile = async () => {

        try {

            setFetching(true);

            const res = await api.get(
                "/api/job-profile"
            );

            setEditProfile(
                res.data
            );

        } catch (error) {

            toast.error(
                "Unable to fetch profile."
            );

        } finally {

            setFetching(false);

        }

    };

    

    const handleUpdate = async(formData) => {
            try {
            setLoading(true);

            await api.put(
            `/api/job-profile/${editProfile.id}`,
            formData,
            {
            headers: {
            "Content-Type": "multipart/form-data",
            },
            }
            );            
            
            toast.success(
                "Profile updated successfully."
            );


            refresh();

            onClose();


        } catch (error) {

            if (
                error.response?.status ===
                422
            ) {

                toast.error(
                    "Please check your inputs."
                );

            } else {

                toast.error(
                    "Unable to update profile."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    if (!show) return null;


    return (

        <div
            className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
            "
        >

            <div
                className="
                bg-[var(--bg-color)] text-[var(--text-color)]
                rounded-3xl
                shadow-2xl
                w-full
                max-w-5xl
                max-h-[95vh]
                overflow-y-auto
                scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin scrollbar
                "
            >

                {/* Header */}

                <div
                    className="
                    flex
                    justify-between
                    items-center
                    border-b
                    px-6
                    py-5
                    "
                >

                    <div>

                        <h2
                            className="
                            sm:text-2xl text-xl
                            font-bold
                            "
                        >
                            Edit Job Finder
                            Profile
                        </h2>


                        <p
                            className="
                            "
                        >
                            Update your
                            professional
                            profile.
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                        p-2
                        rounded-full
                        hover:bg-gray-700
                        "
                    >

                        <X size={22} />

                    </button>

                </div>



                {/* Body */}

                <div className="p-6">

                    {fetching ? (

                        <div
                            className="
                            flex
                            justify-center
                            py-16
                            "
                        >

                            Loading
                            profile

                        </div>

                    ) : (

                        <EditJobFinderForm

                            profile={
                                editProfile
                            }

                            loading={
                                loading
                            }

                            onSubmit={
                                handleUpdate
                            }

                            buttonText={
                                loading
                                ? <p className='inline-flex gap-1 items-center'> 
                                    <Loader2 className="animate-spin text-white" /> 
                                    Updating</p>
                                : "Update Profile"
                            }

                        />

                    )}

                </div>

            </div>

        </div>

    );

}