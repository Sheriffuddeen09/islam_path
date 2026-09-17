import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";

export default function FeedProduct({
    product,
}) {
    if (!product) {
        return null;
    }

    const image =
        product.images?.[0]?.url ||
        product.front_image ||
        null;

    const price = Number(product.price || 0);

    const discount = Number(product.discount || 0);

    const finalPrice = Math.max(
        0,
        price - discount
    );

    const currency =
        product.currency || "USD";

    return (
        <div
            className="
                rounded-xl
                shadow
                md:w-96
                lg:w-[480px]
                w-full
                border
                overflow-hidden
                bg-[var(--bg-color)]
                text-[var(--text-color)]
            "
        >

            {/* PRODUCT IMAGE */}

            <Link
                to={`/product/${product.id}`}
                className="block"
            >
                <div
                    className="
                        w-full
                        h-64
                        bg-gray-200
                        overflow-hidden
                    "
                >
                    {image ? (
                        <img
                            src={image}
                            alt={product.title}
                            className="
                                w-full
                                h-full
                                object-cover
                                hover:scale-105
                                transition
                                duration-300
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
                </div>
            </Link>

            {/* CONTENT */}

            <div className="p-4">

                <Link
                    to={`/product/${product.id}`}
                >
                    <h2
                        className="
                            font-bold
                            text-base
                            hover:underline
                            line-clamp-2
                        "
                    >
                        {product.title}
                    </h2>
                </Link>

                {/* REVIEWS */}

                <div
                    className="
                        flex
                        items-center
                        gap-1
                        mt-2
                        text-xs
                        text-gray-500
                    "
                >
                    <Star
                        size={15}
                        fill="currentColor"
                    />

                    <span>
                        {product.reviews_count || 0}
                    </span>

                    <span>
                        review
                        {Number(product.reviews_count || 0) === 1
                            ? ""
                            : "s"}
                    </span>
                </div>

                {/* PRICE */}

                <div className="mt-3">

                    {discount > 0 && (
                        <div
                            className="
                                text-xs
                                line-through
                                text-gray-500
                            "
                        >
                            {currency}{" "}
                            {price.toLocaleString()}
                        </div>
                    )}

                    <div
                        className="
                            font-bold
                            text-lg
                        "
                    >
                        {currency}{" "}
                        {finalPrice.toLocaleString()}
                    </div>

                    {discount > 0 && (
                        <div
                            className="
                                text-xs
                                text-green-600
                                font-semibold
                            "
                        >
                            Save {currency}{" "}
                            {discount.toLocaleString()}
                        </div>
                    )}

                </div>

                {/* ADD BUTTON */}

                <Link
                    to={`/product/${product.id}`}
                    className="
                        mt-4
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        py-2.5
                        px-4
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        font-semibold
                        transition
                    "
                >
                    <ShoppingCart size={18} />

                    Order Now
                </Link>

            </div>

        </div>
    );
}