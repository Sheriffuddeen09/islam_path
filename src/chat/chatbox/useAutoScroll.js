import { useEffect, useRef, useState } from "react";

export default function useAutoScroll(messages, lastReadMessageId = null, messageRefs = {}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const prevLengthRef = useRef(0);

  const [initialized, setInitialized] = useState(false);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 80;
    const position = el.scrollHeight - el.scrollTop - el.clientHeight;

    isAtBottomRef.current = position < threshold;
  };

  // ✅ OPEN CHAT → SCROLL TO FIRST UNREAD
  useEffect(() => {
    if (!messages.length || initialized) return;

    const targetIndex = lastReadMessageId
      ? messages.findIndex(m => m.id === lastReadMessageId) + 1
      : 0;

    const target = messages[targetIndex];

    requestAnimationFrame(() => {
      const el = messageRefs[target?.id];

      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      } else {
        bottomRef.current?.scrollIntoView({
          behavior: "auto",
        });
      }

      setInitialized(true);
    });
  }, [messages, lastReadMessageId]);

  // ✅ LIVE SCROLL
  useEffect(() => {
    const prev = prevLengthRef.current;
    const next = messages.length;

    if (prev === next) return;

    if (isAtBottomRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      });
    }

    prevLengthRef.current = next;
  }, [messages]);

  return {
    bottomRef,
    containerRef,
    handleScroll,
  };
}