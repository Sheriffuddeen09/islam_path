import { useEffect, useState } from "react";
import { fetchAssignmentResult } from "./AssignmentResults";
import AssignmentResultPDF from "./AssignmentResultPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function AssignmentFetchPdf({ loadingResult, result }) {




      return (
        <div>

            <PDFDownloadLink
            document={<AssignmentResultPDF result={result} />}
            fileName="assignment-result.pdf"
            className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
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