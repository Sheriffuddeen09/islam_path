import { useEffect, useState } from "react";
import api from "../Api/axios";
import { useAuth } from "../layout/AuthProvider";
import toast, { Toaster } from "react-hot-toast";
import AssignmentFetchPdf from "./AssignmentFetchPdf";



export async function fetchAssignmentResult(id) {
  const res = await api.get(
    `/api/assignment-results-pdf/${id}`
  );
  return res.data;
}



export default function AssignmentResults() {
    const [results, setResults] = useState([]);
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [deletePop, setDeletePop] = useState(null);
    const [loading, setLoading] = useState(false)

    const {user} = useAuth()
    
  
    const fetchResults = async () => {
      setLoading(true)
    try {
      const res = await api.get("/api/assignment-results");
      setResults(res.data); // ✅ FIXED
    } catch (err) {
      setResults([]);
  
    } finally{
      setLoading(false)
    }
  };
  
  const handleDeletePop = () =>{
  
    setDeletePop(!deletePop)
  }
  
    const openPreview = async (id) => {
      setLoadingPreview(true);
      try {
        const res = await api.get(`/api/assignment-results/${id}`);
        setPreview(res.data);
      } catch {
        toast.error("Failed to load preview");
      } finally {
        setLoadingPreview(false);
      }
    };
  
  
  
    const deleteResult = async (id) => {
          setDeleteLoading(id);
          try {
            await api.delete(`/api/assignment-results/${id}`);
            setResults(prev => prev.filter(r => r.id !== id));
            toast.success("Result removed");
            fetchResults();
      
            setDeletePop(false)
          } catch {
            toast.error("Delete failed");
          } finally {
            setDeleteLoading(null);
          }
        };

  
    useEffect(() => {
      fetchResults();
    }, []);
  
   
  
    if (loading)
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      );
  

  const content = (
     <div className="overflow-x-auto max-h-[70vh] no-scrollbar border rounded-lg shadow-md w-80 sm:w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-white bg-white">
                 {results.length === 0 && (
          <p className="text-gray-500 p-4 text-center whitespace-nowrap">No Result available</p>
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
                      <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">{r.assignment_title}</td>
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
          Assignment Results ({results.length})
        </h2>
  
       
  
        {content}
        
        {/* PREVIEW MODAL */}
        {preview && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-lg p-6 relative">
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 text-gray-500"
              >
                ✕
              </button>
           
        {user.role === "student" && (
            <span className="text-sm  mb-2">
              <strong>Teacher:</strong>{" "}
              {preview.assignment.teacher.first_name}{" "}
              {preview.assignment.teacher.last_name}
            </span>
          )}

        {user.role === "admin" && preview.student && (
        <span className="text-sm mb-2">
          <strong>Attendant Student:</strong>{" "}
          {preview.student.first_name} {preview.student.last_name}
        </span>
      )}

      
          <h3 className="text-sm mb-1">
            <strong>Course Title:</strong> {preview.assignment.title}
          </h3>

      <div className="flex items-start justify-between gap-1 text-sm text-gray-700 mb-3">
        <span>
          <strong>Score:</strong> {preview.score} / {preview.total_questions} * <strong>Ratio: {(preview.score / preview.total_questions * 100).toFixed(2)}%</strong>
        </span>

      {user.role === "student" && (
              <AssignmentFetchPdf result={preview} loadingResult={loadingPreview} />
           )}
          
        </div>

            {/* SCROLLABLE QUESTIONS */}
      <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {preview.assignment.questions.map((q, index) => {
                const answer = preview.answers.find(
                  a => a.question_id === q.id
                );

                return (
                  <div key={q.id} className="border-b pb-3">
                    <p className="font-semibold">
                      {index + 1}. {q.question}
                    </p>

                   {["A", "B", "C", "D"].map(opt => {
                const isCorrect = q.correct_answer === opt;
                const isChosen = answer?.selected_answer === opt;

                let className = "text-gray-700";

                // 🟢 Correct answer (chosen or not)
                if (isCorrect) {
                  className = "text-green-600 font-semibold";
                }

                // 🔴 Wrong answer chosen
                if (isChosen && !isCorrect) {
                  className = "text-red-600 font-semibold";
                }

                return (
                  <p key={opt} className={className}>
                    {opt}. {q[`option_${opt.toLowerCase()}`]}
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
