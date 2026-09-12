import React, { useEffect, useRef } from "react";
import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  Presentation,
  BookOpen,
  Download,
  ExternalLink,
} from "lucide-react";

export default function DocumentMessage({
  msg,
  uiMode,
  toggleSelect,
}) {
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimer.current);
    };
  }, []);

  const files = msg.files?.length
    ? msg.files
    : [
        {
          file_name: msg.file_name,
          file: msg.file,
          file_url: msg.file_url,
          type: msg.type,
        },
      ];

  const getFileInfo = (name = "") => {
    const ext =
      name.split(".").pop()?.toLowerCase() || "";

    switch (ext) {
      case "pdf":
        return {
          icon: FileText,
          label: "PDF Document",
          badge: "PDF",
          iconClass: "text-red-500",
          badgeClass:
            "bg-red-50 text-red-600 border-red-100",
        };

      case "doc":
      case "docx":
        return {
          icon: BookOpen,
          label: "Word Document",
          badge: "DOC",
          iconClass: "text-blue-500",
          badgeClass:
            "bg-blue-50 text-blue-600 border-blue-100",
        };

      case "xls":
      case "xlsx":
        return {
          icon: FileSpreadsheet,
          label: "Excel Spreadsheet",
          badge: "XLS",
          iconClass: "text-green-600",
          badgeClass:
            "bg-green-50 text-green-600 border-green-100",
        };

      case "ppt":
      case "pptx":
        return {
          icon: Presentation,
          label: "PowerPoint",
          badge: "PPT",
          iconClass: "text-orange-500",
          badgeClass:
            "bg-orange-50 text-orange-600 border-orange-100",
        };

      case "zip":
      case "rar":
      case "7z":
        return {
          icon: FileArchive,
          label: "Archive",
          badge: "ZIP",
          iconClass: "text-purple-500",
          badgeClass:
            "bg-purple-50 text-purple-600 border-purple-100",
        };

      case "txt":
        return {
          icon: FileText,
          label: "Text Document",
          badge: "TXT",
          iconClass: "text-gray-500",
          badgeClass:
            "bg-gray-100 text-gray-600 border-gray-200",
        };

      default:
        return {
          icon: FileText,
          label: "Document",
          badge: ext
            ? ext.toUpperCase().slice(0, 4)
            : "FILE",
          iconClass: "text-gray-500",
          badgeClass:
            "bg-gray-100 text-gray-600 border-gray-200",
        };
    }
  };

  const formatFileName = (name = "") => {
    if (!name) {
      return "Document";
    }

    const lastDot = name.lastIndexOf(".");

    if (lastDot === -1) {
      return name;
    }

    return name.substring(0, lastDot);
  };

  /*
   * LONG PRESS
   */
  const handlePointerDown = (e) => {
    e.stopPropagation();

    longPressTriggered.current = false;

    clearTimeout(longPressTimer.current);

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;

      if (toggleSelect && msg) {
        toggleSelect(msg);
      }
    }, 500);
  };

  /*
   * MOVEMENT CANCELS LONG PRESS
   */
  const handlePointerMove = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
  };

  /*
   * RELEASE
   */
  const handlePointerUp = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
  };

  /*
   * CANCEL
   */
  const handlePointerCancel = (e) => {
    e.stopPropagation();

    clearTimeout(longPressTimer.current);
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

        const fileInfo =
          getFileInfo(fileName);

        const Icon = fileInfo.icon;

        const openFile = (e) => {
          e.stopPropagation();

          /*
           * If the user long-pressed,
           * don't open the document.
           */
          if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
          }

          if (!fileUrl) return;

          window.open(
            fileUrl,
            "_blank",
            "noopener,noreferrer"
          );
        };

        return (
          <div
            key={index}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onClick={openFile}
            className={`
              group
              relative
              my-0.5
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
              cursor-pointer
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:shadow-md
              hover:border-gray-300
              active:scale-[0.98]
              select-none
              touch-manipulation
              ${
                uiMode === "full"
                  ? "w-64"
                  : "w-56 lg:w-56 md:w-96"
              }
            `}
          >
            {/* TOP ACCENT */}
            <div className="h-1 md:h-2 lg:h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600" />

            <div className="flex items-center gap-3 p-1.5 lg:p-1.5 md:p-3">

              {/* FILE ICON */}
              <div
                className={`
                  relative
                  w-8 md:w-12 md:w-12
                  h-8
                  shrink-0
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  border
                  ${fileInfo.badgeClass}
                `}
              >
                <Icon
                  className={`
                    w-4 md:w-6 md:h-6
                    h-4
                    ${fileInfo.iconClass}
                  `}
                  strokeWidth={1.8}
                />

                {/* EXTENSION BADGE */}
                <span
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    px-1
                    py-[1px]
                    rounded-md
                    bg-white
                    border
                    border-gray-200
                    shadow-sm
                    text-[5px] md:text-[8px]
                    font-extrabold
                    text-gray-600
                    uppercase
                  "
                >
                  {fileInfo.badge}
                </span>
              </div>

              {/* FILE INFORMATION */}
              <div className="flex-1 min-w-0">

                <p
                  className="
                    text-[9px] lg:text-[9px] font-bold md:text-[14px]
                    text-gray-900
                    truncate
                    leading-5
                  "
                  title={fileName}
                >
                  {formatFileName(fileName)}
                </p>

                <div className="flex items-center gap-1.5 mt-1">

                  <span
                    className="
                      text-[7px] lg:text-[8px] md:text-[10px]
                      font-semibold
                      text-gray-500
                      truncate
                    "
                  >
                    {fileInfo.label}
                  </span>

                  <span
                    className="
                      w-1 md:w-2 md:h-2
                      h-1
                      rounded-full
                      bg-gray-300
                      shrink-0
                    "
                  />

                  <span
                    className="
                      text-[7px] lg:text-[8px] md:text-[10px]
                      font-semibold
                      text-green-600
                      whitespace-nowrap
                    "
                  >
                    Tap to open
                  </span>
                </div>
              </div>

              {/* OPEN ICON */}
              <div
                className="
                  w-6 md:w-8 md:h-8 lg:w-6 lg:h-6
                  h-6
                  shrink-0
                  rounded-full
                  bg-gray-50
                  border
                  border-gray-200
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-200
                  group-hover:bg-green-50
                  group-hover:border-green-200
                  group-hover:scale-105
                "
              >
                <ExternalLink
                  className="
                    w-3
                    h-3
                    text-gray-700
                    group-hover:text-green-600
                    transition-colors
                  "
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* BOTTOM OPEN AREA */}
            <div
              className="
                flex
                items-center
                justify-between
                px-1.5
                py-1 lg:py-1 lg:py-1 md:py-2 md:px-4
                bg-gray-50/80
                border-t
                border-gray-100
              "
            >
              <span
                className="
                  text-[7px] lg:text-[7px] md:text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                Attachment
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-1
                  text-[7px] text-[7px] md:text-[10px]
                  font-bold
                  text-green-600
                  opacity-80
                  group-hover:opacity-100
                "
              >
                <span>Open</span>

                <Download
                  className="w-3 h-3"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}