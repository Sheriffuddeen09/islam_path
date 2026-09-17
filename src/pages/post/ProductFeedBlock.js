import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";

export default function ProductFeedBlock({ products = [] }) {

    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!Array.isArray(products) || products.length === 0) {
        return null;
    }
 

    const getProductImage = (product) => {

        if (
            Array.isArray(product?.images) &&
            product.images.length > 0
        ) {
            return product.images[0]?.url;
        }

        return null;
    };
 

    const getPrice = (product) => {

        const price = Number(product?.price || 0);

        const discount = Number(
            product?.discount || 0
        );

        return Math.max(
            0,
            price - discount
        );
    };
 

    const ProductCard = ({ product }) => {

        const image = getProductImage(product);

        const finalPrice = getPrice(product);

        const price = Number(
            product?.price || 0
        );

        const discount = Number(
            product?.discount || 0
        );

        const hasDiscount =
            discount > 0 &&
            price > 0;

        const openProduct = () => {

            navigate(
                `/product/${product.id}`
            );

        };

        return (
            <div
                className="
                    w-full
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    dark:border-gray-800
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    shadow-sm
                "
            >

                {/* IMAGE */}

                <button
                    type="button"
                    onClick={openProduct}
                    className="
                        block
                        w-full
                        h-[260px]
                        sm:h-[320px]
                        overflow-hidden
                        bg-gray-100
                        dark:bg-gray-900
                    "
                >

                    {image ? (

                        <img
                            src={image}
                            alt={
                                product?.name ||
                                "Product"
                            }
                            className="
                                w-full
                                h-full
                                object-cover
                                transition
                                duration-300
                                hover:scale-105
                            "
                        />

                    ) : (

                        <div
                            className="
                                w-full
                                h-full
                                flex
                                items-center
                                justify-center
                                text-gray-400
                            "
                        >
                            No image
                        </div>

                    )}

                </button>


                {/* CONTENT */}

                <div className="p-4">

                    {/* PRODUCT NAME */}

                    <button
                        type="button"
                        onClick={openProduct}
                        className="
                            block
                            w-full
                            text-left
                            font-bold
                            text-base
                            sm:text-lg
                            truncate
                            hover:underline
                        "
                    >
                        {product?.name ||
                            "Unnamed Product"}
                    </button>


                    {/* REVIEWS */}

                    <div
                        className="
                            flex
                            items-center
                            gap-1.5
                            mt-2
                            text-sm
                            text-gray-500
                        "
                    >

                        <Star
                            size={15}
                            className="fill-current"
                        />

                        <span>
                            {product?.reviews_count || 0}
                        </span>

                        <span>
                            reviews
                        </span>

                    </div>


                    {/* PRICE */}

                    <div className="mt-3">

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    text-lg
                                    sm:text-xl
                                    font-bold
                                "
                            >
                                ₦{finalPrice.toLocaleString()}
                            </span>


                            {hasDiscount && (

                                <span
                                    className="
                                        text-sm
                                        text-gray-400
                                        line-through
                                    "
                                >
                                    ₦{price.toLocaleString()}
                                </span>

                            )}

                        </div>


                        {hasDiscount && (

                            <p
                                className="
                                    text-xs
                                    text-green-600
                                    mt-1
                                "
                            >
                                Save ₦
                                {discount.toLocaleString()}
                            </p>

                        )}

                    </div>


                    {/* ADD BUTTON */}

                    <button
                        type="button"
                        onClick={openProduct}
                        className="
                            mt-4
                            w-full
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            font-semibold
                            py-2.5
                            transition
                        "
                    >

                        <ShoppingCart
                            size={18}
                        />

                        Add

                    </button>

                </div>

            </div>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | 1 OR 2 PRODUCTS
    |--------------------------------------------------------------------------
    |
    | Same width as the normal feed cards.
    |
    */

    if (products.length <= 2) {

        return (
            <div
                className="
                    w-full
                    max-w-[650px]
                    flex
                    flex-col
                    gap-4
                    mb-5
                "
            >

                {products.map(product => (

                    <ProductCard
                        key={product.id}
                        product={product}
                    />

                ))}

            </div>
        );

    }


    /*
    |--------------------------------------------------------------------------
    | MORE THAN 2 PRODUCTS
    |--------------------------------------------------------------------------
    |
    | Slider.
    |
    | Two cards are visible at once on larger screens.
    |
    */

    const visibleCount = 2;

    const maxIndex =
        Math.max(
            0,
            products.length - visibleCount
        );

    const nextSlide = () => {

        setCurrentIndex(
            previous =>
                Math.min(
                    previous + 1,
                    maxIndex
                )
        );

    };

    const previousSlide = () => {

        setCurrentIndex(
            previous =>
                Math.max(
                    previous - 1,
                    0
                )
        );

    };


    return (
        <div
            className="
                w-full
                max-w-[650px]
                mb-5
            "
        >

            {/* HEADER */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-3
                "
            >

                <div>

                    <h3
                        className="
                            font-bold
                            text-lg
                        "
                    >
                        Products
                    </h3>

                    <p
                        className="
                            text-xs
                            text-gray-500
                        "
                    >
                        Products available from sellers
                    </p>

                </div>


                {/* ARROWS */}

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={previousSlide}
                        disabled={currentIndex === 0}
                        className="
                            w-9
                            h-9
                            rounded-full
                            border
                            border-gray-300
                            dark:border-gray-700
                            flex
                            items-center
                            justify-center
                            disabled:opacity-30
                            bg-[var(--bg-color)]
                        "
                    >

                        <ChevronLeft
                            size={19}
                        />

                    </button>


                    <button
                        type="button"
                        onClick={nextSlide}
                        disabled={
                            currentIndex >= maxIndex
                        }
                        className="
                            w-9
                            h-9
                            rounded-full
                            border
                            border-gray-300
                            dark:border-gray-700
                            flex
                            items-center
                            justify-center
                            disabled:opacity-30
                            bg-[var(--bg-color)]
                        "
                    >

                        <ChevronRight
                            size={19}
                        />

                    </button>

                </div>

            </div>


            {/* SLIDER */}

            <div
                className="
                    overflow-hidden
                    w-full
                "
            >

                <div
                    className="
                        flex
                        gap-3
                        transition-transform
                        duration-300
                        ease-out
                    "
                    style={{
                        transform:
                            `translateX(calc(-${currentIndex * 50}% - ${currentIndex * 6}px))`,
                    }}
                >

                    {products.map(product => (

                        <div
                            key={product.id}
                            className="
                                shrink-0
                                w-[calc(50%-6px)]
                            "
                        >

                            <ProductCard
                                product={product}
                            />

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}