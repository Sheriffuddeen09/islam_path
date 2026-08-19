import React, { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { canvasPreview } from "../post/util/mediaHelper";
import { ArrowLeft, Check, X } from "lucide-react";

export default function ReelImageCrop({
    url,
    onCropDone,
    onBack,
    onCancel,
}) {
    const imgRef = useRef(null);

    const [crop, setCrop] = useState(null);
    const [completedCrop, setCompletedCrop] =
        useState(null);

    const onImageLoad = (e) => {
        const {
            naturalWidth,
            naturalHeight,
        } = e.currentTarget;

        setCompletedCrop({
            unit: "px",
            x: 0,
            y: 0,
            width: naturalWidth,
            height: naturalHeight,
        });
    };

    const handleDone = async () => {
        if (!imgRef.current) {
            return;
        }

        let cropToUse =
            completedCrop;

        /*
        |--------------------------------------------------------------------------
        | NO CROP = USE WHOLE IMAGE
        |--------------------------------------------------------------------------
        */

        if (
            !cropToUse ||
            !cropToUse.width ||
            !cropToUse.height
        ) {
            cropToUse = {
                unit: "px",
                x: 0,
                y: 0,
                width:
                    imgRef.current
                        .naturalWidth,
                height:
                    imgRef.current
                        .naturalHeight,
            };
        }

        const blob =
            await canvasPreview(
                imgRef.current,
                cropToUse
            );

        if (!blob) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | RETURN CROPPED IMAGE TO REEL COMPONENT
        |--------------------------------------------------------------------------
        */

        onCropDone(blob);
    };

    return (
        <div
            className="
                fixed
                inset-0
                z-[70]
                bg-black
                flex
                flex-col
            "
        >

            {/* HEADER */}

            <div
                className="
                    h-16
                    shrink-0
                    flex
                    items-center
                    justify-between
                    px-4
                    border-b
                    border-white/10
                    text-white
                "
            >

                <button
                    type="button"
                    onClick={onBack}
                    className="
                        p-2
                        rounded-full
                        hover:bg-white/10
                    "
                >
                    <ArrowLeft size={24} />
                </button>

                <h2 className="
                    font-bold
                    text-lg
                ">
                    Crop image
                </h2>

                <button
                    type="button"
                    onClick={onCancel}
                    className="
                        p-2
                        rounded-full
                        hover:bg-white/10
                    "
                >
                    <X size={24} />
                </button>

            </div>


            {/* CROP AREA */}

            <div
                className="
                    flex-1
                    min-h-0
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    p-4
                "
            >

                <ReactCrop
                    crop={crop}
                    onChange={(c) =>
                        setCrop(c)
                    }
                    onComplete={(c) =>
                        setCompletedCrop(c)
                    }
                    keepSelection
                    aspect={9 / 16}
                >

                    <img
                        ref={imgRef}
                        src={url}
                        alt="Crop reel"
                        onLoad={onImageLoad}
                        className="
                            block
                            max-w-full
                            max-h-[70vh]
                            w-auto
                            h-auto
                            object-contain
                        "
                    />

                </ReactCrop>

            </div>


            {/* BOTTOM */}

            <div
                className="
                    shrink-0
                    p-4
                    bg-[#202223]
                "
            >

                <button
                    type="button"
                    onClick={handleDone}
                    className="
                        w-full
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        py-3
                        rounded-xl
                        font-semibold
                        flex
                        items-center
                        justify-center
                        gap-2
                    "
                >

                    <Check size={20} />

                    Done

                </button>

            </div>

        </div>
    );
}