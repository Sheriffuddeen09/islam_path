import { useState, useRef } from "react";

export default function ImageFlex({
    media = [],
    postId
}) {
    const [previewOpen, setPreviewOpen] =
        useState(false);

    const [previewIndex, setPreviewIndex] =
        useState(0);

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    const total = media.length;

    if (!total) return null;

    const openPreview = (index) => {
        setPreviewIndex(index);
        setPreviewOpen(true);
    };

    const closePreview = () => {
        setPreviewOpen(false);
    };

    const goPrevious = () => {
        setPreviewIndex((index) =>
            Math.max(index - 1, 0)
        );
    };

    const goNext = () => {
        setPreviewIndex((index) =>
            Math.min(
                index + 1,
                media.length - 1
            )
        );
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];

        touchStartX.current =
            touch.clientX;

        touchStartY.current =
            touch.clientY;
    };

    const handleTouchEnd = (e) => {
        if (
            touchStartX.current === null
        ) {
            return;
        }

        const touch =
            e.changedTouches[0];

        const deltaX =
            touch.clientX -
            touchStartX.current;

        const deltaY =
            touch.clientY -
            touchStartY.current;

        touchStartX.current = null;
        touchStartY.current = null;

        // Ignore vertical movement
        if (
            Math.abs(deltaX) <
            Math.abs(deltaY)
        ) {
            return;
        }

        // Minimum swipe distance
        if (
            Math.abs(deltaX) < 50
        ) {
            return;
        }

        // Swipe left = next
        if (deltaX < 0) {
            goNext();
        }

        // Swipe right = previous
        if (deltaX > 0) {
            goPrevious();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | IMAGE COMPONENT
    |--------------------------------------------------------------------------
    */

    const ImageItem = ({
        image,
        index,
        className = ""
    }) => (
        <img
            src={image.url}
            alt=""
            onClick={() =>
                openPreview(index)
            }
            className={`
                cursor-pointer
                ${className}
            `}
        />
    );

    return (
        <>
            {/* ========================================================= */}
            {/* 1 IMAGE */}
            {/* ========================================================= */}

            {total === 1 && (
                <ImageItem
                    image={media[0]}
                    index={0}
                    className="
                        w-full
                        sm:h-96
                        h-64
                        rounded-lg
                        object-cover
                    "
                />
            )}


            {/* ========================================================= */}
            {/* 2 IMAGES */}
            {/* ========================================================= */}

            {total === 2 && (
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-2
                    "
                >
                    {media.map(
                        (img, index) => (
                            <ImageItem
                                key={img.id}
                                image={img}
                                index={index}
                                className="
                                    sm:h-96
                                    h-64
                                    w-full
                                    object-cover
                                "
                            />
                        )
                    )}
                </div>
            )}


            {/* ========================================================= */}
            {/* 3 IMAGES */}
            {/* ========================================================= */}

            {total === 3 && (
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-2
                    "
                >

                    <ImageItem
                        image={media[0]}
                        index={0}
                        className="
                            sm:h-96
                            h-64
                            w-full
                            object-cover
                        "
                    />

                    {media
                        .slice(1)
                        .map(
                            (img, index) => (
                                <ImageItem
                                    key={img.id}
                                    image={img}
                                    index={
                                        index + 1
                                    }
                                    className="
                                        sm:h-96
                                        h-64
                                        w-full
                                        object-cover
                                    "
                                />
                            )
                        )}

                </div>
            )}


            {/* ========================================================= */}
            {/* 4 OR MORE */}
            {/* ========================================================= */}

            {total >= 4 && (
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-2
                        sm:px-4
                    "
                >
                    {media.map(
                        (img, index) => (
                            <div
                                key={img.id}
                                className="
                                    relative
                                    sm:h-96
                                    h-64
                                    cursor-pointer
                                "
                            >
                                <ImageItem
                                    image={img}
                                    index={index}
                                    className="
                                        w-full
                                        sm:h-96
                                        h-64
                                        object-cover
                                    "
                                />
                            </div>
                        )
                    )}
                </div>
            )}


            {/* ========================================================= */}
            {/* PREVIEW MODAL */}
            {/* ========================================================= */}

            {previewOpen &&
                media[previewIndex] && (
                    <div
                        className="
                            fixed
                            inset-0
                            z-[9999]
                            bg-black/90
                            flex
                            items-center
                            justify-center
                        "
                        onClick={(e) => {
                            /*
                            Close when clicking
                            the background.
                            */
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                closePreview();
                            }
                        }}
                    >

                        {/* ================================================= */}
                        {/* TOP RIGHT */}
                        {/* ================================================= */}

                        <button
                            type="button"
                            onClick={
                                closePreview
                            }
                            className="
                                absolute
                                top-4
                                right-4
                                z-50
                                w-10
                                h-10
                                rounded-full
                                bg-white
                                text-black
                                flex
                                items-center
                                justify-center
                                text-xl
                                font-semibold
                            "
                        >
                            ✕
                        </button>


                        {/* ================================================= */}
                        {/* IMAGE PREVIEW / SWIPE AREA */}
                        {/* ================================================= */}

                        <div
                            className="
                                max-w-[95vw]
                                max-h-[90vh]
                                flex
                                items-center
                                justify-center
                                touch-pan-y
                                select-none
                            "
                            onTouchStart={
                                handleTouchStart
                            }
                            onTouchEnd={
                                handleTouchEnd
                            }
                        >

                            <img
                                src={
                                    media[
                                        previewIndex
                                    ].url
                                }
                                alt=""
                                draggable={false}
                                className="
                                    max-w-[95vw]
                                    max-h-[90vh]
                                    object-contain
                                    select-none
                                    pointer-events-none
                                "
                            />

                        </div>


                        {/* ================================================= */}
                        {/* PREVIOUS - DESKTOP */}
                        {/* ================================================= */}

                        {previewIndex > 0 && (
                            <button
                                type="button"
                                onClick={
                                    goPrevious
                                }
                                className="
                                    hidden
                                    md:flex
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    z-40
                                    w-10
                                    h-10
                                    rounded-full
                                    border-2
                                    border-white
                                    bg-black/40
                                    text-white
                                    items-center
                                    justify-center
                                    text-3xl
                                    pb-1
                                    hover:bg-black/70
                                "
                            >
                                ‹
                            </button>
                        )}


                        {/* ================================================= */}
                        {/* NEXT - DESKTOP */}
                        {/* ================================================= */}

                        {previewIndex <
                            media.length - 1 && (
                            <button
                                type="button"
                                onClick={
                                    goNext
                                }
                                className="
                                    hidden
                                    md:flex
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    z-40
                                    w-10
                                    h-10
                                    rounded-full
                                    border-2
                                    border-white
                                    bg-black/40
                                    text-white
                                    items-center
                                    justify-center
                                    text-3xl
                                    pb-1
                                    hover:bg-black/70
                                "
                            >
                                ›
                            </button>
                        )}


                        {/* ================================================= */}
                        {/* IMAGE COUNTER */}
                        {/* ================================================= */}

                        {media.length > 1 && (
                            <div
                                className="
                                    absolute
                                    bottom-5
                                    left-1/2
                                    -translate-x-1/2
                                    bg-black/60
                                    text-white
                                    text-xs
                                    px-3
                                    py-1
                                    rounded-full
                                "
                            >
                                {previewIndex + 1}
                                {" / "}
                                {media.length}
                            </div>
                        )}

                    </div>
                )}

        </>
    );
}