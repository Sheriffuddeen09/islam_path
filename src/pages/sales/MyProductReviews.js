import React, {
    useEffect,
    useState
} from "react";

import {
    Star,
    MessageSquare,
    Package,
    LoaderCircle,
    User,
    MapPin,
    ChevronDown,
    ChevronUp
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../Api/axios";


export default function MyProductReviews() {

    const [reviews, setReviews] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [expanded, setExpanded] =
        useState(null);

    const [summary, setSummary] =
        useState({
            total_reviews: 0,
            average_rating: 0,
            rating_breakdown: {
                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0
            }
        });


    /*
    |--------------------------------------------------------------------------
    | FETCH REVIEWS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        fetchMyProductReviews();

    }, []);


    const fetchMyProductReviews =
        async () => {

            try {

                setLoading(true);

                const response =
                    await api.get(
                        "/api/my-product-reviews"
                    );


                setReviews(
                    response.data.reviews ||
                    []
                );


                setSummary({

                    total_reviews:
                        response.data
                            .total_reviews || 0,

                    average_rating:
                        response.data
                            .average_rating || 0,

                    rating_breakdown:
                        response.data
                            .rating_breakdown || {
                                5: 0,
                                4: 0,
                                3: 0,
                                2: 0,
                                1: 0
                            }

                });


            } catch (error) {

                console.error(
                    "MY PRODUCT REVIEWS ERROR:",
                    error
                );


                toast.error(
                    error.response?.data?.message ||
                    "Unable to load your reviews."
                );


            } finally {

                setLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | STAR DISPLAY
    |--------------------------------------------------------------------------
    */

    const Stars = ({
        rating
    }) => {

        return (

            <div className="
                flex
                items-center
                gap-1
            ">

                {[1, 2, 3, 4, 5]
                    .map((star) => (

                        <Star
                            key={star}
                            size={18}
                            className={
                                star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                            }
                        />

                    ))}

            </div>

        );

    };


    /*
    |--------------------------------------------------------------------------
    | LOADING SKELETON
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <div className="
                min-h-screen
                pt-24
                px-4
                pb-10
            ">

                <div className="
                    max-w-6xl
                    mx-auto
                    animate-pulse
                ">

                    <div className="
                        h-10
                        w-72
                        bg-gray-200
                        rounded-xl
                        mb-3
                    " />

                    <div className="
                        h-5
                        w-96
                        max-w-full
                        bg-gray-200
                        rounded
                        mb-8
                    " />


                    <div className="
                        grid
                        md:grid-cols-3
                        gap-5
                        mb-8
                    ">

                        {[1, 2, 3]
                            .map((item) => (

                                <div
                                    key={item}
                                    className="
                                        h-32
                                        bg-gray-200
                                        rounded-3xl
                                    "
                                />

                            ))}

                    </div>


                    <div className="
                        space-y-5
                    ">

                        {[1, 2, 3, 4]
                            .map((item) => (

                                <div
                                    key={item}
                                    className="
                                        h-44
                                        bg-gray-200
                                        rounded-3xl
                                    "
                                />

                            ))}

                    </div>

                </div>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | PAGE
    |--------------------------------------------------------------------------
    */

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
                max-w-6xl
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
                    ">

                        <div className="
                            p-3
                            rounded-2xl
                            bg-blue-100
                            text-blue-600
                        ">

                            <MessageSquare
                                size={28}
                            />

                        </div>


                        <div>

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                font-bold
                            ">

                                My Product Reviews

                            </h1>

                            <p className="
                                text-sm
                                opacity-70
                                mt-1
                            ">

                                Reviews customers have
                                left on your products.

                            </p>

                        </div>

                    </div>

                </div>


                {/* SUMMARY */}

                <div className="
                    grid
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-5
                    mb-8
                ">


                    {/* TOTAL */}

                    <div className="
                        rounded-3xl
                        border
                        p-5
                        bg-[var(--bg-color)]
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                p-3
                                rounded-xl
                                bg-blue-100
                                text-blue-600
                            ">

                                <MessageSquare
                                    size={22}
                                />

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    opacity-60
                                ">

                                    Total Reviews

                                </p>

                                <h2 className="
                                    text-2xl
                                    font-bold
                                ">

                                    {
                                        summary.total_reviews
                                    }

                                </h2>

                            </div>

                        </div>

                    </div>


                    {/* AVERAGE */}

                    <div className="
                        rounded-3xl
                        border
                        p-5
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                p-3
                                rounded-xl
                                bg-yellow-100
                                text-yellow-600
                            ">

                                <Star
                                    size={22}
                                    className="
                                        fill-yellow-400
                                    "
                                />

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    opacity-60
                                ">

                                    Average Rating

                                </p>

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                    <h2 className="
                                        text-2xl
                                        font-bold
                                    ">

                                        {
                                            summary.average_rating
                                        }

                                    </h2>

                                    <Stars
                                        rating={
                                            Math.round(
                                                summary.average_rating
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* PRODUCTS */}

                    <div className="
                        rounded-3xl
                        border
                        p-5
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                        ">

                            <div className="
                                p-3
                                rounded-xl
                                bg-green-100
                                text-green-600
                            ">

                                <Package
                                    size={22}
                                />

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    opacity-60
                                ">

                                    Products Reviewed

                                </p>

                                <h2 className="
                                    text-2xl
                                    font-bold
                                ">

                                    {
                                        new Set(
                                            reviews.map(
                                                review =>
                                                    review.product_id
                                            )
                                        ).size
                                    }

                                </h2>

                            </div>

                        </div>

                    </div>

                </div>


                {/* RATING BREAKDOWN */}

                {summary.total_reviews > 0 && (

                    <div className="
                        border
                        rounded-3xl
                        p-5
                        mb-8
                    ">

                        <h2 className="
                            font-bold
                            text-lg
                            mb-5
                        ">

                            Rating Breakdown

                        </h2>


                        <div className="
                            space-y-3
                            max-w-xl
                        ">

                            {[5, 4, 3, 2, 1]
                                .map((rating) => {

                                    const count =
                                        summary
                                            .rating_breakdown[
                                                rating
                                            ] || 0;


                                    const percentage =
                                        summary.total_reviews
                                            ? (
                                                count /
                                                summary.total_reviews
                                            ) * 100
                                            : 0;


                                    return (

                                        <div
                                            key={rating}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >

                                            <span className="
                                                w-10
                                                text-sm
                                                font-semibold
                                            ">

                                                {rating}
                                                ★

                                            </span>


                                            <div className="
                                                flex-1
                                                h-2
                                                rounded-full
                                                bg-gray-200
                                                overflow-hidden
                                            ">

                                                <div
                                                    className="
                                                        h-full
                                                        bg-yellow-400
                                                    "
                                                    style={{
                                                        width:
                                                            `${percentage}%`
                                                    }}
                                                />

                                            </div>


                                            <span className="
                                                w-8
                                                text-sm
                                                opacity-60
                                            ">

                                                {count}

                                            </span>

                                        </div>

                                    );

                                })}

                        </div>

                    </div>

                )}


                {/* REVIEWS */}

                {reviews.length === 0 ? (

                    <div className="
                        border
                        rounded-3xl
                        py-20
                        text-center
                    ">

                        <MessageSquare
                            size={50}
                            className="
                                mx-auto
                                opacity-40
                                mb-4
                            "
                        />

                        <h2 className="
                            text-xl
                            font-bold
                        ">

                            No Reviews Yet

                        </h2>

                        <p className="
                            opacity-60
                            mt-2
                        ">

                            Customers have not reviewed
                            any of your products yet.

                        </p>

                    </div>

                ) : (

                    <div className="
                        space-y-5
                    ">

                        {reviews.map(
                            (review) => {

                                const isExpanded =
                                    expanded ===
                                    review.id;


                                const reviewer =
                                    review.user;


                                const product =
                                    review.product;


                                return (

                                    <div
                                        key={
                                            review.id
                                        }
                                        className="
                                            border
                                            rounded-3xl
                                            p-5
                                            bg-[var(--bg-color)]
                                            shadow-sm
                                        "
                                    >

                                        {/* TOP */}

                                        <div className="
                                            flex
                                            flex-col
                                            md:flex-row
                                            md:items-center
                                            md:justify-between
                                            gap-4
                                        ">

                                            {/* USER */}

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

                                                <div className="
                                                    w-12
                                                    h-12
                                                    rounded-full
                                                    bg-blue-100
                                                    text-blue-600
                                                    flex
                                                    items-center
                                                    justify-center
                                                ">

                                                    <User
                                                        size={22}
                                                    />

                                                </div>


                                                <div>

                                                    <h3 className="
                                                        font-bold
                                                    ">

                                                        {
                                                            reviewer?.first_name
                                                        }

                                                        {" "}

                                                        {
                                                            reviewer?.last_name
                                                        }

                                                    </h3>


                                                    <p className="
                                                        text-xs
                                                        opacity-60
                                                    ">

                                                        Customer

                                                    </p>

                                                </div>

                                            </div>


                                            {/* RATING */}

                                            <Stars
                                                rating={
                                                    review.rating
                                                }
                                            />

                                        </div>


                                        {/* PRODUCT */}

                                        <div className="
                                            mt-5
                                            rounded-2xl
                                            bg-gray-50
                                            p-4
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

                                                <Package
                                                    size={20}
                                                    className="
                                                        text-blue-600
                                                    "
                                                />


                                                <div>

                                                    <p className="
                                                        text-xs
                                                        opacity-60
                                                    ">

                                                        Product

                                                    </p>

                                                    <p className="
                                                        font-semibold
                                                    ">

                                                        {
                                                            product?.title
                                                        }

                                                    </p>

                                                </div>

                                            </div>


                                            {product?.location && (

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    mt-2
                                                    text-xs
                                                    opacity-60
                                                ">

                                                    <MapPin
                                                        size={14}
                                                    />

                                                    {
                                                        product.location
                                                    }

                                                </div>

                                            )}

                                        </div>


                                        {/* COMMENT */}

                                        <div className="
                                            mt-5
                                        ">

                                            <p className={`
                                                leading-7
                                                text-sm
                                                ${!isExpanded
                                                    ? "line-clamp-3"
                                                    : ""
                                                }
                                            `}>

                                                {
                                                    review.comment
                                                }

                                            </p>


                                            {review.comment?.length >
                                                180 && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpanded(
                                                            isExpanded
                                                                ? null
                                                                : review.id
                                                        )
                                                    }
                                                    className="
                                                        mt-2
                                                        text-blue-600
                                                        text-sm
                                                        font-semibold
                                                        flex
                                                        items-center
                                                        gap-1
                                                    "
                                                >

                                                    {isExpanded
                                                        ? "Show Less"
                                                        : "Read More"
                                                    }

                                                    {isExpanded
                                                        ? (
                                                            <ChevronUp
                                                                size={16}
                                                            />
                                                        )
                                                        : (
                                                            <ChevronDown
                                                                size={16}
                                                            />
                                                        )
                                                    }

                                                </button>

                                            )}

                                        </div>


                                        {/* DATE */}

                                        <div className="
                                            mt-5
                                            pt-4
                                            border-t
                                            text-xs
                                            opacity-50
                                        ">

                                            {review.created_at &&
                                                new Date(
                                                    review.created_at
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year:
                                                            "numeric",
                                                        month:
                                                            "long",
                                                        day:
                                                            "numeric"
                                                    }
                                                )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </div>

    );
}