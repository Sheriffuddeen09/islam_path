import { useEffect, useRef } from "react";
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
  const isAtBottomRef = useRef(false);

  // ================= RESET ON CHAT CHANGE =================
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTop = 0; // 🔥 FORCE START FROM TOP
    initializedRef.current = false;
    justInitializedRef.current = false;
    isAtBottomRef.current = false;

  }, [chatId]);

  // ================= SCROLL HANDLER =================
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 100;
    const position = el.scrollHeight - el.scrollTop - el.clientHeight;

    isAtBottomRef.current = position < threshold;

    if (isAtBottomRef.current) {
      setUnreadCount(0);

      api.post(`/api/chats/${chatId}/read`).catch(() => {});
    }
  };

  // ================= WAIT UNTIL DOM READY =================
  const isDomReady = () => {
    return Object.keys(messageRefs.current || {}).length >= messages.length;
  };

  // ================= INITIAL SCROLL =================
  useEffect(() => {
    if (initializedRef.current || messages.length === 0) return;

    const lastId = lastReadMessageId || 0;
    const target = messages.find((m) => m.id > lastId);


    if (!target) {
      initializedRef.current = true;
      return;
    }

    const tryScroll = (attempt = 1) => {
      if (!isDomReady()) {
        return setTimeout(() => tryScroll(attempt), 50);
      }

      const el = messageRefs.current?.[target.id];


      if (el) {
        el.scrollIntoView({
          behavior: "auto",
          block: "start",
        });


        initializedRef.current = true;
        justInitializedRef.current = true; // 🔥 block next auto-scroll
        isAtBottomRef.current = false;

        return;
      }

      if (attempt < 10) {
        setTimeout(() => tryScroll(attempt + 1), 100);
      }
    };

    tryScroll();
  }, [messages, lastReadMessageId]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    if (!initializedRef.current) return;

    // 🔥 BLOCK FIRST RUN (THIS WAS YOUR BUG)
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