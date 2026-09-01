import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Api/axios";
import { FaFileAlt } from "react-icons/fa";

const PostReportUser = () => {

    const { postId } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchReport = async () => {

            try {

                const { data } =
                    await api.get(
                        `/api/post/report/${postId}`
                    );

                setReport(data);

            } catch (error) {

                console.error(
                    "FETCH REPORT ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        fetchReport();

    }, [postId]);


    if (loading) {

        return (
            <div className="flex items-center justify-center h-screen">

                <div
                    className="
                        animate-spin
                        rounded-full
                        h-12
                        w-12
                        border-t-4
                        border-blue-500
                        border-solid
                    "
                />

            </div>
        );

    }


    if (!report) {

        return (
            <div className="p-6 text-center text-red-500">
                Report not found
            </div>
        );

    }


   

    const postType =
        report.post_type ||
        report.post?.post_type ||
        "post";


    const isReel =
        postType === "reel";


    const contentTitle =
        isReel
            ? "Content"
            : "Content";


    const mediaTitle =
        isReel
            ? "Media"
            : "Media";


    const reportTitle =
        isReel
            ? "Report"
            : "Report";


    const reportDescription =
        isReel
            ? "Report details and information"
            : "Report details and information";


    return (

        <div
            className="
                min-h-screen
                bg-gray-50
                py-16
                px-4
            "
        >

            <div
                className="
                    max-w-3xl
                    mt-10
                    mx-auto
                "
            >

                {/* MAIN CARD */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-xl
                        border
                        border-gray-100
                        overflow-hidden
                    "
                >

                    {/* HEADER */}

                    <div
                        className="
                            bg-gradient-to-r
                            from-red-500
                            to-pink-500
                            px-6
                            py-6
                        "
                    >

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-white
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <FaFileAlt
                                className="text-white"
                            />

                            {reportTitle}

                        </h2>


                        <p
                            className="
                                text-red-100
                                text-sm
                                mt-1
                            "
                        >
                            {reportDescription}
                        </p>

                    </div>


                    <div
                        className="
                            p-6
                            space-y-8
                        "
                    >

                        {/* REPORTER */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                flex-wrap
                                gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        w-14
                                        h-14
                                        rounded-full
                                        bg-red-100
                                        flex
                                        items-center
                                        justify-center
                                        text-red-600
                                        font-bold
                                        text-xl
                                    "
                                >

                                    {report.reporter?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "?"}

                                </div>


                                <div>

                                    <p
                                        className="
                                            text-lg
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        {report.reporter?.name ||
                                            "Unknown reporter"}
                                    </p>


                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        {report.reporter?.email ||
                                            "No email available"}
                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    text-sm
                                    text-gray-500
                                    bg-gray-100
                                    px-4
                                    py-2
                                    rounded-full
                                "
                            >

                                {report.created_at
                                    ? new Date(
                                        report.created_at
                                    ).toLocaleString()
                                    : "Unknown date"}

                            </div>

                        </div>


                        <hr />


                        {/* REPORT TYPE */}

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    mb-2
                                "
                            >
                                Type
                            </p>


                            <span
                                className="
                                    inline-block
                                    bg-blue-100
                                    text-blue-600
                                    font-medium
                                    px-4
                                    py-1
                                    rounded-full
                                    text-sm
                                    capitalize
                                "
                            >
                                {postType}
                            </span>

                        </div>


                        {/* REASON */}

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    mb-2
                                "
                            >
                                Reason
                            </p>


                            <span
                                className="
                                    inline-block
                                    bg-red-100
                                    text-red-600
                                    font-medium
                                    px-4
                                    py-1
                                    rounded-full
                                    text-sm
                                "
                            >
                                {report.reason}
                            </span>

                        </div>


                        {/* DETAILS */}

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-medium
                                    text-gray-500
                                    mb-2
                                "
                            >
                                Details
                            </p>


                            <div
                                className="
                                    bg-gray-50
                                    border
                                    border-gray-200
                                    rounded-xl
                                    p-4
                                    text-gray-700
                                "
                            >

                                {report.details ||
                                    "No details provided"}

                            </div>

                        </div>


                        <hr />


                        {/* POST / REEL */}

                        <div className="space-y-4">

                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-500
                                        mb-1
                                    "
                                >
                                    {isReel
                                        ? "Reel ID"
                                        : "Post ID"}
                                </p>


                                <h3
                                    className="
                                        text-xl
                                        font-semibold
                                        text-gray-800
                                    "
                                >
                                    {report.post?.id ||
                                        "No ID available"}
                                </h3>

                            </div>


                            {/* CONTENT */}

                            {report.post?.content && (

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-gray-500
                                            mb-1
                                        "
                                    >
                                        {contentTitle}
                                    </p>


                                    <div
                                        className="
                                            bg-gray-50
                                            border
                                            border-gray-200
                                            rounded-xl
                                            p-4
                                            text-gray-700
                                            leading-relaxed
                                            whitespace-pre-line
                                        "
                                    >
                                        {report.post.content}
                                    </div>

                                </div>

                            )}


                            {/* MEDIA */}

                            {report.post?.media?.length > 0 && (

                                <div className="space-y-4">

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-gray-500
                                            mb-2
                                        "
                                    >
                                        {mediaTitle}
                                    </p>


                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            sm:grid-cols-2
                                            md:grid-cols-3
                                            gap-4
                                        "
                                    >

                                        {report.post.media.map(
                                            (item) => (

                                                <div
                                                    key={item.id}
                                                    className="
                                                        overflow-hidden
                                                        rounded-xl
                                                        border
                                                        border-gray-200
                                                    "
                                                >

                                                    {/* IMAGE */}

                                                    {item.type ===
                                                        "image" && (

                                                        <img
                                                            src={
                                                                item.url ||
                                                                `http://localhost:8000/storage/${item.path}`
                                                            }
                                                            alt={
                                                                isReel
                                                                    ? "Reel media"
                                                                    : "Post media"
                                                            }
                                                            className="
                                                                w-full
                                                                h-60
                                                                object-cover
                                                            "
                                                        />

                                                    )}


                                                    {/* VIDEO */}

                                                    {item.type ===
                                                        "video" && (

                                                        <video
                                                            controls
                                                            className="
                                                                w-full
                                                                h-60
                                                                object-cover
                                                            "
                                                        >

                                                            <source
                                                                src={
                                                                    item.url ||
                                                                    `http://localhost:8000/storage/${item.path}`
                                                                }
                                                                type={
                                                                    item.mime_type ||
                                                                    "video/mp4"
                                                                }
                                                            />

                                                        </video>

                                                    )}

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* SINGLE VIDEO FALLBACK */}

                            {!report.post?.media?.length &&
                                report.post?.video && (

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-gray-500
                                            mb-2
                                        "
                                    >
                                        {mediaTitle}
                                    </p>


                                    <video
                                        controls
                                        className="
                                            w-full
                                            max-h-[500px]
                                            rounded-xl
                                            object-contain
                                            bg-black
                                        "
                                    >

                                        <source
                                            src={
                                                typeof report.post.video ===
                                                "string"
                                                    ? report.post.video
                                                    : report.post.video.url
                                            }
                                            type="video/mp4"
                                        />

                                    </video>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default PostReportUser;
