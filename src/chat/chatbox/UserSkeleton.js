import React from "react";

export function UserSkeleton({ type = "list" }) {
  // 🔹 CHAT LIST SKELETON
  if (type === "list") {
    return (
      <div className="sm:py-3 px-6 py-3 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex flex-wrap gap-3 items-center mt-10">

            <div className="w-12 h-12 bg-gray-300 rounded-full" />

            <div className="flex-1 space-y-2">
              <div className="h-8 bg-gray-300 rounded w-full" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-80 bg-gray-200 rounded" />
              <div className="h-4 w-60 bg-gray-200 rounded" />
              <div className="h-2 w-40 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-full bg-gray-200 rounded" />
              <div className="h-4 w-60 bg-gray-200 rounded" />
              <div className="h-2 w-20 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}