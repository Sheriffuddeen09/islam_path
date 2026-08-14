import React, { useEffect, useState } from "react";
import {
    Badge,
    CheckCircle,
    LoaderCircle,
    Eye,
    MapPin,
    X,
    Globe2,
    ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../Api/axios";

export default function ProductVisibility() {

    const navigate = useNavigate();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [upgradingId, setUpgradingId] =
        useState(null);

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [selectedVisibility, setSelectedVisibility] =
        useState(null);

    const [openModal, setOpenModal] =
        useState(false);

    const [successModal, setSuccessModal] =
        useState(false);

    const visibilityOptions = [

        {
            value: "25",
            title: "1/4 of Locations",
            description:
                "Your product will be visible beyond your location to approximately one quarter of locations.",
            badges: 80,
            icon: MapPin,
        },

        {
            value: "50",
            title: "1/2 of Locations",
            description:
                "Your product will be visible beyond your location to approximately half of locations.",
            badges: 180,
            icon: MapPin,
        },

        {
            value: "75",
            title: "3/4 of Locations",
            description:
                "Your product will be visible beyond your location to approximately three quarters of locations.",
            badges: 270,
            icon: Globe2,
        },

        {
            value: "100",
            title: "All Locations",
            description:
                "Your product will be visible to users across all available locations.",
            badges: 300,
            icon: Globe2,
        },

    ];


    useEffect(() => {

        fetchProducts();

    }, []);


    const fetchProducts = async () => {

        try {

            setLoading(true);

            const response = await api.get(
                "/api/my-products"
            );

            setProducts(
                response.data.products ||
                response.data.data ||
                []
            );

        } catch (error) {

            console.error(
                "PRODUCT VISIBILITY ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to load your products."
            );

        } finally {

            setLoading(false);

        }

    };

    const selectVisibility = (
        product,
        visibility
    ) => {

        setSelectedProduct(product);

        setSelectedVisibility(visibility);

        setOpenModal(true);

    };


    const closeModal = () => {

        if (upgradingId) {
            return;
        }

        setOpenModal(false);

        setSelectedProduct(null);

        setSelectedVisibility(null);

    };


    const upgradeVisibility = async () => {

        if (
            !selectedProduct ||
            !selectedVisibility
        ) {
            return;
        }

        try {

            setUpgradingId(
                selectedProduct.id
            );


            const response = await api.post(

                `/api/product/${selectedProduct.id}/visibility`,

                {
                    visibility:
                        selectedVisibility.value
                }

            );

            const updatedProduct =
                response.data.product;


            setProducts((previousProducts) =>

                previousProducts.map(
                    (product) =>

                        product.id ===
                        selectedProduct.id

                            ? updatedProduct

                            : product
                )

            );

            setOpenModal(false);

            setSuccessModal(true);


        } catch (error) {

            console.error(
                "VISIBILITY UPDATE ERROR:",
                error
            );

            toast.error(

                error.response?.data?.message ||

                "Unable to upgrade product visibility."

            );

        } finally {

            setUpgradingId(null);

        }

    };


    const getProductImage = (
        product
    ) => {

        if (
            product.images &&
            product.images.length > 0
        ) {

            return `http://localhost:8000/storage/${product.images[0].image_path}`;

        }

        return "/placeholder.png";

    };

    const getVisibilityLabel = (
        visibility
    ) => {

        switch (
            String(visibility)
        ) {

            case "25":
                return "1/4 of locations";

            case "50":
                return "1/2 of locations";

            case "75":
                return "3/4 of locations";

            case "100":
                return "All locations";

            default:
                return "Only your location";

        }

    };

    if (loading) {

        return (

            <div className="
                min-h-screen
                pt-24
                px-4
                pb-10
                bg-[var(--bg-color)]
                text-[var(--text-color)]
            ">

                <div className="
                    max-w-7xl
                    mx-auto
                ">

                    <div className="
                        animate-pulse
                        space-y-6
                    ">

                        <div className="
                            h-10
                            bg-gray-200
                            rounded-xl
                            w-72
                        " />

                        <div className="
                            h-5
                            bg-gray-200
                            rounded
                            w-full
                            max-w-xl
                        " />

                        <div className="
                            grid
                            sm:grid-cols-2
                            lg:grid-cols-3
                            gap-6
                        ">

                            {[1, 2, 3, 4, 5, 6]
                                .map((item) => (

                                    <div
                                        key={item}
                                        className="
                                            bg-gray-200
                                            rounded-3xl
                                            h-96
                                        "
                                    />

                                ))}

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="
            min-h-screen
            pt-24
            px-3
            sm:px-5
            pb-10
            bg-[var(--bg-color)]
            text-[var(--text-color)]
        ">

            <div className="
                max-w-7xl
                mx-auto
            ">

                {/* HEADER */}

                <div className="
                    mb-8
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                        mb-3
                    ">

                        <div className="
                            p-3
                            rounded-2xl
                            bg-blue-100
                            text-blue-600
                        ">

                            <Eye
                                size={28}
                            />

                        </div>

                        <div>

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-bold
                            ">

                                Product Visibility

                            </h1>

                            <p className="
                                text-sm
                                opacity-70
                            ">

                                Upgrade your products to
                                reach users outside your
                                location.

                            </p>

                        </div>

                    </div>


                    <div className="
                        border
                        border-blue-200
                        bg-blue-50
                        rounded-2xl
                        p-4
                        mt-5
                        flex
                        gap-3
                    ">

                        <ShieldCheck
                            className="
                                text-blue-600
                                flex-shrink-0
                            "
                        />

                        <p className="
                            text-sm
                            text-blue-800
                        ">

                            Product visibility is controlled
                            by your selected location and the
                            visibility level you unlock with
                            badges.

                        </p>

                    </div>

                </div>


                {/* NO PRODUCTS */}

                {products.length === 0 && (

                    <div className="
                        text-center
                        py-20
                        border
                        rounded-3xl
                    ">

                        <Eye
                            size={50}
                            className="
                                mx-auto
                                mb-4
                                opacity-50
                            "
                        />

                        <h2 className="
                            text-xl
                            font-bold
                        ">

                            No Products Found

                        </h2>

                        <p className="
                            opacity-70
                            mt-2
                        ">

                            You don't currently have
                            any products to upgrade.

                        </p>

                    </div>

                )}


                {/* PRODUCTS */}

                <div className="
                    grid
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-6
                ">

                    {products.map(
                        (product) => {

                            const isUpgrading =
                                upgradingId ===
                                product.id;


                            return (

                                <div
                                    key={
                                        product.id
                                    }
                                    className="
                                        bg-[var(--bg-color)]
                                        border
                                        border-gray-200
                                        rounded-3xl
                                        overflow-hidden
                                        shadow-sm
                                        hover:shadow-lg
                                        transition
                                    "
                                >

                                    {/* IMAGE */}

                                    <img
                                        src={getProductImage(
                                            product
                                        )}
                                        alt={
                                            product.title
                                        }
                                        className="
                                            w-full
                                            h-56
                                            object-cover
                                        "
                                    />


                                    <div className="
                                        p-5
                                    ">

                                        {/* TITLE */}

                                        <h2 className="
                                            font-bold
                                            text-lg
                                            line-clamp-2
                                        ">

                                            {
                                                product.title
                                            }

                                        </h2>


                                        {/* LOCATION */}

                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                            mt-3
                                            text-sm
                                            opacity-70
                                        ">

                                            <MapPin
                                                size={16}
                                            />

                                            <span>

                                                {
                                                    product.location ||
                                                    "Location not set"
                                                }

                                            </span>

                                        </div>


                                        {/* CURRENT VISIBILITY */}

                                        <div className="
                                            mt-4
                                            rounded-2xl
                                            bg-gray-50
                                            p-4
                                        ">

                                            <p className="
                                                text-xs
                                                opacity-60
                                            ">

                                                Current visibility

                                            </p>

                                            <p className="
                                                font-semibold
                                                mt-1
                                            ">

                                                {product.visibility_unlocked
                                                    ? getVisibilityLabel(
                                                        product.visibility
                                                    )
                                                    : "Only your location"}

                                            </p>

                                        </div>


                                        {/* UPGRADE BUTTON */}

                                        <button
                                            type="button"
                                            disabled={
                                                isUpgrading
                                            }
                                            onClick={() =>
                                                setSelectedProduct(
                                                    product
                                                )
                                            }
                                            className="
                                                mt-4
                                                w-full
                                                bg-blue-600
                                                hover:bg-blue-700
                                                disabled:opacity-50
                                                text-white
                                                rounded-xl
                                                py-3
                                                font-semibold
                                                transition
                                            "
                                        >

                                            {isUpgrading ? (

                                                <span className="
                                                    flex
                                                    justify-center
                                                    items-center
                                                    gap-2
                                                ">

                                                    <LoaderCircle
                                                        size={20}
                                                        className="
                                                            animate-spin
                                                        "
                                                    />

                                                    Updating...

                                                </span>

                                            ) : (

                                                "Upgrade Visibility"

                                            )}

                                        </button>


                                        {/* VISIBILITY OPTIONS */}

                                        {selectedProduct?.id ===
                                            product.id && (

                                            <div className="
                                                mt-4
                                                space-y-2
                                            ">

                                                {visibilityOptions.map(
                                                    (option) => {

                                                        const Icon =
                                                            option.icon;

                                                        return (

                                                            <button
                                                                key={
                                                                    option.value
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    selectVisibility(
                                                                        product,
                                                                        option
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    border
                                                                    border-blue-200
                                                                    hover:border-blue-600
                                                                    hover:bg-blue-50
                                                                    rounded-xl
                                                                    p-3
                                                                    text-left
                                                                    transition
                                                                "
                                                            >

                                                                <div className="
                                                                    flex
                                                                    items-center
                                                                    justify-between
                                                                ">

                                                                    <div className="
                                                                        flex
                                                                        items-center
                                                                        gap-3
                                                                    ">

                                                                        <Icon
                                                                            size={19}
                                                                            className="
                                                                                text-blue-600
                                                                            "
                                                                        />

                                                                        <span className="
                                                                            font-semibold
                                                                            text-sm
                                                                        ">

                                                                            {
                                                                                option.title
                                                                            }

                                                                        </span>

                                                                    </div>

                                                                    <span className="
                                                                        text-xs
                                                                        font-bold
                                                                        text-blue-600
                                                                    ">

                                                                        {
                                                                            option.badges
                                                                        }

                                                                        {" "}

                                                                        badges

                                                                    </span>

                                                                </div>

                                                            </button>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>


            {openModal &&
                selectedProduct &&
                selectedVisibility && (

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
                            shadow-2xl
                        ">

                            {/* HEADER */}

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

                                    Upgrade Visibility

                                </h2>

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="
                                        p-2
                                        rounded-full
                                        hover:bg-gray-100
                                    "
                                >

                                    <X />

                                </button>

                            </div>


                            {/* PRODUCT */}

                            <div className="
                                mt-6
                                flex
                                gap-4
                                items-center
                            ">

                                <img
                                    src={getProductImage(
                                        selectedProduct
                                    )}
                                    alt=""
                                    className="
                                        w-20
                                        h-20
                                        rounded-xl
                                        object-cover
                                    "
                                />

                                <div>

                                    <h3 className="
                                        font-bold
                                    ">

                                        {
                                            selectedProduct.title
                                        }

                                    </h3>

                                    <p className="
                                        text-sm
                                        opacity-60
                                    ">

                                        {
                                            selectedProduct.location
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* SELECTION */}

                            <div className="
                                mt-6
                                rounded-2xl
                                bg-blue-50
                                p-5
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                    <Globe2
                                        className="
                                            text-blue-600
                                        "
                                    />

                                    <div>

                                        <p className="
                                            text-sm
                                            text-blue-700
                                        ">

                                            Selected visibility

                                        </p>

                                        <h3 className="
                                            font-bold
                                            text-lg
                                            text-blue-900
                                        ">

                                            {
                                                selectedVisibility.title
                                            }

                                        </h3>

                                    </div>

                                </div>

                            </div>


                            {/* BADGES */}

                            <div className="
                                mt-5
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    p-3
                                    rounded-xl
                                    bg-yellow-100
                                    text-yellow-700
                                ">

                                    <Badge />

                                </div>

                                <div>

                                    <p className="
                                        text-sm
                                        opacity-60
                                    ">

                                        Badges required

                                    </p>

                                    <p className="
                                        text-xl
                                        font-bold
                                    ">

                                        {
                                            selectedVisibility.badges
                                        }

                                        {" "}

                                        Badges

                                    </p>

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <p className="
                                mt-5
                                text-sm
                                leading-6
                                opacity-70
                            ">

                                {
                                    selectedVisibility.description
                                }

                            </p>


                            <p className="
                                mt-3
                                text-sm
                                font-semibold
                            ">

                                This action will deduct{" "}

                                {
                                    selectedVisibility.badges
                                }

                                {" "}badges from your account.

                            </p>


                            {/* BUTTONS */}

                            <div className="
                                mt-7
                                flex
                                gap-3
                            ">

                                <button
                                    type="button"
                                    disabled={
                                        upgradingId !== null
                                    }
                                    onClick={
                                        closeModal
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
                                        upgradingId !== null
                                    }
                                    onClick={
                                        upgradeVisibility
                                    }
                                    className="
                                        flex-1
                                        bg-blue-600
                                        hover:bg-blue-700
                                        disabled:opacity-50
                                        text-white
                                        rounded-xl
                                        py-3
                                        font-semibold
                                    "
                                >

                                    {upgradingId ? (

                                        <span className="
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                        ">

                                            <LoaderCircle
                                                size={19}
                                                className="
                                                    animate-spin
                                                "
                                            />

                                            Upgrading...

                                        </span>

                                    ) : (

                                        "Confirm Upgrade"

                                    )}

                                </button>

                            </div>

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
                        max-w-md
                        w-full
                        p-7
                        text-center
                        shadow-2xl
                    ">

                        <div className="
                            mx-auto
                            w-20
                            h-20
                            rounded-full
                            bg-green-100
                            text-green-600
                            flex
                            items-center
                            justify-center
                        ">

                            <CheckCircle
                                size={45}
                            />

                        </div>


                        <h2 className="
                            mt-5
                            text-2xl
                            font-bold
                        ">

                            Visibility Updated

                        </h2>


                        <p className="
                            mt-3
                            leading-7
                            opacity-70
                        ">

                            Your product visibility has
                            been successfully upgraded.
                            Your product can now reach users
                            within the selected visibility
                            range.

                        </p>


                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                            className="
                                mt-7
                                w-full
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                rounded-xl
                                py-3
                                font-semibold
                            "
                        >

                            Back to Dashboard

                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                setSuccessModal(
                                    false
                                )
                            }
                            className="
                                mt-3
                                w-full
                                border
                                rounded-xl
                                py-3
                                font-semibold
                            "
                        >

                            Stay Here

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}