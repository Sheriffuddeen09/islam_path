import { useEffect, useRef, useState } from "react";

export default function useAutoScroll(messages) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevLengthRef = useRef(0);

  // 🔥 NEW: unread counter
  const [newMessageCount, setNewMessageCount] = useState(0);

  // detect scroll position
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 80;
    const position = el.scrollHeight - el.scrollTop - el.clientHeight;

    const atBottom = position < threshold;

    isAtBottomRef.current = atBottom;

    // 🔥 RESET when user returns to bottom
    if (atBottom) {
      setNewMessageCount(0);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prevLength = prevLengthRef.current;
    const newLength = messages.length;

    if (newLength === prevLength) return;

    const addedCount = newLength - prevLength;

    // =========================
    // ✅ USER AT BOTTOM → normal scroll
    // =========================
    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "auto",
          block: "end",
        });
      });

      setNewMessageCount(0);
    } 
    // =========================
    // ❗ USER NOT AT BOTTOM → show indicator + scroll to first new
    // =========================
    else if (addedCount > 0) {
      setNewMessageCount((prev) => prev + addedCount);

      requestAnimationFrame(() => {
        const firstNewIndex = newLength - addedCount;
        const firstNewNode = el.children[firstNewIndex];

        if (firstNewNode) {
          firstNewNode.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    }

    prevLengthRef.current = newLength;
  }, [messages]);

  return {
    bottomRef,
    containerRef,
    handleScroll,

    // 🔥 expose for UI
    newMessageCount,
    setNewMessageCount,
  };
}