import React, { useEffect } from "react";

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 w-80  text-center text-sm font-bold transform -translate-x-1/2 px-4 py-2 rounded shadow-lg text-white z-[9999]
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
      `}
    >
      {message}
    </div>
  );
}
