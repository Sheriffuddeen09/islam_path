import { useState } from "react";
import toast, {Toaster} from "react-hot-toast";

export default function CopyLinkModal({ link, onClose }) {

  const [copied, setCopied] = useState(false);


 const copy = async () => {
  try {
    await navigator.clipboard.writeText(link);
    setCopied(true);

    // Reset after 5 seconds
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  } catch (err) {
    toast.error("Failed to copy link");
  }
};


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Toaster  position='top-right'/>
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-bold mb-2">
          Assignment Published 🎉
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Copy the link below and share it with your students.
          Only students with this link can access the assignment.
        </p>

        <div className="bg-gray-100 p-2 rounded text-sm break-all mb-3">
          {link}
        </div>
        <div className="text-center text-black p-2 rounded text-sm mb-3">
          note after the assignment is due students will no longer be able to access it.
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={copy} 
          disabled={copied}
          className="btn-primary">
            {copied ? "Copied" :  "Copy Link"}
          </button>

          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
