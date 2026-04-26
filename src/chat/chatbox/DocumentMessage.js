import { BookOpen } from "lucide-react";

export default function DocumentMessage({ msg }) {

  const files = msg.files?.length
    ? msg.files
    : [{
        file_name: msg.file_name,
        file: msg.file,
        file_url: msg.file_url,
        type: msg.type,
      }];

  const getFileIcon = (name) => {
    const ext = name?.split(".").pop()?.toLowerCase();

    switch (ext) {
      case "pdf": return "📕";
      case "doc":
      case "docx": return "📘";
      case "xls":
      case "xlsx": return "📊";
      case "zip":
      case "rar": return "🗜️";
      case "ppt":
      case "pptx": return "📽️";
      case "txt": return "📄";
      
    }
  };

  return (
    <>
      {files.map((file, index) => {

        const fileName =
          file.file_name ||
          file.file?.split("/").pop() ||
          "Document";

        const filePath =
          file.file ||
          file.file_url ||
          null;

        const fileUrl = filePath
          ? filePath.startsWith("http")
            ? filePath
            : `http://localhost:8000/storage/${filePath}`
          : null;

        const openFile = () => {
          if (!fileUrl) return;
          window.open(fileUrl, "_blank");
        };

        return (
          <div
            key={index}
            onClick={openFile}
            className="bg-gray-100 p-3 rounded-xl w-56 cursor-pointer hover:bg-gray-200 transition my-1"
          >
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 flex items-center justify-center text-xl">
                <BookOpen className="w-6 h-6 text-gray-900" />
              </div>

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
      })}
    </>
  );
}