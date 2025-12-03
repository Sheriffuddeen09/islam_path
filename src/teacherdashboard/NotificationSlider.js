import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotificationSlider({ notifications }) {
  const navigate = useNavigate();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="overflow-hidden w-full bg-gray-100 rounded-lg p-2 mb-4">
      <div
        className="flex animate-marquee whitespace-nowrap"
        style={{ gap: "1rem" }}
      >
        {notifications.map((n, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 bg-red-100 rounded"
          >
            <p className="text-sm font-medium text-red-700">{n.message}</p>
            {n.action_url && (
              <button
                onClick={() => navigate(n.action_url)}
                className="px-2 py-1 bg-red-700 text-white rounded text-xs hover:bg-red-800 transition"
              >
                Select Choice
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tailwind CSS animation */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            display: inline-flex;
            animation: marquee 15s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
