import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    X,
    ArrowLeft,
    Scissors,
    Image as ImageIcon,
    Video,
} from "lucide-react";

import Cropper from "react-easy-crop";

import api from "../../Api/axios";
import ReelImageCrop from "./ReelImageCrop";

export default function ReelVideoImageDescription({
    closeModal,
    onCreated,
}) {

    const [step, setStep] =
        useState(1);

    const [file, setFile] =
        useState(null);

    const [fileType, setFileType] =
        useState(null);

    const [preview, setPreview] =
        useState(null);

    const [description, setDescription] =
        useState("");

    const [visibility, setVisibility] =
        useState("public");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    const [crop, setCrop] =
        useState({
            x: 0,
            y: 0,
        });

    const [zoom, setZoom] =
        useState(1);

    const [croppedAreaPixels, setCroppedAreaPixels] =
        useState(null);

    const videoRef =
        useRef(null);

    const [videoDuration, setVideoDuration] =
        useState(0);

    const [trimStart, setTrimStart] =
        useState(0);

    const [trimEnd, setTrimEnd] =
        useState(0);

    const [showImageCrop, setShowImageCrop] =
    useState(false);

    const [croppedImage, setCroppedImage] =
    useState(null);


    useEffect(() => {

        if (!file) {
            setPreview(null);
            return;
        }

        const url =
            URL.createObjectURL(file);

        setPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };

    }, [file]);


    const handleFileSelect = (event) => {

    const selectedFile =
        event.target.files?.[0];

    if (!selectedFile) {
        return;
    }

    setError("");

    /*
    |--------------------------------------------------------------------------
    | IMAGE
    |--------------------------------------------------------------------------
    */

    if (
        selectedFile.type.startsWith(
            "image/"
        )
    ) {

        setFile(
            selectedFile
        );

        setFileType(
            "image"
        );

        setCroppedImage(
            null
        );

        /*
        |--------------------------------------------------------------------------
        | GO TO CROP
        |--------------------------------------------------------------------------
        */

        setShowImageCrop(
            true
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | VIDEO
    |--------------------------------------------------------------------------
    */

    if (
        selectedFile.type.startsWith(
            "video/"
        )
    ) {

        const url =
            URL.createObjectURL(
                selectedFile
            );

        const video =
            document.createElement(
                "video"
            );

        video.preload =
            "metadata";

        video.onloadedmetadata =
            () => {

                const duration =
                    video.duration;

                URL.revokeObjectURL(
                    url
                );

                if (
                    !duration ||
                    duration <= 0
                ) {

                    setError(
                        "Unable to read the video duration."
                    );

                    return;
                }

                setFile(
                    selectedFile
                );

                setFileType(
                    "video"
                );

                setVideoDuration(
                    duration
                );

                setTrimStart(0);

                setTrimEnd(
                    Math.min(
                        duration,
                        90
                    )
                );

                /*
                |--------------------------------------------------------------------------
                | VIDEO DOES NOT USE IMAGE CROP
                |--------------------------------------------------------------------------
                */

                setShowImageCrop(
                    false
                );

                setStep(2);
            };

        video.onerror = () => {

            URL.revokeObjectURL(
                url
            );

            setError(
                "This video could not be loaded."
            );
        };

        video.src = url;

        return;
    }

    setError(
        "Please select an image or video."
    );
};

const handleReelCropDone = (blob) => {

    if (!blob) {
        return;
    }
    const croppedFile =
        new File(
            [blob],
            "reel-cropped-image.jpg",
            {
                type: "image/jpeg",
            }
        );

    setFile(
        croppedFile
    );

    setCroppedImage(
        croppedFile
    );
    setShowImageCrop(
        false
    );
    setStep(3);
};

    const onCropComplete = (
        croppedArea,
        croppedAreaPixelsValue
    ) => {

        setCroppedAreaPixels(
            croppedAreaPixelsValue
        );
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


    const goToDescription = () => {

        if (!file) {
            return;
        }

        if (
            fileType === "video"
        ) {

            const duration =
                trimEnd -
                trimStart;

            if (duration <= 0) {

                setError(
                    "Please select a valid video duration."
                );

                return;
            }

            if (duration > 90) {

                setError(
                    "Video reels cannot be longer than 90 seconds."
                );

                return;
            }
        }

        setError("");

        setStep(3);
    };


    const submitReel = async () => {

        try {

            setLoading(true);

            setError("");

            const formData =
                new FormData();


            formData.append(
                "reel_type",
                fileType
            );


            if (fileType === "image") {

                formData.append(
                    "image",
                    file
                );

                formData.append(
                    "reel_duration",
                    "30"
                );

            }


            if (fileType === "video") {

                formData.append(
                    "video",
                    file
                );

                formData.append(
                    "trim_start",
                    String(
                        trimStart
                    )
                );

                formData.append(
                    "trim_end",
                    String(
                        trimEnd
                    )
                );

                formData.append(
                    "reel_duration",
                    String(
                        Math.ceil(
                            trimEnd -
                            trimStart
                        )
                    )
                );
            }

            if (
                description.trim()
            ) {

                formData.append(
                    "content",
                    description.trim()
                );
            }

            formData.append(
                "visibility",
                visibility
            );

            const response =
                await api.post(
                    "/api/reels",
                    formData
                );

            if (onCreated) {

                onCreated(
                    response.data.post
                );
            }

            closeModal();

        } catch (error) {

            console.error(
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


    if (step === 1) {

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
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    w-full
                    max-w-xl
                    rounded-2xl
                    overflow-hidden
                ">

                    {/* HEADER */}

                    <div className="
                        flex
                        items-center
                        justify-between
                        p-4
                        border-b
                    ">

                        <h2 className="
                            text-xl
                            font-bold
                        ">
                            Create reel
                        </h2>

                        <button
                            onClick={
                                closeModal
                            }
                        >
                            <X size={26} />
                        </button>

                    </div>


                    {/* SELECT */}

                    <div className="p-6">

                        <label
                            htmlFor="reel-file"
                            className="
                                block
                                cursor-pointer
                            "
                        >

                            <div className="
                                border-2
                                border-dashed
                                rounded-2xl
                                p-10
                                text-center
                                hover:border-blue-500
                                transition
                            ">

                                <div className="
                                    flex
                                    justify-center
                                    gap-4
                                    mb-4
                                ">

                                    <div className="
                                        p-4
                                        rounded-full
                                        bg-blue-100
                                        text-blue-600
                                    ">
                                        <ImageIcon />
                                    </div>

                                    <div className="
                                        p-4
                                        rounded-full
                                        bg-purple-100
                                        text-purple-600
                                    ">
                                        <Video />
                                    </div>

                                </div>

                                <h3 className="
                                    font-bold
                                    text-lg
                                ">
                                    Add image or video
                                </h3>

                                <p className="
                                    text-sm
                                    opacity-60
                                    mt-2
                                ">
                                    Choose one image
                                    or one video
                                </p>

                                <p className="
                                    text-sm
                                    opacity-60
                                    mt-1
                                ">
                                    Video maximum:
                                    1:30
                                </p>

                            </div>

                        </label>

                        <input
                            id="reel-file"
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={
                                handleFileSelect
                            }
                        />

                        {error && (
                            <div className="
                                mt-4
                                bg-red-100
                                text-red-600
                                rounded-lg
                                p-3
                            ">
                                {error}
                            </div>
                        )}

                    </div>

                </div>

            </div>
        );
    }

    if (
    showImageCrop &&
    fileType === "image" &&
    file
) {

    return (
        <ReelImageCrop
            url={URL.createObjectURL(file)}
            onCropDone={
                handleReelCropDone
            }
            onBack={() => {
                setShowImageCrop(
                    false
                );

                setFile(null);
                setFileType(null);
            }}
            onCancel={() => {
                setShowImageCrop(
                    false
                );
            }}
        />
    );
}
    if (
        step === 2 &&
        fileType === "image"
    ) {

        return (
            <div className="
                fixed
                inset-0
                z-50
                bg-black
                text-white
                flex
                flex-col
            ">

                {/* HEADER */}

                <div className="
                    h-16
                    flex
                    items-center
                    justify-between
                    px-4
                    border-b
                    border-white/10
                ">

                    <button
                        onClick={() =>
                            setStep(1)
                        }
                    >
                        <ArrowLeft />
                    </button>

                    <h2 className="
                        font-bold
                        text-xl
                    ">
                        Edit reel
                    </h2>

                    <button
                        onClick={
                            closeModal
                        }
                    >
                        <X />
                    </button>

                </div>


                {/* CROPPER */}

                <div className="
                    relative
                    flex-1
                    min-h-0
                    bg-black
                ">

                    {preview && (

                        <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            aspect={9 / 16}
                            onCropChange={
                                setCrop
                            }
                            onZoomChange={
                                setZoom
                            }
                            onCropComplete={
                                onCropComplete
                            }
                        />

                    )}

                </div>


                {/* CONTROLS */}

                <div className="
                    p-4
                    bg-[#202223]
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                        mb-4
                    ">

                        <Scissors />

                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) =>
                                setZoom(
                                    Number(
                                        e.target.value
                                    )
                                )
                            }
                            className="flex-1"
                        />

                    </div>

                    <button
                        onClick={
                            goToDescription
                        }
                        className="
                            w-full
                            bg-blue-600
                            text-white
                            py-3
                            rounded-xl
                            font-bold
                        "
                    >
                        Next
                    </button>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 2 - VIDEO EDITOR
    |--------------------------------------------------------------------------
    */

    if (
        step === 2 &&
        fileType === "video"
    ) {

        const selectedDuration =
            trimEnd -
            trimStart;

        return (
            <div className="
                fixed
                inset-0
                z-50
                bg-black
                text-white
                flex
                flex-col
            ">

                {/* HEADER */}

                <div className="
                    h-16
                    flex
                    items-center
                    justify-between
                    px-4
                    border-b
                    border-white/10
                ">

                    <button
                        onClick={() =>
                            setStep(1)
                        }
                    >
                        <ArrowLeft />
                    </button>

                    <h2 className="
                        font-bold
                        text-xl
                    ">
                        Edit reel
                    </h2>

                    <button
                        onClick={
                            closeModal
                        }
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
                    bg-black
                    p-4
                ">

                    <video
                        ref={videoRef}
                        src={preview}
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


                {/* TRIM */}

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
                            max={
                                Math.max(
                                    0,
                                    trimEnd - 0.1
                                )
                            }
                            step="0.1"
                            value={
                                trimStart
                            }
                            onChange={(e) =>
                                handleTrimStart(
                                    e.target.value
                                )
                            }
                            className="w-full"
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
                            min={
                                Math.min(
                                    videoDuration,
                                    trimStart + 0.1
                                )
                            }
                            max={
                                videoDuration
                            }
                            step="0.1"
                            value={
                                trimEnd
                            }
                            onChange={(e) =>
                                handleTrimEnd(
                                    e.target.value
                                )
                            }
                            className="w-full"
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
                        onClick={
                            goToDescription
                        }
                        className="
                            w-full
                            mt-4
                            bg-blue-600
                            text-white
                            py-3
                            rounded-xl
                            font-bold
                        "
                    >
                        Next
                    </button>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | STEP 3 - DESCRIPTION
    |--------------------------------------------------------------------------
    */

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
                rounded-2xl
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
                        onClick={() =>
                            setStep(2)
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
                        className="ml-auto"
                        onClick={
                            closeModal
                        }
                    >
                        <X />
                    </button>

                </div>


                {/* PREVIEW */}

                <div className="
                    p-4
                    flex
                    gap-4
                ">

                    <div className="
                        w-24
                        h-40
                        rounded-xl
                        overflow-hidden
                        bg-black
                        flex-shrink-0
                    ">

                        {fileType ===
                            "image" && (

                            <img
                                src={preview}
                                alt=""
                                className="
                                    w-full
                                    h-full
                                    object-cover
                                "
                            />

                        )}

                        {fileType ===
                            "video" && (

                            <video
                                src={preview}
                                className="
                                    w-full
                                    h-full
                                    object-cover
                                "
                            />

                        )}

                    </div>


                    <textarea
                        value={
                            description
                        }
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        placeholder="
                            Write a description...
                        "
                        className="
                            flex-1
                            bg-transparent
                            outline-none
                            resize-none
                            min-h-[120px]
                        "
                    />

                </div>


                {/* VISIBILITY */}

                <div className="
                    border-y
                    p-4
                ">

                    <label className="
                        font-semibold
                        block
                        mb-3
                    ">
                        Who can see this reel?
                    </label>

                    <select
                        value={
                            visibility
                        }
                        onChange={(e) =>
                            setVisibility(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            border
                            rounded-xl
                            px-4
                            py-3
                            bg-transparent
                            outline-none
                        "
                    >

                        <option value="public">
                            Public
                        </option>

                        <option value="friends">
                            Friends
                        </option>

                        <option value="private">
                            Only me
                        </option>

                    </select>

                </div>


                {/* DURATION INFO */}

                <div className="p-4">

                    <div className="
                        rounded-xl
                        bg-gray-500/10
                        border
                        p-4
                    ">

                        <div className="
                            flex
                            justify-between
                        ">

                            <span>
                                Reel duration
                            </span>

                            <strong>

                                {fileType ===
                                "image"
                                    ? "30 seconds"
                                    : `${Math.ceil(
                                        trimEnd -
                                        trimStart
                                    )} seconds`
                                }

                            </strong>

                        </div>

                    </div>

                </div>


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


                {/* SUBMIT */}

                <div className="
                    p-4
                    border-t
                ">

                    <button
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
                        {loading
                            ? "Sharing Reel..."
                            : "Share Reel"}
                    </button>

                </div>

            </div>

        </div>
    );
}