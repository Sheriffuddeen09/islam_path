import { useState } from "react";
import { Clipboard } from "lucide-react"; // icon for copy

export default function PostCommentCopyText({ comment }) {

  const [copied, setCopied] = useState(false);

  const BASE_URL = "http://localhost:8000"; // or your real domain

const handleCopy = async () => {
  try {
    let textToCopy = "";

    if (comment.image) {
      textToCopy = comment.image.startsWith("http")
        ? comment.image
        : `${BASE_URL}/storage/${comment.image}`; // adjust path if needed
    } else {
      textToCopy = comment.body || "";
    }

    await navigator.clipboard.writeText(textToCopy);

    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

  return (
    <div>
      <button
        onClick={handleCopy}
        className="text-gray-700 whitespace-nowrap text-sm hover:text-gray-900 inline-flex items-center gap-2 p-1"
      >
        <Clipboard className="w-4 h-4" />
        {comment.image ? "Copy Image Link" : "Copy Text"}
      </button>

      {copied && (
        <div className="fixed inset-x-0 bottom-10 mx-auto bg-green-500 text-white p-2 rounded-lg w-40 text-center z-50">
          Copied!
        </div>
      )}
    </div>
  );
}
