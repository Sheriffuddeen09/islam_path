import { useEffect, useState } from "react";
import { fetchExamResult } from "./ExamResults";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExamResultPDF from "./ExamResultPdf";

export default function ExamFetchPdf({ result }) {


      return (
        <div>

            <PDFDownloadLink
            className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
            document={<ExamResultPDF result={result} />}
            fileName="Exam-result.pdf"
            >
            Download Result
            </PDFDownloadLink>  
            
        </div>
      )

}