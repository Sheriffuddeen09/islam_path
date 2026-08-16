import React, {
    useEffect,
    useState
} from "react";

import {
    Badge,
    CalendarDays,
    CheckCircle,
    Clock,
    Globe2,
    LoaderCircle,
    MapPin,
    RefreshCcw,
    Trash2,
    X
} from "lucide-react";

import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

import api from "../../Api/axios";


export default function ProductVisibility() {

    const navigate = useNavigate();

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [upgradingId, setUpgradingId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [selectedPlan, setSelectedPlan] =
        useState(null);

    const [showModal, setShowModal] =
        useState(false);

    const visibilityOptions = [

        {
            value: "25",
            title: "1/4 Locations",
            badges: 80,
            months: 1,
            description:
                "Visible to approximately one quarter of available locations.",
            icon: MapPin
        },

        {
            value: "50",
            title: "1/2 Locations",
            badges: 180,
            months: 2,
            description:
                "Visible to approximately half of available locations.",
            icon: MapPin
        },

        {
            value: "75",
            title: "3/4 Locations",
            badges: 270,
            months: 3,
            description:
                "Visible to approximately three quarters of available locations.",
            icon: Globe2
        },

        {
            value: "100",
            title: "All Locations",
            badges: 300,
            months: 4,
            description:
                "Visible across all available locations.",
            icon: Globe2
        }

    ];

    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response =
                await api.get(
                    "/api/my-products/visibility"
                );

            setProducts(
                response.data.products || []
            );

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Unable to load products."
            );

        } finally {

            setLoading(false);

        }

    };


    const getProductImage =
        (product) => {

            if (
                product.images &&
                product.images.length
            ) {

                return `http://localhost:8000/storage/${product.images[0].image_path}`;

            }

            return "/placeholder.png";
        };

    const formatDate =
        (date) => {

            if (!date) {
                return "Not available";
            }

            return new Date(date)
                .toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );
        };


    const openRenewModal =
        (product) => {

            setSelectedProduct(
                product
            );

            setSelectedPlan(null);

            setShowModal(true);

        };



    const renewVisibility =
        async () => {

            if (
                !selectedProduct ||
                !selectedPlan
            ) {

                toast.error(
                    "Select a visibility plan."
                );

                return;

            }


            try {

                setUpgradingId(
                    selectedProduct.id
                );


                const response =
                    await api.post(

                        `/api/product/${selectedProduct.id}/visibility`,

                        {
                            visibility:
                                selectedPlan.value
                        }

                    );


                toast.success(
                    response.data.message
                );


                setShowModal(false);

                setSelectedProduct(null);

                setSelectedPlan(null);

                await fetchProducts();


            } catch (error) {

                toast.error(

                    error.response?.data?.message ||

                    "Unable to renew visibility."

                );

            } finally {

                setUpgradingId(null);

            }

        };


    const deleteVisibility =
        async (product) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to remove the expired visibility?"
                );

            if (!confirmed) {
                return;
            }


            try {

                setDeletingId(
                    product.id
                );


                const response =
                    await api.delete(

                        `/api/product/${product.id}/visibility`

                    );


                toast.success(
                    response.data.message
                );


                await fetchProducts();


            } catch (error) {

                toast.error(

                    error.response?.data?.message ||

                    "Unable to delete visibility."

                );

            } finally {

                setDeletingId(null);

            }

        };


    if (loading) {

        return (

            <div
                className="
                    max-w-6xl
                    mx-auto
                    px-4
                    pt-24
                    pb-10
                "
            >

                <div
                    className="
                        animate-pulse
                        space-y-4
                    "
                >

                    {[1, 2, 3].map(
                        (item) => (

                            <div
                                key={item}
                                className="
                                    h-48
                                    rounded-3xl
                                    bg-gray-200
                                "
                            />

                        )
                    )}

                </div>

            </div>

        );

    }


    return (

        <div
            className="
                max-w-6xl
                mx-auto
                px-4
                pt-24
                pb-12
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-4
                    mb-8
                "
            >

                <div>

                    <h1
                        className="
                            text-3xl
                            font-bold
                        "
                    >
                        Product Visibility
                    </h1>

                    <p
                        className="
                            mt-2
                           
                        "
                    >
                        Manage how far your products
                        can reach beyond your location.
                    </p>

                </div>


                <button
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                    className="
                        px-5
                        py-3
                        rounded-xl
                        border
                        font-semibold
                    "
                >
                    Back to Dashboard
                </button>

            </div>


            {/* NO PRODUCTS */}

            {products.length === 0 ? (

                <div
                    className="
                        text-center
                        py-20
                        rounded-3xl
                        border
                    "
                >

                    <Globe2
                        size={50}
                        className="
                            mx-auto
                           
                        "
                    />

                    <h2
                        className="
                            text-2xl
                            font-bold
                            mt-4
                        "
                    >
                        No Products
                    </h2>

                    <p
                        className="
                            mt-2
                           
                        "
                    >
                        You don't have any products
                        to manage.
                    </p>

                </div>

            ) : (

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                    "
                >

                    {products.map(
                        (product) => {

                           const isVisibilitySelected =
                                product.visibility_unlocked &&
                                product.visibility_expires_at;

                            const isExpired =
                                isVisibilitySelected &&
                                new Date(product.visibility_expires_at) < new Date();
                            const isActive =
                                product.visibility_active;

                            const isUpgrading =
                                upgradingId ===
                                product.id;

                            const isDeleting =
                                deletingId ===
                                product.id;


                            return (

                                <div
                                    key={
                                        product.id
                                    }
                                    className="
                                        flex
                                        flex-col
                                        sm:flex-row
                                        bg-[var(--bg-color)]
                                        border
                                        border-gray-200
                                        rounded-3xl
                                        overflow-hidden
                                        shadow-sm
                                    "
                                >

                                    {/* IMAGE */}

                                    <div
                                        className="
                                            sm:w-52
                                            w-full
                                            flex-shrink-0
                                        "
                                    >

                                        <img
                                            src={
                                                getProductImage(
                                                    product
                                                )
                                            }
                                            alt={
                                                product.title
                                            }
                                            className="
                                                w-full
                                                h-56
                                                sm:h-full
                                                min-h-[220px]
                                                object-cover
                                            "
                                        />

                                    </div>


                                    {/* BODY */}

                                    <div
                                        className="
                                            flex-1
                                            p-5
                                            flex
                                            flex-col
                                            lg:flex-row
                                            lg:items-center
                                            gap-5
                                        "
                                    >

                                        {/* PRODUCT */}

                                        <div
                                            className="
                                                flex-1
                                            "
                                        >

                                            <h2
                                                className="
                                                    text-xl
                                                    font-bold
                                                "
                                            >
                                                {
                                                    product.title
                                                }
                                            </h2>


                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    mt-3
                                                    text-sm
                                                   
                                                "
                                            >

                                                <MapPin
                                                    size={16}
                                                />

                                                {
                                                    product.location ||
                                                    "Location not set"
                                                }

                                            </div>


                                            {/* VISIBILITY */}

                                            <div
                                                className="
                                                    mt-4 p-2 w-44 text=center border border-blue-600 rounded-lg
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-xs
                                                       
                                                    "
                                                >
                                                    Current Visibility
                                                </p>


                                                <p
                                                    className="
                                                        font-semibold
                                                        mt-1
                                                    "
                                                >

                                                    {
                                                        product.visibility_label ||
                                                        "Only your location"
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* EXPIRY */}

                                        <div
                                            className={`
                                                rounded-2xl
                                                px-4 py-3
                                                ${
                                                    isExpired
                                                        ? "bg-red-50 text-red-700"
                                                        : "bg-green-50 text-green-700"
                                                }
                                            `}
                                        >

                                            <div className="">

                                            <div className="flex items-center gap-2">

                                                {isExpired ? (
                                                    <Clock
                                                        size={18}
                                                        className="text-red-500"
                                                    />
                                                ) : isVisibilitySelected ? (
                                                    <CheckCircle
                                                        size={18}
                                                        className="text-green-500"
                                                    />
                                                ) : (
                                                    <Clock
                                                        size={18}
                                                        className="text-gray-400"
                                                    />
                                                )}

                                                <span className="font-bold">

                                                    {isExpired
                                                        ? "Visibility Expired"
                                                        : isVisibilitySelected
                                                            ? "Visibility Active"
                                                            : "Visibility Not Selected"
                                                    }

                                                </span>

                                            </div>

                                            {isVisibilitySelected && (
                                                <p className="text-sm mt-1 ml-6">

                                                    {isExpired
                                                        ? `Expired on ${new Date(
                                                            product.visibility_expires_at
                                                        ).toLocaleDateString()}`
                                                        : `Expires on ${new Date(
                                                            product.visibility_expires_at
                                                        ).toLocaleDateString()}`
                                                    }

                                                </p>
                                            )}

                                        </div>
                                        </div>


                                        {/* ACTIONS */}

                                        <div
                                            className="
                                                lg:w-52
                                                flex
                                                flex-col
                                                gap-3
                                            "
                                        >

                                            {/* EXPIRED */}

                                            {isExpired ? (

                                                <>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isUpgrading
                                                        }
                                                        onClick={() =>
                                                            openRenewModal(
                                                                product
                                                            )
                                                        }
                                                        className="
                                                            w-full
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            bg-blue-600
                                                            hover:bg-blue-700
                                                            disabled:opacity-50
                                                            text-white
                                                            rounded-xl
                                                            py-3
                                                            font-semibold
                                                        "
                                                    >

                                                        {isUpgrading ? (

                                                            <LoaderCircle
                                                                size={19}
                                                                className="
                                                                    animate-spin
                                                                "
                                                            />

                                                        ) : (

                                                            <RefreshCcw
                                                                size={19}
                                                            />

                                                        )}

                                                        Renew

                                                    </button>


                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isDeleting
                                                        }
                                                        onClick={() =>
                                                            deleteVisibility(
                                                                product
                                                            )
                                                        }
                                                        className="
                                                            w-full
                                                            flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            border
                                                            border-red-500
                                                            text-red-600
                                                            hover:bg-red-50
                                                            disabled:opacity-50
                                                            rounded-xl
                                                            py-3
                                                            font-semibold
                                                        "
                                                    >

                                                        {isDeleting ? (

                                                            <LoaderCircle
                                                                size={19}
                                                                className="
                                                                    animate-spin
                                                                "
                                                            />

                                                        ) : (

                                                            <Trash2
                                                                size={19}
                                                            />

                                                        )}

                                                        Delete

                                                    </button>

                                                </>

                                            ) : isActive ? (

                                                <div
                                                    className="
                                                        text-center
                                                        text-sm
                                                       
                                                        p-3
                                                    "
                                                >
                                                    Visibility is
                                                    currently active.
                                                </div>

                                            ) : (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openRenewModal(
                                                            product
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                        bg-blue-600
                                                        hover:bg-blue-700
                                                        text-white
                                                        rounded-xl
                                                        py-3
                                                        font-semibold
                                                    "
                                                >
                                                    Upgrade Visibility
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            )}


            {/* RENEW MODAL */}

            {showModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/60
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-[var(--bg-color)]
                            text-[var(--text-color)]
                            rounded-3xl
                            max-w-2xl
                            w-full
                            max-h-[90vh]
                            overflow-y-auto
                            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                            p-6
                        "
                    >

                        {/* HEADER */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                    "
                                >
                                    Update Visibility
                                </h2>

                                <p
                                    className="
                                        text-sm
                                       
                                        mt-1
                                    "
                                >
                                    {
                                        selectedProduct?.title
                                    }
                                </p>

                            </div>


                            <button
                                onClick={() => {

                                    setShowModal(
                                        false
                                    );

                                    setSelectedProduct(
                                        null
                                    );

                                    setSelectedPlan(
                                        null
                                    );

                                }}
                            >

                                <X />

                            </button>

                        </div>


                        {/* OPTIONS */}

                        <div
                            className="
                                grid
                                sm:grid-cols-2
                                gap-4
                                mt-6
                            "
                        >

                            {visibilityOptions.map(
                                (option) => {

                                    const Icon =
                                        option.icon;

                                    const selected =
                                        selectedPlan?.value ===
                                        option.value;


                                    return (

                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setSelectedPlan(
                                                    option
                                                )
                                            }
                                            className={`
                                                text-left
                                                p-5
                                                rounded-2xl
                                                border-2
                                                transition
                                                ${
                                                    selected
                                                        ? "border-blue-600 "
                                                        : "border-gray-200 hover:border-blue-400"
                                                }
                                            `}
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                "
                                            >

                                                <Icon
                                                    size={25}
                                                />

                                                <span
                                                    className="
                                                        flex
                                                        items-center
                                                        gap-1
                                                        font-bold
                                                    "
                                                >

                                                    <Badge
                                                        size={16}
                                                    />

                                                    {
                                                        option.badges
                                                    }

                                                </span>

                                            </div>


                                            <h3
                                                className="
                                                    font-bold
                                                    mt-4
                                                "
                                            >
                                                {
                                                    option.title
                                                }
                                            </h3>


                                            <p
                                                className="
                                                    text-sm
                                                   
                                                    mt-2
                                                "
                                            >
                                                {
                                                    option.description
                                                }
                                            </p>


                                            <p
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    mt-3
                                                "
                                            >
                                                {
                                                    option.months
                                                }{" "}
                                                {
                                                    option.months === 1
                                                        ? "month"
                                                        : "months"
                                                }
                                            </p>

                                        </button>

                                    );

                                }
                            )}

                        </div>


                        {/* CONFIRM */}

                        <button
                            type="button"
                            disabled={
                                !selectedPlan ||
                                upgradingId !== null
                            }
                            onClick={
                                renewVisibility
                            }
                            className="
                                mt-6
                                w-full
                                bg-blue-600
                                hover:bg-blue-700
                                disabled:opacity-50
                                text-white
                                rounded-xl
                                py-4
                                font-bold
                            "
                        >

                            {upgradingId ? (

                                <span
                                    className="
                                        flex
                                        justify-center
                                        items-center
                                        gap-2
                                    "
                                >

                                    <LoaderCircle
                                        className="
                                            animate-spin
                                        "
                                    />

                                    Updating

                                </span>

                            ) : (

                                selectedPlan
                                    ? `Update for ${selectedPlan.badges} Badges`
                                    : "Select a Visibility Plan"

                            )}

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}