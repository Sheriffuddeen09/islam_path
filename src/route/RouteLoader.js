import React, { useEffect, useState } from "react";

export default function RouteLoader() {
  const [step, setStep] = useState(0); // 0 → I, 1 → P, 2 → K

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(prev => (prev + 1) % 3);
    }, 3500); // change letter every 0.5 sec

    return () => clearInterval(interval);
  }, []);

  const letters = ["I", "P", "K"];

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      {/* Loader */}
      <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

      {/* Animated IPK */}
      <h1 className="text-4xl font-bold mt-4 text-black">{letters[step]}</h1>
    </div>
  );
}
