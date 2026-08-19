import React, { useState } from "react";
import api from "../../Api/axios";

const backgrounds = [
    {
        name: "Black",
        value: "#000000",
    },
    {
        name: "Dark",
        value: "#111827",
    },
    {
        name: "Purple",
        value: "#7c3aed",
    },
    {
        name: "Blue",
        value: "#2563eb",
    },
    {
        name: "Pink",
        value: "#db2777",
    },
    {
        name: "Red",
        value: "#dc2626",
    },
    {
        name: "Green",
        value: "#059669",
    },
    {
        name: "Orange",
        value: "#ea580c",
    },
    {
        name: "Yellow",
        value: "#ca8a04",
    },
];

const fonts = [
    {
        name: "Inter",
        value: "Inter",
    },
    {
        name: "Poppins",
        value: "Poppins",
    },
    {
        name: "Arial",
        value: "Arial",
    },
    {
        name: "Georgia",
        value: "Georgia",
    },
    {
        name: "Times New Roman",
        value: "Times New Roman",
    },
    {
        name: "Courier New",
        value: "Courier New",
    },
    {
        name: "Verdana",
        value: "Verdana",
    },
];

const CreateReel = ({ onClose, onCreated }) => {

    const [content, setContent] = useState("");

    const [visibility, setVisibility] =
        useState("public");

    const [backgroundColor, setBackgroundColor] =
        useState("#111827");

    const [font, setFont] =
        useState("Poppins");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!content.trim()) {
            setError("Please enter something for your reel.");
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await api.post(
                "/api/reels",
                {
                    content: content.trim(),

                    visibility,

                    background_color:
                        backgroundColor,

                    font,
                }
            );

            if (onCreated) {
                onCreated(response.data.post);
            }

            setContent("");

            if (onClose) {
                onClose();
            }

        } catch (error) {

            console.error(
                "Failed to create reel:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create reel."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="w-full">

            <div
                className="relative min-h-[420px] rounded-2xl overflow-hidden flex items-center justify-center p-8"
                style={{
                    backgroundColor,
                    fontFamily: font,
                }}
            >

                <textarea
                    value={content}
                    onChange={(e) =>
                        setContent(e.target.value)
                    }
                    placeholder="Write something..."
                    maxLength={5000}
                    className="
                        w-full
                        max-w-2xl
                        min-h-[250px]
                        bg-transparent
                        border-none
                        outline-none
                        resize-none
                        text-white
                        text-center
                        text-3xl
                        md:text-4xl
                        font-medium
                        placeholder:text-white/60
                    "
                    style={{
                        fontFamily: font,
                    }}
                />

            </div>

            {error && (
                <div className="mt-3 rounded-lg bg-red-100 text-red-600 px-4 py-3">
                    {error}
                </div>
            )}

            {/* Background */}

            <div className="mt-5">

                <h3 className="font-semibold mb-3">
                    Background
                </h3>

                <div className="flex flex-wrap gap-3">

                    {backgrounds.map((background) => (

                        <button
                            key={background.value}
                            type="button"
                            onClick={() =>
                                setBackgroundColor(
                                    background.value
                                )
                            }
                            title={background.name}
                            className={`
                                w-10
                                h-10
                                rounded-full
                                border-2
                                transition
                                ${
                                    backgroundColor ===
                                    background.value
                                        ? "border-black scale-110"
                                        : "border-transparent"
                                }
                            `}
                            style={{
                                backgroundColor:
                                    background.value,
                            }}
                        />

                    ))}

                </div>

            </div>

            {/* Font */}

            <div className="mt-5">

                <h3 className="font-semibold mb-3">
                    Font
                </h3>

                <div className="flex flex-wrap gap-2">

                    {fonts.map((item) => (

                        <button
                            key={item.value}
                            type="button"
                            onClick={() =>
                                setFont(item.value)
                            }
                            className={`
                                px-4
                                py-2
                                rounded-lg
                                border
                                transition
                                ${
                                    font === item.value
                                        ? "bg-black text-white"
                                        : "bg-white text-gray-700"
                                }
                            `}
                            style={{
                                fontFamily:
                                    item.value,
                            }}
                        >
                            {item.name}
                        </button>

                    ))}

                </div>

            </div>

            {/* Visibility */}

            <div className="mt-5">

                <label className="block font-semibold mb-2">
                    Visibility
                </label>

                <select
                    value={visibility}
                    onChange={(e) =>
                        setVisibility(e.target.value)
                    }
                    className="
                        w-full
                        border
                        rounded-lg
                        px-4
                        py-3
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
                        Private
                    </option>

                </select>

            </div>

            {/* Submit */}

            <div className="mt-6 flex justify-end gap-3">

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            px-5
                            py-3
                            rounded-lg
                            border
                        "
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="
                        px-6
                        py-3
                        rounded-lg
                        bg-black
                        text-white
                        disabled:opacity-50
                    "
                >
                    {loading
                        ? "Publishing..."
                        : "Publish Reel"}
                </button>

            </div>

        </div>
    );
};

export default CreateReel;