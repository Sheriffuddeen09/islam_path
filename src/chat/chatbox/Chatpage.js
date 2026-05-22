import  { useRef, useState, useMemo, useEffect } from "react";
import { UserSkeleton } from "./UserSkeleton";
import { useAuth } from "../../layout/AuthProvider";
import api from "../../Api/axios";
import ChatComponent from "./ChatComponent";
import { decryptMessage } from "../../utils/encryption";


export default function ChatPage({
  chats,
  setChats,
  activeChat,
  setActiveChat
}) {
  const { user: authUser } = useAuth();



  const [chatFilter, setChatFilter] = useState("all");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const chatId = activeChat?.id;
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  //latestMessage
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [messagesMap, setMessagesMap] = useState({});

  const messages = Array.isArray(messagesMap[activeChat?.id])
    ? messagesMap[activeChat?.id]
    : [];


  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
const fetchChats = async () => {

  if (!authUser) return;

  try {

    setLoadingChats(true);

    const res = await api.get("/api/chats");

    const normalized = await Promise.all(

      res.data.map(async (chat) => {

        let latestMessage =
          chat.latest_message || null;

        // ✅ decrypt latest message
        if (
          latestMessage?.message &&
          latestMessage?.iv
        ) {

          try {

            // get chat key
            const chatKey =
              localStorage.getItem(
                `chat_key_${chat.id}`
              );

            if (chatKey) {

              // decrypt
              const decrypted =
                await decryptMessage(
                  latestMessage.message,
                  latestMessage.iv,
                  chatKey
                );

              latestMessage = {
                ...latestMessage,
                message: decrypted,
              };
            }

          } catch (err) {

            console.error(
              "Decrypt latest message failed",
              err
            );

            latestMessage = {
              ...latestMessage,
              message: "Encrypted message",
            };
          }
        }

        return {
          ...chat,

          unread_count: Number(
            chat.unread_count || 0
          ),

          latest_message: latestMessage,

          block_info: chat.block_info
            ? {
                ...chat.block_info,

                blocked_by_me:
                  chat.block_info.blocker_id ===
                  authUser.id,

                blocked_me:
                  chat.block_info.blocked_id ===
                  authUser.id,
              }
            : null,
        };
      })
    );

    setChats(normalized);

  } catch (err) {

    console.error(err);

  } finally {

    setLoadingChats(false);
  }
};

useEffect(() => {

  if (!authUser) return;

  fetchChats();

}, [authUser]);


  const [isLargeScreen, setIsLargeScreen] = useState(
    window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



const decryptMessages = async (incoming, chatId) => {
  try {
    const chatKey = localStorage.getItem(`chat_key_${chatId}`);

    if (!chatKey) return incoming;

    return await Promise.all(
      incoming.map(async (msg) => {

        try {
          const decrypted = await decryptMessage(
            msg.message,
            msg.iv,
            chatKey
          );

          return {
            ...msg,
            message: decrypted,
          };

        } catch (err) {
          console.log("Decrypt failed:", err);
          return msg;
        }
      })
    );

  } catch (err) {
    console.log(err);
    return incoming;
  }
};

const messagesCacheRef = useRef({});
const restoredChatRef = useRef(false);
const loadingChatRef = useRef(null);
const openedChatsRef = useRef({});

const scrollToMessage = (
  messages,
  lastReadId,
  forceBottom = false
) => {

  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      const container =
        messagesEndRef.current
          ?.parentElement;

      if (!container) return;

      // ✅ ALWAYS GO BOTTOM
      if (forceBottom) {

        container.scrollTop =
          container.scrollHeight;

        return;
      }

      const unreadMessages =
        messages.filter(
          msg =>
            Number(msg.id) >
            Number(lastReadId || 0)
        );

      const firstUnread =
        unreadMessages[0];

      // ✅ FIRST TIME ONLY
      if (firstUnread) {

        const target =
          messageRefs.current[
            firstUnread.id
          ];

        if (target) {

          target.scrollIntoView({
            behavior: "auto",
            block: "center",
          });

          return;
        }
      }

      // ✅ FALLBACK
      container.scrollTop =
        container.scrollHeight;
    });

  });

};

