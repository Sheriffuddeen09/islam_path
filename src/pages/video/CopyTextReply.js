import { useState } from "react";
import { Clipboard } from "lucide-react"; // icon for copy

export default function ReplyWithCopy({ reply }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // reset after 1.5s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="">
  
        <div>
         
              <button
                onClick={() => handleCopy(reply.body)}
                className="text-gray-500 hover:text-gray-900"
              >
                <Clipboard className="w-4 h-4" />
              </button>
          
        </div>

      {/* Copy confirmation */}
       {copied && (
        <div  className=" flex fixed inset-0 translate-y-3 flex bg-green-500 text-white p-2 rounded-lg w-44 h-10 items-center mx-auto justify-center z-50">Copied to clipboard!</div>
      )}
    </div>
  );
}
