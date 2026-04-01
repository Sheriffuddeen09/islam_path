import { CheckCircle, Delete } from "lucide-react";
import React, { useEffect } from "react";

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!message) return null;

  return (
    <div className={`fixed inline-flex items-center gap-2 top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          <Delete /> {message}
        </div>
  );
}