const openChat = async (chat) => {

  if (loadingChatRef.current && loadingChatRef.current !== chat.id) {
        loadingChatRef.current = null;
      }

  if (
    activeChat?.id === chat.id ||
    loadingChatRef.current === chat.id
  ) {
    return;
  }
  if (chat.block_info?.blocked_me) {
    showToast(
      "You have been blocked in this chat",
      "error"
    );
    return;
  }

  const alreadyOpened =
  openedChatsRef.current[chat.id];

  const cached =
    messagesCacheRef.current[
      chat.id
    ];

  if (cached?.length > 0) {

    setLoadingMessages(false);
    setActiveChat(chat);

    openedChatsRef.current[chat.id] = true;

    if (!isLargeScreen) {
      setShowList(false);
    }
    localStorage.setItem(
      "lastChatId",
      String(chat.id)
    );
    setChats(prev =>
      prev.map(c =>
        c.id === chat.id
          ? {
              ...c,
              unread_count: 0,
            }
          : c
      )
    );
    setMessages(cached);
    setLastReadMessageId(
      chat.last_read_message_id ||
      null
    );
    setUnreadCount(
      chat.unread_count || 0
    );
    requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToMessage(
        cached,
        chat.last_read_message_id,
        alreadyOpened // force bottom if reopened
      );
    });
  });
    api.post(
      `/api/chats/${chat.id}/read`
    ).catch(() => {});
    return;
  }
  loadingChatRef.current =
    chat.id;
  setLoadingMessages(true);
  setMessages([]);
  setActiveChat(chat);
  if (!isLargeScreen) {
    setShowList(false);
  }
  localStorage.setItem(
    "lastChatId",
    String(chat.id)
  );
  setChats(prev =>
    prev.map(c =>
      c.id === chat.id
        ? {
            ...c,
            unread_count: 0,
          }
        : c
    )
  );
  try {
    const res = await api.get(
      `/api/chats/${chat.id}/messages`
    );

    if (res.data.chat_key) {
      localStorage.setItem(
        `chat_key_${chat.id}`,
        res.data.chat_key
      );
    }
    const msgs = (
      res.data.messages || []
    ).sort(
      (a, b) => a.id - b.id
    );

    const decrypted =
      await decryptMessages(
        msgs,
        chat.id
      );

    messagesCacheRef.current[
      chat.id
    ] = decrypted;

    setMessagesMap(prev => ({
      ...prev,
      [chat.id]: decrypted,
    }));

    setMessages(decrypted);
    setLastReadMessageId(
      res.data.last_read_message_id
    );
    setUnreadCount(
      res.data.unread_count || 0
    );

    openedChatsRef.current[chat.id] = true;

    scrollToMessage(
        decrypted,
        res.data.last_read_message_id,
        alreadyOpened
      );

      setTimeout(() => {

        api.post(
          `/api/chats/${chat.id}/read`
        ).catch(() => {});

      }, 500);

  } catch (err) {
    showToast(
      "Failed to load messages"
    );

  } finally {
    loadingChatRef.current =
      null;
    setLoadingMessages(false);
  }

  
};

useEffect(() => {
  if (!isLargeScreen) return;

  if (restoredChatRef.current) {
    return;
  }
  if (!chats.length) {
    return;
  }
  const lastChatId =
    localStorage.getItem(
      "lastChatId"
    );

  if (!lastChatId) {
    return;
  }
  const lastChat = chats.find(
    c =>
      String(c.id) ===
      String(lastChatId)
  );
  if (!lastChat) {
    localStorage.removeItem(
      "lastChatId"
    );
    return;
  }
  restoredChatRef.current = true;
  openChat(lastChat);

}, [chats, isLargeScreen]);

useEffect(() => {
  if (!messages.length) return;

  // 🔥 CASE 1: There are unread messages
  if (unreadCount > 0 && lastReadMessageId) {
    const firstUnread = messages.find(
      (m) => m.id > lastReadMessageId
    );

    if (firstUnread) {
      const el = messageRefs.current[firstUnread.id];
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  }

  // 🔥 CASE 2: No unread → go to bottom
  const lastMsg = messages[messages.length - 1];
  const el = messageRefs.current[lastMsg.id];
  el?.scrollIntoView({ behavior: "smooth" });

}, [messages, unreadCount, lastReadMessageId]);

  const unreadTotal = useMemo(
    () => chats.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [chats]
  );

  const setMessages = (chatId, updater) => {
  setMessagesMap(prev => {
    const current = prev[chatId] || [];

    const updated =
      typeof updater === "function"
        ? updater(current)
        : updater;

    return {
      ...prev,
      [chatId]: updated,
    };
  });
};


  if (loadingChats) return <UserSkeleton />;

  return (
    <ChatComponent
      messageRefs={messageRefs}
      replyingTo={replyingTo}
      setReplyingTo={setReplyingTo}
      chats={chats}
      setChats={setChats}
      activeChat={activeChat}
      setActiveChat={setActiveChat}
      setChatFilter={setChatFilter}
      chatFilter={chatFilter}
      loadingChat={loadingChats}
      loadingMessages={loadingMessages}
      unreadTotal={unreadTotal}
      authUser={authUser}
      isTyping={isTyping}
      setIsTyping={setIsTyping}
      chatId={chatId}
      setShowProfile={setShowProfile}
      showProfile={showProfile}
      setShowList={setShowList}
      showList={showList}
      bottomRef={messagesEndRef}
      setToast={setToast}
      openChat={openChat}
      messages={messages}
      setMessages={(updater) => setMessages(activeChat?.id, updater)}
      unreadCount={unreadCount} setUnreadCount={setUnreadCount}
      lastReadMessageId={lastReadMessageId}
      setLastReadMessageId={setLastReadMessageId}
    />
  );
}