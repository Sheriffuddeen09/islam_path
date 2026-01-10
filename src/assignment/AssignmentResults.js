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
    
            setResults(prev =>
              prev.filter(result => result.id !== id)
            );
            toast.success("Result deleted");
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
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Preview</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      {user.role === "student" && ("Download PDF")}
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
                          Preview
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {user.role === "student" && (
                          <AssignmentFetchPdf resultId={r.id} />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={handleDeletePop}
                          className="text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                       {deletePop && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white w-full mx-auto text-center text-sm sm:text-[15px] p-2 font-semibold text-black sm:w-96 rounded-lg p-6 relative">
        
        <span className="text-center my-10">Are you sure you want to delete this Assignment, student won't be having access to the Assignment After Delete?</span>
  
        <div className="flex gap-3 my-5 justify-center">
           {/* CANCEL */}
          <button
            onClick={() => setDeletePop(false)}
            className="px-3 py-1 bg-gray-900 text-white text-sm rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
  
          </button>
  
          {/* CONFIRM */}
          <button
            onClick={() => deleteResult(r.id)}
            disabled={deleteLoading}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded flex items-center justify-center"
          >
            
         
        
  
            {deleteLoading === r.id ? (
              <svg
                className="animate-spin h-5 w-5 text-white text-sm"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
  
            )}
          </button>
        </div>
      </div>
    </div>
  )}
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

      <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
        <span>
          <strong>Score:</strong> {preview.score} / {preview.total_questions} * <strong>Ratio: {(preview.score / preview.total_questions * 100).toFixed(2)}%</strong>
        </span>

  {/* ROLE-BASED NAME */}
          
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
