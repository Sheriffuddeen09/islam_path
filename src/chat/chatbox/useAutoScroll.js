import { useRef, useEffect } from "react";
import api from "../../Api/axios";

export default function useAutoScroll(
  messages,
  lastReadMessageId,
  messageRefs,
  setUnreadCount,
  chatId
) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const initializedRef = useRef(false);
  const justInitializedRef = useRef(false);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    initializedRef.current = false;
    justInitializedRef.current = false;
    isAtBottomRef.current = true;
  }, [chatId]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 100;
    const position =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    isAtBottomRef.current = position < threshold;
    if (isAtBottomRef.current) {
      setUnreadCount(0);
      api.post(`/api/chats/${chatId}/read`).catch(() => {});
    }
  };
  const isDomReady = () => {
    return (
      Object.keys(messageRefs.current || {}).length >=
      messages.length
    );
  };

  useEffect(() => {
    if (initializedRef.current || messages.length === 0) return;

    const lastId = lastReadMessageId ?? 0;
    const firstUnread = messages.find((m) => m.id > lastId);
    const tryScroll = (attempt = 1) => {
      if (!isDomReady()) {
        return setTimeout(() => tryScroll(attempt), 50);
      }
      if (firstUnread) {
        const el = messageRefs.current?.[firstUnread.id];
        if (el) {
          el.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
          initializedRef.current = true;
          justInitializedRef.current = true;
          isAtBottomRef.current = false;
          return;
        }
      }

      bottomRef.current?.scrollIntoView({
        behavior: "auto",
      });
      initializedRef.current = true;
      isAtBottomRef.current = true;
    };

    tryScroll();
  }, [messages, lastReadMessageId]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (justInitializedRef.current) {
      justInitializedRef.current = false;
      return;
    }
    if (!isAtBottomRef.current) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return {
    containerRef,
    bottomRef,
    handleScroll,
  };
}