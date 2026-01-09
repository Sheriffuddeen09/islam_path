import { PDFDownloadLink } from "@react-pdf/renderer";
import AssignmentResultPDF from "./AssignmentResultPDF";
import { useState } from "react";
import api from "../Api/axios";

export default function ArrayPdf({preview}) {

        const [pdfs, setPdfs] = useState([]);
        const [loadingPdf, setLoadingPdf] = useState(false)
        
        const fetchResults = async () => {
              setLoadingPdf(true)
            try {
              const res = await api.get("/api/assignment-pdf");
              setPdfs(res.data); // ✅ FIXED
            } catch (err) {
              setPdfs([]);
          
            } finally{
              setLoadingPdf(false)
            }
          };

        

    return (
        <div>
            {/* <PDFDownloadLink
                document={<AssignmentResultPDF />}
                fileName="assignment-result.pdf"
                >
                     {
                    loadingPdf ? (
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
                
                </PDFDownloadLink> */}
        </div>
    )
    
}

