import { useEffect, useState } from "react";

export default function useAssignmentTimer(durationSeconds) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    // Stop when timer reaches zero
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return { timeLeft, setTimeLeft };
}