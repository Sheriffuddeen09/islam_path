import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useAuth } from "../layout/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import ExamFetchPdf from "./ExamFetchPdf";


export async function fetchExamResult (id) {
  const res = await api.get(
    `/api/exam-results-pdf/${id}`
  );
  return res.data;
}

export default function ExamResults() {
    const [results, setResults] = useState([]);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [loading, setLoading] = useState(false)
  

    const {user} = useAuth()
    
  
    const fetchResults = async () => {
      setLoading(true)
    try {
      const res = await api.get("/api/exam-results");
      setResults(res.data); // ✅ FIXED
    } catch (err) {
      setResults([]);
  
    } finally{
      setLoading(false)
    }
  };
  
  
    const openPreview = async (id) => {
      setLoadingPreview(true);
      try {
        const res = await api.get(`/api/exam-results/${id}`);
        setPreview(res.data);
      } catch {
        toast.error("Failed to load preview");
      } finally {
        setLoadingPreview(false);
      }
    };
  
  
   
  
    useEffect(() => {
      fetchResults();
    }, []);

  

  const percentage = (preview?.score / preview?.total_questions) * 100;

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

  
    if (loading)
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      );
  

  const content = (
     <div className="overflow-x-auto max-h-[70vh] no-scrollbar border rounded-lg shadow-md w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-white bg-white ">
                 {results.length === 0 && (
          <p className="text-gray-500 text-center p-4 whitespace-nowrap">No Exam Result available</p>
        )}
                <thead className="bg-blue-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      {user.role === "student" && ("Teacher Name")}
                      {user.role === "admin" && ("Student Name")}
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                     Course Title
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium whitespace-nowrap uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">Total Score</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      Ratio (%)
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase tracking-wider whitespace-nowrap">Preview
                      {user.role === "student" && (" & Download")}
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Remove</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-black whitespace-nowrap">
                        {user.role === "student" && (
                          <>
                            {r.teacher}
                          </>
                        )}
                        {user.role === "admin" && (
                          <>
                            {r.student}
                          </>
                        )}

                      </td>
                      <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">{r.exam_title}</td>
                      <td className="px-4 py-3 text-black whitespace-nowrap">{r.score}</td>
                      <td className="px-4 py-3 text-black whitespace-nowrap">{r.total}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{(r.score / r.total * 100).toFixed(2)}%</td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openPreview(r.id)}
                          className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
                        >
                         Preview {user.role === "student" && ('& Download')}
                        </button>
                      </td>
                     
                      <td className="px-4 py-3 whitespace-nowrap">
                       <button
                        
                          className="bg-red-600 rounded px-3 py-2 text-sm text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                         After 30 days
                        </button>
                      </td>
   
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
  );

  return (
      <div className="rounded-xl shadow lg:ml-60">
        <Toaster position="top-right" />
  
        <h2 className="font-bold bg-gray-900 text-white w-full p-3 rounded-lg text-center text-lg mb-4">
          Exam Results ({results.length})
        </h2>
  
       
  
        {content}
        
        {/* PREVIEW MODAL */}
        {preview && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                   <div className="bg-white w-full max-w-3xl rounded-lg p-6 relative overflow-x-auto max-h-[98vh] no-scrollbar border rounded-lg shadow-md w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                      <button
                        onClick={() => setPreview(null)}
                        className="absolute top-3 right-3 text-gray-500"
                      >
                        ✕
                      </button>
                   
            <div className="text-center mt-4 mb-6">
                     <div className="flex justify-around items-center flex-row ">
                        <h1 className={`text-4xl font-bold ${gradeColor}`}>
                          {grade} Result 🎉
                        </h1>
                        {user?.role === "student" && (
                        <ExamFetchPdf result={preview}  />
                        )}
                  </div>
                    
                    <p className="text-gray-900 text-lg font-bold mt-2">
                      {preview.student.first_name} • {preview.student.last_name} 
                    </p>
                  </div>
            
                  {/* SCORE */}
                  <div className="bg-white shadow rounded-lg p-6 text-center mb-6">
                     <p className="text-sm mt-2 text-black font-bold">
                      Earn: {badgeCount} 🏅
                      </p>
                    <div className="flex justify-around items-center">
                    <p className="text-2xl text-black font-semibold">
                      Score: {preview.score} / {preview.total_questions}
                    </p>
                    <p className="text-green-600 font-semibold mt-1">
                      Percentage: {percentage.toFixed(1)}%
                    </p>
                    </div>
                    <p className="text-sm mt-2 text-black font-bold">
                      Teacher: {preview.exam.teacher.first_name} {preview.exam.teacher.last_name}
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
                   {preview.exam.questions.map((q, index) => {
              const answer = preview.answers?.find(
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
                            ? "bg-red-100 mt-1 text-red-700 font-semibold"
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
                </div>
              )}
  
        {loadingPreview && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
            <div className="bg-white px-4 py-2 rounded">Loading preview…</div>
          </div>
        )}
      </div>
    );
  
}
