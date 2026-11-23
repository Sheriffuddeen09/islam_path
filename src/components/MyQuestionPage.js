import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
    MessageCircle,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    Loader2,
    ExternalLink,
    User,
    RefreshCw,
} from "lucide-react";

const MyQuestionPage = () => {
    const [questions, setQuestions] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    const fetchQuestions = async () => {
        setLoading(true);

        try {
            const response = await axios.get(
                "/api/my-question-page/questions",
                {
                    params: {
                        status: activeTab,
                    },
                    withCredentials: true,
                }
            );

            setQuestions(response.data.data || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to load questions."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [activeTab]);

    const handleAnswerChange = (id, value) => {
        setAnswers((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleApprove = async (question) => {
        const answer = answers[question.id]?.trim();

        if (!answer) {
            toast.error("Please provide an answer before approving.");
            return;
        }

        setProcessingId(question.id);

        try {
            const response = await axios.post(
                `/api/my-question-page/questions/${question.id}/approve`,
                {
                    answer,
                },
                {
                    withCredentials: true,
                }
            );

            toast.success(
                response.data.message || "Question published successfully."
                );

            setQuestions((prev) =>
                prev.filter((item) => item.id !== question.id)
            );

            setAnswers((prev) => {
                const updated = { ...prev };
                delete updated[question.id];
                return updated;
            });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to approve question."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (question) => {
        if (!window.confirm("Are you sure you want to reject this question?")) {
            return;
        }

        setProcessingId(question.id);

        try {
            const response = await axios.post(
                `/api/my-question-page/questions/${question.id}/reject`,
                {},
                {
                    withCredentials: true,
                }
            );

            toast.success(response.data.message || "Question rejected.");

            setQuestions((prev) =>
                prev.filter((item) => item.id !== question.id)
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to reject question."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const formatCategory = (category) => {
        return category
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const tabs = [
        {
            id: "pending",
            label: "Pending",
            icon: Clock,
        },
        {
            id: "approved",
            label: "Approved",
            icon: CheckCircle,
        },
        {
            id: "rejected",
            label: "Rejected",
            icon: XCircle,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6">

            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-6">

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Question Page
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage questions submitted to your profile.
                        </p>
                    </div>

                    <button
                        onClick={fetchQuestions}
                        disabled={loading}
                        className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <RefreshCw
                            size={18}
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto mb-6">

                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap font-semibold text-sm transition ${
                                    activeTab === tab.id
                                        ? "bg-green-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                <Icon size={17} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Questions */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2
                            className="animate-spin text-green-600"
                            size={35}
                        />
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center border border-gray-200 dark:border-gray-800">

                        <MessageCircle
                            size={45}
                            className="mx-auto text-gray-400 mb-4"
                        />

                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            No {activeTab} questions
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                            Questions submitted to your page will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">

                        {questions.map((question) => (
                            <div
                                key={question.id}
                                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                            >

                                {/* Question header */}
                                <div className="p-5">

                                    <div className="flex items-center justify-between gap-3 mb-4">

                                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                            {formatCategory(question.category)}
                                        </span>

                                        <span className={`text-xs font-semibold ${
                                            question.status === "approved"
                                                ? "text-green-600"
                                                : question.status === "rejected"
                                                ? "text-red-500"
                                                : "text-orange-500"
                                        }`}>
                                            {question.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Asked by */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">

                                        <User size={16} />

                                        <span>
                                            Asked by{" "}
                                            <strong className="text-gray-800 dark:text-gray-200">
                                                {question.asker
                                                    ? `${question.asker.first_name || ""} ${question.asker.last_name || ""}`.trim()
                                                    : "Deleted User"}
                                            </strong>
                                        </span>

                                        <span>
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {/* Question */}
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">

                                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                                            Question
                                        </h3>

                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                            {question.question}
                                        </p>
                                    </div>

                                    {/* Approved answer */}
                                    {question.status === "approved" && (
                                        <div className="mt-4 rounded-xl bg-green-50 dark:bg-green-900/20 p-4">

                                            <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">
                                                Your Answer
                                            </h3>

                                            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                                {question.answer}
                                            </p>

                                            {question.post_id && (
                                                <a
                                                    href={`/post/${question.post_id}`}
                                                    className="inline-flex items-center gap-2 mt-4 text-green-600 font-semibold text-sm"
                                                >
                                                    View Published Post
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {/* Rejected */}
                                    {question.status === "rejected" && (
                                        <div className="mt-4 text-sm text-red-500">
                                            This question was rejected.
                                        </div>
                                    )}

                                    {/* Answer form */}
                                    {question.status === "pending" && (
                                        <div className="mt-5">

                                            <label className="block font-semibold text-gray-800 dark:text-gray-200 text-sm mb-2">
                                                Your Answer
                                            </label>

                                            <textarea
                                                value={answers[question.id] || ""}
                                                onChange={(e) =>
                                                    handleAnswerChange(
                                                        question.id,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Write your answer..."
                                                rows={5}
                                                maxLength={10000}
                                                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white resize-y"
                                            />

                                            <div className="flex flex-col sm:flex-row gap-3 mt-4">

                                                <button
                                                    onClick={() => handleApprove(question)}
                                                    disabled={processingId === question.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
                                                >
                                                    {processingId === question.id ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Send size={18} />
                                                    )}

                                                    Approve & Publish
                                                </button>

                                                <button
                                                    onClick={() => handleReject(question)}
                                                    disabled={processingId === question.id}
                                                    className="flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 font-semibold px-5 py-3 rounded-xl"
                                                >
                                                    <XCircle size={18} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyQuestionPage;