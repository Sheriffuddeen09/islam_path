import { useRef, useState } from "react";

export default function ImageGridLibrary({
    media = [],
    postId
}) {
    const total = media.length;

    const [previewOpen, setPreviewOpen] =
        useState(false);

    const [previewIndex, setPreviewIndex] =
        useState(0);

    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    if (!total) return null;

    const getSrc = (img) =>
        `http://localhost:8000/storage/${img.path}`;

    /*
    |--------------------------------------------------------------------------
    | OPEN PREVIEW
    |--------------------------------------------------------------------------
    */

    const openPreview = (index) => {
        setPreviewIndex(index);
        setPreviewOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE PREVIEW
    |--------------------------------------------------------------------------
    */

    const closePreview = () => {
        setPreviewOpen(false);
    };

    /*
    |--------------------------------------------------------------------------
    | PREVIOUS
    |--------------------------------------------------------------------------
    */

    const goPrevious = () => {
        setPreviewIndex((index) =>
            Math.max(index - 1, 0)
        );
    };

    /*
    |--------------------------------------------------------------------------
    | NEXT
    |--------------------------------------------------------------------------
    */

    const goNext = () => {
        setPreviewIndex((index) =>
            Math.min(
                index + 1,
                media.length - 1
            )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | MOBILE SWIPE START
    |--------------------------------------------------------------------------
    */

    const handleTouchStart = (e) => {
        const touch = e.touches[0];

        touchStartX.current =
            touch.clientX;

        touchStartY.current =
            touch.clientY;
    };

    /*
    |--------------------------------------------------------------------------
    | MOBILE SWIPE END
    |--------------------------------------------------------------------------
    */

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

        // Ignore vertical swipes
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

        // Swipe LEFT = NEXT
        if (deltaX < 0) {
            goNext();
        }

        // Swipe RIGHT = PREVIOUS
        if (deltaX > 0) {
            goPrevious();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | 1 IMAGE
    |--------------------------------------------------------------------------
    */

    if (total === 1) {
        return (
            <>
                <img
                    src={getSrc(media[0])}
                    onClick={() =>
                        openPreview(0)
                    }
                    alt=""
                    className="
                        w-full
                        h-40
                        rounded-lg
                        object-cover
                        cursor-pointer
                    "
                />

                {previewOpen && (
                    <Preview
                        media={media}
                        index={previewIndex}
                        getSrc={getSrc}
                        setOpen={setPreviewOpen}
                        goPrevious={goPrevious}
                        goNext={goNext}
                        handleTouchStart={
                            handleTouchStart
                        }
                        handleTouchEnd={
                            handleTouchEnd
                        }
                    />
                )}
            </>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 2 IMAGES
    |--------------------------------------------------------------------------
    */

    if (total === 2) {
        return (
            <>
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-1
                        overflow-hidden
                    "
                >
                    {media.map(
                        (img, index) => (
                            <img
                                key={img.id}
                                src={getSrc(img)}
                                onClick={() =>
                                    openPreview(
                                        index
                                    )
                                }
                                alt=""
                                className="
                                    h-32
                                    w-full
                                    rounded-lg
                                    object-cover
                                    cursor-pointer
                                "
                            />
                        )
                    )}
                </div>

                {previewOpen && (
                    <Preview
                        media={media}
                        index={previewIndex}
                        getSrc={getSrc}
                        setOpen={setPreviewOpen}
                        goPrevious={goPrevious}
                        goNext={goNext}
                        handleTouchStart={
                            handleTouchStart
                        }
                        handleTouchEnd={
                            handleTouchEnd
                        }
                    />
                )}
            </>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 3 IMAGES
    |--------------------------------------------------------------------------
    */

    if (total === 3) {
        return (
            <>
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-1
                        overflow-hidden
                    "
                >
                    <img
                        src={getSrc(media[0])}
                        onClick={() =>
                            openPreview(0)
                        }
                        alt=""
                        className="
                            row-span-2
                            w-full
                            h-full
                            rounded-lg
                            object-cover
                            cursor-pointer
                        "
                    />

                    {media
                        .slice(1)
                        .map(
                            (img, index) => (
                                <img
                                    key={img.id}
                                    src={getSrc(img)}
                                    onClick={() =>
                                        openPreview(
                                            index + 1
                                        )
                                    }
                                    alt=""
                                    className="
                                        h-32
                                        w-full
                                        rounded-lg
                                        object-cover
                                        cursor-pointer
                                    "
                                />
                            )
                        )}
                </div>

                {previewOpen && (
                    <Preview
                        media={media}
                        index={previewIndex}
                        getSrc={getSrc}
                        setOpen={setPreviewOpen}
                        goPrevious={goPrevious}
                        goNext={goNext}
                        handleTouchStart={
                            handleTouchStart
                        }
                        handleTouchEnd={
                            handleTouchEnd
                        }
                    />
                )}
            </>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | 4 OR MORE
    |--------------------------------------------------------------------------
    */

    const visible =
        media.slice(0, 4);

    const remaining =
        total - 4;

    return (
        <>
            <div
                className="
                    grid
                    grid-cols-2
                    gap-1
                    overflow-hidden
                "
            >
                {visible.map(
                    (img, index) => {
                        const isLast =
                            index === 3 &&
                            remaining > 0;

                        return (
                            <div
                                key={img.id}
                                className="
                                    relative
                                    h-24
                                    cursor-pointer
                                "
                                onClick={() =>
                                    openPreview(
                                        index
                                    )
                                }
                            >
                                <img
                                    src={getSrc(img)}
                                    alt=""
                                    className="
                                        w-full
                                        h-full
                                        rounded-lg
                                        object-cover
                                    "
                                />

                                {isLast && (
                                    <div
                                        className="
                                            absolute
                                            inset-0
                                            bg-black/60
                                            flex
                                            items-center
                                            justify-center
                                            rounded-lg
                                        "
                                    >
                                        <span
                                            className="
                                                text-white
                                                text-2xl
                                                font-bold
                                            "
                                        >
                                            +{remaining}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    }
                )}
            </div>

            {previewOpen && (
                <Preview
                    media={media}
                    index={previewIndex}
                    getSrc={getSrc}
                    setOpen={setPreviewOpen}
                    goPrevious={goPrevious}
                    goNext={goNext}
                    handleTouchStart={
                        handleTouchStart
                    }
                    handleTouchEnd={
                        handleTouchEnd
                    }
                />
            )}
        </>
    );
}


/*
|--------------------------------------------------------------------------
| PREVIEW COMPONENT
|--------------------------------------------------------------------------
*/

function Preview({
    media,
    index,
    getSrc,
    setOpen,
    goPrevious,
    goNext,
    handleTouchStart,
    handleTouchEnd
}) {
    const current = media[index];

    if (!current) {
        return null;
    }

    return (
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
                if (
                    e.target ===
                    e.currentTarget
                ) {
                    setOpen(false);
                }
            }}
        >

            {/* ========================================================= */}
            {/* CLOSE */}
            {/* ========================================================= */}

            <button
                type="button"
                onClick={() =>
                    setOpen(false)
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


            {/* ========================================================= */}
            {/* IMAGE / SWIPE AREA */}
            {/* ========================================================= */}

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
                    src={getSrc(current)}
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


            {/* ========================================================= */}
            {/* PREVIOUS - DESKTOP */}
            {/* ========================================================= */}

            {index > 0 && (
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


            {/* ========================================================= */}
            {/* NEXT - DESKTOP */}
            {/* ========================================================= */}

            {index <
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


            {/* ========================================================= */}
            {/* COUNTER */}
            {/* ========================================================= */}

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
                    {index + 1}
                    {" / "}
                    {media.length}
                </div>
            )}

        </div>
    );
}