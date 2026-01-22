import { useEffect, useState } from "react";
import { fetchAssignmentResult } from "./AssignmentResults";
import AssignmentResultPDF from "./AssignmentResultPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

export default function AssignmentFetchPdf({  result }) {




      return (
        <div>

            <PDFDownloadLink
            document={<AssignmentResultPDF result={result} />}
            fileName="assignment-result.pdf"
            className="px-3 py-2 text-sm bg-blue-600 text-white text-sm rounded"
            >
            
              Download Result
                
            </PDFDownloadLink>  
            
        </div>
      )

}