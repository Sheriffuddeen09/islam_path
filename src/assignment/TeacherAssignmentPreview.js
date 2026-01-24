import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast, { Toaster } from "react-hot-toast";
import CopyLinkModal from "./CopyLinkModal";

export default function TeacherAssignmentPreview() {
  const [assignments, setAssignments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [assignmentLink, setAssignmentLink] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [blockLoadingId, setBlockLoadingId] = useState(null);
  

  const fetchAssignments = async () => {
    setLoading(true)
  try {
    const res = await api.get("/api/assignments");
    setAssignments(res.data); // ✅ FIXED
  } catch (err) {
    setAssignments([]);

  } finally{
    setLoading(false)
  }
};


  const openPreview = async (id) => {
    setLoadingPreview(true);
    try {
      const res = await api.get(`/api/teacher/assignments/${id}`);
      setPreview(res.data);
       const link = `${window.location.origin}/student/assignment/${res.data.access_token}`;
      await navigator.clipboard.writeText(link);
      setAssignmentLink(link)
    } catch {
      toast.error("Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };



   const [copiedId, setCopiedId] = useState(null);


  const copyAssignmentLink = async (assignment) => {
  const link = `${window.location.origin}/student/assignment/${assignment.access_token}`;
  
  await navigator.clipboard.writeText(link);

  setCopiedId(assignment.id);

  toast.success("Link copied");

  // reset after 2 seconds
  setTimeout(() => {
    setCopiedId(null);
  }, 2000);
};



   const deleteAssignment = async (id) => {
  setDeleteLoading(id);
  try {
    await api.delete(`/api/teacher/assignments/${id}`);
    toast.success("Assignment deleted");

    // remove from UI immediately (no refetch needed)
    setAssignments(prev => prev.filter(a => a.id !== id));

    setDeleteId(null);
  } catch {
    toast.error("Delete failed");
  } finally {
    setDeleteLoading(null);
  }
};

  

   
  useEffect(() => {
    fetchAssignments();
  }, []);


 const toggleBlock = async (assignment) => {
  setBlockLoadingId(assignment.id);

  try {
    await api.post(
      assignment.is_blocked
        ? `/api/assignments/${assignment.id}/unblock`
        : `/api/assignments/${assignment.id}/block`
    );

    toast.success(
      assignment.is_blocked ? "Assignment unblocked" : "Assignment blocked"
    );

    fetchAssignments(); // refresh list
  } catch (e) {
    toast.error("Action failed");
  } finally {
    setBlockLoadingId(null);
  }
};

  


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );


    
  const content = (
     <div className="overflow-x-auto max-h-[70vh] no-scrollbar border rounded-lg shadow-md w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-white bg-white">
                 {assignments.length === 0 && (
        <p className="text-gray-500 p-4 text-center whitespace-nowrap">No assignment available</p>
      )}

                <thead className="bg-blue-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      Course Title
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                    Created Date
                    </th>
                      <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      Expire Date
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                      Rescheduled Date
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium whitespace-nowrap uppercase tracking-wider">Copy Link</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">Preview</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Remove</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">{a.title}</td>
                      <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">
                  <p className="text-[9px] text-center font-semibold text-white bg-green-800 py-1 px-2 whitespace-nowrap rounded">
                  {new Date(a.created_at).toLocaleString()}
                  </p>
                </td>

            <td>
              <p className="text-[9px] text-center text-white font-semibold bg-red-800 py-1 px-2 whitespace-nowrap rounded">
                {new Date(a.due_at).toLocaleString()}
              </p>
            
            </td>
            <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">
            {a.is_rescheduled ? (
              <span className="text-[9px] bg-orange-100 font-semibold text-orange-700 px-2 py-1 whitespace-nowrap rounded">
                Rescheduled
              </span>
            ): "----------"}

          </td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                         <button 
                          onClick={() => copyAssignmentLink(a)}
                          className="px-3 py-2 bg-green-600 whitespace-nowrap font-semibold text-sm text-white rounded"
                          >
                            
                            {copiedId === a.id ? "Copied" :  "Copy Link"}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                       <button
                        onClick={() => openPreview(a.id)}
                        className="px-3 py-2 font-semibold text-sm bg-blue-600 text-white rounded"
                      >
                        Preview
                      </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                    onClick={() => toggleBlock(a)}
                    disabled={blockLoadingId === a.id}
                    className={`px-4 py-2 rounded text-white flex items-center gap-2 ${
                      a.is_blocked ? "bg-green-600" : "bg-red-600"
                    } ${blockLoadingId === a.id ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {blockLoadingId === a.id ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                          />
                        </svg>
                        
                      </>
                    ) : (
                      a.is_blocked ? "Unblock" : "Block"
                    )}
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
        Assignments ({assignments.length})
      </h2>

     
      {content}
      

      {/* Copy Modal */}
      {showCopyModal && (
        <CopyLinkModal link={assignmentLink} onClose={() => setShowCopyModal(false)} />
      )}
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

            <h3 className="text-xl font-bold mb-2">{preview.title}</h3>
            <h3 className="text-sm font-bold mb-2">Expired Date: {new Date(preview.due_at).toLocaleString()}</h3>
            <p className="text-sm mb-4 text-gray-500">
              Duration: {preview.duration_minutes} minutes
            </p>

            {/* SCROLLABLE QUESTIONS */}
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
  {preview.questions.map((q, i) => (
    <div key={q.id} className="border-b pb-3">
      <p className="font-semibold">
        {i + 1}. {q.question}
      </p>

      {["a","b","c","d"].map(opt => (
        <p
          key={opt}
          className={
            q.correct_answer === opt.toUpperCase()
              ? "text-green-600 font-semibold"
              : "text-gray-700"
          }
        >
          {opt.toUpperCase()}. {q[`option_${opt}`]}
        </p>
      ))}
    </div>
  ))}
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
