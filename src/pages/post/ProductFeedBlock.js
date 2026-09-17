import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from "lucide-react";
import logo from '../post/image/product.png'
export default function ProductFeedBlock({ products = [] }) {

    const navigate = useNavigate();

    const symbols = { USD: "$", NGN: "₦", EUR: "€" };

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!Array.isArray(products) || products.length === 0) {
        return null;
    }
 

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

         const image = product.images?.[0]?.url || logo;

        const symbol = symbols[product.currency] || product.currency;


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
                <button
                    type="button"
                    onClick={openProduct}
                    className="
                        block
                        w-full
                        h-[180px]
                        sm:h-[320px]
                        overflow-hidden
                        bg-gray-900
                        dark:bg-gray-300
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
                        {product?.title ||
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
                                {symbol}{finalPrice.toLocaleString()}
                            </span>


                            {hasDiscount && (

                                <span
                                    className="
                                        text-sm
                                        text-gray-400
                                        line-through
                                    "
                                >
                                    {symbol}{price.toLocaleString()}
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
                                discount {symbol}
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

                        Order Now

                    </button>

                </div>

            </div>
        );
    };
 

    if (products.length <= 2) {

        return (
            <div
                className="
                    w-full
                    max-w-[650px]
                    flex
                    flex-col
                    sm:gap-4 gap-2
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
                py-3 sm:4 px-2 border border-gray-900 rounded-lg
                bg-[var(--bg-color)]
                text-[var(--text-color)]
            "
        >

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