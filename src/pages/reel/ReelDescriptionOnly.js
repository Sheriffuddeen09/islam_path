import { useState } from "react";
import { X,  Palette, Type,} from "lucide-react";
import api from "../../Api/axios";

const backgrounds = [
    "#111827",
    "#000000",
    "#1e293b",
    "#334155",
    "#475569",
    "#7c3aed",
    "#6d28d9",
    "#2563eb",
    "#1d4ed8",
    "#0891b2",
    "#0f766e",
    "#059669",
    "#16a34a",
    "#65a30d",
    "#ca8a04",
    "#ea580c",
    "#dc2626",
    "#be123c",
    "#db2777",
    "#9333ea",
    "#c026d3",
    "#4f46e5",
    "#0369a1",
    "#164e63",
];

const fonts = [
    {
        name: "Aa",
        value: "Poppins",
    },
    {
        name: "Aa",
        value: "Inter",
    },
    {
        name: "Aa",
        value: "Arial",
    },
    {
        name: "Aa",
        value: "Helvetica",
    },
    {
        name: "Aa",
        value: "Georgia",
    },
    {
        name: "Aa",
        value: "Times New Roman",
    },
    {
        name: "Aa",
        value: "Courier New",
    },
    {
        name: "Aa",
        value: "Verdana",
    },
    {
        name: "Aa",
        value: "Trebuchet MS",
    },
    {
        name: "Aa",
        value: "Impact",
    },
    {
        name: "Aa",
        value: "Comic Sans MS",
    },
    {
        name: "Aa",
        value: "Lucida Console",
    },
    {
        name: "Aa",
        value: "Garamond",
    },
    {
        name: "Aa",
        value: "Palatino Linotype",
    },
    {
        name: "Aa",
        value: "Book Antiqua",
    },
    {
        name: "Aa",
        value: "Tahoma",
    },
    {
        name: "Aa",
        value: "Century Gothic",
    },
    {
        name: "Aa",
        value: "Arial Black",
    },
    {
        name: "Aa",
        value: "Franklin Gothic Medium",
    },
    {
        name: "Aa",
        value: "Gill Sans",
    },
    {
        name: "Aa",
        value: "Segoe UI",
    },
    {
        name: "Aa",
        value: "Calibri",
    },
    {
        name: "Aa",
        value: "Cambria",
    },
    {
        name: "Aa",
        value: "Consolas",
    },
    {
        name: "Aa",
        value: "Monaco",
    },
    {
        name: "Aa",
        value: "Brush Script MT",
    },
    {
        name: "Aa",
        value: "Copperplate",
    },
    {
        name: "Aa",
        value: "Papyrus",
    },
    {
        name: "Aa",
        value: "Rockwell",
    },
    {
        name: "Aa",
        value: "Baskerville",
    },
];


