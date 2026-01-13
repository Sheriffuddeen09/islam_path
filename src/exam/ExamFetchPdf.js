import { useEffect, useState } from "react";
import { fetchExamResult } from "./ExamResults";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExamResultPDF from "./ExamResultPdf";

export default function ExamFetchPdf({ result, loadingResult }) {


      return (
        <div>

            <PDFDownloadLink
            className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
            document={<ExamResultPDF result={result} />}
            fileName="Exam-result.pdf"
            >
            {
                loadingResult ? (
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