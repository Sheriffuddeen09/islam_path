import React, {
    useEffect,
    useState
} from "react";

import {
    CalendarDays,
    Clock,
    MapPin,
    BriefcaseBusiness,
    Loader2,
    CheckCircle2
} from "lucide-react";

import {
    useParams
} from "react-router-dom";

import api from "../Api/axios";


export default function JobInterview() {

    const {
        token
    } = useParams();


    const [interview, setInterview] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    useEffect(() => {

        const fetchInterview = async () => {

            try {

                const response =
                    await api.get(
                        `/api/job-interviews/${token}`
                    );

                setInterview(
                    response.data.interview
                );

            } catch (error) {

                console.error(
                    error
                );

            } finally {

                setLoading(false);

            }

        };


        fetchInterview();

    }, [token]);


    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                "
            >

                <Loader2
                    size={40}
                    className="
                        animate-spin
                        text-blue-600
                    "
                />

            </div>

        );

    }


    if (!interview) {

        return (

            <div
                className="
                    min-h-screen
                    flex
                    items-center
                    justify-center
                    px-4
                "
            >

                <div
                    className="
                        text-center
                        bg-white
                        border
                        rounded-3xl
                        p-10
                        max-w-md
                    "
                >

                    <h1
                        className="
                            text-2xl
                            font-bold
                        "
                    >

                        Interview Not Found

                    </h1>

                    <p
                        className="
                            text-gray-500
                            mt-2
                        "
                    >

                        This interview link may be
                        invalid or no longer available.

                    </p>

                </div>

            </div>

        );

    }


    const application =
        interview.application;

    const job =
        application?.job;


    return (

        <div
            className="
                min-h-screen
                bg-[var(--bg-color)]
                text-[var(--text-color)]
                px-4
                py-16 sm:py-24
            "
        >

            <div
                className="
                    max-w-2xl
                    mx-auto
                "
            >

                <div
                    className="
                        rounded-3xl
                        border
                        shadow-sm
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            bg-green-600
                            text-white
                            p-8
                            text-center
                        "
                    >

                        <CheckCircle2
                            size={55}
                            className="
                                mx-auto
                            "
                        />

                        <h1
                            className="
                                text-2xl
                                font-bold
                                mt-4
                            "
                        >

                            Interview Scheduled

                        </h1>

                        <p
                            className="
                                text-green-100
                                mt-2
                            "
                        >

                            Your application has been
                            accepted.

                        </p>

                    </div>


                    <div
                        className="
                            p-6
                            sm:p-8
                            space-y-6
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-sm
                                "
                            >

                                Applicant

                            </p>

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                "
                            >

                                {
                                    application?.user?.first_name
                                }

                                {" "}

                                {
                                    application?.user?.last_name
                                }

                            </h2>

                        </div>


                        <div
                            className="
                                rounded-2xl
                                border-blue-500 border
                                p-5
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <BriefcaseBusiness
                                    size={20}
                                    className="
                                        text-blue-600
                                    "
                                />

                                <div>

                                    <p
                                        className="
                                            text-xs
                                        "
                                    >

                                        Position

                                    </p>

                                    <p
                                        className="
                                            font-bold
                                        "
                                    >

                                        {
                                            job?.title
                                        }

                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    mt-5
                                "
                            >

                                <MapPin
                                    size={20}
                                    className="
                                        text-blue-600
                                    "
                                />

                                <div>

                                    <p
                                        className="
                                            text-xs
                                        "
                                    >

                                        Location

                                    </p>

                                    <p
                                        className="
                                            font-semibold
                                        "
                                    >

                                        {
                                            job?.location
                                            || "Remote"
                                        }

                                    </p>

                                </div>

                            </div>

                        </div>


                        <div
                            className="
                                grid
                                sm:grid-cols-2
                                gap-4
                            "
                        >

                            <div
                                className="
                                    bordr border-blue-500
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <CalendarDays
                                    className="
                                        text-blue-600
                                    "
                                />

                                <p
                                    className="
                                        text-xs
                                        mt-3
                                    "
                                >

                                    Interview Date

                                </p>

                                <p
                                    className="
                                        font-bold
                                        mt-1
                                    "
                                >

                                    {
                                        new Date(
                                            interview.interview_date
                                        ).toLocaleDateString(
                                            undefined,
                                            {
                                                weekday:
                                                    "long",

                                                year:
                                                    "numeric",

                                                month:
                                                    "long",

                                                day:
                                                    "numeric"
                                            }
                                        )
                                    }

                                </p>

                            </div>


                            <div
                                className="
                                    border border-blue-500
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <Clock
                                    className="
                                        text-purple-600
                                    "
                                />

                                <p
                                    className="
                                        text-xs
                                        mt-3
                                    "
                                >

                                    Interview Time

                                </p>

                                <p
                                    className="
                                        font-bold
                                        mt-1
                                    "
                                >

                                    {
                                        interview.interview_time
                                    }

                                </p>

                            </div>

                        </div>


                        {interview.notes && (

                            <div
                                className="
                                    border border-blue-500
                                    rounded-2xl
                                    p-5
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        font-bold
                                    "
                                >

                                    Interview Notes

                                </p>

                                <p
                                    className="
                                        whitespace-pre-line
                                        mt-2
                                    "
                                >

                                    {
                                        interview.notes
                                    }

                                </p>

                            </div>

                        )}


                      {interview.is_expired ? (

                    <div
                        className="
                            w-full
                            bg-gray-400
                            text-white
                            rounded-xl
                            py-4
                            font-bold
                            text-center
                            cursor-not-allowed
                        "
                    >

                        Interview Link Expired

                    </div>

                ) : (

                    <a
                        href={
                            interview.call_link?.startsWith("http")
                                ? interview.call_link
                                : `https://${interview.call_link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            block
                            w-full
                            text-center
                            bg-green-600
                            hover:bg-green-700
                            text-white
                            rounded-xl
                            py-4
                            font-bold
                            transition
                        "
                    >

                        Join Google Meet

                    </a>

                )}
                    </div>

                </div>

            </div>

        </div>

    );
}