export default function ReelDescriptionOnly({
    closeModal,
    onCreated,
}) {
    const [description, setDescription] =
        useState("");

    const [backgroundColor, setBackgroundColor] =
        useState("#111827");

    const [font, setFont] =
        useState("Poppins");

    const [visibility, setVisibility] =
        useState("public");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showVisibilityModal, setShowVisibilityModal] =
    useState(false);

    const [showBackgrounds, setShowBackgrounds] =
    useState(false);

    const [showFonts, setShowFonts] =
    useState(false);

    const createReel = async () => {
        if (!description.trim()) {
            setError(
                "Please write something for your reel."
            );
            return;
        }

        try {
            setLoading(true);
            setError("");

            const formData = new FormData();

            formData.append(
                "reel_type",
                "text"
            );

            formData.append(
                "content",
                description.trim()
            );

            formData.append(
                "background_color",
                backgroundColor
            );

            formData.append(
                "font",
                font
            );

            formData.append(
                "visibility",
                visibility
            );

            // Text reels are ALWAYS 30 seconds.
            formData.append(
                "reel_duration",
                "30"
            );

            const response = await api.post(
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
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Unable to create reel."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">

            <div
                className="
                    w-full
                    max-w-xl
                    max-h-[95vh]
                    overflow-y-auto
                    rounded-2xl
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
                "
            >

                {/* HEADER */}

                <div className="flex items-center justify-between p-4 border-b">

                    <h2 className="text-xl font-bold">
                        Create text reel
                    </h2>

                    <button
                        type="button"
                        onClick={closeModal}
                    >
                        <X size={26} />
                    </button>

                </div>

                {/* PREVIEW */}

                <div className="p-4">

                    <div
                        className="
                            w-full
                            aspect-[9/16]
                            max-h-[200px]
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            p-3
                            overflow-hidden
                        "
                        style={{
                            backgroundColor,
                            fontFamily: font,
                        }}
                    >

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            maxLength={700}
                            placeholder="Write something..."
                            className="
                                w-full
                                h-full
                                bg-transparent
                                outline-none
                                resize-none
                                text-white
                                text-sm
                                text-center no-scrollbar
                                placeholder:text-white/60
                            "
                            style={{
                                fontFamily: font,
                            }}
                        />

                    </div>

                    <div
                        className={`mt-2 text-right text-sm ${
                            description.length >= 700
                                ? "text-red-500 font-semibold"
                                : "opacity-60"
                        }`}
                    >
                        {description.length >= 700
                            ? "You have reached the maximum amount"
                            : ``}
                    </div>

                </div>
                <div className="px-4 flex items-center gap-3 mb-3">

                    {/* BACKGROUND TOGGLE */}

                    <button
                        type="button"
                        onClick={() =>
                            setShowBackgrounds(
                                !showBackgrounds
                            )
                        }
                        className={`
                            w-11
                            h-11
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-white
                            transition
                            ${
                                showBackgrounds
                                    ? "bg-green-600"
                                    : "bg-gray-600"
                            }
                        `}
                        title="Background"
                    >
                        <Palette size={20} />
                    </button>


                    {/* FONT TOGGLE */}

                    <button
                        type="button"
                        onClick={() =>
                            setShowFonts(
                                !showFonts
                            )
                        }
                        className={`
                            w-11
                            h-11
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-white
                            transition
                            ${
                                showFonts
                                    ? "bg-green-600"
                                    : "bg-gray-600"
                            }
                        `}
                        title="Font"
                    >
                        <Type size={20} />
                    </button>

                </div>

                {showBackgrounds && (
    <div className="px-4 mb-4">

        <div
            className="
                flex
                flex-row
                flex-nowrap
                gap-3
                w-full
                overflow-x-auto
                pb-2
                scrollbar
                scrollbar-thumb-gray-400
                scrollbar-track-transparent
                scrollbar-thin no-scrollbar
            "
        >

            {backgrounds.map(
                (color) => (

                    <button
                        key={color}
                        type="button"
                        onClick={() =>
                            setBackgroundColor(
                                color
                            )
                        }
                        className={`
                            shrink-0
                            w-10
                            h-10
                            rounded-full
                            border-2
                            transition-all
                            ${
                                backgroundColor ===
                                color
                                    ? "border-white scale-105"
                                    : "border-transparent"
                            }
                        `}
                        style={{
                            backgroundColor:
                                color,
                        }}
                    />

                )
            )}

        </div>

    </div>
)}
{showFonts && (
    <div className="px-4 mb-4">

        <div
            className="
                flex
                flex-row
                flex-nowrap
                gap-3
                w-full
                overflow-x-auto
                pb-2
                scrollbar
                scrollbar-thumb-gray-400
                scrollbar-track-transparent
                scrollbar-thin no-scrollbar
            "
        >

            {fonts.map(
                (item) => (

                    <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                            setFont(
                                item.value
                            )
                        }
                        className={`
                            shrink-0
                            w-10
                            h-10
                            rounded-full
                            border-2
                            transition-all
                            ${
                                font ===
                                item.value
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-gray-500/20 border-gray-400/30"
                            }
                        `}
                        style={{
                            fontFamily:
                                item.value,
                        }}
                    >
                        <span className="text-sm">
                            {item.name}
                        </span>
                    </button>

                )
            )}

        </div>

    </div>
)}
                {/* WHO CAN SEE */}

                <div className="px-4 pb-4">

                    <label className="font-semibold block mb-2">
                        Who can see this reel?
                    </label>

                    <div className="relative">

                        <button
                            type="button"
                            onClick={() =>
                                setShowVisibilityModal(true)
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
                                hover:bg-gray-500/10
                                transition
                            "
                        >
                            <div>
                                <p className="font-semibold">
                                    Who can see this reel?
                                </p>

                                <p className="text-sm mt-1">
                                    {visibility === "public"
                                        ? "Public"
                                        : visibility === "friends"
                                        ? "Friends"
                                        : ""}
                                </p>
                            </div>

                            <span className="text-xl">
                                ›
                            </span>
                        </button>

                    </div>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="mx-4 mb-4 p-3 rounded-lg bg-red-100 text-red-600">
                        {error}
                    </div>
                )}

                {/* SUBMIT */}

                <div className="p-4 border-t">

                    <button
                        type="button"
                        onClick={createReel}
                        disabled={
                            loading ||
                            !description.trim()
                        }
                        className="
                            w-full
                            bg-blue-600
                            hover:bg-blue-700
                            disabled:opacity-50
                            text-white
                            font-semibold
                            py-3
                            rounded-xl
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


                            {showVisibilityModal && (
    <div
        className="
            fixed
            inset-0
            bg-black/70
            flex
            items-center
            justify-center
            z-[80]
            p-3
        "
    >

        <div
            className="
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                sm:w-96
                w-full
                rounded-xl
                p-6
                shadow-xl
            "
        >

            <h2 className="
                text-lg
                font-semibold
                mb-4
            ">
                Who can see your reel?
            </h2>


            <div className="space-y-4">

                {/* PUBLIC */}

                <label
                    className="
                        flex
                        items-center
                        gap-3
                        cursor-pointer
                        p-3
                        rounded-lg
                        hover:bg-gray-500/10
                    "
                >

                    <input
                        type="radio"
                        name="reel_visibility"
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

                        <p className="font-medium">
                            Public
                        </p>

                        <p className="text-xs opacity-60">
                            Everyone can see this reel
                        </p>

                    </div>

                </label>


                {/* FRIENDS */}

                <label
                    className="
                        flex
                        items-center
                        gap-3
                        cursor-pointer
                        p-3
                        rounded-lg
                        hover:bg-gray-500/10
                    "
                >

                    <input
                        type="radio"
                        name="reel_visibility"
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

                        <p className="font-medium">
                            Friends
                        </p>

                        <p className="text-xs opacity-60">
                            Only accepted friends
                        </p>

                    </div>

                </label>

            </div>


            {/* DONE */}

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
                    hover:bg-blue-700
                    text-white
                    py-3
                    rounded-lg
                    font-semibold
                "
            >
                Done
            </button>


            {/* CANCEL */}

            <button
                type="button"
                onClick={() =>
                    setShowVisibilityModal(
                        false
                    )
                }
                className="
                    mt-3
                    w-full
                    bg-gray-600
                    hover:bg-gray-700
                    text-white
                    py-3
                    rounded-lg
                "
            >
                Cancel
            </button>

        </div>

    </div>
)}
        </div>
    );
}