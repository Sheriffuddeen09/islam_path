import { useEffect, useState } from "react";

export default function VoiceWave({ active }) {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const newBars = Array.from({ length: 50 }, () =>
        Math.floor(Math.random() * 20) + 5
      );
      setBars(newBars);
    }, 150);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex items-end gap-[2px] h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: h }}
          className="w-[2px] bg-red-500 rounded"
        />
      ))}
    </div>
  );
}