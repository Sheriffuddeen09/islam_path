import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../Api/axios";
import JobCreatorForm from "./JobCreatorForm";
import EditJobCreatorForm from "./EditJobCreatorForm";

export default function EditJobCreatorModal({

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


    const handleUpdate = async (
        formData
    ) => {

        try {

            setLoading(true);

           await api.put(

                `/api/job-profile/${editProfile.id}`,

                formData

            );
            refresh();

            onClose();


        } catch (error) {

            toast.error(
                "Unable to update profile."
            );

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
            flex
            items-center
            justify-center
            z-50
            p-4
            "
        >

            <div
                className="
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                rounded-3xl
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
                    items-center
                    justify-between
                    border-b
                    px-6
                    py-5
                    "
                >

                    <div>

                        <h2
                            className="
                            text-2xl
                            font-bold
                            "
                        >
                            Edit Company Profile
                        </h2>


                        <p
                            className="
                            text-sm
                            "
                        >
                            Update your
                            company
                            information.
                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                        hover:bg-gray-200
                        rounded-full
                        p-2
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

                        <EditJobCreatorForm
                            profile={editProfile}
                            loading={loading}
                            onSubmit={handleUpdate}
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