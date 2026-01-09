import { useState } from "react";
import api from "../Api/axios";
import QuestionBuilder from "./QuestionBuilder";
import CopyLinkModal from "./CopyLinkModal";
import toast, { Toaster } from "react-hot-toast";

export default function CreateAssignment() {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [questions, setQuestions] = useState([]);
  const [duration, setDuration] = useState(30);

  const [loading, setLoading] = useState(false);

  const [showQuestions, setShowQuestions] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [assignmentLink, setAssignmentLink] = useState("");

  // Add new question
  const addQuestion = () => {
    if (questions.length >= 20) {
      toast.error("You cannot add more than 20 questions");
      return;
    }
    setQuestions(prev => [
      ...prev,
      { question: "", A: "", B: "", C: "", D: "", answer: "" },
    ]);
    setShowQuestions(true); // ensure questions section is open
  };

  // Submit assignment
  const submit = async () => {
  if (!dueAt) {
    toast.error("Please select a due date");
    return;
  }

  if (questions.length === 0) {
    toast.error("Add at least 1 question");
    return;
  }

  setLoading(true);

  const formattedDueAt = new Date(dueAt)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const res = await api.post("/api/assignments", {
      title,
      due_at: formattedDueAt,
      duration_minutes: Number(duration),
      questions,
    });

    // ✅ FIXED HERE
    const link = `${window.location.origin}/student/assignment/${res.data.access_token}`;

    await navigator.clipboard.writeText(link);

    // ✅ RESET FORM
    setTitle("");
    setDueAt("");
    setDuration(30);
    setQuestions([]);
    setShowQuestions(false);

    // ✅ OPEN MODAL
    setAssignmentLink(link);
    setShowCopyModal(true);

    toast.success("Assignment created & link copied 🎉");
  } catch (err) {
    console.error(err);
    toast.error("Failed to create assignment");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-6xl lg:ml-64 mx-auto sm:px-4 px-2 py-6 bg-gray-900 rounded-lg relative">
      {/* Toast */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Assignment</h2>
        <p className="text-sm text-white">
          Set questions, due date, and share securely with students
        </p>
      </div>

      {/* Assignment Info */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-2 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">Assignment Title</label>
          <input
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200"
            placeholder="e.g. Hadith – Fiqhu Test"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Due Date (Expired)</label>
          <input
            type="date"
            value={dueAt}
            onChange={e => setDueAt(e.target.value)}
            className="w-full mt-1 px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">Duration (minutes)</label>
          <input
            type="number"
            min="5"
            className="w-full mt-1 px-4 py-2 border rounded-lg"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />
        </div>
      </div>

      {/* Questions Section */}
        <div className="bg-gray-800 rounded-xl shadow-sm border sm:p-4 p-2 mb-4">
      {showQuestions && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-white text-lg">Questions</h3>
            <span className={`text-sm ${questions.length < 20 ? "text-red-300" : "text-green-300"}`}>
              {questions.length} / 20
            </span>
          </div>

          <div className="space-y-4 rounded-lg">
            {questions.map((q, i) => (
              <QuestionBuilder
                key={i}
                index={i}
                question={q}
                setQuestions={setQuestions}
              />
            ))}
          </div>
          </>
      )}

          <button
            onClick={addQuestion}
            className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            ➕ Add Question
          </button>
        </div>

      {/* Action Bar */}
      <div className="sticky bottom-0 border-t mt-2 py-4 flex justify-end bg-gray-900">
        <button
          onClick={submit}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          ) : (
            "Publish Assignment"
          )}
        </button>
      </div>

      {/* Copy Link Modal */}
      {showCopyModal && (
        <CopyLinkModal link={assignmentLink} onClose={() => setShowCopyModal(false)} />
      )}
    </div>
  );
}
