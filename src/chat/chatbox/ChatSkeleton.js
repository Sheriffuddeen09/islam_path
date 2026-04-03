import React from "react";

export function ChatSkeleton({ type = "list" }) {
  // 🔹 CHAT LIST SKELETON
  if (type === "list") {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex gap-3 items-center">

            <div className="w-12 h-12 bg-gray-300 rounded-full" />

            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-300 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>

            <div className="h-2 w-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // 🔹 MESSAGE BOX SKELETON
  if (type === "messages") {
    return (
      <div className="flex flex-col p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`flex ${
              i % 2 === 0 ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg p-3 max-w-xs ${
                i % 2 === 0 ? "bg-gray-300" : "bg-gray-200"
              }`}
            >
              <div className="h-3 bg-gray-400 rounded w-40 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 🔹 ACTIVE USER / CHAT INFO SKELETON
  if (type === "info") {
  return (
    <div className="h-full bg-white animate-pulse">

      {/* HEADER */}
      <div className="p-4 border-b flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-300 rounded" />
        <div className="h-4 w-32 bg-gray-300 rounded" />
      </div>

      {/* PROFILE */}
      <div className="flex flex-col items-center p-5 border-b">

        <div className="w-24 h-24 bg-gray-300 rounded-full mb-3" />

        <div className="h-4 w-32 bg-gray-300 rounded mb-2" />

        <div className="h-3 w-40 bg-gray-200 rounded" />

      </div>

      {/* ACTION BUTTONS */}
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="h-10 bg-gray-200 rounded-lg"
          />
        ))}
      </div>

    </div>
  );
}

  return null;
}