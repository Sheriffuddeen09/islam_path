import React, { useState } from "react";
import toast from "react-hot-toast";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import api from "../Api/axios";

const AskQuestionModal = ({
    owner,
    categories = [],
    onClose,
}) => {
    const [category, setCategory] = useState(categories[0] || "");
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!category) {
            toast.error("Please select a question category.");
            return;
        }

        if (!question.trim()) {
            toast.error("Please enter your question.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/api/upgrade-questions",
                {
                    owner_id: owner.id,
                    category,
                    question: question.trim(),
                },
                {
                    withCredentials: true,
                }
            );

            toast.success(
                response.data.message || "Question submitted successfully."
                );

            setQuestion("");
            onClose();
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to submit your question."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-3">

        <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* Header - Fixed */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">

                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                        <MessageCircle
                            className="text-green-600"
                            size={23}
                        />
                    </div>

                    <div className="min-w-0">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            Ask a Question
                        </h2>

                        <p className="text-sm text-gray-500 truncate">
                            Ask {owner.first_name}{" "}
                            {owner.last_name}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 shrink-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar scrollbar-thumb-gray-200 
        scrollbar-track-transparent scrollbar-thin ">

                <form
                    onSubmit={handleSubmit}
                    className="p-5 space-y-5"
                >

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            Question Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {categories.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Question */}
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            Your Question
                        </label>

                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Write your question here..."
                            rows={6}
                            maxLength={5000}
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-gray-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-green-500"
                        />

                        <div className="text-right text-xs text-gray-500 mt-1">
                            {question.length}/5000
                        </div>
                    </div>

                    {/* Pending message */}
                    <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-300">
                        Your question will be reviewed and answered by the Question Page owner before it is published.
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !question.trim() || !category}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Sending.
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Submit Question
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    </div>
);

};

export default AskQuestionModal;