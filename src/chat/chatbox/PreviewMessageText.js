import React, { useEffect, useRef, useState } from "react";
import Linkify from "linkify-react";

export default function PreviewMessageText({ msg }) {
    const [expandedMessages, setExpandedMessages] = useState({});
    const [isTextScrolling, setIsTextScrolling] = useState(false);

    const textScrollTimer = useRef(null);
 
    const getMessageText = () => {
        if (
            typeof msg?.message === "string" &&
            msg.message.trim() !== ""
        ) {
            return msg.message.trim();
        }

        if (
            typeof msg?.description === "string" &&
            msg.description.trim() !== ""
        ) {
            return msg.description.trim();
        }

        if (Array.isArray(msg?.files)) {
            const descriptions = msg.files
                .map((file) =>
                    typeof file?.description === "string"
                        ? file.description.trim()
                        : ""
                )
                .filter(Boolean);

            if (descriptions.length > 0) {
                return descriptions.join("\n");
            }
        }

        if (
            typeof msg?.content === "string" &&
            msg.content.trim() !== ""
        ) {
            return msg.content.trim();
        }

        return "";
    };

    const messageText = getMessageText();

    const visibleLength =
        expandedMessages[msg?.id] || 700;

    const hasMoreText =
        messageText.length > visibleLength;

    const displayText = hasMoreText
        ? `${messageText.slice(0, visibleLength)}...`
        : messageText;

    const handleTextScroll = () => {
        setIsTextScrolling(true);

        clearTimeout(textScrollTimer.current);

        textScrollTimer.current = setTimeout(() => {
            setIsTextScrolling(false);
        }, 700);
    };

    useEffect(() => {
        return () => {
            clearTimeout(textScrollTimer.current);
        };
    }, []);

    if (!messageText.trim()) {
        return null;
    }

    return (
        <div
            className="
                w-full
                px-3
                pb-2
            "
        >
            <div
                className="
                    mx-auto
                    w-full
                    max-w-2xl
                    rounded-xl
                    bg-black/40
                    backdrop-blur-md
                    border
                    border-white/10
                    px-3
                    py-2.5
                "
            >
                <div
                    onScroll={handleTextScroll}
                    className={`
                        max-h-[180px]
                        overflow-y-auto
                        pr-2
                        text-sm
                        leading-6
                        text-white
                        whitespace-pre-wrap
                        scrollbar-thin
                        scrollbar-track-transparent

                        ${
                            isTextScrolling
                                ? "scrollbar-thumb-white/40"
                                : "scrollbar-thumb-transparent"
                        }
                    `}
                >
                    <Linkify
                        options={{
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className:
                                "text-blue-300 hover:underline break-words",
                        }}
                    >
                        {displayText}
                    </Linkify>

                    {hasMoreText && (
                        <button
                            type="button"
                            onClick={() =>
                                setExpandedMessages((prev) => ({
                                    ...prev,
                                    [msg.id]:
                                        (prev[msg.id] || 700) + 700,
                                }))
                            }
                            className="
                                ml-2
                                text-green-400
                                text-xs
                                font-semibold
                                hover:underline
                                whitespace-nowrap
                            "
                        >
                            See more
                        </button>
                    )}

                    {!hasMoreText &&
                        visibleLength > 700 &&
                        messageText.length > 700 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setExpandedMessages((prev) => ({
                                        ...prev,
                                        [msg.id]: 700,
                                    }))
                                }
                                className="
                                    ml-2
                                    text-green-400
                                    text-xs
                                    font-semibold
                                    hover:underline
                                    whitespace-nowrap
                                "
                            >
                                See less
                            </button>
                        )}
                </div>
            </div>
        </div>
    );
}