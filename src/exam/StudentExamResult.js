import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../Api/axios";
import { motion } from "framer-motion";
import ExamFetchPdf from "./ExamFetchPdf";
import { useAuth } from "../layout/AuthProvider";

export default function StudentExamResult() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  const {user} = useAuth()

  useEffect(() => {
    api.get(`/api/exam-results/${resultId}`)
      .then(res => setResult(res.data));
  }, [resultId]);

  if (!result) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  const percentage = (result.score / result.total_questions) * 100;

  const grade =
    percentage >= 75 ? "Excellent" :
    percentage >= 65 ? "Very Good" :
    percentage >= 50 ? "Good" :
    percentage >= 40 ? "Pass" : "Fail";

  const badgeCount =
    grade === "Excellent" ? 5 :
    grade === "Very Good" ? 3 :
    grade === "Good" ? 2 :
    grade === "Pass" ? 1 : 0;

  const gradeColor =
    grade === "Excellent" ? "text-green-600" :
    grade === "Very Good" ? "text-blue-600" :
    grade === "Good" ? "text-yellow-600" :
    grade === "Pass" ? "text-purple-600" : "text-red-600";

  return (
    <div className="max-w-5xl mx-auto p-6">
      <Link className="text-white rounded-xl text-sm mb-3 bg-gray-900 p-3" to={'/student/dashboard'}>
      Dashboard
      </Link>

      {/* HEADER */}
      <div className="text-center mt-4 mb-6">
         <div className="flex justify-around items-center flex-row ">
            <h1 className={`text-4xl font-bold ${gradeColor}`}>
              {grade} Result 🎉
            </h1>
            {user?.role === "student" && (
            <ExamFetchPdf result={result}  />
            )}
      </div>
        <p className="text-gray-900 text-lg font-bold mt-2">
          {result.student.first_name} • {result.student.last_name} 
        </p>
      </div>

      {/* SCORE */}
      <div className="bg-white shadow rounded-lg p-6 text-center mb-6">
         <p className="text-sm mt-2 text-black font-bold">
          Earn: {badgeCount} 🏅
          </p>
        <div className="flex justify-around items-center">
        <p className="text-2xl text-black font-semibold">
          Score: {result.score} / {result.total_questions}
        </p>
        <p className="text-green-600 font-semibold mt-1">
          Percentage: {percentage.toFixed(1)}%
        </p>
        </div>
        <p className="text-sm mt-2 text-black font-bold">
          Teacher: {result.exam.teacher.first_name} {result.exam.teacher.last_name}
        </p>
       
      </div>

      {/* BADGE ANIMATION */}
      <div className="flex justify-center gap-3 mb-8">
        {Array.from({ length: badgeCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.2, type: "spring" }}
            className="bg-yellow-400 text-white px-4 py-2 rounded-full font-semibold shadow"
          >
            🏅 Badge
          </motion.div>
        ))}
      </div>

      {/* QUESTIONS & ANSWERS */}
      <div className="space-y-5">
       {result.exam.questions.map((q, index) => {
  const answer = result.answers?.find(
    a => Number(a.question_id) === Number(q.id)
  );

  console.log({
    questionId: q.id,
    correct: q.correct_answer,
    student: answer?.selected_answer,
  });

  return (
    <div key={q.id} className="border rounded-lg p-4">
      <p className="font-semibold mb-2">
        {index + 1}. {q.question}
      </p>

      {["A", "B", "C", "D"].map(opt => {
        const correct = q.correct_answer?.toUpperCase();
        const chosen = answer?.selected_answer?.toUpperCase();

        const isCorrect = correct === opt;
        const isChosen = chosen === opt;

        return (
          <p
            key={opt}
            className={`pl-3 py-1 rounded ${
              isCorrect
                ? "bg-green-100 text-green-700 font-semibold"
                : isChosen
                ? "bg-red-100 text-red-700 mt-1 font-semibold"
                : "text-gray-700"
            }`}
          >
            {opt}. {q[`option_${opt.toLowerCase()}`]}
            {isCorrect && " ✅"}
            {isChosen && !isCorrect && " ❌"}
          </p>
        );
      })}
    </div>
  );
})}

      </div>
    </div>
  );
}
