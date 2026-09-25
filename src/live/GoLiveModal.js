import { useEffect, useState } from "react";
import { X, Radio, Video, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../Api/axios";

export default function GoLiveModal({
    showLiveModal,
    setShowLiveModal,
    setLiveData,
    setLivePost,
    setIsLive,
}) {
    const [liveDescription, setLiveDescription] = useState("");
    const [startingLive, setStartingLive] = useState(false);
 

    useEffect(() => {
        if (!showLiveModal) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !startingLive) {
                setShowLiveModal(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showLiveModal, startingLive, setShowLiveModal]);
 

    const startLive = async () => {
        if (startingLive) return;

        setStartingLive(true);

        try {
            const response = await api.post("/api/live/start", {
                content: liveDescription,
            });

            setLiveData(response.data.live);
            setLivePost(response.data.post);
            setIsLive(true);

            setLiveDescription("");
            setShowLiveModal(false);

            toast.success("You are now live!");
        } catch (error) {
            console.error("Start live error:", error);

            toast.error(
                error.response?.data?.message ||
                "Unable to start live video"
            );
        } finally {
            setStartingLive(false);
        }
    };
 

    return (
        <div
            className="
            lg:ml-72
            "
        >

           
            <div
                className="
                    relative
                    w-full max-w-2xl
                    overflow-hidden
                    rounded-3xl
                    bg-[var(--bg-color)]
                    text-[var(--text-color)]
                    shadow-2xl
                    border border-black/10 dark:border-white/10
                "
                onMouseDown={(e) => e.stopPropagation()}
            >
 
                <div className="relative overflow-hidden">


                    <div
                        className="
                            absolute inset-0
                            bg-gradient-to-br
                            from-red-600
                            via-red-500
                            to-red-700
                            opacity-10
                        "
                    />

                    <div className="relative p-5 pb-4">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div
                                    className="
                                        flex h-11 w-11
                                        items-center justify-center
                                        rounded-2xl
                                        bg-red-600
                                        text-white
                                        shadow-lg
                                        shadow-red-600/20
                                    "
                                >
                                    <Radio
                                        size={22}
                                        strokeWidth={2.5}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">

                                        <h2 className="text-lg font-bold">
                                            Go Live
                                        </h2>

                                        <span
                                            className="
                                                flex items-center gap-1.5
                                                rounded-full
                                                bg-red-500/10
                                                px-2 py-0.5
                                                text-[10px]
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-red-500
                                            "
                                        >
                                            <span
                                                className="
                                                    h-1.5 w-1.5
                                                    rounded-full
                                                    bg-red-500
                                                    animate-pulse
                                                "
                                            />

                                            LIVE
                                        </span>

                                    </div>

                                    <p className="mt-0.5 text-xs opacity-60">
                                        Share what is happening with your audience
                                    </p>
                                </div>

                            </div>
 
                        </div>

                    </div>
                </div>
 
                <div className="px-5 pb-5">


                    <div
                        className="
                            mb-4
                            flex items-start gap-3
                            rounded-2xl
                            border
                            border-red-500/10
                            bg-red-500/5
                            p-3
                        "
                    >

                        <div
                            className="
                                mt-0.5
                                flex h-8 w-8
                                shrink-0
                                items-center justify-center
                                rounded-xl
                                bg-red-500/10
                                text-red-500
                            "
                        >
                            <Video size={17} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold">
                                You're about to go live
                            </p>

                            <p className="mt-0.5 text-xs leading-5 opacity-60">
                                Add a short description so people know
                                what your live stream is about.
                            </p>
                        </div>

                    </div>


                    <div>

                        <div className="mb-2 flex items-center justify-between">

                            <label
                                htmlFor="live-description"
                                className="text-sm font-semibold"
                            >
                                Live description
                            </label>

                            <span
                                className={`
                                    text-xs
                                    ${
                                        liveDescription.length >= 650
                                            ? "text-red-500"
                                            : "opacity-50"
                                    }
                                `}
                            >
                                {liveDescription.length}/700
                            </span>

                        </div>

                        <div className="relative">

                            <textarea
                                id="live-description"
                                value={liveDescription}
                                onChange={(e) =>
                                    setLiveDescription(e.target.value)
                                }
                                maxLength={700}
                                rows={5}
                                disabled={startingLive}
                                placeholder="What do you want to talk about?"
                                className="
                                    w-full
                                    resize-none
                                    rounded-2xl
                                    border
                                    border-black/10
                                    dark:border-white/10
                                    bg-black/[0.02]
                                    dark:bg-white/[0.03]
                                    p-4
                                    text-sm
                                    leading-6
                                    outline-none
                                    transition
                                    placeholder:opacity-40
                                    focus:border-red-500
                                    focus:ring-2
                                    focus:ring-red-500/10
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    scrollbar-thin
                                    scrollbar-thumb-gray-300
                                    scrollbar-track-transparent
                                "
                            />

                        </div>

                    </div>
 
                    <div
                        className="
                            mt-4
                            flex items-center gap-2
                            text-[11px]
                            opacity-50
                        "
                    >
                        <ShieldCheck size={15} />

                        <span>
                            Make sure your live stream follows our community guidelines.
                        </span>
                    </div>
 
                    <button
                        type="button"
                        onClick={startLive}
                        disabled={startingLive || !liveDescription}
                        className="
                            group
                            mt-5
                            flex w-full
                            items-center justify-center gap-2.5
                            rounded-2xl
                            bg-red-600
                            py-3.5
                            text-sm
                            font-bold
                            text-white
                            shadow-lg
                            shadow-red-600/20
                            transition-all
                            hover:bg-red-700
                            hover:shadow-xl
                            hover:shadow-red-600/25
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-70
                            disabled:active:scale-100
                        "
                    >

                        {startingLive ? (
                            <>
                                <Loader2
                                    size={19}
                                    className="animate-spin"
                                />

                                <span>
                                    Starting Live
                                </span>
                            </>
                        ) : (
                            <>
                                <Radio
                                    size={19}
                                    strokeWidth={2.5}
                                    className="transition-transform group-hover:scale-110"
                                />

                                <span>
                                    Start Live
                                </span>
                            </>
                        )}

                    </button>

                    <button
                        type="button"
                        disabled={startingLive}
                        onClick={() => setShowLiveModal(false)}
                        className="
                            mt-3
                            w-full
                            rounded-xl
                            py-2
                            text-xs
                            font-medium
                            opacity-60
                            transition
                            hover:bg-black/5
                            hover:opacity-100
                            dark:hover:bg-white/5
                            disabled:cursor-not-allowed
                            disabled:opacity-30
                        "
                    >
                        Cancel
                    </button>

                </div>

            </div>
        </div>
    );
}