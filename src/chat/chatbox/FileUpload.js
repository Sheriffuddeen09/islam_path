import { useRef, useState } from "react";

export default function FileUpload (){

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef();

    const handleFileChange = (e) => {
  const selected = e.target.files?.[0];
  if (!selected) return;

  setFile(selected);
  setPreviewUrl(URL.createObjectURL(selected));
  setShowPreview(true);
};

return(

    <div>
        <label className="cursor-pointer">
        <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />

        📎
        </label>

        {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-white p-4 rounded-lg max-w-sm w-full">

      {/* PREVIEW */}
      <div className="mb-3">

        {/* IMAGE */}
        {file?.type.startsWith("image/") && (
          <img src={previewUrl} className="w-full rounded" />
        )}

        {/* VIDEO */}
        {file?.type.startsWith("video/") && (
          <video src={previewUrl} controls className="w-full rounded" />
        )}

        {/* AUDIO */}
        {file?.type.startsWith("audio/") && (
          <audio src={previewUrl} controls className="w-full" />
        )}

        {/* FILE */}
        {!file?.type.startsWith("image/") &&
         !file?.type.startsWith("video/") &&
         !file?.type.startsWith("audio/") && (
          <div className="text-center">
            📄 {file?.name}
          </div>
        )}

      </div>

      {/* ACTIONS */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            setFile(null);
            setPreviewUrl(null);
            setShowPreview(false);
          }}
          className="text-red-500"
        >
          Cancel
        </button>

        <button
          onClick={sendFile}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  </div>
)}
    </div>
)
}