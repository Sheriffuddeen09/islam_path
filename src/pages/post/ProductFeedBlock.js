
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Star,
} from "lucide-react";

import logo from "../post/image/product.png";
import api from "../../Api/axios";

export default function ProductFeedBlock({ products = [] }) {
    const navigate = useNavigate();

    const symbols = {
        USD: "$",
        NGN: "₦",
        EUR: "€",
    };

    const [visibleProducts, setVisibleProducts] = useState(
        Array.isArray(products) ? products : []
    );

    const [currentIndex, setCurrentIndex] = useState(0);

    const productBlockRef = useRef(null);
    const cardRefs = useRef(new Map());

    const currentIndexRef = useRef(0);

    const viewedProductsRef = useRef(new Set());

    const [isBlockVisible, setIsBlockVisible] = useState(false);

    const [visibleCardIds, setVisibleCardIds] = useState(
        () => new Set()
    );

    const productIdsKey = Array.isArray(products)
        ? products.map((product) => product.id).join(",")
        : "";

     

    useEffect(() => {
        setVisibleProducts(Array.isArray(products) ? products : []);
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        viewedProductsRef.current.clear();
        setVisibleCardIds(new Set());
    }, [productIdsKey]);

    

    useEffect(() => {
        const element = productBlockRef.current;

        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsBlockVisible(
                    entry.isIntersecting &&
                    entry.intersectionRatio >= 0.1
                );
            },
            {
                threshold: [0, 0.1],
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    
    const markProductViewed = useCallback(async (productId) => {
        const id = Number(productId);

        if (!id || viewedProductsRef.current.has(id)) {
            return;
        }

        viewedProductsRef.current.add(id);

        try {
            await api.post(`/api/products/${id}/view`);
        } catch (error) {
            viewedProductsRef.current.delete(id);

            console.error(
                `Failed to mark product ${id} as viewed:`,
                error
            );
        }
    }, []);
 

    useEffect(() => {
        if (!isBlockVisible) {
            setVisibleCardIds(new Set());
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                setVisibleCardIds((previous) => {
                    const next = new Set(previous);

                    entries.forEach((entry) => {
                        const id = Number(
                            entry.target.dataset.productId
                        );

                        if (!id) return;

                        if (
                            entry.isIntersecting &&
                            entry.intersectionRatio >= 0.5
                        ) {
                            next.add(id);
                        } else {
                            next.delete(id);
                        }
                    });

                    return next;
                });
            },
            {
                root: null,
                threshold: [0, 0.5, 0.75, 1],
            }
        );

        cardRefs.current.forEach((element) => {
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isBlockVisible, visibleProducts, currentIndex]);
 

    useEffect(() => {
        if (!isBlockVisible || visibleCardIds.size === 0) {
            return;
        }

        visibleCardIds.forEach((id) => {
            const element = cardRefs.current.get(id);

            if (!element) return;

            const rect = element.getBoundingClientRect();

            const visibleHeight = Math.max(
                0,
                Math.min(rect.bottom, window.innerHeight) -
                Math.max(rect.top, 0)
            );

            const visibleWidth = Math.max(
                0,
                Math.min(rect.right, window.innerWidth) -
                Math.max(rect.left, 0)
            );

            const visibleArea = visibleHeight * visibleWidth;
            const totalArea = rect.width * rect.height;

            if (
                totalArea > 0 &&
                visibleArea / totalArea >= 0.5
            ) {
                markProductViewed(id);
            }
        });
    }, [
        isBlockVisible,
        visibleCardIds,
        markProductViewed,
    ]);
 

    const getPrice = (product) => {
        const price = Number(product?.price || 0);
        const discount = Number(product?.discount || 0);

        return Math.max(0, price - discount);
    };

    const registerCard = (productId, element) => {
        const id = Number(productId);

        if (!id) return;

        if (element) {
            cardRefs.current.set(id, element);
        } else {
            cardRefs.current.delete(id);
        }
    };

    

    const nextSlide = () => {
        const nextIndex = currentIndexRef.current + 2;

        if (nextIndex >= visibleProducts.length) return;

        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);

       
    };

    const previousSlide = () => {
        const previousIndex = Math.max(
            0,
            currentIndexRef.current - 2
        );

        currentIndexRef.current = previousIndex;
        setCurrentIndex(previousIndex);

    };

    

    const ProductCard = ({ product }) => {
        const image = product?.images?.[0]?.url || logo;
        const symbol =
            symbols[product?.currency] || product?.currency || "";
        const finalPrice = getPrice(product);
        const price = Number(product?.price || 0);
        const discount = Number(product?.discount || 0);
        const hasDiscount = discount > 0 && price > 0;

        const openProduct = () => {
            navigate(`/product/${product.id}`);
        };

        return (
            <div
                ref={(element) => registerCard(product.id, element)}
                data-product-id={product.id}
                className="
                    w-full overflow-hidden rounded-2xl border
                    border-gray-200 dark:border-gray-800
                    bg-[var(--bg-color)] text-[var(--text-color)]
                    shadow-sm
                "
            >
                <button
                    type="button"
                    onClick={openProduct}
                    className="
                        block w-full h-[180px] sm:h-[320px]
                        overflow-hidden bg-gray-900
                    "
                >
                    <img
                        src={image}
                        alt={product?.title || "Product"}
                        loading="lazy"
                        className="
                            w-full h-full object-cover
                            transition duration-300 hover:scale-105
                        "
                    />
                </button>

                <div className="p-3 sm:p-4">
                    <button
                        type="button"
                        onClick={openProduct}
                        className="
                            block w-full text-left font-bold
                            text-base sm:text-lg truncate
                            hover:underline
                        "
                    >
                        {product?.title || "Unnamed Product"}
                    </button>

                    <div className="flex items-center gap-1.5 mt-2 text-sm">
                        <Star size={15} className="fill-current" />
                        <span>{product?.reviews_count || 0}</span>
                        <span>reviews</span>
                    </div>

                    <div className="mt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg sm:text-xl font-bold">
                                {symbol}{finalPrice.toLocaleString()}
                            </span>

                            {hasDiscount && (
                                <span className="text-sm text-gray-400 line-through">
                                    {symbol}{price.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {hasDiscount && (
                            <p className="text-xs text-green-600 mt-1">
                                Discount {symbol}{discount.toLocaleString()}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={openProduct}
                        className="
                            mt-4 w-full flex items-center justify-center gap-2
                            rounded-xl bg-green-600 hover:bg-green-700
                            text-white font-semibold py-2.5 transition
                        "
                    >
                        <ShoppingCart size={18} />
                        Order Now
                    </button>
                </div>
            </div>
        );
    };

    if (!visibleProducts.length) {
        return null;
    }

    

    if (visibleProducts.length <= 2) {
        return (
            <div
                ref={productBlockRef}
                className="
                    w-full max-w-[650px]
                    flex flex-col gap-2 sm:gap-4 mb-5
                "
            >
                {visibleProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}
            </div>
        );
    }

     

    const slideNumber = Math.floor(currentIndex / 2) + 1;
    const totalSlides = Math.ceil(visibleProducts.length / 2);

    return (
        <div
            ref={productBlockRef}
            className="
                w-full max-w-[650px] py-3 px-2 sm:px-3
                border border-gray-900 rounded-lg
                bg-[var(--bg-color)] text-[var(--text-color)]
            "
        >
            <div className="flex items-center justify-between mb-3 gap-2">
                <div>
                    <h3 className="font-bold text-lg">Products</h3>

                    <p className="text-xs">
                        Products available from sellers
                    </p>

                    <p className="text-xs opacity-60 mt-1">
                        Slide {slideNumber} of {totalSlides}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={previousSlide}
                        disabled={currentIndex === 0}
                        aria-label="Previous products"
                        className="
                            w-9 h-9 rounded-full border border-gray-300
                            dark:border-gray-700 flex items-center justify-center
                            disabled:opacity-30
                        "
                    >
                        <ChevronLeft size={19} />
                    </button>

                    <button
                        type="button"
                        onClick={nextSlide}
                        disabled={
                            currentIndex + 2 >= visibleProducts.length
                        }
                        aria-label="Next products"
                        className="
                            w-9 h-9 rounded-full border border-gray-300
                            dark:border-gray-700 flex items-center justify-center
                            disabled:opacity-30
                        "
                    >
                        <ChevronRight size={19} />
                    </button>
                </div>
            </div>

            <div className="overflow-hidden w-full">
                <div
                    className="
                        flex gap-3 transition-transform
                        duration-300 ease-out
                    "
                    style={{
                        transform: `translateX(calc(-${currentIndex / 2 * 100}% - ${currentIndex / 2 * 12}px))`,
                    }}
                >
                    {visibleProducts.map((product) => (
                        <div
                            key={product.id}
                            className="shrink-0 w-[calc(50%-6px)]"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
