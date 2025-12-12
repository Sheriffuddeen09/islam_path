import React, { useEffect, useState } from "react";

export default function RouteLoader() {
  const [letters, setLetters] = useState([]); // store accumulated letters

  useEffect(() => {
    let step = 0;
    const allLetters = ["I", "P", "K"];

    const interval = setInterval(() => {
      if (step < allLetters.length) {
        setLetters(prev => [...prev, allLetters[step]]);
        step++;
      } else {
        clearInterval(interval); // stop after IPK is complete
      }
    }, 1000); // show next letter every 1 sec

    // Remove loader after 1 minute
    const timeout = setTimeout(() => {
      setLetters([]); // or hide component some other way
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      {/* Loader spinner */}
      <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

      {/* Animated IPK */}
      <h1 className="text-4xl font-bold mt-4 text-black">
        {letters.join("")}
      </h1>
    </div>
  );
}
