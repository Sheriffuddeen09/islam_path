import React, { useEffect, useState } from "react";
import {
    Trash2,
    RefreshCw,
    CalendarDays,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    LoaderCircle,
    Video,
    Image as ImageIcon,
    X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";


export default function MyAdvertisements() {

    const navigate = useNavigate();

    const [advertisements, setAdvertisements] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [renewLoading, setRenewLoading] =
        useState(false);

    const [selectedAdvertisement, setSelectedAdvertisement] =
        useState(null);

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const [showRenewModal, setShowRenewModal] =
        useState(false);


    useEffect(() => {

        fetchAdvertisements();

    }, []);


    const fetchAdvertisements = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/api/my-advertisements"
            );

            setAdvertisements(
                response.data.advertisements || []
            );

        } catch (error) {

            console.error(
                "MY ADVERTISEMENTS ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load your advertisements."
            );

        } finally {

            setLoading(false);

        }

    };


    const isExpired = (advertisement) => {

        if (
            !advertisement.visibility_expires_at
        ) {

            return false;

        }

        return (
            new Date(
                advertisement.visibility_expires_at
            ) < new Date()
        );

    };


    const getVisibilityLabel = (
        audience
    ) => {

        switch (
            String(audience)
        ) {

            case "25":

                return "1/4 of users";

            case "50":

                return "1/2 of users";

            case "75":

                return "3/4 of users";

            case "100":

                return "All users";

            default:

                return "Not selected";

        }

    };


    const getVisibilityStatus = (
        advertisement
    ) => {


        if (
            !advertisement.visibility_unlocked ||
            !advertisement.audience
        ) {

            return {
                label: "Not selected",
                type: "none",
            };

        }


        if (
            isExpired(advertisement)
        ) {

            return {
                label: "Expired",
                type: "expired",
            };

        }


        return {
            label: "Active",
            type: "active",
        };

    };

    const formatDate = (date) => {

        if (!date) {

            return "Not available";

        }

        return new Date(date).toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

    };


    const getMediaUrl = (
        advertisement
    ) => {

        if (!advertisement.media) {

            return null;

        }

        return `http://localhost:8000/storage/${advertisement.media}`;

    };


    const openDeleteModal = (
        advertisement
    ) => {

        setSelectedAdvertisement(
            advertisement
        );

        setShowDeleteModal(true);

    };


    const deleteAdvertisement = async () => {

        if (
            !selectedAdvertisement
        ) {

            return;

        }


        try {

            setDeleteLoading(true);


            await api.delete(

                `/api/advertisement/${selectedAdvertisement.id}/visibility`

            );


            setAdvertisements(
                previous =>
                    previous.filter(
                        advertisement =>
                            advertisement.id !==
                            selectedAdvertisement.id
                    )
            );


            toast.success(
                "Advertisement deleted successfully."
            );


            setShowDeleteModal(false);

            setSelectedAdvertisement(
                null
            );


        } catch (error) {

            console.error(
                "DELETE ADVERTISEMENT ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to delete advertisement."
            );

        } finally {

            setDeleteLoading(false);

        }

    };


    const openRenewModal = (
        advertisement
    ) => {

        setSelectedAdvertisement(
            advertisement
        );

        setShowRenewModal(true);

    };


    const renewAdvertisement = async () => {

        if (
            !selectedAdvertisement
        ) {

            return;

        }


        try {

            setRenewLoading(true);


            const response = await api.post(

                `/api/advertisement/${selectedAdvertisement.id}/renew`

            );


            const updatedAdvertisement =
                response.data.advertisement;


            setAdvertisements(
                previous =>
                    previous.map(
                        advertisement =>
                            advertisement.id ===
                            updatedAdvertisement.id
                                ? updatedAdvertisement
                                : advertisement
                    )
            );


            toast.success(
                response.data.message ||
                "Advertisement renewed successfully."
            );


            setShowRenewModal(false);

            setSelectedAdvertisement(
                null
            );


        } catch (error) {

            console.error(
                "RENEW ADVERTISEMENT ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to renew advertisement."
            );

        } finally {

            setRenewLoading(false);

        }

    };



    if (loading) {

        return (

            <div className="
                min-h-[400px]
                flex
                items-center
                justify-center
            ">

                <LoaderCircle
                    size={40}
                    className="
                        animate-spin
                    "
                />

            </div>

        );

    }


    if (
        advertisements.length === 0
    ) {

        return (

            <div className="
                max-w-5xl
                mx-auto
                px-4
                pt-24
                pb-10
            ">

                <div className="
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    rounded-3xl
                    shadow
                    p-10
                    text-center
                ">

                    <h2 className="
                        text-2xl
                        font-bold
                        mb-3
                    ">

                        My Advertisements

                    </h2>


                    <p className="
                    
                        mb-6
                    ">

                        You have not created
                        any advertisements yet.

                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/advertisement"
                            )
                        }
                        className="
                            bg-blue-600
                            hover:bg-blue-700
                            text-white
                            px-6
                            py-3
                            rounded-xl
                            font-semibold
                        "
                    >

                        Create Advertisement

                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="
            lg:ml-64
            max-w-6xl
            mx-auto
            px-3
            sm:px-5
            pt-8
            pb-10
        ">


            {/* HEADER */}

            <div className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
                mb-8
            ">

                <div>

                    <h1 className="
                        text-3xl
                        font-bold
                    ">

                        My Advertisements

                    </h1>


                    <p className="
                        mt-2
                    
                    ">

                        Manage your advertisements,
                        visibility and expiry.

                    </p>

                </div>


                <button
                    type="button"
                    onClick={fetchAdvertisements}
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        border
                        px-5
                        py-3
                        rounded-xl
                        font-semibold
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                        transition
                    "
                >

                    <RefreshCw
                        size={18}
                    />

                    Refresh

                </button>

            </div>


            {/* ADVERTISEMENTS */}

            <div className="
                flex
                flex-col
                gap-5
            ">


                {advertisements.map(
                    advertisement => {

                        const status =
                            getVisibilityStatus(
                                advertisement
                            );

                        const expired =
                            status.type ===
                            "expired";

                        const mediaUrl =
                            getMediaUrl(
                                advertisement
                            );


                        return (

                            <div
                                key={
                                    advertisement.id
                                }
                                className="
                                    bg-[var(--bg-color)]
                                    text-[var(--text-color)]
                                    border
                                    border-gray-200
                                    rounded-3xl
                                    shadow-sm
                                    overflow-hidden
                                "
                            >


                                {/* BODY */}

                                <div className="
                                    flex
                                    flex-col
                                    md:flex-row
                                ">


                                    {/* MEDIA */}

                                    <div className="
                                        md:w-72
                                        w-full
                                        shrink-0
                                        bg-black
                                    ">

                                        {advertisement.media_type ===
                                        "image" && (
                                        <img
                                        src={`http://localhost:8000/storage/${advertisement.media}`}
                                        alt="" className="w-full h-72 object-cover" />
                                        )}
                                        {/* VIDEO */}
                                        {advertisement.media_type ===
                                        "video" && (
                                        <video
                                        controls
                                        className="w-full h-72 object-cover" >
                                        <source
                                        src={`http://localhost:8000/storage/${advertisement.media}`}
                                        />
                                        </video>
                                        )}
                                    </div>


                                    {/* CONTENT */}

                                    <div className="
                                        p-5
                                        sm:p-6
                                        flex-1
                                    ">


                                        {/* TITLE */}

                                        <div className="
                                            flex
                                            flex-col
                                            sm:flex-row
                                            sm:items-start
                                            sm:justify-between
                                            gap-3
                                        ">

                                            <div>

                                                <h2 className="
                                                    text-xl
                                                    sm:text-2xl
                                                    font-bold
                                                ">

                                                    {
                                                        advertisement.title
                                                    }

                                                </h2>

                                                     <h2 className="
                                                    text-xl
                                                    sm:text-2xl
                                                    font-bold
                                                ">

                                                    {
                                                        advertisement.id
                                                    }

                                                </h2>


                                                <div className="
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                    mt-3
                                                ">

                                                    <span className="
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold
                                                        bg-blue-100
                                                        text-blue-700
                                                    ">

                                                        {
                                                            advertisement.type
                                                        }

                                                    </span>


                                                    <span className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold

                                                        ${
                                                            advertisement.status ===
                                                            "approved"

                                                                ? "bg-green-100 text-green-700"

                                                                : advertisement.status ===
                                                                  "pending"

                                                                    ? "bg-yellow-100 text-yellow-700"

                                                                    : "bg-red-100 text-red-700"
                                                        }
                                                    `}>

                                                        {
                                                            advertisement.status
                                                        }

                                                    </span>

                                                </div>

                                            </div>


                                            {/* MEDIA TYPE */}

                                            <div className="
                                                flex
                                                items-center
                                                gap-2
                                                text-sm
                                            
                                            ">

                                                {advertisement.media_type ===
                                                "video" ? (

                                                    <Video
                                                        size={18}
                                                    />

                                                ) : (

                                                    <ImageIcon
                                                        size={18}
                                                    />

                                                )}

                                                {
                                                    advertisement.media_type
                                                }

                                            </div>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <p className="
                                            mt-4
                                            text-sm
                                            leading-7
                                            line-clamp-3
                                        
                                        ">

                                            {
                                                advertisement.description
                                            }

                                        </p>


                                        {/* VISIBILITY */}

                                        <div className="
                                            mt-5
                                            rounded-2xl
                                            border
                                            p-4
                                        ">


                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-3
                                                flex-wrap
                                            ">

                                                <div>

                                                    <p className="
                                                        text-xs
                                                    
                                                    ">

                                                        Visibility

                                                    </p>


                                                    <p className="
                                                        font-bold
                                                        mt-1
                                                    ">

                                                        {
                                                            getVisibilityLabel(
                                                                advertisement.audience
                                                            )
                                                        }

                                                    </p>

                                                </div>


                                                {/* STATUS Not selected */}

                                                <div className={`
                                                    flex
                                                    items-center
                                                    gap-2
                                                    px-3
                                                    py-2
                                                    rounded-full
                                                    text-sm
                                                    font-bold

                                                    ${
                                                        status.type ===
                                                        "active"

                                                            ? "bg-green-100 text-green-700"

                                                            : status.type ===
                                                              "expired"

                                                                ? "bg-red-100 text-red-700"

                                                                : "bg-gray-100 text-gray-600"
                                                    }
                                                `}>

                                                    {status.type ===
                                                    "active" && (

                                                        <CheckCircle
                                                            size={18}
                                                        />

                                                    )}


                                                    {status.type ===
                                                    "expired" && (

                                                        <Clock
                                                            size={18}
                                                        />

                                                    )}


                                                    {status.type ===
                                                    "none" && (

                                                        <XCircle
                                                            size={18}
                                                        />

                                                    )}


                                                    {
                                                        status.label
                                                    }

                                                </div>

                                            </div>


                                            {/* EXPIRY */}

                                            {advertisement.visibility_expires_at && (

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    mt-4
                                                    text-sm
                                                
                                                ">

                                                    <CalendarDays
                                                        size={17}
                                                    />

                                                    <span>

                                                        {expired
                                                            ? "Expired on "
                                                            : "Expires on "}

                                                        <b>

                                                            {
                                                                formatDate(
                                                                    advertisement.visibility_expires_at
                                                                )
                                                            }

                                                        </b>

                                                    </span>

                                                </div>

                                            )}


                                            {/* BADGES  ||  */}

                                            {advertisement.required_badges > 0 && (

                                                <p className="
                                                    mt-2
                                                    text-sm
                                                
                                                ">

                                                    {
                                                        advertisement.required_badges
                                                    }{" "}
                                                    badges used

                                                </p>

                                            )}

                                        </div>


                                        {/* ACTIONS */}

                                        

                                            <div className="
                                                flex
                                                flex-col
                                                sm:flex-row
                                                gap-3
                                                mt-5
                                            ">


                                                {/* RENEW */}
                                            {expired  && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRenewModal(
                                                            advertisement
                                                        )
                                                    }
                                                    className="
                                                        flex-1
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        bg-blue-600
                                                        hover:bg-blue-700
                                                        text-white
                                                        rounded-xl
                                                        py-3
                                                        font-semibold
                                                        transition
                                                    "
                                                >

                                                    <RefreshCw
                                                        size={18}
                                                    />

                                                    Renew

                                                </button>
                                            )}

                                                {/* DELETE */}
                                            {expired || advertisement.status === "declined" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            advertisement
                                                        )
                                                    }
                                                    className="
                                                        flex-1
                                                        flex
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        bg-red-600
                                                        hover:bg-red-700
                                                        text-white
                                                        rounded-xl
                                                        py-3
                                                        font-semibold
                                                        transition
                                                    "
                                                >

                                                    <Trash2
                                                        size={18}
                                                    />

                                                    Delete

                                                </button>

                                        )}
                                            </div>


                                    </div>

                                </div>

                            </div>

                        );

                    }
                )}

            </div>

            {showDeleteModal && (

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
                        max-w-md
                        w-full
                        p-6
                        shadow-2xl
                    ">


                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <h2 className="
                                text-xl
                                font-bold
                            ">

                                Delete Advertisement

                            </h2>


                            <button
                                type="button"
                                disabled={
                                    deleteLoading
                                }
                                onClick={() =>
                                    setShowDeleteModal(
                                        false
                                    )
                                }
                            >

                                <X
                                    size={24}
                                />

                            </button>

                        </div>


                        <p className="
                            mt-5
                            leading-7
                        
                        ">

                            Are you sure you want to
                            permanently delete{" "}

                            <b>

                                {
                                    selectedAdvertisement?.title
                                }

                            </b>

                            ?

                        </p>


                        <div className="
                            flex
                            gap-3
                            mt-6
                        ">

                            <button
                                type="button"
                                disabled={
                                    deleteLoading
                                }
                                onClick={() =>
                                    setShowDeleteModal(
                                        false
                                    )
                                }
                                className="
                                    flex-1
                                    border
                                    rounded-xl
                                    py-3
                                    font-semibold
                                "
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                disabled={
                                    deleteLoading
                                }
                                onClick={
                                    deleteAdvertisement
                                }
                                className="
                                    flex-1
                                    bg-red-600
                                    hover:bg-red-700
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                {deleteLoading ? (

                                    <>

                                        <LoaderCircle
                                            size={19}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Deleting

                                    </>

                                ) : (

                                    "Delete"

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {showRenewModal && (

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
                        max-w-md
                        w-full
                        p-6
                        shadow-2xl
                    ">


                        <div className="
                            flex
                            items-center
                            justify-between
                        ">

                            <h2 className="
                                text-xl
                                font-bold
                            ">

                                Renew Advertisement

                            </h2>


                            <button
                                type="button"
                                disabled={
                                    renewLoading
                                }
                                onClick={() =>
                                    setShowRenewModal(
                                        false
                                    )
                                }
                            >

                                <X
                                    size={24}
                                />

                            </button>

                        </div>


                        <div className="
                            mt-5
                            rounded-2xl
                            bg-blue-50
                            text-blue-900
                            p-4
                        ">

                            <p className="
                                font-semibold
                            ">

                                {
                                    selectedAdvertisement?.title
                                }

                            </p>


                            <p className="
                                text-sm
                                mt-2
                            ">

                                Your advertisement will
                                be renewed using the same
                                visibility level.

                            </p>

                        </div>


                        <div className="
                            mt-5
                            space-y-2
                            text-sm
                        ">

                            <p>

                                Visibility:

                                <b className="ml-2">

                                    {
                                        getVisibilityLabel(
                                            selectedAdvertisement?.audience
                                        )
                                    }

                                </b>

                            </p>


                            <p>

                                Badges required:

                                <b className="ml-2">

                                    {
                                        selectedAdvertisement?.required_badges ||
                                        0
                                    }

                                </b>

                            </p>

                        </div>


                        <div className="
                            flex
                            gap-3
                            mt-6
                        ">

                            <button
                                type="button"
                                disabled={
                                    renewLoading
                                }
                                onClick={() =>
                                    setShowRenewModal(
                                        false
                                    )
                                }
                                className="
                                    flex-1
                                    border
                                    rounded-xl
                                    py-3
                                    font-semibold
                                "
                            >

                                Cancel

                            </button>


                            <button
                                type="button"
                                disabled={
                                    renewLoading
                                }
                                onClick={
                                    renewAdvertisement
                                }
                                className="
                                    flex-1
                                    bg-blue-600
                                    hover:bg-blue-700
                                    text-white
                                    rounded-xl
                                    py-3
                                    font-semibold
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                {renewLoading ? (

                                    <>

                                        <LoaderCircle
                                            size={19}
                                            className="
                                                animate-spin
                                            "
                                        />

                                        Renewing

                                    </>

                                ) : (

                                    <>

                                        <RefreshCw
                                            size={18}
                                        />

                                        Renew

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}