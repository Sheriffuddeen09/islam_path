import { BookOpen, Check, Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DocumentMessage({ msg }) {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const getFileIcon = (fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "pdf":
      return "📕";
    case "doc":
    case "docx":
      return "📘";
    case "xls":
    case "xlsx":
      return "📊";
    case "zip":
    case "rar":
      return "🗜️";
    case "ppt":
    case "pptx":
      return "📽️";
    case "txt":
      return "📄";
    default:
      return "📎";
  }
};

  const fileUrl = `http://localhost:8000/api/download-file?file=${msg.file || msg.file_url}`;

  const downloadFile = async () => {
  try {
    setDownloading(true);
    setProgress(0);

    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const contentLength = response.headers.get("Content-Length");

    // ⚠️ fallback if server doesn't send content-length
    const total = contentLength ? parseInt(contentLength, 10) : null;

    const reader = response.body.getReader();
    const chunks = [];

    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      receivedLength += value.length;

      if (total) {
        const percent = Math.round((receivedLength / total) * 100);
        setProgress(percent);
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = msg.file_name || "file";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(downloadUrl);

    setProgress(100);
    setDone(true);
  } catch (error) {
    console.error("Download failed:", error);
  } finally {
    setDownloading(false);
  }
};

  return (
  <div className="bg-gray-100 p-3 rounded-xl max-w-xs shadow-sm">

    <div
      onClick={!downloading ? downloadFile : undefined}
      className="flex items-center gap-3 cursor-pointer"
    >

      {/* PROGRESS ICON AREA (UNCHANGED ICON LOGIC) */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 rotate-[-90deg]">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#22c55e"
            strokeWidth="4"
            fill="none"
            strokeDasharray={125}
            strokeDashoffset={125 - (125 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-200"
          />
        </svg>

        {/* YOUR ORIGINAL ICON LOGIC KEPT */}
        <div className="absolute inset-0 flex items-center justify-center">
          {downloading ? (
            <Loader2 className="w-5 animate-spin text-gray-900" />
          ) : done ? (
            <Check className="w-5 text-gray-900" />
          ) : (
            <Download className="w-5 text-gray-900" />
          )}
        </div>
      </div>

      {/* TEXT AREA (FIXED SO IT NEVER DISAPPEARS) */}
      <div className="flex flex-col min-w-0">

        {/* FILE NAME (ALWAYS STABLE) */}
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4 text-gray-700" />

          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
            {msg.file_name?.split(" ").slice(0, 3).join(" ")}
            {msg.file_name?.split(" ").length > 3 ? "..." : ""}
          </p>
        </div>

        {/* STATUS TEXT */}
        <p className="text-xs text-gray-500">
          {downloading
            ? `${progress}% downloading...`
            : done
            ? "Download completed"
            : "Tap to download"}
        </p>

      </div>
    </div>
  </div>
);
}