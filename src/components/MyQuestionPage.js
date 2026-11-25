
import React, { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
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

    // Store each tab's questions separately.
    const [questionsByStatus, setQuestionsByStatus] = useState({
        pending: [],
        approved: [],
        rejected: [],
    });

    // Remember which tabs have already been loaded.
    const [loadedStatuses, setLoadedStatuses] = useState({
        pending: false,
        approved: false,
        rejected: false,
    });

    const [activeTab, setActiveTab] = useState("pending");
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    // Reject confirmation modal.
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const questions = (questionsByStatus[activeTab] || []).filter(
    (question) =>
        String(question.status || "").toLowerCase() === activeTab
);

    const fetchQuestions = useCallback(async (status, force = false) => {

    if (!force && loadedStatuses[status]) {
        return;
    }

    setLoading(true);

    try {
        const response = await api.get(
            "/api/my-question-page/questions",
            {
                params: { status },
                withCredentials: true,
            }
        );

        const fetchedQuestions = response.data.data || [];

        // Only save questions belonging to the requested tab.
        const filteredQuestions = fetchedQuestions.filter(
            (question) =>
                String(question.status || "").toLowerCase() === status
        );

        setQuestionsByStatus((prev) => ({
            ...prev,
            [status]: filteredQuestions,
        }));

        setLoadedStatuses((prev) => ({
            ...prev,
            [status]: true,
        }));

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to load questions."
        );
    } finally {
        setLoading(false);
    }

}, [loadedStatuses]);

    useEffect(() => {
        if (!loadedStatuses[activeTab]) {
            fetchQuestions(activeTab);
        }
    }, [activeTab, loadedStatuses, fetchQuestions]);

     

    const handleRefresh = () => {
        fetchQuestions(activeTab, true);
    };

     

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
            const response = await api.post(
                `/api/my-question-page/questions/${question.id}/approve`,
                {
                    answer,
                },
                {
                    withCredentials: true,
                }
            );

            toast.success(
                response.data.message ||
                "Question published successfully."
            );

            const approvedQuestion = {
                ...question,
                answer,
                status: "approved",
                post_id:
                    response.data.question?.post_id ??
                    response.data.post_id ??
                    question.post_id,
            };

            setQuestionsByStatus((prev) => ({
                ...prev,

                // Remove this question from Pending and Rejected.
                pending: prev.pending.filter(
                    (item) => item.id !== question.id
                ),

                rejected: prev.rejected.filter(
                    (item) => item.id !== question.id
                ),

                // Add it to Approved only if Approved was already loaded.
                approved: loadedStatuses.approved
                    ? [
                        approvedQuestion,
                        ...prev.approved.filter(
                            (item) => item.id !== question.id
                        ),
                    ]
                    : prev.approved,
            }));
            // Clear answer input.
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

    

    const openRejectModal = (question) => {
        setSelectedQuestion(question);
        setShowRejectModal(true);
    };

    

    const closeRejectModal = () => {
        if (processingId !== null) return;

        setShowRejectModal(false);
        setSelectedQuestion(null);
    };

     
    const handleReject = async () => {

        if (!selectedQuestion) return;

        const question = selectedQuestion;

        setProcessingId(question.id);

        try {
            const response = await api.post(
                `/api/my-question-page/questions/${question.id}/reject`,
                {},
                {
                    withCredentials: true,
                }
            );

            toast.success(
                response.data.message ||
                "Question rejected successfully."
            );

            const rejectedQuestion = {
                ...question,
                status: "rejected",
                post_id: null,
            };

            setQuestionsByStatus((prev) => ({
                    ...prev,

                    // Remove from Pending and Approved.
                    pending: prev.pending.filter(
                        (item) => item.id !== question.id
                    ),

                    approved: prev.approved.filter(
                        (item) => item.id !== question.id
                    ),

                    // Add to Rejected only if Rejected was already loaded.
                    rejected: loadedStatuses.rejected
                        ? [
                            rejectedQuestion,
                            ...prev.rejected.filter(
                                (item) => item.id !== question.id
                            ),
                        ]
                        : prev.rejected,
                }));
            // Clear answer input.
            setAnswers((prev) => {
                const updated = { ...prev };
                delete updated[question.id];
                return updated;
            });

            setShowRejectModal(false);
            setSelectedQuestion(null);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to reject question."
            );
        } finally {
            setProcessingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CATEGORY FORMAT
    |--------------------------------------------------------------------------
    */

    const formatCategory = (category) => {
        return category
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    /*
    |--------------------------------------------------------------------------
    | TABS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="lg:ml-64 bg-[var(--bg-color)] text-[var(--text-color)] px-2 py-4">

            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between gap-3 border-b-2 border-blue-500 pb-2 mb-6">

                    <div>
                        <h1 className="text-2xl font-bold">
                            My Question Page
                        </h1>

                        <p className="text-sm mt-1">
                            Manage questions submitted to your profile.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        title="Refresh questions"
                    >
                        <RefreshCw
                            size={18}
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>

                </div>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto mb-6">

                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap font-semibold text-sm transition ${
                                    activeTab === tab.id
                                        ? "bg-green-600 text-white"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                }`}
                            >
                                <Icon size={17} />
                                {tab.label}

                                {loadedStatuses[tab.id] && (
                                <span className="text-xs opacity-80">
                                    ({questionsByStatus[tab.id].filter(
                                        question =>
                                            String(question.status).toLowerCase() === tab.id
                                    ).length})
                                </span>
                            )}
                            </button>
                        );
                    })}

                </div>

                {/* QUESTIONS */}
                {loading ? (

                    <div className="flex justify-center py-16">
                        <Loader2
                            className="animate-spin text-green-600"
                            size={35}
                        />
                    </div>

                ) : questions.length === 0 ? (

                    <div className="rounded-2xl p-10 text-center border border-blue-200">

                        <MessageCircle
                            size={45}
                            className="mx-auto mb-4"
                        />

                        <h3 className="font-bold text-lg">
                            No {activeTab} questions
                        </h3>

                        <p className="text-sm mt-2">
                            Questions submitted to your page will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-5">

                        {questions.map((question) => (

                            <div
                                key={question.id}
                                className="rounded-2xl border border-blue-200 shadow-sm overflow-hidden"
                            >

                                <div className="p-5">

                                    {/* QUESTION HEADER */}
                                    <div className="flex items-center justify-between gap-3 mb-4">

                                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">
                                            {formatCategory(question.category)}
                                        </span>

                                        <span
                                            className={`text-xs font-semibold ${
                                                question.status === "approved"
                                                    ? "text-green-600"
                                                    : question.status === "rejected"
                                                    ? "text-red-500"
                                                    : "text-orange-500"
                                            }`}
                                        >
                                            {question.status.toUpperCase()}
                                        </span>

                                    </div>

                                    {/* ASKED BY */}
                                    <div className="flex flex-wrap items-center gap-2 text-sm mb-4">

                                        <User size={16} />

                                        <span>
                                            Asked by{" "}
                                            <strong>
                                                {question.asker
                                                    ? `${question.asker.first_name || ""} ${question.asker.last_name || ""}`.trim()
                                                    : "Deleted User"}
                                            </strong>
                                        </span>

                                        <span className="text-gray-500">
                                            {question.created_at
                                                ? new Date(question.created_at).toLocaleDateString()
                                                : ""}
                                        </span>

                                    </div>

                                    {/* QUESTION */}
                                    <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">

                                        <h3 className="font-bold mb-2">
                                            Question
                                        </h3>

                                        <p className="whitespace-pre-wrap break-words">
                                            {question.question}
                                        </p>

                                    </div>

                                    {/* APPROVED ANSWER */}
                                    {question.status === "approved" && (

                                        <div className="mt-4 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">

                                            <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">
                                                Your Answer
                                            </h3>

                                            <p className="whitespace-pre-wrap break-words">
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

                                    {/* REJECTED MESSAGE */}
                                    {question.status === "rejected" && (

                                        <div className="mt-4 rounded-xl p-4 bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-300">
                                            This question was rejected and was not published.
                                        </div>

                                    )}

                                    {/* PENDING ANSWER FORM */}
                                    {question.status === "pending" && (

                                        <div className="mt-5">

                                            <label className="block font-semibold text-sm mb-2">
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
                                                className="w-full text-black rounded-xl border border-gray-300 dark:border-gray-700 p-4 outline-none focus:ring-2 focus:ring-green-500 resize-y"
                                            />

                                            <div className="flex flex-col sm:flex-row gap-3 mt-4">

                                                {/* APPROVE */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(question)}
                                                    disabled={processingId === question.id}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
                                                >
                                                    {processingId === question.id ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Send size={18} />
                                                    )}

                                                    Approve & Publish
                                                </button>

                                                {/* REJECT */}
                                                <button
                                                    type="button"
                                                    onClick={() => openRejectModal(question)}
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

            {/* =====================================================
                REJECT CONFIRMATION MODAL
            ====================================================== */}

            {showRejectModal && selectedQuestion && (

                <div
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            closeRejectModal();
                        }
                    }}
                >

                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

                        {/* MODAL HEADER */}
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <XCircle
                                    size={23}
                                    className="text-red-600"
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                                    Reject Question
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Confirm that you want to reject this question.
                                </p>
                            </div>

                        </div>

                        {/* MODAL BODY */}
                        <div className="p-5">

                            <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-4 mb-5">

                                <p className="text-xs font-bold text-gray-500 mb-2">
                                    QUESTION
                                </p>

                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                                    {selectedQuestion.question}
                                </p>

                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                This question will be moved to your Rejected questions. It will not be published as a post.
                            </p>

                            {/* MODAL BUTTONS */}
                            <div className="flex gap-3 mt-6">

                                <button
                                    type="button"
                                    onClick={closeRejectModal}
                                    disabled={processingId === selectedQuestion.id}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={processingId === selectedQuestion.id}
                                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processingId === selectedQuestion.id ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <XCircle size={18} />
                                    )}

                                    Confirm Reject
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default MyQuestionPage;
