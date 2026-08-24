import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    X,
    ArrowLeft,
    Image as ImageIcon,
    Pencil,
} from "lucide-react";

import api from "../../Api/axios";
import ImageCrop from "./util/ImageCrop";

export default function ReelVideoImageDescription({
    closeModal,
    onCreated,
}) {

    const [step, setStep] =
        useState(1);

    const [media, setMedia] = useState([]);

    const [selectedMedia, setSelectedMedia] =
    useState(null);

    const [visibility, setVisibility] =
        useState("public");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const videoRef =
        useRef(null);

    const [videoDuration, setVideoDuration] =
        useState(0);

    const [trimStart, setTrimStart] =
        useState(0);

    const [trimEnd, setTrimEnd] =
        useState(0);

    const [showVisibilityModal, setShowVisibilityModal] =
        useState(false);

    const [selectedIndex, setSelectedIndex] = useState(null);

    const [croppedImages, setCroppedImages] = useState([]);

    const [showCrop, setShowCrop] = useState(false);

    const [showTrimModal, setShowTrimModal] = useState(false);

    const [selectedVideoIndex, setSelectedVideoIndex] =
        useState(null);

    const [videoPreview, setVideoPreview] = useState(null);

    const [showDescriptionModal, setShowDescriptionModal] =
        useState(false);

    const [descriptionOptions, setDescriptionOptions] = useState({
        image: false,
        video: false,
    });


    const [video, setVideo] = useState(null);

    const [videoTrim, setVideoTrim] = useState({
        start: 0,
        end: 0,
    });

    const [dragType, setDragType] = useState(null);

    const [trimApplied, setTrimApplied] = useState(false);

    const trackRef = useRef(null);


    const totalReelDuration = media.reduce(
    (total, item) => {

        if (item.type === "image") {
            return total + 30;
        }

        if (item.type === "video") {

            const start =
                Number(item.trimStart || 0);

            const end =
                Number(
                    item.trimEnd ||
                    item.duration ||
                    0
                );

            return total + Math.max(
                0,
                end - start
            );
        }

        return total;
    },
    0
);


        const handleVideoLoadedMetadata = () => {

    if (!videoRef.current) {
        return;
    }

    const duration =
        videoRef.current.duration;

    setVideoDuration(duration);

    setVideoTrim({
        start: 0,
        end: Math.min(duration, 90),
    });
};


const applyVideoTrim = () => {

    if (
        selectedVideoIndex === null
    ) {
        return;
    }

    const duration =
        videoTrim.end -
        videoTrim.start;


    if (duration > 90) {

        setError(
            "Video must be 1 minute 30 seconds or less."
        );

        return;
    }


    setMedia((prev) => {

        const updated = [...prev];

        const item =
            updated[selectedVideoIndex];

        if (!item) {
            return prev;
        }

        updated[selectedVideoIndex] = {

            ...item,

            trimStart:
                videoTrim.start,

            trimEnd:
                videoTrim.end,

            trimApplied: true,

            isTrimmed:
                videoTrim.start > 0 ||
                videoTrim.end <
                    item.duration,

            duration,

        };

        return updated;
    });


    setTrimApplied(true);

    setError("");

    setShowTrimModal(false);

    setSelectedVideoIndex(null);
};



const removeSelectedVideo = () => {

    if (
        selectedVideoIndex === null
    ) {
        return;
    }

    setMedia((prev) => {

        const item =
            prev[selectedVideoIndex];

        if (item?.preview) {

            URL.revokeObjectURL(
                item.preview
            );
        }

        return prev.filter(
            (_, index) =>
                index !==
                selectedVideoIndex
        );
    });


    setShowTrimModal(false);

    setSelectedVideoIndex(null);

    setVideo(null);

    setVideoPreview(null);
};
        


const handleCropDone = (blob) => {

    if (
        !blob ||
        selectedIndex === null
    ) {
        return;
    }

    const file = new File(
        [blob],
        `image-${selectedIndex}.jpg`,
        {
            type: "image/jpeg",
        }
    );

    // Save cropped version
    setCroppedImages((prev) => {

        const updated = [...prev];

        updated[selectedIndex] = file;

        return updated;
    });


    // Create preview
    const preview =
        URL.createObjectURL(file);


    // Replace the image inside media
    setMedia((prev) =>
        prev.map((item, index) =>
            index === selectedIndex
                ? {
                    ...item,

                    file: file,

                    preview: preview,

                    type: "image",

                    duration: 30,
                }
                : item
        )
    );
};


useEffect(() => {

    if (!dragType) {
        return;
    }

    const handleMove = (e) => {

        if (!trackRef.current) {
            return;
        }

        const rect =
            trackRef.current.getBoundingClientRect();

        const clientX =
            e.touches
                ? e.touches[0].clientX
                : e.clientX;

        let percentage =
            (clientX - rect.left) /
            rect.width;

        percentage =
            Math.max(
                0,
                Math.min(1, percentage)
            );

        const time =
            percentage *
            videoDuration;


        setVideoTrim((prev) => {

            if (dragType === "left") {

                const newStart =
                    Math.min(
                        time,
                        prev.end - 0.1
                    );

                return {
                    ...prev,
                    start: Math.max(
                        0,
                        newStart
                    ),
                };
            }


            if (dragType === "right") {

                const newEnd =
                    Math.max(
                        time,
                        prev.start + 0.1
                    );

                return {
                    ...prev,
                    end: Math.min(
                        videoDuration,
                        newEnd
                    ),
                };
            }


            if (dragType === "move") {

                const length =
                    prev.end -
                    prev.start;

                let newStart =
                    time -
                    length / 2;

                newStart =
                    Math.max(
                        0,
                        Math.min(
                            videoDuration -
                                length,
                            newStart
                        )
                    );

                return {
                    start: newStart,
                    end:
                        newStart +
                        length,
                };
            }

            return prev;
        });
    };


    const handleUp = () => {

        setDragType(null);
    };


    window.addEventListener(
        "mousemove",
        handleMove
    );

    window.addEventListener(
        "mouseup",
        handleUp
    );

    window.addEventListener(
        "touchmove",
        handleMove,
        { passive: false }
    );

    window.addEventListener(
        "touchend",
        handleUp
    );


    return () => {

        window.removeEventListener(
            "mousemove",
            handleMove
        );

        window.removeEventListener(
            "mouseup",
            handleUp
        );

        window.removeEventListener(
            "touchmove",
            handleMove
        );

        window.removeEventListener(
            "touchend",
            handleUp
        );
    };

}, [
    dragType,
    videoDuration,
]);


      const getVideoDuration = (file) => {

    return new Promise((resolve, reject) => {

        const video = document.createElement("video");

        const url = URL.createObjectURL(file);

        video.preload = "metadata";

        video.onloadedmetadata = () => {

            const duration = video.duration;

            URL.revokeObjectURL(url);

            resolve(duration);
        };

        video.onerror = () => {

            URL.revokeObjectURL(url);

            reject(
                new Error("Unable to read video.")
            );
        };

        video.src = url;
    });
}; 



const handleFileSelect = async (e) => {

    const files = Array.from(
        e.target.files || []
    );

    if (!files.length) return;

    setError("");

    const newMedia = [];

    for (const file of files) {

        if (file.type.startsWith("image/")) {

            newMedia.push({
                id: crypto.randomUUID(),
                file: file,
                type: "image",
                preview: URL.createObjectURL(file),

                
                duration: 30,

                edited: false,
            });

            continue;
        }

        if (file.type.startsWith("video/")) {

            try {

                const duration =
                    await getVideoDuration(file);

                const id =
                    crypto.randomUUID();

                newMedia.push({
                    id,
                    file,
                    type: "video",
                    preview: URL.createObjectURL(file),

                    duration,

                    videoDuration: duration,

                    trimStart: 0,

                    trimEnd: Math.min(
                        duration,
                        90
                    ),

                    needsTrim: duration > 90,

                    edited: false,
                });

                if (duration > 90) {

                    setError(
                        `${file.name} is ${Math.ceil(
                            duration
                        )} seconds long. Please click Edit and trim it to 1 minute 30 seconds or less.`
                    );
                }

            } catch (error) {

                console.error(error);

                setError(
                    `Unable to process ${file.name}.`
                );
            }
        }
    }

    setMedia((prev) => [
        ...prev,
        ...newMedia,
    ]);

    e.target.value = "";
};



    const handleVideoLoaded = () => {

        if (!videoRef.current) {
            return;
        }

        const duration =
            videoRef.current.duration;

        setVideoDuration(
            duration
        );

        setTrimEnd(
            Math.min(
                duration,
                90
            )
        );
    };

   

const handleVideoTrimComplete = () => {

    if (!selectedMedia) {
        return;
    }

    const duration =
        trimEnd - trimStart;


    if (duration <= 0) {

        setError(
            "Invalid video duration."
        );

        return;
    }


    if (duration > 90) {

        setError(
            "A reel video cannot exceed 1 minute 30 seconds."
        );

        return;
    }


    setMedia((prev) =>
        prev.map((item) => {

            if (
                item.id !==
                selectedMedia.id
            ) {
                return item;
            }

            return {
                ...item,

                trimStart:
                    Number(trimStart),

                trimEnd:
                    Number(trimEnd),

                duration:
                    Math.ceil(duration),

                trimmed: true,
            };

        })
    );


    setSelectedMedia(null);

    setVideoDuration(0);

    setTrimStart(0);

    setTrimEnd(0);

    setStep(1);
};



    const handleTrimStart = (
        value
    ) => {

        const newStart =
            Number(value);

        if (
            newStart >= trimEnd
        ) {
            return;
        }

        setTrimStart(
            newStart
        );
    };


    const handleTrimEnd = (
        value
    ) => {

        const newEnd =
            Number(value);

        if (
            newEnd <= trimStart
        ) {
            return;
        }

        if (
            newEnd - trimStart >
            90
        ) {

            setError(
                "A reel video cannot be longer than 1 minute 30 seconds."
            );

            return;
        }

        setError("");

        setTrimEnd(
            newEnd
        );
    };

        const submitReel = async () => {

            try {

                setLoading(true);
                setError("");

                if (!media.length) {

                    setError(
                        "Please select at least one image or video."
                    );

                    return;
                }

                const formData = new FormData();


                const hasImages = media.some(
                    (item) => item.type === "image"
                );

                const hasVideos = media.some(
                    (item) => item.type === "video"
                );

                let reelType = "image";

                if (hasImages && hasVideos) {

                    reelType = "mixed";

                } else if (hasVideos) {

                    reelType = "video";

                }


                formData.append(
                    "reel_type",
                    reelType
                );

                media.forEach((item, index) => {

                    if (!item.file) {
                        return;
                    }


                    formData.append(
                        `media[${index}][file]`,
                        item.file
                    );


                    formData.append(
                        `media[${index}][type]`,
                        item.type
                    );


                    formData.append(
                        `media[${index}][duration]`,
                        String(
                            item.duration || 0
                        )
                    );


                    if (
                        item.description &&
                        item.description.trim()
                    ) {

                        formData.append(
                            `media[${index}][description]`,
                            item.description.trim()
                        );
                    }

                    if (
                        item.type === "video"
                    ) {

                        formData.append(
                            `media[${index}][trim_start]`,
                            String(
                                item.trimStart || 0
                            )
                        );


                        formData.append(
                            `media[${index}][trim_end]`,
                            String(
                                item.trimEnd ||
                                item.duration ||
                                0
                            )
                        );
                    }

                });

                formData.append(
                    "visibility",
                    visibility
                );

                formData.append(
                    "reel_duration",
                    String(
                        Math.ceil(
                            totalReelDuration
                        )
                    )
                );

                const response = await api.post(
                    "/api/reels",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data",
                        },
                    }
                );


                if (onCreated) {

                    onCreated(
                        response.data.post
                    );

                }


                closeModal();


            } catch (error) {

                console.error(
                    "REEL ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Unable to create reel."
                );

            } finally {

                setLoading(false);

            }

        };


         const updateMediaDescription = (mediaId, value) => {
            setMedia((prev) =>
                prev.map((item) =>
                    item.id === mediaId
                        ? {
                            ...item,
                            description: value
                        }
                        : item
                )
            );
        };


        const editMedia = (item, index) => {

    setError("");

    if (item.type === "image") {

        setSelectedIndex(index);

        setShowCrop(true);

        return;
    }


    if (item.type === "video") {

        setSelectedVideoIndex(index);

        setVideo(item.file);

        setVideoPreview(item.preview);

        setVideoDuration(
            item.videoDuration ||
            item.duration ||
            0
        );

        setVideoTrim({

            start:
                item.trimStart || 0,

            end:
                item.trimEnd ||
                Math.min(
                    item.videoDuration ||
                    item.duration ||
                    90,
                    90
                ),

        });

        setTrimApplied(
            item.trimApplied || false
        );

        setShowTrimModal(true);
    }
};



