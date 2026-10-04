import React, { useEffect, useState } from "react";

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }

        return Math.min(prev + 2, 95);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)]  px-4">
      <div className="w-60">

        <div className="flex items-center mb-3 justify-center">
            <span
              className="text-4xl font-bold"
              style={{
                fontFamily: "'Great Vibes', cursive",
              }}
            >
              Al-Islam
            </span>
          </div>

        <div className="relative h-2 w-full overflow-hidden rounded-sm bg-blue-100">
          <div
            className="h-full bg-blue-700 transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>
    </div>
  );
}