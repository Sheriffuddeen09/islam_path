import { useRef } from "react";

export default function MediaItem({
    file,
    index,
    openPreview,
    msg,
    toggleSelect,
    onLongPress,
}) {
    const longPressTimer = useRef(null);
    const longPressTriggered = useRef(false);
    const touchStartX = useRef(0);
    const touchMoved = useRef(false);

    const getUrl = (f) => {
        if (f?.file_url?.startsWith("blob:")) {
            return f.file_url;
        }

        if (f?.file?.startsWith("blob:")) {
            return f.file;
        }

        if (f?.file_url?.startsWith("http")) {
            return f.file_url;
        }

        if (f?.file_url) {
            return `http://localhost:8000/storage/${f.file_url}`;
        }

        if (f?.file) {
            return `http://localhost:8000/storage/${f.file}`;
        }

        return null;
    };

    const url = getUrl(file);

    const isVideo = file?.type === "video";

    const handleTouchStart = (e) => {
        e.stopPropagation();

        clearTimeout(longPressTimer.current);

        longPressTriggered.current = false;
        touchMoved.current = false;

        touchStartX.current = e.touches[0].clientX;

        longPressTimer.current = setTimeout(() => {
            longPressTriggered.current = true;

            // 🔥 IMPORTANT:
            // Let the parent decide what long press does.
            if (onLongPress && msg) {
                onLongPress(msg);
            }

        }, 800);
    };

    const handleTouchMove = (e) => {
        e.stopPropagation();

        const currentX = e.touches[0].clientX;

        const diff = currentX - touchStartX.current;

        if (Math.abs(diff) > 10) {
            touchMoved.current = true;

            clearTimeout(longPressTimer.current);
        }
    };

    const handleTouchEnd = (e) => {
        e.stopPropagation();

        clearTimeout(longPressTimer.current);

        // Long press already happened
        if (longPressTriggered.current) {
            return;
        }

        // Finger moved
        if (touchMoved.current) {
            return;
        }
    };

    const handleTouchCancel = (e) => {
        e.stopPropagation();

        clearTimeout(longPressTimer.current);

        longPressTriggered.current = false;
        touchMoved.current = false;
    };

    const handleClick = (e) => {
        e.stopPropagation();

        // Browser generates click after long press
        if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
        }

        openPreview(index);
    };

    return (
        <div
            className="
                relative
                cursor-pointer
                w-full
                h-full
                select-none
                touch-manipulation
            "
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onClick={handleClick}
        >
            {isVideo ? (
                <video
                    src={url}
                    className="w-full h-full object-cover pointer-events-none"
                    preload="auto"
                    muted
                    loop
                    playsInline
                    onLoadedData={(e) => {
                        e.currentTarget.currentTime = 0.1;
                    }}
                />
            ) : (
                <img
                    src={url}
                    className="w-full h-full object-cover pointer-events-none"
                    alt=""
                    draggable={false}
                />
            )}

            {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/50 text-white p-2 rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}