if (
    showTrimModal &&
    selectedVideoIndex !== null &&
    video
) {

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                bg-black/70
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    relative
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    w-full
                    max-w-2xl
                    max-h-[95vh]
                    overflow-y-auto
                    rounded-2xl
                    shadow-2xl
                    p-5
                "
            >

                {/* CLOSE */}

                <button
                    type="button"
                    onClick={() => {

                        setShowTrimModal(false);

                        setSelectedVideoIndex(null);

                    }}
                    className="
                        absolute
                        top-3
                        right-3
                        z-20
                        w-9
                        h-9
                        rounded-full
                        bg-gray-200
                        text-black
                        flex
                        items-center
                        justify-center
                    "
                >
                    ✕
                </button>


                {/* TITLE */}

                <div className="mb-4">

                    <h2
                        className="
                            text-xl
                            font-bold
                        "
                    >
                        {trimApplied
                            ? "Video Trimmed"
                            : "Trim Video"}
                    </h2>

                    <p
                        className="
                            text-sm
                            mt-1
                        "
                    >
                        Drag the handles to select
                        the part of the video you
                        want to upload.
                    </p>

                    {videoDuration > 90 && (
                        <p
                            className="
                                text-sm
                                text-red-500
                                font-semibold
                                mt-2
                            "
                        >
                            This video is longer than
                            1 minute 30 seconds.
                            Trim it to 90 seconds or
                            less.
                        </p>
                    )}

                </div>


                {/* VIDEO */}

                <div
                    className="
                        w-full
                        flex
                        items-center
                        justify-center
                        bg-black
                        rounded-xl
                        overflow-hidden
                    "
                >

                    <video
                        ref={videoRef}
                        src={videoPreview}
                        controls
                        playsInline
                        className="
                            w-full
                            max-h-[45vh]
                            object-contain
                        "
                        onLoadedMetadata={
                            handleVideoLoadedMetadata
                        }
                    />

                </div>


                {/* TRIM */}

                {videoDuration > 0 && (

                    <div className="mt-5">

                        <div
                            ref={trackRef}
                            className="
                                relative
                                w-full
                                h-10
                                bg-gray-800
                                rounded-xl
                                overflow-visible
                                touch-none
                                select-none
                            "
                        >

                            {/* SELECTED RANGE */}

                            <div
                                className="
                                    absolute
                                    top-0
                                    h-full
                                    bg-green-500/40
                                    border-x-2
                                    border-green-500
                                "
                                style={{
                                    left:
                                        `${
                                            (
                                                videoTrim.start /
                                                videoDuration
                                            ) * 100
                                        }%`,

                                    width:
                                        `${
                                            (
                                                (
                                                    videoTrim.end -
                                                    videoTrim.start
                                                ) /
                                                videoDuration
                                            ) * 100
                                        }%`,
                                }}
                            />


                            {/* LEFT */}

                            <div
                                onMouseDown={(e) => {

                                    e.preventDefault();

                                    setDragType("left");

                                }}

                                onTouchStart={(e) => {

                                    e.preventDefault();

                                    setDragType("left");

                                }}

                                className="
                                    absolute
                                    top-0
                                    w-4
                                    h-full
                                    bg-white
                                    rounded-md
                                    shadow-lg
                                    cursor-ew-resize
                                    z-30
                                "
                                style={{
                                    left:
                                        `${
                                            (
                                                videoTrim.start /
                                                videoDuration
                                            ) * 100
                                        }%`,

                                    transform:
                                        "translateX(-50%)",
                                }}
                            />


                            {/* RIGHT */}

                            <div
                                onMouseDown={(e) => {

                                    e.preventDefault();

                                    setDragType("right");

                                }}

                                onTouchStart={(e) => {

                                    e.preventDefault();

                                    setDragType("right");

                                }}

                                className="
                                    absolute
                                    top-0
                                    w-4
                                    h-full
                                    bg-white
                                    rounded-md
                                    shadow-lg
                                    cursor-ew-resize
                                    z-30
                                "
                                style={{
                                    left:
                                        `${
                                            (
                                                videoTrim.end /
                                                videoDuration
                                            ) * 100
                                        }%`,

                                    transform:
                                        "translateX(-50%)",
                                }}
                            />


                            {/* MOVE */}

                            <div
                                onMouseDown={(e) => {

                                    e.preventDefault();

                                    setDragType("move");

                                }}

                                onTouchStart={(e) => {

                                    e.preventDefault();

                                    setDragType("move");

                                }}

                                className="
                                    absolute
                                    top-0
                                    h-full
                                    cursor-grab
                                    active:cursor-grabbing
                                    z-20
                                    touch-none
                                "
                                style={{
                                    left:
                                        `${
                                            (
                                                videoTrim.start /
                                                videoDuration
                                            ) * 100
                                        }%`,

                                    width:
                                        `${
                                            (
                                                (
                                                    videoTrim.end -
                                                    videoTrim.start
                                                ) /
                                                videoDuration
                                            ) * 100
                                        }%`,
                                }}
                            />

                        </div>


                        {/* TIME */}

                        <div
                            className="
                                text-center
                                text-sm
                                font-semibold
                                mt-3
                            "
                        >
                            {videoTrim.start.toFixed(1)}
                            s —{" "}
                            {videoTrim.end.toFixed(1)}
                            s

                            {" "}
                            (
                            {(
                                videoTrim.end -
                                videoTrim.start
                            ).toFixed(1)}
                            s)
                        </div>


                        {/* BUTTONS */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                mt-5
                            "
                        >

                            <button
                                type="button"
                                onClick={() => {

                                    removeSelectedVideo();

                                }}
                                className="
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-red-500
                                    text-white
                                    font-semibold
                                "
                            >
                                Remove
                            </button>


                            <button
                                type="button"
                                onClick={
                                    applyVideoTrim
                                }
                                disabled={
                                    (
                                        videoTrim.end -
                                        videoTrim.start
                                    ) > 90
                                }
                                className="
                                    px-5
                                    py-2
                                    rounded-lg
                                    bg-green-600
                                    hover:bg-green-700
                                    disabled:bg-gray-400
                                    text-white
                                    font-semibold
                                "
                            >
                                Apply Trim
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

           if (
    showCrop &&
    selectedIndex !== null &&
    media[selectedIndex]?.type === "image"
) {

    const cropImage =
        croppedImages[selectedIndex] ||
        media[selectedIndex].file;

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                bg-black
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-2xl
                    h-[90vh]
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    rounded-2xl
                    overflow-hidden
                    flex
                    flex-col
                "
            >

                {/* HEADER */}

                <div
                    className="
                        shrink-0
                        flex
                        items-center
                        justify-between
                        p-4
                        border-b
                    "
                >

                    <button
                        type="button"
                        onClick={() => {

                            setShowCrop(false);

                            setSelectedIndex(null);

                        }}
                        className="
                            flex
                            items-center
                            gap-2
                            font-semibold
                        "
                    >
                        <ArrowLeft />

                        Back
                    </button>


                    <h2
                        className="
                            font-bold
                            text-lg
                        "
                    >
                        Crop Image
                    </h2>

                </div>


                {/* CROP */}

                <div
                    className="
                        flex-1
                        min-h-0
                        overflow-hidden
                    "
                >
                    <ImageCrop
                        url={media[selectedIndex].preview}
                        onCropDone={handleCropDone}
                        selectedIndex={selectedIndex}
                        setCurrentIndex={() => {
                            setShowCrop(false);
                            setSelectedIndex(null);
                        }}
                        croppedImages={croppedImages}
                        setSelectedIndex={setSelectedIndex}
                    />
                    
                </div>

            </div>

        </div>
    );
}



    if (step === 1) {

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                bg-black/70
                flex
                items-center
                justify-center
                p-3 scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
            "
        >

            <div
                className="
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    w-full
                    max-w-xl
                    rounded-2xl
                    overflow-hidden
                    max-h-[95vh]
                    flex
                    flex-col scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        p-4
                        border-b
                        shrink-0
                    "
                >

                    <h2 className="
                        text-xl
                        font-bold
                    ">
                        Create reel
                    </h2>

                    <button
                        type="button"
                        onClick={closeModal}
                    >
                        <X size={26} />
                    </button>

                </div>


                {/* BODY */}

                <div
                    className="
                        sm:p-6
                        p-3
                        overflow-y-auto
                        scrollbar
                        scrollbar-thumb-gray-200
                        scrollbar-track-transparent
                        scrollbar-thin
                    "
                >

                    {/* UPLOAD */}

                    <label
                        htmlFor="reel-file"
                        className="
                            block
                            cursor-pointer
                        "
                    >

                        <div
                            className="
                                border-2
                                border-dashed
                                rounded-2xl
                                p-8
                                text-center
                                hover:border-blue-500
                                transition
                            "
                        >

                            <div
                                className="
                                    flex
                                    justify-center
                                    mb-4
                                "
                            >

                                <div
                                    className="
                                        p-8
                                        rounded-full
                                        bg-blue-100
                                        text-blue-600
                                    "
                                >
                                    <ImageIcon
                                        className="
                                            w-20
                                            h-20
                                        "
                                    />
                                </div>

                            </div>

                            <h3 className="
                                font-bold
                                text-lg
                            ">
                                Add Media
                            </h3>

                            <p className="
                                text-sm
                                mt-1
                            ">
                                Select multiple
                                images or videos
                            </p>

                            <p className="
                                text-xs
                                mt-1
                            ">
                                Each video:
                                maximum 1:30
                            </p>

                        </div>

                    </label>


                    <input
                        id="reel-file"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={
                            handleFileSelect
                        }
                    />


                    {/* ERROR */}

                    {error && (
                        <div className="
                            mt-4
                            bg-red-100
                            text-red-600
                            rounded-lg
                            p-3
                            text-sm
                        ">
                            {error}
                        </div>
                    )}


                    {/* MEDIA */}

                    {media.length > 0 && (

                        <div className="mt-6">

                            <div className="
                                flex
                                items-center
                                justify-between
                                mb-3
                            ">

                                <h3 className="
                                    font-semibold
                                ">
                                    Selected media
                                </h3>

                                <span className="
                                    text-sm
                                ">
                                    {media.length} item
                                    {media.length !== 1
                                        ? "s"
                                        : ""}
                                </span>

                            </div>


                            <div className="
                                flex flex-wrap flex-row gap-3 mx-auto items-center
                            ">

                                {media.map(
                                    (item, index) => (

                                    <div
                                        key={item.id}
                                        className="
                                            relative
                                            aspect-[9/16]
                                            rounded-xl
                                            overflow-hidden
                                            bg-black h-28 w-36
                                        "
                                    >

                                        {item.type ===
                                        "image" ? (

                                            <img
                                                src={
                                                    item.preview
                                                }
                                                alt=""
                                                className="
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                                            />

                                        ) : (

                                            <video
                                                src={
                                                    item.preview
                                                }
                                                className="
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                                            />

                                        )}


                                        {/* NUMBER */}

                                        <div className="
                                            absolute
                                            top-2
                                            left-2
                                            w-7
                                            h-7
                                            rounded-full
                                            bg-black/70
                                            text-white
                                            flex
                                            items-center
                                            justify-center
                                            text-xs
                                            font-bold
                                        ">
                                            {index + 1}
                                        </div>


                                        {/* TYPE */}

                                        <div className="
                                            absolute
                                            bottom-2
                                            left-2
                                            bg-black/70
                                            text-white
                                            text-xs
                                            px-2
                                            py-1
                                            rounded-full
                                        ">
                                            {item.type ===
                                            "video"
                                                ? "Video"
                                                : "Image"}
                                        </div>


                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={() => {

                                                URL.revokeObjectURL(
                                                    item.preview
                                                );

                                                setMedia(
                                                    (prev) =>
                                                        prev.filter(
                                                            (
                                                                mediaItem
                                                            ) =>
                                                                mediaItem.id !==
                                                                item.id
                                                        )
                                                );

                                            }}
                                            className="
                                                absolute
                                                top-2
                                                right-2
                                                w-7
                                                h-7
                                                rounded-full
                                                bg-red-600
                                                text-white
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >
                                            <X
                                                size={14}
                                            />
                                        </button>


                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                editMedia(item, index)
                                            }
                                            className="
                                                absolute
                                                bottom-2
                                                right-2
                                                bg-blue-600
                                                hover:bg-blue-700
                                                text-white
                                                px-3
                                                py-1.5
                                                rounded-lg
                                                text-xs
                                                font-semibold
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >
                                            <Pencil
                                                size={13}
                                            />

                                            Edit
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div className="
                    p-4
                    border-t
                    shrink-0
                    flex
                    justify-end
                    gap-3
                ">

                    <button
                        type="button"
                        onClick={closeModal}
                        className="
                            px-5
                            py-2.5
                            rounded-lg
                            bg-gray-600
                            text-white
                        "
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        disabled={
                            media.length === 0
                        }
                        onClick={() =>
                            setStep(3)
                        }
                        className="
                            px-6
                            py-2.5
                            rounded-lg
                            bg-blue-600
                            text-white
                            font-semibold
                            disabled:bg-gray-400
                        "
                    >
                        Next
                    </button>

                </div>

            </div>

        </div>
    );
}
    if (
    step === 2 &&
    selectedMedia?.type === "video"
) {

    const selectedDuration =
        trimEnd - trimStart;

    return (
        <div className="
            fixed
            inset-0
            z-50
            bg-black
            text-white
            flex
            flex-col scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
        ">

            {/* HEADER */}

            <div className="
                h-16
                shrink-0
                flex
                items-center
                justify-between
                px-4
                border-b
                border-white/10 scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
            ">

                <button
                    type="button"
                    onClick={() => {

                        setSelectedMedia(null);

                        setStep(1);

                    }}
                >
                    <ArrowLeft />
                </button>


                <h2 className="
                    font-bold
                    text-xl
                ">
                    Edit video
                </h2>


                <button
                    type="button"
                    onClick={closeModal}
                >
                    <X />
                </button>

            </div>


            {/* VIDEO */}

            <div className="
                flex-1
                min-h-0
                flex
                items-center
                justify-center
                p-4
            ">

                <video
                    ref={videoRef}
                    src={
                        selectedMedia.preview
                    }
                    controls
                    playsInline
                    onLoadedMetadata={
                        handleVideoLoaded
                    }
                    className="
                        max-h-full
                        max-w-full
                        rounded-xl
                    "
                />

            </div>


            {/* CONTROLS */}

            <div className="
                bg-[#202223]
                p-4
            ">

                <div className="
                    flex
                    justify-between
                    text-sm
                    mb-3
                ">

                    <span>
                        Trim video
                    </span>

                    <span>
                        {Math.floor(
                            selectedDuration
                        )}s / 90s
                    </span>

                </div>


                {/* START */}

                <div className="mb-4">

                    <div className="
                        flex
                        justify-between
                        text-xs
                        mb-1
                    ">

                        <span>
                            Start
                        </span>

                        <span>
                            {trimStart.toFixed(1)}s
                        </span>

                    </div>


                    <input
                        type="range"
                        min="0"
                        max={Math.max(
                            0,
                            trimEnd - 0.1
                        )}
                        step="0.1"
                        value={
                            trimStart
                        }
                        onChange={(e) =>
                            handleTrimStart(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                        "
                    />

                </div>


                {/* END */}

                <div>

                    <div className="
                        flex
                        justify-between
                        text-xs
                        mb-1
                    ">

                        <span>
                            End
                        </span>

                        <span>
                            {trimEnd.toFixed(1)}s
                        </span>

                    </div>


                    <input
                        type="range"
                        min={Math.min(
                            videoDuration,
                            trimStart + 0.1
                        )}
                        max={videoDuration}
                        step="0.1"
                        value={
                            trimEnd
                        }
                        onChange={(e) =>
                            handleTrimEnd(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                        "
                    />

                </div>


                {error && (
                    <div className="
                        mt-3
                        text-red-400
                        text-sm
                    ">
                        {error}
                    </div>
                )}


                <button
                    type="button"
                    onClick={
                        handleVideoTrimComplete
                    }
                    className="
                        w-full
                        mt-4
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-3
                        rounded-xl
                        font-bold
                    "
                >
                    Trim & Continue
                </button>

            </div>

        </div>
    );
}


    return (
    <div className="
        fixed
        inset-0
        z-50
        bg-black/70
        flex
        items-center
        justify-center
        p-3
    ">

        <div className="
            w-full
            max-w-xl
            max-h-[95vh]
            overflow-y-auto
            bg-[var(--bg-color)]
            text-[var(--text-color)]
            rounded-2xl scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
        ">

            {/* HEADER */}

            <div className="
                flex
                items-center
                gap-3
                p-4
                border-b
            ">

                <button
                    type="button"
                    onClick={() =>
                        setStep(1)
                    }
                >
                    <ArrowLeft />
                </button>


                <h2 className="
                    text-xl
                    font-bold
                ">
                    New reel
                </h2>


                <button
                    type="button"
                    className="ml-auto"
                    onClick={closeModal}
                >
                    <X />
                </button>

            </div>


            {/* MEDIA PREVIEW */}

            <div className="
                p-4
            ">

                <div className="
                    flex
                    gap-3
                    overflow-x-auto
                    pb-2
                ">

                    {media.map(
                        (item, index) => (

                        <div
                            key={item.id}
                            className="
                                relative
                                shrink-0
                                w-24
                                h-40
                                rounded-xl
                                overflow-hidden
                                bg-black
                            "
                        >

                            {item.type ===
                            "image" ? (

                                <img
                                    src={
                                        item.preview
                                    }
                                    alt=""
                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />

                            ) : (

                                <video
                                    src={
                                        item.preview
                                    }
                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />

                            )}


                            <div className="
                                absolute
                                top-2
                                left-2
                                bg-black/70
                                text-white
                                rounded-full
                                w-6
                                h-6
                                flex
                                items-center
                                justify-center
                                text-xs
                            ">
                                {index + 1}
                            </div>

                        </div>

                    ))}

                </div>

            </div>


            {/* DESCRIPTION */}
<div className="px-4">

    {/* ADD DESCRIPTION BUTTON */}

    <button
        type="button"
        onClick={() =>
            setShowDescriptionModal(true)
        }
        className="
            w-full
            border
            rounded-xl
            p-4
            flex
            items-center
            justify-between
            hover:bg-gray-100
            dark:hover:bg-gray-800
            transition
        "
    >

        <div className="text-left">

            <p className="font-semibold">
                Add description
            </p>

            <p className="text-sm mt-1 opacity-70">
                Add different descriptions to your
                images or videos
            </p>

        </div>

        <span className="text-xl">
            +
        </span>

    </button>


    {/* =====================================================
        DESCRIPTION INPUTS
    ====================================================== */}

    <div className="mt-4 space-y-4">

        {media.map((item, index) => {

            /*
            |--------------------------------------------------------------------------
            | Only show input if this media type was selected
            |--------------------------------------------------------------------------
            */

            const shouldShow =
                item.type === "image"
                    ? descriptionOptions.image
                    : descriptionOptions.video;

            if (!shouldShow) {
                return null;
            }


            return (
                <div
                    key={item.id}
                    className="
                        border
                        rounded-xl
                        p-4
                    "
                >

                    {/* MEDIA TITLE */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            mb-3
                        "
                    >

                        <div>

                            <p className="
                                font-semibold
                                text-sm
                            ">
                                {item.type === "image"
                                    ? "Image"
                                    : "Video"}{" "}
                                {index + 1}
                            </p>

                            <p className="
                                text-xs
                                opacity-60
                                mt-1
                            ">
                                Add a description for
                                this{" "}
                                {item.type}.
                            </p>

                        </div>


                        <span className="
                            text-xs
                            opacity-60
                        ">
                            {(item.description || "").length}/700
                        </span>

                    </div>


                    {/* DESCRIPTION */}

                    <textarea
                        value={
                            item.description || ""
                        }
                        maxLength={700}
                        onChange={(e) =>
                            updateMediaDescription(
                                item.id,
                                e.target.value
                            )
                        }
                        placeholder={
                            item.type === "image"
                                ? "Write a description for this image..."
                                : "Write a description for this video..."
                        }
                        className="
                            w-full
                            min-h-[120px]
                            border
                            rounded-xl
                            p-4
                            bg-transparent
                            outline-none
                            resize-none
                            scrollbar
                            scrollbar-thumb-gray-200
                            scrollbar-track-transparent
                            scrollbar-thin
                        "
                    />

                </div>
            );

        })}

    </div>

</div>

            {/* VISIBILITY */}

            <div className="
                px-4
                py-4
            ">

                <button
                    type="button"
                    onClick={() =>
                        setShowVisibilityModal(
                            true
                        )
                    }
                    className="
                        w-full
                        flex
                        items-center
                        justify-between
                        border
                        rounded-xl
                        p-4
                        text-left
                    "
                >

                    <div>

                        <p className="
                            font-semibold
                        ">
                            Who can see this reel?
                        </p>

                        <p className="
                            text-sm
                            mt-1
                        ">
                            {visibility ===
                            "public"
                                ? "Public"
                                : "Friends"}
                        </p>

                    </div>


                    <span className="
                        text-xl
                    ">
                        ›
                    </span>

                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div className="
                    mx-4
                    mb-4
                    p-3
                    rounded-lg
                    bg-red-100
                    text-red-600
                ">
                    {error}
                </div>
            )}


            {/* SHARE */}

            <div className="
                p-4
                border-t
            ">

                <button
                    type="button"
                    onClick={
                        submitReel
                    }
                    disabled={
                        loading
                    }
                    className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-50
                        text-white
                        py-3
                        rounded-xl
                        font-bold
                    "
                >

                    {loading ? <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className=""
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className=""
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg> : "Share Reel"}

                </button>

            </div>

        </div>
{showDescriptionModal && (
    <div
        className="
            fixed
            inset-0
            z-[100]
            bg-black/70
            flex
            items-center
            justify-center
            p-4
        "
    >

        <div
            className="
                w-full
                max-w-md
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                rounded-2xl
                p-5
                shadow-xl
            "
        >

            <div className="
                flex
                items-center
                justify-between
                mb-5
            ">

                <h3 className="text-lg font-bold">
                    Add description
                </h3>

                <button
                    type="button"
                    onClick={() =>
                        setShowDescriptionModal(false)
                    }
                    className="
                        w-8
                        h-8
                        rounded-full
                        flex
                        items-center
                        justify-center
                        hover:bg-gray-200
                        dark:hover:bg-gray-700
                    "
                >
                    <X size={18} />
                </button>

            </div>


            <p className="text-sm  mb-4">
                Select where you want to add a description.
            </p>


            {/* IMAGE */}

            {media.some(
                item => item.type === "image"
            ) && (

                <button
                    type="button"
                    onClick={() => {
                        setDescriptionOptions(prev => ({
                            ...prev,
                            image: !prev.image,
                        }));
                    }}
                    className={`
                        w-full
                        border
                        rounded-xl
                        p-4
                        mb-3
                        flex
                        items-center
                        justify-between
                        text-left
                        transition
                        ${
                            descriptionOptions.image
                                ? "border-green-500 bg-green-500/10"
                                : "border-gray-300"
                        }
                    `}
                >

                    <div>
                        <p className="font-semibold">
                            Image description
                        </p>

                        <p className="text-xs ">
                            Description for your image
                        </p>
                    </div>

                    <div
                        className={`
                            w-6
                            h-6
                            rounded-full
                            border
                            flex
                            items-center
                            justify-center
                            ${
                                descriptionOptions.image
                                    ? "bg-green-600 border-green-600 text-white"
                                    : ""
                            }
                        `}
                    >
                        {descriptionOptions.image && "✓"}
                    </div>

                </button>
            )}


            {/* VIDEO */}

            {media.some(
                item => item.type === "video"
            ) && (

                <button
                    type="button"
                    onClick={() => {
                        setDescriptionOptions(prev => ({
                            ...prev,
                            video: !prev.video,
                        }));
                    }}
                    className={`
                        w-full
                        border
                        rounded-xl
                        p-4
                        mb-3
                        flex
                        items-center
                        justify-between
                        text-left
                        transition
                        ${
                            descriptionOptions.video
                                ? "border-green-500 bg-green-500/10"
                                : "border-gray-300"
                        }
                    `}
                >

                    <div>
                        <p className="font-semibold">
                            Video description
                        </p>

                        <p className="text-xs ">
                            Description for your video
                        </p>
                    </div>

                    <div
                        className={`
                            w-6
                            h-6
                            rounded-full
                            border
                            flex
                            items-center
                            justify-center
                            ${
                                descriptionOptions.video
                                    ? "bg-green-600 border-green-600 text-white"
                                    : ""
                            }
                        `}
                    >
                        {descriptionOptions.video && "✓"}
                    </div>

                </button>
            )}


            {/* BOTH */}

            {media.some(
                item => item.type === "image"
            ) &&
            media.some(
                item => item.type === "video"
            ) && (

                <button
                    type="button"
                    onClick={() => {
                        setDescriptionOptions({
                            image: true,
                            video: true,
                        });
                    }}
                    className="
                        w-full
                        border
                        rounded-xl
                        p-4
                        text-left
                        hover:bg-gray-100
                        dark:hover:bg-gray-800
                    "
                >

                    <p className="font-semibold">
                        Both
                    </p>

                    <p className="text-xs ">
                        Add a separate description to both
                    </p>

                </button>
            )}


            {/* CONTINUE */}

            <button
                type="button"
                disabled={
                    !descriptionOptions.image &&
                    !descriptionOptions.video
                }
                onClick={() => {
                    setShowDescriptionModal(false);
                }}
                className="
                    w-full
                    mt-5
                    bg-green-600
                    hover:bg-green-700
                    disabled:bg-gray-400
                    text-white
                    py-3
                    rounded-xl
                    font-semibold
                "
            >
                Continue
            </button>

        </div>

    </div>
)}

        {/* VISIBILITY MODAL */}

        {showVisibilityModal && (

            <div className="
                fixed
                inset-0
                z-[60]
                bg-black/70
                flex
                items-center
                justify-center
                p-3
            ">

                <div className="
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    w-full
                    max-w-md
                    rounded-xl
                    p-6
                ">

                    <h2 className="
                        text-lg
                        font-semibold
                        mb-4
                    ">
                        Who can see your reel?
                    </h2>


                    <div className="
                        space-y-3
                    ">

                        <label className="
                            flex
                            items-center
                            gap-3
                            cursor-pointer
                        ">

                            <input
                                type="radio"
                                value="public"
                                checked={
                                    visibility ===
                                    "public"
                                }
                                onChange={() =>
                                    setVisibility(
                                        "public"
                                    )
                                }
                            />

                            <div>

                                <p className="
                                    font-medium
                                ">
                                    Public
                                </p>

                                <p className="
                                    text-xs
                                    
                                ">
                                    Everyone can see
                                    this reel
                                </p>

                            </div>

                        </label>


                        <label className="
                            flex
                            items-center
                            gap-3
                            cursor-pointer
                        ">

                            <input
                                type="radio"
                                value="friends"
                                checked={
                                    visibility ===
                                    "friends"
                                }
                                onChange={() =>
                                    setVisibility(
                                        "friends"
                                    )
                                }
                            />

                            <div>

                                <p className="
                                    font-medium
                                ">
                                    Friends
                                </p>

                                <p className="
                                    text-xs
                                    
                                ">
                                    Only accepted
                                    friends
                                </p>

                            </div>

                        </label>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setShowVisibilityModal(
                                false
                            )
                        }
                        className="
                            mt-6
                            w-full
                            bg-blue-600
                            text-white
                            py-2
                            rounded-lg
                        "
                    >
                        Done
                    </button>

                </div>

            </div>

        )}

        </div>
    );
}