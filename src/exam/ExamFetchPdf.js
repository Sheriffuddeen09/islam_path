import { useEffect, useState } from "react";
import { fetchExamResult } from "./ExamResults";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExamResultPDF from "./ExamResultPdf";

export default function ExamFetchPdf({ resultId }) {


    const [result, setResult] = useState(null);
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        const loadResult = async () => {
          try {
            const data = await fetchExamResult(resultId);
            setResult(data);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
    
        loadResult();
      }, [resultId]);
    
      if (loading) return <p className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded">Loading result...</p>;
      if (!result) return <p className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded">No Result</p>;


      return (
        <div>

            <PDFDownloadLink
            className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
            document={<ExamResultPDF result={result} />}
            fileName="Exam-result.pdf"
            >
            {
                loading ? (
                <svg
                className="animate-spin h-5 w-5 text-white text-sm"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                ) :
                "Download Result"
                } 
            </PDFDownloadLink>  
            
        </div>
      )

}