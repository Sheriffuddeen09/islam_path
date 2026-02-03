import { useState } from "react";
import { Clipboard } from "lucide-react"; // icon for copy

export default function PostCommentCopyText({ comment }) {
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
    <div>
      <div className="">
        <div>
        </div>
        <button
          onClick={() => handleCopy(comment.body)}
          className="text-gray-500 whitespace-nowrap hover:text-gray-900 inline-flex items-center gap-2 p-1"
        >
          <Clipboard className="w-4 h-4" />
          Copy Text
        </button>
      </div>

      {/* Copy confirmation */}
      {copied && (
        <div  className=" flex fixed inset-0 whitespace-nowrap translate-y-3 flex bg-green-500 text-white p-2 rounded-lg w-40 h-10 items-center mx-auto justify-center z-50">Copied to clipboard!</div>
      )}
       
  </div>

  );
}
