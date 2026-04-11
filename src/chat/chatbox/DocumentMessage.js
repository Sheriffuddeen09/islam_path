import { BookOpen } from "lucide-react";

export default function DocumentMessage({ msg }) {

  // =========================
  // 📄 GET FILE NAME (SAFE)
  // =========================
  const getFileName = () => {
    if (msg.file_name) return msg.file_name;

    const path = msg.files?.[0]?.file || msg.file || msg.file_url || "";
    if (!path) return "Document";

    return path.split("/").pop(); // fallback name
  };

  const fileName = getFileName();

  // =========================
  // 📎 GET FILE ICON (SAFE)
  // =========================
  const getFileIcon = (name) => {
    if (!name || typeof name !== "string") return "📎";

    const ext = name.split(".").pop()?.toLowerCase();

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

  // =========================
  // 🔗 GET FILE PATH (SAFE)
  // =========================
  const filePath =
    msg.files?.[0]?.file ||
    msg.file ||
    msg.file_url ||
    null;

  const fileUrl = filePath
    ? `http://localhost:8000/storage/${filePath}`
    : null;

  // =========================
  // 🚀 OPEN FILE
  // =========================
  const openFile = () => {
    if (!fileUrl) {
      console.warn("No file URL available");
      return;
    }

    window.open(fileUrl, "_blank");
  };

  // =========================
  // 🎨 UI
  // =========================
  return (
    <div
      onClick={openFile}
      className="bg-gray-100 p-3 rounded-xl w-56 cursor-pointer hover:bg-gray-200 transition"
    >
      <div className="flex items-center gap-3">

        {/* ICON */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl">
            <BookOpen className="w-6 h-6 text-gray-900" />
        </div>

        {/* TEXT */}
        <div className="flex flex-col min-w-0">

          <div className="flex items-center gap-1 font-bold">
          {getFileIcon(fileName)}


            <p className="text-sm font-bold capitalize text-gray-900 truncate max-w-[150px]">
              {fileName}
            </p>
          </div>

          <p className="text-xs text-gray-900 mt-1 font-semibold">
            Tap to open
          </p>

        </div>

      </div>
    </div>
  );
}