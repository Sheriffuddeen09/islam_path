import { useEffect, useRef, useState } from "react";
import api from "../../Api/axios";

export default function useAutoScroll(
  messages,
  lastReadMessageId = null,
  messageRefs,
  setUnreadCount,
  chatId
) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const isAtBottomRef = useRef(false); // ✅ IMPORTANT
  const prevLengthRef = useRef(0);

  const initialScrollDone = useRef(false);
  const userScrollingRef = useRef(false);

  const markReadTimeout = useRef(null);

  const [initialized, setInitialized] = useState(false);

  // ================= SCROLL HANDLER =================
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 80;
    const position = el.scrollHeight - el.scrollTop - el.clientHeight;

    const isAtBottom = position < threshold;

    isAtBottomRef.current = isAtBottom;

    // ✅ detect user scrolling (prevents snap-back)
    userScrollingRef.current = true;

    if (isAtBottom) {
      setUnreadCount(0);

      if (markReadTimeout.current) {
        clearTimeout(markReadTimeout.current);
      }

      markReadTimeout.current = setTimeout(async () => {
        try {
          await api.post(`/api/chats/${chatId}/read`);
        } catch (e) {
          console.log("mark read failed");
        }
      }, 500);
    }
  };

  // ================= CLEANUP =================
  useEffect(() => {
    return () => {
      if (markReadTimeout.current) {
        clearTimeout(markReadTimeout.current);
      }
    };
  }, []);

  // ================= INITIAL SCROLL (UNREAD) =================
  
    
   useEffect(() => {
  if (!messages.length || initialScrollDone.current) {
    console.log("⛔ skip scroll:", {
      hasMessages: !!messages.length,
      alreadyDone: initialScrollDone.current
    });
    return;
  }

  let attempts = 0;

  const scrollToUnread = () => {
    const lastId = lastReadMessageId || 0;

    console.log("📦 messages:", messages.map(m => m.id));
    console.log("📍 lastReadMessageId:", lastReadMessageId);

    // ✅ find FIRST unread
    const target = messages.find(m => m.id > lastId) || messages[0];

    console.log("🎯 target message:", target);

    const el = messageRefs.current?.[target?.id];

    console.log("🔎 element found?", !!el, "for id:", target?.id);

    if (el) {
      console.log("✅ SCROLLING to:", target.id);

      el.scrollIntoView({
        behavior: "auto",
        block: "start",
      });

      el.classList.add("bg-yellow-100");

      setTimeout(() => {
        el.classList.remove("bg-yellow-100");
      }, 1500);

      initialScrollDone.current = true;
      setInitialized(true);

      isAtBottomRef.current = false;

      return;
    }

    // retry
    if (attempts < 20) {
      attempts++;
      console.log(`🔁 retry ${attempts}...`);
      requestAnimationFrame(scrollToUnread);
    } else {
      console.log("❌ FAILED: element never found");
    }
  };

  requestAnimationFrame(scrollToUnread);
}, [messages, lastReadMessageId]);

  // ================= LIVE AUTO SCROLL =================
  useEffect(() => {
    if (!initialized) return;

    const prev = prevLengthRef.current;
    const next = messages.length;

    if (prev === next) return;

    // ❌ IMPORTANT: do NOT auto-scroll if user is scrolling
    if (!isAtBottomRef.current) {
      prevLengthRef.current = next;
      return;
    }

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    prevLengthRef.current = next;
  }, [messages, initialized]);

  return {
    bottomRef,
    containerRef,
    handleScroll,
  };
}