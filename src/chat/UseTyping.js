import { initEcho } from "../echo";
import { useEffect, useState } from "react";
import { useAuth } from "../layout/AuthProvider";

export function useTyping(chatId) {
  const { user } = useAuth();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    // 🚨 wait until BOTH chatId and user exist
    if (!chatId || !user?.id) return;

    const echo = initEcho();
    const channel = echo.private(`chat.${chatId}`);

    channel.listen("TypingEvent", (e) => {
      if (e.userId !== user.id) {
        setTyping(true);
        const timeout = setTimeout(() => setTyping(false), 1500);

        return () => clearTimeout(timeout);
      }
    });

    return () => {
      echo.leave(`chat.${chatId}`); // ✅ correct channel name
    };
  }, [chatId, user?.id]);

  return typing;
}
